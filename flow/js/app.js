'use strict';

//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
};
function LOG(message)
{
	console.log(message);
};
function ERROR(message)
{
	console.error(message);
};
//END
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
	//DEBUG
	if(this.index === this.count)
	{
		console.error("Stack overflow");
		console.error(this);
	}
	//END
	return r;
}

function clear_stacks()
{
	var n = _stacks.length;
	for(var i = 0; i < n; ++i)
	{
		_stacks[i].index = 0;
	}
}
var _BR;

function BinaryReader(buffer, alignment)
{
    var r = {};
    r.buffer = buffer;
    r.alignment = alignment || 4;
    r.bytes = new DataView(buffer);
    r.offset = 0;
    return r;
}

function Request(params)
{
    var r = new XMLHttpRequest();

    var type = params.type || 'GET';
    r.open(type, params.url, true);

    r.responseType = params.response_type || 'arraybuffer';
    
    if(params.fail)
    {
        r.error = params.fail;
        r.abort = params.fail;
    }

    if(params.headers)
    {
        for(var k in params.headers)
        {
            var h = params.headers[k];
            r.setRequestHeader(k, h);
        }
    }

    r.onload = function(e)
    {
        if(e.target.status === 200)
        {
            params.success(e.target.response);
        }
        else 
        {
            if(params.fail) params.fail(e);
        }
    }

    if(params.onchange)
        r.onreadystatechange = params.onchange;

    if(params.onprogress) 
        r.onprogress = params.progress;

    if(params.auto_send !== false)
        r.send();

    return r;
}

function set_reader_ctx(ctx){ _BR = ctx; }
function end_reader_ctx(){ _BR = null; }

function read_boolean()
{
    var r = read_i32();
    if(r === 1) return true;
    return false;
}

function read_bytes(count)
{
    var r = new Uint8Array(_BR.buffer, _BR.offset, count);
    _BR.offset += count;
    return r;
}

