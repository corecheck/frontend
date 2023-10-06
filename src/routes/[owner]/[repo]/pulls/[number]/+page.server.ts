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

export async function _fetchSonarCloudIssues(fetch, number) {
    // https://sonarcloud.io/api/issues/search?metricKeys=sqale_index&projects=aureleoules_bitcoin&types=CODE_SMELL&branch=26415
    return fetch(`https://sonarcloud.io/api/issues/search?metricKeys=sqale_index&projects=aureleoules_bitcoin&types=CODE_SMELL&branch=${number}`)
        .then(async res => {
            if (res.status === 200) {
                const data = await res.json();

                // https://sonarcloud.io/api/sources/issue_snippets?issueKey=AYsFGxvQ890w8U3JDlEV
                // fetch for each issue the source code, with Promise.all

                const promises = data.issues.map(issue => {
                    return fetch(`https://sonarcloud.io/api/sources/issue_snippets?issueKey=${issue.key}`)
                        .then(res => res.json())
                        .then(res => {
                            const key = Object.keys(res)[0];
                            return {
                                ...issue,
                                sources: res[key].sources
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });

                return {
                    ...data,
                    issues: await Promise.all(promises)
                }
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
        sonarcloud: await _fetchSonarCloudIssues(fetch, params.number)
    };
}