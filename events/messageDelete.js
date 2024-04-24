module.exports = async (bot, message) => {
    if (!message.guild) return; //若是在在私人頻道發送訊息時，不回應

    let data = {}
    let content = ""
    let embeds = []
    let attachment = ""
    let timestamp = 0
    let author = ""

    if (message.content) content = message.content;
    if (message.embeds) embeds = message.embeds;
    if (message.attachments.first()) attachment = message.attachments.first();

    if (!message.author) return;

    author = message.author

    timestamp = message.createdTimestamp

    data = { content, embeds, attachment, timestamp, author }

    bot.db.set(`message_delete_${message.guild.id}_${author.id}`, data)
    bot.db.set(`message_delete_${message.guild.id}_${message.channel.id}`, data)
}