/*
W3C def language codes is :
    language-code = primary-code ( "-" subcode )
        primary-code    ISO 639-1   ( the names of language with 2 code )
        subcode         ISO 3166    ( the names of countries )

NOTE: use lowercase to prevent case typo from user!
Use this as shown below..... */

function i18n(lang) {
    this.lang = lang;
    this.tran = (text) => {
        if (tranTxt[this.lang] && tranTxt[this.lang][text]) {
            return tranTxt[this.lang][text];
        } else {
            return text;
        }
    };
}

// add translation text here
const tranTxt = {
    'zh-cn': {
        'Video load failed': '视频加载失败',
        'Go forward': '快进',
        'Go back': '快退',
        'seconds': '秒',
        'Volume': '音量',
        'Live': '直播',
    },
    'zh-tw': {
        'Video load failed': '視頻加載失敗',
        'Go forward': '快進',
        'Go back': '快退',
        'seconds': '秒',
        'Volume': '音量',
        'Live': '直播',
    }
};

export default i18n;