function read_i32(count)
{
    var r;
    if(count)
    {
        r = new Int32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getInt32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}

function read_u32(count)
{
    var r;
    if(count)
    {
        r = new Uint32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getUint32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}

function read_f32(count)
{
    var r;
    if(count)
    {
        r = new Float32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getFloat32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}

function read_f64(count)
{
    var r;
    if(count)
    {
        r = new Float64Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 8;
        return r;
    }

    r = _BR.bytes.getFloat64(_BR.offset, true);
    _BR.offset += 8;
    return r;
}

function get_padding(alignment, size)
{
    return (alignment - size % alignment) % alignment;
}

function read_string()
{
    var size = read_u32();
    var pad = get_padding(_BR.alignment, size);
    var r = String.fromCharCode.apply(null, new Uint8Array(_BR.buffer, _BR.offset, size));
    _BR.offset += size + pad;
    return r;
}

function uint8_to_base64(input) 
{
    var key_str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

    var i = 0;
    var n = input.length;
    while (i < n) 
    {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) enc3 = enc4 = 64;
        else if (isNaN(chr3)) enc4 = 64;
        
        output += key_str.charAt(enc1) + key_str.charAt(enc2) +
                  key_str.charAt(enc3) + key_str.charAt(enc4);
    }
    return output;
}
function AssetGroup(name)
{
    var r = {};
    r.name = name;
    r.load_count = 0;
    r.loaded = false;
    r.is_loading = false;
    r.load_progress = 0;
    r.onload = null;

    r.shaders = {};
    r.meshes = {};
    r.textures = {};
    r.fonts = {};
    r.animations = {};
    r.rigs = {};
    r.curves = {};
    r.sounds = {};
    return r;
}
var AssetType = 
{
    SHADER: 0,
    SCENE: 1,
    FONT: 2,
    PNG: 3,
    JPG: 15,
    CAMERA: 4,
    LAMP: 5,
    MESH: 6,
    MATERIAL: 7,
    ACTION: 8,
    ENTITY: 9,
    EMPTY: 10,
    RIG: 11,
    RIG_ACTION: 12,
    CURVE: 13,
    CUBEMAP: 14,
    SOUNDS: 15,
    END: -1
}

function load_assets(ag, urls, onload)
{
    LOG('Loading Asset Group: ' + ag.name);

    ag.onload = onload;

    for(var k in urls)
    {
        var url = urls[k];
        var path = url.match(/[^\\/]+$/)[0];
        var name = path.split(".")[0];
        var type = path.split(".")[1];

        //LOG('Loading: ' + path);

        ag.load_count++;

        switch(type)
        {
            case 'txt':
            {
                var rq = Request(
                {
                    url: url,
                    success: function(data)
                    {
                        read_asset_file(data, ag);
                        ag.load_count--;
                        update_load_progress(ag);
                    },
                });
                
                break;
            }
            case 'png':
            case 'jpg':
            {
                ag.textures[name] = load_texture_async(url, ag);
                break;
            }
            default: break;
        }

    }
}

function update_load_progress(ag)
{
    if(ag.load_count === 0)
    {
        ag.loaded = true;
        LOG('Asset Group: ' + ag.name + ' loaded');
        if(ag.onload) ag.onload();
    }
}

function bind_assets(assets)
{
    for(var k in assets.shaders) 
    {
        bind_shader(assets.shaders[k]);
    }
    for(var k in assets.meshes)
    {
        var m = assets.meshes[k];
        bind_mesh(m);
        update_mesh(m);
    }
    for(var k in assets.textures) 
    {
        var t = assets.textures[k];
        bind_texture(t);
        update_texture(t);
    }
    for(var k in assets.fonts) 
    {
        var f = assets.fonts[k];
        bind_texture(f.atlas);
        update_texture(f.atlas);
    }
}

function read_asset_file(data, assets)
{
    var br = BinaryReader(data, 4);

    set_reader_ctx(br);

        var complete = false;
        while(complete === false)
        {
            var asset_type = read_i32();
            switch(asset_type)
            {
                case AssetType.SHADER: { read_shader(assets); break; }
                case AssetType.SCENE: { read_scene(assets); break; }
                case AssetType.FONT: { read_font(assets); break; }
                case AssetType.PNG: { read_texture('png', assets); break; }
                case AssetType.JPG: { read_texture('jpg', assets); break; }
                case AssetType.END: { complete = true; break; }
                default: { complete = true; }
            }
        }

    end_reader_ctx();
    
    return assets;
}

function read_scene(ag)
{
    var size = read_i32();
    var name = read_string();
    var offset = _BR.offset;
    var pad = get_padding(_BR.alignment, size);

    var complete = false;
    while(complete === false)
    {
        var import_type = read_i32();
        switch(import_type)
        {
            case AssetType.CAMERA: { read_camera(ag); break; }
            case AssetType.LAMP: { read_lamp(ag); break; }
            case AssetType.MESH: { read_mesh(ag); break; }
            case AssetType.MATERIAL: { read_material(ag); break; }
            case AssetType.ACTION: { read_animation(ag); break; }
            case AssetType.EMPTY: { read_transform(ag); break; }
            case AssetType.ENTITY: { read_entity(ag); break; }
            case AssetType.RIG: { read_rig(ag); break; }
            case AssetType.RIG_ACTION: { read_rig_action(ag); break; }
            case AssetType.CURVE: { read_curve(ag); break; }
            case AssetType.END: { complete = true; break; }
            default: { complete = true; }
        }
    }

    _BR.offset = offset + size + pad;
}
var E = 2.71828182845904523536028747135266250;
var PI = 3.1415926535897932;
var TAU = 6.28318530718;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var PI_OVER_360 = 0.00872664625;
var PI_OVER_TWO = PI / 2;
var PI_OVER_FOUR = PI / 4;
var TWO_PI = 2 * PI;
var FOUR_PI = 4 * PI;
var EPSILON = 2.2204460492503131e-16;


function radians(v)
{
	return v * DEG2RAD;
}

function degrees(v)
{
	return v * RAD2DEG;
}

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

function distance(ax, ay, bx, by)
{
	var dx = bx - ax;
	var dy = by - ay;
	return Math.sqrt((dx * dx) + (dy * dy));
}

function angle(x,y)
{
	return Math.atan2(y,x) * RAD2DEG + 180;
}


function Time()
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;
    r.now = 0;
    r.last = 0;
    r.dt = 0;
    r.frame = 0;
    r.scale = 1;
    r.paused = false;
    return r;
}

function set_time(time, t)
{
    time.frame++;
    time.now = t;
    time.dt = ((t - time.last) / 1000) * time.scale;
    if(time.dt > time.max_frame) time.dt = 0.016;
    time.last = t;
    time.elapsed += time.dt * time.scale;
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

function vec_approx_equal(a,b)
{
	var n = a.length;
	for(var i = 0; i < n; ++i)
	{
		if(Math.abs(a[i] - b[i]) > EPSILON) return false;
	}
	return true;
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
function vec_perp(r, a)
{
	var x = -a[1];
	var y = a[0];
	r[0] = x; r[1] = y;
	vec_normalized(r,r);
}
function vec_angle_2D(v)
{
	return Math.atan2(v[1], v[0]);
}
function vec_min(r, a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = Math.min(a[i], b[i]);
}
function vec_max(r, a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = Math.max(a[i], b[i]);
}

function vec_lerp(r, a,b, t)
{
	var it = 1-t;
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = it * a[i] + t * b[i];
}
function vec_clamp(r, min,max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i)
	{
		if(r[i] < min[i]) r[i] = min[i];
		if(r[i] > max[i]) r[i] = max[i];
	}
}
function vec_clamp_f(r, min, max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i)
	{
		if(r[i] < min) r[i] = min;
		if(r[i] > max) r[i] = max;
	}
}
function vec_reflect(r, a,n)
{
	vec_add(r, v,n);
	vec_mulf(r, -2.0 * vec_dot(v,n)); 
}
function vec_cross(r, a,b)
{
	var x = a[1] * b[2] - a[2] * b[1];
	var y = a[2] * b[0] - a[0] * b[2];
	var z = a[0] * b[1] - a[1] * b[0];
	set_vec3(r, x,y,z);
}
function vec_project(r, a,b)
{
	vec_mul_f(r, a, vec_dot(a,b));
	var sqr_l = vec_sqr_length(r);
	if(sqr_l < 1)
	{
		vec_div_f(r, Math.sqrt(sqr_l));
	}
}
function vec_tangent(r, a,b, plane)
{
	var t = _Vec3();
	vec_add(t, b,a);
	vec_normalized(t,t);
	vec_cross(r, t,plane);
}
function vec_rotate(r, v,q)
{
	var tx = (q[1] * v[2] - q[2] * v[1]) * 2;
	var ty = (q[2] * v[0] - q[0] * v[2]) * 2;
	var tz = (q[0] * v[1] - q[1] * v[0]) * 2;

	var cx = q[1] * tz - q[2] * ty;
	var cy = q[2] * tx - q[0] * tz;
	var cz = q[0] * ty - q[1] * tx;

	r[0] = v[0] + q[2] * tx + cx;
	r[1] = v[1] + q[2] * ty + cy;
	r[2] = v[2] + q[2] * tz + cz;
}

function vec_rotate_2D(r, v,a)
{
	var rad = a * DEG2RAD;
	var cr = Math.cos(rad);
	var sr = Math.sin(rad);
	r[0] = v[0] * cr - v[1] * sr;
    r[1] = v[0] * sr + v[1] * cr;
}

function vec_lerp(r, a,b,t)
{
	var n = r.length;
	var it = 1-t;
	for(var i = 0; i < n; ++i) r[i] = it * a[i] + t * b[i];
}
function vec_to_string(v, digits)
{
	var str = '[';
	var n = v.length;
	for(var i = 0; i < n-1; ++i)
		str += round_to(v[i], digits) + ', '
	str += round_to(v[n-1], digits);
	str += ']';
	return str;
}
function Mat4()
{
	return new Float32Array([1,0,0,0,
							 0,1,0,0,
							 0,0,1,0,
							 0,0,0,1]);
}

var mat4_stack = new Stack(Mat4, 16);

function _Mat4()
{
	var r = mat4_stack.get();
	mat4_identity(r);
	return r;
}

function mat4_identity(m)
{
	m[ 0] = 1; m[ 1] = 0; m[ 2] = 0; m[ 3] = 0;
	m[ 4] = 0; m[ 5] = 1; m[ 6] = 0; m[ 7] = 0;
	m[ 8] = 0; m[ 9] = 0; m[10] = 1; m[11] = 0;
	m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
}

function mat4_mul(r, a,b)
{
	var t = _Mat4();
	t[ 0] = a[ 0] * b[0] + a[ 1] * b[4] + a[ 2] * b[ 8] + a[ 3] * b[12];
	t[ 1] = a[ 0] * b[1] + a[ 1] * b[5] + a[ 2] * b[ 9] + a[ 3] * b[13];
	t[ 2] = a[ 0] * b[2] + a[ 1] * b[6] + a[ 2] * b[10] + a[ 3] * b[14];
	t[ 3] = a[ 0] * b[3] + a[ 1] * b[7] + a[ 2] * b[11] + a[ 3] * b[15];
	t[ 4] = a[ 4] * b[0] + a[ 5] * b[4] + a[ 6] * b[ 8] + a[ 7] * b[12];
	t[ 5] = a[ 4] * b[1] + a[ 5] * b[5] + a[ 6] * b[ 9] + a[ 7] * b[13];
	t[ 6] = a[ 4] * b[2] + a[ 5] * b[6] + a[ 6] * b[10] + a[ 7] * b[14];
	t[ 7] = a[ 4] * b[3] + a[ 5] * b[7] + a[ 6] * b[11] + a[ 7] * b[15];	
	t[ 8] = a[ 8] * b[0] + a[ 9] * b[4] + a[10] * b[ 8] + a[11] * b[12];
	t[ 9] = a[ 8] * b[1] + a[ 9] * b[5] + a[10] * b[ 9] + a[11] * b[13];
	t[10] = a[ 8] * b[2] + a[ 9] * b[6] + a[10] * b[10] + a[11] * b[14];
	t[11] = a[ 8] * b[3] + a[ 9] * b[7] + a[10] * b[11] + a[11] * b[15];
	t[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[ 8] + a[15] * b[12];
	t[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[ 9] + a[15] * b[13];
	t[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
	t[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
	vec_eq(r,t);

	mat4_stack.index--;
}

function mat4_determinant(m)
{
	var a0 = m[ 0] * m[ 5] - m[ 1] * m[ 4];
	var a1 = m[ 0] * m[ 6] - m[ 2] * m[ 4];
	var a2 = m[ 0] * m[ 7] - m[ 3] * m[ 4];
	var a3 = m[ 1] * m[ 6] - m[ 2] * m[ 5];
	var a4 = m[ 1] * m[ 7] - m[ 3] * m[ 5];
	var a5 = m[ 2] * m[ 7] - m[ 3] * m[ 6];
	var b0 = m[ 8] * m[13] - m[ 9] * m[12];
	var b1 = m[ 8] * m[14] - m[10] * m[12];
	var b2 = m[ 8] * m[15] - m[11] * m[12];
	var b3 = m[ 9] * m[14] - m[10] * m[13];
	var b4 = m[ 9] * m[15] - m[11] * m[13];
	var b5 = m[10] * m[15] - m[11] * m[14];
	return a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
}

function mat4_transposed(r, m)
{
	var t = _Mat4();
	t[ 0] = m[ 0]
	t[ 1] = m[ 4]; 
	t[ 2] = m[ 8]; 
	t[ 3] = m[12];
	t[ 4] = m[ 1];
	t[ 5] = m[ 5];
	t[ 6] = m[ 9]; 
	t[ 7] = m[13];
	t[ 8] = m[ 2]; 
	t[ 9] = m[ 6];
	t[10] = m[10]; 
	t[11] = m[14];
	t[12] = m[ 3]; 
	t[13] = m[ 7]; 
	t[14] = m[11];
	t[15] = m[15];
	vec_eq(r,t);
	mat4_stack.index--; 	
}

function mat4_inverse(r, m)
{
	var v0 = m[ 2] * m[ 7] - m[ 6] * m[ 3];
	var v1 = m[ 2] * m[11] - m[10] * m[ 3];
	var v2 = m[ 2] * m[15] - m[14] * m[ 3];
	var v3 = m[ 6] * m[11] - m[10] * m[ 7];
	var v4 = m[ 6] * m[15] - m[14] * m[ 7];
	var v5 = m[10] * m[15] - m[14] * m[11];

	var t0 =   v5 * m[5] - v4 * m[9] + v3 * m[13];
	var t1 = -(v5 * m[1] - v2 * m[9] + v1 * m[13]);
	var t2 =   v4 * m[1] - v2 * m[5] + v0 * m[13];
	var t3 = -(v3 * m[1] - v1 * m[5] + v0 * m[ 9]);

	var idet = 1.0 / (t0 * m[0] + t1 * m[4] + t2 * m[8] + t3 * m[12]);

	r[0] = t0 * idet;
	r[1] = t1 * idet;
	r[2] = t2 * idet;
	r[3] = t3 * idet;

	r[4] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[5] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[6] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[7] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

	v0 = m[1] * m[ 7] - m[ 5] * m[3];
	v1 = m[1] * m[11] - m[ 9] * m[3];
	v2 = m[1] * m[15] - m[13] * m[3];
	v3 = m[5] * m[11] - m[ 9] * m[7];
	v4 = m[5] * m[15] - m[13] * m[7];
	v5 = m[9] * m[15] - m[13] * m[11];

	r[ 8] =  (v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[ 9] = -(v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[10] =  (v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[11] = -(v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

	v0 = m[ 6] * m[1] - m[ 2] * m[ 5];
	v1 = m[10] * m[1] - m[ 2] * m[ 9];
	v2 = m[14] * m[1] - m[ 2] * m[13];
	v3 = m[10] * m[5] - m[ 6] * m[ 9];
	v4 = m[14] * m[5] - m[ 6] * m[13];
	v5 = m[14] * m[9] - m[10] * m[13];

	r[12] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[13] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[14] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[15] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;
}

function mat4_inverse_affine(r, m)
{
	var t0 = m[10] * m[5] - m[ 6] * m[9];
	var t1 = m[ 2] * m[9] - m[10] * m[1];
	var t2 = m[ 6] * m[1] - m[ 2] * m[5];

	var idet = 1.0 / (m[0] * t0 + m[4] * t1 + m[8] * t2);

	var v0 = m[0] * idet;
	var v4 = m[4] * idet;
	var v8 = m[8] * idet;

	r[ 0] = t0 * idet; 
	r[ 1] = t1 * idet; 
	r[ 2] = t2 * idet;
	r[ 3] = 0;
	r[ 4] = v8 * m[ 6] - v4 * m[10];
	r[ 5] = v0 * m[10] - v8 * m[ 2];
	r[ 6] = v4 * m[ 2] - v0 * m[ 6];
	r[ 7] = 0;
	r[ 8] = v4 * m[9] - v8 * m[5];
	r[ 9] = v8 * m[1] - v0 * m[9];
	r[10] = v0 * m[5] - v4 * m[1];
	r[11] = 0;
	r[12] = -(r[0] * m[12] + r[4] * m[13] + r[ 8] * m[14]);
	r[13] = -(r[1] * m[12] + r[5] * m[13] + r[ 9] * m[14]);
	r[14] = -(r[2] * m[12] + r[6] * m[13] + r[10] * m[14]);		
	r[15] = 1;

	return r;
}

function mat4_translate(m,v)
{
	var t = _Mat4();
	vec_eq(t,m);

	m[12] = t[0] * v[0] + t[4] * v[1] + t[ 8] * v[2] + t[12];
    m[13] = t[1] * v[0] + t[5] * v[1] + t[ 9] * v[2] + t[13];
    m[14] = t[2] * v[0] + t[6] * v[1] + t[10] * v[2] + t[14];
    m[15] = t[3] * v[0] + t[7] * v[1] + t[11] * v[2] + t[15];

    mat4_stack.index--;
}

function mat4_set_position(m, p)
{
	m[12] = p[0]; 
	m[13] = p[1]; 
	m[14] = p[2];
}

function mat4_get_position(r, m)
{
	r[0] = m[12];
	r[1] = m[13];
	r[2] = m[14];
}

function mat4_set_scale(m, s)
{
	m[ 0] = s[0]; 
	m[ 5] = s[1]; 
	m[10] = s[2];
}

function mat4_scale(m, s)
{
	m[ 0] *= s[0]; 
	m[ 1] *= s[0]; 
	m[ 2] *= s[0];
	m[ 3] *= s[0];
	m[ 4] *= s[1];
	m[ 5] *= s[1];
	m[ 6] *= s[1];
	m[ 7] *= s[1];
	m[ 8] *= s[2];
	m[ 9] *= s[2];
	m[10] *= s[2];
	m[11] *= s[2];
}

function mat4_get_scale(r, m)
{
	r[0] = m[0];
	r[1] = m[5];
	r[2] = m[10];
}

function mat4_rotate_x(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);

    m[ 4] = t[ 4] * c + t[ 8] * s;
    m[ 5] = t[ 5] * c + t[ 9] * s;
    m[ 6] = t[ 6] * c + t[10] * s;
    m[ 7] = t[ 7] * c + t[11] * s;
    m[ 8] = t[ 8] * c - t[ 4] * s;
    m[ 9] = t[ 9] * c - t[ 5] * s;
    m[10] = t[10] * c - t[ 6] * s;
    m[11] = t[11] * c - t[ 7] * s;

    mat4_stack.index--;

    return m;
}

function mat4_rotate_y(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);

    m[ 0] = t[0] * c - t[ 8] * s;
    m[ 1] = t[1] * c - t[ 9] * s;
    m[ 2] = t[2] * c - t[10] * s;
    m[ 3] = t[3] * c - t[11] * s;
    m[ 8] = t[0] * s + t[ 8] * c;
    m[ 9] = t[1] * s + t[ 9] * c;
    m[10] = t[2] * s + t[10] * c;
    m[11] = t[3] * s + t[11] * c;

    mat4_stack.index--;

    return m;
}

function mat4_rotate_z(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);
    
    m[0] = t[0] * c + t[4] * s;
    m[1] = t[1] * c + t[5] * s;
    m[2] = t[2] * c + t[6] * s;
    m[3] = t[3] * c + t[7] * s;
    m[4] = t[4] * c - t[0] * s;
    m[5] = t[5] * c - t[1] * s;
    m[6] = t[6] * c - t[2] * s;
    m[7] = t[7] * c - t[3] * s;

    mat4_stack.index--;

    return m;
}

function mat4_set_rotation(m, r)
{
	var x2 = 2 * r[0]; 
	var y2 = 2 * r[1]; 
	var z2 = 2 * r[2];
	var xx = r[0] * x2; 
	var xy = r[0] * y2; 
	var xz = r[0] * z2;
	var yy = r[1] * y2;
	var yz = r[1] * z2;
	var zz = r[2] * z2;
	var wx = r[3] * x2; 
	var wy = r[3] * y2;
	var wz = r[3] * z2;

	m[ 0] = 1 - (yy + zz);
	m[ 1] = xy + wz;
	m[ 2] = xz - wy;
	m[ 3] = 0;
	m[ 4] = xy - wz;
	m[ 5] = 1 - (xx + zz);
	m[ 6] = yz + wx;
	m[ 7] = 0;
	m[ 8] = xz + wy;
	m[ 9] = yz - wx;
	m[10] = 1 - (xx + yy);
	m[11] = 0;
	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;
}

function mat4_get_rotation(r, m)
{
	var t;
	if(m[10] < 0)
	{
		if(m[0] > m[5])
		{
			t = 1 + m[0] - m[5] - m[10];
			vec4_set(t, m[1] + m[4], m[8] + m[2], m[6] - m[9]);
		}
		else
		{
			t = 1 - m[0] + m[5] - m[10];
			vec4_set(m[1] + m[4], t, m[6] + m[9], m[8] - m[2]);
		}
	}
	else
	{
		if (m[0] < -m[5])
		{
			t = 1 - m[0] - m[5] + m[10];
			vec4_set(m[8] + m[2], m[6] + m[9], t, m[1] - m[4]);
		}
		else
		{
			t = 1 + m[0] + m[5] + m[10];
			vec4_set(m[6] - m[9], m[8] - m[2], m[1] - m[4], t);
		}
	}

	var rf = _Vec4();
	vec_mul_f(rf, r, 0.5);
	vec_div_f(r, rf, t);
}

function mat4_compose(m, p, s, r)
{
	mat4_set_rotation(m,r);
	mat4_scale(m,s);
	mat4_set_position(m,p);
}

function mat4_mul_point(r, m, p)
{
	var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12];
	var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13];
	var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
	r[0] = x; r[1] = y; r[2] = z;
}

function mat4_mul_dir(r, m, p)
{
	var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2];
	var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2];
	var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2];
	r[0] = x; r[1] = y; r[2] = z;
}

function mat4_mul_projection(r, m, p)
{
	var d = 1 / (m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]);
	var x = (m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12]) * d;
	var y = (m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13]) * d;
	var z = (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) * d;

	r[0] = x; r[1] = y; r[2] = z;
}
function perspective_projection(m, n,f,aspect,fov)
{
    mat4_identity(m);

    var h = 1.0 / Math.tan(fov * PI_OVER_360);
    var y = n - f;
    
    m[ 0] = h / aspect;
    m[ 5] = h;
    m[10] = (f + n) / y;
    m[11] = -1.0;
    m[14] = 2.0 * (n * f) / y;
    m[15] = 1.0;
}

