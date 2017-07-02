/*!
 * VERSION: 0.0.1
 * DATE: 2016-09-29
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 **/
var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push( function() {

	"use strict";

	_gsScope._gsDefine("easing.CustomBounce", ["easing.CustomEase"], function(CustomEase) {


		var _normalizeX = function (a) { //scales all the x values in an array [x, y, x, y...] AND rounds them to the closest hundredth (decimal)
				var l = a.length,
					s = 1 / a[l - 2],
					rnd = 1000,
					i;
				for (i = 2; i < l; i += 2) {
					a[i] = ((a[i] * s * rnd) | 0) / rnd;
				}
				a[l - 2] = 1; //in case there are any rounding errors. x should always end at 1.
			},

			CustomBounce = function(name, vars) {
				vars = vars || {};
				var max = 0.999,
					decay = Math.min(max, vars.strength || 0.7),  // Math.min(0.999, 1 - 0.3 / (vars.strength || 1)),
					decayX = decay,
					gap = (vars.squash || 0) / 100,
					originalGap = gap,
					slope = 1 / 0.03,
					w = 0.2,
					h = 1,
					prevX = 0.1,
					path = [0, 0, 0.07, 0, 0.1, 1, 0.1, 1],
					squishPath = [0, 0, 0, 0, 0.1, 0, 0.1, 0],
					cp1, cp2, x, y, i, nextX, squishMagnitude;
				for (i = 0; i < 200; i++) {
					w *= decayX * ((decayX + 1) / 2);
					h *= decay * decay;
					nextX = prevX + w;
					x = prevX + w * 0.49;
					y = 1 - h;
					cp1 = prevX + h / slope;
					cp2 = x + (x - cp1) * 0.8;

					if (gap) {
						prevX += gap;
						cp1 += gap;
						x += gap;
						cp2 += gap;
						nextX += gap;
						squishMagnitude = gap / originalGap;
						squishPath.push(
							prevX - gap, 0,
							prevX - gap, squishMagnitude,
							prevX - gap / 2, squishMagnitude, //center peak anchor
							prevX, squishMagnitude,
							prevX, 0,
							prevX, 0, //base anchor
							prevX, squishMagnitude * -0.6,
							(nextX + prevX + prevX) / 3, 0,
							nextX, 0
						);
						path.push(prevX - gap, 1,
							prevX, 1,
							prevX, 1);
						gap *= decay * decay;
					}

					path.push(prevX, 1,
						cp1, y,
						x, y,
						cp2, y,
						nextX, 1,
						nextX, 1);

					decay *= 0.95;
					slope = h / (nextX - cp2);
					prevX = nextX;
					if (y > max) {
						break;
					}
				}

				if (gap) {
					_normalizeX(squishPath);
					squishPath[2] = "C" + squishPath[2];
					this.squash = new CustomEase(vars.squashName || (name + "-squash"), "M" + squishPath.join(","));
				}

				_normalizeX(path);
				path[2] = "C" + path[2];
				CustomEase.call(this, name, "M" + path.join(","));
				this.bounce = this;
			},
			p;

		CustomBounce.prototype = p = new CustomEase("-", "0,0,1,1");
		p.constructor = CustomBounce;

		CustomBounce.create = function (name, vars) {
			return new CustomBounce(name, vars);
		};

		CustomBounce.version = "0.0.1";

		return CustomBounce;

	}, true);


}); if (_gsScope._gsDefine) { _gsScope._gsQueue.pop()(); }

//export to AMD/RequireJS and CommonJS/Node (precursor to full modular build system coming at a later date)
(function(name) {
	"use strict";
	var getGlobal = function() {
		return (_gsScope.GreenSockGlobals || _gsScope)[name];
	};
	if (typeof(define) === "function" && define.amd) { //AMD
		define(["TweenLite", "CustomEase"], getGlobal);
	} else if (typeof(module) !== "undefined" && module.exports) { //node
		require("./CustomEase.js");
		require("../TweenLite.js");
		module.exports = getGlobal();
	}
}("CustomBounce"));