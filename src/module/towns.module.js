const { init } = require("./browser.module")

const { get_image_buffer, sleep } = require("../utils/utils");
const { TOWNS_POST_TEXTAREA, TOWNS_POST_MEDIA_INPUT, TOWNS_SEND_POST_BUTTON } = require("../config/towns.selector.config");
const { TOWNS_ACCOUNT_URL } = require("../../app.config")

async function post_to_towns(post) {
    try {
        const context = await init("Hey");

        const page = await context.newPage();

        await page.bringToFront();

        await page.goto(TOWNS_ACCOUNT_URL)

        await page.waitForSelector(TOWNS_POST_TEXTAREA)
        await page.fill(TOWNS_POST_TEXTAREA, post.content)

        console.log("after text fill")

        if (post.images) await add_images_to_post(page, post.images)

        await page.waitForSelector(TOWNS_SEND_POST_BUTTON)
        await page.click(TOWNS_SEND_POST_BUTTON)
        await sleep(2000)
        console.log("loaded")

        await sleep(35000)

        console.log("Towns posted")

        await page.close()
        await context.close()

    } catch (error) {
        console.log(error)
    }
}

async function add_images_to_post(page, images) {
    try {
        console.log("Images")
        await reveal_hidden_input(page)
        // await page.locator('#\\:r12\\:').waitFor({ state: 'visible' });
        await page.waitForSelector(TOWNS_POST_MEDIA_INPUT)

        console.log("revealed ")
        const input = await page.$(TOWNS_POST_MEDIA_INPUT)

        for (let image of images) {
            const image_buffer = await get_image_buffer(image.url)

            await upload_file(input, image_buffer)
        }

    } catch (error) {
        console.log(error)
    }
}

async function upload_file(input, image_buffer) {
    try {
        await input.setInputFiles({
            name: 'image.png',
            mimeType: 'image/png',
            buffer: Buffer.from(image_buffer, 'base64')
        });
    } catch (error) {
        console.log(error)
    }
}

async function reveal_hidden_input(page) {
    try {
        await page.evaluate(() => {
            // const input = document.querySelector(`input[multiple][type="file"][name="file-input"][id="\\:r12\\:"][accept="*"][style="display: none;"]`);
            const input = document.querySelector(`input[name="file-input"]`);
            if (input) {
                input.style.display = 'block';
            }
        });
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    post_to_towns
}