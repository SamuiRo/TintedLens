require("dotenv").config()

const twitter_source = require("./twitter_source.json")

const twitter_source_example = [
    {
        "url": "https://x.com/Haltootoo",
        "tag": "@Haltootoo"
    },
]

module.exports = {
    VIEWPORT_WIDTH: 1280,
    VIEWPORT_HEIGHT: 880,
    HEADLESS: true,
    USERAGENT: process.env.USERAGENT,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
    TWITTER_SOURCE: twitter_source,
    HEY_ACCOUNT_URL: "https://hey.xyz/u/starlith",
    TOWNS_ACCOUNT_URL: "",
}