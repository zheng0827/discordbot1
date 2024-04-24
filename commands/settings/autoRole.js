const { EmbedBuilder, SelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } = require("discord.js")
const { SlashCommand } = require("../../utils/loadLibs")

let command = new SlashCommand()
    .setName("auto_role")
    .setDescription("自動身分功能，當有新成員加入時，會自動給新成員身分")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    //.setNameLocalization('zh-TW',"自動身分")
    .setCategory("伺服器設定")
    .addSubcommand(subCommand =>
        subCommand.setName("add").setDescription("添加一個自動身分")
            .addRoleOption(option => option.setName("身分").setDescription("當有新成員加入時，要給新成員什麼身分組").setRequired(true))
    )
    .addSubcommand(subCommand =>
        subCommand.setName("remove").setDescription("移除一個自動身分")
        //.addRoleOption(option => option.setName("身分").setDescription("要把哪個已被設定的自動身分移除?").setRequired(true))
    )
    .addSubcommand(subCommand =>
        subCommand.setName("list").setDescription("查看現有設定的自動身分列表")
    )
    .addSubcommand(subCommand =>
        subCommand.setName("enable").setDescription("開啟自動身分功能")
    )
    .addSubcommand(subCommand =>
        subCommand.setName("disable").setDescription("關閉自動身分功能")
    )
    .setRun(async (bot, interaction, options) => {
        let guild = interaction.guild
        let guildDB = bot.guildDB.get(interaction.guild.id) || {}
        let autoRole = guildDB.autoRole || {}
        let roles = autoRole.roles || []

        switch (options.getSubcommand(true)) {
            case 'add':
                let role = options.getRole("身分")

                let specifyRole = role.rawPosition
                let botRole = guild.me.roles.highest.rawPosition

                if (botRole <= specifyRole) return interaction.reply({ content: bot.customEmojis.false + " | 此身分 (`" + role.name + "`) 比我最高的身分位置 (`" + guild.me.roles.highest.name + "`) 還高", ephemeral: true });

                autoRole.roles = roles.push(role.id)
                autoRole.enable = true

                guildDB.autoRole = autoRole
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.false + " | 成功添加 `" + role.name + "` 至此群組的自動身分列表", fetchReply: true })
                break;
            case 'remove':
                if (roles.length === 0) return interaction.reply({ content: bot.customEmojis.false + " | 此群組沒有設置任何自動身分，可以使用`/autoRole add`來添加自動身分", ephemeral: true });

                let RolesOption = []
                roles.forEach(roleID => {
                    RolesOption.push({
                        label: guild.roles.cache.get(roleID).name,
                        value: roleID
                    })
                })
                RolesOption.push({
                    label: "取消操作",
                    value: "cancel"
                })
                let chooseRemoveRoleMenu = new SelectMenuBuilder()
                    .setCustomId("chooseRemoveRoleMenu")
                    .setMinValues(1)
                    .setPlaceholder("請選擇要從自動身分列表裡移除的身分")
                    .setOptions(RolesOption)

                let message = await interaction.reply({
                    content: "請選擇要從自動身分列表裡移除的身分(時間只有1分鐘)", components: [
                        new ActionRowBuilder()
                            .addComponents([
                                chooseRemoveRoleMenu
                            ])
                    ], fetchReply: true
                })

                let filter = (i) => i.user.id === interaction.user.id;
                let collector = message.createMessageComponentCollector({ filter, time: 60000 })

                collector.on("collect", async i => {

                    if (i.values.includes("cancel")) {
                        collector.stop("cancel")
                        interaction.editReply({ content: "成功取消操作", components: [], fetchReply: true })
                    } else {
                        collector.stop("success")
                        for (let roleID of i.values) {
                            roles = roles.filter(roleId => roleId !== roleID)
                        }

                        autoRole.roles = roles

                        guildDB.autoRole = autoRole
                        bot.guildDB.set(interaction.guild.id, guildDB)
                        interaction.editReply({ content: "成功將 " + i.values.map(roleID => guild.roles.cache.get(roleID).name).join(" , ") + " 從自動身分列表裡移除", components: [], fetchReply: true })
                    }
                })
                collector.on("end", reason => {
                    if (reason === "user") return interaction.editReply({
                        components: [], fetchReply: true
                    });
                })
                break;
            case 'list':
                if (roles.length === 0) return interaction.reply({ content: bot.customEmojis.false + " | 此群組沒有設置任何自動身分，可以使用`/autoRole add`來添加自動身分", ephemeral: true });

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(interaction.guild.name + "的自動身分列表")
                            .setColor("Blue")
                            .setFields([
                                {
                                    name: "現有設定的自動身分:",
                                    value: roles.map(roleID => "<@&" + roleID + ">")
                                }
                            ])
                    ], fetchReply: true
                })
                break;
            case 'enable':
                if (autoRole.enable) return interaction.reply({ content: bot.customEmojis.false + " | 此群組已有開啟此功能", ephemeral: true });
                autoRole.enable = true
                guildDB.autoRole = autoRole
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.true + " | 成功開啟自動身分功能", fetchReply: true })
                break;
            case 'disable':
                if (!autoRole.enable) return interaction.reply({ content: bot.customEmojis.false + " | 此群組並未開啟此功能", ephemeral: true });
                autoRole.enable = false
                guildDB.autoRole = autoRole
                bot.guildDB.set(interaction.guild.id, guildDB)
                interaction.reply({ content: bot.customEmojis.true + " | 成功關閉自動身分功能", fetchReply: true })
                break;
        }
    });

    module.exports = command