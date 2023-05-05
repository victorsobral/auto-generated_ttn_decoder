//From: https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-javascript-objects

Object.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};


// Object.unflatten = function(data) {
//     "use strict";
//     if (Object(data) !== data || Array.isArray(data))
//         return data;
//     var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
//         resultholder = {};
//     for (var p in data) {
//         var cur = resultholder,
//             prop = "",
//             m;
//         while (m = regex.exec(p)) {
//             cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
//             prop = m[2] || m[1];
//         }
//         cur[prop] = data[p];
//     }
//     return resultholder[""] || resultholder;
// };



// Struct JS functions (adapted from source: https://github.com/lyngklip/structjs)

const rechk = /^([<>])?(([1-9]\d*)?([xcbB?hHiIfdsp]))*$/
const refmt = /([1-9]\d*)?([xcbB?hHiIfdsp])/g
const str = (v,o,c) => String.fromCharCode(
    ...new Uint8Array(v.buffer, v.byteOffset + o, c))
const rts = (v,o,c,s) => new Uint8Array(v.buffer, v.byteOffset + o, c)
    .set(s.split('').map(str => str.charCodeAt(0)))
const pst = (v,o,c) => str(v, o + 1, Math.min(v.getUint8(o), c - 1))
const tsp = (v,o,c,s) => { v.setUint8(o, s.length); rts(v, o + 1, c - 1, s) }
const lut = le => ({
    x: c=>[1,c,0],
    c: c=>[c,1,o=>({u:v=>str(v, o, 1)      , p:(v,c)=>rts(v, o, 1, c)     })],
    '?': c=>[c,1,o=>({u:v=>Boolean(v.getUint8(o)),p:(v,B)=>v.setUint8(o,B)})],
    b: c=>[c,1,o=>({u:v=>v.getInt8(   o   ), p:(v,b)=>v.setInt8(   o,b   )})],
    B: c=>[c,1,o=>({u:v=>v.getUint8(  o   ), p:(v,B)=>v.setUint8(  o,B   )})],
    h: c=>[c,2,o=>({u:v=>v.getInt16(  o,le), p:(v,h)=>v.setInt16(  o,h,le)})],
    H: c=>[c,2,o=>({u:v=>v.getUint16( o,le), p:(v,H)=>v.setUint16( o,H,le)})],
    i: c=>[c,4,o=>({u:v=>v.getInt32(  o,le), p:(v,i)=>v.setInt32(  o,i,le)})],
    I: c=>[c,4,o=>({u:v=>v.getUint32( o,le), p:(v,I)=>v.setUint32( o,I,le)})],
    f: c=>[c,4,o=>({u:v=>v.getFloat32(o,le), p:(v,f)=>v.setFloat32(o,f,le)})],
    d: c=>[c,8,o=>({u:v=>v.getFloat64(o,le), p:(v,d)=>v.setFloat64(o,d,le)})],
    s: c=>[1,c,o=>({u:v=>str(v,o,c), p:(v,s)=>rts(v,o,c,s.slice(0,c    ) )})],
    p: c=>[1,c,o=>({u:v=>pst(v,o,c), p:(v,s)=>tsp(v,o,c,s.slice(0,c - 1) )})]
})
const errbuf = new RangeError("Structure larger than remaining buffer")
const errval = new RangeError("Not enough values for structure")
function struct(format) {
    let fns = [], size = 0, m = rechk.exec(format)
    if (!m) { throw new RangeError("Invalid format string") }
    const t = lut('<' === m[1]), lu = (n, c) => t[c](n ? parseInt(n, 10) : 1)
    while ((m = refmt.exec(format))) { ((r, s, f) => {
        for (let i = 0; i < r; ++i, size += s) { if (f) {fns.push(f(size))} }
    })(...lu(...m.slice(1)))}
    const unpack_from = (arrb, offs) => {
        if (arrb.byteLength < (offs|0) + size) { throw errbuf }
        let v = new DataView(arrb, offs|0)
        return fns.map(f => f.u(v))
    }
    const unpack = arrb => unpack_from(arrb, 0)
    return Object.freeze({
        unpack, unpack_from, format, size})
};


