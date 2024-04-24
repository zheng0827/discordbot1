module.exports = async (bot) => {
    let version = require("../package.json").version;

    let configs = bot.config.presences;

    function replacer(string) {
        return string
            .replace('&server-count&', bot.guilds.cache.size)
            .replace('&version&', version)
            .replace('&user_count&', bot.users.cache.size)
            .replace('&owner&', bot.users.cache.get(bot.config.ownerID).tag);
    }

    var y = 0;
    var u = configs.activities.length - 1;

    let updateStatus = () => {
        if (u < 0) return;
        var theActivities = configs.activities[y];

        bot.user.setPresence({
            status: theActivities.status,
            activities: [{
                name: replacer(theActivities.name),
                type: theActivities.type ? theActivities.type : "Playing",
                url: theActivities.url
            }]
        });

        if (y !== u) {
            y++
        } else {
            y = 0
        };

    };

    bot.once("ready", updateStatus);

    setInterval(updateStatus, configs.time * 1000);
}