export async function _fetchCoverage(number: number, full: boolean) {
    return fetch(`http://localhost:1323/pr/${number}/coverage?full=${full ? "true" : "false"}`)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
        });
}

export async function _fetchMutations(number: number) {
    return fetch(`http://localhost:1323/pr/${number}/mutations`, {
        method: "GET",
        credentials: "include",
        withCredentials: true,
    })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
        });
}

export async function load({ params }) {
    const pr = await fetch("http://localhost:1323/pr/" + params.number)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
        });

    const mutations = await _fetchMutations(params.number);
    let votes: Record<string, string> = {}; 
    if (mutations) {
        for (const mutation of mutations) {
            if (mutation.vote) {
                votes[mutation.id] = mutation.vote;
            }
        }
    }

    return {
        pr,
        coverage: await _fetchCoverage(params.number, false),
        mutations: mutations || [],
        votes: votes,
    };
}