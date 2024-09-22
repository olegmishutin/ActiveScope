function setTokenToHeader(rquestParameters) {
    const token = window.localStorage.getItem('token')
    if (token) {
        rquestParameters['headers'] = {
            'Authorization': `Bearer ${token}`
        }
    }
    return rquestParameters
}

function baseParameters(url, method, data) {
    const parameters = {
        url: url,
        method: method,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFTOKEN',
        withCredentials: true,
    }
    if (data) {
        parameters['data'] = data
    }
    return setTokenToHeader(parameters)
}

export function POST(url, data) {
    return baseParameters(url, 'POST', data)
}

export function PUT(url, data) {
    return baseParameters(url, 'PUT', data)
}

export function PATCH(url, data) {
    return baseParameters(url, 'PATCH', data)
}

export function DELETE(url) {
    return baseParameters(url, 'DELETE')
}

export function GET(url) {
    return baseParameters(url, 'GET')
}