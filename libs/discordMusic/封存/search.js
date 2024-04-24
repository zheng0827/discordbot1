const { EmbedBuilder } = require('discord.js');
const SlashCommand = require('../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("search")
    .setDescription("尋找資源並播放")
    .setCategory("音樂")
    .addStringOption(option => option.setName("歌曲").setDescription("要尋找哪一首歌?").setRequired(true))
    //.addStringOption(option => option.setName("搜尋引擎").setDescription("要用哪一種搜尋引擎?").setRequired(false))
    .setRun(async (bot, interaction, options) => {
        if (!interaction.member.voice.channel)
            return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

        if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
            return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });

        bot.player.search(interaction)
            .then(async (tracks) => {
                let options = [{
                    label: "取消操作",
                    emoji: "❌",
                    value: "CANCEL"
                }]
                for (const track of tracks) {
                    options.push({
                        label: track["title"],
                        emoji: "🎶",
                        value: tracks.indexOf(track)
                    })
                }
                interaction.reply({
                    embeds:[
                        new EmbedBuilder()
                        .setAuthor({name: interaction.user.tag + " 請選擇歌曲",iconURL:interaction.user.displayAvatarURL()})
                        .setColor("Blue")
                        .setFooter({ text: 'NO.96 音樂系統', iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) })
                    ],
                })
            })
            .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
    })

module.exports = command