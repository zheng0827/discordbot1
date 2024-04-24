const SlashCommand = require('../../../discord-js/SlashCommand');
const playList = require('../../../discordMusic/src/playlist')
const fs = require('fs');
const path = require('path');
const { SelectMenuBuilder, StringSelectMenuBuilder } = require('discord.js');

let command = new SlashCommand()
    .setName("playlist")
    .setDescription("歌單")
    .setCategory("音樂")
    .addSubcommand(subCommand => subCommand
        .setName("play")
        .setDescription("播放一個歌單")
        .addStringOption(option => option.setName("歌單名字").setDescription("請選擇一個歌單").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("info")
        .setDescription("查看歌單資訊")
        .addStringOption(option => option.setName("歌單名字").setDescription("請選擇一個歌單").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("shuffle")
        .setDescription("打亂歌單中的歌曲")
        .addStringOption(option => option.setName("歌單名字").setDescription("請選擇一個歌單").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("explore")
        .setDescription("探索公開歌單")
        .addStringOption(option => option.setName("歌單名字").setDescription("請選擇一個公開的歌單").setRequired(true).setAutocomplete(true))
        .addStringOption(option => option
            .setName("操作")
            .setDescription("要執行哪項操作")
            .addChoices(
                { name: "播放歌單", value: "PLAY" }, { name: "查看歌單資訊", value: "INFO" }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand => subCommand
        .setName("create")
        .setDescription("建立一個歌單")
        .addStringOption(option => option.setName("名字").setDescription("要把歌單設為什麼名字?").setRequired(true))
        .addBooleanOption(option => option.setName("公開歌單").setDescription("是否將歌單設為公開?"))
    )
    .addSubcommand(subCommand => subCommand
        .setName("delete")
        .setDescription("刪除一個歌單")
        .addStringOption(option => option.setName("歌單名字").setDescription("請選擇一個歌單").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("add")
        .setDescription("添加一首歌到歌單")
        .addStringOption(option => option.setName("歌單名字").setDescription("請選擇一個歌單").setRequired(true).setAutocomplete(true))
        .addStringOption(option => option.setName("歌曲").setDescription("要添加哪一首歌到歌單?").setRequired(true))
    )
    .setAutocompleteRespond(async (bot, interaction, focused) => {
        let respond;

        switch (interaction.options.getSubcommand(true)) {
            case 'add':
                respond = playList.getPlaylists("USER", interaction.user.id);
                break;
            case 'play':
                respond = playList.getPlaylists("USER", interaction.user.id);
                break;
            case 'remove':
                respond = playList.getPlaylists("USER", interaction.user.id);
                break;
            case 'delete':
                respond = playList.getPlaylists("USER", interaction.user.id);
                break;
            case 'info':
                respond = playList.getPlaylists("USER", interaction.user.id);
                break;
            case 'shuffle':
                respond = playList.getPlaylists("USER", interaction.user.id);
                break;
            case 'explore':
                respond = playList.getPlaylists("PUBLIC");
                break;
        };

        respond = respond
                    .filter(data => data.name.includes(focused.value))
                    .map(data => ({ name: data.name, value: data.id }));
        return interaction.respond(respond);
    })
    .setRun(async (bot, interaction, options) => {
        switch (options.getSubcommand(true)) {
            case 'play':
                if (!interaction.member.voice.channel)
                    return interaction.reply({ content: bot.customEmojis.false + ' | 請先加入一個頻道', ephemeral: true });

                if (interaction.guild.members.me.voice.channel && (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id))
                    return interaction.reply({ content: bot.customEmojis.false + ' | 已經有人在使用我了!', ephemeral: true });

                let playlist = playList.getPlaylist(options.getString("歌單名字")) || {}
                if (!playlist) return interaction.reply({ content: bot.customEmojis.false + ' | 找不到任何歌單!', ephemeral: true });
                await interaction.deferReply({ ephemeral: true })

                bot.player.playlist(interaction, playlist)
                    .then(async (tracks) => {
                        await interaction.editReply({ content: bot.customEmojis.true + ' | 成功載入 ' + tracks.map(track => "`" + track["title"] + "`").join(" , ") + " !" })
                    })
                    .catch(e => interaction.editReply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', '') }));
                break;
            case 'create':
                let created = playList.create(options.getString("名字"), options.getBoolean("公開歌單"), interaction.user.id);
                if (!created) return interaction.reply({ content: bot.customEmojis.false + ' | 建立歌單失敗!麻煩請聯繫我的開發者', ephemeral: true });

                interaction.reply({ content: bot.customEmojis.true + ' | 成功建立歌單!!!請利用 </playlist add:0>添加歌曲 :)', ephemeral: true })
                break;
            case 'delete':
                playList.delete(options.getString("歌單名字"));
                interaction.reply({ content: bot.customEmojis.true + " | 成功刪除你的歌單!", ephemeral: true });
                break;
            case 'shuffle':
                playList.shuffle(options.getString("歌單名字"));
                interaction.reply({ content: bot.customEmojis.true + " | 成功打亂你的歌單!", ephemeral: true });
                break;
            case 'explore':
                interaction.reply({ content: '你怎麼在用這個功能?就還沒寫完!', ephemeral: true });
                break;
            case 'add':
                await interaction.deferReply({ fetchReply: true })

                bot.player.search(interaction, "AUTO", options.getString("歌曲"))
                    .then(async (tracks) => {

                        await interaction.editReply({
                            content: bot.customEmojis['music'] + ' | 請選擇一個或多個選項',
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        new StringSelectMenuBuilder()
                                            .setCustomId("CHOOSESONGS")
                                            .setMinValues(1)
                                            .setMaxValues((tracks.length) + 1)
                                            .setPlaceholder("搜尋到的資源")
                                            .setOptions(
                                                {
                                                    label: "沒有我想要的",
                                                    value: "CANCEL",
                                                    emoji: "❌"
                                                },
                                                ...tracks.map(track => ({
                                                    label: track["title"].slice(0, 98),
                                                    value: tracks.indexOf(track).toString(),
                                                    emoji: "1042439426225225738"
                                                }))
                                            )
                                    ]
                                }
                            ]
                        }).then(async msg => {
                            let collector = msg.createMessageComponentCollector({ time: 120000, filter: (i) => i.user.id === interaction.user.id });
                            collector
                                .on("collect", async i => {
                                    await i.deferUpdate();
                                    if (i.values.includes("CANCEL")) return collector.stop("CANCEL");

                                    let choseTracks = [];
                                    i.values.forEach(index => choseTracks.push(tracks[Number(index)]))

                                    playList.add(options.getString("歌單名字"), choseTracks);
                                    collector.stop("ADDED")
                                })
                                .on("end", (collected, reason) => {
                                    msg.edit({ components: [] })
                                });
                        })
                    })
                    .catch(e => {
                        interaction.editReply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true })
                        console.error(e)
                    });
                break;
            case 'remove':
                interaction.reply({ content: '你怎麼在用這個功能?就還沒寫完!', ephemeral: true });
                break;
        }
    });
function totalTime(array) {
    let totalS = 0;

    for (const duration of array) {
        if (duration.split(":").length === 3) {
            totalS += (Number(duration.split(":")[0]) * 3600);
            totalS += (Number(duration.split(":")[1]) * 60);
            totalS += Number(duration.split(":")[3]);
        } else {
            totalS += (Number(duration.split(":")[1]) * 60);
            totalS += Number(duration.split(":")[3]);
        };
    };

    let h = Math.floor(totalS / 3600);
    totalS %= 3600;
    let min = Math.floor(totalS / 60);
    let s = Math.floor(totalS % 60);

    return (h + ":" + min + ":" + s);
};

module.exports = command;