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
var E = 2.71828182845904523536028747135266250;
var PI = 3.14159265358979323846264338327950288;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var PI_OVER_360 = 0.00872664625;
var EPSILON = 2.2204460492503131e-16;
var MAX_F32 = 3.4028234e38;

function min(a, b)
{
	if(a < b) return a; return b;
};
function max (a, b)
{
	if(a > b) return a; return b;
};
function round_to(a, f)
{
	return a.toFixed(f);
};
function clamp(a, min, max)
{
	if(a < min) return min;
	else if(a > max) return max;
	else return a;
};
function lerp(a,b,t)
{
	return (1-t) * a + t * b;
};
function distance(ax, ay, bx, by)
{
	var dx = bx - ax;
	var dy = by - ay;
	return Math.sqrt((dx * dx) + (dy * dy));
};
function angle(x,y)
{
	return Math.atan2(y,x) * RAD2DEG + 180;
};

function snap_angle(angle, target)
{
	return Math.floor((angle % 360 + target / 2) / target) * target;
};

function compare_normal(N, R, rotation) 
{ 
	var index = vec3_stack.index;

    var rN = vec3_tmp();
    quat_mul_vec(rN, rotation, N);
    var result = vec_dot(rN, R) * RAD2DEG;

    vec3_stack.index = index;
    return result;
};

var _stacks = [];
var Stack = function(T, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;
	this.stack_frame = new Int32Array(10);
	this.stack_level = 0;

	for(var i = 0; i < count; ++i) this.data.push(new T());

	_stacks.push(this);
	return this;
}
Stack.prototype.push = function()
{
	this.stack_frame[this.stack_level] = this.index;
	this.stack_level++;
}
Stack.prototype.pop = function()
{
	this.index = this.stack_frame[this.stack_level];
	this.stack_level--;
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
		_stacks[i].stack_level = 0;
	}
}
function Time()
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;
    r.now = window.performance.now();
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
function Color(r,g,b,a)
{
	return new Float32Array([r || 0, g || 0, b || 0, a || 1]);
}

var vec3_stack = new Stack(Vec3, 50);

function set_vec3(v, x,y,z)
{
	v[0] = x; v[1] = y; v[2] = z || 0;
}
function set_color(c, r,g,b,a)
{
	c[0] = r; c[1] = g; c[2] = b; c[3] = a;
}

function vec3_tmp(x,y,z)
{
	var r = vec3_stack.get();
	set_vec3(r, x || 0, y || 0, z || 0);
	return r;
}
function vec_add(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b[i];
}
function vec_sub(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b[i];	
}
function vec_mul(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] * b[i];
}
function vec_div(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] / b[i];	
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
	vec_mul_f(r, vec_dot(a,b));
	var sqr_l = vec_sqr_length(r);
	if(sqr_l < 1)
	{
		vec_div_f(r, Math.sqrt(sqr_l));
	}
}
function vec_tangent(r, a,b, plane)
{
	var t = vec3_tmp();
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

	r[0] = v[0] + q[2] * tx + cx,
	r[1] = v[1] + q[2] * ty + cy,
	r[2] = v[2] + q[2] * tz + cz
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
var Quat = function()
{
	return new Float32Array([0,0,0,1]);
}

var quat_stack = new Stack(Quat, 15);

function quat_set(v, x,y,z,w)
{
	v[0] = x;
	v[1] = y;
	v[2] = z;
	v[3] = w;
}
function quat_tmp()
{
	var r = quat_stack.get();
	quat_set(r, 0,0,0,1);
	return r;
}
function quat_mul(r, a,b)
{
	var x = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];
	var y = a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2];
	var z = a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0];
	var w = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];

	quat_set(r, x,y,z,w);
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
	quat_set(r, -q[0],-q[1],-q[2], q[3]);
}
function quat_inverse(r, q)
{
	var t = quat_tmp();
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
	vec3_stack.push();

	var fn = vec_tmp();
	var tn = vec_tmp();
	var c = vec_tmp();

	vec_normalized(fn, from);
	vec_normalized(tn, to);
	vec_cross(c, fn, tn);
		
	var t = quat_tmp();
	t[0] = c[0];
	t[1] = c[1];
	t[2] = c[2];
	t[3] = 1 + vec_dot(fn, tn);

	vec_normalized(r,t);
	vec3_stack.pop();
}

