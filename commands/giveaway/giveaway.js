const { PermissionFlagsBits } = require("discord.js");
const { SlashCommand } = require("../../utils/loadLibs")

let command = new SlashCommand()
    .setName("giveaway")
    .setDescription("抽獎")
    .setCategory("抽獎")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subCommand => subCommand
        .setName("create")
        .setDescription("在指令頻道建立一個抽獎")
        .addChannelOption(option => option.setName("頻道").setDescription("要把抽獎建立在哪個頻道?").setRequired(true))
        .addIntegerOption(option => option.setName("贏家數").setDescription("要抽出幾個贏家? (至多20)").setRequired(true))
        .addStringOption(option => option.setName("時間").setDescription("抽獎時間要設置多久? (預設單位是 \'秒\'，時間單位有: 秒、分、時、天)").setRequired(true))
        .addStringOption(option => option.setName("物品").setDescription("要抽出什麼物品?").setRequired(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("info")
        .setDescription("查看抽獎資訊")
        .addStringOption(option => option.setName("訊息id").setDescription("要重抽哪個已結束的抽獎?").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("end")
        .setDescription("結束一個抽獎")
        .addStringOption(option => option.setName("訊息id").setDescription("要結束哪一個正在進行的抽獎?").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("reroll")
        .setDescription("重抽一個已結束的抽獎(一次只抽一位，若參與者很少，容易重抽到同一個人)")
        .addStringOption(option => option.setName("訊息id").setDescription("要重抽哪個已結束的抽獎?").setRequired(true).setAutocomplete(true))
    )
    .setAutocompleteRespond(async (bot, interaction, focused) => {
        let giveawayData = bot.giveawayManger.getData();

        let respond;
        switch (interaction.options.getSubcommand(true)) {
            case 'info':
                respond = giveawayData.filter(data => data.guildID === interaction.guildId) || [];
                break;
            case 'end':
                respond = giveawayData.filter(data => data.guildID === interaction.guildId && !data.ended) || [];
                break;
            case 'reroll':
                respond = giveawayData.filter(data => data.guildID === interaction.guildId && data.ended) || [];
                break;
            case 'delete':
                respond = giveawayData.filter(data => data.guildID === interaction.guildId && data.ended) || [];
                break;
        }
        respond = respond.filter(data => data.prize.includes(focused.value) || data.messageID.includes(focused.value)).map(data => ({ name: data.prize + " | " + data.messageID, value: data.giveawayID }));
        if (respond.length > 25) respond = respond.slice(0, 24);
        return interaction.respond(respond);
    })
    .setRun(async (bot, interaction, options) => {

        switch (options.getSubcommand(true)) {
            case 'info':
                require("./info").run(bot, interaction, options)
                break;
            case 'reroll':
                require("./reroll").run(bot, interaction, options)
                break;
            case 'end':
                require("./end").run(bot, interaction, options)
                break;
            case 'create':
                require("./create").run(bot, interaction, options)
                break;
        }
    })

module.exports = command