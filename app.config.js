require("dotenv").config()

module.exports = {
    VIEWPORT_WIDTH: 1280,
    VIEWPORT_HEIGHT: 880,
    HEADLESS: true,
    USERAGENT: process.env.USERAGENT,
    TWITTER_SOURCE: [
        {
            url: "https://x.com/Haltootoo",
            tag: "@Haltootoo"
        },
    ],
    HEY_ACCOUNT_URL: "https://hey.xyz/u/starlith",
}