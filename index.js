const { Client, Collection, GatewayIntentBits } = require('discord.js');
const db = require("quick.db");

const Logger = require("./libs/logger");
const config = require("./config/config");
const emojis = require("./config/emojis");
const { DiscordGiveawayManger, Backup } = require('./utils/loadLibs');

const bot = new Client({
  messageCacheLifetime: 24 * 60 * 60 * 1000,
  shards: "auto",
  allowedMentions: {
    parse: ["roles", "users", "everyone"],
    repliedUser: true,
  },
  partials: ["Message", "Channel", "Reaction"],
  intents: [
    "Guilds", "GuildMembers", "GuildBans", "GuildEmojisAndStickers", "GuildIntegrations", "GuildWebhooks", "GuildInvites", "GuildVoiceStates", "GuildPresences", "GuildMessages", "GuildMessageReactions", "GuildMessageTyping", "MessageContent", "GuildScheduledEvents", "DirectMessages"
  ]
});

const botLogger = new Logger('機器人進程', config.debug, config.ignore, 8);
const processLogger = new Logger('後端進程', config.debug, config.ignore, 8);
const giveawayManger = new DiscordGiveawayManger(bot);
const backup = new Backup(bot);

bot.giveawayManger = giveawayManger;
bot.backup = backup;
bot.botLogger = botLogger;
bot.processLogger = processLogger;

bot.config = config;
bot.customEmojis = emojis;
bot.db = db;
bot.cooldown = new Collection();
bot.devCommands = new Collection();
bot.commands = new Collection();
bot.helpCommandsList = new Collection();

require("./utils/debuger");
//載入資料庫檔案
require(`./utils/loadDatabases`)(bot);
//載入事件檔案
require(`./utils/loadEventFiles`)(bot);
//載入指令檔案
require(`./utils/loadCommandFiles`)(bot);

if (config.music.enable) {
  require('./' + bot.config.music.path + '/index')(bot);
}

bot.login(config.token)
  //.then(() => require('./libs/haha/index')(bot));//有空再寫
/*
bot.on('messageCreate', async msg => {
  if (msg.channel.id !== '1072185029196796016') return;
  if (msg.author.bot) return;

  if (!msg.content) return;
  if (msg.content.startsWith("@")) return;
  const { Configuration, OpenAIApi } = require("openai");

  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: msg.content,
    temperature: 0.5,
    max_tokens: 2048,
    top_p: 0.5,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  });
  msg.reply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: 'openAI 的 ...?', iconURL: "https://pbs.twimg.com/profile_images/1598924796372422656/nEcoIDXz_400x400.jpg" })
        .setDescription("```\n" + response.data.choices[0].text ? response.data.choices[0].text.toString() : 'AI好像回復不了此訊息' + "```")
        .setColor("Blue")
    ]
  })
});//*/