const { HEY_WHATS_NEW_BUTTON, HEY_MODAL_CONTAINER, HEY_MODAL_WHATS_NEW_BUTTON, HEY_MODAL_FOOTER__OPEN_UPLOAD_IMAGE_MENU, HEY_MODAL_FOOTER_FILE_INPUT, HEY_MODAL_FOOTER_UPLOAD_IMAGE_MENU } = require("../config/hey.selector.config")
const { HEY_ACCOUNT_URL } = require("../../app.config")
const { get_image_buffer, sleep } = require('../utils/utils');
const Post = require("../database/models/twitter_post");
const { init } = require("./browser.module")
const { send_message_to_telegram } = require("./notification.module")

async function post_to_hey(post) {
    try {
        const context = await init("Hey")

        const page = await context.newPage();

        await page.bringToFront()

        await page.goto(HEY_ACCOUNT_URL)
        // await page.waitForLoadState('networkidle')

        await sleep(5000)

        await page.waitForSelector(HEY_WHATS_NEW_BUTTON)
        await page.click(HEY_WHATS_NEW_BUTTON)

        // await page.waitForSelector(HEY_MODAL_CONTAINER)
        // const modal_container = await page.$(HEY_MODAL_CONTAINER)
        const modal_container = page

        const textarea = await modal_container.$(HEY_MODAL_WHATS_NEW_BUTTON)
        await textarea.click()
        await page.fill(HEY_MODAL_WHATS_NEW_BUTTON, post.content)

        if (post.images) await add_images_to_post(page, post.images)

        await sleep(3000)
        await page.waitForSelector('.border-gray-200.border-t-gray-600.size-5.border-2.animate-spin.rounded-full', {
            state: 'detached',
            timeout: 160000 // встановлює тайм-аут у 10 секунд, змініть за потреби
        });

        const post_button = await modal_container.$(`div > div.block.items-center.px-5.py-3.sm\\:flex > div.ml-auto.mt-2.sm\\:mt-0 > button`)
        await post_button.click()

        await page.waitForLoadState('networkidle')
        await sleep(10000)
        
        let details = {
            ...post.details,
            hey_posted_date: new Date(),
        }
        await Post.update({
            details,
            publishing_date: new Date()
        }, {
            where: {
                id: post.id
            }
        });

        console.log("Posted", post)
        await send_message_to_telegram("Posted: " + post.profile)

        await page.close()
        await context.close()
    } catch (error) {
        console.log(error)
        await send_message_to_telegram("Error while posting to HEY")
    }
}

async function add_images_to_post(page, images) {
    try {
        await page.waitForSelector(HEY_MODAL_FOOTER__OPEN_UPLOAD_IMAGE_MENU)
        await page.click(HEY_MODAL_FOOTER__OPEN_UPLOAD_IMAGE_MENU)

        const input_menu = await page.$(HEY_MODAL_FOOTER__OPEN_UPLOAD_IMAGE_MENU)

        await reveal_hidden_input(input_menu)

        const input = await input_menu.$(HEY_MODAL_FOOTER_FILE_INPUT)

        for (let image of images) {
            const image_buffer = await get_image_buffer(image.url)

            await upload_file(input, image_buffer)

        }
    } catch (error) {
        console.log(error)
        await send_message_to_telegram("Error: Adding image to HEY post")
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

async function reveal_hidden_input(menu) {
    try {
        await menu.evaluate(() => {
            const input = document.querySelector('input[accept="image/bmp,image/gif,image/heic,image/jpeg,image/png,image/svg+xml,image/tiff,image/webp,image/x-ms-bmp"][id][type="file"][multiple][class="hidden"]');
            if (input) {
                input.style.display = 'block';
            }
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    post_to_hey,
}