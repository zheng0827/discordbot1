//懶

const { EmbedBuilder } = require('discord.js');
const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("queue")
    .setDescription("查看目前列隊")
    .setCategory("音樂")
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });

        bot.player.queue(interaction)
            .then(async (queue) => {
                let currentTrack = queue.currentTrack || {};
                let tracks = queue.tracks || [];
                let fields = []

                tracks.forEach(track => {
                    fields.push({
                        name: '[' + tracks.indexOf(track) + '] ' + track.title,
                        value: '```\n時長: ' + track.duration + '\n請求者: ' + track.requestedBy.tag + '```',
                        inline: false
                    })
                })
                let embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.name + ' 的列隊', iconURL: interaction.guild.iconURL({ format: "jpeg", dynamic: true, size: 4096 }) })
                    .setFields([
                        {
                            name: '[目前播放] ' + currentTrack.title,
                            value: '```\n時長: ' + currentTrack.duration + '\n請求者: ' + currentTrack.requestedBy.tag + '```',
                            inline: false
                        },
                        ...fields
                    ])
                    .setColor('Blue')
                    .setFooter({ text: 'NO.96 音樂系統', iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) });

               interaction.reply({ embeds: [embed], fetchReply: true });
            })
            .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command