const Twitter = require("./src/module/twitter.module")
const sequelize = require("./src/database/sqlite_db")
const Monitor = require("./src/module/forward.module")
const Poster = require("./src/module/poster.module")

async function main() {
    try {
        await _connectDB()
        Twitter.launch()
        Poster.launch()

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