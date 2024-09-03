export function POST(url, data) {
    const parameters = {
        url: url,
        method: 'POST',
        data: data,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFTOKEN',
        withCredentials: true,
    }

    const token = window.localStorage.getItem('token')
    if (token) {
        parameters['headers'] = {
            'Authorization': `Bearer ${token}`
        }
    }
    return parameters
}