function quat_look_at(r, from, to, forward)
{
	var t = vec_tmp();
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

function quat_n_lerp(r, a,b, t)
{
	r[0] = (1-t) * a[0] + t * b[0];
	r[1] = (1-t) * a[1] + t * b[1];
	r[2] = (1-t) * a[2] + t * b[2];
	r[3] = (1-t) * a[3] + t * b[3];

	vec_normalized(r,r);
}
function Mat3()
{
	return new Float32Array([1,0,0,
							 0,1,0,
							 0,0,1]);
}

var mat3_stack = new Stack(Mat3, 16);

function mat3_tmp()
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
	var t = mat3_tmp();

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
   	for(var i = 0; i < 9; ++i)
   		r[i] = t[i] * idet;
}
function mat3_mul(r, a,b)
{
	var t = mat3_tmp();
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
	var t = mat3_tmp();
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
}

var mat4_stack = new Stack(Mat4, 16);

function mat4_tmp()
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
	var t = mat4_tmp();
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
			quat_set(t, m[1] + m[4], m[8] + m[2], m[6] - m[9]);
		}
		else
		{
			t = 1 - m[0] + m[5] - m[10];
			quat_set(m[1] + m[4], t, m[6] + m[9], m[8] - m[2]);
		}
	}
	else
	{
		if (m[0] < -m[5])
		{
			t = 1 - m[0] - m[5] + m[10];
			quat_set(m[8] + m[2], m[6] + m[9], t, m[1] - m[4]);
		}
		else
		{
			t = 1 + m[0] + m[5] + m[10];
			quat_set(m[6] - m[9], m[8] - m[2], m[1] - m[4], t);
		}
	}

	var rf = quat_tmp();
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
function Rect(x,y,w,h)
{
	return new Float32Array([x,y,w,h]);
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
	var wp = vec3_tmp(); 
    mat4_mul_projection(wp, projection, world);
    r[0] = ((wp[0] + 1.0) / 2.0) * view[2];
    r[1] = ((1.0 - wp[1]) / 2.0) * view[3];
}
function screen_to_view(r, point, view)
{
    r[0] = point[0] / view[2];
    r[1] = 1.0 - (point[1] / view[3]);
    r[2] = point[2];
}
function screen_to_world(r, projection, point, view)
{
    var t = vec3_tmp();
    t[0] = 2.0 * point[0] / view[2] - 1.0;
    t[1] = -2.0 * point[1] / view[3] + 1.0;
    t[2] = point[2];

    var inv = mat4_tmp();
    mat4_inverse(inv, projection);
    mat4_mul_projection(r, inv, t);
}
function world_camera_rect(r, projection, view)
{
    vec3_stack.push();

    var bl  = vec3_tmp();
    var tr  = vec3_tmp(view[2], view[3]);
    var blw = vec3_tmp();
    var trw = vec3_tmp();

    screen_to_world(blw, projection, bl, view);
    screen_to_world(trw, projection, tr, view);

    r[2] = trw[0] - blw[0];
    r[3] = trw[1] - blw[1];

    vec3_stack.pop();
}
function View(x,y,w,h)
{
	var v = {};
	v.width = w;
	v.height = h;
	v.cx = x + (w / 2);
	v.cy = y + (h / 2);
	v.bounds = Rect(x,y,w,h);
	v.aspect = w / h;
	return v;
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
var AssetGroup = function()
{
    var r = {};
    r.cameras = {};
    r.shaders = {};
    r.meshes = {};
    r.animations = {};
    r.entities = {};
    r.materials = {};
    r.curves = {};
    return r;
}
var AssetType = 
{
    SHADER: 0,
    SCENE: 1,
    DDS: 2,
    PVR: 3,
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
                case AssetType.SCENE: { read_scene(assets); break; }
                case AssetType.DDS: { read_dds(assets); break; }
                case AssetType.PVR: { read_pvr(assets); break; }
                case AssetType.END: { complete = true; break; }
                default: { complete = true; }
            }
        }

    end_reader_ctx();
    
    return assets;
}

function read_scene(ag)
{
    var name = read_string();

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
}
function ShaderUniform()
{
    var u = {};
	u.location = -1;
    u.type = -1;
    u.sampler_index = -1;
    u.size = 0;
	return u;
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
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR);
}

