import cookie from 'cookie';

export async function handle({ event, resolve }) {
	const session = cookie.parse(event.request.headers.get('cookie') || '');
	console.log(session);
	event.locals.session = session;

	return await resolve(event);
}
