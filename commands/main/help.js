const fs = require('fs')
const path = require("path")
const { SlashCommand, Helper } = require("../../utils/loadLibs")
const {
    EmbedBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ButtonStyle
} = require('discord.js');

let emojis = {
    "伺服器安全": "🛡️", "抽獎": "🎉", "一般": "🌐", "伺服器管理": "🔧", "伺服器設定": "⚙️",
    "客服單": "🎟️", "音樂": "🎵", "開發者": "🧑‍💻", "備份": "🗃️", "身分選單": "📇",
    "建議": "🗣️", "娛樂": "🧸"
};
let commands = new Helper().getCommands();
let categories = [...new Set(commands.map(cmd => cmd["category"]))];//我也不知道這個是啥原理，但我知道這個是用來去除多餘的元素的

const home = new ButtonBuilder().setCustomId("home").setEmoji("🏠").setStyle(ButtonStyle.Secondary).setDisabled(true);
const back = new ButtonBuilder().setCustomId("back").setEmoji("◀️").setStyle(ButtonStyle.Secondary).setDisabled(true);
const next = new ButtonBuilder().setCustomId("next").setEmoji("▶️").setStyle(ButtonStyle.Secondary);
const cancel = new ButtonBuilder().setCustomId("cancel").setEmoji("❌").setStyle(ButtonStyle.Secondary);

let command = new SlashCommand()
    .setName("help")
    .setDescription("查看我的指令")
    .setCategory("一般")
    .addStringOption(option => option.setName("指令名稱").setDescription("要查看哪個指令的簡介?").setAutocomplete(true))
    .setAutocompleteRespond(async (bot, interaction, focused) => {
        let respon = commands.filter(cmd => cmd.name?.includes(focused.value)).map(cmd => ({ name: cmd["name"], value: cmd["name"] }));
        if (respon.length >= 25) respon = respon.slice(0, 24);
        interaction.respond(respon);
    })
    .setRun(async (bot, interaction, options) => {

        let command = options.getString("指令名稱")
        if (command) {
            let cmd = commands.find(cmd => cmd["name"] === command);

            return interaction.reply({ embeds: [commandInfoEmbed(bot, interaction, cmd)] });
        };

        let categorySelectMenuOptions = [];
        let fields = [];
        for (let category of categories) {
            categorySelectMenuOptions.push({
                label: category,
                emoji: emojis[category],
                value: category
            })
        }
        for (let category of categories) {
            let cmds = commands.filter(cmd => cmd["category"] === category);

            fields.push({
                name: `${emojis[category]} 【${category}】`,
                value: cmds.filter(cmd => !cmd["name"].includes("enable") && !cmd["name"].includes("disable")).map(cmd => `\`${cmd["name"]}\``).join(" , ")
            })
        }

        const embed = new EmbedBuilder()
            .setTitle("指令列表 - 首頁")
            .setDescription("可以使用 `/help [指令名]` 直接查看指令簡介")
            .setThumbnail(bot.user.displayAvatarURL())
            .addFields(...fields)
            .setColor("Blue")
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });
        const categorySelectMenu = new StringSelectMenuBuilder()
            .setCustomId("categorySelectMenu")
            .setPlaceholder("請選擇一個指令分類")
            .setOptions(...categorySelectMenuOptions);

        const message = await interaction.reply({
            embeds: [embed],
            components: [
                { type: 1, components: [categorySelectMenu] }, { type: 1, components: [back, home, cancel, next] }
            ],
            fetchReply: true
        });

        let page = -1;
        let pages = categories.length - 1;
        //建立一個收集器
        let collecter = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60000
        })
            .on("collect", async (i) => {//開始收集
                await i.deferUpdate({ fetchReply: true });
                collecter.resetTimer({ time: 60000 });
                if (i.isStringSelectMenu()) {
                    if (i.customId === "categorySelectMenu") {
                        let cmds = commands.filter(cmd => cmd["category"] === i.values[0]);
                        page = categories.indexOf(i.values[0]);

                        let buttons = [
                            back.setDisabled(page < 1),
                            home.setDisabled(page < 0),
                            cancel,
                            next.setDisabled(page === pages)
                        ];
                        message.edit({
                            embeds: [
                                embed
                                    .setTitle("指令列表 - " + i.values[0])
                                    .setDescription("```\n" + cmds.map(cmd => `/${cmd["name"]} | ${cmd["description"]}`).join("\n") + "```")
                                    .spliceFields(0, 24)
                            ],
                            components: [
                                { type: 1, components: [handleCommandSelectMenu(cmds)] }, { type: 1, components: buttons }
                            ]
                        })
                    }

                    if (i.customId === "commandSelectMenu") {
                        let command = commands.find(cmd => cmd["name"] === i.values[0]);

                        i.editReply({ embeds: [commandInfoEmbed(bot, interaction, command)], ephemeral: true })
                    }

                }

                if (i.isButton()) {
                    let buttons;
                    let category;
                    let cmds;
                    switch (i.customId) {
                        case 'cancel':
                            collecter.stop("ABC")
                            break;
                        case 'home':
                            page = -1;
                            buttons = [
                                back.setDisabled(page < 1),
                                home.setDisabled(page < 0),
                                cancel,
                                next.setDisabled(page === pages)
                            ]
                            message.edit({
                                embeds: [
                                    embed
                                        .setTitle("指令列表 - 首頁")
                                        .setDescription("可以使用 `/help [指令名]` 直接查看指令簡介")
                                        .setThumbnail(bot.user.displayAvatarURL())
                                        .addFields(...fields)
                                ],
                                components: [
                                    { type: 1, components: [categorySelectMenu] }, { type: 1, components: buttons }
                                ]
                            })
                            break;
                        case 'back':
                            page--;
                            buttons = [
                                back.setDisabled(page < 1),
                                home.setDisabled(page < 0),
                                cancel,
                                next.setDisabled(page === pages)
                            ];
                            category = categories[page];
                            cmds = commands.filter(cmd => cmd["category"] === category)

                            message.edit({
                                embeds: [
                                    embed
                                        .setTitle("指令列表 - " + category)
                                        .setDescription("```\n" + cmds.map(cmd => `/${cmd["name"]} | ${cmd["description"]}`).join("\n") + "```")
                                        .spliceFields(0, 24)
                                ],
                                components: [
                                    { type: 1, components: [handleCommandSelectMenu(cmds)] }, { type: 1, components: buttons }
                                ]
                            })
                            break;
                        case 'next':
                            page++;
                            buttons = [
                                back.setDisabled(page < 1),
                                home.setDisabled(page < 0),
                                cancel,
                                next.setDisabled(page === pages)
                            ];
                            category = categories[page];
                            cmds = commands.filter(cmd => cmd["category"] === category)

                            message.edit({
                                embeds: [
                                    embed
                                        .setTitle("指令列表 - " + category)
                                        .setDescription("```\n" + cmds.map(cmd => `/${cmd["name"]} | ${cmd["description"]}`).join("\n") + "```")
                                        .spliceFields(0, 24)
                                ],
                                components: [
                                    { type: 1, components: [handleCommandSelectMenu(cmds)] }, { type: 1, components: buttons }
                                ]
                            })
                            break;
                    }
                }
            })
            .on("end", (collected, reason) => {
                message.edit({
                    embeds: [embed.setTitle("指令列表 - 已關閉").setColor("Yellow")], components: []
                })
            })
    });

