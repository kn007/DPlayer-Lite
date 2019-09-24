class Timer {
    constructor(player) {
        this.player = player;

        window.requestAnimationFrame = (() =>
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            })();

        this.types = ['loading'];

        this.init();
    }

    init() {
        this.types.map((item) => {
            this[`init${item}Checker`]();
            return item;
        });
    }

    initloadingChecker() {
        let lastPlayPos = 0;
        let currentPlayPos = 0;
        let bufferingDetected = false;
        this.loadingChecker = setInterval(() => {
            if (this.enableloadingChecker) {
                // whether the video is buffering
                currentPlayPos = this.player.video.currentTime;
                if (!bufferingDetected && currentPlayPos === lastPlayPos && !this.player.video.paused) {
                    this.player.container.classList.add('dplayer-loading');
                    bufferingDetected = true;
                }
                if (bufferingDetected && currentPlayPos > lastPlayPos && !this.player.video.paused) {
                    this.player.container.classList.remove('dplayer-loading');
                    bufferingDetected = false;
                }
                lastPlayPos = currentPlayPos;
            }
        }, 100);
    }

    enable(type) {
        this[`enable${type}Checker`] = true;
    }

    disable(type) {
        this[`enable${type}Checker`] = false;
    }

    destroy() {
        this.types.map((item) => {
            this[`enable${item}Checker`] = false;
            this[`${item}Checker`] && clearInterval(this[`${item}Checker`]);
            return item;
        });
    }
}

export default Timer;