import { redirect, type Actions } from "@sveltejs/kit";
import { env } from '$env/dynamic/public'

export async function load({fetch}) {
    console.log('load')
    const data = await fetch(`${env.ENDPOINT}/me`, { 
        withCredentials: true,
        credentials: "include",
    }).then((response) => {
        if (response.status === 200) {
            return response.json();
        }
    });

    return {
        user: data,
    }
}
