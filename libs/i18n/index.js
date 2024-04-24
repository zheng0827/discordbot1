const fs = require('fs');
const path = require('path');

class I18n {

    constructor(language = 'zh-TW', commandName = null) {
        this.language = language;
        this.commandName = commandName;
    }

    string(stringCode, ...args) {
        let Json = require('./languages/' + this.language) || {}
        if (!Json || !Json[this.commandName] || !Json[this.commandName][stringCode]) return console.error('[i18n]發生了一個錯誤: 找不到指定內容 ' + this.language + ' | ' + this.commandName);

        if ((typeof Json[this.commandName][stringCode]) === 'function') return Json[this.commandName][stringCode](...args);

        return Json[this.commandName][stringCode]
    }

    static languageList() {
        let list = []
        let files = fs.readdirSync(path.join(__dirname, "languages")).filter(file => file.endsWith('.js')) || []
        files.forEach(file => {
            list.push(file.split("."))
        })
        return list;
    }

}
module.exports = I18n;