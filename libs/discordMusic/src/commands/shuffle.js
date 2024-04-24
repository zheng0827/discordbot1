const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("shuffle")
    .setDescription("打亂列隊")
    .setCategory("音樂")
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });

        bot.player.shuffle(interaction)
            .then(async () => {
                interaction.reply({ content: bot.customEmojis.true + ' | 成功打亂列隊!', fetchReply: true })
            })
            .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command