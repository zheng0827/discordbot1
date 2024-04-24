const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("loop")
    .setDescription("循環歌曲")
    .setCategory("音樂")
    .addStringOption(option => option
        .setName("循環模式")
        .setDescription("選擇一種循環模式")
        .setRequired(true)
        .setChoices(
            { name: '單曲循環', value: "TRACK" },
            { name: '列隊循環', value: "QUEUE" },
            { name: '關閉循環', value: "OFF" }
        )
    )
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });
            
        bot.player.loop(interaction, options.getString("循環模式"))
            .then(async (loopMode) => {
                interaction.reply({ content: bot.customEmojis.true + ' | ' + ((loopMode === 'TRACK') ? '成功開啟 **單曲循環** 模式!' : ((loopMode === 'QUEUE') ? '成功開啟 **列隊循環** 模式!' : '成功關閉 **循環** 模式!')), fetchReply: true })
            })
            .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command