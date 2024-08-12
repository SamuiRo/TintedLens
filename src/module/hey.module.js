const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const { HEY_WHATS_NEW_BUTTON, HEY_MODAL_CONTAINER, HEY_MODAL_WHATS_NEW_BUTTON, HEY_MODAL_FOOTER__OPEN_UPLOAD_IMAGE_MENU, HEY_MODAL_FOOTER_FILE_INPUT, HEY_MODAL_FOOTER_UPLOAD_IMAGE_MENU } = require("../config/hey.selector.config")
const { HEADLESS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, USERAGENT, TWITTER_SOURCE_URL, TWITTER_SOURCE_TAG } = require("../../app.config")
const { HEY_ACCOUNT_URL } = require("../../app.config");
const { get_image_buffer, sleep } = require('../utils/utils');
const Post = require("../database/models/twitter_post");

async function post_to_hey(post) {
    try {
        const context = await init()

        const page = await context.newPage();

        await page.bringToFront()

        await page.goto(HEY_ACCOUNT_URL)
        await page.waitForLoadState('networkidle')

        await page.waitForSelector(HEY_WHATS_NEW_BUTTON)
        await page.click(HEY_WHATS_NEW_BUTTON)

        await page.waitForSelector(HEY_MODAL_CONTAINER)
        const modal_container = await page.$(HEY_MODAL_CONTAINER)

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
        // `div > div.block.items-center.px-5.py-3.sm\:flex > div.ml-auto.mt-2.sm\:mt-0 > button`
        await Post.update({
            hey_status: "posted",
            publishing_date: new Date()
        }, {
            where: {
                id: post.id
            }
        });

        await page.close()
        await context.close()
    } catch (error) {
        console.log(error)
    }
}

async function init() {
    try {
        const sessionFolderPath = path.join(__dirname, 'session');

        // Створюємо папку для сесії, якщо вона не існує
        if (!fs.existsSync(sessionFolderPath)) fs.mkdirSync(sessionFolderPath);


        const pathToExtension = require('path').join(__dirname, "extensions", 'MetaMask');
        console.log(pathToExtension)
        const context = await chromium.launchPersistentContext(sessionFolderPath, {
            headless: HEADLESS,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-extensions',
                '--disable-dev-shm-usage',
                `--disable - extensions - except=${pathToExtension} `,
                `--load - extension=${pathToExtension} `
            ],
            userAgent: USERAGENT,
            viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
        });

        return context
    } catch (error) {
        console.log(error)
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
            sleep(1000000)
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