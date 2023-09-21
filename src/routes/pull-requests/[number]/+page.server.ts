import { env } from '$env/dynamic/public'
export async function _fetchCoverage(fetch, number: number) {
    return fetch(`${env.PUBLIC_ENDPOINT}/pr/${number}/coverage?full=true`)
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


export async function _fetchMutations(fetch, number: number) {
    return fetch(`${env.PUBLIC_ENDPOINT}/pr/${number}/mutations`, {
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


export async function load({ params, fetch }) {
    const pr = await fetch(`${env.PUBLIC_ENDPOINT}/pr/${params.number}`)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
        });

    const mutations = await _fetchMutations(fetch, params.number);
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
        coverage: await _fetchCoverage(fetch, params.number, false),
        mutations: mutations || [],
        votes: votes,
    };
}