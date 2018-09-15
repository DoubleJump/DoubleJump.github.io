'use strict';

var _stacks = [];
var Stack = function(T, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;

	for(var i = 0; i < count; ++i) this.data.push(new T());

	_stacks.push(this);
	return this;
}
Stack.prototype.get = function()
{
	var r = this.data[this.index];
	this.index++;
	return r;
}

function clear_stacks()
{
	var n = _stacks.length;
	for(var i = 0; i < n; ++i) _stacks[i].index = 0;
}
var E = 2.71828182845904523536028747135266250;
var PI = 3.1415926535897932;
var TAU = 6.28318530718;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var EPSILON = 2.2204460492503131e-16;

function min(a, b)
{
	if(a < b) return a; return b;
}

function max (a, b)
{
	if(a > b) return a; return b;
}

function round_to(a, f)
{
	return a.toFixed(f);
}

function clamp(a, min, max)
{
	if(a < min) return min;
	else if(a > max) return max;
	else return a;
}

function lerp(a,b,t)
{
	return (1-t) * a + t * b;
}


function Time()
{
    var r = {};
    r.elapsed = 0;
    r.now = 0;
    r.last = 0;
    r.dt = 0;
    r.paused = false;
    return r;
}

function set_time(time, t)
{
    time.now = t;
    time.dt = ((t - time.last) / 1000);
    if(time.dt > 0.1) time.dt = 0.016;
    time.last = t;
    time.elapsed += time.dt;
}
function Vec3(x,y,z)
{
	return new Float32Array([x || 0, y || 0, z || 0]);
}
function Vec4(x,y,z,w)
{
	return new Float32Array([x || 0, y || 0, z || 0, w || 1]);
}

var vec3_stack = new Stack(Vec3, 32);
var vec4_stack = new Stack(Vec4, 32);

function set_vec3(v, x,y,z)
{
	v[0] = x; v[1] = y; v[2] = z || 0;
}
function set_vec4(v, x,y,z,w)
{
	v[0] = x; v[1] = y; v[2] = z; v[3] = w;
}

function _Vec3(x,y,z)
{
	var r = vec3_stack.get();
	set_vec3(r, x || 0, y || 0, z || 0);
	return r;
}
function _Vec4(x,y,z,w)
{
	var r = vec4_stack.get();
	set_vec4(r, x || 0, y || 0, z || 0, w || 1);
	return r;
}

function vec_add(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b[i];
}
function vec_add_f(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b;
}
function vec_sub(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b[i];	
}
function vec_sub_f(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b;	
}
function vec_mul_f(v,a,f)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] * f;
}
function vec_div_f(v,a,f)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] / f;	
}
function vec_eq(a,b)
{
	var n = a.length;
	for(var i = 0; i < n; ++i) a[i] = b[i];	
}
function vec_inverse(v, a)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = -a[i];	
}
function vec_sqr_length(v)
{
	var r = 0;
	var n = v.length;
	for(var i = 0; i < n; ++i) r += v[i] * v[i];	
	return r;
}
function vec_length(v) 
{
	return Math.sqrt(vec_sqr_length(v));
}
function vec_distance(a, b)
{
	return Math.abs(Math.sqrt(vec_sqr_distance(a,b)));
}
function vec_sqr_distance(a, b)
{
	var r = 0;
	var n = a.length;
	for(var i = 0; i < n; ++i)
	{
		var d = b[i] - a[i];
		r += d * d;
	}	
	return r;
}
function vec_normalized(r, v)
{
	var n = v.length;
	var l = vec_sqr_length(v);
	if(l > EPSILON)
	{
		l = Math.sqrt(1 / l);
		for(var i = 0; i < n; ++i) r[i] = v[i] * l;
	}
	else vec_eq(r,v);
}
function vec_dot(a,b)
{
	var r = 0;
	var n = a.length;
	for(var i = 0; i < n; ++i) r += a[i] * b[i];
	return r;
}
function Shader(vs, fs)
{
    var s = {};
    s.id = null;
    s.attributes = {};
    s.uniforms = {};
    s.props = {};
    s.vertex_src = vs;
    s.fragment_src = fs;
    return s;
}
var MeshLayout = 
{
	TRIANGLES: 0,
	LINES: 1,
	STRIP: 2,
	POINTS: 3,
};

var BufferUpdateRate = 
{
	STATIC: 0,
	DYNAMIC: 1,
	STREAM: 2,
};

function VertexAttribute(size, norm)
{
	var r = {};
	r.size = size;
	r.normalized = norm || false;
	r.offset = 0;
	return r;
}

function VertexBuffer(data, attributes, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.stride = 0;
	for(var k in attributes)
	{
		var attr = attributes[k];
		attr.offset = r.stride;
		r.stride += attr.size;
	}
	r.attributes = attributes;
	r.offset = 0;
	r.count = 0;
	r.capacity = 0;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	
	if(data)
	{
		r.count = (r.data.length / r.stride)|0;
		r.capacity = (r.data.length / r.stride)|0;
	}

	return r;
}

function alloc_vertex_buffer_memory(vb, count)
{
	vb.data = new Float32Array(count * vb.stride);
	vb.count = vb.data.length / vb.stride;
	vb.capacity = vb.data.length / vb.stride;
}

