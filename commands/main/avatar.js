const { SlashCommand } = require("../../utils/loadLibs");
const { EmbedBuilder, SlashCommandAssertions, SlashCommandSubcommandGroupBuilder } = require('discord.js');

let command = new SlashCommand()
	.setName("avatar")
	.setDescription("查看用戶頭像")
	.setCategory("一般")
	.addUserOption(option =>
		option
			.setName("用戶")
			.setDescription("要查看誰的頭像?")
			.setRequired(false)
	)
	.setRun(async (bot, interaction, options) => {
		let user = options.getUser("用戶") || interaction.user;
		
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(bot.i18n.string('embedTitle', user.tag))
					.setImage(user.displayAvatarURL({ format: "jpeg", dynamic: true, size: 4096 }))
					.setColor(`Blue`)
			], fetchReply: true
		});
	})

module.exports = command;