function ortho_projection(m, w,h,n,f)
{
    mat4_identity(m);
    
    m[ 0] = 2.0 / w;
    m[ 5] = 2.0 / h;
    m[10] = -2.0 / (f - n);
    m[11] = -n / (f - n);
    m[15] = 1.0;
}

function cartesian_to_polar(r, c)
{
    var radius = vec_length(c);
    var theta = Math.atan2(c[1], c[0]);
    var phi = Math.acos(2 / radius);
    set_vec3(r, theta, phi, radius);
}

function polar_to_cartesian(r, a, b, radius)
{
    var ar = a * DEG2RAD;
    var br = b * DEG2RAD;

    var x = radius * Math.cos(br) * Math.cos(ar);
    var y = radius * Math.sin(br);
    var z = radius * Math.cos(br) * Math.sin(ar);
    set_vec3(r, x,y,z);
}

function polar_to_cartesian_v(r, v, radius)
{
    var ar = v[0] * DEG2RAD;
    var br = v[1] * DEG2RAD;

    var x = radius * Math.cos(br) * Math.cos(ar);
    var y = radius * Math.sin(br);
    var z = radius * Math.cos(br) * Math.sin(ar);
    set_vec3(r, x,y,z);
}

function lng_lat_to_cartesian(r, lng, lat, radius)
{
    polar_to_cartesian(r, -lng + 90, lat, radius);
}

