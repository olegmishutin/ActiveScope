export function checkResponse(response, statusSetter, successfulStatus, successfulFunc) {
    if (response.status === 200 || response.status === 201) {
        statusSetter(successfulStatus)

        if (successfulFunc) {
            successfulFunc()
        }
    } else {
        if (response.status >= 500) {
            statusSetter('Проблемы с сервером!')
        } else if (response.status === 401) {
            window.localStorage.clear()
            window.location.href = '/login/'
        } else {
            const messages = Object.entries(response.data)
            let errorMessage = `${messages[0][0]}: ${messages[0][1]}`
            statusSetter(errorMessage)
        }
    }
}