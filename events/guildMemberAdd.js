module.exports = async (bot, member, type = "memberJoined") => {

  var gdb = bot.guildDB.get(member.guild.id) || {}
  if (!gdb) return;

  var auto_role = gdb.auto_role || {}
  if (auto_role) {
    if (auto_role.status === "disable") return;
    var roles = auto_role.roles || []
    roles.forEach(role => {
      if (member.guild.roles.cache.get(role)) {
        if (member.appPermissions.has("ManageRoles")) {
          member.roles.add(role, "加入自動給予身分")
        }
      }
    })
  }

  let welcome = gdb.welcome || {}
  if (welcome || type === "test") {
    if (!welcome.enable) return;
    let message = welcome.message;
    let channel = welcome.channel;

    if (!member.guild.channels.cache.get(channel)) return;
    channel = member.guild.channels.cache.get(channel)
    if (!message) return;
    try {
      channel.send({ content: replacer(message,member) })
    } catch (e) {
      console.log(e)
      channel.send({ content: '發生了一個錯誤' })
    }
  }
}

function replacer(string,member) {
  return string
    .replace(/{userTag}/g, member.user.tag)
    .replace(/{userName}/g, member.user.username)
    .replace(/{userID}/g, member.user.id)
    .replace(/{userMention}/g, "<@" + member.user.id + ">")
    .replace(/{guildName}/g, member.guild.name)
    .replace(/{guildMemberCount}/g, member.guild.memberCount);
}

