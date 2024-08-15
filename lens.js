const Twitter = require("./src/module/twitter.module")
const sequelize = require("./src/database/sqlite_db")
const Monitor = require("./src/module/forward.module")

async function main() {
    try {
        await _connectDB()
        await Twitter.launch()
        await Monitor.startMonitoring()
    } catch (error) {
        console.log(error)
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

main()