const fs = require("fs")
const path = require("path")

const Post = require("./src/database/models/twitter_post")

async function backup() {
    try {
        const folderPath = path.join(process.cwd(), 'backups');

        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

        const data = await Post.findAll()

        const date = new Date

        const backupPath = path.join(folderPath, date.toDateString() + ".json")

        fs.writeFileSync(backupPath, JSON.stringify(data))

        console.log("Backup Complete. Path: " + backupPath)
    } catch (error) {
        console.log(error)
    }
}

backup()