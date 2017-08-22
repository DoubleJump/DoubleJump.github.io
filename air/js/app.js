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

function Request(response_type, url)
{
    var r = new XMLHttpRequest();
    r.open('GET', url, true);
    r.responseType = response_type;
    return r;
}

function load_file(params)
{
    var r = new XMLHttpRequest();
    r.open('GET', params.url, true);
    r.responseType = params.type || 'arraybuffer';
    if(params.onprogress) r.onprogress = params.onprogress;
    if(params.onload) r.onload = params.onload;
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
function AssetGroup()
{
    var r = {};
    r.shaders = {};
    r.meshes = {};
    r.textures = {};
    r.fonts = {};
    r.animations = {};
    r.rigs = {};
    r.curves = {};
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
    END: -1
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

function read_asset_file(assets, data)
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
    LOG(name)

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
var METERS_PER_DEGREE_EQUATOR = 111000;

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

function compare_normal(N, R, rotation) 
{ 
	var index = vec3_stack.index;

    var rN = vec3_tmp();
    quat_mul_vec(rN, rotation, N);
    var result = vec_dot(rN, R) * RAD2DEG;

    vec3_stack.index = index;
    return result;
}

function Time()
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;

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
    time.last = t;
    time.elapsed += time.dt * time.scale;
    time.at += time.dt;
    if(time.at > 1) time.at -= 1;
    time.st = Math.sin(time.elapsed)
    time.nst = time.st / 2 + 0.5;
}
function Vec3(x,y,z)
{
	return new Float64Array([x || 0, y || 0, z || 0]);
}
function Vec4(x,y,z,w)
{
	return new Float64Array([x || 0, y || 0, z || 0, w || 1]);
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
	return Math.sqrt(vec_sqr_distance(a,b));
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
function vec_angle2D(v)
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
	r.set(x,y,z);
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
		str += Math.round_to(v[i], digits) + ', '
	str += Math.round_to(v[n-1], digits);
	str += ']';
	return str;
}

function vec4_mul_mat4(r, v, m) 
{
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var w = a[3];

    r[0] = m[0] * x + m[4] * y + m[ 8] * z + m[12] * w;
    r[1] = m[1] * x + m[5] * y + m[ 9] * z + m[13] * w;
    r[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    r[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
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
	vec_sub(temp, from, to);
	vec_normalized(temp, temp);
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
function Mat2()
{
	return new Float64Array([1,0,0,1]);
}

function mat2_identity(m)
{
	m[0] = 1; m[1] = 0;
	m[2] = 0; m[3] = 1;
}
function mat2_rotate(m, angle)
{
	var ca = Math.cos(angle);
	var sa = Math.sin(angle);

	m[0] = ca;
	m[1] = -sa;
	m[2] = sa;
	m[3] = ca;
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
	t[1] = m[3];
	t[2] = m[6]; 
	t[3] = m[1];
	t[5] = m[7]; 
	t[6] = m[2]; 
	t[7] = m[5];
	t[8] = m[0];
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
function Mat4()
{
	return new Float32Array([1,0,0,0,
							 0,1,0,0,
							 0,0,1,0,
							 0,0,0,1]);
	/*
	return [1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1];
	*/
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
	r[ 1] = m[ 4]; 
	r[ 2] = m[ 8]; 
	r[ 3] = m[12];
	r[ 4] = m[ 1]; 
	r[ 6] = m[ 9]; 
	r[ 7] = m[13];
	r[ 8] = m[ 2]; 
	r[ 9] = m[ 6]; 
	r[11] = m[14];
	r[12] = m[ 3]; 
	r[13] = m[ 7]; 
	r[14] = m[11];
	r[15] = m[15]; 	
}

 function mat4_inverse(r, m) 
 {
    var b00 = m[ 0] * m[ 5] - m[ 1] * m[ 4];
    var b01 = m[ 0] * m[ 6] - m[ 2] * m[ 4];
    var b02 = m[ 0] * m[ 7] - m[ 2] * m[ 4];
    var b03 = m[ 1] * m[ 6] - m[ 2] * m[ 5];
    var b04 = m[ 1] * m[ 7] - m[ 2] * m[ 5];
    var b05 = m[ 2] * m[ 7] - m[ 2] * m[ 6];
    var b06 = m[ 8] * m[13] - m[ 9] * m[12];
    var b07 = m[ 8] * m[14] - m[10] * m[12];
    var b08 = m[ 8] * m[15] - m[11] * m[12];
    var b09 = m[ 9] * m[14] - m[10] * m[13];
    var b10 = m[ 9] * m[15] - m[11] * m[13];
    var b11 = m[10] * m[15] - m[11] * m[14];

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    
    if (!det) return;
    det = 1.0 / det;

    r[ 0] = (m[ 5] * b11 - m[ 6] * b10 + m[ 7] * b09) * det;
    r[ 1] = (m[ 2] * b10 - m[ 1] * b11 - m[ 2] * b09) * det;
    r[ 2] = (m[13] * b05 - m[14] * b04 + m[15] * b03) * det;
    r[ 3] = (m[10] * b04 - m[ 9] * b05 - m[11] * b03) * det;
    r[ 4] = (m[ 6] * b08 - m[ 4] * b11 - m[ 7] * b07) * det;
    r[ 5] = (m[ 0] * b11 - m[ 2] * b08 + m[ 2] * b07) * det;
    r[ 6] = (m[14] * b02 - m[12] * b05 - m[15] * b01) * det;
    r[ 7] = (m[ 8] * b05 - m[10] * b02 + m[11] * b01) * det;
    r[ 8] = (m[ 4] * b10 - m[ 5] * b08 + m[ 7] * b06) * det;
    r[ 9] = (m[ 1] * b08 - m[ 0] * b10 - m[ 2] * b06) * det;
    r[10] = (m[12] * b04 - m[13] * b02 + m[15] * b00) * det;
    r[11] = (m[ 9] * b02 - m[ 8] * b04 - m[11] * b00) * det;
    r[12] = (m[ 5] * b07 - m[ 4] * b09 - m[ 6] * b06) * det;
    r[13] = (m[ 0] * b09 - m[ 1] * b07 + m[ 2] * b06) * det;
    r[14] = (m[13] * b01 - m[12] * b03 - m[14] * b00) * det;
    r[15] = (m[ 8] * b03 - m[ 9] * b01 + m[10] * b00) * det;

    return r;
};

function mat4_inverse_affine(r, m)
{
	var t0 = m[10] * m[5] - m[ 6] * m[9];
	var t1 = m[ 2] * m[9] - m[10] * m[1];
	var t2 = m[ 6] * m[1] - m[ 2] * m[5];

	var det = m[0] * t0 + m[4] * t1 + m[8] * t2;
	if(!det) return;
	var idet = 1.0 / det;

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

function mat4_perspective(m, fov, aspect, near, far) 
{
	mat4_identity(m);
    var f = 1.0 / Math.tan(fov / 2);
    var nf = 1 / (near - far);
    m[ 0] = f / aspect;
    m[ 5] = f;
    m[10] = (far + near) * nf;
    m[11] = -1;
    m[14] = (2 * far * near) * nf;
    m[15] = 0;
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

function unit_circle(r)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y);
	r[0] = x * l;
	r[1] = y * l;
}

function unit_sphere(r)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var z = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y + z * z);
	r[0] = x * l;
	r[1] = y * l;
	r[2] = z * l;
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

function cartesian_to_polar(r, c)
{
    var radius = vec_length(c);
    var theta = Math.atan2(c[1], c[0]);
    var phi = Math.acos(2 / radius);
    vec3_set(r, theta, phi, radius);
}

function polar_to_cartesian(r, theta, phi, radius)
{
    var x = radius * Math.cos(theta) * Math.sin(phi);
    var y = radius * Math.cos(phi);
    var z = radius * Math.sin(theta) * Math.sin(phi);
    vec3_set(r, x,y,z);
}

function world_to_screen(r, projection, world, view)
{
	var wp = _Vec3(); 
    mat4_mul_projection(wp, projection, world);
    r[0] = ((wp[0] + 1.0) / 2.0) * view[2];
    r[1] = ((1.0 - wp[1]) / 2.0) * view[3];
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
    mat4_mul_projection(r, inv, t);

    mat4_stack.index--;
    vec3_stack.index--;
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
	STRIP: 2
}

var BufferUpdateRate = 
{
	STATIC: 0,
	DYNAMIC: 1,
	STREAM: 2,
}

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

function InstancedVertexBuffer(data, stride, normalized)
{
    var r = {};
    r.id = null;
    r.data = data;
    r.stride = stride;
    r.normalized = normalized;
    r.count = data.length / stride;
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
var TextureFormat = 
{
	RGBA: 0,
	DEPTH: 1,
	GRAYSCALE: 2,
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
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR, 16);
}

function Texture(width, height, data, sampler, format, bytes_per_pixel)
{
	var t = {};
	t.id = null;
	//t.index = 0;
	t.data = data;
	t.format = format;
	t.width = width;
	t.height = height;
	t.bytes_per_pixel = bytes_per_pixel;
	t.compressed = false;
	t.from_element = false;
	t.sampler = sampler;
	t.flip = false;
	t.loaded = false;
	t.gl_releasable = false;
	return t;
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
function rgba_texture(width, height, pixels, sampler)
{
	var t = Texture(width, height, pixels, sampler, TextureFormat.RGBA, 4);
	return t;
}
function depth_texture(width, height, sampler)
{
	var t = Texture(width, height, null, sampler, TextureFormat.DEPTH, 4);
	return t;
}


function quad_mesh(width, height, x_offset, y_offset)
{
    var w = width / 2;
    var h = height / 2;
    var x = x_offset || 0;
    var y = y_offset || 0;

    var attributes = 
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
         w + x, h + y, 0, 1,1,
         w + x,-h + y, 0, 1,0,
        -w + x,-h + y, 0, 0,0,
        -w + x, h + y, 0, 0,1,
         w + x, h + y, 0, 1,1,
        -w + x,-h + y, 0, 0,0,
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}


/*
function quad_mesh(width, height, x_offset, y_offset)
{
    var w = width / 2;
    var h = height / 2;
    var x = x_offset || 0;
    var y = y_offset || 0;

    var attributes = 
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
         w + x, h + y, 0, 1,1,
         w + x,-h + y, 0, 1,0,
        -w + x,-h + y, 0, 0,0,
        -w + x, h + y, 0, 0,1,
         w + x, h + y, 0, 1,1,
        -w + x,-h + y, 0, 0,0,
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}
*/
function cube_mesh(width, height, depth)
{
	var x = width  / 2;
	var y = height / 2;
	var z = depth  / 2;

	var attributes = 
    {
        position: VertexAttribute(3, false),
        color: VertexAttribute(4, false)
    };

	var vertices = new Float32Array(
	[
		// POS    COLOUR
		-x,-y, z, 1,1,1,1,
		 x,-y, z, 1,1,1,1,
		 x, y, z, 1,1,1,1,
		-x, y, z, 1,1,1,1,

		-x,-y,-z, 0,0,0,1,
		-x, y,-z, 0,0,0,1,
		 x, y,-z, 0,0,0,1,
		 x,-y,-z, 0,0,0,1,

		-x, y,-z, 0,0,0,1,
		-x, y, z, 1,1,1,1,
		 x, y, z, 1,1,1,1,
		 x, y,-z, 0,0,0,1,

		-x,-y,-z, 0,0,0,1,
		 x,-y,-z, 0,0,0,1,
		 x,-y, z, 1,1,1,1,
		-x,-y, z, 1,1,1,1,

		 x,-y,-z, 0,0,0,1,
		 x, y,-z, 0,0,0,1,
		 x, y, z, 1,1,1,1,
		 x,-y, z, 1,1,1,1,

		-x,-y,-z, 0,0,0,1,
		-x,-y, z, 1,1,1,1,
		-x, y, z, 1,1,1,1,
		-x, y,-z, 0,0,0,1
	]);

	var triangles = new Uint32Array(
	[
		0,  1,  2,  0,  2,  3,
		4,  5,  6,  4,  6,  7,
		8,  9,  10, 8,  10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);

    var vb = VertexBuffer(vertices, attributes);
    var ib = IndexBuffer(triangles);
    var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
	return mesh;
}
var _ENTITY_COUNT = 0;

function Entity(x,y,z, parent)
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
	if(parent) set_parent(e, parent);
	return e;
}

function set_mvp(m, entity, camera)
{
	mat4_mul(m, entity.world_matrix, camera.view_projection_matrix);
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
function Canvas(container, view)
{
	var canvas = document.createElement('canvas');
    canvas.width = view[2];
    canvas.height = view[3];
    container.appendChild(canvas);
    return canvas;
}

var GL = null;
function WebGL(canvas, options)
{
    GL = canvas.getContext('webgl', options);
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
		if(ext.startsWith('MOZ')) continue;
	    GL.extensions[ext] = GL.getExtension(ext);
	}

    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL.clearColor(1.0, 1.0, 1.0, 1.0);
	GL.enable(GL.SCISSOR_TEST);
	GL.frontFace(GL.CW);

	reset_webgl_state(GL);

	// DEBUG
	//log_webgl_info(GL);
	// END

	return GL;
}

function reset_webgl_state(GL)
{
	var n = GL._parameters.num_texture_units;
	for(var i = 0; i < n; ++i) 
	{
		GL.activeTexture(GL.TEXTURE0 + i);
		GL.bindTexture(GL.TEXTURE_2D, null);
		GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
	}
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
	GL.bindRenderbuffer(GL.RENDERBUFFER, null);
	GL.bindFramebuffer(GL.FRAMEBUFFER, null);

	enable_backface_culling();
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

function clear_screen()
{
	GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
}

function enable_backface_culling()
{
	GL.enable(GL.CULL_FACE);
	GL.cullFace(GL.BACK);
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

function set_depth_range(min, max)
{
	GL.depthRange(min, max);
}

function set_line_width(val)
{
	GL.lineWidth(val);
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
	GL.bindBuffer(GL.ARRAY_BUFFER, mesh.vertex_buffer.id);
	GL.bufferData(GL.ARRAY_BUFFER, 1, GL.STATIC_DRAW);
	GL.deleteBuffer(mesh.vertex_buffer.id);

	if(mesh.index_buffer)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, 1, GL.STATIC_DRAW);
		GL.deleteBuffer(mesh.index_buffer.id);
	}

	mesh.vertex_buffer.id = null;
	mesh.index_buffer.id = null;
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
	GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, null);
}
function update_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(vb.update_rate));

	if(ib !== null)
	{
		ib.byte_size = GL.UNSIGNED_INT;
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ib.id);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, convert_update_rate(ib.update_rate));
	}
	
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
}
function update_mesh_range(mesh, start, end)
{
	var vb = mesh.vertex_buffer;
	//var start = vb.update_start * vb.stride;
	var view = vb.data.subarray(start, end);

	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferSubData(GL.ARRAY_BUFFER, start * 4, view);
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
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
	GL.bindTexture(GL.TEXTURE_2D, t.id);
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
		var max_anisotropy = GL.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
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
    if(success === false) console.error("Shader Compile Error: " + GL.getShaderInfoLog(vs));

    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, s.fragment_src);
    GL.compileShader(fs);

    success = GL.getShaderParameter(fs, GL.COMPILE_STATUS);
    if(success === false) console.error("Shader Compile Error: " + GL.getShaderInfoLog(fs));

	s.id = GL.createProgram();
    GL.attachShader(s.id, vs);
    GL.attachShader(s.id, fs);
    GL.linkProgram(s.id);

    success = GL.getProgramParameter(s.id, GL.LINK_STATUS);
    if(success === false) console.error("Shader Link Error: " + GL.getProgramInfoLog(s.id));

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

