const { EmbedBuilder } = require('discord.js');
const SlashCommand = require('../../../discord-js/SlashCommand');

let command = new SlashCommand()
    .setName("musicinfo")
    .setDescription("就...對!")
    .setCategory("音樂")
    .setRun(async (bot, interaction, options) => {
        let version = bot.player.version;
        let name = bot.player.name;

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: bot.user.tag + " 的音樂系統介紹", iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) })
                    .addFields(
                        { name: '名字', value: name, inline: true },
                        { name: '版本', value: version, inline: true },
                        { name: '作者', value: 'zheng0827', inline: true },
                        { name: '版本簡介', value: "```前前後後花了大概  天(2022/11/16構想~2022/11/19[因運動會和段考暫停] 4天) (2022/12/ 繼續[段考結束]~2022/11/ 完成 天)，主要有 16 個指令，可以說是各個都精華(自己講XD \n\n\n因為沒人想用且使用起來也蠻複雜的所以根本不考慮開源，此版本只是作者一時興起而已: )```", inline: false },
                        { name: '使用及參考的套件或專案', value: "[discord-player](https://github.com/Androz2091/discord-player) \n[skyouo-s-music-bot的歌詞爬蟲(魔鏡和Genius)](https://github.com/NCT-skyouo/skyouo-s-music-bot)", inline: false }
                    )
                    .setColor('Blue')
            ]
        })
    })

module.exports = command