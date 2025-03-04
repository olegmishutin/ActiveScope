export function checkConfirmation(message, sendRequestFunc) {
    if (confirm(message)) {
        sendRequestFunc()
    }
}