var _active_shader = null;
function use_shader(shader)
{
	//if(_active_shader === shader) return;
	_active_shader = shader;
    GL.useProgram(shader.id);
}

function set_uniform(name, value)
{
	var uniform = _active_shader.uniforms[name];

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
        case GL.FLOAT_MAT4: 
        {
        	GL.uniformMatrix4fv(loc, false, value); 
        	return;
        }
        case GL.SAMPLER_2D:
        {
			GL.uniform1i(loc, uniform.sampler_index);
			GL.activeTexture(GL.TEXTURE0 + uniform.sampler_index);
			GL.bindTexture(GL.TEXTURE_2D, value.id);
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


function set_attributes(mesh)
{
	var shader = _active_shader;
	var vb = mesh.vertex_buffer;
	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);

	for(var k in vb.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        //ASSERT(va !== undefined, 'Shader ' + shader.name + ' needs attribute ' + k + ' but mesh ' + mesh.name + ' does not have it');
        if(sa === undefined) continue;
        if(va === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
	}

	GL.bindBuffer(GL.ARRAY_BUFFER, null);
}

function set_instance_attributes(buffers)
{
	var shader = _active_shader;
	var ext = GL.extensions.ANGLE_instanced_arrays;

    for(var k in buffers)
    {
        var buffer = buffers[k];
        var sa = shader.attributes[k];
        if(!sa)
        {
        	continue;
        }
        GL.bindBuffer(GL.ARRAY_BUFFER, buffer.id);
        GL.enableVertexAttribArray(sa);
        GL.vertexAttribPointer(sa, buffer.stride, GL.FLOAT,buffer.normalized, buffer.stride * 4, 0);
        
        ext.vertexAttribDivisorANGLE(sa, 1);
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

function update_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        GL.bindBuffer(GL.ARRAY_BUFFER, b.id);
        GL.bufferData(GL.ARRAY_BUFFER, b.data, GL.STATIC_DRAW);
    }
    
	//GL.bindBuffer(GL.ARRAY_BUFFER, null);
}


function draw_mesh(mesh)
{
	GL.bindBuffer(GL.ARRAY_BUFFER, mesh.vertex_buffer.id);
	set_attributes(mesh);

	var layout = convert_mesh_layout(mesh.layout);
	
	if(mesh.index_buffer)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
	}
    else
    {
		
    	GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    }

    GL.bindBuffer(GL.ARRAY_BUFFER, null);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
}

function draw_mesh_instanced(mesh, instances, count)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;
	//GL.bindBuffer(GL.ARRAY_BUFFER, mesh.vertex_buffer.id);

    set_attributes(mesh);
	set_instance_attributes(instances);

	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
    	ext.drawElementsInstancedANGLE(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0, count);
	}
    else
    {
    	GL.bindBuffer(GL.ARRAY_BUFFER, mesh.vertex_buffer.id);
    	ext.drawArraysInstancedANGLE(layout, 0, mesh.vertex_buffer.count, count);
    }

    GL.bindBuffer(GL.ARRAY_BUFFER, null);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
    for(var i = 0; i < 16; ++i)
		ext.vertexAttribDivisorANGLE(i, 0);
}


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
}

