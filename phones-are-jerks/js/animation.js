var TW = TweenMax;
var easein = Power2.easeIn;
var easeout = Power2.easeOut;
var ease_quick = Power3.easeOut;
var easeback = Back.easeOut.config(1.7);
var linear = Power0.easeOut;
var timelines = {};
var state = 'init';
var can_click = true;

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
	var E = svg_find(
	{
		bg: 'background rect',
		alert: 'alert',
		sneak_face: 'sneak-face',
		phone: 'phone',
		buzz_rings: 'buzz-ring circle',
		alarm_screen: 'alarm-screen',
		alarm_text: 'alarm-text',
		alarm_button: 'alarm-button',
		alarm_pip: 'alarm-pip',
		alarm_active: 'alarm-active',
		laptop: 'laptop',
		lid_open: 'lid-open',
		lid_closed: 'lid-closed',
		power_light: 'power-light',
		power_led: 'power-led',
		power_glow: 'power-glow',
		desktop: 'desktop',
		window_front: 'window-front',
		window_middle: 'window-middle',
		window_rear: 'window-rear',
		surprise_face: 'surprise-face',
		eye_left: 'eye-left',
		eye_right: 'eye-right',
		mouth: 'mouth',
		zees: 'zees *',
	}, document, '.phone-');
	log(E)

	hide(E.alert);
	hide(E.buzz_rings);
	hide(E.alarm_screen);
	hide(E.alarm_text);
	hide(E.alarm_active);
	hide(E.lid_open);

	center(E.zees);
	center(E.alarm_screen);
	center(E.power_glow);
	center(E.buzz_rings);
	center(E.window_front);
	center(E.window_middle);
	center(E.window_rear);
	center(E.surprise_face);
	center(E.eye_left);
	center(E.eye_right);
	center(E.mouth);


	var buzz = RoughEase.ease.config(
	{
		template:  Power0.easeNone, 
		strength: 2, 
		points: 20, 
		taper: "none", 
		randomize: true,
		clamp: false
	});
	
	timelines.zees = new TimelineMax({repeat:-1})
		.fromTo(E.zees[0], 2.0, {opacity:1, scale:0}, {opacity:0, scale:2, x:10, y:-100}, 0.0)
		.fromTo(E.zees[1], 2.0, {opacity:1, scale:0}, {opacity:0, scale:1.5, x:-10, y:-100}, 0.5)
		.fromTo(E.zees[2], 1.5, {opacity:1, scale:0}, {opacity:0, scale:1.3, y:-100}, 1.0)


	timelines.power_light = new TimelineMax({repeat:-1})
		.fromTo(E.power_led, 2.0, {opacity:0}, {opacity:1}, 0.0)
		.to(E.power_led, 2.0, {opacity:0}, 2.0)

	timelines.power_glow = new TimelineMax({repeat:-1})
		.fromTo(E.power_glow, 2.0, {opacity:0.3, scale:0}, {opacity:0, scale:2}, 0.0)
		.to(E.power_glow, 2.0, {opacity:0, scale:2}, 2.0)

	TW.set(E.phone, {rotation:5, y:-4}, 0.0)
	timelines.phone_hop = new TimelineMax({paused:true})
		.to(E.phone, 0.2, {y:-20, ease:ease_quick}, 0.0)
		.to(E.phone, 0.4, {rotation:-5, ease:ease_quick}, 0.0)
		.to(E.phone, 0.2, {y:-4, ease:ease_quick}, 0.2)
		.to(E.phone, 0.4, {x:75, ease:ease_quick, onComplete:on_complete}, 0.0)
		.addLabel('hopA', 0.4)
		.to(E.phone, 0.2, {y:-20, ease:ease_quick}, 0.4)
		.to(E.phone, 0.4, {rotation:5, ease:ease_quick}, 0.4)
		.to(E.phone, 0.2, {y:-4,ease:ease_quick}, 0.6)
		.to(E.phone, 0.4, {x:150, ease:ease_quick, onComplete:on_complete}, 0.4)
		.to(E.sneak_face, 0.2, {opacity:0}, 0.8)
		.fromTo(E.alarm_screen, 0.2, {opacity:0, scale:0.5}, {opacity:1, scale:1}, 1.0)

		.to(E.alarm_text, 0.2, {opacity:1}, 1.0)
		.addLabel('hopB', 1.2)

		//.to(E.alarm_pip, 0.2, {x:30, fill:"rgb(63 239 122)"}, 1.2)
		.to(E.alarm_pip, 0.2, {x:30}, 1.2)
		.to(E.alarm_screen, 0.2, {opacity:0}, 1.5)
		.to(E.alarm_active, 0.2, {opacity:1}, 1.7)

		.to(E.phone, 0.2, {y:-80, ease:ease_quick}, 1.5)

		//buzz
		//.to(E.bg, 0.3, {fill:"rgb(150 150 150)"}, 1.5)

		.to(E.phone, 0.05, {rotation:-0.5, yoyo:true, repeat:15}, 1.5)

		.fromTo(E.buzz_rings[0], 0.4, {opacity:0, scale:0},{opacity:1}, 1.5)
		.to(E.buzz_rings[0], 0.4, {opacity:0, scale:2}, 1.9)
		.fromTo(E.buzz_rings[1], 0.4, {opacity:0, scale:0},{opacity:1}, 1.7)
		.to(E.buzz_rings[1], 0.4, {opacity:0, scale:2}, 2.1)
		.fromTo(E.buzz_rings[2], 0.4, {opacity:0, scale:0},{opacity:1}, 1.9)
		.to(E.buzz_rings[2], 0.4, {opacity:0, scale:2}, 2.3)

		.to(E.phone, 0.2, {y:-4}, 2.6)

		.to(E.alarm_active, 0.2, {opacity:0},2.6)
		.to(E.sneak_face, 0.2, {opacity:1},2.8)

		//.to(E.bg, 0.5, {fill:"rgb(200 200 200)"}, 2.8)


		// phone hop away
		.to(E.phone, 0.1, {y:-20}, 2.8)
		.to(E.phone, 0.2, {rotation:-5},2.8)
		.to(E.phone, 0.1, {y:-4}, 2.9)
		.to(E.phone, 0.2, {x:100}, 2.8)

		.to(E.phone, 0.1, {y:-20}, 3.0)
		.to(E.phone, 0.2, {rotation:5},3.0)
		.to(E.phone, 0.1, {y:-4}, 3.1)
		.to(E.phone, 0.2, {x:50}, 3.0)

		.to(E.phone, 0.1, {y:-20}, 3.2)
		.to(E.phone, 0.2, {rotation:-5},3.2)
		.to(E.phone, 0.1, {y:-4}, 3.3)
		.to(E.phone, 0.2, {x:0}, 3.2)
		.to(E.phone, 0.2, {rotation:5},3.4)

		/*
		.to(E.phone, 0.1, {y:-20}, 3.2)
		.to(E.phone, 0.1, {y:-4}, 3.3)
		.to(E.phone, 0.2, {x:0}, 3.2)
		*/

		.addLabel('hopC')


	TW.set(E.lid_open, {transformOrigin:"50% 100%"});
	TW.set(E.lid_closed, {transformOrigin:"50% 100%"});
	center(E.alert);

	timelines.lid_open = new TimelineMax({paused:true})
	//timelines.lid_open = new TimelineMax()
		.to(E.laptop, 0.3, {y:-150, rotation:5, ease:linear}, 0.3)
		.to(E.laptop, 0.3, {y:0, rotation:0, ease:linear}, 0.6)
		.to(E.laptop, 0.1, {y:-20, rotation: -2, ease:linear}, 0.9)
		.to(E.laptop, 0.05, {y:0, rotation:0, ease:linear}, 1.0)

		.set(E.lid_open, {opacity:1}, 0.3)
		.fromTo(E.lid_open, 0.1, {scaleY:0},{scale:1}, 0.4)
		.to(E.lid_closed, 0.1, {scaleY:0, y:-300}, 0.4)

		// eyes
		//.fromTo()

		.fromTo(E.alert, 0.2, {opacity:0, scale:0, y:30},{opacity:1, scale:1.3, y:0}, 0.3)
		.to(E.alert, 0.2, {opacity:0}, 0.9)

		.fromTo(E.surprise_face, 0.2, {scale:0.5},{scale:1}, 0.4)

		
		.to(E.window_front, 0.1, {y:-30, rotation:-5}, 0.6)
		.to(E.window_front, 0.4, {y:120}, 0.8)
		.to(E.window_middle, 0.1, {y:-30, rotation:3}, 0.6)
		.to(E.window_middle, 0.4, {y:120}, 0.85)
		.to(E.window_rear, 0.1, {y:-30, rotation:-3}, 0.6)
		.to(E.window_rear, 0.4, {y:140}, 0.9)
		

		.to(E.eye_left, 0.1, {scaleY:0, yoyo:true, repeat:5}, 2.0)
		.to(E.mouth, 0.1, {scaleY:0, yoyo:true, repeat:5}, 2.0)

		.to(E.eye_left, 0.1, {scaleY:0, yoyo:true, repeat:3}, 3.0)
		.to(E.mouth, 0.1, {scaleY:0, yoyo:true, repeat:3}, 3.0)

		.to(E.surprise_face, 0.2, {opacity:0}, 3.8)

		.to(E.lid_open, 0.4, {scaleY:0}, 4.0)
		.to(E.lid_closed, 0.4, {scaleY:1, y:0, onComplete:on_complete}, 4.0)
}


