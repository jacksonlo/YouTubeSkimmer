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
var videosDone = false;
var videoRatio = {x: 16, y: 10};

//General initializations
$(document).ready(function() {
	//Height and width adjustments
	$("#fit-to-screen").on('click', function() {
		if(v === undefined) {
			alert("Please submit a YouTube URL first!");
			return;
		}
		adjustVideoSize();

		var newURL = location.protocol + '//' + location.host + location.pathname;
		var settings = getUrlVars();
		newURL += "?v=" + settings['v'];
		settings['h'] = height;
		settings['w'] = width;

		//Set all settings but video
		for(var q in settings) {
			if (settings.hasOwnProperty(q)) {
				if(q == "v") continue;

				newURL += "&" + q + "=" + settings[q];
			}
		}
		window.location.assign(newURL);
	});
	
	//Logo for fun
	$("#logo").on('mouseenter', function() {
		$(this).attr('src', 'images/logo.gif');
	});

	$("#logo").on("mouseleave", function() {
		$(this).attr('src', 'images/logo.png');
	});

	//Quality and Speed dropdowns
	$(".dropdown-menu li").on('click', function() {
		$(this).addClass('active').siblings().removeClass('active');
	});

	//Submit form for new video
	$("#video-form").on('submit', function() {
		var input = $(this).find('[name="v"]');
		input.val(youtubeParser(input.val()));
	});
});

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
		if(mute == 1) {
			mute = 0;
			for(var i = 0; i < n; ++i) {
				players[i].unMute();
			}
			title.text("Mute All");
			icon.attr('src', "images/mute.png");
		} else if(mute == 2) {
			mute = 1;
			for(var i = 0; i < n; ++i) {
				players[i].mute();
			}
			title.text("UnMute All");
			icon.attr('src', "images/unmute.png");
		} else {
			mute = 2;
			for(var i = 0; i < n; ++i) {
				players[i].mute();
			}
			title.text("UnMute on Hover");
			icon.attr('src', "images/unmute_hover.png");
		}
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

//Stop all videos method
function stopVideo() {
	for(var i = 0; i < n; ++i) {
		players[i].stopVideo();
	}
	videosDone = true;
}

//On player ready method, sets video settings
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

//Get's GET URL vars
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value.replace(/#/g, "");
	});
	return vars;
}

//Parses YouTube URL for video id
function youtubeParser(url){
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = url.match(regExp);
	return (match&&match[7].length==11)? match[7] : false;
}

//Prepares initial video player settings such as progress bar
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
		if(mute != 1) return;

		var index = $(this).attr('index');
		players[index].unMute();
	});

	$(document).on('mouseleave', 'iframe', function() {
		if(mute != 1) return;

		var index = $(this).attr('index');
		players[index].mute();
	});
}

//Sets the videos to be ready to play (pauses them all)
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

//Sets the videos to be pause ready (plays them all)
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

// With the current screen size and "n" videos, sets the height and widht of videos
// in order to properly maximize the videos
function adjustVideoSize() {
	var x = screen.width;
	var y = screen.height;
	var factor = Math.sqrt( ((x * y)/n) / (videoRatio.x * videoRatio.y));
	var newWidth = factor*videoRatio.x;
	var newHeight = factor*videoRatio.y;

	//Adjust width and height to a whole number for most ratios
	var ratio = (Math.ceil(x/newWidth) * newWidth)/x;

	newWidth = newWidth / ((Math.ceil(x/newWidth) * newWidth)/x);
	newHeight = newHeight / ((Math.ceil(y/newHeight) * newHeight)/y);

	//Re-round to nearest ratio and adjust for window size and navbar
	var navbarH;
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	if(windowWidth < 768 || windowWidth >= 1400) {
		navbarH = 80;
	} else if (windowWidth < 881) {
		navbarH = 80 * 3;
	} else if(windowWidth < 1400) {
		navbarH = 80 * 2;
	}

	var windowAdjustY = (windowHeight - navbarH) / y;
	var windowAdjustX = (windowWidth - 20) / x;
	newHeight = newHeight * windowAdjustY;
	newWidth = (newWidth  - videoRatio.x * 2) * windowAdjustX;
	width = Math.floor(newWidth / videoRatio.x) * videoRatio.x;
	height = Math.floor(newHeight / videoRatio.y) * videoRatio.y;
}