function set_blend_mode(mode)
{
	if(mode === BlendMode.NONE) GL.disable(GL.BLEND);
	else GL.enable(GL.BLEND);

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

function bind_render_target(t)
{
	bind_texture(t.color);
	bind_texture(t.depth);

	update_texture(t.color);
	update_texture(t.depth);

	t.frame_buffer = GL.createFramebuffer();
	GL.bindFramebuffer(GL.FRAMEBUFFER, t.frame_buffer);

	set_render_target_attachment(GL.COLOR_ATTACHMENT0, t.color);
	set_render_target_attachment(GL.DEPTH_ATTACHMENT, t.depth);

	//DEBUG
	verify_render_target();
	//END	

	GL.bindFramebuffer(GL.FRAMEBUFFER, null);
	GL.bindRenderbuffer(GL.RENDERBUFFER, null);
}

function set_render_target_attachment(attachment, texture)
{
	GL.bindTexture(GL.TEXTURE_2D, texture.id);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, attachment, GL.TEXTURE_2D, texture.id, 0);
}

function set_render_target(target)
{
	if(target === null)
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, null);
		GL.bindRenderbuffer(GL.RENDERBUFFER, null);
		set_viewport(app.view);
	}
	else
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, target.frame_buffer);
		GL.bindRenderbuffer(GL.RENDERBUFFER, target.render_buffer);
		set_viewport(target.view);
	}
}


