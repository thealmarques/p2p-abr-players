export function timeoutPromise(amount: number) {
    return new Promise(resolve => setTimeout(resolve, amount))
}
