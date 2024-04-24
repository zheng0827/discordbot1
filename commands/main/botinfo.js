const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { SlashCommand } = require("../../utils/loadLibs")

let command = new SlashCommand()
	.setName("botinfo")
	.setDescription("查看關於我的信息")
	.setCategory("一般")
	.setRun(async (bot, interaction, options) => {
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
						//{ name: "開發者的辛酸史", value: "```\n我只是一位在台灣的高中生，為了託管此機器人，這主機其實對我來說有點負擔```", inline: true }
					)
					.setColor(`Blue`)
			], components: [
				new ActionRowBuilder()
					.addComponents([
						new ButtonBuilder()
							.setLabel(bot.i18n.string('inviteButtonAdmin'))
							.setStyle('Link')
							.setURL(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=8`),
						new ButtonBuilder()
							.setLabel(bot.i18n.string('inviteButtonGeneral'))
							.setStyle('Link')
							.setURL(`https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=1376607660736`),
					]),
				new ActionRowBuilder()
					.addComponents([
						new ButtonBuilder()
							.setLabel(bot.i18n.string('supportServerButton'))
							.setStyle('Link')
							.setURL(`${bot.config.supportServer}`)
					])
			]
		})
	})

module.exports = command