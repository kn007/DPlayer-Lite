import Icons from './icons';
import tplPlayer from '../template/player.art';

class Template {
    constructor (options) {
        this.container = options.container;
        this.options = options.options;
        this.tran = options.tran;
        this.init();
    }

    init () {
        this.container.innerHTML = tplPlayer({
            options: this.options,
            tran: this.tran,
            icons: Icons,
            video: {
                pic: this.options.video.pic,
                preload: this.options.preload,
                url: this.options.video.url
            }
        });

        this.volumeBar = this.container.querySelector('.dplayer-volume-bar-inner');
        this.volumeBarWrap = this.container.querySelector('.dplayer-volume-bar');
        this.volumeBarWrapWrap = this.container.querySelector('.dplayer-volume-bar-wrap');
        this.volumeButton = this.container.querySelector('.dplayer-volume');
        this.volumeButtonIcon = this.container.querySelector('.dplayer-volume-icon');
        this.volumeIcon = this.container.querySelector('.dplayer-volume-icon .dplayer-icon-content');
        this.playedBar = this.container.querySelector('.dplayer-played');
        this.loadedBar = this.container.querySelector('.dplayer-loaded');
        this.playedBarWrap = this.container.querySelector('.dplayer-bar-wrap');
        this.playedBarTime = this.container.querySelector('.dplayer-bar-time');
        this.video = this.container.querySelector('.dplayer-video-current');
        this.bezel = this.container.querySelector('.dplayer-bezel-icon');
        this.playButton = this.container.querySelector('.dplayer-play-icon');
        this.videoWrap = this.container.querySelector('.dplayer-video-wrap');
        this.controllerMask = this.container.querySelector('.dplayer-controller-mask');
        this.ptime = this.container.querySelector('.dplayer-ptime');
        this.loopButton = this.container.querySelector('.dplayer-loop-icon');
        this.loopIcon = this.container.querySelector('.dplayer-loop-icon .dplayer-icon-content');
        this.dtime = this.container.querySelector('.dplayer-dtime');
        this.browserFullButton = this.container.querySelector('.dplayer-full-icon');
        this.webFullButton = this.container.querySelector('.dplayer-full-in-icon');
        this.notice = this.container.querySelector('.dplayer-notice');
    }
}

export default Template;
