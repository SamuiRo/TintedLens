async function sleep(time) {
    return new Promise((resolve, reject) => {
        console.log("Wait for " + time)
        setTimeout(() => {
            resolve(time)
        }, time)
    })
}

async function get_image_buffer(imageUrl) {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
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
    sleep,
    get_image_buffer,
    dateDifference,
}