var app = {};

function preload()
{
	request_asset('assets/assets.bin', function(e)
	{
		app.assets = read_asset_file(e.target.response);
		init();
	});
}

function init()
{
	app.resized = false;
	app.timer = 0;
	app.time_direction = 1;
	app.state = -1;
	app.has_focus = true;

	window.addEventListener('focus', function(){ app.has_focus = true; app.timer = 0; });
	window.addEventListener('blur', function(){ app.has_focus = false; });
	window.addEventListener('resize', function(){ app.resized = true; });

	app.container = document.querySelector('.canvas-container');
	var width = app.container.clientWidth;
	var height = app.container.clientHeight;

	app.view = Vec4(0,0,width,height);
	app.canvas = Canvas(app.container, app.view);
	app.canvas.classList.add('webgl');
	app.canvas.classList.add('hidden');

	app.GL = WebGL(app.canvas, { antialias: false, alpha: false });
	app.time = Time();
	app.sampler = default_sampler(app.GL);
	
	var GL = app.GL;
	var assets = app.assets;

	assets.textures.bars_vertical = texture_from_dom(document.querySelector('.js-bars-vertical'), app.sampler, TextureFormat.GRAYSCALE);
	assets.textures.bars_diagonal = texture_from_dom(document.querySelector('.js-bars-diagonal'), app.sampler, TextureFormat.GRAYSCALE);
	assets.textures.gradient = texture_from_dom(document.querySelector('.js-gradient'), app.sampler, TextureFormat.GRAYSCALE);
	assets.textures.gradient_middle = texture_from_dom(document.querySelector('.js-gradient-middle'), app.sampler, TextureFormat.GRAYSCALE);
	assets.textures.picture = texture_from_dom(document.querySelector('.js-picture'), app.sampler);
	assets.textures.jump = texture_from_dom(document.querySelector('.js-jump'), app.sampler, TextureFormat.RGBA);

	for(var k in assets.shaders)  bind_shader(GL, assets.shaders[k]);
	for(var k in assets.meshes)   bind_mesh(GL, assets.meshes[k]);
	for(var k in assets.textures) bind_texture(GL, assets.textures[k]);

	app.current_shader = assets.shaders.shaderA;
	app.camera = Camera(0.01,100,53, app.view);

	app.root = Entity(0,0,0);
	app.entity_left = Entity(0.0,0,0, app.root);
	app.entity_right = Entity(0.3,0,0.2, app.root);
	set_vec3(app.entity_right.scale, 0.7,0.7,1);

	assets.meshes.quad = quad_mesh(1.6,1,0);
	bind_mesh(GL, assets.meshes.quad);

	set_viewport(app.GL, app.view);
	set_clear_color(GL, 1,1,1,1);

	app.place_holders = document.querySelectorAll('.canvas-container');
	for(var i = 0; i < app.place_holders.length; ++i) 
	{
		var ph = app.place_holders[i];
		ph.canvas_index = i;
		ph.addEventListener('click', on_placeholder_click);
	}

	requestAnimationFrame(update);
}

function on_placeholder_click(e)
{
	var index = e.target.canvas_index;
	if(index === null || index === undefined) return;

	for(var i = 0; i < app.place_holders.length; ++i)
	{
		app.place_holders[i].classList.remove('active');
	}
	app.place_holders[index].classList.add('active');

	if(index !== app.state)
	{
		var el = e.target;
		el.appendChild(app.canvas);
		app.timer = 0;
		app.time_direction = 1;
	}

	app.state = index;
	app.canvas.classList.remove('hidden');
}

function ease(t) 
{ 
	t = clamp(t,0,1);
	if(t < 0.5) return 4*t*t*t;  
	return (t-1)*(2*t-2)*(2*t-2)+1;
}

