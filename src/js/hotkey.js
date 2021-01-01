class HotKey {
    constructor(player) {
        document.addEventListener('keydown', (e) => {
            if (player.focus) {
                const event = e || window.event;
                let percentage;
                switch (event.keyCode) {
                case 27:
                    if (player.fullScreen.isFullScreen('web')) {
                        player.fullScreen.cancel('web');
                    }
                    break;
                case 32:
                    event.preventDefault();
                    player.toggle();
                    player.controller.setAutoHide();
                    break;
                case 37:
                    event.preventDefault();
                    if (player.options.live) {
                        break;
                    }
                    player.seek(player.video.currentTime - 3, true);
                    break;
                case 39:
                    event.preventDefault();
                    if (player.options.live) {
                        break;
                    }
                    player.seek(player.video.currentTime + 3, true);
                    break;
                case 38:
                    event.preventDefault();
                    percentage = player.volume() + 0.01;
                    player.volume(percentage, true);
                    break;
                case 40:
                    event.preventDefault();
                    percentage = player.volume() - 0.01;
                    player.volume(percentage, true);
                    break;
                }
            }
        });
    }
}

export default HotKey;