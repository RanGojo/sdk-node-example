// run `node --import=tsx index.ts` in the terminal

import { RangoClient, TransactionStatus, TransactionType } from "rango-sdk-basic";
import { findToken } from './utils/meta.js'
import { logMeta, logSelectedTokens, logQuote, logWallet, logSwap } from "./utils/logger.js";
import { TransactionRequest, ethers } from "ethers";
import { setTimeout } from 'timers/promises'

// setup wallet & RPC provider
const privateKey = '';
const wallet = new ethers.Wallet(privateKey);
const rpcProvider = new ethers.JsonRpcProvider('https://bsc-dataseed1.defibit.io');
const walletWithProvider = wallet.connect(rpcProvider);
logWallet(walletWithProvider)

// initiate sdk using your api key
const API_KEY = "c6381a79-2817-4602-83bf-6a641a409e32"
const rango = new RangoClient(API_KEY, false)

// get blockchains and tokens meta data
const meta = await rango.meta()
logMeta(meta)

// some example tokens for test purpose
const sourceBlockchain = "BSC"
const sourceTokenAddress = null
const targetBlockchain = "AVAX_CCHAIN"
const targetTokenAddress = "0xc7198437980c041c805a1edcba50c1ce5db95118"
const amount = "10000000000000"

// find selected tokens in meta.tokens
const sourceToken = findToken(meta.tokens, sourceBlockchain, sourceTokenAddress)
const targetToken = findToken(meta.tokens, targetBlockchain, targetTokenAddress)
logSelectedTokens(sourceToken, targetToken)

// get quote
const quoteRequest = {
  from: sourceToken,
  to: targetToken,
  amount,
  slippage: 1.0 as any,
}
const quote = await rango.quote(quoteRequest)
logQuote(quote)

const swapRequest = {
  ...quoteRequest,
  fromAddress: wallet.address,
  toAddress: wallet.address,
}

const swap = await rango.swap(swapRequest)
logSwap(swap)

const tx = swap.tx
if (tx?.type === TransactionType.EVM) {
  if (tx.approveData && tx.approveTo) {
  } else {
    const transaction: TransactionRequest = {
      from: tx.from,
      to: tx.txTo,
      data: tx.txData,
      value: tx.value,
      gasLimit: tx.gasLimit,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasPrice: tx.gasPrice,
    }
    const { hash } = await walletWithProvider.sendTransaction(transaction);
    console.log(`- transaction hash ${hash}`)

    while (true) {
      const state = await rango.status({
        requestId: swap.requestId,
        txId: hash
      })
      console.log(`- transaction status: ${state.status}`)
      await setTimeout(10_000)

      if (state.status === TransactionStatus.FAILED || state.status === TransactionStatus.SUCCESS) {
        break
      }
    }
  }
}