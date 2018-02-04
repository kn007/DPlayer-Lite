import Promise from 'promise-polyfill';

import utils from './utils';
import handleOption from './options';
import i18n from './i18n';
import Template from './template';
import SvgCollection from './svg';
import Events from './events';
import FullScreen from './fullscreen';
import Bar from './bar';
import Time from './time';
import Bezel from './bezel';
import Controller from './controller';
import HotKey from './hotkey';

const instances = [];

class DPlayer {

    /**
     * DPlayer constructor function
     *
     * @param {Object} options - See README
     * @constructor
     */
    constructor (options) {
        this.options = handleOption(options);

        this.tran = new i18n(this.options.lang).tran;

        this.icons = new SvgCollection(this.options);

        this.events = new Events();

        this.container = this.options.container;

        this.container.classList.add('dplayer');

        if (utils.isMobile) {
            this.container.classList.add('dplayer-mobile');
        }

        this.template = new Template({
            container: this.container,
            options: this.options,
            tran: this.tran,
            icons: this.icons
        });

        this.video = this.template.video;

        this.bar = new Bar(this.template);

        this.bezel = new Bezel(this.template.bezel);

        this.fullScreen = new FullScreen(this);

        this.controller = new Controller(this);

        document.addEventListener('click', () => {
            this.focus = false;
        }, true);
        this.container.addEventListener('click', () => {
            this.focus = true;
        }, true);

        this.paused = true;

        this.time = new Time(this);

        this.hotkey = new HotKey(this);

        this.initVideo(this.video, this.options.video.type);

        /**
         * loop control
         */
        this.loop = this.options.loop;
        const loopEvent = () => {
            this.events.on('loop_enable', () => {
                this.template.loopIcon.style.opacity = '';
            });
            this.events.on('loop_disable', () => {
                this.template.loopIcon.style.opacity = '0.4';
            });

            this.template.loopButton.addEventListener('click', () => {
                this.loop = !this.loop;
                if (this.loop) {
                    this.events.trigger('loop_enable');
                }
                else {
                    this.events.trigger('loop_disable');
                }
            });
        };
        loopEvent();
        if (this.loop) {
            this.events.trigger('loop_enable');
        }
        else {
            this.events.trigger('loop_disable');
        }

        if (this.options.autoplay) {
            this.play();
        }

        /**
         * right key
         */
        this.container.addEventListener('contextmenu', (e) => {
            const event = e || window.event;
            event.preventDefault();
        });

        instances.push(this);
    }

    /**
    * Seek video
    */
    seek (time, send_notice) {
        time = Math.max(time, 0);
        if (this.video.duration) {
            time = Math.min(time, this.video.duration);
        }
        if (this.video.currentTime < time && send_notice) {
            this.notice(`${this.tran('Go forward')} ${(time - this.video.currentTime).toFixed(0)} ${this.tran('seconds')}`);
        }
        else if (this.video.currentTime > time && send_notice) {
            this.notice(`${this.tran('Go back')} ${(this.video.currentTime - time).toFixed(0)} ${this.tran('seconds')}`);
        }

        this.video.currentTime = time;

        this.bar.set('played', time / this.video.duration, 'width');
    }

    /**
     * Play video
     */
    play () {
        this.paused = false;
        if (this.video.paused) {
            this.bezel.switch(this.icons.get('play'));
        }

        this.template.playButton.innerHTML = this.icons.get('pause');

        const playedPromise = Promise.resolve(this.video.play());
        playedPromise.catch(() => {
            this.pause();
        }).then(() => {
        });
        this.time.enable('loading');
        this.time.enable('progress');
        this.container.classList.add('dplayer-playing');
        if (this.options.mutex) {
            for (let i = 0; i < instances.length; i++) {
                if (this !== instances[i]) {
                    instances[i].pause();
                }
            }
        }
    }

    /**
     * Pause video
     */
    pause () {
        this.paused = true;
        this.container.classList.remove('dplayer-loading');

        if (!this.video.paused) {
            this.bezel.switch(this.icons.get('pause'));
        }

        this.ended = false;
        this.template.playButton.innerHTML = this.icons.get('play');
        this.video.pause();
        this.time.disable('loading');
        this.time.disable('progress');
        this.container.classList.remove('dplayer-playing');
    }

    switchVolumeIcon () {
        if (this.volume() >= 0.8) {
            this.template.volumeIcon.innerHTML = this.icons.get('volume-up');
        }
        else if (this.volume() > 0) {
            this.template.volumeIcon.innerHTML = this.icons.get('volume-down');
        }
        else {
            this.template.volumeIcon.innerHTML = this.icons.get('volume-off');
        }
    }

    /**
     * Set volume
     */
    volume (percentage, send_notice) {
        percentage = parseFloat(percentage);
        if (!isNaN(percentage)) {
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.bar.set('volume', percentage, 'width');
            if (send_notice) {
                this.notice(`${this.tran('Volume')} ${(percentage * 100).toFixed(0)}%`);
            }

            this.video.volume = percentage;
            if (this.video.muted) {
                this.video.muted = false;
            }
            this.switchVolumeIcon();
        }

        return this.video.volume;
    }

