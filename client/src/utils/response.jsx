export function checkResponse(response, statusSetter, successfulStatus, successfulFunc, to404, suffix) {
    if (response.status === 200 || response.status === 201 || response.status === 204) {
        if (statusSetter) {
            statusSetter(successfulStatus)
        }

        if (successfulFunc) {
            successfulFunc()
        }
    } else {
        if (response.status >= 500) {
            statusSetter('Проблемы с сервером!')
        } else if (response.status === 401) {
            window.localStorage.clear()
            window.location.href = '/login/'
        } else if (response.status === 403) {
            window.location.href = '/'
        } else if (response.status === 404 && to404) {
            window.location.href = '/404/'
        } else if (response.status === 400) {
            const messages = Object.entries(response.data)
            if (messages[0][0] === 'detail') {
                statusSetter(messages[0][1])
            } else {
                const element = document.getElementById(suffix ? `${suffix}_${messages[0][0]}_error` : `${messages[0][0]}_error`)
                element.textContent = messages[0][1]
            }
        }
    }
}