//DEBUG

function verify_webgl_context()
{
	if(GL.isContextLost && GL.isContextLost()) console.error('GL context lost');
}

function verify_render_target()
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
function GL_Draw(buffer_size)
{
	var r = {};
	r.color = Vec4(1,1,1,1);
	r.matrix = Mat4();

	var update_rate = BufferUpdateRate.DYNAMIC;

	// LINES

	r.line_shader = app.assets.shaders.basic;
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
    /*
    r.tri_shader = app.assets.shaders.rect;
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
    */

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
	//clear_mesh_buffers(ctx.triangles);
	//reset_text(ctx.text);
}

function render_gl_draw(ctx, cam)
{
	update_mesh(ctx.lines);
	//update_mesh(ctx.triangles);

	use_shader(app.assets.shaders.draw);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    //mat4_mul(ctx.matrix, ctx.matrix, cam.view_projection_matrix);
    set_uniform('mvp', cam.view_projection_matrix);
	draw_mesh(ctx.lines);

	/*
	use_shader(ctx.tri_shader);
	set_uniform('mvp', camera.view_projection);
	draw_mesh(ctx.triangles);
	*/

	//update_mesh(ctx.text.mesh);
	//draw_text(ctx.text, ctx.text_shader, camera);
	
	reset_gl_draw(ctx);
}

function gl_push_line(start, end, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var a = _Vec3();
	var b = _Vec3();
	
	vec_eq(a,start);
	vec_eq(b,end);

	//mat4_mul_point(a, matrix, start);
	//mat4_mul_point(b, matrix, end);

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


function draw_line(ctx, a,b)
{
	gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
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
	gl_push_line(o,e, ctx.lines, ctx.color, ctx.matrix);
	
	set_vec4(ctx.color, 0,1,0,1);
	mat4_mul_point(e, m, _Vec3(0,1,0));
	gl_push_line(o,e, ctx.lines, ctx.color, ctx.matrix);

	set_vec4(ctx.color, 0,0,1,1);
	mat4_mul_point(e, m, _Vec3(0,0,1));
	gl_push_line(o,e, ctx.lines, ctx.color, ctx.matrix);

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

    //var mvp = _Mat4();
    //mat4_mul(mvp, lm.world_matrix, camera.view_projection_matrix);

    set_uniform('mvp', camera.view_projection_matrix);
    set_uniform('aspect', camera.aspect);
    //set_uniform('start', 0);
    //set_uniform('end', lm.length);
    set_uniform('line_width', lm.thickness);
    set_uniform('color', lm.color);
    set_uniform('scale', app.map.owner.transform.scale);
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
function RenderTarget(view, sampler)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = rgba_texture(view[2], view[3], null, sampler);
	r.depth = depth_texture(view[2], view[3], sampler);
	r.view = view;
	bind_render_target(r);
	return r;
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
	r.is_touch_device = is_touch_device();
	if(!root) root = window;

	r.touches = [];
	r.MAX_TOUCHES = 5;
	for(var i = 0; i < r.MAX_TOUCHES; ++i) r.touches[i] = Touch();
	
	root.addEventListener("touchstart",  on_touch_start, false);
  	root.addEventListener("touchmove", on_touch_move, false);
  	root.addEventListener("touchend", on_touch_end, false);

  	r.gyro = Gyro();
	window.addEventListener('devicemotion', on_device_motion);
	window.addEventListener('deviceorientation', on_device_rotation);

	r.mouse = Mouse();
	r.keys = new Uint8Array(256);

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
		//break; //wut?
	}

	for(var i = 0; i < input.MAX_TOUCHES; ++i)
	{
		var t = input.touches[i];
		if(t.is_touching === false) continue;
		input.mouse.position[0] = t.position[0];
		input.mouse.position[1] = t.position[1];
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
			var x = it.screenX;
			var y = it.screenY;
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
				var x = it.screenX;
				var y = it.screenY;
				set_vec3(t.position, x, y, 0);
				t.updated = true;
				break;
			}
		}
	}
	//e.preventDefault();
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
function DataSet()
{
	var r = {};
	r.positions;
	return r;
}

