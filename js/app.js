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

function snap_angle(angle, target)
{
	return Math.floor((angle % 360 + target / 2) / target) * target;
}

function sigmoid(input, t)
{
	return 1 / (1 + Math.exp(-input + t));
}

function smoothstep(min, max, val) 
{
	var x = Math.max(0, Math.min(1, (val-min) / (max-min)));
	return x * x * (3 - 2 * x);
}

function compare_normal(N, R, rotation) 
{ 
	var index = vec3_stack.index;

    var rN = _Vec3();
    quat_mul_vec(rN, rotation, N);
    var result = vec_dot(rN, R) * RAD2DEG;

    vec3_stack.index = index;
    return result;
}

function move_towards(val, target, rate)
{
	var result = val;
	if(target > val)
	{
		result += rate;
		if(result > target) return target;
	}
	else 
	{
		result -= rate;
		if(result < target) return target;
	}
	return result;
}

function smooth_float_towards(val, target, rate, epsilon)
{
	var E = epsilon || 0.0001;
	var result = val;
	var delta = (target - val);
	delta = clamp(delta, -rate, rate);
	if(Math.abs(delta) < E) return target;
	result += delta * rate;
	return result;
}

function smooth_vec_towards(val, target, rate, epsilon)
{
	var n = val.length;
	for(var i = 0; i < n; ++i)
	{
		val[i] = smooth_float_towards(val[i], target[i], rate, epsilon);
	}
}

function lazy_ease(now, end, speed) 
{
	return now + (end - now) / speed;
}

function wrap_value(value, min, max)
{
	if(value > max) return value - max;
	if(value < min) return value + max;
	return value;
}
function wrap_angle(value)
{
	return wrap_value(value, 0,360);
}
function wrap_normal(value)
{
	return wrap_value(value, 0,1);
}
function rand_int(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand_sign()
{
	var sign = rand_int(0,1);
	if(sign === 0) return -1.0;
	return 1.0;
}

function rand_float(min, max)
{
	return Math.random() * (max - min) + min;
}

function rand_float_fuzzy(f, fuzz)
{
	return rand_float(f-fuzz, f+fuzz);
}

function rand_vec(r, min, max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i) r[i] = Math.random() * (max - min) + min;
}

function unit_circle(r, radius)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y);
	r[0] = (x * l) * radius;
	r[1] = (y * l) * radius;
}

function unit_sphere(r, radius)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var z = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y + z * z);
	r[0] = (x * l) * radius;
	r[1] = (y * l) * radius;
	r[2] = (z * l) * radius;
}
function Time()
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;
    r.accumulator = 0;
    r.fixed_dt = 0.02;
    r.max_frame = 0.05;
    r.now = 0;
    r.last = 0;
    r.dt = 0;
    r.at = 0;
    r.st = 0;
    r.nst = 0;
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
    
    time.at += time.dt;
    if(time.at > 1) time.at -= 1;
    time.st = Math.sin(time.elapsed);
    time.nst = time.st / 2 + 0.5;
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
function quat_mul(r, a,b)
{
	var x = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];
	var y = a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2];
	var z = a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0];
	var w = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];

	set_vec4(r, x,y,z,w);
}

function quat_mul_vec(r, q,v)
{
	var tx = (q[1] * v[2] - q[2] * v[1]) * 2;
	var ty = (q[2] * v[0] - q[0] * v[2]) * 2;
	var tz = (q[0] * v[1] - q[1] * v[0]) * 2;

	var cx = q[1] * tz - q[2] * ty;
	var cy = q[2] * tx - q[0] * tz;
	var cz = q[0] * ty - q[1] * tx;

	r[0] = v[0] + q[3] * tx + cx;
	r[1] = v[1] + q[3] * ty + cy;
	r[2] = v[2] + q[3] * tz + cz;
}

function quat_conjugate(r, q) 
{
	set_vec4(r, -q[0],-q[1],-q[2], q[3]);
}

function quat_inverse(r, q)
{
	var t = _Vec4();
	quat_conjugate(t,q)
	vec_normalized(r, t);
}

function quat_set_euler(r, v)
{
	quat_set_euler_f(r, v[0], v[1], v[2]);
}

function quat_set_euler_f(r, x,y,z)
{
	var xr = (x * DEG2RAD)/ 2;
	var yr = (y * DEG2RAD)/ 2;
	var zr = (z * DEG2RAD)/ 2;

	var sx = Math.sin(xr);
	var sy = Math.sin(yr);
	var sz = Math.sin(zr);
	var cx = Math.cos(xr);
	var cy = Math.cos(yr);
	var cz = Math.cos(zr);

	r[0] = sx * cy * cz - cx * sy * sz;
	r[1] = cx * sy * cz + sx * cy * sz;
	r[2] = cx * cy * sz - sx * sy * cz;
	r[3] = cx * cy * cz + sx * sy * sz;
}

function quat_get_euler(r, q)
{
	var x,y,z;

    var sqx = q[0] * q[0];
    var sqy = q[1] * q[1];
    var sqz = q[2] * q[2];
    var sqw = q[3] * q[3];

	var unit = sqx + sqy + sqz + sqw;
	var test = q[0] * q[1] + q[2] * q[3];
	var TOLERANCE = 0.499;

	if(test > TOLERANCE * unit) 
	{
		x = 0;
		y = 2 * Math.atan2(q[0], q[3]);
		z = PI / 2;
	}
	else if(test < -TOLERANCE * unit) 
	{ 
		x = 0;
		y = -2 * Math.atan2(q[0], q[3]);
		z = -PI / 2;
	}
	else
	{
		x = Math.atan2(2 * q[0] * q[3] - 2 * q[1] * q[2], -sqx + sqy - sqz + sqw);
		y = Math.atan2(2 * q[1] * q[3] - 2 * q[0] * q[2], sqx - sqy - sqz + sqw);
		z = Math.asin(2 * test / unit);
	}
    
    x *= RAD2DEG;
	y *= RAD2DEG;
	z *= RAD2DEG;

	set_vec3(r, x,y,z);
}

function quat_set_angle_axis(r, angle, axis)
{
	var radians = angle * DEG2RAD;
	var h = 0.5 * radians;
	var s = Math.sin(h);	
	r[0] = s * axis[0];
	r[1] = s * axis[1];
	r[2] = s * axis[2];
	r[3] = Math.cos(h);
}

function quat_get_angle_axis(q, axis)
{
	var l = vec_sqr_length(q);
	if(l > EPSILON)
	{
		var i = 1 / Math.sqrt(l);
		axis[0] = q[0] * i;
		axis[1] = q[1] * i;
		axis[2] = q[2] * i;
		return (2 * Math.acos(q[3])) * RAD2DEG;
	}
	else
	{
		set_vec3(axis, 1,0,0);
		return 0;
	}
}

function quat_from_to(r, from, to)
{
	var index = vec3_stack.index;

	var fn = _Vec3();
	var tn = _Vec3();
	var c = _Vec3();

	vec_normalized(fn, from);
	vec_normalized(tn, to);
	vec_cross(c, fn, tn);
		
	var t = _Vec4();
	t[0] = c[0];
	t[1] = c[1];
	t[2] = c[2];
	t[3] = 1 + vec_dot(fn, tn);

	vec_normalized(r,t);
	vec3_stack.index = index;
}

function quat_look_at(r, from, to, forward)
{
	var t = _Vec3();
	vec_sub(t, from, to);
	vec_normalized(t, t);
	quat_from_to(r, forward, to);
}

function quat_slerp(r, a,b, t) 
{
	var flip = 1;
	var cosine = a[3] * b[3] + a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	
	if(cosine < 0) 
	{ 
		cosine = -cosine; 
		flip = -1;
	} 
	if((1 - cosine) < EPSILON)
	{
		r[0] = (1-t) * a[0] + (t * flip) * b[0];
		r[1] = (1-t) * a[1] + (t * flip) * b[1];
		r[2] = (1-t) * a[2] + (t * flip) * b[2];
		r[3] = (1-t) * a[3] + (t * flip) * b[3];
		return;
	}
	
	var theta = Math.acos(cosine); 
	var sine = Math.sin(theta); 
	var beta = Math.sin((1 - t) * theta) / sine; 
	var alpha = Math.sin(t * theta) / sine * flip;
	
	r[0] = a[0] * beta + b[0] * alpha;
	r[1] = a[1] * beta + b[1] * alpha;
	r[2] = a[2] * beta + b[2] * alpha;
	r[3] = a[3] * beta + b[3] * alpha;

	vec_normalized(r,r);
}
function Mat3()
{
	return new Float32Array([1,0,0,
							 0,1,0,
							 0,0,1]);
}

var mat3_stack = new Stack(Mat3, 16);

function _Mat3()
{
	var r = mat3_stack.get();
	mat3_identity(r);
	return r;
}
function mat3_from_mat4(r, m)
{
	r[0] = m[0]; 
	r[1] = m[1]; 
	r[2] = m[2];
	r[3] = m[4]; 
	r[4] = m[5]; 
	r[5] = m[6];
	r[6] = m[8]; 
	r[7] = m[9]; 
	r[8] = m[10];
}

