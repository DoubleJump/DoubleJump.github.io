var basepath = 'guide/';
var guide_index = 0;

var guide_urls = 
{
	'Introduction': 'index',
	'Scene Structure': 'scene-structure',
	'Render Pipeline': 'render-pipeline',
	'Loading Assets': 'loading-assets',
	'Meshes': 'meshes',
	'Input & Interaction': 'input-and-interaction',
	'Blender Exporter': 'blender-exporter',
	"Fake it 'til you make it": 'fake-it-till-you-make-it',
	'Groups & Parenting': 'groups-and-parenting',
	'UV Mapping': 'uv-mapping',
	'Raycasting': 'raycasting',
	'Fresnel': 'fresnel',
	'Animations': 'animation',
};

function init()
{
	document.querySelector('title').innerText = 'Practical 3D for Websites';

	var menu_icon = document.querySelector('.menu-icon');
	var header = document.querySelector('header');
	var nav = document.querySelector('nav');
	var h1 = document.querySelector('h1');
	var prev = document.querySelector('.paginator.left .label');
	var next = document.querySelector('.paginator.right .label');
	var keys = Object.keys(guide_urls);

	var i = 0;
	for(var k in guide_urls)
	{
		var link = document.createElement('a')
		link.setAttribute('href', guide_urls[k] + '.html');
		link.innerText = k;
		nav.appendChild(link);

		if(k === h1.innerText)
		{
			guide_index = i;
			link.classList.add('active');
		}
		i++;
	}

	if(guide_index > 0)
	{
		prev.innerText = keys[guide_index-1];
	}
	else
	{
		document.querySelector('.paginator.left').style.display = 'none';
	}

	if(guide_index < keys.length-1)
	{
		next.innerText = keys[guide_index+1];
	}
	else
	{
		console.log('last')
		document.querySelector('.paginator.right').style.display = 'none';
	}

	menu_icon.addEventListener('click', function()
	{
	 	header.classList.toggle('closed');
	});

	prev.addEventListener('click', function()
	{
		if(guide_index === 0) return;
		var dst = guide_index - 1;
		window.location.href = guide_urls[keys[dst]] + '.html';
	})

	next.addEventListener('click', function()
	{
		if(guide_urls.length - 1 === 0) return;
		var dst = guide_index + 1;
		window.location.href = guide_urls[keys[dst]] + '.html';
	});

	window.addEventListener('keydown', function(e)
	{
		var code = e.keyCode;
		if(code === 37)
		{
			if(guide_index === 0) return;
			var dst = guide_index - 1;
			window.location.href = guide_urls[keys[dst]] + '.html';
		}
		if(code === 39)
		{
			if(guide_urls.length - 1 === 0) return;
			var dst = guide_index + 1;
			window.location.href = guide_urls[keys[dst]] + '.html';
		}
	});

}

window.addEventListener('load', init);