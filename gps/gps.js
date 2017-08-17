var locations = [];
var current_tick;
var last_tick;
var TICK_RATE = 60 * 1000;
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

function find(e)
{
	return document.querySelector(e);	
}

function LOG(e)
{
	console.log(e);
}

function init()
{
	var record_button = find('.button');
	record_button.addEventListener('click', function()
	{
		is_recording = !is_recording;
		if(is_recording)
		{
			record_button.innerHTML = 'Stop';
			start_recording();
		}
		else
		{
			record_button.innerHTML = 'Start';
			stop_recording();
		}
	});

	var tick_slider = find('.time-range input');
	tick_slider.addEventListener('change', function(e)
	{
		TICK_RATE = e.target.value * 1000;
		find('.tick-display').innerHTML = e.target.value;
	});
}
init();

function start_recording()
{
	if(!navigator.geolocation)
	{
		LOG('No location support');
		return;
	}

	LOG('Recording...');
	last_tick = window.performance.now();
	record_location();
	current_tick = 0;
	requestAnimationFrame(update);
}

function stop_recording()
{
	cancelAnimationFrame(update);

	LOG('Recording stopped');

	//write locations to page
	var display = document.querySelector('.display');
	
	var display_text = "Count: " + locations.length;

	display_text += " Positions: [";

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
		LOG('Tick: ' + current_tick);
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
}