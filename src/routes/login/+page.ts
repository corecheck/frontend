import { redirect } from "@sveltejs/kit";

const CLIENT_ID = "e263477168ef0a17a11a";

export function load() {
	throw redirect(307, `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=http://localhost:5173/callback`);
}