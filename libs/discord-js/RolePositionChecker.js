const { GuildMember } = require("discord.js");


class RolePositionChecker {
    /**
     * 
     * @param {GuildMember} excuter 
     * @param {GuildMember} member 
     */
    static member(excuter, member) {
        let excuterPosition = excuter.roles.highest.position || 0;
        let memberPosition = member.roles.highest.position || 0;

        if (excuterPosition <= memberPosition) return false;
        return true;
    }

    /**
     * 
     * @param {GuildMember} bot
     */
    static bot(interaction, role) {
        let botPosition = interaction.guild.members.cache.get(interaction.client.user.id).roles.highest.position || 0;
        let rolePosition = role.position || 0;

        if (botPosition <= rolePosition) return false;
        return true;
    }
}

module.exports = RolePositionChecker;