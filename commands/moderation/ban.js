const { SlashCommand, RolePositionChecker } = require("../../utils/loadLibs")
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

let command = new SlashCommand()
    .setName("ban")
    .setDescription("封鎖用戶")
    .setCategory("伺服器管理")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator)
    .addStringOption(option => option.setName("用戶").setDescription("請輸入用戶名字、id或tag").setRequired(true).setAutocomplete(true))
    .addIntegerOption(option => option.setName("刪除訊息").setDescription("要刪除幾天內此用戶的訊息?(至多7天)").setRequired(false))
    .addStringOption(option => option.setName("原因").setDescription("為什麼要封鎖這個用戶?").setRequired(false))
    .setAutocompleteRespond(async (bot, interaction, focused) => {
        if (focused.name === "用戶") {
            let respond = interaction.guild.members.cache.filter(member => member.user.id.includes(focused.value) || member.user.tag.includes(focused.value) || member.user.username.includes(focused.value)).toJSON();
            if (respond.length !== 0) respond = respond.map(member => member.user);
            if (respond.length === 0) respond = bot.users.cache.filter(user => user.id.includes(focused.value) || user.tag.includes(focused.value) || user.username.includes(focused.value)).toJSON();
            if (respond.length >= 25) respond = respond.slice(0, 24);

            if (respond.length === 0) {
                bot.users.fetch(focused.value, { cache: false, force: true })
                    .then(user => interaction.respond([{ name: user.tag, value: user.id }]))
                    .catch(reason => interaction.respond([]))
            } else interaction.respond(respond.map(user => ({ name: user.tag, value: user.id })))
        }
    })
    .setRun(async (bot, interaction, options) => {
        //Autocomplete選出來的用戶ID
        let userID = options.getString("用戶");
        if (interaction.guild.bans.cache.get(userID)) interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 此用戶已被封鎖." });

        //如果userID是機器人ID的話
        if (userID === bot.user.id) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 我不能封鎖我自已." });
        //如果userID是執行指令者ID的話
        if (userID === interaction.user.id) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 你為啥要封鎖我自已." });

        //獲取到群組內的用戶(user是GuildMember)
        let user = interaction.guild.members.cache.get(userID);

        //如果有獲取到群組內的用戶但封鎖不了
        if (user && !user.bannable) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 我封鎖不了此成員." });
        //如果有獲取到群組內的用戶但執行指令者身分低於用戶
        if (user && !RolePositionChecker.member(interaction.member, user)) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 你封鎖不了此成員." });

        //如果有獲取到群組內的用戶且都沒任何權限問題(user是User)
        if (user) user = user.user;
        //如果沒有獲取到群組內的用戶則獲取機器人快取的到的(user是User)
        if (!user) user = bot.users.cache.get(userID);
        //如果沒有獲取機器人快取的到的則用fetch來抓(user是User)
        if (!user) user = await bot.users.fetch(userID);

        //開始Ban人
        let deleteMessageDays = options.getInteger("刪除訊息") || 0;

        if (deleteMessageDays < 0) deleteMessageDays = 0;
        if (deleteMessageDays > 7) deleteMessageDays = 7;
        let deleteMessageSeconds = deleteMessageDays * 84600;
        await interaction.deferReply({ fetchReply: true });

        interaction.guild.bans.create(user, {
            reason: interaction.user.tag + " 使用ban指令封鎖此用戶，他给的原因是: " + (options.getString("原因") ?? "未提供原因"),
            deleteMessageSeconds
        })
            .then(banedUser => {
                interaction.editReply({
                    embeds: [
                        {
                            author: {
                                name: banedUser.tag,
                                icon_url: banedUser.avatarURL({ size: 4096 })
                            },
                            description:"哀呀! 又有用戶被封鎖了... 😕" + (options.getString("原因") ? "\n\n原因: `" + options.getString("原因") + "`" : ''),
                            footer: {
                                text: "被 " + interaction.user.tag + " 封鎖.",
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