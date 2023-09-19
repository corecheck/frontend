import { env } from '$env/dynamic/public'
import { redirect } from "@sveltejs/kit";

export const ssr = false;

export async function load({ url, fetch }) {
    const code = url.searchParams.get('code') || '';

    const response = await fetch(`${env.ENDPOINT}/authenticate?code=${code}`, {
        method: 'POST',
        credentials: 'include',
    });

    if (response.status === 200) {
        throw redirect(302, '/');
    }
}