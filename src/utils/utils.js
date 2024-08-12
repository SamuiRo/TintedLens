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

module.exports = {
    sleep,
    get_image_buffer,
}