function world_to_screen(r, projection, world, view)
{
    var wp = _Vec3(); 
    mat4_mul_projection(wp, projection, world);
    r[0] = ((wp[0] + 1.0) / 2.0) * view[2] / app.res;
    r[1] = ((1.0 - wp[1]) / 2.0) * view[3] / app.res;
    vec3_stack.index--;
}

function screen_to_view(r, point, view)
{
    r[0] = point[0] / view[2];
    r[1] = 1.0 - (point[1] / view[3]);
    r[2] = point[2];
}

function screen_to_world(r, projection, point, view)
{
    var t = _Vec3();
    t[0] =  2.0 * point[0] / view[2] - 1.0;
    t[1] = -2.0 * point[1] / view[3] + 1.0;
    t[2] = point[2];

    var inv = _Mat4();
    mat4_inverse(inv, projection);
    mat4_mul_point(r, inv, t);

    mat4_stack.index--;
    vec3_stack.index--;
}

function get_mouse_world_position(r, camera)
{
    var mp = _Vec3();
    vec_eq(mp, input.mouse.position);
    mp[0] *= app.res;
    mp[1] *= app.res;
    screen_to_world(r, camera.view_projection, mp, app.view);
}

function world_camera_rect(r, projection, view)
{
    var index = vec3_stack.index;

    var bl  = _Vec3();
    var tr  = _Vec3(view[2], view[3]);
    var blw = _Vec3();
    var trw = _Vec3();

    screen_to_world(blw, projection, bl, view);
    screen_to_world(trw, projection, tr, view);

    r[2] = trw[0] - blw[0];
    r[3] = trw[1] - blw[1];

    vec3_stack.index = index;
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

function read_shader(ag)
{
    var name = read_string();
    var vs = read_string();
    var fs = read_string();
    var shader = Shader(vs, fs);
    shader.name = name;
    if(ag) ag.shaders[name] = shader;
    return shader;
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

function PositionAttribute()
{
	return VertexAttribute(3, false);
}
function UVAttribute()
{
	return VertexAttribute(2, false);
}
function ColorAttribute()
{
	return VertexAttribute(4, true);
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
	//r.update_start = 0;
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

function resize_vertex_buffer(vb, count, copy)
{
	if(vb === null) alloc_vertex_buffer_memory(vb, count);
	else
	{
		ASSERT((vb.data.length / vb.stride) !== vertex_count, 'Buffer already correct size');

		var new_buffer = new Float32Array(vb.stride * count);
		if(copy) new_buffer.set(vb.data);
		vb.data = new_buffer;
		vb.count = vb.data.length / vb.stride;
		vb.capacity = vb.data.length / vb.stride;
	}
}

function copy_vertex_attribute(r, vb, attr, index)
{
	var n = vb.attributes[attr].size;
	var start = index * vb.stride;
	var end = start + n;
	for(var i = start; i < end; ++i) r[i] = vb.data[i];
}

function zero_buffer(b)
{
	var n = b.length;
	for(var i = 0; i < n; ++i) b[i] = 0;
}

function clear_mesh_buffers(mesh)
{
	mesh.vertex_buffer.offset = 0;
	zero_buffer(mesh.vertex_buffer.data);

	if(mesh.index_buffer !== null)
	{
		mesh.index_buffer.offset = 0;
		mesh.index_buffer.triangle_offset = 0;
		zero_buffer(mesh.index_buffer.data);
	}
}

function IndexBuffer(data, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.count = 0;
	r.offset = 0;
	r.triangle_offset = 0;
	if(data) r.count = r.data.length;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	return r;
}
function alloc_index_buffer_memory(ib, count)
{
	ib.data = new Uint32Array(count);
	ib.count = count;
}

function resize_index_buffer(ib, count, copy)
{
	if(ib === null) alloc_index_buffer_memory(ib, count);
	else
	{
		var new_buffer = new Uint32Array(count);
		if(copy) new_buffer.set(ib.data);
		ib.data = new_buffer;
		ib.count = ib.data.length;
	}
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
	r.render_buffer = null;
	r.color = null;
	r.depth = null;
	r.view = view;
	return r;
}

function standard_render_target(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = rgba_texture(view[2], view[3], null, app.sampler);
	r.depth = depth_texture(view[2], view[3], app.sampler);
	r.view = view;
	bind_render_target(r);
	set_render_target(r);
	set_render_target_color(r.color);
	set_render_target_depth(r.depth);
	verify_frame_buffer();
	set_render_target(null);
	return r;
}

function depth_render_target(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.depth = depth_texture(view[2], view[3], app.sampler);
	r.view = view;
	bind_render_target(r);
	set_render_target(r);
	set_render_target_depth(r.depth);
	verify_frame_buffer();
	set_render_target(null);
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

function GLState()
{
	var r = {};

	r.shader = null;
	r.render_buffer = null;
	r.frame_buffer = null;
	r.array_buffer = null;
	r.index_buffer = null;
	r.texture = null;

	r.blending = null;
	r.blend_mode = null;
	r.depth_testing = null;
	r.depth_write = null;
	r.depth_mode = null;
	r.depth_min = null;
	r.depth_max = null;

	r.scissor = null;
	r.culling = null;
	r.winding_order = null;
	r.line_width = null;
	r.dither = null;

	return r;
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

    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL._parameters.max_anisotropy = null;
	var anisotropic = GL.extensions.EXT_texture_filter_anisotropic;
	if(anisotropic !== undefined)
	{
		GL._parameters.max_anisotropy = GL.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	}

	GL._state = GLState();
	reset_webgl_state();

	// DEBUG
	//log_webgl_info(GL);
	// END

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

function enable_dithering()
{
	if(GL._state.dither === true) return;
	GL._state.dither = true;

	GL.enable(GL.DITHER);
}
function disable_dithering()
{
	if(GL._state.dither === false) return;
	GL._state.dither = false;

	GL.disable(GL.DITHER);
}

function enable_backface_culling()
{
	if(GL._state.culling === true) return;
	GL._state.culling = true;

	GL.enable(GL.CULL_FACE);
}
function disable_backface_culling()
{
	if(GL._state.culling === false) return;
	GL._state.culling = false;

	GL.disable(GL.CULL_FACE);
}

function enable_depth_testing(mode)
{
	if(GL._state.depth_testing === true) return;
	GL._state.depth_testing = true;

	GL.enable(GL.DEPTH_TEST);
	if(mode) GL.depthFunc(mode);
}

function disable_depth_testing()
{
	if(GL._state.depth_testing === false) return;
	GL._state.depth_testing = false;

	GL.disable(GL.DEPTH_TEST);
}

function enable_scissor_testing()
{
	if(GL._state.scissor_testing === true) return;
	GL._state.scissor_testing = true;

	GL.enable(GL.SCISSOR_TEST);
}

function disable_scissor_testing()
{
	if(GL._state.scissor_testing === false) return;
	GL._state.scissor_testing = false;

	GL.disable(GL.SCISSOR_TEST);
}

function enable_stencil_testing()
{
	if(GL._state.stencil_testing === true) return;
	GL._state.stencil_testing = true;
	GL.enable(GL.STENCIL_TEST);
}

function disable_stencil_testing()
{
	if(GL._state.stencil_testing === false) return;
	GL._state.stencil_testing = false;
	GL.disable(GL.STENCIL_TEST);
}

function enable_alpha_blending()
{
	if(GL._state.blending === true) return;
	GL._state.blending = true;
	GL.enable(GL.BLEND);
}

function disable_alpha_blending()
{
	if(GL._state.blending === false) return;
	GL._state.blending = false;
	GL.disable(GL.BLEND);
}

function set_depth_range(min, max)
{
	var state = GL._state;
	if(state.depth_min === min && state.depth_max === max) return;
	state.depth_min = min;
	state.depth_max = max;

	GL.depthRange(min, max);
}

function set_line_width(val)
{
	if(GL._state.line_width === val) return;
	GL._state.line_width = val;

	GL.lineWidth(val);
}

function set_texture(texture)
{
	var id = texture.id;
	//if(GL._state.texture === id) return;
	//GL._state.texture = id;
	GL.bindTexture(GL.TEXTURE_2D, id);
}

function set_array_buffer(buffer)
{
	if(buffer === GL._state.array_buffer) return;

	if(buffer === null)
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, null);
		GL._state.array_buffer = null;
	}
	else
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, buffer.id);
		GL._state.array_buffer = buffer.id;
	}
}

function set_index_buffer(buffer)
{
	if(buffer === GL._state.index_buffer) return;

	if(buffer === null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
		GL._state.array_buffer = null;
	}
	else
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer.id);
		GL._state.array_buffer = buffer.id;
	}
}

