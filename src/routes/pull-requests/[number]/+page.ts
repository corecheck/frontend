import { env } from '$env/dynamic/public'

export async function _fetchCoverage(number: number, full: boolean) {
    return fetch(`${env.PUBLIC_ENDPOINT}/pr/${number}/coverage?full=${full ? "true" : "false"}`)
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

