const { EmbedBuilder } = require('discord.js')
const { SlashCommand } = require('../../utils/loadLibs')

let command = new SlashCommand()
  .setName("ping")
  .setDescription("查看機器人的延遲")
  .setCategory("一般")
  .setRun(async (bot, interaction, options) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: bot.i18n.string('embedAuthorName'), iconURL: bot.user.displayAvatarURL() })
          .setDescription(bot.i18n.string('waitMeAMoment'))
          .setColor('Blue')
      ], fetchReply: true
    })
      .then(message => {
        let ping = message.createdTimestamp - interaction.createdTimestamp
        message.edit({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: bot.i18n.string('embedAuthorName'), iconURL: bot.user.displayAvatarURL() })
              .setDescription(bot.i18n.string('embedDescription', bot.ws.ping, ping))
              .setColor('Blue')
          ]
        })
      })
  });

module.exports = command