function set_shader(shader)
{
	if(GL._state.shader === shader) return;
	GL._state.shader = shader;
    GL.useProgram(shader.id);
}

function set_render_target(target)
{
	var rb = null;
	var fb = null;

	if(target)
	{
		rb = target.render_buffer || null;
		fb = target.frame_buffer || null;
	}

	if(GL._state.frame_buffer !== fb)
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, fb);
	}

	if(GL._state.render_buffer !== rb)
	{
		GL.bindRenderbuffer(GL.RENDERBUFFER, rb);
	}

	GL._state.render_buffer = rb;
	GL._state.frame_buffer = fb;
}


function convert_update_rate(type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC:  return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM:  return GL.STREAM_DRAW;
		default: console.error('Invalid update rate');
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

		default: console.error('Invalid mesh layout');
	}
}

function bind_mesh(mesh)
{
	if(mesh.vertex_buffer.id === null)
	{
		mesh.vertex_buffer.id = GL.createBuffer();
	}
	if(mesh.index_buffer !== null && mesh.index_buffer.id === null)
	{
		mesh.index_buffer.id = GL.createBuffer();
	}
}

function unbind_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, 1, GL.STATIC_DRAW);
	GL.deleteBuffer(vb.id);

	if(ib !== null)
	{
		set_index_buffer(ib);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, 1, GL.STATIC_DRAW);
		GL.deleteBuffer(mesh.index_buffer.id);
	}

	vb.id = null;
	ib.id = null;
	set_array_buffer(null);
	set_index_buffer(null);
}

