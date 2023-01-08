/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */

const ROUTE = "/real-estates"

export default async function routes(fastify, options) {
    fastify.get(ROUTE, async (request, reply) => {
        return { hello: 'world' }
    })
}