function Texture(width, height, data, sampler, format, bytes_per_pixel)
{
	var t = {};
	t.id = null;
	t.index = 0;
	t.data = data;
	t.format = format;
	t.width = width;
	t.height = height;
	t.bytes_per_pixel = bytes_per_pixel;
	t.compressed = false;
	t.from_element = false;
	t.sampler = sampler;
	return t;
}

function texture_from_dom(id, sampler)
{
	var img = document.querySelector(id);
	var t = Texture(img.width, img.height, img, sampler, TextureFormat.RGBA, 4);
	t.from_element = true;
	t.use_mipmaps = true;
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
}
var BufferUpdateRate = 
{
	STATIC: 0,
	DYNAMIC: 1,
	STREAM: 2,
}

function VertexAttribute(size, norm, offset)
{
	var r = {};
	r.size = size;
	r.normalized = norm;
	r.offset = offset;
	return r;
}
function VertexBuffer(data, rate)
{
	var r = {};
	r.id = null;
	r.data = null;
	if(data) r.data = new Float32Array(data);
	r.count = 0;
	r.stride = 0;
	r.attributes = {};
	r.update_rate = rate | BufferUpdateRate.STATIC;
	return r;
}
function IndexBuffer(data, rate)
{
	var r = {};
	r.id = null;
	r.data = null;
	r.count = 0;
	if(data)
	{
		r.data = new Uint32Array(data);
		r.count = r.data.length;
	}
	r.update_rate = rate | BufferUpdateRate.STATIC;
	return r;
}
function Mesh(vb, ib, layout)
{
	var r = {};
	r.vertex_buffer = vb;
	r.index_buffer = ib;
	r.layout = layout | MeshLayout.TRIANGLES;
	return r;
}
function add_vertex_attribute(buffer, name, size, normalized)
{
	buffer.attributes[name] = VertexAttribute(size, normalized, buffer.stride);
	buffer.stride += size;
}
function alloc_vertex_buffer_memory(vb, vertex_count)
{
	vb.data = new Float32Array(vb.stride * vertex_count);		
}
function read_mesh(ag)
{
	var name = read_string();

	var vb_size = read_i32();
	var vb = VertexBuffer(read_f32(vb_size));
	
	var ib = null;
	var ib_size = read_i32();
	if(ib_size > 0)
	{
		ib = IndexBuffer(read_u32(ib_size));
	}

	var num_attributes = read_i32();
	for(var i = 0; i < num_attributes; ++i)
	{
		var attr_name = read_string();
		var attr_size = read_i32();
        var attr_norm = read_boolean();
		add_vertex_attribute(vb, attr_name, attr_size, attr_norm);
	}

	var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    mesh.name = name;
	if(ag) ag.meshes[name] = mesh;
	return mesh;
}
function cube_mesh(width, height, depth)
{
	var x = width  / 2;
	var y = height / 2;
	var z = depth  / 2;

	var vb = VertexBuffer(
	[
		// POS    MASK
		-x,-y, z, 0,
		 x,-y, z, 0,
		 x, y, z, 0,
		-x, y, z, 0,

		-x,-y,-z, 1.1,
		-x, y,-z, 1.1,
		 x, y,-z, 1.1,
		 x,-y,-z, 1.1,

		-x, y,-z, 2.1,
		-x, y, z, 2.1,
		 x, y, z, 2.1,
		 x, y,-z, 2.1,

		-x,-y,-z, 3.1,
		 x,-y,-z, 3.1,
		 x,-y, z, 3.1,
		-x,-y, z, 3.1,

		 x,-y,-z, 4.1,
		 x, y,-z, 4.1,
		 x, y, z, 4.1,
		 x,-y, z, 4.1,

		-x,-y,-z, 5.1,
		-x,-y, z, 5.1,
		-x, y, z, 5.1,
		-x, y,-z, 5.1
	]);

	var ib = IndexBuffer(
	[
		0,  1,  2,  0,  2,  3,
		4,  5,  6,  4,  6,  7,
		8,  9,  10, 8,  10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);
    
    add_vertex_attribute(vb, 'position', 3, false);
    add_vertex_attribute(vb, 'index', 1, false);

    var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
	return mesh;
}
function WebGL(container, options)
{
	var canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    container.appendChild(canvas);

    var GL = canvas.getContext('webgl', options);
    if(!GL)
    {
    	console.error('Webgl not supported');
    	return false;
    }

    if(options.extensions)
    {
    	GL.extensions = {};
	    for(var i = 0; i < options.extensions.length; ++i)
	    {
	    	var name = options.extensions[i];
	    	GL.extensions[name] = get_gl_extension(GL, name);
	    }
    }

    GL.enable(GL.DEPTH_TEST);
	GL.depthFunc(GL.LEQUAL); 
	GL.clearColor(1.0, 1.0, 1.0, 1.0);
	GL.enable(GL.CULL_FACE);
	GL.cullFace(GL.BACK);
	GL.frontFace(GL.CCW);
	GL.enable(GL.SCISSOR_TEST);
	GL.enable(GL.BLEND);
	GL.blendEquation(GL.FUNC_ADD);
	GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

	return GL;
}

function get_gl_extension(GL, ext)
{
	return GL.getExtension('WEBGL_' + ext) ||
		   GL.getExtension('EXT_' + ext) ||
		   GL.getExtension('MOZ_EXT_' + ext) ||
		   GL.getExtension('WEBKIT_EXT_' + ext) ||
		   GL.getExtension('WEBKIT_WEBGL_' + ext) ||
		   GL.getExtension('OES_' + ext);
}

function set_viewport(GL, rect)
{
	var w = rect[2] - rect[0];
	var h = rect[3] - rect[1];
	GL.viewport(rect[0], rect[1], w, h);
	GL.scissor(rect[0], rect[1], w, h);
}

function clear_screen(GL)
{
	GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
}

function set_depth_range(GL, min, max)
{
	GL.depthRange(min, max);
}

function convert_update_rate(GL, type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC: return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM: return GL.STREAM_DRAW;
		default: console.error('Invalid update rate');
	}
}
function convert_mesh_layout(GL, type)
{
	switch(type)
	{
		case MeshLayout.TRIANGLES: return GL.TRIANGLES;
		case MeshLayout.LINES: return GL.LINES;
		default: console.error('Invalid mesh layout');
	}
}

