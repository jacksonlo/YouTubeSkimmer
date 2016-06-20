# YTSkimmer
Enhanced Video controls for watching/skimming over youtube videos. YTSkimmer allows you to watch a single video with multi-screens with easy global controls for all video players (ie. speed, quality, playback etc...).

Great for sport highlights, powerpoint videos, long videos or if you just want a quick overview of what's in the video (ie. skimming the video!)

##Basic Usage
1. Go to https://jacksonlo.github.io/YouTubeSkimmer/index.html or download and open index.html
2. Enter the youtube url into the searchbox and press submit.
3. Press Play/Pause at the Topbar to pause or resume all videos.
4. Hover over a video to hear the sound for that video since all videos will be muted by default.
5. Press Mute/Unmute at the Topbar to mute or unmute all videos. Note, when Muted there is the hover for sound feature.
6. Change current videos' speed by selecting from the speed dropdown in the topbar.
7. Change current videos' quality by selecting from the quality dropdown in the topbar.

##Advanced Usage Parameters
####Get Parameters

**v**: Video ID

**speed**: Playback speed of video times 100, ie. Speed 0.5=> ?speed=50, or Speed 1.25=> ?speed=125 etc..., default is 100 (1x speed)

**mute**: Initial mute or unmute status of videos, 1 for mute, 0 for unmuted, default is 1

**n**: Number of players at the same time, default is 4

**h**: Numerical value of the height of all players, default is 390

**w**: Numerical value of the width of all players, default is 640

**quality**: Quality of the videos, default on default, can be the string values: small, medium, large, hd720, hd1080, highres or default

**controls**: 1 or 0 to enable or disable the video controls on hover, default is 0 for disabled



