const { EmbedBuilder, Options } = require('discord.js');
const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("remove")
    .setDescription("查看目前列隊")
    .setCategory("音樂")
    .addIntegerOption(option => option
        .setName("歌曲號碼")
        .setDescription("要移除哪一首歌曲?")
        .setRequired(true)
    )
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });

        bot.player.queue(interaction)
            .then(async (queue) => {
                if (queue["repeatMode"] !== 0) return interaction.reply({ content: bot.customEmojis.false + ' | 不能移除歌曲，因為已有開啟自動播放或循環模式!', ephemeral: true });
                if (queue["tracks"].length === 0) return interaction.reply({ content: bot.customEmojis.false + ' | 不能移除歌曲，因為列隊已沒有其他歌曲!', ephemeral: true });
                if (!queue["tracks"][(options.getInteger("歌曲號碼"))]) return interaction.reply({ content: bot.customEmojis.false + ' | 不能移除歌曲，因為列隊已沒有其他歌曲!', ephemeral: true });

                bot.player.remove(interaction, Number(options.getInteger("歌曲號碼")) - 1)
                    .then(async (track) => {
                        interaction.reply({ content: bot.customEmojis.true + ' | 成功移除 `' + track.title + '` !', fetchReply: true })
                    })
                    .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
            })
            .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command