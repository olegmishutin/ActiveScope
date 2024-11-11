export function getDataByIDs(ids, isFormData, includeEmpty) {
    const data = isFormData ? new FormData() : {}

    ids.forEach((id) => {
        let element = id instanceof Array ? document.getElementById(id[0]) : document.getElementById(id)

        if (isFormData) {
            if (element.type === 'file' && element.files.length) {
                data.append(id instanceof Array ? id[1] : id, element.files[0])
                element.value = ''
            } else if (element.type === 'checkbox') {
                data.append(id instanceof Array ? id[1] : id, element.checked)
            } else {
                if (element.value || (!element.value && includeEmpty)) {
                    data.append(id instanceof Array ? id[1] : id, element.value)
                }
            }
        } else {
            if (element.value || (!element.value && includeEmpty)) {
                data[id instanceof Array ? id[1] : id] = element.value
            }
        }
        const errorElement = document.getElementById(`${id instanceof Array ? id[0] : id}_error`)

        if (errorElement) {
            errorElement.textContent = ''
        }
    })

    return data
}

export function getFilters(url, filtersIds) {
    let urlParams = '?'
    const ordering = []

    filtersIds.forEach((id) => {
        const filter = document.getElementById(id)

        if (filter.value) {
            if (id.includes('ordering_')) {
                const field = id.replace('ordering_', '')
                ordering.push(filter.checked ? field : `-${field}`)
            } else {
                urlParams += `&${id}=${filter.value}`
            }
        }
    })
    urlParams += `&ordering=${ordering.join()}`
    return url + urlParams
}