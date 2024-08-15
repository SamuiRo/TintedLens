const { init } = require("./src/module/browser.module")

const { HEY_ACCOUNT_URL } = require("./app.config")

async function browser_init() {
    try {
        const twitter = await init("Twitter")

        await twitter.close()

        const context = await init("Hey")

        const page = await context.newPage();

        await page.goto(HEY_ACCOUNT_URL)
    } catch (error) {
        console.log(error)
    }
}

browser_init()