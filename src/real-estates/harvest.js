import puppeteer from 'puppeteer';


import { writeToFile } from "../_shared/write-to-file.js"

const entryUrl = 'https://www.immobiliare.it/search-list/?fkRegione=sar&idProvincia=SS&idNazione=IT&idContratto=1&idCategoria=1&idTipologia%5B0%5D=7&idTipologia%5B1%5D=11&idTipologia%5B2%5D=12&tipoProprieta=1&giardino%5B0%5D=10&criterio=prezzo&ordine=asc&__lang=it'

let lastPage
const Counter = () => {
    let value = 1

    return {
        getValue: () => value,
        increment: () => {
            value++
            console.log("value incremented", value)
        }
    }
}

const pageCounter = Counter()

const getTimestamp = () => {
    // const date = new Date().toISOString()
    // const time = new Date().toLocaleTimeString()
    // const timestamp = date + " " + time

    return new Date().toISOString()
}

const fileNameFromTimestamp = (timestamp) => {
    const fileName = timestamp.replaceAll("/", "-").replaceAll(":", "-").replaceAll(" ", "_")
    console.log("fileName", fileName)
    return `${fileName}.json`
}

const getAnnouncementFeatures = async (page, link) => {
    await page.goto(link);
    await page.waitForSelector(".im-features__list")

    const announcementFeatures = await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('.im-features__title'), el => el.textContent)
        const values = Array.from(document.querySelectorAll('.im-features__value'), el => el.textContent.trim());

        if (Array.isArray(labels) && Array.isArray(values)) {
            if (labels.length === values.length) {
                return labels.map((label, index) => ({ label, value: values[index] }))
            }
        }
    });

    return announcementFeatures
}



const acceptCookies = async (page) => {
    const acceptCookies = await page.waitForSelector("#didomi-notice-agree-button")
    acceptCookies.click({ delay: 500 })
}


export const harvest = async () => {
    const timestamp = getTimestamp()
    console.log("Harvester fired at: ", timestamp)

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(`${entryUrl}&pag=1`);

        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // await acceptCookies(page)

        const paginationContent = await page.evaluate(() => Array.from(document.querySelectorAll('.in-pagination__item--disabled'), element => element.textContent));
        const lastPageNumber = paginationContent.filter(text => !isNaN(parseInt(text)))

        if (lastPageNumber.length > 1) {
            throw new Error("Harvester error: ", "lastPageNumber should have one element")
        } else {
            lastPage = lastPageNumber[0]
            console.log("Harvester: last page number set to ", lastPage)
        }


        console.log("Harvester: page counter on ", pageCounter.getValue())

        while (pageCounter.getValue() <= lastPage) {
            page.goto(`${entryUrl}&pag=${pageCounter.getValue()}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            await page.waitForSelector('.in-card__title')

            const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('.in-card__title'), element => element.href));
            const links = [...hrefs.filter(Boolean)]

            console.log("Harvester: harvested links ", links)

            for (const link of links) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                const page = await browser.newPage();

                const announcementFeatures = await getAnnouncementFeatures(page, link)
                const data = {
                    link,
                    features: announcementFeatures
                }

                const linkCount = links.indexOf(link)
                const pageCounterValue = pageCounter.getValue()
                const pagesLeft = lastPage - pageCounterValue
                console.log(`Harvester: harvested ${linkCount} on ${pageCounterValue}, ${pagesLeft} pages left`)

                writeToFile(fileNameFromTimestamp(timestamp), data)

                await page.close();
            }

            pageCounter.increment()
        }

        await browser.close();

        return {}
    } catch (error) {
        console.log(`Error harvesting`, error)
    }
}



