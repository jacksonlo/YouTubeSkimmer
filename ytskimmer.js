//Gather video and other parameters/settings from URL
var getVars = getUrlVars();
var players = new Array();
var videosReady = 0;
var speed = getVars['speed'] ? getVars['speed']/100 : 1;
var mute = getVars['mute'] ? getVars['mute'] : 1;
var n = getVars['n'] ? getVars['n'] : 4;
var height = getVars['h'] ? getVars['h'] : '390';
var width = getVars['w'] ? getVars['w'] : '640';
var quality = getVars['quality'] ? getVars['quality'] : 'default'; /* small, medium, large, hd720, hd1080, highres or default */
var controls = getVars['controls'] ? getVars['controls'] : 0;
var v = getVars['v'];
var duration = 0;

//Create video embed iframes accordingly when ready
function onYouTubeIframeAPIReady() {
	if(!(v === undefined)) {
		var videoContainer = $("#videos");
		for(var i = 0; i < n; ++i) {
			$("#videos").append("<div id='player"+i+"' index='"+i+"'></div>");
			players[i] = new YT.Player('player'+i, {
				height: height,
				width: width,
				videoId: getVars['v'] ? getVars['v'] : '_L9WuoFxy-8',
				playerVars: { 'autoplay': 0, 'controls': controls, 'rel': 0 },
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});
		}
	}

	//Logo for fun
	$("#logo").on('mouseenter', function() {
		$(this).attr('src', 'images/logo.gif');
	});

	$("#logo").on("mouseleave", function() {
		$(this).attr('src', 'images/logo.png');
	});

	//Topbar play-pause button
	$("#play-pause-button").on('click', function() {
		if($(this).find('.media-title').text() == "Play") {
			setPauseReady();
		} else {
			setPlayReady();
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
	$("#quality-dropdown").on('click', 'li', function () {
		var quality = $(this).attr('value');
		for(var i = 0; i < n; ++i) {
			players[i].setPlaybackQuality(quality);
		}
	});

	//Mute button
	$("#mute-button").on('click', function() {
		var title = $(this).find(".media-title");
		var icon = $(this).find(".media-icon");
		if(title.text() == "Mute") {
			muteOn = true;
			for(var i = 0; i < n; ++i) {
				players[i].mute();
			}
			title.text("Unmute");
			icon.attr('src', "images/mute.png");
		} else {
			muteOn = false;
			for(var i = 0; i < n; ++i) {
				players[i].unMute();
			}
			title.text("Mute");
			icon.attr('src', "images/unmute.png");
		}
	});

	//Toggle controls button
	// $("#toggle-controls-button").on('click', function() {
	// 	for(var i = 0; i < n; ++i) {
	// 		players[i].
	// 	}
	// });

	//Quality and Speed dropdowns
	$(".dropdown-menu li").on('click', function() {
		$(this).addClass('active').siblings().removeClass('active');
	});

	//Submit form for new video
	$("#video-form").on('submit', function() {
		var input = $(this).find('[name="v"]');
		input.val(youtube_parser(input.val()));
	});

	//Volume slider
	$("#volume-slider").on("change mousemove", function() {
		var volume = $(this).val();
		for(var i = 0; i < n; ++i) {
			players[i].setVolume(volume);
		}
		$("#volume-value").text(volume);
	});
}

// On player state change method
var done = false;
var progressInterval;
var initialized = false;
var vidoesDone = false;
function onPlayerStateChange(event) {
	if(event.data == YT.PlayerState.PLAYING) {
		setPauseReady(true);
	}

	if (event.data == YT.PlayerState.PLAYING && !done) {
		if(!initialized) {
			initialize();
			initialized = true;
		}
		done = true;
	} else if (event.data == YT.PlayerState.ENDED) {
		//Stop all videos
		//Stop after 2 seconds to account for division
		setTimeout(stopVideo, 2000);
		setTimeout(function() { setPlayReady(true) }, 2000);
		videosReady = 0;
		//clearInterval(progressInterval);
	} else if (event.data == YT.PlayerState.CUED && !done) {
		videosReady++;
		if(videosReady == n) {
			for(var i = 0; i < n; ++i) {
				players[i].playVideo();
			}
		}
	}
}
function stopVideo() {
	for(var i = 0; i < n; ++i) {
		players[i].stopVideo();
	}
	videosDone = true;
}

//On player ready method, set's video settings
function onPlayerReady(event) {
	event.target.setPlaybackRate(speed);
	duration = Math.floor(event.target.getDuration()/n);
	var index = players.indexOf(event.target);
	event.target.seekTo(duration*index, false);
	event.target.setPlaybackQuality(quality);

	//Progress bar
	if(index == 0) {
		$("#progress-bar").attr('max', players[0].getDuration()/n);
	}
	
	if(mute) {
		event.target.mute();
	}

}

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value.replace(/#/g, "");
	});
	return vars;
}

function youtube_parser(url){
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = url.match(regExp);
	return (match&&match[7].length==11)? match[7] : false;
}

function initialize() {
	//Progress bar
	$("#progress-bar").on("change mouseup", function() {
		var value = $(this).val();
		for(var i = 0; i < n; ++i) {
			var newTime = Number(i*duration) + Number(value);
			players[i].seekTo(Math.floor(newTime));
		}
	});

	progressInterval = setInterval(function() {
		$("#progress-bar").val(players[0].getCurrentTime());
	}, 1000);

	//Mute on hover video
	$(document).on('mouseenter', 'iframe', function() {
		if(!mute) return;

		var index = $(this).attr('index');
		players[index].unMute();
	});

	$(document).on('mouseleave', 'iframe', function() {
		if(!mute) return;

		var index = $(this).attr('index');
		players[index].mute();
	});
}

function setPlayReady(justIcons) {
	justIcons = justIcons || false;

	var button = $("#play-pause-button");
	var title = button.find(".media-title");
	var icon = button.find(".media-icon");	

	if(!justIcons) {
		for(var i = 0; i < n; ++i) {
			players[i].pauseVideo();
		}
	}
	title.text('Play');
	icon.attr('src', 'images/play.png');
}

function setPauseReady(justIcons) {
	justIcons = justIcons || false;

	var button = $("#play-pause-button");
	var title = button.find(".media-title");
	var icon = button.find(".media-icon");	

	if(!justIcons) {
		for(var i = 0; i < n; ++i) {
			if(videosDone) {
				videosReady = n;
				players[i].seekTo(i*duration, false);
			}
			players[i].playVideo();
		}
	}
	title.text('Pause');
	icon.attr('src', 'images/pause.png');
}