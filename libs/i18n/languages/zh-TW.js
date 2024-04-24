const commandArgs = {
    giveaway: {},

    avatar: {
        commandDescription: "查看用戶頭像",
        commandOptions:[
            {
                name:"用戶",
                description:"要查看誰的頭像?"
            }
        ],
        embedTitle: (userTag) => userTag + " 的頭像"
    },

    bmi: {
        argHeightError: " | 語法錯誤: 請輸入正確的身高",
        argWeightError: " | 語法錯誤: 請輸入正確的體重",
        underweight: "過輕",
        normal: "正常",
        too_heavy: "過重",
        mild_obesity: "輕度肥胖",
        moderate_obesity: "中度肥胖",
        severe_obesity: "重度肥胖",
        pleaseWaitAMinute: "計算中......請稍等",
        messageContent: "您的BMI數值:",
        embedTitle: "BMI值計算機",
        embedDescription: (height, weight, bmi, bmiName) => "身高: `" + height + "`公尺 / 體重: `" + weight + "`公斤\n您的BMI數值為 `" + bmi + " (" + bmiName + ")`\n\nBMI數值說明:```\n世界衛生組織建議以身體質量指數（Body Mass Index, BMI）來衡量肥胖程度，其計算公式是以體重（公斤）除以身高（公尺）的平方。 國民健康署建議我國成人BMI應維持在18.5（kg/㎡）及24（kg/㎡）之間，太瘦、過重或太胖皆有礙健康。 研究顯示，體重過重或是肥胖（BMI≧24）為糖尿病、心血管疾病、惡性腫瘤等慢性疾病的主要風險因素；而過瘦的健康問題，則會有營養不良、骨質疏鬆、猝死等健康問題。```",
        embedFooterText: (userTag) => userTag + " 的BMI數值"
    },

    botinfo: {
        commandDescription: "查看關於我的信息",
        embedFieldBotCreator: "創建者",
        embedFieldBotCreatedTime: "建立時間",
        embedFieldBotUptime: "上線時間",
        embedFieldGuildsCount: "伺服器數量",
        embedFieldUsersCount: "總用戶數量",
        inviteButtonAdmin: " 邀請我(管理員權限)",
        inviteButtonGeneral: " 邀請我(一般權限)",
        supportServerButton: " 支援伺服器",
        uptime: (days, hours, minutes, seconds) => days + "天" + hours + "小時" + minutes + "分鐘" + seconds + "秒",
        embedTitle: (botTag) => botTag + " 的資訊",
        embedFieldCount: (index) => "`" + index + "` 個"
    },

    gay: {
        commandDescription: "同性戀指數",
        successResetIndex: " | 數值重置成功",
        greaterthan100: " | 數值不可大於100",
        lessthan0: " | 數值不可低於0",
        successSetIndex: " | 數值設置成功！\n可以使用`/gay reset`重置\n\n呈現的內容:",
        embedDescription: (index) => index + "% 是同志"
    },

    icon: {
        commandDescription: "查看伺服器圖標",
        embedTitle: (guildName) => guildName + " 的伺服器圖標"
    },

    invite: {
        commandDescription: "查看用戶頭像",
        embedDescription: "> 感謝您的邀請: )",
        inviteButtonAdmin: " 邀請我(管理員權限)",
        inviteButtonGeneral: " 邀請我(一般權限)",
        supportServerButton: " 支援伺服器",
        embedAuthorName: (botTag) => "邀請 " + botTag + " 到你的伺服器吧!"
    },

    ping: {
        commandDescription: "查看機器人的延遲",
        waitMeAMoment: "請稍後",
        embedAuthorName: "機器人延遲",
        embedDescription: (api, host) => "API延遲: `" + api + "` ms\n我的延遲: `" + host + "` ms"
    },

    say: {
        commandDescription: "讓我說一些話",
        someoneAtEveryone: (userTag) => "`[" + userTag + "用了everyone]`",
        someoneAtHere: (userTag) => "`[" + userTag + "用了here]`"
    },

    serverinfo: {
        verifyNone: "",
        verifyLow: "",
        verifyMedium: "",
        verifyNone: "",
        verifyNone: "",
        verifyNone: "",
        verifyNone: "",
        verifyNone: "",
        verifyNone: "",
        verifyNone: "",
    },

    userinfo: {
        commandDescription: "查看用戶的信息",
        userNickname: "暱稱",
        userDiscriminator: "4位編碼",
        accountCreatedTime: "帳號建立時間",
        joinedGuildTime: "加入群組時間",
        whetherUserIsBot: "機器人?",
        userStatus: "狀態",
        highestRoleAndColor: "最高身份 | 顏色",
        userRoles: "身份組",
        isABot: " `是`",
        isNotABot: " `不是`",
        statusDnd: "請勿打擾",
        statusOnline: "上線",
        statusIdle: "閒置",
        statusOffline: "離線",
        embedFooterText: (userTag) => userTag + " 使用"
    },


}

module.exports = commandArgs