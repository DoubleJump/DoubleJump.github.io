var TW = TweenMax;
var easein = Power2.easeIn;
var easeout = Power2.easeOut;
var easeback = Back.easeOut.config(1.7);
var linear = Power0.easeOut;

var tl_cloud_switch;
var tl_rain_paths;
var raining = false;

function svg_find(selectors, root, namespace)
{
	root = root || document; 
	for(var k in selectors)
	{
		var selector = selectors[k];
		if(namespace) selector = namespace + selector;
		var selection = root.querySelectorAll(selector);
		if(selection.length > 1) selectors[k] = selection;
		else selectors[k] = selection[0];
	}
	return selectors;
}

function log(m){console.log(m)}

function center_origin(el)
{
	TW.set(el, {transformOrigin:"50% 50%"});
}

function build_timelines()
{
	var E = svg_find(
	{
		bg: 'background',
		cloud_root: 'cloud-root',
		cloud: 'cloud',
		cloud_bits: 'cloud-bits ellipse',
		cloud_shadow: 'cloud-shadow',
		cloud_face: 'cloud-face',
		eye_l: 'eye-l',
		eye_r: 'eye-r',
		mouth: 'mouth',
		eye_mask_l: 'eye-mask-l',
		eye_mask_r: 'eye-mask-r',
		mouth_mask: 'mouth-mask',
		rain_lines: 'rain-lines',
		rain_paths: 'rain-lines path',
		arm: 'arm',
		upper_arm: 'upper-arm',
		lower_arm: 'lower-arm',
		head: 'head',
		brow_l: 'brow-l',
		brow_r: 'brow-r',
		brolly: 'brolly',
		brolly_top: 'brolly-top',
		brolly_shadow: 'brolly-shadow',
		floor: 'floor',
		bush_rear: 'bush-rear',
		bush_front: 'bush-front',
		wall: 'wall',
		wall_top: 'wall-top'
	}, document, '.rain-');
	log(E)
	
	center_origin(E.cloud);
	center_origin(E.cloud_shadow);
	TW.set(E.brolly_top, {transformOrigin:"50% 0%"});

	tl_cloud_switch = new TimelineMax({paused:true});
	tl_cloud_switch.to(E.bg, 0.5, {fill:"rgb(145 156 175)"}, 0.0);
	tl_cloud_switch.to(E.cloud_root, 0.3, {y:20}, 0.0);

	tl_cloud_switch.to(E.cloud, 0.5, {scale:1.5, ease:easeback}, 0.0);
	for(var i = 0; i < E.cloud_bits.length; ++i)
	{
		tl_cloud_switch.to(E.cloud_bits[i], 0.5, {fill:"rgb(88 104 127)"}, 0.0);
	}	
	tl_cloud_switch.to(E.cloud_shadow, 0.5, {fill:"rgb(70 89 112)"}, 0.0);
	tl_cloud_switch.to(E.eye_l, 	   0.5, {fill:"rgb(70 89 112)"}, 0.0);
	tl_cloud_switch.to(E.eye_r, 	   0.5, {fill:"rgb(70 89 112)"}, 0.0);
	tl_cloud_switch.to(E.mouth, 	   0.5, {fill:"rgb(70 89 112)"}, 0.0);

	tl_cloud_switch.to(E.eye_mask_l,   0.5, {fill:"rgb(88 104 127)"}, 0.0);
	tl_cloud_switch.to(E.eye_mask_r,   0.5, {fill:"rgb(88 104 127)"}, 0.0);
	tl_cloud_switch.to(E.mouth_mask, 0.5, {fill:"rgb(88 104 127)"}, 0.0);
	tl_cloud_switch.to(E.brolly_top, 0.5, {scaleX:0.1, scaleY:1.5, ease:easeout}, 0.0);
	tl_cloud_switch.to(E.brolly_shadow, 0.2, {opacity:0}, 0.0);
	
	tl_cloud_switch.to(E.lower_arm, 0.2, {rotation:95}, 0.1);
	tl_cloud_switch.to(E.head, 0.2, {y:5}, 0.2);
	tl_cloud_switch.to(E.brow_l, 0.5, {y:-2}, 0.0);
	tl_cloud_switch.to(E.brow_r, 0.5, {y:1}, 0.0);

	tl_cloud_switch.fromTo(E.rain_lines, 0.2, {opacity:0},{opacity:1}, 0.2);

	tl_cloud_switch.to(E.mouth_mask, 0.5, {y:-16}, 0.0);
	tl_cloud_switch.to(E.eye_mask_l, 0.5, {x:-7}, 0.0);
	tl_cloud_switch.to(E.eye_mask_r, 0.5, {x:7}, 0.0);

	tl_cloud_switch.to(E.floor, 0.5, {fill:"rgb(96 103 109)", opacity:0.5}, 0.0);
	tl_cloud_switch.to(E.bush_rear, 0.5, {fill:"rgb(116 150 150)"}, 0.0);
	tl_cloud_switch.to(E.bush_front, 0.5, {fill:"rgb(90 122 120)"}, 0.0);
	tl_cloud_switch.to(E.wall, 0.5, {fill:"rgb(190 198 206)"}, 0.0);
	tl_cloud_switch.to(E.wall_top, 0.5, {fill:"rgb(117 135 150)"}, 0.0);



	tl_rain_paths = new TimelineMax({repeat:-1});
	for(var i = 0; i < E.rain_paths.length; ++i)
	{
		var path = E.rain_paths[i];
		var length = path.getTotalLength();
		//var length = 200;
		tl_rain_paths.fromTo(E.rain_paths[i], 1.5, 
			{strokeDashoffset:  0},
			{strokeDashoffset:-length, ease:linear}, 0.0);
	}
	

	//return tl;
}


function init()
{
	var svg = document.querySelector('svg');
	svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
	svg.setAttribute('width', '100%');
	svg.setAttribute('height', '100%');


	build_timelines();
	svg.addEventListener('click', on_click);
	svg.addEventListener('press', on_click);
	//window.addEventListener('keydown', on_key_down);
}
function on_key_down()
{
	tl_cloud_switch.stop();
	tl_rain_paths.stop();
}

function on_click()
{
	raining = !raining;
	if(raining)
	{
		tl_cloud_switch.play();
		tl_rain_paths.resume();
	}
	else
	{
		tl_cloud_switch.reverse();
		tl_rain_paths.paused();
	}
}

init()