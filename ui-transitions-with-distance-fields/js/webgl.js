'use strict';


var E = 2.71828182845904523536028747135266250;
var PI = 3.1415926535897932;
var TAU = 6.28318530718;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var PI_OVER_360 = 0.00872664625;
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
	for(var i = 0; i < n; ++i)
	{
		_stacks[i].index = 0;
	}
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
	return Math.sqrt(vec_sqr_distance(a,b));
}
function vec_sqr_distance(a, b)
{
	var r = 0;
	var n = v.length;
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
		for(var i = 0; i < n; ++i) r[0] = v[0] * l;
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
	var l = vec_sqr_length(r);
	if(l < 1)
	{
		vec_div_f(r, Math.sqrt(l));
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
var _BR;

function BinaryReader(buffer)
{
    var r = {};
    r.buffer = buffer;
    r.bytes = new DataView(buffer);
    r.offset = 0;
    return r;
}
function request_asset(url, callback)
{
    var r = new XMLHttpRequest();
    r.open('GET', url, true);
    r.onload = callback;
    r.responseType = 'arraybuffer';
    r.send();
}

function set_reader_ctx(ctx){ _BR = ctx; }
function end_reader_ctx(){ _BR = null; }

function read_boolean()
{
    var r = read_i32();
    if(r === 1) return true;
    return false;
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
function read_string()
{
    var pad = read_i32();
    var len = read_i32();
    var r = String.fromCharCode.apply(null, new Uint8Array(_BR.buffer, _BR.offset, len));
    _BR.offset += len + pad;
    return r;
}
function AssetGroup()
{
    var r = {};
    r.shaders = {};
    r.meshes = {};
    r.textures = {};
    return r;
}
var AssetType = 
{
    SHADER: 0,
    END: -1
}

function read_asset_file(data)
{
    var br = BinaryReader(data, true);
    var assets = AssetGroup();

    set_reader_ctx(br);

        var complete = false;
        while(complete === false)
        {
            var asset_type = read_i32();
            switch(asset_type)
            {
                case AssetType.SHADER: { read_shader(assets); break; }
                case AssetType.END: { complete = true; break; }
                default: { complete = true; }
            }
        }

    end_reader_ctx();
    
    return assets;
}
function Shader(vs, fs)
{
    var s = {};
    s.attributes = {};
    s.uniforms = {};
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
function default_sampler(GL)
{
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR, 16);
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
	t.flip = flip || true;
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

var MeshLayout = 
{
	TRIANGLES: 0,
	LINES: 1,
	TRI_STRIP: 2
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

	r.update_start = 0;
	r.count = 0;
	r.capacity = 0;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	
	if(data)
	{
		r.count = r.data.length / r.stride;
		r.capacity = r.data.length / r.stride;
	}

	return r;
}
function alloc_vertex_buffer_memory(vb, count)
{
	vb.data = new Float32Array(count * vb.stride);
	vb.count = vb.data.length / vb.stride;
	vb.capacity = vb.data.length / vb.stride;
}

function IndexBuffer(data, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.count = 0;
	if(data) r.count = r.data.length;
	r.update_rate = rate || BufferUpdateRate.STATIC;
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
function Canvas(container, view)
{
	var canvas = document.createElement('canvas');
    canvas.width = view[2];
    canvas.height = view[3];
    container.appendChild(canvas);
    return canvas;
}

function WebGL(canvas, options, extensions)
{
    var GL = canvas.getContext('webgl', options);
    if(!GL)
    {
    	console.error('Webgl not supported');
    	return false;
    }

    GL.extensions = {};
    if(extensions)
    {
	    for(var i = 0; i < extensions.length; ++i)
	    {
	    	var name = extensions[i];
	    	GL.extensions[name] = GL.getExtension(name);
	    }
    }

    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL.clearColor(1.0, 1.0, 1.0, 1.0);
	GL.enable(GL.SCISSOR_TEST);

	enable_backface_culling(GL);
	enable_depth_testing(GL, GL.LEQUAL);
	set_blend_mode(GL, BlendMode.DEFAULT);

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
}

function set_viewport(GL, rect)
{
	GL.viewport(rect[0], rect[1], rect[2], rect[3]);
	GL.scissor(rect[0], rect[1], rect[2], rect[3]);
}

function set_clear_color(GL, r,g,b,a)
{
	GL.clearColor(r,g,b,a);
}

function clear_screen(GL)
{
	GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
}

function enable_backface_culling(GL)
{
	GL.enable(GL.CULL_FACE);
	GL.cullFace(GL.BACK);
	GL.frontFace(GL.CCW);
}
function disable_backface_culling(GL)
{
	GL.disable(GL.CULL_FACE);
}

function enable_depth_testing(GL, mode)
{
	GL.enable(GL.DEPTH_TEST);
	if(mode) GL.depthFunc(mode); 
}

function disable_depth_testing(GL)
{
	GL.disable(GL.DEPTH_TEST);
}

function set_depth_range(GL, min, max)
{
	GL.depthRange(min, max);
}

function set_line_width(GL, val)
{
	GL.lineWidth(val);
}

function convert_update_rate(GL, type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC:  return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM:  return GL.STREAM_DRAW;
		default: console.error('Invalid update rate');
	}
}
function convert_mesh_layout(GL, type)
{
	switch(type)
	{
		case MeshLayout.TRIANGLES: return GL.TRIANGLES;
		case MeshLayout.LINES: 	   return GL.LINES;
		case MeshLayout.TRI_STRIP: return GL.TRIANGLE_STRIP;

		default: console.error('Invalid mesh layout');
	}
}

function bind_mesh(GL, mesh)
{
	mesh.vertex_buffer.id = GL.createBuffer();
	if(mesh.index_buffer) mesh.index_buffer.id = GL.createBuffer();
	update_mesh(GL, mesh);
}
function unbind_mesh(GL, mesh)
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
function update_mesh(GL, mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(GL, vb.update_rate));
	GL.bindBuffer(GL.ARRAY_BUFFER, null);

	if(ib !== null)
	{
		ib.byte_size = GL.UNSIGNED_INT;
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ib.id);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, convert_update_rate(GL, ib.update_rate));
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
	}
}
function update_mesh_range(GL, mesh)
{
	var vb = mesh.vertex_buffer;
	var offset = vb.update_start * vb.stride;
	var view = vb.data.subarray(offset);

	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferSubData(GL.ARRAY_BUFFER, offset * 4, view);
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
}


function convert_texture_size(GL, t)
{
	if(t.format === TextureFormat.DEPTH) return GL.UNSIGNED_SHORT;

	switch(t.bytes_per_pixel)
	{
		case 4:  return GL.UNSIGNED_BYTE;
		default: console.error('Invalid texture size');
	}
}
function convert_texture_format(GL, t)
{
	switch(t.format)
	{
		case TextureFormat.RGBA:  return GL.RGBA;
		case TextureFormat.DEPTH: return GL.DEPTH_COMPONENT;
		case TextureFormat.GRAYSCALE: return GL.LUMINANCE;
		default: console.error('Invalid texture format');
	}
}
function bind_texture(GL, texture)
{
	texture.id = GL.createTexture();
	update_texture(GL, texture);
}
function unbind_texture(GL, texture)
{
	GL.deleteTexture(texture.id);
	texture.id = null;
}
function update_texture(GL, t)
{
	GL.bindTexture(GL.TEXTURE_2D, t.id);
	var size = convert_texture_size(GL, t);
	var format = convert_texture_format(GL, t);

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

	set_sampler(GL, t.sampler);
}

function set_sampler(GL, sampler)
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

function bind_shader(GL, s)
{
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
        uniform.location = GL.getUniformLocation(s.id, active_uniform.name);
        uniform.type = active_uniform.type;
        uniform.size = active_uniform.size;
        if(uniform.type === GL.SAMPLER_2D)
        {
        	uniform.sampler_index = sampler_index;
        	sampler_index++;
        }
        s.uniforms[active_uniform.name] = uniform;
    }

    s.vertex_src = null;
    s.fragment_src = null;

    return s;
}