module.exports = command;

function handleCommandSelectMenu(commands) {
    let commandSelectMenuOptions = [];

    for (let command of commands) {
        commandSelectMenuOptions.push({
            label: `/${command["name"]}`,
            emoji: "📋",
            value: command["name"]
        })
    }
    return new StringSelectMenuBuilder().setCustomId("commandSelectMenu").setPlaceholder("請選擇一個指令").setOptions(...commandSelectMenuOptions);
}

function commandInfoEmbed(bot, interaction, command) {
    return (new EmbedBuilder()
        .setTitle("ℹ️ 關於指令 - " + command["name"])
        //.setFooter({ text: "{} 必填 | [] 選填" })
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(bot.user.displayAvatarURL())
        .setColor("Blue")
        //.setDescription("⚠️⚠️⚠️***有加 `{}` 表必填，而 `[]` 表選填***⚠️⚠️⚠️")
        .addFields(
            { name: "\u200B", value: "\u200B" },
            { name: "📜 簡介", value: command["description"], inline: true },
            { name: "📁 所處類別", value: command["category"], inline: true },
            {
                name: "❓ 如何使用指令",
                value: command["commandArgs"].length ?
                    `\`\`\`\n/${command["name"]} ${command["commandArgs"].map(option => option.name).join(" ")}\`\`\`` :
                    "```\n你只要會輸入指令就好了 :)```"
            },
        ));
}