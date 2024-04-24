const Logger = require('../libs/logger');
let logger = new Logger('除錯', 0, [], 8);
process.on('uncaughtException', (err, origin) => {
    logger.error(
        `發生錯誤: ${err}\n` +
        `錯誤類別: ${origin}\n` +
        `訊息: ${err.stack}`
    )
});

process.on('unhandledRejection', error => {
    logger.error(
        `發生錯誤: ${error}\n` +
        `訊息: ${error?.stack || error?.message}`
    )
});