function bind_mesh(GL, mesh)
{
	mesh.vertex_buffer.id = GL.createBuffer();
	if(mesh.index_buffer) mesh.index_buffer.id = GL.createBuffer();
	update_mesh(GL, mesh);
}
function update_mesh(GL, mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	var rate = convert_update_rate(GL, vb.update_rate);

	vb.count = vb.data.length / vb.stride;
	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, rate);

	if(ib !== null)
	{
		rate = convert_update_rate(GL, vb.update_rate);

		ib.count = ib.data.length;
		ib.byte_size = GL.UNSIGNED_INT;
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ib.id);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, rate);
	}

	GL.bindBuffer(GL.ARRAY_BUFFER, null);
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
}

function convert_texture_format(GL, format)
{
	switch(format)
	{
		case TextureFormat.RGBA: return GL.RGBA;
		case TextureFormat.DEPTH: return GL.DEPTH_COMPONENT;
		default: console.error('Invalid texture format');
	}
}
function bind_texture(GL, texture, index)
{
	texture.id = GL.createTexture();
	texture.index = index;
	update_texture(GL, texture, index);
}
function update_texture(GL, t, index)
{
	//if(index) 
	//{
		GL.activeTexture(GL.TEXTURE0 + t.index);
	//}

	GL.bindTexture(GL.TEXTURE_2D, t.id);
	var size = GL.UNSIGNED_BYTE;
	var format = convert_texture_format(GL, t.format);

	if(t.from_element === true)
	{
		GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
		GL.texImage2D(GL.TEXTURE_2D, 0, format, format, size, t.data);
	}
	else if(t.compressed === true)
	{
		GL.compressedTexImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, t.data);
	}
	else
	{
		if(format === GL.DEPTH_COMPONENT) size = GL.UNSIGNED_SHORT;
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

	/*
	GL.texParameterf(GL.TEXTURE_2D, 
					 GL.extensions.texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, 
					 sampler.anisotropy);
	*/
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
        GL.enableVertexAttribArray(attr);
    }

    n =  GL.getProgramParameter(s.id, GL.ACTIVE_UNIFORMS);
    var sampler_index = 0;
    for(var i = 0; i < n; ++i)
    {
        var active_uniform = GL.getActiveUniform(s.id, i);
        var uniform = ShaderUniform();
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

function set_shader_attributes(GL, shader, mesh)
{
	var vb = mesh.vertex_buffer;
	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);

	for(var k in shader.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        ASSERT(va !== undefined, 
            'Shader ' + shader.name + ' needs attribute ' + k + ' but mesh ' + mesh.name + ' does not have it');
        if(sa === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
	}
}

function use_shader(GL, shader)
{
    GL.useProgram(shader.id);
}

function set_shader_uniform(GL, uniform, value)
{
    if(uniform === undefined) return;
	var loc = uniform.location;

	switch(uniform.type)
	{
		case GL.FLOAT: 
        {
			GL.uniform1f(loc, value);
			break;
		}
		case GL.FLOAT_VEC2:
		{
			GL.uniform2f(loc, value[0], value[1]);
			break;
		}
        case GL.FLOAT_VEC3:
        {
			GL.uniform3f(loc, value[0], value[1], value[2]);
			break;
		}
        case GL.FLOAT_VEC4:
        {
			GL.uniform4f(loc, value[0], value[1], value[2], value[3]);
			break;
		}
        case GL.BOOL:
        {
        	if(value === true) GL.uniform1i(loc, 1);
        	else GL.uniform1i(loc, 0);
        	break;
        }
        case GL.FLOAT_MAT2:
        {
        	GL.uniformMatrix2fv(loc, false, value);
        	break;
        }
        case GL.FLOAT_MAT3:
        {
			GL.uniformMatrix3fv(loc, false, value);
			break;
		}
        case GL.FLOAT_MAT4:
        {
			GL.uniformMatrix4fv(loc, false, value);
			break;
		}
        case GL.SAMPLER_2D:
        {

        	//if(uniform.size > 1)
        	//{
        		/*
        		for(var i = 0; i < uniform.size; ++i)
        		{
        			GL.activeTexture(GL.TEXTURE0 + value[i]);
					GL.bindTexture(GL.TEXTURE_2D, state.textures[i].id); //HACK
        		}
        		*/
        	//	GL.uniform1iv(loc, value); // this has to take an array of ids
        		
        	//}
        	//else
			//{
				GL.uniform1i(loc, uniform.sampler_index);
				GL.activeTexture(GL.TEXTURE0 + uniform.sampler_index);
				GL.bindTexture(GL.TEXTURE_2D, value.id);
			//}
			break;
		}
        case GL.SAMPLER_CUBE:
        {
        	break;
        }
        case GL.INT:
        {
			GL.uniform1i(loc, value);
			break;
		}
		case GL.INT_VEC2:
        {
        	GL.uniform2i(loc, value[0], value[1]);
        	break;
        }
        case GL.INT_VEC3:
        {
        	GL.uniform3i(loc, value[0], value[1], value[2]);
        	break;
        }
        case GL.INT_VEC4:
        {
        	GL.uniform4i(loc, value[0], value[1], value[2], value[3]);
        	break;
        }
		default:
		{
			console.error(uniform.type + ' is an unsupported uniform type');
		}
	}
}


function draw_mesh(GL, mesh)
{
	var layout = convert_mesh_layout(GL, mesh.layout);
	
	if(mesh.index_buffer !== null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
    	//GL.drawElements(layout, mesh.index_buffer.count, mesh.index_buffer.byte_size, 0);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
    	//GL.drawElements(GL.TRIANGLES, 36, GL.UNSIGNED_INT, 0);
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

function bind_render_target(GL, t)
{
	bind_texture(GL, t.color);
	bind_texture(GL, t.depth);

	t.frame_buffer = GL.createFramebuffer();
	GL.bindFramebuffer(GL.FRAMEBUFFER, t.frame_buffer);

	set_render_target_attachment(GL, GL.COLOR_ATTACHMENT0, t.color);
	set_render_target_attachment(GL, GL.DEPTH_ATTACHMENT, t.depth);

	//DEBUG
	verify_render_target(GL);
	//END	
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
		//GL.bindRenderbuffer(GL.RENDERBUFFER, target.render_buffer);
		set_viewport(GL, target.view.bounds);
	}
}


//DEBUG

function verify_webgl_context(GL)
{
	if(GL.isContextLost()) console.error('GL context lost');
}

function verify_render_target(GL)
{
	var status = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
	if(status != GL.FRAMEBUFFER_COMPLETE)
	{
		console.error('Error creating framebuffer: ' +  status);
	}
}

function log_webgl_info(GL)
{
	console.log("Shader High Float Precision: " + GL.getShaderPrecisionFormat(GL.FRAGMENT_SHADER, GL.HIGH_FLOAT));
	console.log("AA Size: " + GL.getParameter(GL.SAMPLES));
	console.log("Max Texture Size: " + GL.getParameter(GL.MAX_TEXTURE_SIZE) + "px");
	console.log("Max Cube Map Size: " + GL.getParameter(GL.MAX_CUBE_MAP_TEXTURE_SIZE) + "px");
	console.log("Max Render Buffer Size: " + GL.getParameter(GL.MAX_RENDERBUFFER_SIZE) + "px");
	console.log("Max Vertex Shader Texture Units: " + GL.getParameter(GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
	console.log("Max Fragment Shader Texture Units: " + GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS));
	console.log("Max Combined Texture Units: " + GL.getParameter(GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
	console.log("Max Vertex Shader Attributes: " + GL.getParameter(GL.MAX_VERTEX_ATTRIBS));
	console.log("Max Vertex Uniform Vectors: " + GL.getParameter(GL.MAX_VERTEX_UNIFORM_VECTORS));
	console.log("Max Frament Uniform Vectors: " + GL.getParameter(GL.MAX_FRAGMENT_UNIFORM_VECTORS));
	console.log("Max Varying Vectors: " + GL.getParameter(GL.MAX_VARYING_VECTORS));

	var supported_extensions = GL.getSupportedExtensions();
	for(var i = 0; i < supported_extensions.length; ++i)
	{
		console.log(supported_extensions[i]);
	}
}
//END
function Entity(x,y,z)
{
	var e = {};
	e.name;
	e.id;
	e.parent = null;
	e.children = [];
	e.active = true;
	e.layer = 0;
	e.dirty = true;
	e.position = Vec3(x,y,z);
	e.scale = Vec3(1,1,1);
	e.rotation = Quat();
	e.local_matrix = Mat4();
	e.world_matrix = Mat4();
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
	var rotation = quat_tmp();
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
	if(force === true || e.dirty === true)
	{
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
	}
}
function Camera(near, far, fov, view)
{
	var c = {};
    c.entity = Entity(0,0,2);
	c.projection = Mat4();
	c.view = Mat4();
	c.view_projection = Mat4();
	c.normal = Mat3();
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
	c.aspect = view.width / view.height;
	perspective_projection(c.projection, c.near, c.far, c.aspect, c.fov);
}
function update_camera(c)
{
	update_entity(c.entity, true);
	mat4_inverse_affine(c.view, c.entity.world_matrix);
	mat4_mul(c.view_projection, c.view, c.projection);

	mat3_from_mat4(c.normal, c.view);
	mat3_inverse(c.normal, c.normal);
	mat3_transposed(c.normal, c.normal);
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
	g.rotation = Quat();
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
	return t;
}
function GamePad()
{
	var g = {};
	return g;
}

var input;
function Input()
{
	var r = {};
	
	if(is_touch_device() === true)
	{
		r.touches = [];
		r.MAX_TOUCHES = 5;
		for(var i = 0; i < r.MAX_TOUCHES; ++i) r.touches[i] = Touch();

		window.addEventListener("touchstart",  on_touch_start, false);
	  	window.addEventListener("touchmove", on_touch_move, false);
	  	window.addEventListener("touchend", on_touch_end, false);

	  	r.gyro = Gyro();
		window.addEventListener('devicemotion', on_device_motion);
		window.addEventListener('deviceorientation', on_device_rotation);
	}
	else
	{
		r.mouse = Mouse();
		r.keys = new Uint8Array(256);

		window.addEventListener('keydown', on_key_down);
		window.addEventListener('keyup', on_key_up);
		window.addEventListener('mouseup', on_key_up);
		window.addEventListener('mousedown', on_key_down);
		window.addEventListener('mousemove', on_mouse_move);
		window.addEventListener('wheel', on_mouse_wheel);
	}

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
	set_vec3(input.mouse.position, e.clientX, e.clientY, 0);
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
}
function on_device_rotation(e)
{
	quat_set_euler_f(input.gyro.rotation, e.beta, e.gamma, e.alpha);
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
			break;
		}
	}
	e.preventDefault();
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
				var dx = x - t.last_position[0];
				var dy = y - t.last_position[1];
				set_vec3(t.position, x, y, 0);
				set_vec3(t.delta, dx,dy,0);
				set_vec3(t.last_position, x,y);
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
				break;
			}
		}
	}
	e.preventDefault();
}
function on_image_load(e)
{
	LOG(e.target);
	state.textures[state.image_load_count] = e.target;
	state.image_load_count++;
	if(state.image_load_count === 6)
	{
		request_asset('assets.bin', init);
	}
}

