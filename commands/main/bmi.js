const { EmbedBuilder } = require('discord.js')
const { SlashCommand } = require("../../utils/loadLibs")

let command = new SlashCommand()
    .setName("bmi")
    .setDescription("BMI值計算機")
    .setCategory("一般")
    .addNumberOption(option => option.setName('身高').setDescription('你的身高 - 公分').setRequired(true))
    .addNumberOption(option => option.setName('體重').setDescription('你的體重 - 公斤').setRequired(true))
    .setRun(async (bot, interaction, options) => {
        let height = options.getNumber("身高")
        let weight = options.getNumber("體重")
        
        if (height <= 0) return interaction.reply({ content: bot.customEmojis.false + bot.i18n.string('argHeightError'), ephemeral: true });
        if (weight <= 0) return interaction.reply({ content: bot.customEmojis.false + bot.i18n.string('argWeightError'), ephemeral: true });

        height = (height.toFixed(1) / 100).toFixed(2)
        weight = weight.toFixed(1)

        let bmi = (weight / (height * height)).toFixed(1)

        let bmiNames = {
            "underweight": bot.i18n.string('underweight'), "normal": bot.i18n.string('normal'), "too_heavy": bot.i18n.string('too_heavy'), "mild_obesity": bot.i18n.string('mild_obesity'), "moderate_obesity": bot.i18n.string('moderate_obesity'), "severe_obesity": bot.i18n.string('severe_obesity')
        }


        interaction.reply({ content: bot.i18n.string('pleaseWaitAMinute') })
            .then(async m => {
                setTimeout(() => {
                    m.edit({
                        content: bot.i18n.string('messageContent'), embeds: [
                            new EmbedBuilder()
                                .setTitle(bot.i18n.string('embedTitle'))
                                .setThumbnail("https://play-lh.googleusercontent.com/oRfGPvu132cuyKZXG9Z-OoWr-OlN7VFBIw60vvkBQ2Gzv4V4VdtvpwEISJ1rv9ZzTVI")
                                .setDescription(bot.i18n.string('embedDescription', height, weight, bmi.toString(), bmiNames[check_bmi_range(bmi)]))
                                .setFooter({ text: bot.i18n.string('embedFooterText', interaction.user.tag), iconURL: interaction.user.displayAvatarURL({ format: "jpeg", dynamic: true, size: 4096 }) })
                                .setColor(`Blue`)
                        ], fetchReply: true
                    })
                }, getRandom(1000))
            })
    })

//x~2x的隨機數
function getRandom(x) {
    return Math.floor(Math.random() * x) + x;
};

function check_bmi_range(bmi) {
    if (bmi < 18.5) {
        return "underweight"
    }

    if (bmi >= 18.5 && bmi < 24) {
        return "normal"
    }

    if (bmi >= 24 && bmi < 27) {
        return "too_heavy"
    }

    if (bmi >= 27 && bmi < 30) {
        return "mild_obesity"
    }

    if (bmi >= 30 && bmi < 35) {
        return "moderate_obesity"
    }

    if (bmi >= 35) {
        return "severe_obesity"
    }
}

module.exports = command