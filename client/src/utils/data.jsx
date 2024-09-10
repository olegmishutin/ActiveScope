export function getJsonDataByIDs(ids) {
    const data = {}

    ids.forEach((id) => {
        let value = document.getElementById(id).value

        if (value) {
            data[id] = value
        }
    })

    return data
}

export function getFilters(url, filtersIds) {
    let urlParams = '?'
    let ordering = []

    filtersIds.forEach((id) => {
        const filter = document.getElementById(id)

        if (filter.value) {
            if (id.includes('ordering_')) {
                const field = id.replace('ordering_', '')
                ordering.push(filter.checked ? field : `-${field}`)
            } else {
                urlParams += `${id}=${filter.value}`
            }
        }
    })
    urlParams += `&ordering=${ordering.join()}`
    return url + urlParams
}