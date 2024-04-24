const { SlashCommand } = require("../../utils/loadLibs");
const { EmbedBuilder, SlashCommandAssertions, SlashCommandSubcommandGroupBuilder } = require('discord.js');

let command = new SlashCommand()
    .setName("info")
    .setDescription("查看資訊")
    .setCategory("一般")
    .setRun(async (bot, interaction, options) => {
        switch (options.getSubcommand(true)) {
            case 'user':
                let user = options.getUser("用戶") || interaction.user;
                let member = options.getMember("用戶") || interaction.member;

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Blue")
                            .setThumbnail(user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }))
                            .setFooter({ text: bot.i18n.string('embedFooterText', user.tag) })
                            .setTimestamp()
                            .addFields(
                                { name: bot.i18n.string('userNickname'), value: "`" + member.displayName + "`", inline: true },
                                { name: "ID", value: "`" + user.id + "`", inline: true },
                                { name: bot.i18n.string('userDiscriminator'), value: "`" + user.discriminator + "`", inline: true },
                                { name: bot.i18n.string('accountCreatedTime'), value: "<t:" + Math.floor(user.createdTimestamp / 1000) + ":F>", inline: true },
                                { name: bot.i18n.string('joinedGuildTime'), value: "<t:" + Math.floor(member.joinedTimestamp / 1000) + ":F>", inline: true },
                                {
                                    name: bot.i18n.string('whetherUserIsBot'),
                                    value: interaction.user.bot ? bot.customEmojis["true"] + bot.i18n.string('isABot') : bot.customEmojis["false"] + bot.i18n.string('isNotABot'),
                                    inline: true
                                },
                                { name: bot.i18n.string('userStatus'), value: status(), inline: true },
                                {
                                    name: bot.i18n.string('highestRoleAndColor'),
                                    value: "<@&" + interaction.guild.members.cache.get(user.id).roles.highest.id + "> | `" + interaction.guild.members.cache.get(user.id).roles.highest.hexColor + "`",
                                    inline: true
                                },
                                { name: bot.i18n.string('userRoles'), value: roles(), inline: false }
                            )
                    ]
                })
                break;
            case 'server':
                let verify =
                    { NONE: "沒有", LOW: "低", MEDIUM: "中", HIGH: "高", VERY_HIGH: "超高" }[interaction.guild.verificationLevel];
                let boostLevel =
                    { NONE: "沒有", TIER_1: "等級1", TIER_2: "等級2", TIER_3: "等級3" }[interaction.guild.premiumTier];

                let embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setThumbnail(interaction.guild.iconURL({ format: "jpg", size: 2048, dynamic: true }))
                    .setFooter({ text: `${interaction.user.tag} 使用`, iconURL: interaction.user.displayAvatarURL({ format: "jpeg", dynamic: true, size: 4096 }) })
                    .setTimestamp()
                    .setTitle(`**${interaction.guild.name} 的資訊**`)
                    .addFields(
                        { name: "ID", value: "`" + interaction.guild.id + "`", inline: true },
                        { name: "擁有者", value: "<@" + interaction.guild.ownerId + ">", inline: true },
                        { name: "建立時間", value: "<t:" + Math.floor(interaction.guild.createdTimestamp / 1000) + ":F>", inline: true },
                        { name: '\u200B', value: '\u200B' },
                        { name: "伺服器簡介", value: "`" + interaction.guild.premiumSubscriptionCount + "`", inline: true },
                        { name: "伺服器地區", value: preferredLocale, inline: true },
                        { name: "伺服器自訂邀請代碼", value: interaction.guild.vanityURLCode, inline: true },
                        { name: '\u200B', value: '\u200B' },
                        { name: "驗證等級", value: "`" + interaction.guild.premiumSubscriptionCount + "` 個", inline: true },
                        { name: "驗證等級", value: "`" + verify + "`", inline: true },
                        { name: "加成數量", value: "`" + interaction.guild.premiumSubscriptionCount + "` 個", inline: true },
                        { name: "加成等級", value: boostLevel, inline: true }
                    )
                interaction.reply({ embeds: [embed], fetchReply: true })
                break;
            case 'bot':
                let totalSeconds = (bot.uptime / 1000);
                let days = Math.floor(totalSeconds / 86400);
                totalSeconds %= 86400;
                let hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60);
                let seconds = Math.floor(totalSeconds % 60);

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(bot.i18n.string('embedTitle', bot.user.tag))
                            .setThumbnail(bot.user.displayAvatarURL({ format: "jpg", size: 2048, dynamic: true }))
                            .addFields(
                                { name: bot.i18n.string('embedFieldBotCreator'), value: bot.users.cache.get(bot.config.ownerID).tag, inline: true },
                                { name: "ID", value: bot.user.id, inline: true },
                                { name: bot.i18n.string('embedFieldBotCreatedTime'), value: "<t:" + Math.floor(bot.user.createdTimestamp / 1000) + ":F>", inline: true },
                                { name: bot.i18n.string('embedFieldBotUptime'), value: bot.i18n.string('uptime', days, hours, minutes, seconds), inline: true },
                                { name: bot.i18n.string('embedFieldGuildsCount'), value: bot.i18n.string('embedFieldCount', bot.guilds.cache.size), inline: true },
                                { name: bot.i18n.string('embedFieldUsersCount'), value: bot.i18n.string('embedFieldCount', bot.users.cache.size), inline: true },
                                {
                                    name: "狀態",
                                    value: "```yml\n" +
                                    "[CPU] user:" + process.cpuUsage().user +
                                    "\n      system:" + process.cpuUsage().system +
                                    "\n\n[RAM]      system:" + process +
                                    "      system:" + process.cpuUsage().system +
                                    "```"
                                }
                            )
                            .setColor(`Blue`)
                    ],
                    components: [{
                        type: 1,
                        components: [
                            new ButtonBuilder()
                                .setLabel(bot.i18n.string('inviteButtonAdmin'))
                                .setStyle('Link')
                                .setURL(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=8`),
                            new ButtonBuilder()
                                .setLabel(bot.i18n.string('inviteButtonGeneral'))
                                .setStyle('Link')
                                .setURL(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=1376607660736`),

                            new ButtonBuilder()
                                .setLabel(bot.i18n.string('supportServerButton'))
                                .setStyle('Link')
                                .setURL(`${bot.config.supportServer}`)
                        ]
                    }]
                })
                break;
        }
    })
    .addSubcommand(subCommand => subCommand
        .setName("user")
        .setDescription("查看用戶的資訊")
        .addUserOption(option => option.setName("用戶").setDescription("要查看哪個用戶的資訊?").setRequired(false))
    )
    .addSubcommand(subCommand => subCommand
        .setName("server")
        .setDescription("查看群組的資訊")
    )
    .addSubcommand(subCommand => subCommand
        .setName("bot")
        .setDescription("查看用戶的資訊")
    )

module.exports = command;

function status(bot, member) {
    let name = member.presence
    name = (name ? member.presence.status : 'online')
    let emojis = {
        "dnd": bot.i18n.string('statusDnd'),
        "online": bot.i18n.string('statusOnline'),
        "idle": bot.i18n.string('statusIdle'),
        "offline": bot.i18n.string('statusOffline')
    }
    return `${bot.customEmojis[name]} ${emojis[name]}`
}

function roles(member) {
    let userRoles = member.roles.cache.filter(r => r.name !== "@everyone").map(r => ` <@&${r.id}> `) || []
    return ((userRoles.length !== 0) ? userRoles.join(',') : '此人沒身分組')
}