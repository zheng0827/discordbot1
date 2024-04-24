const { SlashCommand } = require("../../utils/loadLibs")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } = require('discord.js')

let command = new SlashCommand()
    .setName("warn")
    .setDescription("警告系統")
    .setCategory("伺服器管理")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subCommand => subCommand
        .setName("add")
        .setDescription("警告成員")
        .addUserOption(option => option.setName("成員").setDescription("你要警告哪位成員?").setRequired(true))
        .addStringOption(option => option.setName("原因").setDescription("為甚麼要警告他?").setRequired(true))
    )
    .addSubcommand(subCommand => subCommand
        .setName("remove")
        .setDescription("移除成員的警告")
        .addUserOption(option => option.setName("成員").setDescription("你要移除哪位成員的警告?").setRequired(true))
        .addStringOption(option => option.setName("警告").setDescription("要移除他哪個警告?").setRequired(true))
        .addStringOption(option => option.setName("原因").setDescription("為甚麼要移除他的警告?").setRequired(false))
    )
    .addSubcommand(subCommand => subCommand
        .setName("check")
        .setDescription("查看成員的警告")
        .addUserOption(option => option.setName("成員").setDescription("要查看哪位成員的警告?").setRequired(false))
    )
    .setRun(async (bot, interaction, options) => {
        let user, userDB, warnDB, warns;

        switch (options.getSubcommand(true)) {
            case 'add':
                if (!interaction.member.permissions.has("Administrator")) interaction.reply({ content: bot.customEmojis.false + " | 你缺少 `管理員` 的權限", fetchReply: true });
                user = options.getUser("成員")

                userDB = bot.userDB.get(user.id) || {};
                warnDB = userDB.warns || {};
                warns = warnDB[interaction.guild.id] || [];
                let reason = options.getString("原因") || "未提供";
                warns.push({
                    warner: interaction.user.id,
                    reason,
                    removed: false
                })
                warnDB[interaction.guild.id] = warns;
                userDB.warns = warnDB
                bot.userDB.set(user.id, userDB)
                interaction.reply({content:" | <@" + user.tag + "> 已被" + interaction.user.tag + "警告!\n原因: " + reason})
                break;
            case 'remove':
                if (!interaction.member.permissions.has("Administrator")) interaction.reply({ content: bot.customEmojis.false + " | 你缺少 `管理員` 的權限", fetchReply: true });
                user = options.getUser("成員")

                userDB = bot.userDB.get(user.id) || {};
                warnDB = userDB.warns || {};
                warns = warnDB[interaction.guild.id] || [];
                if (warns.length === 0) return interaction.reply({ content: bot.customEmojis.false + " | 此成員未有任何警告!", fetchReply: true });
                
                break;
            case 'check':
                user = options.getUser("成員") || interaction.user;

                userDB = bot.userDB.get(user.id) || {};
                warnDB = userDB.warns || {};
                warns = warnDB[interaction.guild.id] || [];
                if (warns.length === 0) return interaction.reply({ content: "看來 `" + user.tag + "` 在 `" + interaction.guild.name + "` 是個好成員呢!一個警告都沒有: )", fetchReply: true });

                if (warns.length <= 10) {
                    let warnsList = []
                    for (var i = 0; i < warns.length; i++) {
                        let warner = bot.users.cache.get(warns[i].warner).tag
                        if (!warns[i].removed) {
                            warnsList.push((i + 1) + " | " + warner + " 原因: " + warns[i].reason)
                        }
                    }
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: user.tag + " 有 " + warns.length + " 次警告", iconURL: user.displayAvatarURL() })
                                .setDescription("```\n" + warnsList.join("\n") + "```")
                                .setColor("Blue")
                        ], fetchReply: true
                    })

                } else {
                    let pages = Math.floor(warns.length / 10)
                    let nowPage = 0

                    let warnsList = []
                    for (var i = 0; i < warns.length; i++) {
                        let warner = bot.users.cache.get(warns[i].warner).tag
                        if (!warns[i].removed) {
                            warnsList.push((i + 1) + " | " + warner + " 原因: " + warns[i].reason)
                        }
                    }
                    let getNowPage = (page = 0) => {
                        let list = []
                        if (page === 0) {
                            for (var i = 0; i < 10; i++) {
                                list.push(warnsList[i])
                            }
                            return list;
                        } else {
                            let needGet = page * 10
                            for (var i = needGet; i < (needGet + 10); i++) {
                                list.push(warnsList[i])
                            }
                            return list;
                        }
                    }

                    let buttons = {
                        "back": new ButtonBuilder()
                            .setCustomId("back")
                            .setStyle("Primary")
                            .setLabel("◀️")
                            .setDisabled(true),
                        "next": new ButtonBuilder()
                            .setCustomId("next")
                            .setStyle("Primary")
                            .setLabel("▶️")
                            .setDisabled(false)
                    }

                    let message = await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: user.tag + " 有 " + warns.length + " 次警告", iconURL: user.displayAvatarURL() })
                                .setDescription("```\n" + getNowPage(0).join("\n") + "```")
                                .setColor("Blue")
                        ], components: [
                            new ActionRowBuilder()
                                .addComponents([
                                    buttons.back,
                                    buttons.next
                                ])
                        ], fetchReply: true
                    })

                    let filter = (i) => i.user.id === interaction.user.id;
                    let collector = message.createMessageComponentCollector({ filter, time: 60000 })

                    collector.on('collect', async b => {
                        b.deferUpdate()
                        if (b.customId === 'back') {
                            nowPage = (nowPage - 1)
                            if (nowPage === 0) {
                                buttons.back.setDisabled(true)
                                buttons.next.setDisabled(false)
                            } else {
                                buttons.back.setDisabled(false)
                                buttons.next.setDisabled(false)
                            }
                        } else {
                            nowPage = (nowPage + 1)
                            if (nowPage === pages) {
                                buttons.back.setDisabled(false)
                                buttons.next.setDisabled(true)
                            } else {
                                buttons.back.setDisabled(false)
                                buttons.next.setDisabled(false)
                            }
                        }
                        await message.edit({
                            embeds: [
                                new EmbedBuilder()
                                    .setAuthor({ name: user.tag + " 有 " + warns.length + " 次警告", iconURL: user.displayAvatarURL() })
                                    .setDescription("```\n" + getNowPage(nowPage).join("\n") + "```")
                                    .setColor("Blue")
                            ], components: [
                                new ActionRowBuilder()
                                    .addComponents([
                                        buttons.back,
                                        buttons.next
                                    ])
                            ]
                        })
                    })
                    collector.on('end', async reason => {
                        message.edit({ components: [] })
                    })
                }
                break;
        }
    })

module.exports = command