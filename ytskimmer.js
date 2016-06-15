//Gather video and other parameters/settings from URL
var getVars = getUrlVars();
var players = new Array();
var videosReady = 0;
var speed = getVars['speed'] ? getVars['speed']/100 : 2;
var mute = getVars['mute'] ? getVars['mute'] : 0;
var n = getVars['n'] ? getVars['n'] : 4;
var height = getVars['h'] ? getVars['h'] : '390';
var width = getVars['w'] ? getVars['w'] : '640';
var quality = getVars['quality'] ? getVars['quality'] : 'default'; /* small, medium, large, hd720, hd1080, highres or default */
var controls = getVars['controls'] ? getVars['controls'] : 1;

//Create video embed iframes accordingly when ready
function onYouTubeIframeAPIReady() {
	var videoContainer = $("#videos");
	for(var i = 0; i < n; ++i) {
		$("#videos").append("<div id='player"+i+"'></div>");
		players[i] = new YT.Player('player'+i, {
			height: height,
			width: width,
			videoId: getVars['v'] ? getVars['v'] : 'NRAAn1xI2aM',
			playerVars: { 'autoplay': 0, 'controls': controls },
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
	}
}

// On player state change method
var done = false;
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		// setTimeout(stopVideo, 6000);
		done = true;
	} else if (event.data == YT.PlayerState.ENDED) {
		//Stop all videos
		for(var i = 0; i < n; ++i) {
			//Stop after 2 seconds to account for division
			setTimeout(stopVideo(players[i]), 2000);
		}
		videosReady = 0;
	} else if (event.data == YT.PlayerState.CUED && !done) {
		videosReady++;
		if(videosReady == n) {
			for(var i = 0; i < n; ++i) {
				players[i].playVideo();
			}
		}
	}
}
function stopVideo(player) {
	player.stopVideo();
}

//On player ready method, set's video settings
function onPlayerReady(event) {
	event.target.setPlaybackRate(speed); // This is what you're looking for
	var length = Math.floor(event.target.getDuration()/n);
	var index = players.indexOf(event.target);
	event.target.seekTo(length*index, false);
	event.target.setPlaybackQuality(quality);
	
	if(mute) {
		event.target.mute();
	}

	event.target.pauseVideo();
}

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	vars[key] = value;
	});
	return vars;
}

$(document).ready(function() {
	//Topbar play-pause button
	$("#play-pause-button").on('click', function() {
		var current = $(this).text();
		if(current == "Play") {
			$(this).text('Pause');
			for(var i = 0; i < n; ++i) {
				players[i].pauseVideo();
			}
		} else {
			$(this).text('Play');
			for(var i = 0; i < n; ++i) {
				players[i].playVideo();
			}
		}
	});

	//Topbar speed selector dropdown
	$("#speed-dropdown").on('click', 'li', function() {
		var speed = $(this).attr('value');
		for(var i = 0; i < n; ++i) {
			players[i].setPlaybackRate(speed);
		}
	});

	//Topbar quality selector dropdown
});