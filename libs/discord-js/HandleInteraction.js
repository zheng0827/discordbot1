const {
    PermissionFlagsBits,
    StringSelectMenuInteraction,
    Client,
    ButtonInteraction
} = require("discord.js");

const RolePositionChecker = require("./RolePositionChecker");




class HandleInteraction {
    constructor(bot,interaction) {
        this.bot = bot;
        this.interaction = interaction;
    }

    stringSelectMeun(func) {
        if (!func) return;

        if (func === "ROLEMENU") return this._handleRoleMenu(this.bot, this.interaction);
    }

    button(func) {
        if (!func) return;

        if (func === "INFORMATION") return this._handleInformationButton(this.bot, this.interaction);
    }

    /**
     * @param {Client} bot
     * @param {StringSelectMenuInteraction} interaction
     * @private
    */
    _handleRoleMenu(bot, interaction) {
        let guildDB = bot.guildDB.get(interaction.guild.id) || {};
        let roleMenu = guildDB["rolemenu"] || [];

        let args = interaction.customId.split("_");
        let name = args[1];

        let data = roleMenu.find(data => data.name === name) || {};
        if (!data) return interaction.reply({
            content: bot.customEmojis.false + " | 很抱歉，我找不到此選單的資料。",
            ephemeral: true,
            components: [{
                type: 1,
                components: [
                    { label: "看更多?", emoji: 'ℹ️', style: 2, type: 2, custom_id: 'INFORMATION_ROLEMENU_CONNOTFINDDATA' }
                ]
            }]
        });

        if (!interaction.appPermissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({
            content: bot.customEmojis.false + " | 很抱歉，我缺少必要權限 `管理成員`!",
            ephemeral: true,
            components: [{ type: 1, components: [{ label: "看更多?", emoji: 'ℹ️', style: 2, type: 2, custom_id: 'INFORMATION_ROLEMENU_NOPERMTOGIVEROLE' }] }]
        });

        let roleId = interaction.values[0];

        if (roleId === "REMOVEALL") {
            let removed = []
            for (const roleId of data["roles"]) {
                if (interaction.guild.roles.cache.get(roleId) && RolePositionChecker.bot(interaction.guild.members.cache.get(bot.user.id), interaction.guild.roles.cache.get(roleId))) {
                    removed.push(roleId)
                    interaction.member.roles.remove(roleId)
                }
            }
            return interaction.reply({
                content: bot.customEmojis.true + " | 成功幫你移除了在這個選單底所有的身分!(" + removed.length + "/" + data["roles"].length + ")",
                ephemeral: true
            });
        }
        let role = interaction.guild.roles.cache.get(roleId);

        if (!role) return interaction.reply({
            content: bot.customEmojis.false + " | 很抱歉，我找不到此身分...",
            ephemeral: true,
            components: [{ type: 1, components: [{ label: "看更多?", emoji: 'ℹ️', style: 2, type: 2, custom_id: 'INFORMATION_ROLEMENU_ROLENOTFOUND' }] }]
        });

        if (!RolePositionChecker.bot(interaction.guild.members.cache.get(bot.user.id), role)) return interaction.reply({
            content: bot.customEmojis.false + " | 很抱歉，此身分位階比我高或跟我一樣位階",
            ephemeral: true,
            components: [{ type: 1, components: [{ label: "看更多?", emoji: 'ℹ️', style: 2, type: 2, custom_id: 'INFORMATION_ROLEMENU_POSITION' }] }]
        });

        let type;
        if (interaction.member.roles.cache.has(role.id)) {
            type = "remove";
            interaction.member.roles.remove(role);
        } else {
            type = "add";
            interaction.member.roles.add(role);
        }

        interaction.reply({
            content: bot.customEmojis.true + " | " + (type === "add" ? "我已經把 `" + role.name + "` 給你了!" : "成功幫你移除 `" + role.name + "` 了!"),
            ephemeral: true
        })
    }

    /**
     * @param {Client} bot
     * @param {ButtonInteraction} interaction
     * @private
    */
    _handleInformationButton(bot, interaction) {
        let args = interaction.customId.split("_");

        if (args[1] === "ROLEMENU") {
            if (args[2] === "CONNOTFINDDATA") {
                interaction.reply({ content: "你叫我嗎?讓我來回答你~\n為什麼我會找不到此選單的資料?我認為可能是因為管理員在刪除選單資料後，我因權限問題而導致無法刪除此訊息。建議聯繫群組管理員來刪除此訊息，感謝您的配合 🥰", ephemeral: true })
            }
            if (args[2] === "NOPERMTOGIVEROLE") {
                interaction.reply({ content: "你叫我嗎?讓我來回答你~\n為什麼我會缺少必要權限?我認為可能是因為管理員當時在邀請我時把此權限給關閉了，或是管理員改變了我的權限。建議聯繫群組管理員來幫我開啟此權限，感謝您的配合 🥰", ephemeral: true })
            }
            if (args[2] === "ROLENOTFOUND") {
                interaction.reply({ content: "你叫我嗎?讓我來回答你~\n為什麼會找不到此身分?我認為可能是因為管理員把此身份刪除了，導致我抓不到身分資料。建議聯繫群組管理員來刪除存在選單資料中不存在的身分，感謝您的配合 🥰", ephemeral: true })
            }
            if (args[2] === "POSITION") {
                interaction.reply({ content: "你叫我嗎?讓我來回答你~\n為什麼身分位階會不夠?因為位階比我高的身分我沒權限可以給你，和我位階一樣的身分我也給不了。建議聯繫群組管理員來調整身分位階，感謝您的配合 🥰", ephemeral: true })
            }
        }
    }
}

module.exports = HandleInteraction;