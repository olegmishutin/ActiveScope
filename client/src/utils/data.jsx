export function getDataByIDs(ids, isFormData) {
    const data = isFormData ? new FormData() : {}

    ids.forEach((id) => {
        let element = document.getElementById(id)

        if (isFormData) {
            if (element.type === 'file' && element.files.length) {
                data.append(id, element.files[0])
            } else if (element.type === 'checkbox') {
                data.append(id, element.checked)
            } else {
                data.append(id, element.value)
            }
        } else {
            data[id] = element.value
        }
        const errorElement = document.getElementById(`${id}_error`)

        if (errorElement) {
            errorElement.textContent = ''
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