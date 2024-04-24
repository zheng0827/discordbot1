const { EmbedBuilder, PermissionFlagsBits } = require("discord.js")
const { SlashCommand } = require("../../utils/loadLibs")

let command = new SlashCommand()
    .setName("welcome")
    .setDescription("歡迎訊息功能，當有成員加入時，會自動傳送訊息至指定頻道")
    .setCategory("伺服器設定")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subCommand =>
        subCommand.setName("channel").setDescription("設定頻道(未指定頻道會直接設置在此頻道)")
            .addChannelOption(option => option.setName("頻道").setDescription("要把歡迎訊息設置在哪個頻道?").setRequired(false))
    )
    .addSubcommand(subCommand =>
        subCommand.setName("message").setDescription("設歡迎定訊息")
            .addStringOption(option => option.setName("訊息").setDescription("當有人加入此群組時，要發送什麼訊息?").setRequired(true))
    )
    .addSubcommand(subCommand =>
        subCommand.setName("config").setDescription("查看歡迎訊息設定")
    )
    .addSubcommand(subCommand =>
        subCommand.setName("enable").setDescription("開啟歡迎訊息功能")
    )
    .addSubcommand(subCommand =>
        subCommand.setName("disable").setDescription("關閉歡迎訊息功能")
    )
    .addSubcommand(subCommand =>
        subCommand.setName("test").setDescription("測試歡迎訊息功能")
    )
    .setRun((bot, interaction, options) => {
        let guildDB = bot.guildDB.get(interaction.guild.id) || {}
        let welcome = guildDB.welcome || {}
        let channel = welcome.channel || "未設定"
        let message = welcome.message || "未設定"
        let enable = welcome.enable || false
        let status = "關閉(disable)";
        if (enable) status = "開啟(enable)";
        if (channel !== "未設定") channel = "<#" + channel + ">"

        var config_embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.guild.name} 的歡迎訊息設定`, iconURL: interaction.guild.iconURL() })
            .addFields(
                { name: "頻道:", value: channel, inline: false },
                { name: "訊息:", value: message, inline: false },
                { name: "狀態:", value: status, inline: false }
            )
            .setColor("Blue");

        switch (options.getSubcommand(true)) {
            case 'test':
                interaction.reply({ content: "測試成功", ephemeral: true })
                bot.emit("guildMemberAdd", interaction.member, "test")
                break;
            case 'config':
                interaction.reply({ embeds: [config_embed], fetchReply: true })
                break;
            case 'message':
                welcome.message = options.getString("訊息")
                guildDB.welcome = welcome
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.true + " | 成功設置歡迎訊息為" + welcome.message, ephemeral: true })
                break;
            case 'channel':
                channel = options.getChannel("頻道") || interaction.channel
                if (!channel) return interaction.reply({ content: bot.customEmojis.false + " | 找無此頻道", ephemeral: true });
                if (channel.type !== "GuildText") return interaction.reply({ content: bot.customEmojis.false + " | 請設定一個__文字__頻道", ephemeral: true });
                welcome.channel = channel.id
                if (!welcome.message) welcome.message = "{userMention} , 歡迎來到 `{guildName}` 😀\n現在我們有 `{guildMemberCount}` 位成員了！";
                welcome.enable = true
                guildDB.welcome = welcome
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.true + " | 成功設置歡迎訊息頻道為: <#" + channel.id + ">", fetchReply: true })
                break;
            case 'functions':
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: `歡迎訊息參數`, iconURL: bot.user.displayAvatarURL() })
                            .setColor(`Blue`)
                            .setDescription("要把參數用 `{}` 包起來喔\n***請注意全形和半形，在此是用半形***\n\n以下為可設定參數")
                            .addFields(
                                {
                                    name: " {userMention} ",
                                    value: "介紹: `提及剛加入的成員`\n輸出內容: <@" + interaction.user.id + "> ,歡迎加入"
                                },
                                {
                                    name: " {userName} ",
                                    value: "介紹: `剛加入的成員的名字`\n輸出內容: `" + interaction.user.username + "` ,歡迎加入"
                                },
                                {
                                    name: " {userTag} ",
                                    value: "介紹: `剛加入的成員的名字和四位代碼`\n輸出內容: `" + interaction.user.tag + "` ,歡迎加入"
                                },
                                {
                                    name: " {userID} ",
                                    value: "介紹: `剛加入的成員ID`\n輸出內容: " + interaction.user.tag + " 的ID為 `" + interaction.user.id + "`"
                                },
                                {
                                    name: " {guildName} ",
                                    value: "介紹: `群組名字`\n輸出內容: `" + interaction.user.tag + "` ,歡迎加入 `" + interaction.guild.name + "` !"
                                },
                                {
                                    name: " {guildMemberCount} ",
                                    value: "介紹: `群組現有的成員數量`\n輸出內容: `" + interaction.guild.name + "` 現在有 `" + interaction.guild.memberCount + "` 位成員!"
                                }
                            )
                    ], ephemeral: true
                })
                break;
            case 'enable':
                if (enable) return interaction.reply({ content: bot.customEmojis.false + " | 此群組已有開啟此功能", ephemeral: true });
                welcome.enable = true
                guildDB.welcome = welcome
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.true + " | 成功開啟歡迎訊息", fetchReply: true })
                break;
            case 'disable':
                if (!enable) return interaction.reply({ content: bot.customEmojis.false + " | 此群組並未開啟此功能", ephemeral: true });
                welcome.enable = false
                guildDB.welcome = welcome
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.true + " | 成功關閉歡迎訊息", fetchReply: true })
                break;
        }
    })

module.exports = command