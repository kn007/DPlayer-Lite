## Introduction
DPlayer Lite, based on [DPlayer](https://github.com/MoePlayer/DPlayer) 1.24.0 3778020.

![dplayer-lite-preview](https://user-images.githubusercontent.com/6196903/33885965-eed74a92-df7f-11e7-9a18-d8e53b522c3f.png)

**DPlayer Lite Supports:**

- Streaming Formats
	- [HLS](https://github.com/video-dev/hls.js)
	- [FLV](https://github.com/Bilibili/flv.js)
	- [DASH](https://github.com/Dash-Industry-Forum/dash.js)
	- [WebTorrent](https://github.com/webtorrent/webtorrent)
	- Any other custom streaming formats
- Media Formats
	- MP4 H.264
	- WebM
	- Ogg Theora Vorbis
- Features
	- Hotkeys
	- Loop Control Button

## Usage

Name|Default|Note
----|-------|----
container | document.getElementsByClassName('dplayer')[0] | player container
autoplay | false | not supported in mobile browsers
theme | '#b7daff' | main color
loop | false | upon reaching the end of the video, automatically seek back to the start
lang | navigator.language.toLowerCase() | values: 'en', 'zh-cn', 'zh-tw'
preload | 'auto' | values: 'none', 'metadata', 'auto'
volume | 1 | default volume
video | undefined | video info
video.url | undefined | video link
video.pic | undefined | video poster
video.type | 'auto' | [HLS support](http://dplayer.js.org/docs/#/?id=hls-support) [FLV support](http://dplayer.js.org/docs/#/?id=flv-support) [MPEG DASH support](http://dplayer.js.org/docs/#/?id=mpeg-dash-support) [WebTorrent support](http://dplayer.js.org/docs/#/?id=webtorrent-support)
mutex | true | pause other players when this player start play

## Other

- [DPlayerHandle for Wordpress](https://github.com/kn007/DPlayerHandle)

