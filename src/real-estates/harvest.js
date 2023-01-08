import puppeteer from 'puppeteer';

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

const counter = Counter()

const announcements = []

export const harvest = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false, args: ['--start-fullscreen'] });
        const page = await browser.newPage();

        await page.goto(`${entryUrl}&page=1`);

        const acceptCookies = await page.waitForSelector("#didomi-notice-agree-button")

        acceptCookies.click({ delay: 625 })


        const paginationContent = await page.evaluate(() => Array.from(document.querySelectorAll('.in-pagination__item--disabled'), element => element.textContent));
        const lastPageNumber = paginationContent.filter(text => !isNaN(parseInt(text)))

        if (lastPageNumber.length > 1) {
            throw new Error("Harvester error: ", "lastPageNumber should have one element")
        } else {
            lastPage = lastPageNumber[0]
            console.log("Harvester: last page number set to ", lastPage)
            lastPage = 1
        }

        console.log("Harvester: counter value to ", counter.getValue())

        while (counter.getValue() <= lastPage) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            page.goto(`${entryUrl}&pag=${counter.getValue()}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            await page.waitForSelector('.in-card__title')

            const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('.in-card__title'), element => element.href));

            announcements.push(...hrefs)

            console.log("Harvester: announcements ", announcements)


            await page.screenshot({ path: `example-${counter.getValue()}.png` });

            counter.increment()
        }

        announcements.splice(2)
        announcements.forEach(async (href) => {
            const page = await browser.newPage();

            await new Promise((resolve) => setTimeout(resolve, 2000));

            await page.goto(href);

            const featuresTable = await page.waitForSelector(".im-features__list")
            const featuresTableElement = await page.evaluate(() => document.querySelector('.im-features__list'));

            console.log("featuresTableElement", featuresTableElement)

            // await browser.close();

        })
        // const inputHandler = await page.waitForSelector('input[class="nd-autocomplete__input"]', {
        //     waitUntil: "networkidle2"
        // })

        // await inputHandler.focus()

        // await page.keyboard.type('sassari pro')
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        // // await page.keyboard.press("ArrowDown")
        // // await new Promise((resolve) => setTimeout(resolve, 500));

        // await page.keyboard.press("Enter")


        // await searchButton.click()



        // await browser.close();

        return []

    } catch (error) {
        console.log(`Error harvesting`, error)
    }
}