function init_instance_buffers(origin)
{
 	app.data = DataSet();
 	app.data.positions = new Float32Array(
 	[
 		-1.5495779094875957,53.795707122790645,0,
-1.549942113889557,53.795729603080304,0,
-1.5501946874515227,53.79575244967708,0,
-1.5504825011150558,53.79578191825158,0,
-1.5507893637355892,53.79581440679732,0,
-1.5510385774858833,53.79583695624157,0,
-1.5514234272296221,53.7958710757805,0,
-1.5513699684648259,53.79595916514816,0,
-1.5512896457895522,53.79615974792003,0,
-1.5512263705006433,53.796396587426216,0,
-1.5517595926614547,53.79633305237397,0,
-1.5521898712127324,53.796375827519086,0,
-1.5526548432621894,53.79642413817618,0,
-1.5530481549804165,53.79645267673885,0,
-1.5535140394483733,53.79650067335376,0,
-1.5540079539128442,53.79654370061246,0,
-1.5544986067451418,53.79660252011351,0,
-1.5554195891224083,53.796649863023106,0,
-1.556288554493932,53.79673612343967,0,
-1.5567968742945197,53.79674250997476,0,
-1.5574267431044575,53.79680950731674,0,
-1.5580782677300817,53.79687106512068,0,
-1.5589514871666665,53.79695837240058,0,
-1.5597030505712723,53.79702276621697,0,
-1.560277251970632,53.79709422119873,0,
-1.5605507375632044,53.79687267696556,0,
-1.5610743180926647,53.79666822759336,0,
-1.561785433455384,53.79637626412162,0,
-1.5622852540166434,53.796147470376155,0,
-1.5628723837944278,53.79590784616428,0,
-1.5632592913455312,53.795580144959956,0,
-1.5636931858003038,53.79535773813282,0,
-1.5641430913169643,53.79511243310108,0,
-1.5646871265180948,53.7948138873777,0,
-1.565124620608998,53.794543476059744,0,
-1.5655912405077004,53.79427571311436,0,
-1.5655227734947346,53.793898409961145,0,
-1.5656703340026183,53.793671527964136,0,
-1.565822544821856,53.793269667583104,0,
-1.566030583020904,53.79278262547379,0,
-1.5661926734309475,53.792449899050496,0,
-1.5669735165512293,53.792303357967825,0,
-1.5675666031533808,53.7922646754009,0,
-1.5680034348521588,53.79235888119979,0,
-1.568495275577817,53.79249480449059,0,
-1.5691771005977273,53.792512760028586,0,
-1.5694322996766346,53.79219341045632,0,
-1.569936643830431,53.7919798959974,0,
-1.5704919248320266,53.79174656399073,0,
-1.5710824044991796,53.791537290638445,0,
-1.5717450623581612,53.79134895432918,0,
-1.572340645345264,53.79112150543597,0,
-1.5729911167464081,53.79095628767587,0,
-1.5735659106059643,53.790762689002605,0,
-1.5742348295166835,53.79057822226062,0,
-1.5747182384350538,53.79062822824028,0,
-1.5751303799395373,53.7907664375241,0,
-1.575647556486274,53.790893358158144,0,
-1.5763583823062106,53.79110415518019,0,
-1.576995069189735,53.79127420874545,0,
-1.5778304164488475,53.791585826658235,0,
-1.578336356208581,53.791736434673226,0,
-1.5790439419932625,53.79190585891564,0,
-1.5797911442123223,53.792115014920654,0,
-1.5804860596153674,53.79221242299053,0,
-1.5811380206093588,53.79233386631819,0,
-1.5817985813670248,53.79248750614005,0,
-1.5824743808195478,53.79259885477967,0,
-1.5832305047709383,53.792654683888,0,
-1.5843161029686712,53.792714775500315,0,
-1.5851760921127038,53.79283197051129,0,
-1.5858678611795085,53.79297004674666,0,
-1.5867341020508263,53.793118547701596,0,
-1.5873668254706388,53.793248637950995,0,
-1.5882895142202358,53.793292436460746,0,
-1.5890974131378357,53.79329331067353,0,
-1.5900203611913355,53.793394608710145,0,
-1.5908725324061948,53.79346196223247,0,
-1.5918681511999466,53.7935611939638,0,
-1.5929548203890533,53.793617570643306,0,
-1.5937792854950317,53.79344577261463,0,
-1.5945030787319467,53.793338907748506,0,
-1.595064373006835,53.79323032385821,0,
-1.5956269391537319,53.79323271953206,0,
-1.596864950331934,53.79333643033161,0,
-1.5974032061597256,53.79340487621644,0,
-1.5980124833237994,53.793442831391616,0,
-1.5987997122544186,53.79342840078411,0,
-1.5996301310685794,53.793478443820874,0,
-1.6005055184295145,53.79340499904765,0,
-1.6011867175505472,53.7934320160133,0,
-1.6018931087596116,53.79344681335999,0,
-1.6022735806621995,53.7933536116183,0,
-1.6028950051746733,53.7933500432799,0,
-1.6035262641226495,53.793302674597015,0,
-1.6042736818075127,53.79313036958368,0,
-1.6049753922739853,53.79298660253568,0,
-1.605602085314274,53.792905891510685,0,
-1.6062383941067822,53.79285797583461,0,
-1.6082611819402928,53.79295482047581,0,
-1.6089174436419569,53.79305984717399,0,
-1.6094613953762291,53.79311862565561,0,
-1.6101937257419365,53.79321849774067,0,
-1.6107980390771957,53.79331650483732,0,
-1.611431012325255,53.793353169039165,0,
-1.6125692857912952,53.79332346825484,0,
-1.6134242509321552,53.79313310361064,0,
-1.6145147750717115,53.79296627400964,0,
-1.6160539641024911,53.79267413685568,0,
-1.6168399469298151,53.792564075276886,0,
-1.6175450810465577,53.79247766461248,0,
 	]);


 	var positions = new Float32Array(app.data.positions.length);
 	//vec_eq(positions, app.data.positions);

 	var strengths = new Float32Array(positions.length / 3);
 	for(var i = 0; i < strengths.length; ++i)
 	{
 		strengths[i] = rand_float(0.1,1.0);
 	}

 	/*
 	var timestamps = new Float32Array(
 	[
 		0.0,0.0
 	]);
 	*/

 	array_to_map_space(positions, app.data.positions);
 	
	app.ibuffer = {};
	app.ibuffer.instance_position = InstancedVertexBuffer(positions, 3, false);
	app.ibuffer.instance_strength = InstancedVertexBuffer(strengths, 1, false);
	bind_instance_buffers(app.ibuffer);
}
function Map()
{
	var r = {};

    r.styles = 
    {
        DEFUALT: 'mapbox://styles/mapbox/light-v9',
        LIGHT: 'mapbox://styles/gazzyb/ciw4t4thq001c2jqlo3gxet3c',
        DARK: 'mapbox://styles/gazzyb/ciw4vo01r00192knp0uci6dq5'
    };

    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F6enliIiwiYSI6ImNpdnM5eGxiaDAwM2Iyb3RlZGs1emEybWoifQ.-87pq62HXosF9qHZVqbysA';

    r.locations = 
    {
        SILICON_VALLEY: [-122, 37],
        YORK: [-1.150631, 53.9585761],
        LEEDS: [-1.5624084, 53.7952287],
    };

    r.loaded = false;
    r.owner = new mapboxgl.Map(
    {
        style: r.styles.DARK,
        center: r.locations.LEEDS,
        zoom: 15,
        pitch: 45,
        bearing: -17.6,
        container: 'mapbox', 
        attributionControl: false,
        //minZoom: 0,
        //maxZoom: 20,
        //hash: false,
        //interactive: true,
        //bearingSnap: 7,
        //failIfMajorPerformanceCaveat: false,
        //preserveDrawingBuffer: false,
        //maxBounds:[],
        //scrollZoom: true,
        //boxZoom: true,
        //dragRotate: true,
        //dragPan: true,
        //keyboard: true,
        //doubleClickZoom: true,
        //touchZoomRotate: true,
        //trackResize: true,
    });
    r.WORLD_SCALE = r.owner.transform.tileSize / TWO_PI;


    r.owner.on('load', function() 
    {
        /*
         app.mapbox.addLayer(
         {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': 
            {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': 
                {
                    'type': 'identity',
                    'property': 'height'
                },
                'fill-extrusion-base': 
                {
                    'type': 'identity',
                    'property': 'min_height'
                },
                'fill-extrusion-opacity': 0.2
            }

        });
        */

        app.map.loaded = true;

        //init_instance_buffers(app.map.locations.LEEDS);
    });

	return r;
}