function Mesh(vb, ib, layout)
{
	var r = {};
	r.vertex_buffer = vb;
	r.index_buffer = ib;
	r.layout = layout || MeshLayout.TRIANGLES;
	return r;
}
var TextureFormat = 
{
	RGB: 0,
	RGBA: 1,
	DEPTH: 2,
	GRAYSCALE: 3,
}
function Sampler(s,t,up,down,anisotropy)
{
	var r = {};
	r.s = s;
	r.t = t;
	r.up = up;
	r.down = down;
	r.anisotropy = anisotropy;
	return r;
}
function default_sampler()
{
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR, 1);
}

function Texture(width, height, data, sampler, format, bytes_per_pixel)
{
	var t = {};
	t.id = null;
	t.data = data;
	t.format = format;
	t.width = width;
	t.height = height;
	t.bytes_per_pixel = bytes_per_pixel;
	t.compressed = false;
	t.from_element = false;
	t.sampler = sampler;
	t.flip = false;
	//t.loaded = true;
	t.gl_releasable = false;
	return t;
}

function empty_texture(sampler, format)
{
	format = format || TextureFormat.RGBA;
	sampler = sampler || app.sampler;
	return Texture(0, 0, null, sampler, format, 4);
}


function rgba_texture(width, height, pixels, sampler)
{
	var t = Texture(width, height, pixels, sampler, TextureFormat.RGBA, 4);
	bind_texture(t);
	update_texture(t);
	return t;
}
function depth_texture(width, height, sampler)
{
	var t = Texture(width, height, null, sampler, TextureFormat.DEPTH, 4);
	bind_texture(t);
	update_texture(t);
	return t;
}
function RenderTarget(view)
{
	var r = {};
	r.frame_buffer = null;
	r.view = view;
	return r;
}
function Canvas(container, view)
{
	var canvas = document.createElement('canvas');

	var container_width = container.clientWidth;
    var container_height = container.clientHeight;
    var width = container_width * app.res;
    var height = container_height * app.res;

    canvas.width = width;
    canvas.height = height;

    // SCALES TO DEVICE PIXEL RATIO
    var dw = -((width - container_width) / 2);
    var dh = -((height - container_height) / 2);

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.transform = 'translateX(' + dw +'px) translateY('+dh+'px) scale(' + (1/app.res) + ')';

    container.appendChild(canvas);
    return canvas;
}

var DepthMode =
{
	DEFAULT: 0,
	NEVER: 1,
	LESS: 2,
	LESS_OR_EQUAL: 3,
	EQUAL: 4,
	GREATER: 5,
	NOT_EQUAL: 6,
	GREATER_OR_EQUAL: 7,
	ALWAYS: 8,
};

var BlendMode =
{
	DEFAULT: 0,
	NONE: 1,
	DARKEN: 2,
	LIGHTEN: 3,
	DIFFERENCE: 4,
	MULTIPLY: 5,
	SCREEN: 6,
	INVERT: 7,
};

var GL = null;
function WebGL(canvas, options)
{
    GL = canvas.getContext('webgl', options) ||
    	 canvas.getContext('experimental-webgl', options);
    if(!GL)
    {
    	console.error('Webgl not supported');
    	return false;
    }

   	GL.extensions = {};
    var supported_extensions = GL.getSupportedExtensions();
	for(var i = 0; i < supported_extensions.length; ++i)
	{
		var ext = supported_extensions[i];
		if(ext.indexOf('MOZ') === 0) continue;
	    GL.extensions[ext] = GL.getExtension(ext);
	}

	GL._state = {};
    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL._parameters.max_anisotropy = null;
	var anisotropic = GL.extensions.EXT_texture_filter_anisotropic;
	if(anisotropic !== undefined)
	{
		GL._parameters.max_anisotropy = GL.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	}

	reset_webgl_state();

	return GL;
}

function reset_webgl_state()
{
	var n = GL._parameters.num_texture_units;
	for(var i = 0; i < n; ++i)
	{
		GL.activeTexture(GL.TEXTURE0 + i);
		GL.bindTexture(GL.TEXTURE_2D, null);
		GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
	}

	set_render_target(null);

	enable_backface_culling();
	enable_scissor_testing();
	GL.cullFace(GL.BACK);
	GL.frontFace(GL.CCW);

	enable_depth_testing(GL.LEQUAL);
	set_blend_mode(BlendMode.DEFAULT);
}

function set_viewport(rect)
{
	GL.viewport(rect[0], rect[1], rect[2], rect[3]);
	GL.scissor(rect[0], rect[1], rect[2], rect[3]);
}

function set_clear_color(c)
{
	GL.clearColor(c[0],c[1],c[2],c[3]);
}
function set_clear_color_f(r,g,b,a)
{
	GL.clearColor(r,g,b,a);
}