function update_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(vb.update_rate));
	set_array_buffer(null);

	if(ib !== null)
	{
		ib.byte_size = GL.UNSIGNED_INT;
		set_index_buffer(ib);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, convert_update_rate(ib.update_rate));
		set_index_buffer(null);
	}
}

function update_mesh_range(mesh, start, end)
{
	var vb = mesh.vertex_buffer;
	//var start = vb.update_start * vb.stride;
	var view = vb.data.subarray(start, end);

	set_array_buffer(vb);
	GL.bufferSubData(GL.ARRAY_BUFFER, start * 4, view);
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

function unbind_texture(texture)
{
	GL.deleteTexture(texture.id);
	texture.id = null;
}

function update_texture(t)
{
	set_texture(t);
	var size = convert_texture_size(t);
	var format = convert_texture_format(t.format);

	if(t.flip === true)
	{
		GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	}
	if(t.from_element === true)
	{
		GL.texImage2D(GL.TEXTURE_2D, 0, format, format, size, t.data);
	}
	else if(t.compressed === true)
	{
		GL.compressedTexImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, t.data);
	}
	else
	{
		GL.texImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, format, size, t.data);
	}

	if(t.use_mipmaps === true)
	{
		GL.generateMipmap(GL.TEXTURE_2D);
	}

	set_sampler(t.sampler);
}

