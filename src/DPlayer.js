require('./DPlayer.scss');

import utils, { isMobile } from './utils';
import handleOption from './options';
import i18n from './i18n';
import html from './html';
import SvgCollection from './svg';
import Events from './events';
import FullScreen from './fullscreen';

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

        this.options.container.classList.add('dplayer');

        if (isMobile) {
            this.options.autoplay = false;
        }

        this.tran = new i18n(this.options.lang).tran;

        this.icons = new SvgCollection(this.options);

        this.events = new Events();

        this.container = this.options.container;

        if (isMobile) {
            this.container.classList.add('dplayer-mobile');
        }

        this.container.innerHTML = html.main(this.options, this.tran, this.icons);

        const bar = {};
        bar.volumeBar = this.container.getElementsByClassName('dplayer-volume-bar-inner')[0];
        bar.playedBar = this.container.getElementsByClassName('dplayer-played')[0];
        bar.loadedBar = this.container.getElementsByClassName('dplayer-loaded')[0];
        const pbar = this.container.getElementsByClassName('dplayer-bar-wrap')[0];
        const pbarTimeTips = this.container.getElementsByClassName('dplayer-bar-time')[0];
        let barWidth;

        /**
         * Update progress bar, including loading progress bar and play progress bar
         *
         * @param {String} type - Point out which bar it is, should be played loaded or volume
         * @param {Number} percentage
         * @param {String} direction - Point out the direction of this bar, Should be height or width
         */
        this.updateBar = (type, percentage, direction) => {
            percentage = percentage > 0 ? percentage : 0;
            percentage = percentage < 1 ? percentage : 1;
            bar[type + 'Bar'].style[direction] = percentage * 100 + '%';
        };

        document.addEventListener('click', () => {
            this.focus = false;
        }, true);

        this.container.addEventListener('click', () => {
            this.focus = true;
        }, true);

        // get this video manager
        this.video = this.container.getElementsByClassName('dplayer-video-current')[0];

        this.bezel = this.container.getElementsByClassName('dplayer-bezel-icon')[0];
        this.bezel.addEventListener('animationend', () => {
            this.bezel.classList.remove('dplayer-bezel-transition');
        });

        // play and pause button
        this.playButton = this.container.getElementsByClassName('dplayer-play-icon')[0];
        this.paused = true;
        this.playButton.addEventListener('click', () => {
            this.toggle();
        });

        const videoWrap = this.container.getElementsByClassName('dplayer-video-wrap')[0];
        const conMask = this.container.getElementsByClassName('dplayer-controller-mask')[0];
        if (!isMobile) {
            videoWrap.addEventListener('click', () => {
                this.toggle();
            });
            conMask.addEventListener('click', () => {
                this.toggle();
            });
        }
        else {
            const toggleController = () => {
                if (this.container.classList.contains('dplayer-hide-controller')) {
                    this.container.classList.remove('dplayer-hide-controller');
                }
                else {
                    this.container.classList.add('dplayer-hide-controller');
                }
            };
            videoWrap.addEventListener('click', toggleController);
            conMask.addEventListener('click', toggleController);
        }

        let lastPlayPos = 0;
        let currentPlayPos = 0;
        let bufferingDetected = false;
        window.requestAnimationFrame = (() =>
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        )();

        const setCheckLoadingTime = () => {
            this.checkLoading = setInterval(() => {
                // whether the video is buffering
                currentPlayPos = this.video.currentTime;
                if (!bufferingDetected
                    && currentPlayPos === lastPlayPos
                    && !this.video.paused) {
                    this.container.classList.add('dplayer-loading');
                    bufferingDetected = true;
                }
                if (bufferingDetected
                    && currentPlayPos > lastPlayPos
                    && !this.video.paused) {
                    this.container.classList.remove('dplayer-loading');
                    bufferingDetected = false;
                }
                lastPlayPos = currentPlayPos;
            }, 100);
        };

        const clearCheckLoadingTime = () => {
            clearInterval(this.checkLoading);
        };

        this.playedTime = false;
        this.animationFrame = () => {
            if (this.playedTime) {
                this.updateBar('played', this.video.currentTime / this.video.duration, 'width');
                this.container.getElementsByClassName('dplayer-ptime')[0].innerHTML = utils.secondToTime(this.video.currentTime);
            }
            window.requestAnimationFrame(this.animationFrame);
        };
        window.requestAnimationFrame(this.animationFrame);

        this.setTime = (type) => {
            if (!type) {
                this.playedTime = true;
                setCheckLoadingTime();
            }
            else {
                this[`${type}Time`] = true;
                if (type === 'played') {
                    setCheckLoadingTime();
                }
            }
        };
        this.clearTime = (type) => {
            if (!type) {
                this.playedTime = false;
                clearCheckLoadingTime();
            }
            else {
                this[`${type}Time`] = false;
                if (type === 'played') {
                    clearCheckLoadingTime();
                }
            }
        };

        this.isTimeTipsShow = true;
        this.mouseHandler = this.mouseHandler(pbar, pbarTimeTips).bind(this);
        pbar.addEventListener('mousemove', this.mouseHandler);
        pbar.addEventListener('mouseleave', this.mouseHandler);

        const thumbMove = (e) => {
            let percentage = (e.clientX - utils.getElementViewLeft(pbar)) / barWidth;
            percentage = percentage > 0 ? percentage : 0;
            percentage = percentage < 1 ? percentage : 1;
            this.updateBar('played', percentage, 'width');
            this.container.getElementsByClassName('dplayer-ptime')[0].innerHTML = utils.secondToTime(percentage * this.video.duration);
        };

        const thumbUp = (e) => {
            document.removeEventListener('mouseup', thumbUp);
            document.removeEventListener('mousemove', thumbMove);
            let percentage = (e.clientX - utils.getElementViewLeft(pbar)) / barWidth;
            percentage = percentage > 0 ? percentage : 0;
            percentage = percentage < 1 ? percentage : 1;
            this.updateBar('played', percentage, 'width');
            this.seek(parseFloat(bar.playedBar.style.width) / 100 * this.video.duration);
            this.setTime();
        };

        pbar.addEventListener('mousedown', () => {
            barWidth = pbar.clientWidth;
            this.clearTime();
            document.addEventListener('mousemove', thumbMove);
            document.addEventListener('mouseup', thumbUp);
        });

        /**
         * control volume
         */
        const volumeEle = this.container.getElementsByClassName('dplayer-volume')[0];
        const volumeBarWrapWrap = this.container.getElementsByClassName('dplayer-volume-bar-wrap')[0];
        const volumeBarWrap = this.container.getElementsByClassName('dplayer-volume-bar')[0];
        const volumeicon = this.container.getElementsByClassName('dplayer-volume-icon')[0].getElementsByClassName('dplayer-icon-content')[0];
        const vWidth = 35;

        this.switchVolumeIcon = () => {
            if (this.volume() >= 0.8) {
                volumeicon.innerHTML = this.icons.get('volume-up');
            }
            else if (this.volume() > 0) {
                volumeicon.innerHTML = this.icons.get('volume-down');
            }
            else {
                volumeicon.innerHTML = this.icons.get('volume-off');
            }
        };
        const volumeMove = (event) => {
            const e = event || window.event;
            const percentage = (e.clientX - utils.getElementViewLeft(volumeBarWrap) - 5.5) / vWidth;
            this.volume(percentage);
        };
        const volumeUp = () => {
            document.removeEventListener('mouseup', volumeUp);
            document.removeEventListener('mousemove', volumeMove);
            volumeEle.classList.remove('dplayer-volume-active');
        };

        volumeBarWrapWrap.addEventListener('click', (event) => {
            const e = event || window.event;
            const percentage = (e.clientX - utils.getElementViewLeft(volumeBarWrap) - 5.5) / vWidth;
            this.volume(percentage);
        });
        volumeBarWrapWrap.addEventListener('mousedown', () => {
            document.addEventListener('mousemove', volumeMove);
            document.addEventListener('mouseup', volumeUp);
            volumeEle.classList.add('dplayer-volume-active');
        });
        volumeicon.addEventListener('click', () => {
            if (this.video.muted) {
                this.video.muted = false;
                this.switchVolumeIcon();
                this.updateBar('volume', this.volume(), 'width');
            }
            else {
                this.video.muted = true;
                volumeicon.innerHTML = this.icons.get('volume-off');
                this.updateBar('volume', 0, 'width');
            }
        });

        /**
         * auto hide controller
         */
        this.hideTime = 0;
        const hideController = () => {
            this.container.classList.remove('dplayer-hide-controller');
            clearTimeout(this.hideTime);
            this.hideTime = setTimeout(() => {
                if (this.video.played.length && !this.disableHideController) {
                    this.container.classList.add('dplayer-hide-controller');
                }
            }, 1500);
        };
        if (!isMobile) {
            this.container.addEventListener('mousemove', hideController);
            this.container.addEventListener('click', hideController);
        }

        /**
         * loop control
         */
        this.loop = this.options.loop;
        const loopEvent = () => {
            const loopIcon = this.container.getElementsByClassName('dplayer-loop-icon')[0];
            const loopIn = loopIcon.getElementsByClassName('dplayer-icon-content')[0];

            this.events.on('loop_enable', () => {
                loopIn.style.opacity = '';
            });
            this.events.on('loop_disable', () => {
                loopIn.style.opacity = '0.4';
            });

            loopIcon.addEventListener('click', () => {
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
            this.container.getElementsByClassName('dplayer-dtime')[0].innerHTML = this.video.duration ? utils.secondToTime(this.video.duration) : '00:00';
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
        this.container.getElementsByClassName('dplayer-full-icon')[0].addEventListener('click', () => {
            this.fullScreen.toggle('browser');
        });

        // web page full screen
        this.container.getElementsByClassName('dplayer-full-in-icon')[0].addEventListener('click', () => {
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
                    hideController();
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

        this.updateBar('played', time / this.video.duration, 'width');
    }

    /**
     * Play video
     */
    play () {
        this.paused = false;
        if (this.video.paused) {
            this.bezel.innerHTML = this.icons.get('play');
            this.bezel.classList.add('dplayer-bezel-transition');
        }

        this.playButton.innerHTML = this.icons.get('pause');

        this.video.play();
        this.setTime();
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
            this.bezel.innerHTML = this.icons.get('pause');
            this.bezel.classList.add('dplayer-bezel-transition');
        }

        this.ended = false;
        this.playButton.innerHTML = this.icons.get('play');
        this.video.pause();
        this.clearTime();
        this.container.classList.remove('dplayer-playing');
    }

    /**
     * Set volume
     */
    volume (percentage, send_notice) {
        percentage = parseFloat(percentage);
        if (!isNaN(percentage)) {
            percentage = percentage > 0 ? percentage : 0;
            percentage = percentage < 1 ? percentage : 1;
            this.updateBar('volume', percentage, 'width');
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
            // this.container.getElementsByClassName('dplayer-time')[0].style.display = 'none';
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
                this.container.getElementsByClassName('dplayer-dtime')[0].innerHTML = utils.secondToTime(video.duration);
            }
        });

        // show video loaded bar: to inform interested parties of progress downloading the media
        this.on('progress', () => {
            const percentage = video.buffered.length ? video.buffered.end(video.buffered.length - 1) / video.duration : 0;
            this.updateBar('loaded', percentage, 'width');
        });

        // video download error: an error occurs
        this.on('error', () => {
            this.tran && this.notice && this.notice(this.tran('This video fails to load'), -1);
        });

        // video end
        this.ended = false;
        this.on('ended', () => {
            this.updateBar('played', 1, 'width');
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
        const noticeEle = this.container.getElementsByClassName('dplayer-notice')[0];
        noticeEle.innerHTML = text;
        noticeEle.style.opacity = opacity;
        if (this.noticeTime) {
            clearTimeout(this.noticeTime);
        }
        this.events.trigger('notice_show');
        this.noticeTime = setTimeout(() => {
            noticeEle.style.opacity = 0;
            this.events.trigger('notice_hide');
        }, time);
    }

    resize () {
        this.events.trigger('resize');
    }
}

module.exports = DPlayer;
