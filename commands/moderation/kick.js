const { SlashCommand, RolePositionChecker } = require("../../utils/loadLibs")
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

let command = new SlashCommand()
    .setName("kick")
    .setDescription("踢出成員")
    .setCategory("伺服器管理")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator)
    .addUserOption(option => option.setName("成員").setDescription("要踢出哪一個成員?").setRequired(true))
    .addStringOption(option => option.setName("原因").setDescription("為什麼要踢出這個成員?").setRequired(false))
    .setRun(async (bot, interaction, options) => {
        let member = options.getMember("成員");
        if (member.id === bot.user.id) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 我不能踢出我自已." });
        if (!member.kickable) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 我踢不了此成員." });
        if (!RolePositionChecker.member(interaction.member, member)) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 你踢不了此成員." });

        member.kick(interaction.user.tag + " 使用kick指令踢出此成員，他给的原因是: " + (options.getString("原因") ?? "未提供原因"))
            .then(kickedMember => {
                interaction.reply({
                    embeds: [
                        {
                            author: {
                                name: kickedMember.user.tag,
                                icon_url: kickedMember.avatarURL({ size: 4096 })
                            },
                            description: "哎呀! 又有一個成員被踢出去了... 😟" + (options.getString("原因") ? "\n\n原因: `" + options.getString("原因") + "`" : ''),
                            footer: {
                                text: "被 " + interaction.user.tag + " 踢出.",
                                icon_url: interaction.user.displayAvatarURL({ size: 4096 })
                            },
                            color: Number("0x2f3136")
                        }
                    ]
                })
            }).catch(error => {
                interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " |  很抱歉，發生了一個錯誤```\n" + error.toString() + "```" })
                console.error("\n[Kick指令]" + interaction.guild.name + " | " + interaction.guild.id + "\n" + error)
            });
    })

module.exports = command;