function set_attributes(GL, shader, mesh)
{
	var vb = mesh.vertex_buffer;
	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);

	for(var k in shader.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        if(sa === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
	}
}

function use_shader(GL, shader)
{
    GL.useProgram(shader.id);
}

function set_uniform(GL, uniform, value)
{

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
			GL.uniform1f(loc, value); return;
		}
		case GL.FLOAT_VEC2: GL.uniform2fv(loc, value); return;
        case GL.FLOAT_VEC3: GL.uniform3fv(loc, value); return;
        case GL.FLOAT_VEC4: GL.uniform4fv(loc, value); return;
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
			GL.bindTexture(GL.TEXTURE_2D, value.id);
			return;
		}
        case GL.SAMPLER_CUBE:
        {
        	return;
        }
        case GL.INT: 	  GL.uniform1i(loc, value); return;
		case GL.INT_VEC2: GL.uniform2iv(loc, size, value); return;
        case GL.INT_VEC3: GL.uniform3iv(loc, size, value); return;
        case GL.INT_VEC4: GL.uniform4iv(loc, size, value); return;

        // DEBUG
		default:
		{
			console.error(uniform.type + ' is an unsupported uniform type');
		}
		// END
	}
}


function draw_mesh(GL, shader, mesh)
{
	set_attributes(GL, shader, mesh);

	var layout = convert_mesh_layout(GL, mesh.layout);
	
	if(mesh.index_buffer !== null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
	}
    else
    {
    	GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    }
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

function set_blend_mode(GL, mode)
{
	if(mode === BlendMode.NONE) GL.disable(GL.BLEND);
	else GL.enable(GL.BLEND);

	switch(mode)
	{
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

function set_depth_mode(GL, mode)
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

function bind_render_target(GL, t)
{
	bind_texture(GL, t.color);
	bind_texture(GL, t.depth);

	t.frame_buffer = GL.createFramebuffer();
	GL.bindFramebuffer(GL.FRAMEBUFFER, t.frame_buffer);

	set_render_target_attachment(GL, GL.COLOR_ATTACHMENT0, t.color);
	set_render_target_attachment(GL, GL.DEPTH_ATTACHMENT, t.depth);

}

function set_render_target_attachment(GL, attachment, texture)
{
	GL.bindTexture(GL.TEXTURE_2D, texture.id);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, attachment, GL.TEXTURE_2D, texture.id, 0);
}

function set_render_target(GL, target, view)
{
	if(target === null)
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, null);
		GL.bindRenderbuffer(GL.RENDERBUFFER, null);
		set_viewport(GL, view.bounds);
	}
	else
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, target.frame_buffer);
		GL.bindRenderbuffer(GL.RENDERBUFFER, target.render_buffer);
		set_viewport(GL, target.view.bounds);
	}
}



