const { init } = require("./src/module/browser.module")
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const sequelize = require("./src/database/sqlite_db")

async function main_init() {
    const twitter_source_path = path.join(process.cwd(), "twitter_source.json")
    try {
        await checkAndCreateFile(twitter_source_path)

        await _connectDB()

        const twitter = await init("Twitter", false)

        const twitter_page = await twitter.newPage()

        await twitter_page.goto("https://x.com/")

        const context = await init("Hey", false)

        const page = await context.newPage();

        await page.goto("https://hey.xyz/")

        const towns = await context.newPage()

        await towns.goto("https://app.towns.com/t/1029bb70177eecdb30ab900e0b02961cbbaf4c2a170000000000000000000000/channels/2029bb70177eecdb30ab900e0b02961cbbaf4c2a17a6220aedf44aeb1a584934/")
    } catch (error) {
        console.log(error)
    }
}

async function runMigrations() {
    try {
        console.log('Applying migrations...');
        execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
        console.log('Migrations applied successfully');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

async function checkAndCreateFile(filePath) {
    try {
        await fs.access(filePath);
        console.log('Файл вже існує:', filePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Якщо файл не існує, створюємо його
            await fs.writeFile(filePath, '', 'utf8');
            console.log('Файл створено:', filePath);
        } else {
            console.error('Сталася помилка:', error);
            throw error;
        }
    }
}

async function _connectDB() {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        console.log("Database Connected")
    } catch (error) {
        console.log(error)

    }
}

main_init()