function preload()
{
	// load images

	var names = 
	[
		'camp fire',
		'stars',
		'beach',
		'falcon 9',
		'lake',
		'forest'
	];

	state.textures = [];
	state.image_load_count = 0;

	for(var i = 1; i < 7; ++i)
	{
		var img = new Image(1920,1080);
		img.src = 'img/hero' + i + '.jpg';
		img.name = names[i-1];
		img.style.display = 'none';
		img.onload = on_image_load;
	}
}

function init(e)
{
	// window focus

	window.addEventListener('focus', function(){ console.log('FOCUS'); state.has_focus = true; });
	window.addEventListener('blur', function(){ console.log('BLUR'); state.has_focus = false; });
	state.has_focus = true;


	// setup canvas container

	var window_width = document.body.clientWidth;
	var window_height = document.body.clientHeight;
	var width = 1920;
	var height = 1080;

	if(window_width < 1920) width = window_width;
	if(window_height < 1080) height = window_height;

	var container = document.createElement('div');
	container.classList.add('gl-canvas');
	document.body.appendChild(container);


	// image title text

	var text = document.createElement('div');
	text.classList.add('img-text');
	text.innerHTML = 'camp fire';
	document.body.appendChild(text);
	state.image_text = text;

	var assets = read_asset_file(e.target.response);

	state.time = Time();
	state.input = Input();
	state.view = View(0,0,width,height);
	state.GL = WebGL(container, 
	{
		width: width,
		height: height,
    	antialias: true,
    	extensions: ["element_index_uint"] 
    });

    var GL = state.GL;

	// cube entity, mesh and normals

	state.cube_entity = Entity(0,0,0);
	entity_rotate_f(state.cube_entity, 30,30,30);

	state.cube_mesh = cube_mesh(1,1,1);
	bind_mesh(state.GL, state.cube_mesh);

	state.normals = 
	[
		Vec3( 0, 0, 1),
		Vec3( 0, 0,-1),
		Vec3( 0, 1, 0),
		Vec3( 0,-1, 0),
		Vec3( 1, 0, 0),
		Vec3(-1, 0, 0),
	];


	// upload images to webgl

	state.sampler = default_sampler(GL);

	for(var i = 0; i < state.textures.length; ++i)
	{
		var img = state.textures[i];
		var t = Texture(img.width, img.height, img, state.sampler, TextureFormat.RGBA, 4);
		t.from_element = true;
		t.use_mipmaps = false;
		t.name = img.name;
		bind_texture(GL, t, i);
		state.textures[i] = t;
	}


	// cube shader

	state.cube_shader = assets.shaders.cube_mask;
	bind_shader(GL, state.cube_shader);
	use_shader(GL, state.cube_shader);
	set_shader_attributes(GL, state.cube_shader, state.cube_mesh);

	for(var i = 0; i < state.textures.length; ++i)
	{
		set_shader_uniform(GL, state.cube_shader.uniforms['image_' + i], state.textures[i]);
	}
	set_shader_uniform(GL, state.cube_shader.uniforms.resolution, [width, height]);


	// camera

	state.camera = Camera(0, 100, 10, state.view);
	entity_set_position_f(state.camera.entity, 0,0,20);


	state.spin = Vec3(0,0,0);
	state.expanded = false;
	state.src_rotation = Quat();
	state.target_rotation = Quat();
	state.target_ease_time = 0.0;
	state.angle_delta = 0;
	state.from_image_index = 0;
	state.to_image_index = 0;

	requestAnimationFrame(update);
}

