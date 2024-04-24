const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("skip")
    .setDescription("跳過音樂")
    .setCategory("音樂")
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 請加入跟我一樣的頻道!', ephemeral: true });

        await interaction.deferReply()
        bot.player.skip(interaction)
            .then(async (track) => {
                if (track) return interaction.editReply({content:bot.customEmojis.true + ' | 成功跳過  `' + track.title + '` !'})
            })
            .catch(e => interaction.editReply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('ReferenceError: ', '').replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command