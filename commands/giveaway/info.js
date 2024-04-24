const { EmbedBuilder } = require("discord.js");
const fs = require("fs")

module.exports = {
    name: "info",
    description: "查看抽獎資訊",
    category: "抽獎",
    type: "subCommand",
    subCommand: "giveaway",
    run: async (bot, interaction, options) => {
        let giveawayData = bot.giveawayManger.getData();
        let giveawayID = options.getString("訊息id");

        giveawayData = giveawayData.filter(data => data.guildID === interaction.guildId).find(data => data.giveawayID === giveawayID) || {};

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .addFields(
                        {
                            name: "獎品", value: giveawayData["prize"], inline: true
                        },
                        {
                            name: "頻道", value: "<#" + giveawayData["channelID"] + ">", inline: true
                        },
                        {
                            name: "主辦人", value: "<@" + giveawayData["hostBy"] + ">", inline: true
                        },
                        {
                            name: "建立時間", value: "<t:" + Math.floor(giveawayData["createdTimestamp"] / 1000) + ":F>", inline: true
                        },
                        {
                            name: "\u200B", value: "\u200B", inline: true
                        },
                        {
                            name: "結束時間", value: "<t:" + Math.floor(giveawayData["endTimestamp"] / 1000) + ":F>", inline: true
                        },
                    )
            ]
        })

    }
}