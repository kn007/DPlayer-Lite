const html = {
    main: (options, tran, icons) => `
        <div class="dplayer-mask"></div>
        <div class="dplayer-video-wrap">
            <video class="dplayer-video dplayer-video-current" ${options.video.pic ? `poster="${options.video.pic}"` : ``} webkit-playsinline playsinline ${options.preload ? `preload="${options.preload}"` : ``} src="${options.video.url}"></video>
            <div class="dplayer-bezel">
                <span class="dplayer-bezel-icon"></span>
                <span class="diplayer-loading-icon">
                    <svg height="100%" version="1.1" viewBox="0 0 22 22" width="100%">
                        <svg x="7" y="1">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-0" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="11" y="3">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-1" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="13" y="7">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-2" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="11" y="11">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-3" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="7" y="13">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-4" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="3" y="11">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-5" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="1" y="7">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-6" cx="4" cy="4" r="2"></circle>
                        </svg>
                        <svg x="3" y="3">
                            <circle class="diplayer-loading-dot diplayer-loading-dot-7" cx="4" cy="4" r="2"></circle>
                        </svg>
                    </svg>
                </span>
            </div>
        </div>
        <div class="dplayer-controller-mask"></div>
        <div class="dplayer-controller">
            <div class="dplayer-icons dplayer-icons-left">
                <button class="dplayer-icon dplayer-play-icon">
                    <span class="dplayer-icon-content">${icons.get('play')}</span>
                </button>
                <div class="dplayer-volume">
                    <button class="dplayer-icon dplayer-volume-icon">
                        <span class="dplayer-icon-content">${icons.get('volume-down')}</span>
                    </button>
                    <div class="dplayer-volume-bar-wrap">
                        <div class="dplayer-volume-bar">
                            <div class="dplayer-volume-bar-inner" style="background: ${options.theme};">
                                <span class="dplayer-thumb" style="background: ${options.theme}"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="dplayer-time"><span class="dplayer-ptime">0:00</span> / <span class="dplayer-dtime">0:00</span></span>
            </div>
            <div class="dplayer-icons dplayer-icons-right">
                <div class="dplayer-loop">
                    <button class="dplayer-icon dplayer-loop-icon">
                        <span class="dplayer-icon-content">${icons.get('loop')}</span>
                    </button>
                </div>
                <div class="dplayer-full-in">
                    <button class="dplayer-icon dplayer-full-in-icon">
                        <span class="dplayer-icon-content">${icons.get('full-in')}</span>
                    </button>
                </div>
                <div class="dplayer-full">
                    <button class="dplayer-icon dplayer-full-icon">
                        <span class="dplayer-icon-content">${icons.get('full')}</span>
                    </button>
                </div>
            </div>
            <div class="dplayer-bar-wrap">
                <div class="dplayer-bar-time hidden">00:00</div>
                <div class="dplayer-bar-preview"></div>
                <div class="dplayer-bar">
                    <div class="dplayer-loaded" style="width: 0;"></div>
                    <div class="dplayer-played" style="width: 0; background: ${options.theme}">
                        <span class="dplayer-thumb" style="background: ${options.theme}"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="dplayer-notice"></div>`
};

module.exports = html;
