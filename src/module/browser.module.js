const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const { post_to_hey } = require("./hey.module")

const { HEADLESS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, USERAGENT, TWITTER_SOURCE_URL, TWITTER_SOURCE_TAG } = require("../../app.config")
const { TWITTER_USER_FEED, TWITTER_USER_POSTS_CONTAINER, } = require("../config/twitter.selector.config");
const Post = require('../database/models/twitter_post');
const { sleep } = require('../utils/utils');

async function init() {
    try {
        const sessionFolderPath = path.join(__dirname, 'session');

        if (!fs.existsSync(sessionFolderPath)) fs.mkdirSync(sessionFolderPath);

        const pathToExtension = require('path').join(__dirname, "extensions", 'MetaMask');
        
        const context = await chromium.launchPersistentContext(sessionFolderPath, {
            headless: HEADLESS,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-extensions',
                '--disable-dev-shm-usage',
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ],
            userAgent: USERAGENT,
            viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
        });

        return context
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    init
}