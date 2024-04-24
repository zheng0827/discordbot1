const { ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js')
const { SlashCommand } = require('../../utils/loadLibs')

let command = new SlashCommand()
    .setName("invite")
    .setDescription("邀請機器人")
    .setCategory("一般")
    .setRun(async (bot, interaction, options) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: bot.i18n.string('embedAuthorName', bot.user.tag), iconURL: `${bot.user.displayAvatarURL()}` })
                    .setDescription(bot.i18n.string('embedDescription'))
                    .setColor("Blue")
            ], components: [
                new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setLabel(bot.i18n.string('inviteButtonAdmin'))
                            .setStyle('Link')
                            .setURL(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=8`),
                        new ButtonBuilder()
                            .setLabel(bot.i18n.string('inviteButtonGeneral'))
                            .setStyle('Link')
                            .setURL(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=1376607660736`),
                        new ButtonBuilder()
                            .setLabel(bot.i18n.string('supportServerButton'))
                            .setStyle('Link')
                            .setURL(`${bot.config.supportServer}`)
                    ])
            ], fetchReply: true
        })
    });

module.exports = command