function clear_screen(mode)
{
	mode = mode || (GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	GL.clear(mode);
}

function enable_backface_culling()
{
	GL.enable(GL.CULL_FACE);
}
function disable_backface_culling()
{
	GL.disable(GL.CULL_FACE);
}

function enable_depth_testing(mode)
{
	GL.enable(GL.DEPTH_TEST);
	if(mode) GL.depthFunc(mode);
}

function disable_depth_testing()
{
	GL.disable(GL.DEPTH_TEST);
}

function enable_scissor_testing()
{
	GL.enable(GL.SCISSOR_TEST);
}

function disable_scissor_testing()
{
	GL.disable(GL.SCISSOR_TEST);
}

function enable_stencil_testing()
{
	GL.enable(GL.STENCIL_TEST);
}

function disable_stencil_testing()
{
	GL.disable(GL.STENCIL_TEST);
}

function enable_alpha_blending()
{
	GL.enable(GL.BLEND);
}

function disable_alpha_blending()
{
	GL.disable(GL.BLEND);
}

function set_texture(texture)
{
	GL.bindTexture(GL.TEXTURE_2D, texture.id);
}

function set_array_buffer(buffer)
{
	if(buffer === null)
		GL.bindBuffer(GL.ARRAY_BUFFER, null);
	else
		GL.bindBuffer(GL.ARRAY_BUFFER, buffer.id);
}

function set_shader(shader)
{
	GL._state.shader = shader;
    GL.useProgram(shader.id);
}

function set_render_target(target)
{
	if(target === null)
		GL.bindFramebuffer(GL.FRAMEBUFFER, null);
	else
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, target.frame_buffer);
	}
}

function bind_render_target(t)
{
	if(t.frame_buffer !== null) return;
	t.frame_buffer = GL.createFramebuffer();
}

function set_render_target_color(texture)
{
	set_texture(texture);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture.id, 0);
}

function convert_update_rate(type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC:  return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM:  return GL.STREAM_DRAW;
	}
}
function convert_mesh_layout(type)
{
	switch(type)
	{
		case MeshLayout.TRIANGLES: return GL.TRIANGLES;
		case MeshLayout.LINES: 	   return GL.LINES;
		case MeshLayout.STRIP:	   return GL.TRIANGLE_STRIP;
		case MeshLayout.POINTS:     return GL.POINTS;
	}
}

function bind_mesh(mesh)
{
	if(mesh.vertex_buffer.id === null)
		mesh.vertex_buffer.id = GL.createBuffer();
}

function update_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(vb.update_rate));
	set_array_buffer(null);
}


function convert_texture_size(t)
{
	if(t.format === TextureFormat.DEPTH) return GL.UNSIGNED_SHORT;

	switch(t.bytes_per_pixel)
	{
		case 4:  return GL.UNSIGNED_BYTE;
		default: console.error('Invalid texture size');
	}
}
function convert_texture_format(format)
{
	switch(format)
	{
		case TextureFormat.RGB: return GL.RGB;
		case TextureFormat.RGBA: return GL.RGBA;
		case TextureFormat.DEPTH: return GL.DEPTH_COMPONENT;
		case TextureFormat.GRAYSCALE: return GL.LUMINANCE;
		default: console.error('Invalid texture format');
	}
}

function bind_texture(texture)
{
	if(texture.id === null) texture.id = GL.createTexture();
}

function update_texture(t)
{
	set_texture(t);
	var size = convert_texture_size(t);
	var format = convert_texture_format(t.format);
	GL.texImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, format, size, t.data);
	set_sampler(t.sampler);
}

function set_sampler(sampler)
{
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, sampler.s);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, sampler.t);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, sampler.up);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, sampler.down);
}

function bind_shader(s)
{
	if(s.id !== null) return;

	var vs = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vs, s.vertex_src);
    GL.compileShader(vs);

    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, s.fragment_src);
    GL.compileShader(fs);

	s.id = GL.createProgram();
    GL.attachShader(s.id, vs);
    GL.attachShader(s.id, fs);
    GL.linkProgram(s.id);

    var n = GL.getProgramParameter(s.id, GL.ACTIVE_ATTRIBUTES);
    for(var i = 0; i < n; ++i)
    {
        var attr = GL.getActiveAttrib(s.id, i);
        s.attributes[attr.name] = GL.getAttribLocation(s.id, attr.name);
    }

    n =  GL.getProgramParameter(s.id, GL.ACTIVE_UNIFORMS);
    var sampler_index = 0;
    for(var i = 0; i < n; ++i)
    {
        var active_uniform = GL.getActiveUniform(s.id, i);
        var uniform = {};
        var name = active_uniform.name;
        uniform.location = GL.getUniformLocation(s.id, active_uniform.name);
        uniform.type = active_uniform.type;
        uniform.size = active_uniform.size;

        if(uniform.size > 1)
        {
	    	name = name.substring(0,name.indexOf('[0]'));
	    }
        if(uniform.type === GL.SAMPLER_2D)
        {
        	uniform.sampler_index = sampler_index;
        	sampler_index++;
        }
        s.uniforms[name] = uniform;
    }

    s.vertex_src = null;
    s.fragment_src = null;

    return s;
}

