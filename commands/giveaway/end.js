const { EmbedBuilder, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const fs = require("fs")
const { Giveaway } = require("../../utils/loadLibs")

module.exports = {
    name: "end",
    description: "結束一個抽獎",
    category: "抽獎",
    type: "subCommand",
    subCommand: "giveaway",
    run: async (bot, interaction, options) => {
        if (!interaction.appPermissions.has("ManageMessages")) return interaction.reply({ content: bot.customEmojis.false + " | 我缺少 `管理訊息` 的權限", ephemeral: true });

        let giveawayID = options.getString("訊息id");
        bot.giveawayManger.end(giveawayID)
            .then(() =>
                interaction.reply({ content: bot.customEmojis.true + " | 成功結束抽獎!", ephemeral: true })
            )
            .catch(e => interaction.reply({ content: bot.customEmojis.false + " | " + e.toString().replace('Error: ', '') }));
    }
}