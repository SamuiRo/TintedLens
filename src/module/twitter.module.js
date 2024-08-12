const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const { post_to_hey } = require("./hey.module")

const { HEADLESS, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, USERAGENT, TWITTER_SOURCE_URL, TWITTER_SOURCE_TAG } = require("../../app.config")
const { TWITTER_USER_FEED, TWITTER_USER_POSTS_CONTAINER, } = require("../config/twitter.selector.config");
const Post = require('../database/models/twitter_post');
const { sleep } = require('../utils/utils');

async function launch(params) {
    try {
        const context = await init()

        const page = await context.newPage();
        await page.bringToFront()

        await page.goto(TWITTER_SOURCE_URL)
        await page.waitForLoadState('networkidle')

        const user_feed = await get_user_feed(page)

        console.log(user_feed)

        await add_new_posts(user_feed.posts, TWITTER_SOURCE_TAG)
        // await post_to_hey(page, user_feed.posts[0])

        // await page.goto("https://hey.xyz/u/starlith")
        // await page.waitForLoadState('networkidle')
        // await sleep(10000000)
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

async function add_new_posts(posts, profile_tag) {
    try {
        for (const post of posts) {
            const post_id = JSON.stringify(post)
            const [newPost, created] = await Post.findOrCreate({
                where: {
                    profile: profile_tag,
                    content: post.content ? post.content : "",
                    memo_id: post_id
                },
                defaults: {
                    profile: profile_tag,
                    content: post.content ? post.content : "",
                    images: post.images,
                    memo_id: post_id
                }
            });

            if (created) {
                console.log(`Пост з ID ${newPost.id} успішно створено.`);
            } else {
                console.log(`Пост вже існує в базі даних.`);
            }
        }
    } catch (error) {
        console.log(error)
    }
}

async function get_user_feed(page) {
    const result = {
        error: null,
        posts: []
    }
    try {
        await page.waitForSelector(TWITTER_USER_FEED)
        const feed_container = await page.$(TWITTER_USER_FEED)

        const user_posts = await feed_container.$$(TWITTER_USER_POSTS_CONTAINER)

        for (const post of user_posts) {
            const user_post = {}
            // user_post.id = await post.getAttribute('id')
            user_post.id = await get_post_attributs(post)
            user_post.content = await get_post_content(post)
            user_post.images = await get_post_attachments(post)

            console.log(user_post)
            result.posts.push(user_post)
        }

        return result
    } catch (error) {
        console.log(error)
    }
}

async function get_post_attachments(post) {
    try {
        const images = await post.$$eval('img[alt="Image"][draggable="true"][src]', imgs =>
            imgs.map(img => img.src).filter(src => src.startsWith('https://pbs.twimg.com/media/'))
        );
        if (images.length > 0) {
            const replaced_urls = replace_name_and_extract_format(images)
            return replaced_urls
        }

        return null
    } catch (error) {
        console.log(error)
    }
}

function replace_name_and_extract_format(urls) {
    return urls.map(url => {
        // Заміна значення параметра name на "large"
        const updatedUrl = url.replace(/name=[^&]+/, 'name=large');

        // Витягнення значення параметра format
        const formatMatch = updatedUrl.match(/format=([^&]+)/);
        const format = formatMatch ? formatMatch[1] : null;

        return { url, format, url_large: updatedUrl };
    });
}

async function get_post_content(post) {
    try {
        const post_content = await post.$eval('div[data-testid="tweetText"]', el => el.innerText)

        if (post_content) return post_content

        return null
    } catch (error) {
        console.log(error)
    }
}

async function get_post_attributs(post) {
    try {
        const footer = await post.$eval(`div[data-testid="User-Name"][class][id]`, el => el.innerText)

        // const id = await footer.getAttribute('id')
        const id = footer

        return id
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    launch,
    init
}