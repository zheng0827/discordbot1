const { Player, QueryType, useMasterPlayer } = require("discord-player");
const { EmbedBuilder, Client, ActionRowBuilder, Collection, ButtonBuilder, ChatInputCommandInteraction, ButtonInteraction } = require("discord.js");
const playList = require("./playlist");

class musicCore {
    constructor(bot, options = {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }
    }) {
        /**
         * @private
         */
        this.player = new Player(bot, options);
        /**
         * @private
         */
        this.messages = new Collection();
        /**
         * @private
         */
        this.playPlaylist = new Collection();

        this._playerEvents(bot)
        this._buttonInteraction(bot)
    }

    async play(interaction, song) {
        let res = await this.player.search(song, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE
        });

        if (!res || res.tracks.length === 0) throw new Error('找不到任何資源');
        let queue = this.player.queues.get(interaction.guild);
        if (!queue) queue = this.player.queues.create(interaction.guild, {
            leaveOnEmpty: true,
            leaveOnEnd: false,
            leaveOnEmptyCooldown: 10000,
            metadata: interaction.channel,
            selfDeaf: true,
            volume: 150,
        });

        if (!interaction.member.voice.channel.joinable) throw new Error('我加入不了此頻道');

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch (error) {
            throw new Error('我加入不了此頻道');
        }

        res.playlist ? queue.addTrack(res.tracks) : queue.addTrack(res.tracks[0]);
        if (!queue.isPlaying()) queue.node.play();

        return (res.playlist ? res.tracks : res.tracks[0]);
    }

    async search(interaction, searchEngine = "YOUTUBE", song) {
        let res = await this.player.search(song, {
            requestedBy: interaction.user,
            searchEngine: QueryType[searchEngine]
        });

        if (!res || res.tracks.length === 0) throw new Error('找不到任何資源');

        return res.tracks;
    }

    async back(interaction) {//未使用的東西
        const queue = this.player.getQueue(interaction.guild.id);

        if (!queue) throw new Error('現在沒有正在播放的歌曲');
        if (queue.previousTracks.length <= 1) throw new Error('先前沒有播放過任何歌曲');

        let track = await queue.back()
        return track;
    }

    async autoplay(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');

        let autoplay;
        switch (queue.repeatMode) {
            case 0:
                autoplay = queue.setRepeatMode(3)
                return 'on';
            case 1: throw new Error('此列隊已開啟 **單曲循環** 模式');
            case 2: throw new Error('此列隊已開啟 **列隊循環** 模式');
            case 3:
                autoplay = queue.setRepeatMode(0)
                return 'off';
        }
    }

    async skip(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');

        let currentTrack = queue.currentTrack
        const skiped = queue.node.skip();

        if (!skiped || !currentTrack) throw new Error('不能跳過此歌曲......');

        return currentTrack;
    }

    async pause(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');

        let currentTrack = queue.currentTrack || {};
        const paused = queue.node.pause();

        if (!paused && !currentTrack) throw new Error('不能暫停此列隊......');

        return currentTrack;
    }

    async resume(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue) throw new Error('現在沒有正在播放的歌曲');
        if (!queue.node.isPaused()) throw new Error('目前沒有任何列隊被暫停');

        let currentTrack = queue.currentTrack || {};
        const resumed = queue.node.setPaused(false);

        if (!resumed && !currentTrack) throw new Error('不能繼續播放此列隊......');

        return currentTrack;
    }

    async queue(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue) throw new Error('現在沒有正在播放的歌曲');

        let printJson = {}
        printJson.currentTrack = queue.currentTrack || {};
        printJson.tracks = queue.tracks.toArray() || [];
        printJson.totalTime = queue.node.estimatedDuration;
        printJson.repeatMode = queue.repeatMode;

        return printJson;
    }

    async remove(interaction, indexOfSongs) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');

        let removedTrack = queue.removeTrack(queue.tracks.toArray()[indexOfSongs]);

        if (!removedTrack) throw new Error('無法移除此歌曲');
        return removedTrack;
    }

    async clear(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');

        queue.clear();

        return "CLEARED";
    }

    async loop(interaction, type = "TRACK") {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');
        if (queue.node.isPaused()) throw new Error('此列隊已被暫停');

        if (queue.repeatMode === 3) throw new Error('此列隊已開啟 **自動播放** 模式');
        switch (type) {
            case "OFF":
                if (queue.repeatMode === 0) throw new Error('此列隊未開啟 **循環** 模式');
                queue.setRepeatMode(0);
                return 'OFF';
            case "TRACK":
                if (queue.repeatMode === 1) throw new Error('此列隊已開啟 **單曲循環** 模式');
                queue.setRepeatMode(1);
                return 'TRACK';
            case "QUEUE":
                if (queue.repeatMode === 2) throw new Error('此列隊已開啟 **列隊循環** 模式');
                queue.setRepeatMode(2);
                return 'QUEUE';
            case "AUTO":
                let repeatMode = queue.repeatMode;

                if (repeatMode === 2) {
                    queue.setRepeatMode(0)
                    return 'OFF';
                } else {
                    repeatMode++
                    queue.setRepeatMode(repeatMode)
                    return ((repeatMode === 1) ? "TRACK" : "QUEUE");
                }
        }
    }

    async shuffle(interaction) {
        const queue = this.player.queues.get(interaction.guild);

        if (!queue || !queue.isPlaying()) throw new Error('現在沒有正在播放的歌曲');
        if (!queue.tracks.toArray()[0]) throw new Error('列隊已沒有下一首歌曲');

        let shuffled = queue.tracks.shuffle()
        if (!shuffled) throw new Error('無法打亂列隊');
        return shuffled;
    }

    async playlist(interaction, playlistData) {
        let tracks = [];
        let loadTrack = false;
        let errors = [];

        let queue = this.player.queues.get(interaction.guild);
        if (!queue) queue = this.player.queues.create(interaction.guild, {
            leaveOnEmpty: true,
            leaveOnEnd: false,
            leaveOnEmptyCooldown: 10000,
            metadata: interaction.channel,
            selfDeaf: true,
            volume: 150,
        });

        if (!interaction.member.voice.channel.joinable) throw new Error('我加入不了此頻道');

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch (error) {
            throw new Error('我加入不了此頻道');
        }

        if (playlistData["songs"].length <= 5) {
            for (const song of playlistData["songs"]) {
                try {
                    let res = await this.player.search(song.url, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.AUTO
                    });

                    tracks.push(res.tracks[0]);
                } catch (e) {
                    errors.push(e.toString())
                }
            }
        } else {
            loadTrack = true
            for (var i = 0; i < 5; i++) {
                try {
                    let song = playlistData["songs"][i]
                    let res = await this.player.search(song.url, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.AUTO
                    });

                    tracks.push(res.tracks[0]);
                } catch (e) {
                    errors.push(e.toString())
                }
            }

            this.playPlaylist.set(queue.guild.id, {
                loaded: 5,
                songs: playlistData["songs"]
            })
        }

        queue.addTrack(tracks)
        if (!queue.isPlaying()) queue.node.play();
        return tracks;
    }
    /**
     * 
     * @param {Client} bot the client of discord bot
     * @private
     */
    _playerEvents(bot) {
        console.log(this.player.events)
        this.player.events
            .on("audioTrackAdd", (queue, track) => {
                let playlist = this.playPlaylist.get(queue.guild.id);
                if (playlist) return;

                queue.metadata.send({ content: bot.customEmojis['music'] + ' | 已新增 `' + track.title + '` 至列隊!' })
                /*.then(msg =>
                    setTimeout(() => {
                        msg.delete()
                    }, 10000)
                )
                .catch(e => console.error(e));*/
            })
            .on("audioTracksAdd", (queue, tracks) => {
                queue.metadata.send(bot.customEmojis['music'] + ' | 已將歌單中的 `' + tracks.length + '` 首歌添加至列隊!')
                /*.then(msg =>
                    setTimeout(() => {
                        msg.delete()
                    }, 10000)
                )
                .catch(e => console.error(e));*/
            })
            .on("emptyChannel", (queue) => {
                let msg = this.messages.get(queue.guild.id);
                msg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('音樂播放結束了')
                            .setFooter({ text: 'NO.96 音樂系統', iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) })
                            .setColor('Yellow')
                            .setDescription("為什麼不要先把`" + queue.tracks.size + "`首歌聽完再離開我😭")
                    ],
                    components: []
                });

                this.messages.delete(queue.guild.id)
                queue.player.destroy()
                this.player.queues.delete(queue.guild);
                queue.metadata.send('沒人在語音頻道嗎?那...我先閃囉!');
            })
            .on("disconnect", (queue) => {
                let msg = this.messages.get(queue.guild.id);
                msg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('音樂播放結束了')
                            .setFooter({ text: 'NO.96 音樂系統', iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) })
                            .setColor('Yellow')
                            .setDescription("為甚麼要狠心的把我踢出語音房間😢")
                    ],
                    components: []
                });

                this.messages.delete(queue.guild.id)
                queue.player.destroy()
                this.player.queues.delete(queue.guild);
                queue.metadata.send('機器人已被踢出語音房間，請稍後再使用，謝謝。');
            })
            .on("emptyQueue", (queue) => {
                queue.metadata.send('列隊結束了');
            })
            .on("playerStart", async (queue, track) => {
                //首次播放歌曲
                console.log(queue.history.tracks.toArray())
                if (queue.history.tracks.toArray().length === 0 && queue.repeatMode === 0) {
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: '【目前播放】 ' + track.title, iconURL: 'https://i.gifer.com/1RW2.gif', url: track.url })
                        .setThumbnail(track.thumbnail)
                        .setFooter({ text: 'NO.96 音樂系統', iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) })
                        .setColor('Blue')
                        .addFields(
                            { name: '時長', value: track.duration, inline: true },
                            { name: '請求者', value: track.requestedBy.tag, inline: true }
                        );
                    let msg = await queue.metadata.send({
                        embeds: [embed], components: [
                            {
                                type: 1,
                                components: [
                                    { emoji: '⏸️', style: 2, type: 2, custom_id: 'MUSIC_PASUE' },
                                    { emoji: '⏭️', style: 2, type: 2, custom_id: 'MUSIC_SKIP' },
                                    { emoji: '🔁', style: 2, type: 2, custom_id: 'MUSIC_QUEUELOOP' },
                                    { emoji: '🔥', style: 2, type: 2, custom_id: 'MUSIC_AUTOPLAY' },
                                    { emoji: '💤', style: 2, type: 2, custom_id: 'MUSIC_DISCONNECT' }
                                ]
                            }
                        ]
                    })
                    this.messages.set(queue.guild.id, msg);
                } else {
                    let msg = this.messages.get(queue.guild.id);

                    msg.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: ((queue.repeatMode === 0) ? '【目前播放】 ' : ((queue.repeatMode === 1) ? '【單曲循環】 ' : ((queue.repeatMode === 2) ? '【列隊循環】 ' : '【自動播放】 '))) + track.title, iconURL: 'https://i.gifer.com/1RW2.gif', url: track.url })
                                .setThumbnail(track.thumbnail)
                                .setFooter({ text: 'NO.96 音樂系統', iconURL: bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }) })
                                .setColor('Blue')
                                .addFields(
                                    { name: '時長', value: track.duration, inline: true },
                                    { name: '請求者', value: track.requestedBy.tag, inline: true }
                                )
                        ]
                    })
                }
            })
            .on("playerFinish", async (queue, track) => {
                let playPlaylist = this.playPlaylist.get(queue.guild.id);
                if (!playPlaylist) return;
                if (queue.repeatMode === 1 || queue.repeatMode === 2) return;

                let songs = playPlaylist["songs"]
                if (songs.length === playPlaylist["loaded"]) return this.playPlaylist.delete(queue.guild.id);

                let res = await this.player.search(songs[playPlaylist["loaded"]]["url"], {
                    requestedBy: track.requestedBy,
                    searchEngine: QueryType.AUTO
                });
                queue.addTrack(res.tracks[0])
                this.playPlaylist.set(queue.guild.id, {
                    loaded: Number(playPlaylist["loaded"]) + 1,
                    songs
                })
            })
            .on("playerError", (queue, error) => {
                console.error(`Error emitted from the connection ${error.message}`);
            })
            .on("error", (queue, error) => {
                console.error(`Error emitted from the queue ${error.message}`);
            })
            .on("debug", (queue, message) => {
                bot.processLogger.debug(queue.id + " | " + message)
            })
        this.player
            .on('error', (queue, error) => {
                console.error(`Error emitted from the queue ${error.message}`);
            })
            .on('connectionError', (queue, error) => {
                console.error(`Error emitted from the connection ${error.message}`);
            })
    }
    /**
     * 
     * @param {Client} bot the client of discord bot
     * @private
     */
    _buttonInteraction(bot) {
        bot.on("interactionCreate", async (interaction) => {
            if (!interaction.isButton()) return;
            if (!interaction.customId.startsWith("MUSIC_")) return;

            let sentMessage = this.messages.get(interaction.guild.id);
            if (!sentMessage) return;
            if (sentMessage.id !== interaction.message.id) return;

            switch (interaction.customId) {
                case 'MUSIC_PASUE'://暫停，要變按鈕(繼續)
                    this.pause(interaction)
                        .then(async () => {
                            messageTimer(interaction, bot.customEmojis.true + ' | 停止播放歌曲!', [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_PASUE', true, { emoji: '▶️', style: 2, type: 2, custom_id: 'MUSIC_RESUME' })
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_RESUME'://繼續，要變按鈕(暫停)
                    this.resume(interaction)
                        .then(async () => {
                            messageTimer(interaction, bot.customEmojis.true + ' | 繼續播放歌曲!', [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_RESUME', true, { emoji: '⏸️', style: 2, type: 2, custom_id: 'MUSIC_PASUE' })
                                ]
                            });
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_SKIP'://跳過
                    this.skip(interaction)
                        .then(async (track) => {
                            messageTimer(interaction, bot.customEmojis.true + ' | 成功跳過  `' + track.title + '` !', [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_SKIP', false)
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('ReferenceError: ', '').replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_QUEUELOOP'://列隊循環，要變按鈕(單曲循環)
                    this.loop(interaction, "QUEUE")
                        .then(async (autoplay) => {
                            messageTimer(interaction, bot.customEmojis.true + ' | ' + ((autoplay === 'TRACK') ? '成功開啟 **單曲循環** 模式!' : ((autoplay === 'QUEUE') ? '成功開啟 **列隊循環** 模式!' : '成功關閉 **循環** 模式!')), [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_QUEUELOOP', true, { emoji: '🔂', style: 2, type: 2, custom_id: 'MUSIC_TRACKLOOP' })
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_TRACKLOOP'://單曲循環，要變按鈕(關閉循環)
                    this.loop(interaction, "TRACK")
                        .then(async (autoplay) => {
                            messageTimer(interaction, bot.customEmojis.true + ' | ' + ((autoplay === 'TRACK') ? '成功開啟 **單曲循環** 模式!' : ((autoplay === 'QUEUE') ? '成功開啟 **列隊循環** 模式!' : '成功關閉 **循環** 模式!')), [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_TRACKLOOP', true, { emoji: '🚫', style: 2, type: 2, custom_id: 'MUSIC_DISABLELOOP' })
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_DISABLELOOP'://關閉循環，要變按鈕(列隊循環)
                    this.loop(interaction, "OFF")
                        .then(async (autoplay) => {
                            messageTimer(interaction, bot.customEmojis.true + ' | ' + ((autoplay === 'TRACK') ? '成功開啟 **單曲循環** 模式!' : ((autoplay === 'QUEUE') ? '成功開啟 **列隊循環** 模式!' : '成功關閉 **循環** 模式!')), [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_DISABLELOOP', true, { emoji: '🔁', style: 2, type: 2, custom_id: 'MUSIC_QUEUELOOP' })
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_DISCONNECT'://離開
                    //this.player.queues.get(interaction.guild).player.destroy();
                    messageTimer(interaction, bot.customEmojis.true + ' | 成功讓機器人中斷連接', [], [], 25000)

                    interaction.message.edit({
                        components: []
                    });
                    break;

                case 'MUSIC_AUTOPLAY'://自動播放，要變按鈕(關閉自動播放)
                    this.autoplay(interaction)
                        .then(async (autoplay) => {
                            messageTimer(interaction, bot.customEmojis.true + ' | ' + ((autoplay === 'on') ? '成功開啟自動播放!' : '成功關閉自動播放!'), [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_AUTOPLAY', true, { emoji: '💧', style: 2, type: 2, custom_id: 'MUSIC_DISABLEAUTOPLAY' })
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;

                case 'MUSIC_DISABLEAUTOPLAY'://關閉自動播放(自動播放)
                    this.autoplay(interaction)
                        .then(async (autoplay) => {
                            messageTimer(interaction, bot.customEmojis.true + ' | ' + ((autoplay === 'on') ? '成功開啟自動播放!' : '成功關閉自動播放!'), [], [], 25000)

                            interaction.message.edit({
                                components: [
                                    componentsChanger(interaction, 'MUSIC_DISABLEAUTOPLAY', true, { emoji: '🔥', style: 2, type: 2, custom_id: 'MUSIC_AUTOPLAY' })
                                ]
                            })
                        })
                        .catch(e => interaction.reply({ content: bot.customEmojis.false + ' | ' + e.toString().replace('Error: ', ''), ephemeral: true }))
                    break;
            }
        })
    }
}
/**
 * 
 * @param {ButtonInteraction} interaction 
 */
function componentsChanger(interaction, customId, changeOrNot = false, change) {
    let components = interaction.message.components[0].components || [];
    if (components.length === 0) return;

    if (!changeOrNot) return interaction.message.components[0];

    let button = components.find(data => data.customId === customId) || {}
    if (!button) return;

    components[components.indexOf(button)].data = change
    components = components.map(data => data.data)
    return {
        type: 1,
        components
    };
}

/**
 * 
 * @param {ButtonInteraction} interaction 
 * @param {String} content 
 * @param {Array} embeds 
 * @param {Array} components 
 */
async function messageTimer(interaction, content, embeds, components, time = 25000) {
    let json = {}
    if (content) json.content = content;
    if (embeds.length) json.embeds = embeds;
    if (components.length) json.components = components;
    if (!json) return;
    json.fetchReply = true;
    interaction.reply(json).then(msg => {
        setTimeout(() => {
            msg.delete()
        }, time)
    }).catch(e => console.error(e))
}

module.exports = musicCore;