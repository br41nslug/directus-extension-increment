import { defineHook } from '@directus/extensions-sdk';

const ROUTE_MATCH = /\/items\/([^-]+)\/([^-?]+)/;

export default defineHook(({ init }: any, { services, database: knex, getSchema, logger }: any) => {
	const { ItemsService } = services;
	function getParams(url: string) {
		const result = url.match(ROUTE_MATCH)!;
		return { collection: result[1], id: result[2] };
	}
	async function incrementMiddleware(req: any, _res: any, next: Function) {
		if (req.method !== 'PATCH' || !req.body) return next();
		if (!ROUTE_MATCH.test(req.url)) return next();
		const { collection, id } = getParams(req.url);
		const serv = new ItemsService(collection, { knex, schema: await getSchema(), accountability: req.accountability });
		const incrementFields = [];
		for (const [key, value] of Object.entries(req.body)) {
			if (typeof value === "string" && value.startsWith('increment(')) {
				const _val = value.replace('increment(', '').replace(')', '').replace(',', '');
				const val = _val.includes('.') ? parseFloat(_val) : parseInt(_val);
				incrementFields.push({ field: key, inc: val });
			}
		}
		const vals = await serv.readOne(id, { fields: incrementFields.map(({ field }) => field) });
		for (const { field, inc } of incrementFields) {
			if (req.body.hasOwnProperty(field) && vals.hasOwnProperty(field)) {
				logger.debug(`incremented field ${collection}.${field} by ${inc}`);
				req.body[field] = vals[field] + inc;
			}
		}
		next();
	}
	// hook in middleware
	init('middlewares.after', ({ app }: any) => app.use(incrementMiddleware));
});
