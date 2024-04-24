const { EmbedBuilder, SelectMenuBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
    name: "create",
    description: "在指令頻道建立一個抽獎",
    category: "抽獎",
    type: "subCommand",
    subCommand: "giveaway",
    run: async (bot, interaction, options) => {
        if (!interaction.appPermissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: bot.customEmojis.false + " | 我缺少 `管理訊息` 的權限", ephemeral: true });

        let channel = options.getChannel("頻道");
        let prize = options.getString("物品");
        let time = options.getString("時間").replace(/ /g, "");
        let winnerCount = parseInt(options.getInteger("贏家數"));
        if (channel.type !== ChannelType.GuildText) return
            interaction.reply({ content: bot.customEmojis.false + " | 此頻道非文字頻道", ephemeral: true });
        if (!channel.viewable) return
            interaction.reply({ content: bot.customEmojis.false + " | 我看沒有此頻道的權限", ephemeral: true });

        let t = parseInt(time)
        if (t === NaN || t <= 0) return 
            interaction.reply({ content: bot.customEmojis.false + " | 輸入了錯誤的時間" , ephemeral: true});
        if (winnerCount > 20) winnerCount = 20;
        let unit = time.replace(t, "");
        let duration = (t * 1000);

        if (unit === "分") duration = (t * 60 * 1000);
        if (unit === "時") duration = (t * 60 * 60 * 1000);
        if (unit === "天") duration = (t * 24 * 60 * 60 * 1000);

        bot.giveawayManger.create(channel, {
            prize,
            winnerCount,
            duration,
            hostBy: interaction.user,
        })
            .then(data =>
                interaction.reply({
                    content: bot.customEmojis.true + " | 成功建立一個抽獎活動!",
                    components: [{
                        type: 1, components: [{ type: 2, label: "點我傳送!", style: 5, url: "https://discord.com/channels/" + data["guildID"] + "/" + data["channelID"] + "/" + data["messageID"] }]
                    }],
                    ephemeral: true
                })
            )
            .catch(e => interaction.reply({ content: bot.customEmojis.false + " | " + e.toString().replace('Error: ', '') }));
            //.catch(console.error)
    }
}