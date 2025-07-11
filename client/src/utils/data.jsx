import {DOCKERIZED} from "../../other_conf.js";


export function getWsConnection(uri) {
    return new WebSocket(`/ws${uri}`)
}

export function getImage(url) {
    if (DOCKERIZED()) {
        return url.replace('http://server:8080', '')
    } else {
        return url.replace('http://localhost:8080', '')
    }
}

export function getDataByIDs(ids, isFormData, includeEmpty) {
    const data = isFormData ? new FormData() : {}

    ids.forEach((id) => {
        let element = id instanceof Array ? document.getElementById(id[0]) : document.getElementById(id)

        if (element) {
            if (isFormData) {
                if (element.type === 'file' && element.files.length) {
                    if (element.multiple) {
                        for (let i = 0; i < element.files.length; i++) {
                            data.append(id instanceof Array ? id[1] : id, element.files[i])
                        }
                    } else {
                        data.append(id instanceof Array ? id[1] : id, element.files[0])
                    }
                    element.value = ''
                } else if (element.type === 'checkbox') {
                    data.append(id instanceof Array ? id[1] : id, element.checked)
                } else {
                    if (element.value || (!element.value && includeEmpty)) {
                        data.append(id instanceof Array ? id[1] : id, element.value)
                    }
                }
            } else {
                if (element.type === 'checkbox') {
                    data[id instanceof Array ? id[1] : id] = element.checked
                } else if (element.value || (!element.value && includeEmpty)) {
                    data[id instanceof Array ? id[1] : id] = element.value
                }
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
        } else if (filter.id.includes('dropdown_')) {
            const filter_dict = {}

            filter.childNodes.forEach((child) => {
                child.childNodes.forEach((sub_child) => {
                    if (sub_child.type === 'checkbox') {
                        const splited_id = sub_child.id.split('_')

                        if (typeof filter_dict[splited_id[1]] === 'undefined') {
                            filter_dict[splited_id[1]] = []
                        }

                        if (sub_child.checked) {
                            filter_dict[splited_id[1]].push(splited_id[2])
                        }
                    }
                })
            })
            for (const [key, value] of Object.entries(filter_dict)) {
                urlParams += `&${key}=${value}`
            }
        }
    })
    urlParams += `&ordering=${ordering.join()}`
    return url + urlParams
}