import { harvest } from "./harvest.js"

try {
    await harvest()
    process.exit(0)
} catch (error) {
    console.error(error)
    process.exit(1)
}