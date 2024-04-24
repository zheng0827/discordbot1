const { EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction, ButtonInteraction, SelectMenuInteraction, PermissionFlagsBits, codeBlock } = require('discord.js');
const { Ticket, I18n, HandleInteraction } = require("../utils/loadLibs");

const ms = require("ms");
/**
 * 
 * @param {*} bot 
 * @param {ChatInputCommandInteraction | AutocompleteInteraction | ButtonInteraction | SelectMenuInteraction} interaction 
 * @returns 
 */
module.exports = async (bot, interaction) => {
    const interactionHandler = new HandleInteraction(bot, interaction);

    if (interaction.isAutocomplete()) {
        let command = bot.commands.get(interaction.commandName);

        if (!command) return;
        if (!command.autocomplete) return;

        command.autocomplete(bot, interaction, interaction.options.getFocused(true))
    }

    if (interaction.isButton()) {
        if (interaction.customId.startsWith("TICKET")) {
            new Ticket(bot, interaction)
        }

        if (interaction.customId.startsWith("INFORMATION")) interactionHandler.button("INFORMATION");
    }

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId.startsWith("ROLEMENU")) interactionHandler.stringSelectMeun("ROLEMENU");
    }

    //slash command
    if (interaction.isChatInputCommand()) {
        if (!interaction.guild) return; //若是在在私人頻道發送訊息時，不回應

        if (interaction.user.bot) return; //若發送訊息的用戶是機器人時，不回應

        let guildDB = bot.guildDB.get(interaction.guild.id) || {} //得到伺服器設定
        let userDB = bot.guildDB.get(interaction.guild.id) || {} //得到用戶設定

        let language = userDB.language ? userDB.language : interaction.locale;
        if (!I18n.languageList().includes(language)) language = 'zh-TW';

        const cmd = interaction.commandName

        let command = bot.commands.get(cmd);
        if (!command) return;

        let permissionsChecker = interaction.channel.members.get(bot.user.id)
        if (!permissionsChecker) return;
        if (!permissionsChecker.permissions.has("SendMessages")) return;


        bot.i18n = new I18n(language, cmd)

        try {
            command.run(bot, interaction, interaction.options)
        } catch (e) {
            bot.botLogger.warn(`發生錯誤, 在執行指令 ${cmd} 的時候發生錯誤!!!`)
            bot.botLogger.notice('該錯誤不會影響機器人進程!')
            bot.botLogger.showErr(e)
        }
    }
};