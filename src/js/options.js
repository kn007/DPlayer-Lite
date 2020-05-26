export default (options) => {
    // default options
    const defaultOption = {
        container: options.element || document.getElementsByClassName('dplayer')[0],
        autoplay: false,
        theme: '#b7daff',
        loop: false,
        lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
        preload: 'auto',
        volume: 1,
        video: {},
        mutex: true,
        pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {} },
    };

    for (const defaultKey in defaultOption) {
        if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }
    if (options.video) {
        !options.video.type && (options.video.type = 'auto');
    }

    if (options.lang) {
        options.lang = options.lang.toLowerCase();
    }

    return options;
};
