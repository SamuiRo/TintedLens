const { init } = require("./src/module/browser.module")
const { execSync } = require('child_process');

const sequelize = require("./src/database/sqlite_db")

const { HEY_ACCOUNT_URL } = require("./app.config")

async function main_init() {
    try {
        // await runMigrations()

        await _connectDB()

        const twitter = await init("Twitter")

        await twitter.close()

        const context = await init("Hey", false)

        const page = await context.newPage();

        await page.goto(HEY_ACCOUNT_URL)
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