function set_uniform(name, value)
{
	var uniform = GL._state.shader.uniforms[name];
	if(!uniform) return;
	var loc = uniform.location;
	var size = uniform.size;

	switch(uniform.type)
	{
		case GL.FLOAT:
		{
			if(size > 1)
			{
				GL.uniform1fv(loc, value);
				return;
			}
			GL.uniform1f(loc, value);
			return;
		}
		case GL.FLOAT_VEC2:
		{
			if(size > 1)
			{
				GL.uniform2fv(loc, value);
				return;
			}
			GL.uniform2f(loc, value[0], value[1]);
			return;
		}
        case GL.FLOAT_VEC3:
        {
        	if(size > 1)
			{
				GL.uniform3fv(loc, value);
				return;
			}
        	GL.uniform3f(loc, value[0], value[1], value[2]);
        	return;
        }
        case GL.FLOAT_VEC4:
        {
        	if(size > 1)
			{
				GL.uniform4fv(loc, value);
				return;
			}
        	GL.uniform4f(loc, value[0], value[1], value[2], value[3]);
        	return;
        }
        case GL.BOOL:
        {
        	if(value === true) GL.uniform1i(loc, 1);
        	else GL.uniform1i(loc, 0);
        	return;
        }
        case GL.FLOAT_MAT2: GL.uniformMatrix2fv(loc, false, value); return;
        case GL.FLOAT_MAT3: GL.uniformMatrix3fv(loc, false, value); return;
        case GL.FLOAT_MAT4: GL.uniformMatrix4fv(loc, false, value); return;
        case GL.SAMPLER_2D:
        {
			GL.uniform1i(loc, uniform.sampler_index);
			GL.activeTexture(GL.TEXTURE0 + uniform.sampler_index);
			set_texture(value);
			return;
		}
        case GL.INT:
        {
        	if(size > 1)
			{
				GL.uniform1iv(loc, value);
				return;
			}
        	GL.uniform1i(loc, value);
        	return;
        }
	}
}

function set_attributes(shader, mesh)
{
	var vb = mesh.vertex_buffer;
	set_array_buffer(vb);

	for(var k in vb.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        if(sa === undefined) continue;
        if(va === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
	}
}

function draw_mesh(mesh)
{
	set_attributes(GL._state.shader, mesh);
	var layout = convert_mesh_layout(mesh.layout); 
    GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    set_array_buffer(null);
}

function set_blend_mode(mode)
{
	switch(mode)
	{
		case BlendMode.ADD:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFuncSeparate(GL.SRC_ALPHA, GL.ONE, GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
			break;
		}
		case BlendMode.DARKEN:
		{
			GL.blendEquation(GL.FUNC_SUBTRACT);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.LIGHTEN:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.DIFFERENCE:
		{
			GL.blendEquation(GL.FUNC_SUBTRACT);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.MULTIPLY:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.DST_COLOR, GL.ZERO);
			break;
		}
		case BlendMode.SCREEN:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.MINUS_DST_COLOR, GL.ONE);
			break;
		}
		case BlendMode.INVERT:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.ONE_MINUS_DST_COLOR, GL.ZERO);
			break;
		}
		default:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
			break;
		}
	}
}


function set_depth_mode(mode)
{
	switch(mode)
	{
		case DepthMode.NEVER: GL.depthFunc(GL.NEVER); return;
		case DepthMode.LESS: GL.depthFunc(GL.LESS); return;
		case DepthMode.LESS_OR_EQUAL: GL.depthFunc(GL.LEQUAL); return;
		case DepthMode.EQUAL: GL.depthFunc(GL.EQUAL); return;
		case DepthMode.GREATER: GL.depthFunc(GL.GREATER); return;
		case DepthMode.NOT_EQUAL: GL.depthFunc(GL.NOTEQUAL); return;
		case DepthMode.GREATER_OR_EQUAL: GL.depthFunc(GL.GEQUAL); return;
		case DepthMode.ALWAYS: GL.depthFunc(GL.ALWAYS); return;
		default: GL.depthFunc(GL.LESS); return;
	}
}

var KeyState = 
{
	RELEASED: 0,
	UP: 1,
	DOWN: 2,
	HELD: 3,
}

var Keys = 
{
	MOUSE_LEFT: 0,
	MOUSE_RIGHT: 1,
	C: 67,
	H: 72,
}

function Mouse()
{
	var m = {};
	m.position = Vec3();
	m.last_position = Vec3();
	m.delta = Vec3();
	return m;
}

var input;
function Input(root)
{
	var r = {};
	r.mouse = Mouse();
	r.keys = new Uint8Array(256);

	if(!root) root = window;

	window.addEventListener('keydown', on_key_down);
	window.addEventListener('keyup', on_key_up);
	root.addEventListener('mouseup', on_key_up);
	window.addEventListener('mousedown', on_key_down);
	root.addEventListener('mousemove', on_mouse_move);

	input = r;
	return r;
}


function update_input()
{
	for(var i = 0; i < 256; ++i)
	{
		if(input.keys[i] === KeyState.DOWN) input.keys[i] = KeyState.HELD;
		else if(input.keys[i] === KeyState.UP) input.keys[i] = KeyState.RELEASED;
	}
	vec_sub(input.mouse.delta, input.mouse.position, input.mouse.last_position);
	vec_eq(input.mouse.last_position, input.mouse.position);
}

function key_up(code)
{
	return input.keys[code] === KeyState.UP;
}
function key_down(code)
{
	return input.keys[code] === KeyState.DOWN;
}
function key_held(code)
{
	return input.keys[code] === KeyState.HELD || input.keys[code] === KeyState.DOWN;
}
function key_released(code)
{
	return input.keys[code] === KeyState.RELEASED || input.keys[code] === KeyState.UP;
}
function on_key_down(e)
{
	var kc = e.keyCode || e.button;
	if(input.keys[kc] != KeyState.HELD) input.keys[kc] = KeyState.DOWN;
}
function on_key_up(e)
{
	var kc = e.keyCode || e.button;
	if(input.keys[kc] != KeyState.RELEASED) input.keys[kc] = KeyState.UP;
}
function on_mouse_move(e)
{
	set_vec3(input.mouse.position, e.layerX, e.layerY, 0);
}
function quad_mesh(width, height, depth, x_offset, y_offset, z_offset)
{
    var w = width / 2;
    var h = height / 2;
    var d = (depth || 0) / 2;
    var x = x_offset || 0;
    var y = y_offset || 0;
    var z = z_offset || 0;

    var attributes =
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
        -w + x,-h + y, +d + z, 0,0,
         w + x,-h + y, +d + z, 1,0,
         w + x, h + y, -d + z, 1,1,
        -w + x,-h + y, +d + z, 0,0,
         w + x, h + y, -d + z, 1,1,
        -w + x, h + y, -d + z, 0,1
    ]);

    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}
