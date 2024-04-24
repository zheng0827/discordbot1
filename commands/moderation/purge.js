const { SlashCommand } = require("../../utils/loadLibs")
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

let command = new SlashCommand()
    .setName("purge")
    .setDescription("刪除訊息")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator)
    .setCategory("伺服器管理")
    .addIntegerOption(option => option.setName("數量").setDescription("要清除多少訊息?").setRequired(true).setMaxValue(100).setMinValue(1))
    .setRun(async (bot, interaction, options) => {
        let deleteCount = options.getInteger("數量");
        let fetchDelete = async (deletedMessagesCount = 0) => {
            let fetchedMessages = await interaction.channel.messages.fetch({ limit: deleteCount - deletedMessagesCount, cache: false, force: true });
            await interaction.reply({ content: "這會需要一點時間，請稍等", fetchReply: true })

            for (const msg of fetchedMessages) {
                msg[1].deletable ? msg[1].delete() : ''
            }
            interaction.editReply({ content: bot.customEmojis.true + " | 成功刪除 `" + (deletedMessagesCount + fetchedMessages.size) + "` 個訊息", fetchReply: true });
        };

        interaction.channel.bulkDelete(deleteCount, false)
            .then(async messages => {
                if (messages.size >= deleteCount) return interaction.reply({ content: bot.customEmojis.true + " | 成功刪除 `" + messages.size + "` 個訊息", fetchReply: true });
                fetchDelete(messages.size)
            })
            .catch(async error => {
                fetchDelete(0)
            })
    })

module.exports = command;