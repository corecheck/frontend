export async function _fetchReport(fetch, endpoint, number, id=undefined) {
    const report = await fetch(`${endpoint}/pulls/${number}/report?id=${id || ''}`)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
        });

    return report;
}
