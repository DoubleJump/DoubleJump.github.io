var PI = 3.1415926535897932;
var TAU = 6.28318530718;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var TW = TweenMax;
var easein = Power2.easeIn;
var easeout = Power2.easeOut;
var ease_quick = Power3.easeOut;
var easeback = Back.easeOut.config(1.7);
var linear = Power0.easeOut;
var timelines = {};
var state = 'init';
var can_click = true;
var E;
var mx,my;
var top_left = [0,0];
var anchor_l = [341,312];
var anchor_r = [468,312];
var anchor_c = [400,300];

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

function center(el)
{
	TW.set(el, {transformOrigin:"50% 50%"});
}
function hide(el)
{
	TW.set(el, {opacity:0});
}

function build_timelines()
{
	E = svg_find(
	{
		bg: 'bg',
		button: 'button',
		cursor: 'cursor',
		arm_left: 'arm-left',
		arm_right: 'arm-right',
		hand_left: 'hand-left',
		hand_right: 'hand-right',
	}, document, '.cta-');
	log(E)

	center(E.hand_left);
	center(E.hand_right);

	on_resize();
}

function vec_angle_2D(v)
{
	return (Math.atan2(v[1], v[0]) * RAD2DEG) + 180;
}

function update()
{
	requestAnimationFrame(update);

	var to_left = 
	[
		mx - anchor_l[0],
		my - anchor_l[1]
	];

	var to_right = 
	[
		mx - anchor_r[0],
		my - anchor_r[1]
	];

	var to_center = 
	[
		mx - anchor_c[0],
		my - anchor_c[1]
	];

	var dist_to_center = Math.sqrt(to_center[0] * to_center[0] 
								 + to_center[1] * to_center[1]);

	var angle_l = vec_angle_2D(to_left);
	var angle_r = vec_angle_2D(to_right);

	if(angle_l > 90 && angle_l < 270)
	{
		TW.set(E.hand_left, {scaleY:-1})
	}
	else
	{
		TW.set(E.hand_left, {scaleY:1})
	}

	if((angle_r > 0 && angle_r < 90) ||
		(angle_r < 360 && angle_r > 270))
	{
		TW.set(E.hand_right, {scaleY:-1})
	}
	else
	{
		TW.set(E.hand_right, {scaleY:1})
	}
	

	if(dist_to_center < 30)
	{
		TW.set(E.cursor, {x:anchor_c[0], y:anchor_c[1]});
	}
	else TW.set(E.cursor, {x:mx, y:my});

	if(!isNaN(angle_l))
	{
		TW.set(E.arm_left, 
		{
			x:to_left[0] * 0.05, 
			y:to_left[1] * 0.05, 
			rotation:angle_l-180
		});
	}
	if(!isNaN(angle_r))
	{
		TW.set(E.arm_right, 
		{
			x:to_right[0] * 0.05, 
			y:to_right[1] * 0.05, 
			rotation:angle_r
		});
	}

	TW.set(E.button, 
	{
		x:to_center[0] * 0.02,
		y:to_center[1] * 0.02
	});
}

function init()
{
	build_timelines();
	window.addEventListener('click', on_click);
	//window.addEventListener('resize', on_resize);

	var svg = document.querySelector('svg');
	var anim = document.querySelector('.animation');

	//svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
	//svg.setAttribute('width', '100%');
	//svg.setAttribute('height', '100%');
	svg.addEventListener('click', on_click);
	anim.addEventListener('click', on_click);
	anim.addEventListener('touchstart', on_touch_start);
	anim.addEventListener('touchmove', on_touch_move);
	//anim.addEventListener('touchend', on_click);
	anim.addEventListener('mousemove', on_mouse_move);

	requestAnimationFrame(update);
}

function on_click(e)
{
	on_mouse_move(e);
	//e.preventDefault();
}

function on_resize()
{
	var anim = document.querySelector('.animation');
	top_left = [anim.offsetLeft, anim.offsetTop];
}

function on_touch_start(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];
		mx = it.screenX;
		my = it.screenY;
		break;
	}
}

function on_touch_move(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];
		mx = it.screenX;
		my = it.screenY;
		break;
	}
	e.preventDefault();
}

function on_mouse_move(e)
{
	mx = e.clientX;// - top_left[0];
	my = e.clientY;// - top_left[1];
}

window.addEventListener('load', init);