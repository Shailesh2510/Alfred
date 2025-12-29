const RELAY_API_KEY_V2 = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6Il9hcGlfb3NfYWxmcmVkXzgxN2E0MCIsIm9yZGVyU291cmNlS2V5IjoiYWxmcmVkIiwiaXNBZG1pbiI6ZmFsc2UsImlzUHJvZHVjZXIiOmZhbHNlLCJpc09yZGVyU291cmNlIjp0cnVlLCJpYXQiOjE2ODE0ODUzOTl9.9NIkZlFXFX6Ev3ArEXuZIESZwZtzXV8qEOOwJbH2C5U`;
import fetch from 'node-fetch';


(async function() {
	const req = {
		headers: {
			'x-relay-auth': RELAY_API_KEY_V2,
			'Content-Type': 'application/json; charset=utf-8',
		},
		method: 'POST',
		body: JSON.stringify({
			orderKey: `BEOHQp7GEqTa9abF3UokvkCa`
		}),
	};

	const result = await fetch('https://dev-api.relay.delivery/v2/order/void', req);
	const response = await result.json();

  console.log(`response: `, response)
})();