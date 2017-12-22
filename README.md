## Introduction
DPlayer Lite, based on [DPlayer](https://github.com/MoePlayer/DPlayer) 1.17.2 44866d6.

![dplayer-lite-preview](https://user-images.githubusercontent.com/6196903/33885965-eed74a92-df7f-11e7-9a18-d8e53b522c3f.png)

**DPlayer Lite Supports:**

- Streaming Formats
	- [HLS](https://github.com/video-dev/hls.js)
	- [FLV](https://github.com/Bilibili/flv.js)
	- [DASH](https://github.com/Dash-Industry-Forum/dash.js)
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
video.type | 'auto' | 'flv' for flv format, 'hls' for m3u8 format, 'dash' for mpd format, 'normal' for mp4 ogg and webm format, 'auto' for automatic detection according to video suffix
icons | [options.js#L12](https://github.com/kn007/DPlayer-Lite/blob/DPlayer-Lite/src/options.js#L12) | UI icons
mutex | true | pause other players when this player start play
iconsColor | #ffffff | player icons color

## Other

- [DPlayerHandle for Wordpress](https://github.com/kn007/DPlayerHandle)

