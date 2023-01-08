import puppeteer from 'puppeteer';
import fs from "fs"

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
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    const timestamp = date + " " + time

    return timestamp
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

const writeToFile = (fileName, content) => {
    console.log("Harvester: writing to file ", fileName)

    const currentPath = process.cwd();
    const directoryPath = `${currentPath}/output`
    const filePath = `${directoryPath}/${fileName}`

    fs.readFile(filePath, (error, data) => {
        if (error) {
            console.log(`Error reading file ${filePath}`);
        }

        // console.log("Harvester: writing content ", content)

        if (!data) {
            fs.mkdir(directoryPath, (error) => {
                if (error) {
                    console.log("error creating directory", directoryPath)
                }
            })

            fs.writeFile(filePath, JSON.stringify([]), (error) => {
                if (error)
                    console.log(error);
                else {
                    console.log("File written successfully\n");
                }
            });
        } else {
            const jsonArray = JSON.parse(data)
            jsonArray.push(content)

            fs.writeFile(filePath, JSON.stringify(jsonArray), (error) => {
                if (error)
                    console.log(error);
                else {
                    console.log("File written successfully\n");
                }
            });

        }
    })
}


export const harvest = async () => {
    const timestamp = getTimestamp()
    console.log("Harvester fired at: ", timestamp)

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(`${entryUrl}&page=1`);

        const acceptCookies = await page.waitForSelector("#didomi-notice-agree-button")

        acceptCookies.click({ delay: 450 })

        const paginationContent = await page.evaluate(() => Array.from(document.querySelectorAll('.in-pagination__item--disabled'), element => element.textContent));
        const lastPageNumber = paginationContent.filter(text => !isNaN(parseInt(text)))

        if (lastPageNumber.length > 1) {
            throw new Error("Harvester error: ", "lastPageNumber should have one element")
        } else {
            lastPage = lastPageNumber[0]
            console.log("Harvester: last page number set to ", lastPage)
        }

        const pageCounterValue = pageCounter.getValue()

        console.log("Harvester: page counter on ", pageCounterValue)

        while (pageCounterValue <= lastPage) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            page.goto(`${entryUrl}&pag=${pageCounterValue}`);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            await page.waitForSelector('.in-card__title')

            const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('.in-card__title'), element => element.href));
            const links = [...hrefs.filter(Boolean)]

            console.log("Harvester: harvested links ", links)

            for (const link of links) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const page = await browser.newPage();

                const announcementFeatures = await getAnnouncementFeatures(page, link)
                const data = {
                    link,
                    features: announcementFeatures
                }

                console.log(`Harvester: harvested ${links.indexOf(link)} on ${pageCounterValue} out of ${lastPage * links.length}`)
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



