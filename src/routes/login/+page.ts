import { env } from '$env/dynamic/public'
import { redirect } from "@sveltejs/kit";

const CLIENT_ID = "e263477168ef0a17a11a";

export function load() {
	throw redirect(307, `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${env.PUBLIC_REDIRECT_URL}`);
}