import { harvest } from "./harvest.js"

const testUrl = "https://sio-t-app-newsiono.azurewebsites.net/"
const prodUrl = "https://ny.sio.no/"

try {
    await harvest(prodUrl)
    process.exit(0)
} catch (error) {
    console.error(error)
    process.exit(1)
}





