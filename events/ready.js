const { EmbedBuilder } = require("discord.js")
const fs = require("fs")

module.exports = async (bot) => {
  //載入控制面板
  if (bot.config.dashboard.enable) {
    require("../dashboard/index")(bot)
  }
  //載入機器人狀態
  require("../utils/loadBotPresence")(bot)
  
  bot.botLogger.ok(`已經登入進 ${bot.user.tag} 了!`)
};

/** 
 * 經濟指令所需
 * 代碼:
  let array = bot.db.get("cooldowns") || []
  array.forEach(name => {
    if (!name) return;
    let indexof = array.indexOf(name)

    setTimeout(() => {
      bot.db.delete(`cooldowns.${indexof}`)
      bot.db.delete(`${name}`)
    }, bot.db.get(`${name}`) - Date.now())
  })
*/