function Camera(view)
{
	var r = {};

	r.view_matrix = Mat4();
	r.projection_matrix = Mat4();
	r.view_projection_matrix = Mat4();
	r.pixel_projection_matrix = Mat4();
	r.pixel_unprojection_matrix = Mat4();
    r.normal_matrix = Mat3();

	r.pixels_per_meter = 1;
    r.meters_per_pixel = Vec3();

	r.position = _Vec3();
	r.longitude = -122;
	r.latitude = 37;
	r.width = view[2];
	r.height = view[3];
	r.zoom = 11;
	r.bearing = 0;
	r.pitch = 0;
	r.altitude = 1.5;
    r.scale = 1;
    r.world_size = 1;
    r.world_scale = 1;
    r.tile_zoom = 1;
    r.zoom_fraction = 1;
    //r.bearing_rot_matrix = Mat2();
    r.pitch_radians = 0;
    r.bearing_radians = 0;
    r.half_fov;
    r.top_half_surface_distance;
    r.far_z;

    return r;
}

/*
Math borrowed from https://github.com/uber/react-map-gl
*/
function update_camera(c, map, mapbox_transform)
{
    c.aspect = app.view[2] / app.view[3];

    var t = mapbox_transform;
    c.longitude = t._center.lng;
    c.latitude = t._center.lat;
    c.width = t.width;
    c.height = t.height;
    c.altitude = t._altitude;
    c.zoom = t.zoom;
    c.pitch = t.pitch;
    c.bearing = t.bearing;
    c.scale = t.scale;
    c.world_size = t.tileSize * c.scale;
    c.world_scale = c.scale * map.WORLD_SCALE;

    c.tile_zoom = Math.floor(c.zoom);
    //c.zoom_fraction = c.zoom - Math.floor(c.zoom);
    c.zoom_fraction = t.zoomFraction;

    c.bearing_radians = c.bearing * DEG2RAD;
    c.pitch_radians = c.pitch * DEG2RAD;
    c.half_fov = Math.atan(0.5 / c.altitude);

    //c.bearing_rot_matrix = t.rotationMatrix;
    //mat2_rotate(c.bearing_rot_matrix, c.bearing); //doesn't get used?


    /*
    To increase drawing precision we work out the camera's position relative to some map location
    @todo allow this to be passed down the drawing pipeline
    */
    var lat = c.latitude;
    var lng = c.longitude;
    var start_projected = _Vec3();
    var current_projected = _Vec3();
    to_map_space(start_projected, app.map.start_location);
    to_map_space(current_projected, _Vec3(lng, lat));
    vec_sub(c.position, current_projected, start_projected);
    //project_flat(c.position, _Vec3(lng, lat), c.world_scale);

    // Find the distance from the center point to the center top
    // in altitude units using law of sines.
    c.top_half_surface_distance =
      Math.sin(c.half_fov) * c.altitude /
      Math.sin(PI_OVER_TWO - c.pitch_radians - c.half_fov);

    // Calculate z value of the farthest fragment that should be rendered.
    c.far_z = Math.cos(PI_OVER_TWO - c.pitch_radians) * c.top_half_surface_distance + c.altitude;

    // calculate distance scales
    var lat_cosine = Math.cos(lat * DEG2RAD);
    var meters_per_degree = METERS_PER_DEGREE_EQUATOR * lat_cosine;

    // Calculate number of pixels occupied by one degree longitude around current lat/lon
    var pa = _Vec3(lng + 0.5, lat, 0);
    var pb = _Vec3(lng - 0.5, lat, 0);
    var pc = _Vec3(lng, lat + 0.5, 0);
    var pd = _Vec3(lng, lat - 0.5, 0);

    project_flat(pa, pa, c.world_scale);
    project_flat(pb, pb, c.world_scale);
    project_flat(pc, pc, c.world_scale);
    project_flat(pd, pd, c.world_scale);

    var ppd_x = vec_distance(pa,pb);
    var ppd_y = vec_distance(pc,pd);

    var ppm_x = ppd_x / meters_per_degree;
    var ppm_y = ppd_y / meters_per_degree;
    var ppm_z = (ppm_x + ppm_y) / 2;

    var alt_ppm = c.world_size / (4e7 * lat_cosine);
   	c.pixels_per_meter = alt_ppm;
   	set_vec3(c.meters_per_pixel, 1 / ppm_x, 1 / ppm_y, 1 / ppm_z);

    //calculate_transformation_matrices

    var aspect = c.width / c.height;
	var fov = 2.0 * Math.atan((c.height / 2) / c.altitude);
	var near = 0.2;
	var far = c.far_z * 2.0;
	mat4_perspective(c.projection_matrix, fov, aspect, near, far);

    // After the rotateX, z values are in pixel units. Convert them to
    // altitude units. 1 altitude unit = the screen height.
    mat4_identity(c.view_matrix);
    mat4_translate(c.view_matrix, _Vec3(0, 0, -c.altitude));
    mat4_scale(c.view_matrix, _Vec3(1, -1, 1 / c.height));

    // Rotate by bearing, and then by pitch (which tilts the view)
    mat4_rotate_x(c.view_matrix, c.pitch_radians);
    mat4_rotate_z(c.view_matrix, -c.bearing_radians);
    mat4_translate(c.view_matrix, _Vec3(-c.position[0], -c.position[1], 0));
    mat4_mul(c.view_projection_matrix, c.view_matrix, c.projection_matrix);

    //NORMAL MATRIX
    mat3_from_mat4(c.normal_matrix, c.view_matrix);
    mat3_inverse(c.normal_matrix, c.normal_matrix);
    mat3_transposed(c.normal_matrix, c.normal_matrix);

    // Scale with viewport window's width and height in pixels
    /*
    var m = c.pixel_projection_matrix;
	mat4_identity(m);
    mat4_scale(m, _Vec3(c.width, c.height, 1));
   
    // Convert to (0, 1)
    mat4_translate(m, _Vec3(0.5, 0.5, 0));
    mat4_scale(m, _Vec3(0.5, 0.5, 0));
    
    // Project to clip space (-1, 1)
    mat4_mul(m, m, c.view_projection_matrix);

    mat4_inverse(c.pixel_unprojection_matrix, m);
    */
}