function mat3_identity(m)
{
	m[0] = 1; m[1] = 0; m[2] = 0;
	m[3] = 0; m[4] = 1; m[5] = 0;
	m[6] = 0; m[7] = 0; m[8] = 1;
}
function mat3_determinant(m)
{
	return m[0] * (m[4] * m[8] - m[5] * m[7]) -
      	   m[1] * (m[3] * m[8] - m[5] * m[6]) +
      	   m[2] * (m[3] * m[7] - m[4] * m[6]);
}
function mat3_inverse(r, m)
{
	var t = _Mat3();

    t[0] = m[4] * m[8] - m[5] * m[7];
    t[1] = m[2] * m[7] - m[1] * m[8];
    t[2] = m[1] * m[5] - m[2] * m[4];
    t[3] = m[5] * m[6] - m[3] * m[8];
    t[4] = m[0] * m[8] - m[2] * m[6];
    t[5] = m[2] * m[3] - m[0] * m[5];
    t[6] = m[3] * m[7] - m[4] * m[6];
    t[7] = m[1] * m[6] - m[0] * m[7];
    t[8] = m[0] * m[4] - m[1] * m[3];

    var det = m[0] * t[0] + m[1] * t[3] + m[2] * t[6];
    if(Math.abs(det) <= EPSILON)
    {
    	mat3_identity(r);
    	return;
    }

   	var idet = 1 / det;
   	for(var i = 0; i < 9; ++i) r[i] = t[i] * idet;

   	mat3_stack.index--;
}
function mat3_mul(r, a,b)
{
	var t = _Mat3();
	t[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
	t[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
	t[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
	t[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
	t[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
	t[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
	t[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
	t[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
	t[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
	vec_eq(r,t);
}

function mat3_transposed(r,m)
{
	var t = _Mat3();
	t[0] = m[0];
	t[1] = m[3];
	t[2] = m[6]; 
	t[3] = m[1];
	t[4] = m[4];
	t[5] = m[7]; 
	t[6] = m[2]; 
	t[7] = m[5];
	t[8] = m[8];
	vec_eq(r,t);
}

function mat3_set_position(m, x, y)
{
	m[2] = x;
	m[5] = y;
}
function mat3_set_rotation(m, r)
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

	m[0] = 1 - (yy + zz);
	m[1] = xy + wz;
	m[2] = xz - wy;
	m[3] = xy - wz;
	m[4] = 1 - (xx + zz);
	m[5] = yz + wx;
	m[6] = xz + wy;
	m[7] = yz - wx;
	m[8] = 1 - (xx + yy);
}
function mat3_compose_f(m, x,y, sx,sy, r)
{
	var theta = -r * 0.01745329251;
	var st = Math.sin(theta);
	var ct = Math.cos(theta);

	m[0] = ct * sx;
	m[1] = st * sy;
	m[2] = x;
	m[3] = -st * sx;
	m[4] = ct * sy;
	m[5] = y;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
}
function mat3_compose(m, p, s, r)
{
	mat3_compose_f(m, p[0], p[1], s[0], s[1], r);
}

function get_normal_matrix(r, model)
{
	mat3_from_mat4(r, model);
    mat3_inverse(r, r);
    mat3_transposed(r, r);
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
function Curve(dimension, data)
{
	var r = {};
	r.data = data;
	r.dimension = dimension;
	r.stride = dimension * 3;
	return r;
}

function eval_time_curve(r, curve, t)
{
	var n = curve.dimension;
	var d = curve.data;
	var len = d.length;

	var t_start = d[n];
	var t_end = d[len-(n*2)];

	if(t < t_start) t = t_start;
	else if(t > t_end) t = t_end;

	//LOG(t_start);
	//LOG(t_end);

	for(var i = 0; i < len;)
	{
		var t_start = d[i+n];
		var t_end = d[i+(n*4)];
		if(t >= t_start && t <= t_end)
		{
			t = (t - t_start) / (t_end - t_start); 
			eval_curve(r, curve, t, i+n);
			return;
		}
		i += curve.stride;
	}
}

function eval_curve(r, curve, t, offset)
{
	var tt = t * t;
	var ttt = tt * t;

	var u = 1.0 - t;
	var uu = u * u;
	var uuu = uu * u;

	var n = curve.dimension;
	var d = curve.data;

	for(var i = 0; i < n; ++i)
	{
		var o = i + offset;
		r[i] = uuu * d[o] +
		   	   3 * uu * t * d[o+(n*1)] + 
		   	   3 * tt * u * d[o+(n*2)] + 
		   	   ttt * d[o+(n*3)];
	}
}

function eval_curve_f(curve, t)
{
	var r = _Vec3();
	eval_curve(r, curve, t, 0);
	vec3_stack.index--;
	return r[1];
}

function eval_curve_n(r, curve, t)
{
	var n = curve.dimension;
	var d = curve.data;
	var len = d.length;

	var t_start = d[n];
	var t_end = d[len-(n*2)];
	var tn = lerp(t_start, t_end, t);
	eval_time_curve(r, curve, tn);
}

function read_curve(ag)
{
	var name = read_string();
    var is_2d = read_boolean();
    var num_points = read_i32();
    var data;
    var dimensions = 2;
    if(is_2d === false) dimensions = 3; 
    data = read_f32(num_points * (dimensions * 3));
    var curve = Curve(dimensions, data);
    if(ag) ag.curves[name] = curve;
    return curve;
}
function ease_in_quad(t) 
{ 
  return t*t;
}

function ease_out_quad(t) 
{ 
  return t*(2-t);
}

function ease_in_out_quad(t) 
{ 
  return t<.5 ? 2*t*t : -1+(4-2*t)*t;
}

function ease_in_cubic (t) 
{ 
  return t*t*t;
}

function ease_out_cubic (t) 
{ 
  return (--t)*t*t+1; 
}

function ease_in_out_cubic (t) 
{ 
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function ease_in_quart (t) 
{ 
  return t*t*t*t;
}

function ease_out_quart (t) 
{ 
  return 1-(--t)*t*t*t; 
}
function ease_in_out_quart (t) 
{ 
  return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
}
function ease_in_quint (t) 
{ 
  return t*t*t*t*t;
};
function ease_out_quint (t) 
{ 
  return 1+(--t)*t*t*t*t; 
}
function ease_in_out_quint (t) 
{ 
  return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t;
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
function SphereCollider(origin, radius)
{
	var r = {};
	r.origin = origin;
	r.radius = radius;
	return r;
}

function Ray(origin, direction, length)
{
	var r = {};
	r.origin = origin;
	r.direction  = direction;
	r.length = length;
	return r;
}

function HitInfo()
{
	var r = {};
	r.hit = false;
	r.point = Vec3();
	r.normal = Vec3();
	r.t = 0;
	return r;
}

function point_in_rect_fast(px,py, x,y,w,h)
{
	return px >= x && px < (x + w) &&
		   py < y && py >= (y - h);
}

function point_in_rect(p, r, matrix)
{
	var local = _Vec3();

	if(matrix)
	{
		var inv = _Mat4();
		mat4_inverse_affine(inv, matrix);
		mat4_mul_point(local, inv, p);
		mat4_stack.index--;
	}
	else
	{
		vec_eq(local, p);
	}
	vec3_stack.index--;

	if(local[0] > r[0] && 
	   local[1] > r[1] && 
	   local[0] < (r[0] + r[2]) && 
	   local[1] < (r[1] + r[3]))
	{
		return true;
	}
	return false;
}

function ray_sphere(info, ray, sphere)
{
	var index = vec3_stack.index;

	info.hit = false;

	var p = vec3_tmp();

	vec_sub(p, ray.origin, sphere.origin);
	var a = vec_dot(ray.direction, ray.direction);
	var b = vec_dot(ray.direction, p);
	var c = vec_dot(p, p) - (sphere.radius * sphere.radius);
	var d = b * b - c * a;

	if(d < 0.0) return;

	var sqrtd = Math.sqrt(d);
	a = 1.0 / a;

	var t0 = ( -b + sqrtd ) * a;
	var t1 = ( -b - sqrtd ) * a;

	if(t0 < t1) info.t = t0;
	else info.t = t1;
	
	info.hit = true;

	vec_mul_f(p, ray.direction, info.t);
	vec_add(info.point, ray.origin, p);

	vec3_stack.index = index;
}

function circle_circle(info, a, ra, b, rb)
{
	info.hit = false;
	var index = vec3_stack.index;
	var delta = _Vec3();
	vec_sub(delta, b,a);

	//var distance = sqr_length(delta);
	//var rad_sum = (ra * ra) + (rb * rb);

	var distance = vec_length(delta);
	var rad_sum = ra + rb;

	if(distance < rad_sum)
	{
		info.hit = true;
		info.t = rad_sum - distance;
		vec_normalized(info.normal, delta);
		vec_mul_f(info.point, info.normal, ra)
		vec_add(info.point, info.point, a); 
	}

	vec3_stack.index = index;
}

function point_in_circle(info, p,c,r)
{
	var delta = _Vec3();
	var nd = _Vec3();
	vec_sub(delta, c,p);

	info.hit = false;
	
	var l = vec_sqr_length(delta);
	if(l < r * r)
	{
		var nl = Math.sqrt(l);
		info.hit = true;
		info.t = nl - r;
		vec_mul_f(nd, delta, 1 / nl);
		vec_eq(info.normal, nd);
	}

	vec3_stack.index -= 2;
}

function line_circle(h, c,r, a,b)
{
	var lax = a[0] - c[0];
	var lay = a[1] - c[1];
	var lbx = b[0] - c[0];
	var lby = b[1] - c[1];

	var sx = lbx - lax;
	var sy = lby - lay;

	var a = sx * sx + sy * sy;
	var b = 2 * ((sx * lax) + (sy * lay));
	var c = (lax * lax) + (lay * lay) - (r * r);
	var delta = b * b - (4 * a * c);
	if(delta < 0)
	{
		h.hit = false;
		return;
	} 

	var sd = Math.sqrt(delta);
	var ta = (-b - sd) / (2 * a);

	if(ta < 0 || ta > 1)
	{
		h.hit = false;
		return;
	}

	h.point[0] = a[0] * (1 - ta) + ta * b[0];
    h.point[1] = a[1] * (1 - ta) + ta * b[1];

    /*
	if(delta === 0)
	{
		h.hit = true;
		h.t = t;
        return;
	}
	*/

	var tb = (-b + sd) / (2 * a);

	if(Math.abs(ta - 0.5) < Math.abs(tb - 0.5))
    {
    	h.hit = true;
        h.point[0] = a[0] * (1 - tb) + tb * b[0];
    	h.point[1] = a[1] * (1 - tb) + tb * b[1];
    	return;
    }

    //TODO: Get normals etc

}

function line_line(h, a,b,c,d)
{
	var lax = b[0] - a[0];
	var lay = b[1] - a[1];
	var lbx = d[0] - c[0];  
	var lby = d[1] - c[1];

	var d = -lbx * lay + lax * lby;

	var s = (-lay * (a[0] - c[0]) + lax * (a[1] - c[1])) / d;
	var t = ( lbx * (a[1] - c[1]) - lby * (a[0] - c[0])) / d;

	if(s >= 0 && s <= 1 && t >= 0 && t <= 1)
	{
		h.hit = true;
		h.point[0] = a[0] + (t * lbx);
		h.point[1] = a[1] + (t * lby);
		return 1;
	}
	else
	{
		h.hit = false;
	}
}

function aabb_aabb(a, b)
{
   	if(a.min[0] > b.max[0]) return false;
   	if(a.max[0] < b.min[0]) return false;

   	if(a.min[1] > b.max[1]) return false;
   	if(a.max[1] < b.min[1]) return false;

   	if(a.min[2] > b.max[2]) return false;
   	if(a.max[2] < b.min[2]) return false;

    return true;
}

function aabb_ray(h, a, r)
{
	var fx = 1 / r.dir[0];
	var fy = 1 / r.dir[1];
	var fz = 1 / r.dir[2];

	var t1 = (a.min[0] - r.point[0]) * fx;
	var t2 = (a.max[0] - r.point[0]) * fx;
	var t3 = (a.min[1] - r.point[1]) * fy;
	var t4 = (a.max[1] - r.point[1]) * fy;
	var t5 = (a.min[2] - r.point[2]) * fz;
	var t6 = (a.max[2] - r.point[2]) * fz;

	var min = Math.min;
	var max = Math.max;
	var tmin = max(max(min(t1, t2), min(t3, t4)), min(t5, t6));
	var tmax = min(min(max(t1, t2), max(t3, t4)), max(t5, t6));

	if(tmax < 0 || tmin > tmax)
	{
		h.hit = false;
		return;
	}

	var v = _Vec3();
	vec_mul_f(v, r.dir, tmin);
	vec_add(h.point, r.point, v);
	h.hit = true;
	set_vec3(h.normal, 0,1,0);
	h.t = tmin;
	vec3_stack.index--;
}

function point_in_triangle(p, a,b,c)
{
	var A = (-b[1] * c[0] + a[1] * (-b[0] + c[0]) + a[0] * (b[1] - c[1]) + b[0] * c[1]) / 2;
	var sign = A < 0 ? -1 : 1;
	var s = (a[1] * c[0] - a[0] * c[1] + (c[1] - a[1]) * p[0] + (a[0] - c[0]) * p[1]) * sign;
	var t = (a[0] * b[1] - a[1] * b[0] + (a[1] - b[1]) * p[0] + (b[0] - a[0]) * p[1]) * sign;
	return s > 0 && t > 0 && s + t < 2 * A * sign;
}

function triangle_ray(h, a,b,c, r)
{
	var index = vec3_stack.index;
	var e0 = _Vec3();
	var e1 = _Vec3();
	var cross = _Vec3();
	var n = _Vec3();

	vec_sub(e0, b,a);
	vec_sub(e1, c,a);
	vec_cross(cross, e0, e1);
	vec_normalized(n, cross);
	vec_inverse(n, n);

	var ndot = vec_dot(n, r.dir);
	var t = -(vec_dot(n,r.point) + vec_dot(n,a)) / ndot;

	vec_mul_f(e0, r.dir, t);
	vec_add(e1, r.point, e0);

	if(point_in_triangle(e1, a,b,c) === true)
	{
		h.hit = true;
		vec_eq(h.point, e1);
		vec_eq(h.normal, n);
		h.t = t;
	}
	else
	{
		h.hit = false;
	}
	vec3_stack.index = index;
}

function mesh_ray(h, m, matrix, r)
{
	var index = vec3_stack.index;
	var stride = gb.mesh.get_stride(m);
	h.t = gb.math.MAX_F32;
	
	var has_hit = false;
	var point = _Vec3();
	var normal = _Vec3();
	var min_t = h.t;

	var ta = _Vec3();
	var tb = _Vec3();
	var tc = _Vec3();

	var n = m.vertex_buffer.count / 3;
	var d = m.vertex_buffer.data;
	var c = 0;
	for(var i = 0; i < n; ++i)
	{
		set_vec3(ta, d[c], d[c+1], d[c+2]);
		mat4_mul_point(ta, matrix, ta);
		c += stride;

		set_vec3(tb, d[c], d[c+1], d[c+2]);
		mat4_mul_point(tb, matrix, tb);
		c += stride;
		
		set_vec3(tc, d[c], d[c+1], d[c+2]);
		mat4_mul_point(tc, matrix, tc);
		c += stride;

		triangle_ray(h, ta,tb,tc, r);
		if(h.hit === true && h.t < min_t)
		{
			has_hit = true;
			min_t = h.t;
			vec_eq(point, h.point);
			vec_eq(normal, h.normal);
		}
	}
	h.hit = has_hit;
	h.t = min_t;
	vec_eq(h.point, point);
	vec_eq(h.normal, normal);
	vec3_stack.index = index;
}
function hex_to_rgb(hex, normalize) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if(!result) return null;

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    if(normalize)
    {
        r /= 255;
        g /= 255;
        b /= 255;
    }

    return [r,g,b,1];
}

function RGB_to_HSB(rgb, hsb)
{
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];

    var max = Math.max(Math.max(r,g),b);
    var min = Math.min(Math.min(r,g),b);

    var delta = max - min;

    if(delta !== 0.0)
    {
        var hue;
        if(r == max)
        {
            hue = (g - b) / delta;
        }
        else
        {
            if(g == max) hue = 2.0 + (b - r) / delta;
            else hue = 4.0 + (r - g) / delta;
        }
        hue *= 60.0;
        if (hue < 0) hue += 360.0;
        hsb[0] = hue;
    }
    else
    {
        hsb[0] = 0;
    }

    if(max === 0.0)
    {
        hsb[1] = 0.0;
    }
    else
    {
        hsb[1] = (max - min) / max;
    }
    hsb[2] = max;
}

function HSB_to_RGB(hsb, rgb)
{
    var h = hsb[0];
    var s = hsb[1];
    var v = hsb[2];

    var hh = h;
    if(hh > 360.0) hh = 0.0;
    if(hh === 360.0) hh = 359.9; //fix singularity
    hh /= 60.0;
    var i = Math.floor(hh);
    var ff = hh - i;
    var p = v * (1.0 - s);
    var q = v * (1.0 - (s * ff));
    var t = v * (1.0 - (s * (1.0 - ff)));

    switch(i) 
    {
        case 0:
        {
            rgb[0] = v;
            rgb[1] = t;
            rgb[2] = p;
            break;
        }
        case 1:
        {
            rgb[0] = q;
            rgb[1] = v;
            rgb[2] = p;
            break;
        }
        case 2:
        {
            rgb[0] = p;
            rgb[1] = v;
            rgb[2] = t;
            break;
        }
        case 3:
        {
            rgb[0] = p;
            rgb[1] = q;
            rgb[2] = v;
            break;
        }
        case 4:
        {
            rgb[0] = t;
            rgb[1] = p;
            rgb[2] = v;
            break;
        }
        default:
            rgb[0] = v;
            rgb[1] = p;
            rgb[2] = q;
            break;
    }
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


function InstanceBuffer(count, attrs)
{
	var r = {};
	for(var a in attrs)
	{
		var attr = attrs[a];
		var buffer = {};
		buffer.id = null;
		buffer.data = new Float32Array(count * attr.size);
		buffer.stride = attr.size;
		buffer.count = count;
		buffer.normalized = attr.normalized;
		r[a] = buffer;
	}
	bind_instance_buffers(r);

	return r;
}

function Mesh(vb, ib, layout)
{
	var r = {};
	r.vertex_buffer = vb;
	r.index_buffer = ib;
	r.layout = layout || MeshLayout.TRIANGLES;
	return r;
}

function read_mesh(ag)
{
	var name = read_string();
	var vb_size = read_i32();
	var vb_data = read_f32(vb_size);
	var ib_size = read_i32();
	var ib_data = null;
	if(ib_size > 0) ib_data = read_i32(ib_size);

	var attributes = {};
	var num_attributes = read_i32();
	for(var i = 0; i < num_attributes; ++i)
	{
		var attr_name = read_string();
		var attr_size = read_i32();
        var attr_norm = read_boolean();
        attributes[attr_name] = VertexAttribute(attr_size, attr_norm);
	}

	var vb = VertexBuffer(vb_data, attributes);
	var ib = null;
	if(ib_data) ib = IndexBuffer(ib_data);

	var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    mesh.name = name;
	if(ag) ag.meshes[name] = mesh;
	return mesh;
}

function recalculate_normals(mesh)
{
	
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

function texture_from_dom(img, sampler, format, flip)
{
	format = format || TextureFormat.RGBA;
	var t = Texture(img.width, img.height, img, sampler, format, 4);
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = flip || false;
	return t;
}

function load_texture_group(base_path, urls)
{
	var path = '';
	for(var u in urls)
	{
		if(base_path) path = base_path + urls[u];
		load_texture_async(path);
	}
}

function load_texture_async(url, ag)
{
	var t = empty_texture();
	//t.loaded = false;
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = true;

	var img = new Image();
    img.onload = function(e)
    {
    	t.width = img.width;
    	t.height = img.height;
    	t.data = img;
    	//t.loaded = true;

    	ag.load_count--;
    	update_load_progress(ag);
    }
	img.src = url;
	return t;
}

function load_video_async(url, width, height, sampler, format, mute, autoplay)
{
	var t = empty_texture(sampler, format);
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = false;

    var video = document.createElement('video');
    video.setAttribute('width', width);
    video.setAttribute('height', height);
    video.style.display = 'none';
    video.preload = 'auto';
    if(mute) video.muted = 'true';
    document.body.append(video); //shuts warnings up

	var name = url.match(/[^\\/]+$/)[0];
	name = name.split(".")[0];
    app.assets.textures[name] = t;

    video.addEventListener('canplaythrough', function()
    {
        t.width = video.width;
        t.height = video.height;
        t.data = video;
        t.loaded = true;
        bind_texture(t);
        update_texture(t);
    });
    
    video.src = url;
    if(autoplay) video.play();
    return t;
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

function read_texture(type, ag)
{
    var name = read_string();
    var width = read_i32();
    var height = read_i32();
    var format = read_i32();
    var num_bytes = read_f64();
    var bytes = read_bytes(num_bytes);
    var encoding = 'data:image/' + type + ';base64,';

    var img = new Image();
    img.src = encoding + uint8_to_base64(bytes);

    var t = Texture(width, height, img, app.sampler, format, 4);
    
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = true;
	
	if(ag) ag.textures[name] = t;
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
var _ENTITY_COUNT = 0;

function Entity(x,y,z, parent, draw_info)
{
	var e = {};
	e.name;
	e.id = _ENTITY_COUNT;
	_ENTITY_COUNT++;
	e.parent = null;
	e.children = [];
	e.active = true;
	e.dirty = true;
	e.position = Vec3(x,y,z);
	e.world_position = Vec3();
	e.scale = Vec3(1,1,1);
	e.rotation = Vec4(0,0,0,1);
	e.local_matrix = Mat4();
	e.world_matrix = Mat4();
	e.draw_info = draw_info ||
	{
		shader: null,
		mesh: null,
		instance_mesh: null,
		instance_count: 0,
	};
	if(parent) set_parent(e, parent);
	return e;
}

function draw_entity(e, camera, shader)
{
	if(e.active === false) return;
	var info = e.draw_info;
	var shader = shader || info.shader;
	if(!shader |! info.mesh) return;

	var m4_index = mat4_stack.index;
	var m3_index = mat3_stack.index;

	var m4 = _Mat4();
	var m3 = _Mat3();

	set_shader(shader);

	if(shader.uniforms.model)
		set_uniform('model', e.world_matrix);

	if(shader.uniforms.view)
		set_uniform('view', camera.view);

	if(shader.uniforms.inv_view)
	{
		//mat4_inverse_affine(m4, camera.view);
		mat4_inverse(m4, camera.view);
		set_uniform('inv_view', m4);
	}

	if(shader.uniforms.projection)
		set_uniform('projection', camera.projection);

	if(shader.uniforms.model_view)
	{
		mat4_mul(m4, e.world_matrix, camera.view);
		set_uniform('model_view', m4);
	}

	if(shader.uniforms.mvp)
	{
		mat4_mul(m4, e.world_matrix, camera.view_projection);
		set_uniform('mvp', m4);
	}

	if(shader.uniforms.view_projection)
		set_uniform('view_projection', camera.view_projection);

	if(shader.uniforms.normal_matrix)
	{
		set_normal_matrix(m3, e, camera);
		set_uniform('normal_matrix', m3);
	}

	for(var k in shader.uniforms)
	{
		if(info[k])
			set_uniform(k, info[k]);
	}

	if(info.instance_mesh) draw_mesh_instanced(info.mesh, info.instance_mesh, info.instance_count);
	else draw_mesh(info.mesh);

	mat4_stack.index = m4_index;
	mat3_stack.index = m3_index;
}

function set_mvp(m, entity, camera)
{
	mat4_mul(m, entity.world_matrix, camera.view_projection);
}

function set_normal_matrix(m, entity, camera)
{
	var m4 = mat4_stack.index;

	var model_view = _Mat4();
    mat4_mul(model_view, entity.world_matrix, camera.view);

    var inv_model_view = _Mat4();
    mat4_inverse(inv_model_view, model_view);
    mat4_transposed(inv_model_view, inv_model_view);

    mat3_from_mat4(m, inv_model_view);

    mat4_stack.index = m4;
}

function set_active(e, val)
{
	e.active = val;
	var n = e.children.length;
	for(var i = 0; i < n; ++i) entity_set_active(e.children[i], val);
}
function set_parent(e, parent)
{
	if(e.parent === parent) return;
	if(e.parent !== null && parent === null) // clearing parent
	{
		parent.children.splice(parent.children.indexOf(e, 0), 1);
		e.parent = null;
	}
	else if(e.parent !== null && parent !== null) // swapping parent
	{
		e.parent.children.splice(e.parent.children.indexOf(e, 0), 1);
		e.parent = parent;
		parent.children.push(e);
	}
	else // setting new parent from null
	{
		e.parent = parent;
		parent.children.push(e);
	}
}

function get_position(r, e)
{
    mat4_get_position(r, e.world_matrix);
}
function get_scale(r, e)
{
    mat4_get_scale(r, e.world_matrix);
}
function get_rotation(r, e)
{
	mat4_get_rotation(r, e.world_matrix);
}

function rotate_entity(e, v)
{
	var rotation = _Vec4();
	quat_set_euler(rotation,v);
	quat_mul(e.rotation, rotation, e.rotation);
}

function update_entity(e, force)
{
	//if(force === true || e.dirty === true)
	//{
		mat4_compose(e.local_matrix, e.position, e.scale, e.rotation);

		if(e.parent === null) vec_eq(e.world_matrix, e.local_matrix);
		else mat4_mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);

		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			var index = mat4_stack.index;
			update_entity(e.children[i], true);
			mat4_stack.index = index;
		}

		e.dirty = false;
	//}
}
function Camera(near, far, fov, view, ortho, ortho_size)
{
	var c = Entity(0,0,0);
	c.projection = Mat4();
	c.view = Mat4();
	c.view_projection = Mat4();
	c.mask = 0;
	c.aspect = view[2] / view[3];
	c.near = near;
	c.far = far;
	c.fov = fov;
	c.size = ortho_size || 1.0;
	c.ortho = ortho || false
	update_camera_projection(c);
	return c;
}
function UICamera(view)
{
	var c = Camera(0.01,1,60, view, true, view[3]);
    set_vec3(c.position, view[2] / 2, -view[3] / 2, 0);
    update_camera(c);
    return c;
}

function update_camera_projection(c)
{
	//c.aspect = view[2] / view[3];
	if(c.ortho)
	{
		ortho_projection(c.projection, c.size * c.aspect,c.size,c.near,c.far);
	}
	else 
	{
		perspective_projection(c.projection, c.near, c.far, c.aspect, c.fov);
	}
}

function update_camera(c)
{
	update_entity(c, true);
	mat4_inverse_affine(c.view, c.world_matrix);
	mat4_mul(c.view_projection, c.view, c.projection);
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
	var id = null;
	if(texture) id = texture.id;

	if(GL._state.texture === id) return;
	GL._state.texture = id;
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
function Gyro()
{
	var g = {};
	g.acceleration = Vec3();
	g.angular_acceleration = Vec3();
	g.rotation = Vec4();
	g.euler = Vec3();
	g.updated = false;
	return g;
}
function Touch ()
{
	var t = {};
	t.id = -1;
	t.is_touching = false;
	t.position = Vec3();
	t.last_position = Vec3();
	t.delta = Vec3();
	t.updated = false;
	return t;
}
function GamePad()
{
	var g = {};
	return g;
}

var input;
function Input(root)
{
	var r = {};
	r.mouse = Mouse();
	r.keys = new Uint8Array(256);
	r.touches = [];
	r.gyro = Gyro();
	r.is_touch_device = is_touch_device();

	if(!root) root = window;

	r.MAX_TOUCHES = 5;
	for(var i = 0; i < r.MAX_TOUCHES; ++i) r.touches[i] = Touch();
	
	root.addEventListener("touchstart",  on_touch_start, false);
  	root.addEventListener("touchmove", on_touch_move, false);
  	root.addEventListener("touchend", on_touch_end, false);

	window.addEventListener('devicemotion', on_device_motion);
	window.addEventListener('deviceorientation', on_device_rotation);

	window.addEventListener('keydown', on_key_down);
	window.addEventListener('keyup', on_key_up);
	window.addEventListener('mouseup', on_key_up);
	window.addEventListener('mousedown', on_key_down);
	window.addEventListener('mousemove', on_mouse_move);
	window.addEventListener('wheel', on_mouse_wheel);

	input = r;
	return r;
}

function is_touch_device() 
{
	return (('ontouchstart' in window)
		|| (navigator.MaxTouchPoints > 0)
    	|| (navigator.msMaxTouchPoints > 0));
}

function update_input()
{
	for(var i = 0; i < input.MAX_TOUCHES; ++i)
	{
		var t = input.touches[i];
		if(t.is_touching === false) continue;
		t.delta[0] = t.position[0] - t.last_position[0];
		t.delta[1] = t.position[1] - t.last_position[1];
		t.last_position[0] = t.position[0];
		t.last_position[1] = t.position[1];
	}

	for(var i = 0; i < input.MAX_TOUCHES; ++i)
	{
		var t = input.touches[i];
		if(t.is_touching === false) continue;
		input.mouse.position[0] = t.position[0] * app.res;
		input.mouse.position[1] = t.position[1] * app.res;
		input.mouse.delta[0] = t.delta[0];
		input.mouse.delta[1] = t.delta[1];
		break;
	}

	for(var i = 0; i < 256; ++i)
	{
		if(input.keys[i] === KeyState.DOWN) input.keys[i] = KeyState.HELD;
		else if(input.keys[i] === KeyState.UP) input.keys[i] = KeyState.RELEASED;
	}

	if(input.mouse.dy === input.mouse.ldy)
	{
		input.mouse.scroll = 0;
	}
	else
	{
		input.mouse.scroll = input.mouse.dy;
		input.mouse.ldy = input.mouse.dy;
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
	set_vec3(input.mouse.position, e.clientX * app.res, e.clientY * app.res, 0);
}
function on_mouse_wheel(e)
{
	input.mouse.dy = e.deltaY;
}

function on_device_motion(e)
{
	var l = e.acceleration;
	var a = e.rotationRate;
	set_vec3(input.gyro.acceleration, l.x, l.y, l.z);
	set_vec3(input.gyro.angular_acceleration, a.beta, a.gamma, a.alpha);
	input.gyro.updated = true;
}
function on_device_rotation(e)
{
	quat_set_euler_f(input.gyro.rotation, e.beta, e.gamma, e.alpha);
	set_vec3(input.gyro.euler, e.beta, e.gamma, e.alpha);

	input.gyro.updated = true;
}

function on_touch_start(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];

		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(t.is_touching === true) continue;
			var x = it.clientX;
			var y = it.clientY;
			set_vec3(t.position, x, y, 0);
			set_vec3(t.last_position, x,y,0);
			set_vec3(t.delta, 0,0,0);
			t.is_touching = true;
			t.id = it.identifier;
			t.updated = true;
			break;
		}
	}
	//e.preventDefault();
}
function on_touch_move(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];

		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(it.identifier === t.id)
			{
				t.is_touching = true;
				var x = it.clientX;
				var y = it.clientY;
				set_vec3(t.position, x, y, 0);
				t.updated = true;
				break;
			}
		}
	}
	e.preventDefault();
}
function on_touch_end(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var id = e.changedTouches[i].identifier;
		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(id === t.id)
			{
				t.is_touching = false;
				t.id = -1;
				t.updated = true;
				break;
			}
		}
	}
	//e.preventDefault();
}
function GL_Draw(buffer_size)
{
	var r = {};
	r.color = Vec4(1,1,1,1);
	r.matrix = Mat4();

	var update_rate = BufferUpdateRate.DYNAMIC;

	// LINES

	var line_attributes = 
	{
		position: PositionAttribute(),
		color: ColorAttribute()
	};

	var vb = VertexBuffer(null, line_attributes, update_rate);
	alloc_vertex_buffer_memory(vb, buffer_size);
    r.lines = Mesh(vb, null, MeshLayout.LINES);
    bind_mesh(r.lines);

    // TRIANGLES

    var tri_attributes = 
    {
    	position: PositionAttribute(),
    	uv: UVAttribute(),
    	radius: VertexAttribute(1),
    	color: ColorAttribute()
    };

    vb = VertexBuffer(null, tri_attributes, update_rate);
	alloc_vertex_buffer_memory(vb, buffer_size);

    var ib = IndexBuffer(new Uint32Array(buffer_size), update_rate);
    r.triangles = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(r.triangles);

    // TEXT

    /*
    r.text_shader = app.assets.shaders.text;
    r.text_style = TextStyle(app.assets.fonts.space_mono);
    r.text = TextMesh(r.text_style, "", 2048);
    */

	return r;
}

function reset_gl_draw(ctx)
{
	mat4_identity(ctx.matrix);
	set_vec4(ctx.color, 1,1,1,1);
	clear_mesh_buffers(ctx.lines);
	clear_mesh_buffers(ctx.triangles);
	//reset_text(ctx.text);
}

function render_gl_draw(ctx, camera)
{
	if(app.assets.loaded === false) return;

	update_mesh(ctx.lines);
	update_mesh(ctx.triangles);

	set_shader(app.assets.shaders.basic);
	set_uniform('mvp', camera.view_projection);
	draw_mesh(ctx.lines);

	//use_shader(ctx.tri_shader);
	//set_uniform('mvp', camera.view_projection);
	//draw_mesh(ctx.triangles);

	//update_mesh(ctx.text.mesh);
	//draw_text(ctx.text, ctx.text_shader, camera);
	
	reset_gl_draw(ctx);
}

function gl_push_vertex(vertex, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var v = _Vec3();
	
	mat4_mul_point(v, matrix, vertex);

	d[o]   = v[0];
	d[o+1] = v[1];
	d[o+2] = v[2];
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	vec3_stack.index = index;

	mesh.vertex_buffer.offset += 7;
}

/*
function gl_push_line(start, end, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var a = _Vec3();
	var b = _Vec3();
	
	mat4_mul_point(a, matrix, start);
	mat4_mul_point(b, matrix, end);

	d[o]   = a[0];
	d[o+1] = a[1];
	d[o+2] = a[2];

	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	d[o+7] = b[0];
	d[o+8] = b[1];
	d[o+9] = b[2];

	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	vec3_stack.index = index;

	mesh.vertex_buffer.offset += 14;
}
*/

function gl_push_line_segment(start,end,thickness,depth, mesh, color, matrix)
{
	var d = mesh.vertex_buffer.data;
	var o = mesh.vertex_buffer.offset;
	var c = color;
	var z = depth;

	var index = vec3_stack.index;
	var dir = _Vec3();
	vec_sub(dir, end, start);
	vec_normalized(dir, dir);
	var perp = _Vec3();
	vec_perp(perp, dir);
	vec_mul_f(perp, perp, thickness);

	 //bl
	d[o  ] = start[0] - perp[0];
	d[o+1] = start[1] - perp[1];
	d[o+2] = z;
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	//br
	d[o+7] = end[0] - perp[0];
	d[o+8] = end[1] - perp[1];
	d[o+9] = z;
	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	//tl
	d[o+14] = start[0] + perp[0];
	d[o+15] = start[1] + perp[1];
	d[o+16] = z;
	d[o+17] = c[0];
	d[o+18] = c[1];
	d[o+19] = c[2];
	d[o+20] = c[3];

	//tr
	d[o+21] = end[0] + perp[0];
	d[o+22] = end[1] + perp[1];
	d[o+23] = z;
	d[o+24] = c[0];
	d[o+25] = c[1];
	d[o+26] = c[2];
	d[o+27] = c[3];

	mesh.vertex_buffer.offset += 28;

	//indices

	d = mesh.index_buffer.data;

	var i = mesh.index_buffer.offset;
	var ti = mesh.index_buffer.triangle_offset;

	d[i  ] = ti + 0;
	d[i+1] = ti + 1;
	d[i+2] = ti + 3;
	d[i+3] = ti + 0;
	d[i+4] = ti + 3;
	d[i+5] = ti + 2;

	mesh.index_buffer.triangle_offset += 4;
	mesh.index_buffer.offset += 6;

	vec3_stack.index = index;
}

function draw_quad(ctx, p,w,h,r)
{
	var hw = w / 2;
	var hh = h / 2;
	var rect = _Vec4(p[0]-hw,p[1]+hh,w,h);
	gl_push_rect(rect, p[2], r, ctx.triangles, ctx.color, ctx.matrix); 
	vec4_stack.index--;
}

function draw_quad_f(ctx, x,y,w,h,r)
{
	var rect = _Vec4(x,y,w,h);
	gl_push_rect(rect, 0.0, r, ctx.triangles, ctx.color, ctx.matrix); 
	vec4_stack.index--;
}

function draw_text_f(ctx, x,y, str)
{
	var t = ctx.text;
	t.width = 0;
	t.height = 0;
	t.bounds[0] = x;
    t.px = x;
    t.py = y;
    t.index_start = t.index;
    t.style.color = ctx.color;
    append_text(t, str);
}

function gl_push_rect(r, depth, radius, mesh, color, matrix)
{
	var d = mesh.vertex_buffer.data;
	var o = mesh.vertex_buffer.offset;
	var c = color;
	var z = depth;

	//TODO: mat4 mul

    //bl
	d[o  ] = r[0];
	d[o+1] = r[1] - r[3];
	d[o+2] = z;
	d[o+3] = 0;
	d[o+4] = 0;
	d[o+5] = radius;
	d[o+6] = c[0];
	d[o+7] = c[1];
	d[o+8] = c[2];
	d[o+9] = c[3];

	//br
	d[o+10] = r[0] + r[2];
	d[o+11] = r[1] - r[3];
	d[o+12] = z;
	d[o+13] = 1;
	d[o+14] = 0;
	d[o+15] = radius;
	d[o+16] = c[0];
	d[o+17] = c[1];
	d[o+18] = c[2];
	d[o+19] = c[3];

	//tl
	d[o+20] = r[0];
	d[o+21] = r[1];
	d[o+22] = z;
	d[o+23] = 0;
	d[o+24] = 1;
	d[o+25] = radius;
	d[o+26] = c[0];
	d[o+27] = c[1];
	d[o+28] = c[2];
	d[o+29] = c[3];

	//tr
	d[o+30] = r[0] + r[2];
	d[o+31] = r[1];
	d[o+32] = z;
	d[o+33] = 1;
	d[o+34] = 1;
	d[o+35] = radius;
	d[o+36] = c[0];
	d[o+37] = c[1];
	d[o+38] = c[2];
	d[o+39] = c[3];

	mesh.vertex_buffer.offset += 40;

	//indices

	d = mesh.index_buffer.data;

	var i = mesh.index_buffer.offset;
	var ti = mesh.index_buffer.triangle_offset;

	d[i  ] = ti + 0;
	d[i+1] = ti + 1;
	d[i+2] = ti + 3;
	d[i+3] = ti + 0;
	d[i+4] = ti + 3;
	d[i+5] = ti + 2;

	mesh.index_buffer.triangle_offset += 4;
	mesh.index_buffer.offset += 6;

}

function gl_push_line(ctx, a,b)
{
	gl_push_vertex(a, ctx.lines, ctx.color, ctx.matrix);
	gl_push_vertex(b, ctx.lines, ctx.color, ctx.matrix);
}

function draw_line(ctx, a,b)
{
	gl_push_line(ctx, a,b);
}

function draw_point(ctx, p, size)
{
	var index = vec3_stack.index;

	var a = _Vec3(p[0] - size, p[1], p[2]);
	var b = _Vec3(p[0] + size, p[1], p[2]);
	var c = _Vec3(p[0], p[1] - size, p[2]);
	var d = _Vec3(p[0], p[1] + size, p[2]);

	gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(d,c, ctx.lines, ctx.color, ctx.matrix);

	vec3_stack.index = index;
}

function draw_normal(ctx, origin, normal, length)
{
	var end = _Vec3();
	vec_mul_f(end, normal, length);
	vec_add(end, origin, end);
	gl_push_line(origin,end, ctx.lines, ctx.color, ctx.matrix);
}
function draw_ray(ctx, r)
{
	var end = _Vec3();
	vec_mul_f(end, r.direction, r.length);
	vec_add(end, r.origin, end);
	gl_push_line(r.origin, end, ctx.lines, ctx.color, ctx.matrix);
}
function draw_wire_rect(ctx, r)
{
	var index = vec3_stack.index;

	var bl = _Vec3(r[0], r[1]);
	var tl = _Vec3(r[0], r[1] + r[3]);
	var tr = _Vec3(r[0] + r[2], r[1] + r[3]);
	var br = _Vec3(r[0] + r[2], r[1]);

	gl_push_line(bl,tl, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(tl,tr, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(tr,br, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(br,bl, ctx.lines, ctx.color, ctx.matrix);

	vec3_stack.index = index;
}
function draw_wire_cube(ctx, width, height, depth)
{
	var x = width / 2.0;
	var y = height / 2.0;
	var z = depth / 2.0;
	var v = _Vec3;
	var l = gl_push_line;
	var o = ctx.lines;
	var c = ctx.color;
	var m = ctx.matrix;

	var index = vec3_stack.index;

	l(v(-x,-y,-z), v(-x, y,-z), o,c,m);
	l(v(-x, y,-z), v( x, y,-z), o,c,m);
	l(v( x, y,-z), v( x,-y,-z), o,c,m);
	l(v( x,-y,-z), v(-x,-y,-z), o,c,m);
	l(v(-x,-y, z), v(-x, y, z), o,c,m);
	l(v(-x, y, z), v( x, y, z), o,c,m);
	l(v( x, y, z), v( x,-y, z), o,c,m);
	l(v( x,-y, z), v(-x,-y, z), o,c,m);
	l(v(-x,-y,-z), v(-x,-y, z), o,c,m);
	l(v(-x, y,-z), v(-x, y, z), o,c,m);
	l(v( x, y,-z), v( x, y, z), o,c,m);
	l(v( x,-y,-z), v( x,-y, z), o,c,m);

	vec3_stack.index = index;
}
function draw_wire_circle(ctx, radius, segments)
{
	var theta = TAU / segments;
	var tanf = Math.tan(theta);
	var cosf = Math.cos(theta);

	var index = vec3_stack.index;

	var current = _Vec3(radius, 0, 0);
	var last = _Vec3(radius, 0, 0);

	for(var i = 0; i < segments + 1; ++i)
	{
		gl_push_line(last,current, ctx.lines, ctx.color, ctx.matrix);

		vec_eq(last, current);
		var tx = -current[1];
		var ty = current[0];
		current[0] += tx * tanf;
		current[1] += ty * tanf;
		current[0] *= cosf;
		current[1] *= cosf;
	}

	vec3_stack.index = index;
}
function draw_wire_sphere(ctx, radius)
{
	var q = _Vec4();

	draw_wire_circle(radius, 32);
	quat_set_euler_f(q, 0,90,0);
	mat4_set_rotation(ctx.matrix, q);
	draw_wire_circle(ctx, radius, 32);

	quat_set_euler_f(q, 90,0,0);
	mat4_set_rotation(ctx.matrix, q);
	draw_wire_circle(ctx, radius, 32);
	mat4_identity(ctx.matrix);
}
function draw_transform(ctx, m)
{
	var index = vec3_stack.index;

	var o = _Vec3();
	var e = _Vec3();

	mat4_get_position(o, m);

	set_vec4(ctx.color, 1,0,0,1);
	mat4_mul_point(e, m, _Vec3(1,0,0));
	draw_line(ctx, o,e);
	
	set_vec4(ctx.color, 0,1,0,1);
	mat4_mul_point(e, m, _Vec3(0,1,0));
	draw_line(ctx, o,e);

	set_vec4(ctx.color, 0,0,1,1);
	mat4_mul_point(e, m, _Vec3(0,0,1));
	draw_line(ctx, o,e);

	vec3_stack.index = index;
}
function draw_bounds(ctx, b)
{
	mat4_identity(ctx.matrix);

	var center = _Vec3();
	aabb_center(center, b);

	mat4_set_position(ctx.matrix, center);

	var w = ab.width(b);
	var h = ab.height(b);
	var d = ab.depth(b);

	draw_wire_cube(ctx, w,h,d);
	mat4_identity(ctx.matrix);
}

function draw_wire_mesh(ctx, mesh, matrix)
{
//	mat4_eq(ctx.matrix, matrix);
	
	var vb = mesh.vertex_buffer.data;
	var stride = mesh.vertex_buffer.stride;

	var A = _Vec3();
	var B = _Vec3();
	var C = _Vec3();
	var n = 0;
	var c = 0;

	if(mesh.index_buffer)
	{
		var ib = mesh.index_buffer.data;
		n = mesh.index_buffer.count / 3;

		for(var i = 0; i < n; ++i)
		{
			var ta = ib[c  ] * stride;
			var tb = ib[c+1] * stride;
			var tc = ib[c+2] * stride;

			set_vec3(A, vb[ta], vb[ta+1], vb[ta+2]);
			set_vec3(B, vb[tb], vb[tb+1], vb[tb+2]);
			set_vec3(C, vb[tc], vb[tc+1], vb[tc+2]);

			gl_push_line(A,B, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(B,C, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(C,A, ctx.lines, ctx.color, ctx.matrix);

			c += 3;
		}
	}
	else
	{
		n = mesh.vertex_buffer.count;
		for(var i = 0; i < n; ++i)
		{
			var ta = vb[c  ];
			var tb = vb[c+1];
			var tc = vb[c+2];

			set_vec3(A, vb[ta], vb[ta+1], vb[ta+2]);
			set_vec3(B, vb[tb], vb[tb+1], vb[tb+2]);
			set_vec3(C, vb[tc], vb[tc+1], vb[tc+2]);

			gl_push_line(A,B, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(B,C, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(C,A, ctx.lines, ctx.color, ctx.matrix);

			c += stride;
		}
	}

	vec3_stack.index -= 3;
//	mat4_identity(ctx.matrix);
}

function draw_wire_camera(ctx, camera)
{
	var index = vec3_stack.index;
	vec_eq(ctx.matrix, camera.world_matrix);

	var hw = 1;
	var hh = 1;
	var z =  0;

	var zero = _Vec3(0,0,1);
	var tl = _Vec3(-hw, hh, z);
	var tr = _Vec3( hw, hh, z);
	var bl = _Vec3(-hw,-hh, z);
	var br = _Vec3( hw,-hh, z);

	var inv = _Mat4();
    mat4_inverse(inv, camera.projection);
    mat4_mul_point(tl, inv, tl);
    mat4_mul_point(tr, inv, tr);
    mat4_mul_point(bl, inv, bl);
    mat4_mul_point(br, inv, br);

	set_vec4(ctx.color, 0.5,0.5,0.5,1.0);
	draw_line(ctx, zero, tl);
	draw_line(ctx, zero, tr);
	draw_line(ctx, zero, bl);
	draw_line(ctx, zero, br);

	draw_line(ctx, tl, tr);
	draw_line(ctx, tr, br);
	draw_line(ctx, br, bl);
	draw_line(ctx, bl, tl);

	set_vec3(bl, -hw * 0.3, hh + 0.1, z);
	set_vec3(br,  hw * 0.3, hh + 0.1, z);
	set_vec3(tl,  0, hh + 0.5, z);
	mat4_mul_point(tl, inv, tl);
    mat4_mul_point(bl, inv, bl);
    mat4_mul_point(br, inv, br);

	draw_line(ctx, bl, tl);
	draw_line(ctx, tl, br);
	draw_line(ctx, br, bl);

	mat4_identity(ctx.matrix);
	vec3_stack.index = index;
}

function draw_bezier(ctx, b, segments)
{
	var index = vec3_stack.index;

	var last = _Vec3();
	bezier_eval(last, b, 0);
	var step = 1 / segments;
	var t = step;
	for(var i = 1; i < segments+1; ++i)
	{
		var point = _Vec3();
		bezier_eval(point, b, t);
		gl_push_line(last,point, ctx.lines, ctx.color, ctx.matrix);
		vec_eq(last, point);
		t += step;
	}

	vec3_stack.index = index;
}
function draw_rig(ctx, rig)
{
	var n = rig.joints.length;
	var a = _Vec3();
	var b = _Vec3();
	for(var i = 0; i < n; ++i)
	{
		var j = rig.joints[i];
		if(j.parent === -1 || j.parent === 0) continue;

		var parent = rig.joints[j.parent];
		mat4_get_position(a, parent.world_matrix);
		mat4_get_position(b, j.world_matrix);
		gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
	}
}
function draw_rig_transforms(ctx, rig)
{
	var n = rig.joints.length;
	for(var i = 0; i < n; ++i)
	{
		draw_transform(ctx, rig.joints[i].world_matrix);
	}
}
function quad_mesh(width, height, depth, x_offset, y_offset, z_offset)
{
    var w = width / 2;
    var h = height / 2;
    var d = depth / 2;
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
function LineMesh(points)
{
	var r = Entity();
	r.thickness = 0.02;
	r.color = Vec4(1.0,1.0,1.0,1.0);
	r.num_points;
	r.points = points || null;
	r.length = 0;
	r.dash = 200;

	var attributes = 
    {
        position: VertexAttribute(3, false),
        previous: VertexAttribute(3, false),
        next: VertexAttribute(3, false),
        direction: VertexAttribute(1, false),
        dist: VertexAttribute(1, false)
    };

    var vb = VertexBuffer(null, attributes);
	var ib = IndexBuffer(null);
	r.mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
	bind_mesh(r.mesh);
	update_line_mesh(r);
	return r;
}

function update_line_mesh(lm)
{
	ASSERT(lm.points.length > 1, "Line does not contain enought points");

	var VS = 3;
	var vb = lm.mesh.vertex_buffer;
	var ib = lm.mesh.index_buffer;
	var pts = lm.points;
	var num_points = pts.length / VS;
	var num_faces = num_points - 1;
	var num_node_verts = 2;
	var vertex_count = num_faces * 4;
	var index_count = num_faces * 6;

	if(vb.data === null)
	{
		alloc_vertex_buffer_memory(vb, vertex_count);
		alloc_index_buffer_memory(ib, index_count);
	}

	/*
	if(lm.num_points !== pts.length)
	{
		resize_vertex_buffer(vb, vertex_count, false);
		resize_index_buffer(ib, index_count, false);
		lm.num_points = pts.length;
	}*/

	var stack = vec3_stack.index;

	var current = _Vec3();
	var prev = _Vec3();
	var next = _Vec3();
	var segment = _Vec3();
	var distance = 0;
	var flip = 1;

	var index = 0;
	for(var i = 0; i < num_points; ++i)
	{
		var ii = i * VS;

		set_vec3(current, pts[ii], pts[ii+1], pts[ii+2])
		if(i === 0) //first
		{
			set_vec3(prev, pts[0], pts[1], pts[2]);
			set_vec3(next, pts[3], pts[4], pts[5]);
		}
		else if(i === num_points - 1) //last
		{
			set_vec3(prev, pts[ii-3], pts[ii-2], pts[ii-1]);
			set_vec3(next, pts[ii], pts[ii+1], pts[ii+2]);
		}
		else
		{
			set_vec3(prev, pts[ii-3], pts[ii-2], pts[ii-1]);
			set_vec3(next, pts[ii+3], pts[ii+4], pts[ii+5]);
		}

		vec_sub(segment, current, prev);
		distance += vec_length(segment);

		for(var j = 0; j < num_node_verts; ++j)
		{
			//current
			vb.data[index] = current[0];
			vb.data[index+1] = current[1];
			vb.data[index+2] = current[2];

			//previous
			vb.data[index+3] = prev[0];
			vb.data[index+4] = prev[1];
			vb.data[index+5] = prev[2];

			//next
			vb.data[index+6] = next[0];
			vb.data[index+7] = next[1];
			vb.data[index+8] = next[2];

			//direction
			vb.data[index+9] = flip;
			flip *= -1;

			vb.data[index+10] = distance;
			index+=11;
		}
	}
	lm.length = distance;

	index = 0;
	var offset = 0;
	for(var i = 0; i < num_faces; ++i)
	{
		ib.data[index  ] = offset + 0;
		ib.data[index+1] = offset + 1;
		ib.data[index+2] = offset + 3;
		ib.data[index+3] = offset + 0;
		ib.data[index+4] = offset + 3;
		ib.data[index+5] = offset + 2;
		offset += 2;
		index += 6;
	}
	vec3_stack.index = stack;
	update_mesh(lm.mesh);
}

function draw_line_mesh(lm, shader, camera)
{
    use_shader(shader);

    var mvp = _Mat4();
    mat4_mul(mvp, lm.world_matrix, camera.view_projection);

    set_uniform('mvp', mvp);
    set_uniform('aspect', camera.aspect);
    //set_uniform('start', 0);
    //set_uniform('end', lm.length);
    set_uniform('line_width', lm.thickness);
    set_uniform('color', lm.color);
    //set_uniform('dash', lm.dash);
    draw_mesh(lm.mesh);

    mat4_stack.index--;
}

function line_mesh_ellipse(rx, ry, res)
{
	var points = [];
	var theta = TAU / res;
	for(var i = 0; i < res + 1; ++i)
	{
		var sin_theta = Math.sin(theta * i);
		var cos_theta = Math.cos(theta * i);
		points.push(sin_theta * rx);
		points.push(cos_theta * ry);
		points.push(0.0);
	}
	var r = LineMesh(points);
	return r;
}

function line_mesh_circle(r, res)
{
	return line_mesh_ellipse(r, r, res);
}

function line_mesh_arc(r, start_angle, end_angle, res)
{
	var points = [];
	var start = start_angle;
	var end = end_angle;
	var delta = end - start;
	var step = (delta / res) * DEG2RAD;
	var theta = start_angle * DEG2RAD;
	for(var i = 0; i < res + 1; ++i)
	{
		var sin_theta = Math.sin(theta);
		var cos_theta = Math.cos(theta);
		points.push((sin_theta * r)+r);
		points.push((cos_theta * r));
		points.push(0.0);
		theta += step;
	}
	return LineMesh(points);
}

function line_mesh_curve(curve, res)
{
	var stride = 9;
	var num_curve_nodes = curve.length / 9;
	var num_curve_segments = num_curve_nodes - 1;
	var points = new Float32Array(num_curve_segments * res * 3);

	var src_index = 3;
	var dest_index = 0;
	var step = 1 / res;
	for(var i = 0; i < num_curve_segments; ++i)
	{
		var t = 0;
		var ca = src_index + 0;
		var cb = src_index + 3;
		var cc = src_index + 6;
		var cd = src_index + 9;

		for(var j = 0; j < res+1; ++j)
		{
			var u = 1.0 - t;
			var tt = t * t;
			var uu = u * u;
			var uuu = uu * u;
			var ttt = tt * t;

			for(var k = 0; k < 3; ++k)
			{
				points[dest_index] = (uuu * curve[ca+k]) + 
									 (3 * uu * t * curve[cb+k]) + 
									 (3 * u * tt * curve[cc+k]) + 
					   				 (ttt * curve[cd+k]); 

				dest_index++;
			}
			t += step;
		}
		src_index += stride;
	}
	return LineMesh(points);
}
function sphere_mesh(radius, segments, rings, col)
{
	var elements = (rings + 1) * (segments + 1);

    var attributes = 
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false),
    };

    var data = new Float32Array(elements * 5);

	var lat;
	var lng;
	var t = 0;
	for(lat = 0; lat <= rings; ++lat)
	{      
        var theta = lat * PI / rings;
        var sintheta = Math.sin(theta);
        var costheta = Math.cos(theta);

        for(lng = 0; lng <= segments; ++lng)
        {
            var phi = lng * TAU / segments;
            var sinphi = Math.sin(phi);
            var cosphi = Math.cos(phi);

           	var x = cosphi * sintheta;
          	var y = costheta;
            var z = sinphi * sintheta;
            
            data[  t] = x * radius;
            data[t+1] = y * radius;
            data[t+2] = z * radius;

            data[t+3] = 1.0 - (lng / segments);
            data[t+4] = 1.0 - (lat / rings);

            t += 5;
        }
    }

    var tris = new Uint32Array(elements * 6);
    t = 0;
    for(lat = 0; lat < rings; ++lat)
	{ 
		for(lng = 0; lng < segments; ++lng)
        {
        	var i = lat * (segments + 1) + lng;
        	var j = i + segments + 1;

		    tris[  t] = i;
		    tris[t+1] = i+1;
		    tris[t+2] = j;
		    tris[t+3] = j;
		    tris[t+4] = i+1;
		    tris[t+5] = j+1;

		    t += 6;
        }
    }

    var vb = VertexBuffer(data, attributes);
    var ib = IndexBuffer(tris);

    var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}

function Animation(target)
{
	var r = {};
	r.name;
	r.is_playing = false;
	r.auto_play = true;
	r.t = 0;
	r.time_scale = 1;
	r.target = target;
	r.tweens = [];
	r.loops = 1;
	r.loop_count = 0;
	r.start_time = null;
	r.duration = null;
	r.callback;
	r.next;
	return r;
}

function Tween()
{
	var r = {};
	r.bone_index = -1;
	r.property;
	r.index = -1;
	r.curve = [];
	r.num_frames;
	return r;
}


function play_animation(anim, loops)
{
	anim.is_playing = true;
	anim.t = 0.0;
	anim.loops = loops || -1;
	anim.loop_count = 0;
}

function add_keyframe(tween, value, t, easing)
{
	tween.curve.push([0, 0, t, value, 0, 0]);
	tween.num_frames++;
}

function animation_start_time(anim)
{
	if(anim.start_time !== null) return anim.start_time;

	var result = Number.MAX_VALUE;
	var num_tweens = anim.tweens.length;
	for(var i = 0; i < num_tweens; ++i)
	{
		var t = anim.tweens[i].curve[2];
		if(t < result) result = t;
	}
	anim.start_time = result;
	return result;
}

function animation_duration(anim)
{
	if(anim.duration !== null) return anim.duration;

	var result = 0;
	var num_tweens = anim.tweens.length;
	for(var i = 0; i < num_tweens; ++i)
	{
		var tween = anim.tweens[i];
		var t = tween.curve[(tween.num_frames * 6) - 4];
		if(t > result) result = t;
	}
	anim.duration = result;
	return result;
}

function update_animation(anim, dt)
{
	if(anim.is_playing === false) return;

	if(anim.auto_play === true)
		anim.t += dt * anim.time_scale;

	var in_range = false;
	var num_tweens = anim.tweens.length;
	var ax, ay, bx, by, cx, cy, dx, dy;
	for(var i = 0; i < num_tweens; ++i)
	{
		var tween = anim.tweens[i];
		for(var j = 0; j < tween.num_frames-1; ++j)
		{
			var index = j * 6;
			ax = tween.curve[index + 2];
			ay = tween.curve[index + 3];
			bx = tween.curve[index + 4];
			by = tween.curve[index + 5];
			cx = tween.curve[index + 6];
			cy = tween.curve[index + 7];
			dx = tween.curve[index + 8];
			dy = tween.curve[index + 9];

			if(anim.t <= dx && anim.t >= ax)
			{
				in_range = true;
				break;
			}
		}

		if(in_range === false) continue;

		var time_range = dx - ax;
		var value_range = dy - ay;

		var t = (anim.t - ax) / time_range;
		if(t < 0.0) t = 0.0;
		else if(t > 1.0) t = 1.0;

		var u = 1.0 - t;
		var tt = t * t;
		var uu = u * u;
		var uuu = uu * u;
		var ttt = tt * t;
		var value = (uuu * ay) + (3 * uu * t * by) + (3 * u * tt * cy) + (ttt * dy);

		if(tween.bone_index !== -1)
		{
			anim.target[tween.bone_index][tween.property][tween.index] = value;
		}
		else
		{
			if(tween.index === -1)
			{
				anim.target[tween.property] = value;
			}
			else
			{
				anim.target[tween.property][tween.index] = value;
			}
		}
		if(anim.target.dirty !== undefined) anim.target.dirty = true;
	}
	//if(in_range === false)
	if(anim.t > animation_duration(anim))
	{
		if(anim.loops === -1)
		{
			//animation.t = animation_start_time(animation);
			anim.t = 0;
		}
		else
		{
			anim.loop_count++;
			if(anim.loop_count === anim.loops)
			{
				if(anim.callback) anim.callback(anim);
				if(anim.next) anim.next.is_playing = true;
				anim.is_playing = false;
			}
			else
			{
				//animation.t = gb.animation.get_start_time(animation);
				anim.t = 0;
			}
		}
	}
}


function read_action()
{
    var animation = Animation();
    animation.target_type = read_i32();
    animation.name = read_string();
    animation.target = read_string();

    var num_curves = read_i32();
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = Tween();
    	tween.property = read_string();
    	tween.index = read_i32();

    	tween.num_frames = read_i32();
    	tween.curve = read_f32(tween.num_frames * 6);
    	animation.tweens.push(tween);
    }
    animation_start(animation);
    animation_duration(animation);
    return animation;	
}
function create_bacteria_particles(count,rate, color_scheme)
{
    var n = count;
    var i = 0;
    var it = 0;

    var positions = new Float32Array(n*3);
    var lifes = new Float32Array(n);
    var colors = new Float32Array(n*3);

    // POSITIONS

    var polar = _Vec3();
    var cartesian = _Vec3();
    for(var it = 0; it < n; ++it)
    {
        random_on_half_sphere(polar);
        polar_to_cartesian_v(cartesian, polar, 0.72);

        positions[i  ] = cartesian[0];
        positions[i+1] = cartesian[1];
        positions[i+2] = cartesian[2];

        i += 3;
    }

    // LIFE (random for now)
    i = 0;
    for(var it = 0; it < n; ++it)
    {
        lifes[it] = rand_float(0.0,1);
    }

    // COLORS

    i = 0;
    var index = 1;
    for(it = 0; it < n; ++it)
    {
        var c = color_scheme[index];
        colors[i  ] = c[0];
        colors[i+1] = c[1];
        colors[i+2] = c[2];
        i += 3;
        index++;
        if(index === 5) index = 1;
    }


    var buf = {};
    buf.instance_position = InstancedVertexBuffer(positions, 3, false);
    buf.instance_life = InstancedVertexBuffer(lifes, 1, false);
    buf.instance_color = InstancedVertexBuffer(colors, 3, false);
    bind_instance_buffers(buf);

    var result = 
    {
        t: 0,
        rate: rate,
        count: count,
        draw_index: 0,
        ibuffer: buf,
    };

    return result;
}

function update_bacteria_particles(p, dt)
{
    var i = 0;
    var it = 0;
    var n = p.count;
    var positions = p.ibuffer.instance_position.data;
    var lifes = p.ibuffer.instance_life.data;
    var radius = app.game_info.spray_radius * app.game_info.spray_radius;

    if(app.spraying === true && app.game_info.can_spray === true)
    {
        var can_pos = _Vec3();
        var pos = _Vec3();
        get_position(can_pos, app.spray_hit);
        //LOG(radius)

        for(i = 0; i < n; ++i)
        {
            // add some random movement here?
            /*
            pos[0] = positions[it  ] - pos[0];
            pos[1] = positions[it+1] - pos[1];
            pos[2] = positions[it+2] - pos[2];
            */
            pos[0] = can_pos[0] - positions[it  ];
            pos[1] = can_pos[1] - positions[it+1];
            pos[2] = can_pos[2] - positions[it+2];

            var ds = vec_sqr_length(pos);
            if(ds < radius)
            {
                lifes[i] = 0;
                // set life to 0
                app.game_info.score++;
                app.game_info.bacteria_count--;
            }

            //lifes[i] += dt * 0.1;
            if(lifes[i] > 1.0) lifes[i] = 0;

            it += 3;
        }
    }

    /*
    for(i = 0; i < n; ++i)
    {
        lifes[i] += dt * 0.1;
        if(lifes[i] > 1.0) lifes[i] = 0;
    }
    */

    update_instance_buffers(p.ibuffer);

}


function create_spray_hit_particles(count, rate, color_scheme)
{
	var n = count;
    var positions = new Float32Array(n*3);
    var offsets = new Float32Array(n*3);
    var lifes = new Float32Array(n);
    var colors = new Float32Array(n*3);

    var i = 0;
    var it = 0;

    // @TODO be able to update colour scheme when switching products

    // COLORS
    i = 0;
    var index = 1;
    for(it = 0; it < n; ++it)
    {
        var c = color_scheme[index];
        colors[i  ] = c[0];
        colors[i+1] = c[1];
        colors[i+2] = c[2];
        i += 3;
        index++;
        if(index === 5) index = 1;
    }
    
    var buf = {};
    buf.instance_position = InstancedVertexBuffer(positions, 3, false);
    buf.instance_offset = InstancedVertexBuffer(offsets, 3, false);
    buf.instance_life = InstancedVertexBuffer(lifes, 1, false);
    buf.instance_color = InstancedVertexBuffer(colors, 3, false);
    bind_instance_buffers(buf);

    var result = 
    {
    	t: 0,
        rate: rate,
        count: count,
        draw_index: 0,
        ibuffer: buf,
    };

    return result;
}

function set_spray_colour_scheme(hit, scheme)
{
    var colors = hit.ibuffer.instance_color.data;
    var n = hit.count;
    var i = 0;
    var index = 1;
    for(var it = 0; it < n; ++it)
    {
        var c = scheme[index];
        colors[i  ] = c[0];
        colors[i+1] = c[1];
        colors[i+2] = c[2];
        i += 3;
        index++;
        if(index === 5) index = 1;
    }

    update_instance_buffers(hit.ibuffer);
}

function update_spray_hit(hit, dt)
{
    var i = 0;
    var n = hit.count;
    var lifes = hit.ibuffer.instance_life.data;
    var positions = hit.ibuffer.instance_position.data;
    var offsets = hit.ibuffer.instance_offset.data;

    var pos = _Vec3();
    var offset = _Vec3();
    var rand = _Vec3();

    get_position(pos, app.spray_hit);
    
    if(app.spraying === true && app.game_info.can_spray === true)
    {
        app.game_info.spray_charge -= app.game_info.spray_rate * dt;

        var COUNT = hit.rate;
        if(hit.draw_index + COUNT > hit.count) hit.draw_index = COUNT;

        for(var j = 0; j < COUNT; ++j)
        {
            i = hit.draw_index;
            lifes[i] = rand_float(0.8,0.95);

            i = hit.draw_index * 3;

            positions[i  ] = pos[0];
            positions[i+1] = pos[1];
            positions[i+2] = pos[2];

            unit_circle(rand, 0.3);
            mat4_mul_point(offset, app.spray_hit.world_matrix, rand);

            offsets[i  ] = offset[0];
            offsets[i+1] = offset[1];
            offsets[i+2] = offset[2];

            hit.draw_index++;
            //if(hit.draw_index >= hit.count) hit.draw_index -= hit.count;
        } 
    }       
    
    for(i = 0; i < n; ++i) 
    {
        lifes[i] *= 0.94;
        if(lifes[i] < 0) lifes[i] = 0;
    }
    
    update_instance_buffers(hit.ibuffer);
}
function free_look(c, dt, vertical_limit)
{
	if(c.fly_mode === undefined) 
	{
		c.fly_mode = false;
		c.angle = Vec3();
		c.velocity = Vec3();
	}
	
	if(key_down(Keys.F)) c.fly_mode = !c.fly_mode;
	if(c.fly_mode === false) return;

	var v3_index = vec3_stack.index;
	var v4_index = vec4_stack.index;

	var ROTATE_SPEED = 3.0;

	c.angle[0] -= input.mouse.delta[1] * ROTATE_SPEED * dt;
	c.angle[1] -= input.mouse.delta[0] * ROTATE_SPEED * dt;
	
	if(c.angle[0] >  vertical_limit) c.angle[0] = vertical_limit;
	if(c.angle[0] < -vertical_limit) c.angle[0] = -vertical_limit;

	if(key_down(Keys.R))
	{
		c.angle[0] = 0;
		c.angle[1] = 0;
	}
	if(key_down(Keys.P))
	{
		LOG(c.angle)
		LOG(c.position)
	}

	var rot_x = _Vec4(0,0,0,1);
	var rot_y = _Vec4(0,0,0,1);
	var rot_lerp = _Vec4(0,0,0,1);

	var right = _Vec3(1,0,0);
	var up = _Vec3(0,1,0);

	quat_set_angle_axis(rot_x, c.angle[0], right);
	quat_set_angle_axis(rot_y, c.angle[1], up);

	quat_mul(rot_lerp, rot_y, rot_x);
	vec_lerp(c.rotation, c.rotation, rot_lerp, 0.1);

	var accel = _Vec3();
	var MOVE_SPEED = 0.5;
	if(key_held(Keys.SHIFT)) MOVE_SPEED *= 2;

	if(key_held(Keys.A)) accel[0] = -MOVE_SPEED * dt;
	else if(key_held(Keys.D)) accel[0] = MOVE_SPEED * dt;
	
	if(key_held(Keys.W)) accel[2] = -MOVE_SPEED * dt;
	else if(key_held(Keys.S)) accel[2] = MOVE_SPEED * dt;

	if(key_held(Keys.Q)) accel[1] = -MOVE_SPEED * dt;
	else if(key_held(Keys.E)) accel[1] = MOVE_SPEED * dt;

	mat4_mul_dir(accel, c.world_matrix, accel);

	vec_add(c.velocity, accel, c.velocity);
	vec_mul_f(c.velocity, c.velocity, 0.9);

	vec_add(c.position, c.velocity, c.position);
	c.dirty = true;

	vec3_stack.index = v3_index;
	vec4_stack.index = v4_index;
}
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
        depth: true,
        stencil: false,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        preferLowPowerToHighPerformance: false,
        failIfMajorPerformanceCaveat: false,
    });

    app.sampler = default_sampler();
    //app.audio = Sound();

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

    LOG('Width: ' + app.view[2] + ' Height: ' + app.view[3]);

    init();
}

window.addEventListener('load', main);

app.color_schemes =
{ 
    excite:
    [
        hex_to_rgb('#FFFFFF', true),
        hex_to_rgb('#57165e', true),
        hex_to_rgb('#dc1af1', true),
        hex_to_rgb('#FFFFFF', true),
        hex_to_rgb('#dc1af1', true)
    ],
    africa:
    [
        hex_to_rgb('#3bb150', true),
        hex_to_rgb('#FFFFFF', true),
        hex_to_rgb('#ef6052', true),
        hex_to_rgb('#3bb150', true),
        hex_to_rgb('#808082', true)
    ],
    black:
    [
        hex_to_rgb('#000000', true),
        hex_to_rgb('#FFFFFF', true),
        hex_to_rgb('#DDDDDD', true),
        hex_to_rgb('#000000', true),
        hex_to_rgb('#FFFFFF', true)
    ],
    temptation:
    [
        hex_to_rgb('#452e29', true),
        hex_to_rgb('#acacac', true),
        hex_to_rgb('#452e29', true),
        hex_to_rgb('#b67f3e', true),
        hex_to_rgb('#FFFFFF', true)
    ],
    you:
    [
        hex_to_rgb('#d9e14d', true),
        hex_to_rgb('#FFFFFF', true),
        hex_to_rgb('#d9e14d', true),
        hex_to_rgb('#cccccc', true),
        hex_to_rgb('#FFFFFF', true)
    ],

    
    berry:
    [
        hex_to_rgb('#e0edf7', true),
        hex_to_rgb('#e6f4ff', true),
        hex_to_rgb('#93bad8', true),
        hex_to_rgb('#6abeff', true),
        hex_to_rgb('#c7e3f9', true)
    ],

    gummy:
    [
        hex_to_rgb('#3f3f3f', true),
        hex_to_rgb('#4d4d4d', true),
        hex_to_rgb('#777777', true),
        hex_to_rgb('#a9a9a9', true),
        hex_to_rgb('#cecece', true)
    ],
};
function find(selectors)
{
    for(var k in selectors)
    {
        var selection = document.querySelectorAll(selectors[k]);
        if(selection.length > 1) selectors[k] = selection;
        else selectors[k] = selection[0];
    }
    return selectors;
}

function set_element_pos(el, v)
{
	el.style.transform = 'translate(' + v[0] + 'px, ' + v[1] + 'px)';
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
var MarbleState =
{
    ENTER: 0,
    VISIBLE: 1,
    EXIT: 2,
    HIDDEN: 3,
};

function BlueMarble()
{
	var r = {};

    r.assets = AssetGroup('marble');
    load_assets(r.assets,
    [
        'img/earth_day.jpg',
        'img/earth_night.jpg',
        'assets/marble.txt',
    ],
    function()
    {
        bind_assets(r.assets);
    });

    r.state = MarbleState.HIDDEN;
    r.timer = 0;
    r.overlay = 1.0;

    r.density = -2.906;
    r.brightness = 1.09;

    r.root = Entity(0,0,0, null);
    r.earth = Entity(0,0,0, r.root);
    r.camera = Camera(0.01, 500, 60, app.view);
    set_vec3(r.camera.position, 0,0,38);

    r.sphere = sphere_mesh(10.0, 64,64);

    r.spin_velocity = 0.15;
    r.spin = Vec3(0,0,15);

	return r;
}

function reset_blue_marble(bm)
{
    r.density = -2.906;
    r.brightness = 1.09;
    set_vec3(r.camera.position, 0,0,38);
    set_vec3(r.spin, 0,0,15);
}

function unload_blue_marble(bm)
{
    unbind_texture(bm.assets.textures.earth_day);
    unbind_texture(bm.assets.textures.earth_night);
    unbind_mesh(bm.sphere);
}

function show_blue_marble()
{
    var bm = app.blue_marble;
    //if(bm.state !== MarbleState.HIDDEN) return;

    LOG('Showing Blue Marble');

    bm.timer = 0;
    bm.state = MarbleState.ENTER;
}

function hide_blue_marble()
{
    LOG('Hiding Blue Marble');

    var bm = app.blue_marble;
    bm.timer = 0;
    bm.state = MarbleState.EXIT;
}

function update_blue_marble(bm, dt)
{
    if(bm.state === MarbleState.ENTER)
    {
        bm.spin_velocity = 0.15;
        bm.timer += dt;
        var t = bm.timer * 0.5;

        bm.overlay = 1 - t;
        var zoom = lerp(24,20, ease_out_quad(t));
        bm.camera.position[2] = zoom;

        if(bm.timer > 2.0)
        {
            bm.timer = 0;
            bm.state = MarbleState.VISIBLE;
        }
    }

    if(bm.state === MarbleState.ENTER ||
       bm.state === MarbleState.VISIBLE)
    {
        free_look(bm.camera, dt, 80);
        //todo

        update_camera(bm.camera);

        if(key_held(Keys.MOUSE_LEFT))
        {
            bm.spin[1] += input.mouse.delta[0] * dt;
            bm.spin_velocity = input.mouse.delta[0] * dt;
        }
        else
        {
            bm.spin[1] += bm.spin_velocity;
        }

        quat_set_euler(bm.earth.rotation, bm.spin);

        if(key_held(Keys.LEFT)) bm.density += dt;
        if(key_held(Keys.RIGHT)) bm.density -= dt;
        if(key_held(Keys.UP)) bm.brightness += dt;
        if(key_held(Keys.DOWN)) bm.brightness -= dt;

        update_entity(bm.root);
    }

    if(bm.state === MarbleState.EXIT)
    {
        bm.timer += dt;
        bm.overlay = bm.timer * 0.5;
        if(bm.timer > 2.0)
        {
            bm.state = MarbleState.HIDDEN;
            bm.timer = 0;
        }
    }
    /*
    if(bm.state === MarbleState.HIDDEN)
    {
    }
    */

}

function render_blue_marble(bm)
{
	if(bm.assets.loaded === false) return;

	var shaders = bm.assets.shaders;
	var textures = bm.assets.textures;
	var meshes = bm.assets.meshes;
	var cam = bm.camera;

    set_clear_color_f(0,0,0,1);
    clear_screen();

    enable_depth_testing();
	set_shader(shaders.earth);
    set_uniform('model', bm.earth.world_matrix);
    set_uniform('view', cam.view);
    set_uniform('proj', cam.projection);
    set_uniform('camera', cam.position);
    set_uniform('light', _Vec3(3,3,3));
    set_uniform('density', bm.density);
    set_uniform('brightness', bm.brightness);
    set_uniform('day', textures.earth_day);
    set_uniform('night', textures.earth_night);
    draw_mesh(bm.sphere);

    // draw overlay
    enable_alpha_blending();
    disable_depth_testing();
    set_shader(app.assets.shaders.overlay);
    set_uniform('color', _Vec4(0,0,0, bm.overlay));
    draw_mesh(app.screen_quad);
}
var AppState =
{
    INIT: 0,
    FLOW: 1,
    WORK: 2,
    MARBLE: 3,
    //AR: 4,
    //AUDIO_VIS: 5,
    PLASTIC: 5,
};

function init()
{
    app.assets = AssetGroup('common');
    load_assets(app.assets,
    [
        'assets/common.txt',
    ],
    function()
    {
        bind_assets(app.assets);
    });

    app.anims = {};
    app.blue_marble = BlueMarble();
    app.gl_draw = GL_Draw(12000);
    app.screen_quad = quad_mesh(2,2,0);
    app.quad = quad_mesh(1,1,0);

    set_clear_color([0,0,0,1]);
    clear_screen();

    app.state = AppState.MARBLE;

    set_viewport(app.view);
    clear_stacks();
    requestAnimationFrame(update);

    document.body.style.visibility = 'visible';

    show_blue_marble();
}


function update(t)
{
    set_time(app.time, t);
    requestAnimationFrame(update);

    if(app.time.paused === true ||
        app.has_focus === false ||
        app.assets_loaded === false)
    {
        return;
    }

    var dt = app.time.dt;
    var ui = app.ui;

    update_blue_marble(app.blue_marble, dt);

    render();
    update_input();
    clear_stacks();
}

function render()
{
    switch(app.state)
    {
        case AppState.MARBLE:
        {
            render_blue_marble(app.blue_marble);
            break;
        }
    }
}

