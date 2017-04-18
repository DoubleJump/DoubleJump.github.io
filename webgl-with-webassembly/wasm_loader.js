var Module = {};

function init()
{
	var width = document.body.clientWidth;
	var height = 400;
	var canvas = document.querySelector("canvas");
	canvas.width = width;
	canvas.height = height;
	Module.canvas = canvas;

	if(window.WebAssembly !== undefined)
	{
		request_wasm_file('app_wasm.wasm', Module);
	}
	else
	{
		var script = document.createElement('script');
		script.src = "app_asm.js";
		document.body.appendChild(script);
	}
}

function request_wasm_file(url, module)
{
	var r = new XMLHttpRequest();
	r.open('GET', url, true);
	r.responseType = 'arraybuffer';
	r.onload = function() 
	{
		module.wasmBinary = r.response;
		var script = document.createElement('script');
		script.src = "app_wasm.js";
		document.body.appendChild(script);
	};
	r.send();
}

init();
//window.addEventListener('load', init);