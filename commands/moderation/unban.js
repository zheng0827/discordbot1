const { SlashCommand, RolePositionChecker } = require("../../utils/loadLibs")
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

let command = new SlashCommand()
    .setName("unban")
    .setDescription("解除封鎖用戶")
    .setCategory("伺服器管理")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator)
    .addStringOption(option => option.setName("用戶").setDescription("請輸入用戶名字、id或tag").setRequired(true).setAutocomplete(true))
    .addStringOption(option => option.setName("原因").setDescription("為什麼要解除這個用戶的封鎖?").setRequired(false))
    .setAutocompleteRespond(async (bot, interaction, focused) => {
        if (focused.name === "用戶") {
            let respond = (await interaction.guild.bans.fetch({ cache: false })).filter(GuildBan => GuildBan.user.id.includes(focused.value) || GuildBan.user.tag.includes(focused.value) || GuildBan.user.username.includes(focused.value)).toJSON();
            respond = respond.map(GuildBan => GuildBan.user)
            if (respond.length >= 25) respond = respond.slice(0, 24);
            interaction.respond(respond.map(user => ({ name: user.tag, value: user.id })))
        }
    })
    .setRun(async (bot, interaction, options) => {
        //Autocomplete選出來的用戶ID
        let userID = options.getString("用戶");

        //獲取機器人快取的到的
        let user = bot.users.cache.get(userID);
        //如果沒有獲取機器人快取的到的則用fetch來抓
        if (!user) user = await bot.users.fetch(userID);

        await interaction.deferReply({ fetchReply: true });
        interaction.guild.bans.remove(user, interaction.user.tag + " 使用unban指令解除封鎖此用戶，他给的原因是: " + (options.getString("原因") ?? "未提供原因"))
            .then(banedUser => {
                interaction.editReply({
                    embeds: [
                        {
                            author: {
                                name: banedUser.tag,
                                icon_url: banedUser.avatarURL({ size: 4096 })
                            },
                            description:"開心開心，快去通知他/她這個好消息吧!" + (options.getString("原因") ? "\n\n原因: `" + options.getString("原因") + "`" : ''),
                            footer: {
                                text: interaction.user.tag + " 大發慈悲!",
                                icon_url: interaction.user.displayAvatarURL({ size: 4096 })
                            },
                            color:Number("0x2f3136")
                        }
                    ]
                });
            })
            .catch(error => {
                interaction.editReply({ ephemeral: true, content: bot.customEmojis.false + " |  很抱歉，發生了一個錯誤```\n" + error.toString() + "```" })
                console.error("\n[Ban指令]" + interaction.guild.name + " | " + interaction.guild.id + "\n" + error)
            });
    })

module.exports = command;