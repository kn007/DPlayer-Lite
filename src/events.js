class Events {
    constructor () {
        this.events = {};

        this.videoEvents = [
            'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied', 'ended', 'error',
            'loadeddata', 'loadedmetadata', 'loadstart', 'mozaudioavailable', 'pause', 'play',
            'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend',
            'timeupdate', 'volumechange', 'waiting'
        ];
        this.playerEvents = [
            'loop_enable', 'loop_disable',
            'notice_show', 'notice_hide',
            'destroy', 'resize',
            'fullscreen', 'fullscreen_cancel', 'webfullscreen', 'webfullscreen_cancel'
        ];
    }

    on (name, callback) {
        if (this.type(name) && typeof callback === 'function') {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(callback);
        }
    }

    trigger (name, info) {
        if (this.events[name] && this.events[name].length) {
            for (let i = 0; i < this.events[name].length; i++) {
                this.events[name][i](info);
            }
        }
    }

    type (name) {
        if (this.playerEvents.indexOf(name) !== -1) {
            return 'player';
        }
        else if (this.videoEvents.indexOf(name) !== -1) {
            return 'video';
        }

        console.error(`Unknown event name: ${name}`);
        return null;
    }
}

module.exports = Events;