var press_buffer = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
var x_buffer = [-0.40,0.23,0.23,0.23,0.23,0.23,0.23,0.18,0.15,0.12,0.10,0.09,0.09,0.09,0.09,0.10,0.11,0.13,0.13,0.13,0.13,0.13,0.13,0.13,0.13,0.13,0.13,0.12,0.10,0.09,0.05,0.03,0.01,-0.01,-0.01,-0.04,-0.09,-0.13,-0.15,-0.16,-0.13,-0.08,-0.02,0.03,0.07,0.08,0.09,0.08,0.05,0.00,-0.05,-0.08,-0.12,-0.23,-0.26,-0.28,-0.22,-0.10,0.04,0.12,0.17,0.19,0.15,0.08,0.03,-0.02,-0.03,-0.01,0.01,0.05,0.07,0.07,0.07,0.04,-0.02,-0.11,-0.20,-0.30,-0.31,-0.29,-0.25,-0.17,-0.04,0.09,0.21,0.25,0.24,0.19,0.08,-0.00,-0.06,-0.09,-0.09,-0.06,-0.01,0.06,0.15,0.25,0.30,0.28,0.18,0.14,0.12,0.09,0.06,0.03,0.02,0.03,0.04,0.05,0.05,0.06,0.07,0.07,0.07,0.07,0.07,0.04,0.01,-0.03,-0.08,-0.12,-0.16,-0.19,-0.20,-0.20,-0.20,-0.18,-0.15,-0.08,0.00,0.05,0.05,0.05,0.03,-0.04,-0.13,-0.27,-0.31,-0.32,-0.32,-0.30,-0.24,-0.16,-0.10,-0.09,-0.09,-0.11,-0.16,-0.28,-0.32,-0.34,-0.32,-0.28,-0.16,-0.01,0.11,0.15,0.15,0.12,0.04,-0.08,-0.13,-0.15,-0.14,-0.11,-0.07,-0.02,0.05,0.10,0.14,0.19,0.24,0.24,0.23,0.22,0.21,0.18,0.15,0.11,0.06,0.02,0.00,-0.00,0.01,0.08,0.15,0.23,0.28,0.30,0.31,0.27,0.16,0.03,-0.07,-0.11,-0.12,-0.09,-0.04,0.02,0.08,0.13,0.15,0.16,0.16,0.13,0.03,-0.07,-0.10,-0.09,-0.05,0.03,0.14,0.25,0.35,0.39,0.40,0.39,0.34,0.23,0.09,-0.11,-0.19,-0.20,-0.19,-0.09,0.17,0.45,0.64,0.76,0.82,0.83,0.85,0.89,0.95,0.96,0.96,0.95,0.94,0.94,0.93,0.92,0.92,0.92,0.94,0.95,0.95,0.95,0.95,0.96,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07];
var y_buffer = [-0.38,0.26,0.26,0.26,0.26,0.26,0.26,0.27,0.27,0.25,0.24,0.22,0.19,0.17,0.14,0.12,0.10,0.09,0.09,0.09,0.09,0.09,0.09,0.10,0.10,0.10,0.10,0.10,0.11,0.12,0.12,0.12,0.12,0.12,0.12,0.10,0.06,0.01,-0.05,-0.09,-0.18,-0.24,-0.26,-0.26,-0.25,-0.24,-0.21,-0.16,-0.09,-0.03,0.01,0.01,-0.04,-0.29,-0.38,-0.55,-0.58,-0.59,-0.55,-0.48,-0.40,-0.30,-0.20,-0.14,-0.14,-0.17,-0.21,-0.26,-0.31,-0.36,-0.38,-0.39,-0.39,-0.39,-0.39,-0.36,-0.31,-0.16,-0.05,0.03,0.08,0.11,0.12,0.10,0.01,-0.07,-0.15,-0.20,-0.23,-0.22,-0.18,-0.10,-0.01,0.08,0.12,0.13,0.09,-0.03,-0.18,-0.37,-0.51,-0.53,-0.51,-0.43,-0.29,-0.12,0.04,0.14,0.16,0.17,0.16,0.14,0.13,0.13,0.14,0.15,0.17,0.21,0.26,0.32,0.36,0.39,0.41,0.42,0.43,0.41,0.35,0.30,0.25,0.21,0.20,0.20,0.20,0.23,0.28,0.34,0.40,0.43,0.43,0.41,0.35,0.28,0.22,0.22,0.24,0.26,0.30,0.36,0.43,0.50,0.52,0.52,0.50,0.45,0.38,0.34,0.33,0.33,0.34,0.38,0.44,0.51,0.52,0.52,0.51,0.45,0.36,0.25,0.16,0.13,0.14,0.18,0.28,0.34,0.38,0.42,0.45,0.46,0.46,0.43,0.38,0.30,0.17,0.00,-0.12,-0.28,-0.31,-0.32,-0.30,-0.26,-0.15,-0.00,0.16,0.26,0.29,0.29,0.25,0.06,-0.09,-0.25,-0.35,-0.39,-0.39,-0.36,-0.23,-0.04,0.11,0.20,0.22,0.21,0.13,0.05,-0.09,-0.20,-0.28,-0.29,-0.27,-0.20,-0.10,0.03,0.11,0.16,0.16,0.17,0.16,0.17,0.19,0.22,0.23,0.24,0.24,0.23,0.22,0.23,0.26,0.27,0.27,0.27,0.27,0.27,0.28,0.28,0.28,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10,0.10];

