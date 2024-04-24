const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("play")
    .setDescription("播放音樂")
    .setCategory("音樂")
    .addStringOption(option => option.setName("歌曲").setDescription("要播放哪一首歌?").setRequired(true))
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });

        const song = options.getString("歌曲");
        await interaction.reply({ content: '正在載入您的請求......', ephemeral: true })
        bot.player.play(interaction, song)
            .then(async (tracks) => {
                try {
                    await interaction.editReply({ content: '成功載入您請求的 **' + (Array.isArray(tracks) ? '歌單' : '歌曲') + '** !', ephemeral: true })
                } catch (e) {
                    console.error(e)
                }
            })
            .catch(e => interaction.editReply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command