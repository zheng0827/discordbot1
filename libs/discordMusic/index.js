const player = require('./src/player');

module.exports = (bot) => {
    bot.player = new player(bot, bot.config["music"]["discordPlayer"]["options"]);
    
    bot.musicCore = {
        name: 'discordMusicBot',
        version: '1.0.1',
        author: 'zheng0827#6058'
    };
}