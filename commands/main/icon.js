const { EmbedBuilder } = require('discord.js')
const { SlashCommand } = require("../../utils/loadLibs")

let command = new SlashCommand()
	.setName("icon")
	.setDescription("查看伺服器圖標")
	.setCategory("一般")
	.setRun(async (bot, interaction, options) => {
		if (!interaction.guild.iconURL({ format: "jpeg", dynamic: true, size: 4096 })) return interaction.reply(bot.customEmojis.false + " | 此群沒有圖標");
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(bot.i18n.string('embedTitle', interaction.guild.name))
					.setImage(interaction.guild.iconURL({ format: "jpeg", dynamic: true, size: 4096 }))
					.setColor("Blue")
			], fetchReply: true
		})
	})

module.exports = command