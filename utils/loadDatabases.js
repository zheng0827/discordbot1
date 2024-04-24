const Database = require("../libs/database.js")
const { readdirSync } = require("fs")
const path = require("path");

module.exports = (bot) => {
    let file_dir = path.join(__dirname, "..", "config", "Database")
    let files = readdirSync(file_dir).filter(file => file.endsWith(".json"))
    for (let file of files) {
        bot[file.split('.')[0] + "DB"] = new Database(file.split('.')[0], file_dir)
        bot.processLogger.ok("載入資料庫檔案 " + file + " 成功!")
    }
}