var shader_src = 
{
    velocity:
    {
        vs:`attribute vec3 position;
        attribute vec2 uv;
        uniform vec2 mouse;
        varying vec2 _uv;

        void main()
        {
            _uv = uv;
            vec3 p = (position * 0.62);
            p.xy += mouse;
            gl_Position = vec4(p, 1.0);
        }`
        ,
        fs:`precision highp float;
        uniform float hardness;
        uniform float radius;
        uniform vec2 velocity;
        varying vec2 _uv;

        float smoothedge(float v, float hardness)
        {
            return smoothstep(1.0, hardness, v);
        }
        float circle(vec2 st, float r)
        {
            float dist = r - length(st);
            return 1.0 - dist;
        }

        void main()
        {
            float r = mix(0.2,5.5, radius);
            vec2 st = _uv - 0.5;
            float d = smoothedge(circle(st, r), hardness);
            gl_FragColor = vec4(velocity, 0.0, d);
        }`
    },
    screen_particles:
    {
        vs:`attribute vec3 position;
        attribute vec2 uv;
        varying vec2 _pos;
        varying vec2 _uv;

        void main()
        {
            _pos = position.xy;
            _uv = uv;
            gl_Position = vec4(position, 1.0);
        }`
        ,
        fs:`precision highp float;
        uniform sampler2D screen;
        uniform float opacity;
        varying vec2 _pos;
        varying vec2 _uv;

        void main() 
        {
            vec4 color = texture2D(screen, _uv);
            gl_FragColor = vec4(floor(254.0 * color * opacity) / 254.0);
        }
        `
    },
    draw_particles:
    {
        vs:`attribute vec2 index;
        uniform sampler2D particles;
        uniform float res;
        varying vec2 _pos;

        void main()
        {
            vec4 color = texture2D(particles, index);

            _pos = vec2(
                color.r / 255.0 + color.b,
                color.g / 255.0 + color.a);

            gl_PointSize = 0.5;
            gl_Position = vec4(2.0 * _pos.x - 1.0, 1.0 - 2.0 * _pos.y, 0, 1);
        }
        `
        ,
        fs:`precision highp float;
        uniform sampler2D flow_field;
        uniform float flow_speed;
        uniform float offset;
        varying vec2 _pos;

        vec3 hsb_to_rgb(vec3 c)
        {
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                     6.0)-3.0)-1.0,
                             0.0,
                             1.0 );
            rgb = rgb*rgb*(3.0-2.0*rgb);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }

        void main()
        {
            vec2 flow_min = vec2(-flow_speed, -flow_speed);
            vec2 flow_max = vec2(flow_speed, flow_speed);
            vec2 velocity = mix(flow_min, flow_max, texture2D(flow_field, _pos).rg);
            float speed_t = length(velocity) / length(flow_max);
            float f = (speed_t * 12.0);
            vec3 rgb = hsb_to_rgb(vec3(offset, 1.0-speed_t, f*f));
            gl_FragColor = vec4(rgb,1.0);
        }`
    },
    update_particles:
    {
        vs:`attribute vec3 position;
        attribute vec2 uv;
        varying vec2 _uv;

        void main()
        {
            _uv = uv;
            gl_Position = vec4(position, 1.0);
        }`
        ,
        fs:`precision highp float;
        uniform sampler2D particles;
        uniform sampler2D flow_field;
        uniform float flow_speed;
        uniform float res;
        uniform float rand_seed;
        uniform float drop_rate;
        uniform float drop_rate_bump;

        varying vec2 _uv;

        const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);

        float rand(const vec2 co) 
        {
            float t = dot(rand_constants.xy, co);
            return fract(sin(t) * (rand_constants.z + t));
        }

        vec2 lookup(const vec2 uv) 
        {
            vec2 px = 1.0 / vec2(res);
            vec2 vc = (floor(uv * res)) * px;
            vec2 f = fract(uv * res);
            vec2 tl = texture2D(flow_field, vc).rg;
            vec2 tr = texture2D(flow_field, vc + vec2(px.x, 0)).rg;
            vec2 bl = texture2D(flow_field, vc + vec2(0, px.y)).rg;
            vec2 br = texture2D(flow_field, vc + px).rg;
            return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
        }

        void main() 
        {
            vec4 color = texture2D(particles, _uv);
            vec2 pos = vec2(
                color.r / 255.0 + color.b,
                color.g / 255.0 + color.a);

            vec2 flow_min = vec2(-flow_speed, -flow_speed);
            vec2 flow_max = vec2(flow_speed, flow_speed);
            vec2 velocity = mix(flow_min, flow_max, lookup(pos));

            float speed_t = length(velocity) / length(flow_max);
            pos += velocity;

            vec2 seed = (pos + _uv) * rand_seed;
            float drop_rate = drop_rate + speed_t * drop_rate_bump;
            float drop = step(1.0 - drop_rate, rand(seed));

            vec2 random_pos = vec2(
                rand(seed + 1.3),
                rand(seed - 1.3));
            pos = mix(pos, random_pos, drop);
            pos = fract(1.0 + pos);

            gl_FragColor = vec4(
                fract(pos * 255.0),
                floor(pos * 255.0) / 255.0);
        }`
    }
};

