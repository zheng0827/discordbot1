const SlashCommand = require('../../discord-js/SlashCommand');
const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const fetch = require("node-fetch")

let command = new SlashCommand()
    .setName("lyrics")
    .setDescription("查看歌詞")
    .setCategory("音樂")
    .addStringOption(option => option.setName("歌曲").setDescription("要查看哪一首歌的歌詞?").setRequired(true))
    .setRun(async (bot, interaction, options) => {
        const song = options.getString("歌曲");
        interaction.deferReply();
        let lyrics;
        let fetched;
        let data;

        if (bot.config["music"]["lyrics"]["from"] === "genius") {
            let headers = {
                Authorization: 'Bearer ' + bot.config["music"]["lyrics"]["api"]
            };

            //fetch id
            fetched = await fetch("https://api.genius.com/search?q=" + encodeURIComponent(song), { headers });
            data = await fetched.json();

            let songData = data["response"]["hits"][0]["result"];
            //fetch lyrics
            fetched = await fetch(songData["url"]);
            data = await fetched.text();

            let $ = cheerio.load(data);
            lyrics = $('div[class="lyrics"]').text().trim();
            if (!lyrics) {
                lyrics = ''
                $('div[class^="Lyrics__Container"]').each((i, elem) => {
                    if ($(elem).text().length !== 0) {
                        let snippet = $(elem).html()
                            .replace(/<br>/g, '\n')
                            .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
                        lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
                    }
                })
            }
            if (!lyrics) lyrics = 'Error: 找不到歌詞!';
            lyrics = lyrics.replace(/(\[.+\])/g, '');

        } else {
            fetched = await fetch("https://mojim.com/" + encodeURIComponent(song) + ".html?t3", { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36" });
            data = await fetched.text();

            let $ = cheerio.load(data);
            let select = $("tr .mxsh_dd1").find("a");
            data = [];
            for (let i = 0; i < select.length; i++) {
                if (i % 3 !== 2) continue
                let attribs = select[i].attribs
                let parsed = JSON.parse(JSON.stringify(attribs))
                data.push(parsed);
            }
            
            if (data.length === 0) lyrics = 'Error: 找不到任何歌詞';
            if (data.length > 0) lyrics = (await fetchMojimPage("https://mojim.com" + data[0].href)).toString();
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle(song + " 的歌詞")
                    .setDescription("```\n" + lyrics + "```")
                    .setColor("Blue")
                    .setFooter({ text: interaction.user.tag + " 使用", iconURL: interaction.user.displayAvatarURL() })
            ]
        })
    })

async function fetchMojimPage(url) {
    let fetched = await fetch(url);
    let data = await fetched.text();
    let $ = cheerio.load(data.replace(/<br \/>/g, "\n"), { decodeEntities: false });
    let findLyrics = $("tr").find("div.fsZ").find("dl.fsZx1").find("dd.fsZx3")
    return findLyrics.text()
        .replace("更多更詳盡歌詞 在 ※ Mojim.com　魔鏡歌詞網", "").trim();
}
module.exports = command