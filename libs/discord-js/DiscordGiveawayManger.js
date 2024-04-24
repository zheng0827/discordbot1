const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { EmbedBuilder, TextChannel, User, ActionRow, Client } = require("discord.js");
const fs = require("fs");
/**
 * this.reroll()
 */
class DiscordGiveawayManger {

    constructor(bot, options = {
        emoji: '🎉',
        botCanWin: false,
        path: 'config/JsonFiles/giveaway.json'
    }) {
        this.bot = bot;
        this.emoji = options["emoji"];
        this.botCanWin = options["botCanWin"];
        this.path = options["path"];

        bot.once('ready', () => {
            let file = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
            file.filter(data => !data.ended).forEach(data => {
                try {
                    this._start(data["giveawayID"])
                    bot.botLogger.ok(`載入抽獎資料成功! - ${data.prize} | ${data.guildID} | ${data.messageID}`)
                } catch (e) {
                    bot.botLogger.error(`載入抽獎資料失敗! - ${data.prize}\n` + e)
                }
            })

            this._onInteractionCreate(bot)
        })
    }

    /**
     * When someone click the button.
     * 
     * @param {Client} bot
     * @private
     */
    _onInteractionCreate(bot) {
        bot.on('interactionCreate', async (inter) => {
            if (inter.isButton() && inter.customId.startsWith("GIVEAWAY")) {
                let giveawayID = inter.customId.split('_')[1]; //["GIVEAWAY"_"GIVEAWAYID"]
                let file = JSON.parse(fs.readFileSync(this.path, 'utf-8')) || [];
                let giveawayData = file.find(data => data.giveawayID === giveawayID)
                if (giveawayData["participants"].includes(inter.user.id)) return inter.reply({
                    content: bot.customEmojis.false + " | 你已有參與此抽獎",
                    ephemeral: true
                });
                giveawayData["participants"].push(inter.user.id)

                file[file.indexOf(giveawayData)] = giveawayData;
                fs.writeFileSync(this.path, JSON.stringify(file, null, 2), 'utf-8')
                inter.reply({
                    content: bot.customEmojis.true + " | 已參與此抽獎",
                    ephemeral: true
                });
            }
        })
    }

    /**
     * To save the data of giveaway.
     * 
     * @param {JSON} data 
     * @private
     */
    _saveData(data) {
        let file = JSON.parse(fs.readFileSync(this.path, 'utf-8')) || [];

        file.push(data);
        fs.writeFileSync(this.path, JSON.stringify(file, null, 2), 'utf-8');
    }

    /**
     * Get the data of giveaway by giveawayID.
     * 
     * @param {*} giveawayID The id of giveaway.
     */
    getData(giveawayID) {
        let file = JSON.parse(fs.readFileSync(this.path, 'utf-8')) || [];
        let giveawayData = file;
        if (giveawayID) giveawayData = file.find(data => data.giveawayID === giveawayID) || {};

        return giveawayData;
    }

    /**
     * Get the ids of saved data of giveaway. 
     * 
     * @param {JSON} data 
     * @private
     */
    _getIDs() {
        let file = JSON.parse(fs.readFileSync(this.path, 'utf-8')) || [];

        return file.map(data => data.giveawayID);
    }