function Flow(res)
{
	var r = {};

    r.screen_quad = quad_mesh(2,2,0);
    r.quad = quad_mesh(1,1,0);
    r.shaders = {};
    
    for(var k in shader_src) 
    {
        var src = shader_src[k];
        var s = Shader(src.vs, src.fs);
        r.shaders[k] = bind_shader(s);
    }

    r.NUM_PARTICLES = res * res;
    r.hardness = 0.4;
    r.radius = 0.3;
	r.fade_opacity = 0.99;
    r.speed_factor = 0.1;
    r.drop_rate = 0.0007;
    r.cursor_velocity = 0;
    r.drop_rate_bump = 0.0001;
    r.flow_speed = 0.02;
    r.flow_speed_b = 13.0;
    r.cycle_rate = 0.3;
    r.cycle_offset = 100.0;
    r.blendmode = 'OVERLAY';

    r.demo_mode = true;
    r.demo_timer = 0;
    r.demo_mouse = Vec3(0.5,0.5);
    r.demo_press = false;

    r.press_buffer = [];
    r.x_buffer = [];
    r.y_buffer = [];
    r.record_frame = 1;

	// PARTICLE TEXTURES
    var flow_sampler = Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE,GL.LINEAR,GL.LINEAR, 1);

    var w = app.view[2];
    var h = app.view[3];
    var pixels = new Uint8Array(w * h * 4);
    var sampler = Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE,GL.NEAREST,GL.NEAREST, 1);

    r.background_texture = rgba_texture(w, h, pixels, sampler);
    r.screen_texture = rgba_texture(w, h, pixels, sampler);

    r.particle_res = res;

    var particle_state = new Uint8Array(r.NUM_PARTICLES * 4);
    for(var i = 0; i < particle_state.length; i+=4)
    {
        particle_state[i  ] = Math.random() * 255;
        particle_state[i+1] = Math.random() * 255;
        particle_state[i+2] = Math.random() * 255;
        particle_state[i+3] = Math.random() * 255;
    }

    r.particle_state_tex_A = rgba_texture(r.particle_res, r.particle_res, particle_state, sampler);
    r.particle_state_tex_B = rgba_texture(r.particle_res, r.particle_res, particle_state, sampler);


    var particles = new Float32Array(r.NUM_PARTICLES * 2);
    var index = 0;
    for(var i = 0; i < particles.length; i+=2)
    {
        var x = (index % r.particle_res) / r.particle_res;
        var y = Math.floor(index / r.particle_res) / r.particle_res;
        particles[i] = x;
        particles[i+1] = y;
        index++;
    }

    var vb = VertexBuffer
    (
        particles,
        {
            index: VertexAttribute(2, false),
        },
        BufferUpdateRate.DYNAMIC
    );
    r.particle_mesh = Mesh(vb, null, MeshLayout.POINTS);
    bind_mesh(r.particle_mesh);
    update_mesh(r.particle_mesh);

    // RENDER TARGET

    var pt = RenderTarget(app.view);
    bind_render_target(pt);
    r.particle_target = pt;

    var ft = RenderTarget(app.view);

    var flow_pixels = new Uint8Array(w * h * 4);
    for(var i = 0; i < flow_pixels.length; i += 4)
    {
    	flow_pixels[i  ] = 128 | 0;
    	flow_pixels[i+1] = 128 | 0;
    	flow_pixels[i+2] = 128 | 0;
    	flow_pixels[i+3] = 128 | 0;
    }

    r.flow_field = rgba_texture(w, h, flow_pixels, flow_sampler);
    bind_render_target(ft);
    set_render_target(ft);
    set_render_target_color(r.flow_field);

    set_render_target(null);

    r.flow_target = ft;

    return r;
}