function set_sampler(sampler)
{
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, sampler.s);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, sampler.t);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, sampler.up);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, sampler.down);

	var ext = GL.extensions.EXT_texture_filter_anisotropic;
	if(ext !== undefined)
	{
		var max_anisotropy = GL._parameters.max_anisotropy;
		var anisotropy = clamp(sampler.anisotropy, 0, max_anisotropy);

		GL.texParameterf
		(
			GL.TEXTURE_2D,
			ext.TEXTURE_MAX_ANISOTROPY_EXT,
			anisotropy
		);
	}
}

function bind_shader(s)
{
	if(s.id !== null) return;

	var vs = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vs, s.vertex_src);
    GL.compileShader(vs);

    var success = GL.getShaderParameter(vs, GL.COMPILE_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Compile Error: " + GL.getShaderInfoLog(vs));
    }

    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, s.fragment_src);
    GL.compileShader(fs);

    success = GL.getShaderParameter(fs, GL.COMPILE_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Compile Error: " + GL.getShaderInfoLog(fs));
    }

	s.id = GL.createProgram();
    GL.attachShader(s.id, vs);
    GL.attachShader(s.id, fs);
    GL.linkProgram(s.id);

    success = GL.getProgramParameter(s.id, GL.LINK_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Link Error: " + GL.getProgramInfoLog(s.id));
    }

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

function unbind_shader(shader)
{

}


function set_uniform(name, value)
{
	var uniform = GL._state.shader.uniforms[name];

	//DEBUG
	if(uniform === null || uniform === undefined)
	{
		//console.warning('Uniform not found');
		return;
	}
	//END

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
		/*
        case GL.SAMPLER_CUBE:
        {
        	return;
        }
        */
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
        /*
		case GL.INT_VEC2:
		{
			if(size > 1)
			{
				GL.uniform2iv(loc, value);
			}
			GL.uniform2i(loc, value[0], value[1]);
			return;
		}
        case GL.INT_VEC3:
        {
        	if(size > 1)
			{
        		GL.uniform3iv(loc, value);
        	}
			GL.uniform3i(loc, value[0], value[1], value[2]);
        	return;
        }
        case GL.INT_VEC4:
        {
        	if(size > 1)
			{
        		GL.uniform4iv(loc, size, value);
        	}
			GL.uniform4i(loc, value[0], value[1], value[2], value[3]);
        	return;
        }
        */
        // DEBUG
		default:
		{
			console.error(uniform.type + ' is an unsupported uniform type');
		}
		// END
	}
}

function set_attributes(shader, mesh)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;

	var vb = mesh.vertex_buffer;
	set_array_buffer(vb);

	for(var k in vb.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        //ASSERT(va !== undefined, 'Shader ' + shader.name + ' needs attribute ' + k + ' but mesh ' + mesh.name + ' does not have it');
        if(sa === undefined) continue;
        if(va === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
		ext.vertexAttribDivisorANGLE(sa, 0);
	}
}

function bind_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        if(b.id === null) b.id = GL.createBuffer();
    }
    update_instance_buffers(buffers);
}


function update_instance_buffer(b, rate)
{
	set_array_buffer(b);
    GL.bufferData(GL.ARRAY_BUFFER, b.data, rate || GL.STATIC_DRAW);
}


function update_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        set_array_buffer(b);
        GL.bufferData(GL.ARRAY_BUFFER, b.data, GL.STATIC_DRAW);
    }
}

function set_instance_attributes(shader, buffers)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;
    for(var k in buffers)
    {
        var b = buffers[k];
        var sa = shader.attributes[k];
        if(sa === undefined) continue;

        set_array_buffer(b);
        GL.enableVertexAttribArray(sa);
        GL.vertexAttribPointer(sa, b.stride, GL.FLOAT, b.normalized, b.stride * 4, 0);
        ext.vertexAttribDivisorANGLE(sa, 1);
    }
}

function draw_mesh(mesh)
{
	set_attributes(GL._state.shader, mesh);
	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer !== null)
	{
		set_index_buffer(mesh.index_buffer);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
	}
    else
    {
    	GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    }

    set_array_buffer(null);
    set_index_buffer(null);
}

function draw_mesh_instanced(mesh, instances, count)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;

    set_attributes(GL._state.shader, mesh);
	set_instance_attributes(GL._state.shader, instances);

	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer !== null)
	{
		set_index_buffer(mesh.index_buffer);
    	ext.drawElementsInstancedANGLE(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0, count);
	}
    else
    {
    	ext.drawArraysInstancedANGLE(layout, 0, mesh.vertex_buffer.count, count);
    }

    set_array_buffer(null);
    set_index_buffer(null);
}

function set_blend_mode(mode)
{
	if(GL._state.blend_mode === mode) return;
	GL._state.blend_mode = mode;

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
	if(GL._state.depth_mode === mode) return;
	GL._state.depth_mode === mode;

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

function set_render_target_depth(texture)
{
	set_texture(texture);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, texture.id, 0);
}


//DEBUG

function verify_webgl_context()
{
	if(GL.isContextLost && GL.isContextLost()) console.error('GL context lost');
}

function verify_frame_buffer()
{
	var status = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
	if(status != GL.FRAMEBUFFER_COMPLETE)
	{
		console.error('Error creating framebuffer: ' +  status);
	}
}