    /**
     * Toggle between play and pause
     */
    toggle () {
        if (this.video.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    }

    /**
     * attach event
     */
    on (name, callback) {
        this.events.on(name, callback);
    }

    /**
     * init Video
     */
    initMSE (video, type) {
        this.type = type;
        if (this.options.video.customType && this.options.video.customType[type]) {
            if (Object.prototype.toString.call(this.options.video.customType[type]) === '[object Function]') {
                this.options.video.customType[type](this.video, this);
            }
            else {
                console.error(`Illegal customType: ${type}`);
            }
        }
        else {
            if (this.type === 'auto') {
                if (/m3u8(#|\?|$)/i.exec(video.src)) {
                    this.type = 'hls';
                }
                else if (/.flv(#|\?|$)/i.exec(video.src)) {
                    this.type = 'flv';
                }
                else if (/.mpd(#|\?|$)/i.exec(video.src)) {
                    this.type = 'dash';
                }
                else {
                    this.type = 'normal';
                }
            }

            switch (this.type) {
            // https://github.com/video-dev/hls.js
            case 'hls':
                if (Hls) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(video.src);
                        hls.attachMedia(video);
                    }
                    else {
                        this.notice('Error: Hls is not supported.');
                    }
                }
                else {
                    this.notice('Error: Can\'t find Hls.');
                }
                break;

            // https://github.com/Bilibili/flv.js
            case 'flv':
                if (flvjs && flvjs.isSupported()) {
                    if (flvjs.isSupported()) {
                        const flvPlayer = flvjs.createPlayer({
                            type: 'flv',
                            url: video.src
                        });
                        flvPlayer.attachMediaElement(video);
                        flvPlayer.load();
                    }
                    else {
                        this.notice('Error: flvjs is not supported.');
                    }
                }
                else {
                    this.notice('Error: Can\'t find flvjs.');
                }
                break;

            // https://github.com/Dash-Industry-Forum/dash.js
            case 'dash':
                if (dashjs) {
                    dashjs.MediaPlayer().create().initialize(video, video.src, false);
                }
                else {
                    this.notice('Error: Can\'t find dashjs.');
                }
                break;

            // https://github.com/webtorrent/webtorrent
            case 'webtorrent':
                if (WebTorrent) {
                    if (WebTorrent.WEBRTC_SUPPORT) {
                        this.container.classList.add('dplayer-loading');
                        const client = new WebTorrent();
                        const torrentId = video.src;
                        client.add(torrentId, (torrent) => {
                            const file = torrent.files.find((file) => file.name.endsWith('.mp4'));
                            file.renderTo(this.video, {
                                autoplay: this.options.autoplay
                            }, () => {
                                this.container.classList.remove('dplayer-loading');
                            });
                        });
                    }
                    else {
                        this.notice('Error: Webtorrent is not supported.');
                    }
                }
                else {
                    this.notice('Error: Can\'t find Webtorrent.');
                }
                break;
            }
        }
    }

    initVideo (video, type) {
        this.initMSE(video, type);

        /**
         * video events
         */
        // show video time: the metadata has loaded or changed
        this.on('durationchange', () => {
            if (video.duration !== 1) {           // compatibility: Android browsers will output 1 at first
                this.template.dtime.innerHTML = utils.secondToTime(video.duration);
            }
        });

        // show video loaded bar: to inform interested parties of progress downloading the media
        this.on('progress', () => {
            const percentage = video.buffered.length ? video.buffered.end(video.buffered.length - 1) / video.duration : 0;
            this.bar.set('loaded', percentage, 'width');
        });

        // video download error: an error occurs
        this.on('error', () => {
            this.tran && this.notice && this.type !== 'webtorrent' & this.notice(this.tran('This video fails to load'), -1);
        });

        // video end
        this.ended = false;
        this.on('ended', () => {
            this.bar.set('played', 1, 'width');
            if (!this.loop) {
                this.ended = true;
                this.pause();
            }
            else {
                this.seek(0);
                video.play();
            }
        });

        this.on('play', () => {
            if (this.paused) {
                this.play();
            }
        });

        this.on('pause', () => {
            if (!this.paused) {
                this.pause();
            }
        });

        for (let i = 0; i < this.events.videoEvents.length; i++) {
            video.addEventListener(this.events.videoEvents[i], () => {
                this.events.trigger(this.events.videoEvents[i]);
            });
        }

        this.volume(this.options.volume);
    }

    notice (text, time = 1500, opacity = 0.8) {
        this.template.notice.innerHTML = text;
        this.template.notice.style.opacity = opacity;
        if (this.noticeTime) {
            clearTimeout(this.noticeTime);
        }
        this.events.trigger('notice_show', text);
        this.noticeTime = setTimeout(() => {
            this.template.notice.style.opacity = 0;
            this.events.trigger('notice_hide');
        }, time);
    }

    resize () {
        this.events.trigger('resize');
    }

    destroy () {
        instances.splice(instances.indexOf(this), 1);
        this.pause();
        this.controller.destroy();
        this.time.destroy();
        this.video.src = '';
        this.container.innerHTML = '';
        this.events.trigger('destroy');

        for (const key in this) {
            if (this.hasOwnProperty(key) && key !== 'paused') {
                delete this[key];
            }
        }
    }
}

export default DPlayer;