function position_screen_element(el, world_pos)
{
    var pos = _Vec3();
    to_map_space(pos, world_pos);
    world_to_screen(pos, app.map.owner.transform.projMatrix, pos, app.view);
    el.style.transform = 'translate(' + pos[0] + 'px, ' + pos[1] + 'px)';
    vec3_stack.index--;
}

function array_to_map_space(r,a)
{
    var index = vec3_stack.index;
    var pos = _Vec3();
    var position_projected = _Vec3();
    var origin_projected = _Vec3();
    project_flat(origin_projected, app.map.start_location, app.map.WORLD_SCALE);

    var n = a.length / 3;
    var it = 0;
    for(var i = 0; i < n; ++i)
    {
        set_vec3(pos, a[it], a[it+1], a[i+2]);
        project_flat(position_projected,pos, app.map.WORLD_SCALE);
        vec_sub(pos, position_projected, origin_projected);

        r[it  ] = pos[0];
        r[it+1] = pos[1];
        r[it+2] = pos[2];
        it += 3;
    }
    vec3_stack.index = index;
}

function to_map_space(r,v)
{
    project_flat(r,v,app.map.owner.transform.scale * app.map.WORLD_SCALE);
    //r[2] = (v[2] || 0);// * app.camera.meters_per_pixel;
    r[2] = (v[2] || 0);// * app.map.owner.transform.scale;
}

function get_map_relative(r, position)
{
    var position_projected = _Vec3();
    var target_projected = _Vec3();

    to_map_space(position_projected, position); 
    to_map_space(target_projected, app.map.start_location);

    vec_sub(r, position_projected, target_projected);
    vec3_stack.index -= 2;
}

function project_flat(r, v, scale)
{
    var lng = v[0] * DEG2RAD;
    var lat = v[1] * DEG2RAD;

    r[0] = scale * (lng + PI);
    r[1] = scale * (PI - Math.log(Math.tan(PI_OVER_FOUR + lat * 0.5)));
    //r[2] = 0;
}
function unproject_flat(r, v, scale)
{
    var lng = v[0] / scale;
    var lat = PI - v[1];
    r[0] = (lng - PI) * RAD2DEG, 
    r[1] = (2 * (Math.atan(Math.exp(lat / scale)) - PI_OVER_FOUR)) * RAD2DEG;
}

function project(r, pos, camera, top_left) 
{
	var flat = _Vec3();
	vec_eq(flat, pos);
	if(camera.mercator === true) project_flat(flat, pos, c.world_scale);

    var v = _Vec4(flat[0], flat[1], pos[2], 1);
    vec4_mul_mat4(v, v, camera.pixel_projection_matrix);
    vec_mul_f(v, v, 1 / v[3]);

    if(top_left === true) v[1] = camera.height - v[1];
    if(vec_length(pos) === 2) v[2] = 0;

    vec_eq(r,v);
}

function unproject(r, pos, camera, top_left) 
{
	var y = pos[1];
	if(top_left === true) y = camera.height - y;

	var v = _Vec4(pos[0], y, pos[2], 1);
    vec4_transform_matrix(v, v, camera.pixel_unprojection_matrix);
    vec_mul_f(v,v, v[3]);

    unproject_flat(v,v, c.world_scale);
    if(vec_length(pos) === 2) v[2] = 0;
    
    vec_eq(r,v);
}

function draw_map_line(ctx, a, b)
{
    var pA = _Vec3();
    var pB = _Vec3();

    set_vec3(pA, a[0], a[1], a[2]);
    set_vec3(pB, b[0], b[1], b[2]);

    get_map_relative(pA, pA)
    get_map_relative(pB,pB);

    draw_line(ctx, pA, pB);
    vec3_stack.index -= 2;
}
/*
TODO 
- Set up a proper preloader for the map and gl data
- check usage rate
- read tracker data into instance buffers
- be able to feed mutiple data sets into buffer for comparisons
- sdf instance shader
- line renderer
- input font
- add zeros to tracker
*/

var app = {};

var AppState = 
{
    INIT: 0,
    RUNNING: 1,
};