function log_webgl_info()
{
	LOG("Shader High Float Precision: " + GL.getShaderPrecisionFormat(GL.FRAGMENT_SHADER, GL.HIGH_FLOAT));
	LOG("AA Size: " + GL.getParameter(GL.SAMPLES));
	LOG("Max Texture Size: " + GL.getParameter(GL.MAX_TEXTURE_SIZE) + "px");
	LOG("Max Cube Map Size: " + GL.getParameter(GL.MAX_CUBE_MAP_TEXTURE_SIZE) + "px");
	LOG("Max Render Buffer Size: " + GL.getParameter(GL.MAX_RENDERBUFFER_SIZE) + "px");
	LOG("Max Vertex Shader Texture Units: " + GL.getParameter(GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
	LOG("Max Fragment Shader Texture Units: " + GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS));
	LOG("Max Combined Texture Units: " + GL.getParameter(GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
	LOG("Max Vertex Shader Attributes: " + GL.getParameter(GL.MAX_VERTEX_ATTRIBS));
	LOG("Max Vertex Uniform Vectors: " + GL.getParameter(GL.MAX_VERTEX_UNIFORM_VECTORS));
	LOG("Max Frament Uniform Vectors: " + GL.getParameter(GL.MAX_FRAGMENT_UNIFORM_VECTORS));
	LOG("Max Varying Vectors: " + GL.getParameter(GL.MAX_VARYING_VECTORS));

	var info = GL.getExtension('WEBGL_debug_renderer_info');
	if(info)
	{
		LOG("Renderer: " + GL.getParameter(info.UNMASKED_RENDERER_WEBGL));
		LOG("Vendor:" + GL.getParameter(info.UNMASKED_VENDOR_WEBGL));
	}
}
//END
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
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	CAPS: 20,
	ESC: 27,
	SPACE: 32,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ZERO: 48,
	ONE: 49,
	TWO: 50,
	THREE: 51,
	FOUR: 52,
	FIVE: 53,
	SIX: 54,
	SEVEN: 55,
	EIGHT: 56,
	NINE: 57,
	A: 65,
	B: 66,
	C: 67,
	D: 68, 
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
}

function Mouse()
{
	var m = {};
	m.position = Vec3();
	m.last_position = Vec3();
	m.delta = Vec3();
	m.scroll = 0;
	m.dy = 0;
	m.ldy = 0;
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
	//set_vec3(input.mouse.position, e.layerX * app.res, e.layerY * app.res, 0);
	set_vec3(input.mouse.position, e.layerX, e.layerY, 0);

}
function on_mouse_wheel(e)
{
	input.mouse.dy = e.deltaY;
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

    app.gui = new dat.GUI();
    app.flow = Flow(1024);

    var f = app.flow;
    var gui = app.gui;
    gui.add(f, 'hardness', 0.0,1.0,0.01);
    gui.add(f, 'radius', 0.1, 1.0, 0.01);
    gui.add(f, 'fade_opacity', 0,1, 0.01);
    gui.add(f, 'speed_factor', 0,1, 0.01);
    gui.add(f, 'drop_rate', 0, 0.003, 0.00001);
    gui.add(f, 'drop_rate_bump', 0, 0.003, 0.00001);
    gui.add(f, 'flow_speed', 0,0.2, 0.003);
    gui.add(f, 'flow_speed_b', 0, 20, 0.1);
    gui.add(f, 'cycle_rate', 0, 1, 0.01);
    gui.add(f, 'cycle_offset', 0, 300, 1);
    gui.add(f, 'blendmode', ['OVERLAY', 'SCREEN', 'ADD', 'INVERT', 'DIFFERENCE']);

    app.cursor = true;

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

    if(key_down(Keys.C))
        app.container.classList.toggle('no-cursor');

    if(key_down(Keys.H))
        app.gui.domElement.classList.toggle('hidden');

    var dt = app.time.dt;
    render_flow(app.flow, dt);
    update_input();
    clear_stacks();
}
function Preloader(container)
{
	var r = {};
	r.loaded_bytes = 0;
	r.load_percent = 0;
	r.svg = document.querySelector('.preloader');
	r.loading_bar = document.querySelector('.preloader-bar');
	return r;
}

function update_preloader(pl, percent)
{
	pl.loading_bar.style.width = Math.floor(94 * percent);
}

function hide_preloader(pl)
{
	pl.svg.style.display = 'none';
}
function Flow(res)
{
	var r = {};

    r.assets = AssetGroup('flow');
    r.screen_quad = quad_mesh(2,2,0);
    r.quad = quad_mesh(1,1,0);

    load_assets(r.assets,
    [
        'assets/flow.txt',
    ],
    function()
    {
        bind_assets(r.assets);
    });


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
    	flow_pixels[i  ] = 128 | 0;//rand_float(118,138);
    	flow_pixels[i+1] = 128 | 0;//rand_float(118,138);
    	flow_pixels[i+2] = 128 | 0;//rand_float(118,138);
    	flow_pixels[i+3] = 128 | 0;//rand_float(118,138);
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
    if(f.assets.loaded === false) return;

    var meshes = f.assets.meshes;
    var textures = f.assets.textures;
    var shaders = f.assets.shaders;

    // DRAW FLOW FIELD

    var mp = input.mouse.position;
    var mouse = _Vec3();
    mouse[0] = mp[0] / app.view[2];
    //mouse[1] = (app.view[3] - mp[1]) / app.view[3];
    mouse[1] = mp[1] / app.view[3];

    mouse[0] = mouse[0] * 2.0 - 1.0;
    mouse[1] = mouse[1] * 2.0 - 1.0;

    var md = input.mouse.delta;
    var delta = _Vec3();
    delta[0] = (md[0] / app.view[2]) + 1.0 * 0.5;
    delta[1] = (md[1] / app.view[3]) + 1.0 * 0.5;


    var vel = vec_length(input.mouse.delta) / app.view[2];
    f.cursor_velocity = lerp(f.cursor_velocity, vel, 0.9 * app.time.dt);


    set_viewport(app.view);
    disable_depth_testing();
    disable_stencil_testing();

    enable_alpha_blending();
    if(key_held(Keys.MOUSE_LEFT))
    {
	    set_blend_mode(BlendMode.DEFAULT);
	    set_render_target(f.flow_target);
	    //set_render_target_color(f.flow_field);
	    set_shader(shaders.velocity);
	    set_uniform('mouse', mouse);
	    set_uniform('velocity', delta);
	    set_uniform('hardness', f.hardness);
	    set_uniform('radius', f.cursor_velocity);
	    draw_mesh(f.quad);
	}

    /*
    set_shader(shaders.particle_fade);
    set_blend_mode(BlendMode.DIFFERENCE);
    draw_mesh(f.screen_quad);
    */
    disable_alpha_blending();

    /*
    set_render_target(null);
   	set_shader(shaders.final);
   	set_uniform('image', f.flow_field);
   	draw_mesh(f.screen_quad);
    */

    // DRAW BACKGROUND TEXTURE
    set_render_target(f.particle_target);
    set_render_target_color(f.screen_texture);
    set_viewport(app.view);
    set_shader(shaders.screen_particles);
    set_uniform('screen', f.background_texture);
    set_uniform('opacity', f.fade_opacity);
    draw_mesh(f.screen_quad);

    // DRAW PARTICLES
    enable_alpha_blending();
	//set_blend_mode(BlendMode.OVERLAY);
    set_blend_mode(BlendMode[f.blendmode]);
    set_shader(shaders.draw_particles);
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
    set_shader(shaders.screen_particles);
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
    set_shader(shaders.update_particles);
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