    /**
     * 
     * @param {TextChannel} channel
     * @param {JSON} options
     * 
     * @example
     *
     * create(interaction.channel, {
            prize: "zheng0827 的愛",//設定獎品
            winnerCount: 1,//設定贏家數
            duration: 6400000,//設定時間為一小時(ms)
            eligibility: null,//參與規則(還未規劃)
            hostBy: interaction.user,
            messages: {//此Object為設定訊息用的
                start: "**🎉 抽獎開始 🎉**",
                end: "**🎉 抽獎結束 🎉**",
                embedColor: 'Red',
                hostBy: '👑 發起者：'
            }
        });
     */
    async create(channel, options = {
        prize: "zheng0827 的愛",//設定獎品
        winnerCount: 1,//設定贏家數
        duration: 6400000,//設定時間為一小時(ms)
        eligibility: null,//參與規則(還未規劃)
        hostBy: interaction.user
    }) {
        if (!channel.viewable) throw new Error('cannotViewChannel');
        let { prize, winnerCount, duration, eligibility, hostBy } = options
        let messages = {//此Object為設定訊息用的
            start: "**🎉 抽獎開始 🎉**",
            end: "**🎉 抽獎結束 🎉**",
            embedColor: 'Red',
            hostBy: '👑 發起者：'
        }
        let createdTimestamp = Date.now();
        let endTimestamp = createdTimestamp + duration;

        let newID = () => {
            let newID = '';
            let numbers = "0123456789";
            for (var i = 0; i < 16; i++) {
                newID += numbers.charAt(Math.random() * numbers.length);
            }
            return newID;
        }
        let giveawayID = newID();

        for (var i = 0; this._getIDs().includes(giveawayID); i++) {
            console.log(giveawayID);
            giveawayID = newID();
        }
        try {
            let message = await channel.send({
                content: messages["start"],
                embeds: [
                    new EmbedBuilder()
                        .setTitle(prize)
                        .setColor(messages["embedColor"])
                        .setDescription(
                            (eligibility ? description[eligibility] : '點擊 🎉 即可參與此抽獎\n') + "⏰ 時間：<t:" + Math.floor((endTimestamp / 1000)) + ":F>(<t:" + Math.floor((endTimestamp / 1000)) + ":R>)\n" + messages["hostBy"] + "<@" + hostBy.id + ">"
                        )
                ],
                components: [{
                    type: 1, components: [{ type: 2, label: this.emoji, style: 1, custom_id: "GIVEAWAY_" + giveawayID }]
                }]
            });

            let data = {
                giveawayID,
                prize,
                winnerCount,
                eligibility,
                ended: false,
                hostBy: hostBy.id,
                channelID: channel.id,
                guildID: channel.guild.id,
                messageID: message.id,
                duration,
                createdTimestamp,
                endTimestamp,
                messages,
                winners: [],
                participants: [],
                rerolled: []
            };
            this._saveData(data);

            this._start(giveawayID);
            return data;
        } catch (e) {
            throw new Error(e.toString())
        }
    }

    async end(giveawayID) {
        let giveawayData = this.getData(giveawayID) || {};
        if (!giveawayData) throw new Error('cannotFindData');

        return this._lottery(giveawayID, false);
    }

    async reroll(giveawayID) {
        let giveawayData = this.getData(giveawayID) || {};
        if (!giveawayData) throw new Error('cannotFindData');

        return this._lottery(giveawayID, true);
    }
    /**
     * To set timeout of specify giveaway.
     * 
     * @param {*} giveawayID The id of giveaway.
     * @private 
     */
    _start(giveawayID) {
        let file = JSON.parse(fs.readFileSync(this.path, 'utf-8')) || [];
        let giveawayData = file.find(data => data.giveawayID === giveawayID) || {};

        if (!giveawayData) throw new Error('找不到ID為' + giveawayID + '的抽獎資料');
        if (giveawayID.ended) return;

        let nowTimestamp = Date.now();
        let remain = giveawayData["endTimestamp"] - nowTimestamp;
        let remainDays = Math.floor(remain / 86400000);

        if (remainDays <= 5) {

            setTimeout(() => {
                this._lottery(giveawayID, false)
            }, remain)

        } else {

            let remainTimestamp = remain - (remainDays * 86400000)
            setTimeout(() => {
                setDaysTimeout(() => {
                    this._lottery(giveawayID, false)
                }, remainDays)
            }, remainTimestamp)

        }
    }