function update(t)
{
	requestAnimationFrame(update);

	if(app.resized === true)
	{
		var width = app.container.clientWidth;
		var height = app.container.clientHeight;
		app.canvas.width = width;
		app.canvas.height = height;

		set_vec4(app.view, 0,0,width,height);
		set_viewport(app.GL, app.view);
		update_camera_projection(app.camera, app.view);
		app.resized = false;
		return;
	}

	set_time(app.time, t);
	if(app.time.paused === true || app.has_focus === false || app.allow_update === false) return;


	var assets = app.assets;
	var GL = app.GL;
	var dt = app.time.dt;
	var camera = app.camera;

	update_camera(camera);
	
	var mvp = _Mat4();
	var shader;
	var mesh = assets.meshes.quad;

	switch(app.state)
	{
		case 0:
		{
			clear_screen(GL);
			shader = assets.shaders.shaderA;
			use_shader(GL, shader);
			set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_vertical);
			draw_mesh(GL, shader, mesh);
			break;
		}
		case 1:
		{
			app.timer += dt;
			if(app.timer >= 2.0) app.timer = 0;

			clear_screen(GL);
			shader = assets.shaders.shaderB;
			use_shader(GL, shader);
			set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_vertical);
			set_uniform(GL, shader.uniforms.t, app.timer);
			draw_mesh(GL, shader, mesh);
			break;
		}
		case 2:
		{
			app.timer += (dt * 0.75) * app.time_direction;
			if(app.timer >= 1.5 || app.timer <= 0.0) app.time_direction *= -1;

			clear_screen(GL);
			shader = assets.shaders.shaderC;
			use_shader(GL, shader);
			set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_diagonal);
			set_uniform(GL, shader.uniforms.gradient, assets.textures.gradient);
			set_uniform(GL, shader.uniforms.t, app.timer);
			draw_mesh(GL, shader, mesh);
			break;
		}
		case 3:
		{
			app.timer += (dt * 0.65) * app.time_direction;
			if(app.timer >= 1.3 || app.timer <= 0.0) app.time_direction *= -1;

			var t = ease(app.timer) * 1.45; 

			clear_screen(GL);
			shader = assets.shaders.shaderD;
			use_shader(GL, shader);
			set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_diagonal);
			set_uniform(GL, shader.uniforms.gradient, assets.textures.gradient);
			set_uniform(GL, shader.uniforms.t, t);
			draw_mesh(GL, shader, mesh);
			break;
		}
		case 4:
		{
			app.timer += (dt * 0.55) * app.time_direction;
			if(app.timer >= 1.3 || app.timer <= 0.0) app.time_direction *= -1;

			var t = ease(app.timer) * 1.5; 

			clear_screen(GL);
			shader = assets.shaders.shaderE;
			use_shader(GL, shader);
			set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_diagonal);
			set_uniform(GL, shader.uniforms.gradient, assets.textures.gradient);
			set_uniform(GL, shader.uniforms.picture, assets.textures.picture);
			set_uniform(GL, shader.uniforms.t, t);
			draw_mesh(GL, shader, mesh);
			break;
		}
		case 5:
		{
			app.timer += (dt * 0.55) * app.time_direction;
			if(app.timer >= 1.3 || app.timer <= 0.0) app.time_direction *= -1;

			var t = ease(app.timer) * 1.5; 

			clear_screen(GL);
			shader = assets.shaders.shaderD;
			use_shader(GL, shader);
			set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_diagonal);
			set_uniform(GL, shader.uniforms.gradient, assets.textures.gradient_middle);
			set_uniform(GL, shader.uniforms.t, t);
			draw_mesh(GL, shader, mesh);
			break;
		}
		case 6:
		{
			app.timer += (dt * 0.55) * app.time_direction;
			if(app.timer >= 1.3 || app.timer <= 0.0) app.time_direction *= -1;

			var ot = app.timer - 0.2;
			ot = ease(ot);

			var t = ease(app.timer); 

			app.entity_right.position[0] = lerp(0.3, 0, ot);

			update_entity(app.root, true);

			clear_screen(GL);
			// left
			shader = assets.shaders.shaderD;
			use_shader(GL, shader);
			mat4_mul(mvp, app.entity_left.world_matrix, camera.view_projection);
			set_uniform(GL, shader.uniforms.mvp, mvp);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_diagonal);
			set_uniform(GL, shader.uniforms.gradient, assets.textures.gradient);
			set_uniform(GL, shader.uniforms.t, t * 1.5);
			draw_mesh(GL, shader, mesh);

			// right
			shader = assets.shaders.shaderE;
			use_shader(GL, shader);
			mat4_mul(mvp, app.entity_right.world_matrix, camera.view_projection);
			set_uniform(GL, shader.uniforms.mvp, mvp);
			set_uniform(GL, shader.uniforms.sdf, assets.textures.bars_diagonal);
			set_uniform(GL, shader.uniforms.gradient, assets.textures.gradient_middle);
			set_uniform(GL, shader.uniforms.picture, assets.textures.jump);
			set_uniform(GL, shader.uniforms.t, ot * 1.5);
			draw_mesh(GL, shader, mesh);

			break;
		}
	}

	clear_stacks();

	reset_webgl_state(GL);
}

window.addEventListener('load', preload);
