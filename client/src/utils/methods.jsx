function setTokenToHeader(rquestParameters) {
    const token = window.localStorage.getItem('token')
    if (token) {
        rquestParameters['headers'] = {
            'Authorization': `Bearer ${token}`
        }
    }
    return rquestParameters
}

export function POST(url, data) {
    const parameters = {
        url: url,
        method: 'POST',
        data: data,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFTOKEN',
        withCredentials: true,
    }
    return setTokenToHeader(parameters)
}

export function PUT(url, data) {
    const parameters = {
        url: url,
        method: 'PUT',
        data: data,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFTOKEN',
        withCredentials: true,
    }
    return setTokenToHeader(parameters)
}

export function DELETE(url) {
    const parameters = {
        url: url,
        method: 'DELETE',
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFTOKEN',
        withCredentials: true,
    }
    return setTokenToHeader(parameters)
}

export function GET(url) {
    const parameters = {
        url: url,
        method: 'GET'
    }
    return setTokenToHeader(parameters)
}