function init()
{
	build_timelines();
	window.addEventListener('click', on_click);

	var svg = document.querySelector('svg');
	var anim = document.querySelector('.animation');

	//svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
	//svg.setAttribute('width', '100%');
	//svg.setAttribute('height', '100%');
	svg.addEventListener('click', on_click);
	anim.addEventListener('click', on_click);
}
function on_complete()
{
	log('complete')
	switch(state)
	{
		case 'init':
		{
			state = 'hopA';
			can_click = true;
			break;
		}
		case 'hopA':
		{
			state = 'hopB';
			can_click = true;
			break;
		}
		case 'hopB':
		{
			log('loop')
			state = 'init';
			timelines.phone_hop.stop()
			timelines.phone_hop.progress(0)
			timelines.lid_open.stop()
			timelines.lid_open.progress(0)
			timelines.power_light.play();
			timelines.zees.play();

			can_click = true;
			break;
		}
		case 'hopC':
		{
			break;
		}
	}
}
function on_click()
{
	log(state)
	if(can_click === false) return;

	switch(state)
	{
		case 'init':
		{
			timelines.phone_hop.tweenTo('hopA');
			can_click = false;
			break;
		}
		case 'hopA':
		{
			timelines.phone_hop.tweenTo('hopB');
			can_click = false;
			break;
		}
		case 'hopB':
		{
			timelines.lid_open.play();
			timelines.phone_hop.tweenTo('hopC');
			timelines.power_light.stop();
			timelines.zees.progress(0);
			timelines.zees.stop();

			can_click = false;
			break;
		}
		case 'hopC':
		{
			break;
		}
	}
}

window.addEventListener('load', init);