function main()
{
    // DEBUG
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
    // END

    var overlay_container = document.querySelector('#map-overlay');
    var width = overlay_container.clientWidth;
    var height = overlay_container.clientHeight;

    app.has_focus = true;
    app.state = AppState.INIT;
    app.time = Time();
    app.map = Map();
    app.input = Input();
    app.map.start_location = app.map.locations.LEEDS;
    app.view = Vec4(0,0,width,height);
    app.camera = Camera(app.view);
    app.canvas = Canvas(overlay_container, app.view);
    app.webgl = WebGL(app.canvas, 
    {
        alpha: true,
        depth: true,
        stencil: false,
        antialias: true,
    });
    app.assets = AssetGroup();
    app.assets.meshes.quad = quad_mesh(30,30);
    //app.assets.meshes.box = cube_mesh(30,30,30);

    app.sampler = default_sampler();
    app.gl_draw = GL_Draw(12000);
    app.root = Entity(0,0,0);
    app.marker = Entity(0,0,0);
    app.avatar = Entity(0,0,0);

    // LOAD WEBGL ASSETS

    app.assets_loaded = false;
    load_file(
    {
        url: 'assets/assets.bin', 
        onload: function(e)
        {
            app.assets = read_asset_file(app.assets, e.target.response);
            bind_assets(app.assets);
            app.assets_loaded = true;
        }
    });

    //@todo load these in from an external source
    init_instance_buffers(app.map.locations.LEEDS);

    app.start_marker = document.querySelector('.marker-start');
    app.end_marker = document.querySelector('.marker-end');


    var positions = app.data.positions;
    var points = new Float32Array(positions.length);
    array_to_map_space(points, positions);
    var it = 2;
    var n = points.length / 3;
    for(var i = 0; i < n; ++i)
    {
        points[it] = rand_float(1.0,20.0);
        it += 3;
    }

    app.line_mesh = LineMesh(points);
    app.line_mesh.thickness = 2;
    //app.line_mesh.thickness = 10;

    set_clear_color(1.0,1.0,1.0,0.0);

    requestAnimationFrame(update);
}

function update(t)
{
    set_time(app.time, t);

    if(app.time.paused === true || 
        app.has_focus === false || 
        app.assets_loaded === false ||
        app.map.loaded === false)
    {
        requestAnimationFrame(update);
        return;
    }

    var dt = app.time.dt;
    var map = app.map;

    //@todo tidy this up to just app.camera
    update_camera(app.camera, map, map.owner.transform);

    if(key_down(Keys.R))
    {
        LOG(app.camera.longitude + ',' + app.camera.latitude + ',0,')
    }

    render();
    update_input();
    clear_stacks();

    requestAnimationFrame(update);
}

function render()
{
    var dt = app.time.dt;
    var GL = app.webgl;
    var shaders = app.assets.shaders;
    var meshes = app.assets.meshes;
    var cam = app.camera;
    var map = app.map;
    var mvp = _Mat4();


    //clear_screen();
    //disable_depth_testing();

    enable_backface_culling();

    // DRAW DOM TEXT AT WORLD LOCATION

    var positions = app.data.positions;
    var n = positions.length;
    var start = _Vec3(positions[0], positions[1], positions[2]);
    var end = _Vec3(positions[n-3],positions[n-2],positions[n-1]);

    position_screen_element(app.start_marker, start);
    position_screen_element(app.end_marker, end);


    // DRAW MARKER

    //spin marker
    //bob marker
    //lerp through app.data

    // DRAW FORECAST AREA
    // draw quad at location
    // pulse sdf

    get_map_relative(app.avatar.position, _Vec3(-1.5593361, 53.795893, 0.0));

    app.avatar.scale[0] = 3.0 * cam.pixels_per_meter;
    app.avatar.scale[1] = 3.0 * cam.pixels_per_meter;
    app.avatar.scale[2] = 3.0 * cam.pixels_per_meter;

    rotate_entity(app.avatar, [0,0,100 * dt]);
    update_entity(app.avatar);

    use_shader(shaders.avatar);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    set_mvp(mvp, app.avatar, cam);
    set_uniform('mvp', mvp);
    set_uniform('normal_matrix', cam.normal_matrix);
    draw_mesh(meshes.avatar);
    

    // DRAW SINGLE QUAD AT WORLD LOCATION
    /*
    get_map_relative(app.marker.position, _Vec3(-1.5593361, 53.795893, 0.0));
    update_entity(app.marker);
    use_shader(shaders.debug);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    set_uniform('model_matrix', app.marker.world_matrix);
    set_uniform('view_matrix', cam.view_matrix);
    set_uniform('projection_matrix', cam.projection_matrix);
    draw_mesh(meshes.box);
    */
    
    // DRAW INSTANCED DATA
    var ib = app.ibuffer;
    /*
    use_shader(shaders.marker);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    set_uniform('mvp', cam.view_projection_matrix);
    set_uniform('scale', map.owner.transform.scale);
    draw_mesh_instanced(meshes.quad, ib, ib.instance_position.count);
    */
    
    use_shader(shaders.instance);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    set_uniform('mvp', cam.view_projection_matrix);
    set_uniform('scale', map.owner.transform.scale);
    draw_mesh_instanced(meshes.cube, ib, ib.instance_position.count);
        

    // LINE RENDERING
    //@todo add colour a line segment property
    //draw_line_mesh(app.line_mesh, shaders.line, cam);
    disable_backface_culling();
    var lm = app.line_mesh;

    /*
    use_shader(shaders.line_flat);
    set_uniform('mvp', cam.view_projection_matrix);
    set_uniform('aspect', cam.aspect);
    set_uniform('line_width', lm.thickness);
    set_uniform('color', lm.color);
    set_uniform('scale', app.map.owner.transform.scale);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    draw_mesh(lm.mesh);
    */

    
    use_shader(shaders.line_flat);
    set_uniform('mvp', cam.view_projection_matrix);
    set_uniform('aspect', cam.aspect);
    set_uniform('line_width', lm.thickness);
    set_uniform('color', lm.color);
    set_uniform('scale', app.map.owner.transform.scale);
    set_uniform('pixels_per_meter', cam.pixels_per_meter);
    //set_uniform('start', 0);
    //set_uniform('end', lm.length);
    //set_uniform('dash', 2.0);

    draw_mesh(lm.mesh);
    enable_backface_culling();
    

    // IMMEDIATE MODE
    
    var ctx = app.gl_draw;
    /*
    var num_positions = app.data.positions.length / 3;
    var positions = app.data.positions;
    var it = 0;
    var pos = _Vec3();
    var last_pos = _Vec3();
    set_vec3(last_pos, positions[0], positions[1], positions[2]);

    for(var i = 1; i < num_positions; ++i)
    {
        set_vec3(pos, positions[it], positions[it+1], positions[it+2]);

        draw_map_line(ctx, last_pos, pos);
        vec_eq(last_pos, pos);
        it += 3;
    }
    */

    //draw_map_line(ctx, app.map.start_location, [-1.5593361, 53.795893]);
    render_gl_draw(app.gl_draw, cam);
}

window.addEventListener('load', main);

