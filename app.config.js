require("dotenv").config()

module.exports = {
    VIEWPORT_WIDTH: 1280,
    VIEWPORT_HEIGHT: 880,
    HEADLESS: true,
    USERAGENT: process.env.USERAGENT,
    TWITTER_SOURCE_URL: "https://x.com/Haltootoo",
    HEY_ACCOUNT_URL: "https://hey.xyz/u/starlith",
    TWITTER_SOURCE_TAG: "@Haltootoo",
}