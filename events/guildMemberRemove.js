
module.exports = async (bot, member, type = "memberLeft") => {
  var gdb = bot.guildDB.get(member.guild.id) || {}
  if (!gdb) return;
  var leave = gdb.leave || {}
  if (!leave) return;
  if (!leave.enable) return;
  var message = leave.message
  var channel = leave.channel
  if (!member.guild.channels.cache.get(channel)) return;
  var channel = member.guild.channels.cache.get(channel)

  try {
    channel.send({ content: replacer(message, member) })
  } catch (e) {
    throw e
  }
}

function replacer(string, member) {
  return string
    .replace(/{userTag}/g, member.user.tag)
    .replace(/{userName}/g, member.user.username)
    .replace(/{userID}/g, member.user.id)
    .replace(/{guildName}/g, member.guild.name)
    .replace(/{guildMemberCount}/g, member.guild.memberCount);
}