function update(t)
{
	requestAnimationFrame(update);
	set_time(state.time, t);

	if(state.time.paused === true || state.has_focus === false || state.allow_update === false) return;

	var dt = state.time.dt;
	var GL = state.GL;
	var mouse = state.input.mouse;
	

	// figure out which face of the cube is pointing towards the camera

	for(var i = 0; i < state.textures.length; ++i)
	{
		var angle = compare_normal(state.normals[i], vec3_tmp(0,0,1), state.cube_entity.rotation);
		if(angle > 40) 
		{
			if(i !== state.to_image_index)
			{
				state.from_image_index = state.to_image_index;
				state.to_image_index = i;
				state.image_text.innerHTML = state.textures[i].name;
			}
			break;
		}
	}
	
	// poll input

	var expand_input   = (key_down(Keys.SPACE) || mouse.scroll < -1);
	var contract_input = (key_down(Keys.SPACE) || mouse.scroll > 1);
	if(expand_input || contract_input) state.input_idle_time = 0;

	var can_expand   = expand_input   === true && state.expanded === false;
	var can_contract = contract_input === true && state.expanded === true;

	if(can_expand === true)
	{
		state.image_text.classList.add('expanded');

		// stop the cube from spinning

		state.spin[0] = 0;
		state.spin[1] = 0;

		// record the cube's current rotation for animation purposes

		vec_eq(state.src_rotation, state.cube_entity.rotation);

		// get the cube rotation in euler angles and snap them to closest 90 degrees

		var angles = vec3_tmp();
		quat_get_euler(angles, state.cube_entity.rotation);

		var x = snap_angle(angles[0], 90);
		var y = snap_angle(angles[1], 90);
		var z = snap_angle(angles[2], 90);

		var dx = Math.abs(x - angles[0]);
		var dy = Math.abs(y - angles[1]);
		var dz = Math.abs(z - angles[2]);

		quat_set_euler_f(state.target_rotation, x,y,z);

		// find out which axis is furthest from our target rotation so we
		// know how much time to allow for the expansion animation to complete

		state.angle_delta = dx;
		if(dy > dx) state.angle_delta = dy;
		if(dz > dy) state.angle_delta = dz;

		state.angle_delta = (state.angle_delta / 360) * 5.0;
		state.angle_delta = clamp(state.angle_delta, 0,0.5);

		// reset the expansion animation timer

		state.target_ease_time = 0;
		state.expanded = true;
	}

	if(can_contract === true)
	{
		state.image_text.classList.remove('expanded');
		state.target_ease_time = 0;
		state.expanded = false;
	}	

	if(state.expanded === true)
	{
		// increment the animation timer

		state.target_ease_time += dt;
		state.target_ease_time = clamp(state.target_ease_time, 0,1);

		// interpolate the rotation towards the target

		var rt = clamp(state.target_ease_time * 3, 0,1);
		quat_slerp(state.cube_entity.rotation, state.src_rotation, state.target_rotation, rt); 

		// interpolate the scale to fill the screen

		vec_lerp(state.cube_entity.scale, state.cube_entity.scale, vec3_tmp(6,6,6), clamp(state.target_ease_time - state.angle_delta, 0.0,1.0));
	}
	else
	{
		// rotate the cube when dragging with the mouse

		var SPIN_RATE = 2.0;
		if(key_held(Keys.MOUSE_LEFT))
		{
			state.input_idle_time = 0;
			state.spin[0] += mouse.delta[0] * SPIN_RATE * dt;
			state.spin[1] += mouse.delta[1] * SPIN_RATE * dt;
		}

		// friction to slow the cube's rotation down
		
		state.spin[0] *= 0.90;
		state.spin[1] *= 0.90;
		
		entity_rotate_f(state.cube_entity, state.spin[1], state.spin[0], 0);

		// if input has been idle for 5 seconds start pulsing the cube

		state.input_idle_time += dt * 0.2;
		state.input_idle_time = clamp(state.input_idle_time, 0,1);

		state.target_ease_time += dt;
		if(state.target_ease_time > 1.0)
		{
			var cs = 1;

			if(state.time.st > 0) cs = lerp(state.cube_entity.scale[0], 1.1, dt);
			else  cs = lerp(state.cube_entity.scale[0], 1.0, dt);

			set_vec3(state.cube_entity.scale, cs,cs,cs);
		}

		// shrink the cube down normal size

		else
		{
			vec_lerp(state.cube_entity.scale, state.cube_entity.scale, vec3_tmp(1,1,1), state.target_ease_time);
		}

	}

	update_camera(state.camera);
	update_entity(state.cube_entity, true);

	clear_screen(GL);

	// DRAW CUBE
	
	var shader = state.cube_shader;
	use_shader(GL, shader);
	set_shader_uniform(GL, shader.uniforms.view_projection, state.camera.view_projection);
	set_shader_uniform(GL, shader.uniforms.model, state.cube_entity.world_matrix);
	draw_mesh(GL, state.cube_mesh);

	update_input();
	clear_stacks();
}

var state = {};

window.addEventListener('load', preload);