function Entity(x,y,z, parent)
{
	var e = {};
	e.name;
	e.id;
	e.parent = null;
	e.children = [];
	e.active = true;
	e.dirty = true;
	e.position = Vec3(x,y,z);
	e.scale = Vec3(1,1,1);
	e.rotation = Vec4(0,0,0,1);
	e.local_matrix = Mat4();
	e.world_matrix = Mat4();
	if(parent) entity_set_parent(e, parent);
	return e;
}

function entity_set_active(e, val)
{
	e.active = val;
	var n = e.children.length;
	for(var i = 0; i < n; ++i) entity_set_active(e.children[i], val);
}
function entity_set_parent(e, parent)
{
	if(e.parent === parent) return;
	if(e.parent !== null && parent === null) // clearing parent
	{
		entity_remove_child(parent, e);
		e.parent = null;
	}
	else if(e.parent !== null && parent !== null) // swapping parent
	{
		entity_remove_child(parent, e);
		e.parent = parent;
		entity_add_child(parent, e);
	}
	else // setting new parent from null
	{
		e.parent = parent;
		entity_add_child(parent, e);
	}
}
function entity_add_child(e, child)
{
	e.children.push(child);
}
function remove_child(e, child)
{
	e.children.splice(e.children.indexOf(child, 0), 1);
}
function entity_move_f(e, x,y,z)
{
	e.position[0] += x;
	e.position[1] += y;
	e.position[2] += z;
	e.dirty = true;
}
function entity_rotate_f(e, x,y,z)
{
	var rotation = _Vec4();
	quat_set_euler_f(rotation, x, y, z);
	quat_mul(e.rotation, rotation, e.rotation);
	e.dirty = true;
}
function entity_set_position_f(e, x,y,z)
{
	set_vec3(e.position, x,y,z);
	e.dirty = true;
}
function entity_set_scale_f(e, x,y,z)
{
	set_vec3(e.scale, x,y,z);
	e.dirty = true;
}
function entity_set_rotation_f(e, x,y,z)
{
	quat_set_euler_f(e.rotation, x,y,z);
	e.dirty = true;
}
function entity_set_rotation_v(e, v)
{
	quat_set_euler_f(e.rotation, v[0],v[1],v[2]);
	e.dirty = true;
}

function update_entity(e, force)
{
	mat4_compose(e.local_matrix, e.position, e.scale, e.rotation);
	
	if(e.parent === null) vec_eq(e.world_matrix, e.local_matrix);
	else mat4_mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);

	var n = e.children.length;
	for(var i = 0; i < n; ++i) 
	{
		update_entity(e.children[i], true);
	}

	e.dirty = false;
}
function Camera(near, far, fov, view)
{
	var c = {};
    c.entity = Entity(0,0,0);
	c.projection = Mat4();
	c.view = Mat4();
	c.view_projection = Mat4();
	c.mask = 0;
	c.aspect = 1.0;
	c.near = near;
	c.far = far;
	c.fov = fov;
	c.scale = 1.0;
	update_camera_projection(c, view);
	return c;
}
function update_camera_projection(c, view)
{
	c.aspect = view[2] / view[3];
	perspective_projection(c.projection, c.near, c.far, c.aspect, c.fov);
}
function update_camera(c)
{
	update_entity(c.entity, true);
	mat4_inverse_affine(c.view, c.entity.world_matrix);
	mat4_mul(c.view_projection, c.view, c.projection);
}
function quad_mesh(width, height)
{
	var w = width / 2;
	var h = height / 2;

    var attributes = 
    {
        position: VertexAttribute(2, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
        -w,-h, 0,0,
         w,-h, 1,0,
         w, h, 1,1,
        -w,-h, 0,0,
         w, h, 1,1,
        -w, h, 0,1
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
	return mesh;
}

