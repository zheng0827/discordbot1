const { Collection, ApplicationCommandOptionType } = require("discord.js");
const fs = require("fs");
const path = require("path");

class Helper {
    /**
     * 
     * @param {Collection} commands 
     */
    constructor() {
        fs.writeFileSync("qwq.json", JSON.stringify(this.getCommands(), null, 2), 'utf-8')
    }

    getConfig() { }

    getCommands() {
        let allCommands = [];

        fs.readdirSync(path.join(__dirname, "..", "..", "commands")).forEach(commandDir => {
            let commands = fs.readdirSync(path.join(__dirname, "..", "..", "commands", commandDir));

            for (let command of commands) {
                let cmd = require("../../commands/" + commandDir + "/" + command);

                if (cmd.type === 1 && cmd.name) {
                let commandData = this._handleCommand(cmd);
                if (Array.isArray(commandData)) commandData.forEach(sub => allCommands.push(sub)); else allCommands.push(commandData);
                }
            }
        })

        return allCommands;
    }
    /**
     * @private
     */
    _handleCommand(cmd) {
        let commandData = cmd.toJSON();
        //let commandData = require("../../commands/backup/backup").toJSON();

        let sub = commandData["options"]?.filter(option => option.type === ApplicationCommandOptionType.Subcommand || option.type === ApplicationCommandOptionType.SubcommandGroup) || [];

        let data;
        if (!sub.length) {
            data = {};

            data["name"] = commandData["name"];
            data["description"] = commandData["description"];
            data["category"] = commandData["category"];
            data["isNSFW"] = commandData["nsfw"] || false;
            data["mainCommand"] = true;
            data["permissions"] = commandData["default_member_permissions"] || [];
            data["commandArgs"] = commandData["options"]?.map(option =>
                option.required ? ({ name: "{" + option.name + "}", description: option.description }) : ({ name: "[" + option.name + "]", description: option["description"] })
            ) || [];//{必要} , [選瑱]
            data["usage"] = "這個有點難說";
        } else if (!sub.filter(option => option.type === ApplicationCommandOptionType.SubcommandGroup).length) {
            data = [];
            /*
            data.push({
                name: commandData["name"],
                description: commandData["description"],
                category: commandData["category"],
                isNSFW: commandData["nsfw"] || false,
                mainCommand: true,
                permissions: commandData["default_member_permissions"] || [],
                commandArgs:
                    commandData["options"]?.filter(option => option.type !== ApplicationCommandOptionType.Subcommand && option.type !== ApplicationCommandOptionType.SubcommandGroup).map(option =>
                        option.required ? ({ name: "{" + option.name + "}", description: option.description }) : ({ name: "[" + option.name + "]", description: option["description"] })
                    ) || []
            })//*/
            sub.forEach(subCommand =>
                data.push({
                    name: `${commandData["name"]} ${subCommand["name"]}`,
                    description: subCommand["description"],
                    category: commandData["category"],
                    isNSFW: commandData["nsfw"] || false,
                    mainCommand: false,
                    permissions: commandData["default_member_permissions"] || [],
                    commandArgs:
                        subCommand["options"]?.map(option =>
                            option.required ? ({ name: "{" + option.name + "}", description: option.description }) : ({ name: "[" + option.name + "]", description: option["description"] })
                        ) || [],
                    usage: "這個有點難說"
                })
            );
        } else {
            data = { name: 'SubcommandGroup還沒處理' };
        }
        return data;
    }
}

module.exports = Helper;