const js_header = `
// Struct JS functions (adapted from source: https://github.com/lyngklip/structjs)

const rechk = /^([<>])?(([1-9]\\d*)?([xcbB?hHiIfdsp]))*$/
const refmt = /([1-9]\\d*)?([xcbB?hHiIfdsp])/g
const str = (v,o,c) => String.fromCharCode(
    ...new Uint8Array(v.buffer, v.byteOffset + o, c))
const rts = (v,o,c,s) => new Uint8Array(v.buffer, v.byteOffset + o, c)
    .set(s.split('').map(str => str.charCodeAt(0)))
const pst = (v,o,c) => str(v, o + 1, Math.min(v.getUint8(o), c - 1))
const tsp = (v,o,c,s) => { v.setUint8(o, s.length); rts(v, o + 1, c - 1, s) }
const lut = le => ({
    x: c=>[1,c,0],
    c: c=>[c,1,o=>({u:v=>str(v, o, 1)      , p:(v,c)=>rts(v, o, 1, c)     })],
    '?': c=>[c,1,o=>({u:v=>Boolean(v.getUint8(o)),p:(v,B)=>v.setUint8(o,B)})],
    b: c=>[c,1,o=>({u:v=>v.getInt8(   o   ), p:(v,b)=>v.setInt8(   o,b   )})],
    B: c=>[c,1,o=>({u:v=>v.getUint8(  o   ), p:(v,B)=>v.setUint8(  o,B   )})],
    h: c=>[c,2,o=>({u:v=>v.getInt16(  o,le), p:(v,h)=>v.setInt16(  o,h,le)})],
    H: c=>[c,2,o=>({u:v=>v.getUint16( o,le), p:(v,H)=>v.setUint16( o,H,le)})],
    i: c=>[c,4,o=>({u:v=>v.getInt32(  o,le), p:(v,i)=>v.setInt32(  o,i,le)})],
    I: c=>[c,4,o=>({u:v=>v.getUint32( o,le), p:(v,I)=>v.setUint32( o,I,le)})],
    f: c=>[c,4,o=>({u:v=>v.getFloat32(o,le), p:(v,f)=>v.setFloat32(o,f,le)})],
    d: c=>[c,8,o=>({u:v=>v.getFloat64(o,le), p:(v,d)=>v.setFloat64(o,d,le)})],
    s: c=>[1,c,o=>({u:v=>str(v,o,c), p:(v,s)=>rts(v,o,c,s.slice(0,c    ) )})],
    p: c=>[1,c,o=>({u:v=>pst(v,o,c), p:(v,s)=>tsp(v,o,c,s.slice(0,c - 1) )})]
})
const errbuf = new RangeError("Structure larger than remaining buffer")
const errval = new RangeError("Not enough values for structure")
function struct(format) {
    let fns = [], size = 0, m = rechk.exec(format)
    if (!m) { throw new RangeError("Invalid format string") }
    const t = lut('<' === m[1]), lu = (n, c) => t[c](n ? parseInt(n, 10) : 1)
    while ((m = refmt.exec(format))) { ((r, s, f) => {
        for (let i = 0; i < r; ++i, size += s) { if (f) {fns.push(f(size))} }
    })(...lu(...m.slice(1)))}
    const unpack_from = (arrb, offs) => {
        if (arrb.byteLength < (offs|0) + size) { throw errbuf }
        let v = new DataView(arrb, offs|0)
        return fns.map(f => f.u(v))
    }
    const unpack = arrb => unpack_from(arrb, 0)
    return Object.freeze({
        unpack, unpack_from, format, size})
};


	`

function generate_decoder(decode_inst){

	let js_code = `
function decodeUplink(input) {

	let buf = new ArrayBuffer(input.bytes.length);
	let bufView = new Uint8Array(buf);
	for (let i=0, inputLen=input.bytes.length; i<inputLen; i++) {
		bufView[i] = input.bytes[i];
	}`

	const field_fmt = /([\<\>]?)([a-zA-Z]{1})\[([\d]+)\]/;
	const variables_fmt = /([\<\>]?)([a-zA-Z]{1})\[([\d]+)\]/g;

	for (let i = 0; i < decode_inst.length; i++) {

		special_condition = Boolean("?" in decode_inst[i]);

		if (special_condition) {


			let condition_variables = [ ...new Set(decode_inst[i]["?"].match(variables_fmt))];
			let condition = decode_inst[i]["?"]

			for (let j = 0; j < condition_variables.length; j++){
				[cond_str,cond_endianess,cond_fmt,cond_start] = field_fmt.exec(decode_inst[i]["?"]);
				condition = (condition).replace("$"+cond_str,"cond"+i.toString()+"_var"+j.toString());
				js_code+=`
	let cond${i.toString()}_var${j.toString()} = struct(\"${cond_endianess+cond_fmt}\").unpack_from(buf,${cond_start});`

			}
			js_code+=`
	if (${condition}) {`

			delete decode_inst[i]["?"];


		}


		json_map  = JSON.stringify(decode_inst[i], null, 2);


		let flattened_json = Object.flatten(decode_inst[i]);
		for (let field in flattened_json) {
				param_format = field_fmt.exec(flattened_json[field]);
				if (param_format){
					json_map = json_map.replace("\""+flattened_json[field]+"\"",flattened_json[field]);
				}
		}

		js_code+=`
		const payload = [];`

		let format_variables = [ ...new Set(json_map.match(variables_fmt))];
		for (let j = 0; j < format_variables.length; j++){	
			var re_var = RegExp(("\\$"+format_variables[j]).replace("[","\\[").replace("]","\\]"),"g")
			json_map = json_map.replace(re_var,`payload[${j}][0]`);
			[param_str,param_endianess,param_fmt,param_start] = field_fmt.exec("$"+format_variables[j]);
			js_code+=`
		payload.push(struct(\"${param_endianess+param_fmt}\").unpack_from(buf,${param_start}));`
		}
		js_code+=`
		return {
				data: ${json_map}
				};`

		if (special_condition) {
			js_code+=`
	}`
		}	
	

	}
	js_code+=`
}`
	return js_header+js_code;
}


test_input = [
{
  "battery_voltage": {
    "displayName": "Battery voltage",
    "unit": "V",
    "value": "($<H[1]*3.3)/1000"
  },
  "device_id": 5100,
  "pressure": {
    "displayName": "Pressure",
    "unit": "bar",
    "value":"$<f[3]+$<f[7]"
  },
  "protocol_version": "$B[0]",
  "temperature": {
    "displayName": "Temperature",
    "unit": "\u00B0C",
    "value": "$<f[7]"
  },
  "?":"$B[0]==3"
},

{
  "battery_voltage": {
    "displayName": "Battery voltage",
    "unit": "V",
    "value": "($<H[1]*3.3)/1000"
  },
  "device_id": 5100,
  "protocol_version": "$B[0]",
  "?":"$B[0]<=2"
},

{
  "battery_voltage": {
    "displayName": "Battery voltage",
    "unit": "V",
    "value": "($<H[1]*3.3)/1000"
  },
  "device_id": 5100,
  "pressure": {
    "displayName": "Pressure",
    "unit": "bar",
    "value":"$<f[3]"
  }
}
];

console.log(generate_decoder(test_input));


