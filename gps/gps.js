var state;
var record_button;
var reset_button;
var display;
var locations = [];
var current_tick;
var last_tick;
var TICK_RATE = 10 * 1000;
var is_recording = false;

function LocationRecord(location)
{
	var r = {};
	r.latitude = location.coords.latitude;
	r.longitude = location.coords.longitude;
	r.accuracy = location.coords.accuracy;
	r.timestamp = Date.now();
	return r;
}

function find(e){ return document.querySelector(e);	}
function LOG(e){ console.log(e); }

function init()
{
	state = find('.state');
	display = find('.display');

	record_button = find('.start');
	record_button.addEventListener('click', function()
	{
		is_recording = !is_recording;
		if(is_recording) start_recording();
		else stop_recording();
	});

	reset_button = find('.reset');
	reset_button.addEventListener('click', function()
	{
		locations = [];
		state.innerHTML = 'Locations recorded: 0';
	});

	/*
	var tick_slider = find('.time-range input');
	tick_slider.addEventListener('change', function(e)
	{
		TICK_RATE = e.target.value * 1000;
		find('.tick-display').innerHTML = e.target.value;
	});
	*/
}
init();

function start_recording()
{
	if(!navigator.geolocation)
	{
		LOG('No location support');
		return;
	}

	record_button.innerHTML = 'Stop';
	last_tick = window.performance.now();
	record_location();
	current_tick = 0;
	requestAnimationFrame(update);
}

function stop_recording()
{
	cancelAnimationFrame(update);
	record_button.innerHTML = 'Start';

	//write locations to page	
	var display_text = "[";

	for(var i = 0; i < locations.length; ++i)
	{
		var l = locations[i];
		//LOG('Latitude: ' + l.latitude + ' Longitude: ' + l.longitude + ' Time: ' + l.timestamp);

		display_text += l.longitude + ', ';
		display_text += l.latitude;
		if(i !== locations.length-1) display_text += ', '
	}

	display_text += ']<br> Times: [';

	for(var i = 0; i < locations.length; ++i)
	{
		var l = locations[i];
		display_text += l.timestamp;
		if(i !== locations.length-1) display_text += ', '
	}

	display_text += ']';
	display.innerHTML = display_text;
}

function update(t)
{
	if(is_recording === false) return;

	var dt = (t - last_tick);
	current_tick += dt;
	last_tick = t;
	if(current_tick > TICK_RATE)
	{
		record_location();
		current_tick -= TICK_RATE;
	}

	requestAnimationFrame(update);
}

function record_location()
{
	navigator.geolocation.getCurrentPosition(function(location) 
	{
	  	var record = LocationRecord(location);
	  	locations.push(record);
	});

	state.innerHTML = 'Locations recorded: ' + locations.length + ' at ' + Date.now();
}