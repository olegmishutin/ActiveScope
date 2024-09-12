export function getDateFromInput(inputDate) {
    const date = new Date(inputDate)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear())

    return `${day}.${month}.${year}`
}

export function getDateFromRequest(dateString) {
    if (dateString) {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/
        const match = dateString.match(regex)

        if (match) {
            const day = match[1]
            const month = match[2]
            const year = match[3]

            return `${year}-${month}-${day}`
        }
    }
}