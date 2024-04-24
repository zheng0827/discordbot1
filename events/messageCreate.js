const { EmbedBuilder } = require('discord.js');
const fs = require('fs');


module.exports = async (bot, message) => {
    if (!message.guild) return; //若是在在私人頻道發送訊息時，不回應

    if (message.author.bot) return; //若發送訊息的用戶是機器人時，不回應

    let prefix = bot.config.prefix //設置前綴

    if (!message.content.startsWith(prefix)) return; //檢測訊息是否以前綴為頭

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;
    if (cmd !== "eval") return;
    if (message.author.id !== bot.config["ownerID"]) return;
    let { guild, channel } = message;

    await message.delete()
    let evaled
    try {
        evaled = await eval(args.join(" "))
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('測試成功!')
                    .setFields(
                        { name: '**執行代碼:**', value: "```js\n" + args.join(" ") + "```" },
                        { name: '**輸出:**', value: "```" + evaled + "```" }
                    )
                    .setColor("Blue")
                    .setFooter({ text: '10秒後刪除' })
            ]
        }).then(m =>
            setTimeout(() => {
                m.delete()
            }, 10000)
        )
    } catch (e) {
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('測試失敗!')
                    .setFields(
                        { name: '**執行代碼:**', value: "```js\n" + args.join(" ") + "```" },
                        { name: '**輸出:**', value: "```" + e.toString() + "```" }
                    )
                    .setColor("Red")
                    .setFooter({ text: '10秒後刪除' })
            ]
        }).then(m =>
            setTimeout(() => {
                m.delete()
            }, 10000)
        )
    };
}