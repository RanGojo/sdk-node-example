import { MetaResponse, QuoteResponse, RoutingResultType, SwapResponse, Token, TransactionType } from "rango-sdk-basic"

export function logMeta(meta: MetaResponse) {
    const { tokens, blockchains } = meta
    console.log(`- fetched ${tokens.length} tokens and ${blockchains.length} blockchains`)
}

export function logSelectedTokens(sourceToken: Token, targetToken: Token) {
    console.log(`- user selects to swap ${sourceToken.blockchain}.${sourceToken.symbol} to ${targetToken.blockchain}.${targetToken.symbol}`)
}

export function logQuote(quote: QuoteResponse) {
    const route = quote.route
    if (route && quote.resultType === RoutingResultType.OK) {
        console.log(`- found a quote via ${route.swapper.title}`)
        console.log(`   - result type: ${quote.resultType}`)
        console.log(`   - output: ${route.outputAmount} ${route.to.symbol} equals to $${route.outputAmountUsd}`)
        console.log(`   - fee: $${route.feeUsd}`)
        console.log(`   - estimated time: ${route.estimatedTimeInSeconds}s`)
    } else {
        console.log(`There was no route! ${quote.error} ${quote.resultType}`)
    }
}

export function logWallet(walletWithProvider) {
    console.log(`- connected to walelt address: ${walletWithProvider.address}`)
}

export function logSwap(swap: SwapResponse) {
    const { error, tx } = swap
    if (tx) {
        console.log(`- transaction created successfully.`)
        const tx = swap.tx
        if (tx?.type === TransactionType.EVM) {
            if (tx.approveData && tx.approveTo) {
                console.log("- user doesn't have enough approval")
                console.log("- signing the approve transaction ...")
            } else {
                console.log("- user has enough approval")
                console.log("- signing the main transaction ...")
            }
        }
    } else {
        console.log(`- error creating the transaction, ${error}`)
    }
}