    /**
     * 
     * @param {*} giveawayID The id of giveaway.
     * @param {Boolean} reroll 
     * 
     * @private 
     */
    async _lottery(giveawayID, reroll = false) {
        try {
            let file = JSON.parse(fs.readFileSync(this.path, 'utf-8')) || [];
            let giveawayData = file.find(data => data.giveawayID === giveawayID) || [];

            if (!giveawayData) throw new Error('找不到ID為' + giveawayID + '的抽獎資料');
            if (!reroll && giveawayData.ended) return;

            let indexOfData = file.indexOf(giveawayData);
            let winners = giveawayData["winners"] || [];
            let participants = giveawayData["participants"] || [];
            let winnerCount = giveawayData["winnerCount"]
            if (participants.length === 0) {
                giveawayData["ended"] = true;
                giveawayData["winners"] = [];

                file[indexOfData] = giveawayData;
                fs.writeFileSync(this.path, JSON.stringify(file, null, 2), 'utf-8');

                return this._sendMessage(giveawayData, { type: 2 });
            }
            if (this.botCanWin) participants.push(this.bot.user.id);

            if (!reroll) {
                /**
                 * 解釋一下for loop的規則:
                 * 先定義i(迴圈次數)為0
                 * 如果 (贏家數 小於等於 參與者數量)且(迴圈次數(i) 小於 贏家數) 時，執行上面的。
                 * 如果 (贏家數 大於 參與者數量)且(迴圈次數(i) 小於 參與者數量) 時，執行下面的。
                 */
                for (var i = 0; winnerCount <= participants.length && i < winnerCount; i++) {
                    let winner = participants[getRandomInt(participants.length)];
                    participants = participants.filter(userID => userID !== winner);

                    winners.push(winner);
                }
                for (var i = 0; winnerCount > participants.length && i < participants.length; i++) {
                    let winner = participants[getRandomInt(participants.length)];
                    participants = participants.filter(userID => userID !== winner);

                    winners.push(winner);
                }

                giveawayData["ended"] = true;
                giveawayData["winners"] = winners;

                file[indexOfData] = giveawayData;
                fs.writeFileSync(this.path, JSON.stringify(file, null, 2), 'utf-8')

                this._sendMessage(giveawayData, { type: (winnerCount <= giveawayData["participants"].length) ? 0 : 1 });
            } else {
                let rerolledWinners = giveawayData["rerolled"] || [];
                let mergeWinners = winners.concat(rerolledWinners);

                let winner = participants[getRandomInt(participants.length)];
                /**
                 * 把所有原本的贏家從參與者列表移除
                 */
                for (const userid of mergeWinners) {
                    participants.filter(userID => userID !== userid)
                }
                if (participants.length !== 0) winner = participants[getRandomInt(participants.length)];

                giveawayData["rerolled"].push(winner);
                file[indexOfData] = giveawayData;
                fs.writeFileSync(this.path, JSON.stringify(file, null, 2), 'utf-8');

                this._sendMessage(giveawayData, { type: 3 });
            }

        } catch (error) {
            throw new Error(error.toString());
        }
    }
    /**
     * 
     * @param {Object} giveawayData 抽獎資料
     * @private
     */
    async _sendMessage(giveawayData, {
        type = 0,//0 for '全數抽出',1 for '人數不足',2 for '沒人參加',3 for '重抽'
    }) {
        let embed = new EmbedBuilder()
            .setTitle(giveawayData["prize"])
            .setTimestamp()
            .setColor(giveawayData["messages"]["embedColor"]);
        let content;
        switch (type) {
            case 0:
                content = "🥳 恭喜 " + giveawayData["winners"].map(userID => "<@" + userID + ">").join(" , ") + " !贏得了 `" + giveawayData["prize"] + "` !";
                embed.setDescription("🎖️贏家: " + giveawayData["winners"].map(userID => "<@" + userID + ">").join(" , ") + "\n👑 發起者: <@" + giveawayData["hostBy"] + ">");
                break;
            case 1:
                content = "🥳 恭喜 " + giveawayData["winners"].map(userID => "<@" + userID + ">").join(" , ") + " !贏得了 `" + giveawayData["prize"] + "` !\n\n此次抽獎可真是名副其實的人人有獎啊!";
                embed.setDescription("🎖️贏家: " + giveawayData["winners"].map(userID => "<@" + userID + ">").join(" , ") + "\n👑 發起者: <@" + giveawayData["hostBy"] + ">");
                break;
            case 2:
                content = "😭 此抽獎沒有贏家!"
                embed.setDescription("😭 此抽獎沒有贏家\n👑 發起者: <@" + giveawayData["hostBy"] + ">");
                break;
            case 3:
                content = "🥳 恭喜! 新的贏家為 " + giveawayData["winners"].map(userID => "<@" + userID + ">").join(" , ") + " !";
                break;
        }
        let channel = await this.bot.channels.cache.get(giveawayData["channelID"]);
        if (!channel) throw new Error('找不到抽獎ID為 ' + giveawayData["giveawayID"] + ' 的抽獎頻道!');
        let message = await channel.messages.fetch(giveawayData["messageID"]);
        if (!message) throw new Error('找不到抽獎ID為 ' + giveawayData["giveawayID"] + ' 的抽獎訊息!');

        try {
            await channel.send({
                content, components: [{
                    type: 1, components: [{ type: 2, label: "點我傳送!", style: 5, url: "https://discord.com/channels/" + channel.guild.id + "/" + channel.id + "/" + message.id }]
                }]
            })
            if (type !== 3) await message.edit({ content: giveawayData["messages"]["end"], embeds: [embed], components: [] });
        } catch (error) {
            throw new Error(error.toString());
        }
    }
}

function setDaysTimeout(callback, days) {
    let dayCount = 0;
    let timer = setInterval(function () {
        dayCount++;
        if (dayCount === days) {
            clearInterval(timer);
            callback.apply(this, []);
        }
    }, 86400000);
}
//得到隨機數
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
};

module.exports = DiscordGiveawayManger