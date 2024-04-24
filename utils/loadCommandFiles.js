const { readdirSync } = require("fs")
const path = require("path");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { languageList } = require('./loadLibs')

let slashes = []
module.exports = async bot => {

    readdirSync(path.join(__dirname, "..", "commands")).forEach(async (commandDir) => {
        const commands = readdirSync(path.join(__dirname, "..", "commands", commandDir)).filter(file => file.endsWith(".js"));

        for (let file of commands) {
            let command = require(`../commands/${commandDir}/${file}`)

            if (!command.subCommand) {
                if (command.name) {
                    bot.commands.set(command.name, command)
                    slashes.push(command)
                    bot.processLogger.ok("載入指令檔案 '" + file + "' 成功!")
                } else {
                    bot.processLogger.warn("載入指令檔案 '" + file + "' 失敗!")
                }
            }
        };

    });

    if (bot.config.music.enable) {
        const commands = readdirSync(path.join(__dirname, "..", bot.config.music.path, "src/commands")).filter(file => file.endsWith(".js"));

        for (let file of commands) {
            let command = require(`../${bot.config.music.path}/src/commands/${file}`)

            if (!command.subCommand) {
                if (command.name) {
                    bot.commands.set(command.name, command)
                    slashes.push(command)
                    bot.processLogger.ok("載入音樂指令檔案 '" + file + "' 成功!")
                } else {
                    bot.processLogger.warn("載入音樂指令檔案 '" + file + "' 失敗!")
                }
            }
        };
    }

    //設置全域性斜線指令
    bot.once("ready", async () => {
        bot.processLogger.info("正在設置斜線指令")
        const rest = new REST({ version: '10' }).setToken(bot.token);
        await rest.put(Routes.applicationCommands(bot.user.id), { body: slashes })
            .then(() => {
                bot.processLogger.ok("成功設置斜線指令")
            });
    })
}