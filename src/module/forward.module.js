const axios = require('axios');

const Twitter = require("./twitter.module")
const Post = require("../database/models/twitter_post")
const { post_to_hey } = require("../module/hey.module")

let isRunning = false;
let isRestarting = false;

async function monitorProfile() {
    try {
        console.log("Monitor status", isRunning)
        while (isRunning) {
            // console.log("Monitor status", isRunning)
            console.log('Моніторинг сторінки...');
            const result = await Twitter.launch(null)

            // const posts = await Post.findAll({ where })

            const ready_to_post = await isLastPostOlderThan3Hours()
            if (ready_to_post) {
                const random_post = await getRandomPostWithNullFields()
                if (random_post) await post_to_hey(random_post)
            }

            await new Promise(resolve => setTimeout(resolve, 100000));
        }
    } catch (error) {
        console.error('Виникла помилка:', error.message);
        if (isRunning) {
            console.log('Перезапуск через помилку...');
            restartMonitoring();
        }
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
        // Отримуємо кількість постів, що відповідають умовам
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

        // Генеруємо випадковий індекс
        const randomIndex = Math.floor(Math.random() * count);

        // Отримуємо випадковий пост
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
        // Знаходимо останній пост на основі поля publishing_date
        const lastPost = await Post.findOne({
            order: [['publishing_date', 'DESC']]
        });

        if (!lastPost) {
            console.log('У базі даних немає жодного поста.');
            return false;
        }

        const lastPublishingDate = lastPost.publishing_date;
        const currentTime = new Date();
        const timeDifference = (currentTime - lastPublishingDate) / (1000 * 60 * 60); // Різниця в годинах

        console.log(`Останній пост був опублікований ${lastPublishingDate}.`);
        return timeDifference > 3;
    } catch (error) {
        console.error('Помилка при перевірці часу останньої публікації:', error.message);
        return false;
    }
}

module.exports = {
    startMonitoring
}

