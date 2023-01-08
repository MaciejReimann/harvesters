import Fastify from 'fastify'

import realEstates from "./real-estates/routes.js"

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */

const fastify = Fastify({
    logger: true
})

fastify.register(realEstates)

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()