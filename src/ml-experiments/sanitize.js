import sassariHomes from "../../output/2023-01-12T20-05-07.163Z.json"

import { writeToFile } from "../_shared/write-to-file.js"

const items = sassariHomes

const mapped =
    items.map(item => ({
        price: item.features.find(feature => feature.label === 'prezzo')?.value,
        area: item.features.find(feature => feature.label === 'superficie')?.value,
        id: item.features.find(feature => feature.label === 'riferimento e Data annuncio')?.value
    }))

console.log("mapped", mapped.length)

const filtered = mapped.filter(item => item.price !== undefined).filter(item => item.area !== undefined)

console.log("filtered", filtered.length)

writeToFile("pricePerArea-Sassari.json", filtered)

// console.log(filtered)


