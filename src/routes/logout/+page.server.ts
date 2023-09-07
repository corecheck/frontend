import { redirect } from "@sveltejs/kit";

export async function load({cookies}) {
    const session = cookies.get('session');
    if (session) {
        cookies.delete('session', { path: '/' });
    }

    throw redirect(302, '/');
}
