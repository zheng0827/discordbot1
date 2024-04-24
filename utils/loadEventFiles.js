const { readdirSync } = require("fs")
const path = require("path");

module.exports = async (bot) => {
    readdirSync(path.join( __dirname , ".." , "events")).filter(file => file.endsWith(".js")).forEach(file => {
        let event = require(`../events/${file}`)
        let eventName = file.split('.')[0];
        bot.on(eventName, event.bind(null, bot));
        bot.processLogger.ok("載入事件檔案 '" + file + "' 成功!")
    })
}