const Twitter = require("./twitter.module")
const Post = require("../database/models/twitter_post")
const { post_to_hey } = require("../module/hey.module")

let isRunning = false;
let isRestarting = false;

async function monitorProfile() {
    try {
        console.log("Monitor status", isRunning)
        while (isRunning) {
            console.log('Моніторинг сторінки...');

            const ready_to_post = await isLastPostOlderThan3Hours()
            // const ready_to_post = true
            console.log("ready_to_post", ready_to_post)
            if (ready_to_post) {
                const random_post = await getRandomPostWithNullFields()
                if (random_post) await post_to_hey(random_post)
            }

            await new Promise(resolve => setTimeout(resolve, 100000));
        }
    } catch (error) {
        console.error('Виникла помилка:', error.message);
        // if (isRunning) {
        //     console.log('Перезапуск через помилку...');
        //     restartMonitoring();
        // }
    }
}

function startMonitoring() {
    if (isRunning) {
        console.log('Моніторинг вже запущений');
        return;
    }

    isRunning = true;
    isRestarting = false;
    monitorProfile();
    console.log('Моніторинг запущений');
}

async function getRandomPostWithNullFields() {
    try {
        const count = await Post.count({
            where: {
                publishing_date: null,
                hey_status: null
            }
        });

        if (count === 0) {
            console.log('Пости з null значеннями для publishing_date і hey_status не знайдено.');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * count);

        const randomPost = await Post.findOne({
            where: {
                publishing_date: null,
                hey_status: null
            },
            offset: randomIndex
        });

        return randomPost;
    } catch (error) {
        console.error('Помилка при отриманні випадкового поста:', error.message);
        return null;
    }
}

function stopMonitoring() {
    isRunning = false;
    console.log('Моніторинг зупинено');
}

function restartMonitoring() {
    if (isRestarting) return;
    isRestarting = true;

    stopMonitoring();
    setTimeout(() => startMonitoring(), 1000); // Невелика затримка перед перезапуском
}

async function isLastPostOlderThan3Hours() {
    try {
        const lastPost = await Post.findOne({
            order: [['publishing_date', 'DESC']]
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
        console.error('Помилка при перевірці часу останньої публікації:', error.message);
        return false;
    }
}

function dateDifference(oldDate, currentDate) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const _MS_PER_HOUR = 1000 * 60 * 60;
    const _MS_PER_MINUTE = 1000 * 60;

    const diff = new Date(currentDate) - new Date(oldDate);

    return {
        minutes: Math.floor(diff / _MS_PER_MINUTE),
        hours: Math.floor(diff / _MS_PER_HOUR),
        days: Math.floor(diff / _MS_PER_DAY)
    };
}

module.exports = {
    startMonitoring
}

