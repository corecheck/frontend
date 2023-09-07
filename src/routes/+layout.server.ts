import { redirect, type Actions } from "@sveltejs/kit";

export async function load({fetch}) {
    console.log('load')
    const data = await fetch("http://localhost:1323/me", { 
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
