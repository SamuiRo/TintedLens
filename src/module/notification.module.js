const axios = require("axios")
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID } = require("../../app.config")

/**
 * Відправляє повідомлення до Telegram каналу через бота.
 * 
 * @param {string} botToken - Токен вашого Telegram бота.
 * @param {string} chatId - ID каналу або чату, куди буде відправлено повідомлення (формат @channelusername або ID чату).
 * @param {string} message - Текст повідомлення для відправки.
 * @returns {Promise<void>} - Повертає проміс без результату після успішної відправки.
 * @throws {Error} - Кидає помилку, якщо запит не вдається.
 */
async function send_message_to_telegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHANNEL_ID,
            text: message,
            // parse_mode: 'Markdown', 
        });

        if (response.data.ok) {
            console.log('Notification sended');
        } else {
            throw new Error(`Notification Error: ${response.data.description}`);
        }
    } catch (error) {
        console.error(`Telegram API Error: ${error.message}`);
        throw error;
    }
}

module.exports = {
    send_message_to_telegram
}