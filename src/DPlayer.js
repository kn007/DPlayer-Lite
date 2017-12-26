require('./DPlayer.scss');

import utils, { isMobile } from './utils';
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

        this.template = new Template({
            container: this.container,
            options: this.options,
            tran: this.tran,
            icons: this.icons
        });

        this.video = this.template.video;

        this.bar = new Bar(this.template);

        this.bezel = new Bezel(this.template.bezel);

        this.controller = new Controller(this);

        document.addEventListener('click', () => {
            this.focus = false;
        }, true);
        this.container.addEventListener('click', () => {
            this.focus = true;
        }, true);

        // play and pause button
        this.paused = true;
        this.template.playButton.addEventListener('click', () => {
            this.toggle();
        });

        if (!isMobile) {
            this.template.videoWrap.addEventListener('click', () => {
                this.toggle();
            });
            this.template.controllerMask.addEventListener('click', () => {
                this.toggle();
            });
        }
        else {
            this.options.autoplay = false;
            this.container.classList.add('dplayer-mobile');
            this.template.videoWrap.addEventListener('click', () => {
                this.controller.toggle();
            });
            this.template.controllerMask.addEventListener('click', () => {
                this.controller.toggle();
            });
        }

        this.time = new Time(this);

        this.isTimeTipsShow = true;
        this.mouseHandler = this.mouseHandler(this.template.playedBarWrap, this.template.playedBarTime).bind(this);
        this.template.playedBarWrap.addEventListener('mousemove', this.mouseHandler);
        this.template.playedBarWrap.addEventListener('mouseleave', this.mouseHandler);

        let barWidth;
        const thumbMove = (e) => {
            let percentage = (e.clientX - utils.getElementViewLeft(this.template.playedBarWrap)) / barWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.bar.set('played', percentage, 'width');
            this.template.ptime.innerHTML = utils.secondToTime(percentage * this.video.duration);
        };

        const thumbUp = (e) => {
            document.removeEventListener('mouseup', thumbUp);
            document.removeEventListener('mousemove', thumbMove);
            let percentage = (e.clientX - utils.getElementViewLeft(this.template.playedBarWrap)) / barWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.bar.set('played', percentage, 'width');
            this.seek(this.bar.get('played') * this.video.duration);
            this.time.enable('progress');
        };

        this.template.playedBarWrap.addEventListener('mousedown', () => {
            barWidth = this.template.playedBarWrap.clientWidth;
            this.time.disable('progress');
            document.addEventListener('mousemove', thumbMove);
            document.addEventListener('mouseup', thumbUp);
        });

        /**
         * control volume
         */
        const vWidth = 35;

        this.switchVolumeIcon = () => {
            if (this.volume() >= 0.8) {
                this.template.volumeIcon.innerHTML = this.icons.get('volume-up');
            }
            else if (this.volume() > 0) {
                this.template.volumeIcon.innerHTML = this.icons.get('volume-down');
            }
            else {
                this.template.volumeIcon.innerHTML = this.icons.get('volume-off');
            }
        };
        const volumeMove = (event) => {
            const e = event || window.event;
            const percentage = (e.clientX - utils.getElementViewLeft(this.template.volumeBarWrap) - 5.5) / vWidth;
            this.volume(percentage);
        };
        const volumeUp = () => {
            document.removeEventListener('mouseup', volumeUp);
            document.removeEventListener('mousemove', volumeMove);
            this.template.volumeButton.classList.remove('dplayer-volume-active');
        };

        this.template.volumeBarWrapWrap.addEventListener('click', (event) => {
            const e = event || window.event;
            const percentage = (e.clientX - utils.getElementViewLeft(this.template.volumeBarWrap) - 5.5) / vWidth;
            this.volume(percentage);
        });
        this.template.volumeBarWrapWrap.addEventListener('mousedown', () => {
            document.addEventListener('mousemove', volumeMove);
            document.addEventListener('mouseup', volumeUp);
            this.template.volumeButton.classList.add('dplayer-volume-active');
        });
        this.template.volumeIcon.addEventListener('click', () => {
            if (this.video.muted) {
                this.video.muted = false;
                this.switchVolumeIcon();
                this.bar.set('volume', this.volume(), 'width');
            }
            else {
                this.video.muted = true;
                this.template.volumeIcon.innerHTML = this.icons.get('volume-off');
                this.bar.set('volume', 0, 'width');
            }
        });

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

        // set duration time
        if (this.video.duration !== 1) { // compatibility: Android browsers will output 1 at first
            this.template.dtime.innerHTML = this.video.duration ? utils.secondToTime(this.video.duration) : '00:00';
        }

        // autoplay
        if (this.options.autoplay && !isMobile) {
            this.play();
        }
        else if (isMobile) {
            this.pause();
        }

        this.fullScreen = new FullScreen(this);

        // browser full screen
        this.template.browserFullButton.addEventListener('click', () => {
            this.fullScreen.toggle('browser');
        });

        // web page full screen
        this.template.webFullButton.addEventListener('click', () => {
            this.fullScreen.toggle('web');
        });

        /**
         * hot key
         */
        const handleKeyDown = (e) => {
            if (this.focus) {
                const event = e || window.event;
                let percentage;
                switch (event.keyCode) {
                case 27:
                    if (this.fullScreen.isFullScreen('web')) {
                        this.fullScreen.cancel('web');
                    }
                    break;
                case 32:
                    event.preventDefault();
                    this.toggle();
                    this.controller.setAutoHide();
                    break;
                case 37:
                    event.preventDefault();
                    this.seek(this.video.currentTime - 3, true);
                    break;
                case 39:
                    event.preventDefault();
                    this.seek(this.video.currentTime + 3, true);
                    break;
                case 38:
                    event.preventDefault();
                    percentage = this.volume() + 0.01;
                    this.volume(percentage, true);
                    break;
                case 40:
                    event.preventDefault();
                    percentage = this.volume() - 0.01;
                    this.volume(percentage, true);
                    break;
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        /**
         * right key
         */
        this.container.addEventListener('contextmenu', (e) => {
            const event = e || window.event;
            event.preventDefault();
        });

        this.initVideo(this.video, this.options.video.type);

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

        this.video.play();
        this.time.enable();
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
        this.time.disable();
        this.container.classList.remove('dplayer-playing');
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

        // HTTP Live Streaming
        if (this.type === 'hls' && Hls && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(video.src);
            hls.attachMedia(video);
        }

        // FLV
        if (this.type === 'flv' && flvjs && flvjs.isSupported()) {
            const flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: video.src
            });
            flvPlayer.attachMediaElement(video);
            flvPlayer.load();
        }

        // MPEG DASH
        if (this.type === 'dash' && dashjs) {
            dashjs.MediaPlayer().create().initialize(video, video.src, false);
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
            this.tran && this.notice && this.notice(this.tran('This video fails to load'), -1);
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

    mouseHandler (pbar, timeTips) {
        // http://stackoverflow.com/questions/1480133/how-can-i-get-an-objects-absolute-position-on-the-page-in-javascript
        const cumulativeOffset = (element) => {
            let top = 0, left = 0;
            do {
                top += element.offsetTop || 0;
                left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element);

            return {
                top: top,
                left: left
            };
        };

        return (e) => {
            if (!this.video.duration) {
                return;
            }
            const { clientX } = e;
            const px = cumulativeOffset(pbar).left;
            const tx = clientX - px;
            if (tx < 0 || tx > pbar.offsetWidth) {
                return;
            }
            const time = this.video.duration * (tx / pbar.offsetWidth);
            timeTips.style.left = `${(tx - 20)}px`;

            switch (e.type) {
            case 'mousemove':
                timeTips.innerText = utils.secondToTime(time);
                this.timeTipsDisplay(true, timeTips);
                break;
            case 'mouseleave':
                this.timeTipsDisplay(false, timeTips);
                break;
            }
        };
    }

    timeTipsDisplay (show, timeTips) {
        if (show) {
            if (this.isTimeTipsShow) {
                return;
            }
            timeTips.classList.remove('hidden');
            this.isTimeTipsShow = true;
        } else {
            if (!this.isTimeTipsShow) {
                return;
            }
            timeTips.classList.add('hidden');
            this.isTimeTipsShow = false;
        }
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

module.exports = DPlayer;
