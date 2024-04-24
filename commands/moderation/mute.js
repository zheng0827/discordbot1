const { SlashCommand, RolePositionChecker } = require("../../utils/loadLibs")
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

let command = new SlashCommand()
    .setName("mute")
    .setDescription("禁言成員")
    .setCategory("伺服器管理")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.Administrator)
    .addUserOption(option => option.setName("成員").setDescription("要禁言哪一個成員?").setRequired(true))
    .addStringOption(option => option
        .setName("時間")
        .setDescription("要禁言多久?")
        .setRequired(true)
        .addChoices(
            { name: '5秒', value: (5).toString() }, { name: '15秒', value: (15).toString() }, { name: '30秒', value: (30).toString() }, { name: '45秒', value: (45).toString() },
            { name: '1分鐘', value: (1 * 60).toString() }, { name: '5分鐘', value: (5 * 60).toString() }, { name: '10分鐘', value: (10 * 60).toString() }, { name: '15分鐘', value: (15 * 60).toString() },
            { name: '20分鐘', value: (20 * 60).toString() }, { name: '25分鐘', value: (25 * 60).toString() }, { name: '30分鐘', value: (30 * 60).toString() }, { name: '35分鐘', value: (35 * 60).toString() },
            { name: '40分鐘', value: (40 * 60).toString() }, { name: '45分鐘', value: (45 * 60).toString() }, { name: '50分鐘', value: (50 * 60).toString() }, { name: '55分鐘', value: (55 * 60).toString() },
            { name: '1小時', value: (1 * 60 * 60).toString() }, { name: '5小時', value: (5 * 60 * 60).toString() }, { name: '10小時', value: (10 * 60 * 60).toString() }, { name: '15小時', value: (15 * 60 * 60).toString() },
            { name: '20小時', value: (20 * 60 * 60).toString() },
            { name: '1天', value: (1 * 24 * 60 * 60).toString() }, { name: '5天', value: (5 * 24 * 60 * 60).toString() },
            { name: '1週', value: (7 * 24 * 60 * 60).toString() }, { name: '2週', value: (14 * 24 * 60 * 60).toString() }
        )
    )
    .addStringOption(option => option.setName("原因").setDescription("為什麼要禁言這個成員?").setRequired(false))
    .setRun(async (bot, interaction, options) => {
        let member = options.getMember("成員");
        let time = Number(options.getString("時間"));

        if (member.id === bot.user.id) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 我不能禁言我自已." });
        if (!member.moderatable) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 我禁言不了此成員." });
        if (!RolePositionChecker.member(interaction.member, member)) return interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " | 你禁言不了此成員." });

        let result;
        let weeks = ((time / (7 * 24 * 60 * 60)) >= 1) ? (time / (7 * 24 * 60 * 60)) : 0;
        let days = ((time / (24 * 60 * 60)) >= 1) ? (time / (24 * 60 * 60)) : 0;
        let hours = ((time / (60 * 60)) >= 1) ? (time / (60 * 60)) : 0;
        let minutes = ((time / (24 * 60 * 60)) >= 1) ? (time / (24 * 60 * 60)) : 0;
        let seconds = time;
        if (weeks) { result = String(weeks) + " 週" } else if (days) { result = String(days) + " 天" } else if (hours) { result = String(hours) + " 小時" } else if (minutes) { result = String(minutes) + " 分鐘" } else if (seconds) result = String(seconds) + " 秒";
        
        member.timeout(time * 1000, interaction.user.tag + " 使用mute指令禁言此成員，他给的原因是: " + (options.getString("原因") ?? "未提供原因"))
            .then(mutedMember => {
                interaction.reply({
                    content: mutedMember.toString(),
                    embeds: [
                        {
                            description: "被 `" + interaction.user.tag + "` 禁言了 `" + result + "` !" + (options.getString("原因") ? "\n\n原因: `" + options.getString("原因") + "`" : ''),
                            color: Number("0x2f3136")
                        }
                    ]
                })
            })
            .catch(error => {
                interaction.reply({ ephemeral: true, content: bot.customEmojis.false + " |  很抱歉，發生了一個錯誤```\n" + error.toString() + "```" })
                console.error("\n[mute指令]" + interaction.guild.name + " | " + interaction.guild.id + "\n" + error)
            });
    })

module.exports = command;