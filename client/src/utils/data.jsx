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