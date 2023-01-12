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
    const directoryPath = `${currentPath}/SIO`
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

const acceptCookies = async (page) => {
    const acceptCookies = await page.waitForSelector("#didomi-notice-agree-button")
    acceptCookies.click({ delay: 500 })
}

const getEventIds = async (hostUrl) => {
    const eventCalendarApiUrl = `${hostUrl}api/event-calendar/events`

    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(eventCalendarApiUrl);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    //I would leave this here as a fail safe
    await page.content();

    const innerText = await page.evaluate(() => {
        return JSON.parse(document.querySelector("body").innerText);
    });

    console.log("innerText now contains the JSON");
    console.log(innerText);

    const eventIds = await innerText?.items?.map(event => event.id)

    console.log(eventIds);

    await browser.close();

    return eventIds
}

const logErrorsWhileRunning = (pageUrl, message) => {
    switch (message.type()) {
        case ("error"):
            console.log(`${message.type().toUpperCase()} on ${pageUrl} \n ${message.text()}`)
    }
}

export const harvest = async (hostUrl) => {
    const eventIds = await getEventIds(hostUrl)

    const timestamp = getTimestamp()
    console.log("Harvester fired at: ", timestamp)

    try {
        if (!eventIds) return
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const eventCalendarPageUrl = `${hostUrl}eventkalender`

        const errorData = []

        for await (const eventID of eventIds) {
            const pageUrl = eventCalendarPageUrl + "/" + eventID

            await page.goto(pageUrl);

            page
                .on('console', (message) => {
                    logErrorsWhileRunning(pageUrl, message)
                    errorData.push({ pageUrl, message })
                })

        }

        writeToFile(`console-errors_${fileNameFromTimestamp(timestamp)}`, errorData)

        console.log("Harvester finished running. ")
        await page.close();

    } catch (error) {
        console.log(`Error harvesting`, error)
    }
}



