import { env } from '$env/dynamic/public'
import { _fetchCoverage, _fetchMutations } from './+page.js';
export async function load({ params }) {
    const pr = await fetch(`${env.PUBLIC_ENDPOINT}/pr/${params.number}`)
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