function render_flow(f, dt)
{
    // DRAW FLOW FIELD

    var mp = input.mouse.position;
    var mouse = _Vec3();
    mouse[0] = mp[0] / app.view[2];
    mouse[1] = mp[1] / app.view[3];
    mouse[0] = mouse[0] * 2.0 - 1.0;
    mouse[1] = mouse[1] * 2.0 - 1.0;

    var i = f.record_frame;

    var md = input.mouse.delta;
    var delta = _Vec3();

    if(key_down(Keys.MOUSE_LEFT))
    {
        f.demo_mode = false;
        f.demo_timer = 0;
    }

    delta[0] = (md[0] / app.view[2]) + 1.0 * 0.5;
    delta[1] = (md[1] / app.view[3]) + 1.0 * 0.5;
    var vel = vec_length(md) / app.view[2];


    /*
    f.press_buffer[i] = key_held(Keys.MOUSE_LEFT)
    f.x_buffer[i] = mouse[0];
    f.y_buffer[i] = mouse[1];
    
    if(key_down(Keys.C))
    {
        var str = 'var press_buffer = [';
        for(var i = 0; i < f.press_buffer.length; ++i)
        {
            str += f.press_buffer[i];
            str += ','
        }
        str += ']';
        console.log(str)

        str = 'var x_buffer = [';
        for(var i = 0; i < f.x_buffer.length; ++i)
        {
            str += round_to(f.x_buffer[i], 2);
            str += ','
        }
        str += ']';
        console.log(str)

        str = 'var y_buffer = [';
        for(var i = 0; i < f.y_buffer.length; ++i)
        {
            str += round_to(f.y_buffer[i], 2);
            str += ','
        }
        str += ']';
        console.log(str)
    }
    */
    
    
    if(f.demo_mode === true)
    {
        mouse[0] = x_buffer[i];
        mouse[1] = y_buffer[i];
        delta[0] = x_buffer[i-1] - mouse[0];
        delta[1] = y_buffer[i-1] - mouse[1];
        f.demo_press = press_buffer[i]; 
        vel = vec_length(mouse);
        //f.cursor_velocity = lerp(f.cursor_velocity, vel, 0.9 * app.time.dt);
        f.cursor_velocity = vel;

    }
    
    f.record_frame++;
    if(f.record_frame >= x_buffer.length) f.record_frame = 1;
    //if(f.record_frame > 15 * 60) f.record_frame = 0;

    set_viewport(app.view);
    disable_depth_testing();
    disable_stencil_testing();

    enable_alpha_blending();
    if(key_held(Keys.MOUSE_LEFT) || (f.demo_mode === true && f.demo_press === true))
    {
	    set_blend_mode(BlendMode.DEFAULT);
	    set_render_target(f.flow_target);
	    set_shader(f.shaders.velocity);
	    set_uniform('mouse', mouse);
	    set_uniform('velocity', delta);
	    set_uniform('hardness', f.hardness);
	    set_uniform('radius', f.cursor_velocity);
	    draw_mesh(f.quad);
	}

    disable_alpha_blending();

    // DRAW BACKGROUND TEXTURE
    set_render_target(f.particle_target);
    set_render_target_color(f.screen_texture);
    set_viewport(app.view);
    set_shader(f.shaders.screen_particles);
    set_uniform('screen', f.background_texture);
    set_uniform('opacity', f.fade_opacity);
    draw_mesh(f.screen_quad);

    // DRAW PARTICLES
    enable_alpha_blending();
    set_blend_mode(BlendMode[f.blendmode]);
    set_shader(f.shaders.draw_particles);
    set_uniform('res', f.particle_res);
    set_uniform('particles', f.particle_state_tex_A);
    set_uniform('flow_field', f.flow_field);
    set_uniform('flow_speed', f.flow_speed_b);
    set_uniform('offset', (app.time.elapsed * f.cycle_rate) % f.cycle_offset);
    draw_mesh(f.particle_mesh);

    // DRAW SCREEN TEXTURE
    set_render_target(null);
    set_viewport(app.view);
    enable_alpha_blending();
    set_shader(f.shaders.screen_particles);
    set_uniform('screen', f.screen_texture);
    set_uniform('opacity', 1.0);
    draw_mesh(f.screen_quad);

    var tmp = f.background_texture;
    f.background_texture = f.screen_texture;
    f.screen_texture = tmp;

    // UPDATE PARTICLES

    disable_alpha_blending();
    set_render_target(f.particle_target);
    set_render_target_color(f.particle_state_tex_A);
    set_viewport(_Vec4(0,0, f.particle_res, f.particle_res));
    set_shader(f.shaders.update_particles);
    set_uniform('particles', f.particle_state_tex_B);
    set_uniform('flow_field', f.flow_field);
    set_uniform('res', f.particle_res);
    set_uniform('rand_seed', Math.random());
    set_uniform('flow_speed', f.flow_speed);
    set_uniform('drop_rate', f.drop_rate);
    set_uniform('drop_rate_bump', f.drop_rate_bump);
    draw_mesh(f.screen_quad);

    var tmp2 = f.particle_state_tex_B;
    f.particle_state_tex_B = f.particle_state_tex_A;
    f.particle_state_tex_A = tmp2;
}

    

window.addEventListener('load', main);

var app = {};

function main()
{
    app.has_focus = true;
    app.needs_resize = false;
    app.res = window.devicePixelRatio | 0;
    app.container = document.querySelector('.app');
    app.time = Time();
    app.canvas = Canvas(app.container, app.view);
    app.view = Vec4(0,0,app.canvas.width, app.canvas.height);
    app.input = Input(app.container);
    app.webgl = WebGL(app.canvas,
    {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        preferLowPowerToHighPerformance: false,
        failIfMajorPerformanceCaveat: false,
    });

    app.sampler = default_sampler();

    window.addEventListener('focus', function()
    {
        console.log('FOCUS');
        app.has_focus = true;
    });
    window.addEventListener('blur', function()
    {
        console.log('BLUR');
        app.has_focus = false;
    });
    window.addEventListener('resize', function()
    {
        app.needs_resize = true;
    });

    app.flow = Flow(1024);
    set_clear_color([0,0,0,1]);
    clear_screen();

    set_viewport(app.view);
    clear_stacks();
    requestAnimationFrame(update);
}

function update(t)
{
    set_time(app.time, t);
    requestAnimationFrame(update);

    if(app.time.paused === true || app.has_focus === false) return;

    var dt = app.time.dt;
    render_flow(app.flow, dt);
    update_input();
    clear_stacks();
}

