const Post = require("../database/models/twitter_post")
const { post_to_hey } = require("../module/hey.module")
const { post_to_towns } = require("../module/towns.module")
const { sleep, dateDifference } = require("../utils/utils")
const { send_message_to_telegram } = require("./notification.module")

let isRunning = true

async function launch() {
    try {
        while (isRunning) {
            const isPostingTime = await is_last_post_older_than_3hours()

            if (isPostingTime) {
                const random_post = await get_random_post()
                if (!random_post.details.hey_posted_date) await post_to_hey(random_post)
                if (!random_post.details.town_posted_date) await post_to_towns(random_post)
            }
            console.log("isPostingTme", isPostingTme)
            await sleep(1000000)
        }
    } catch (error) {
        console.log(error)
        await send_message_to_telegram("Error while running Poster")
    }
}

async function get_random_post() {
    try {
        const count = await Post.count({
            where: {
                publishing_date: null,
                // hey_status: null
            }
        });

        if (count === 0) {
            console.log('Пости з null значеннями для publishing_date не знайдено.');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * count);

        const randomPost = await Post.findOne({
            where: {
                publishing_date: null,
                // hey_status: null
            },
            offset: randomIndex
        });

        return randomPost;
    } catch (error) {
        console.log(error)
    }
}

async function is_last_post_older_than_3hours() {
    try {
        const lastPost = await Post.findOne({
            order: [['publishing_date', 'DESC']],

        });

        if (!lastPost) {
            console.log('У базі даних немає жодного поста.');
            return false;
        }

        const lastPublishingDate = lastPost.publishing_date;
        const currentTime = new Date();

        const timeDifference = dateDifference(lastPublishingDate, currentTime);

        console.log(timeDifference)
        return timeDifference.hours >= 3;
    } catch (error) {
        console.log(error)
        return false
    }
}

module.exports = {
    launch
}