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


const decoding_type1 = {
	variables: [['protocol_version', 'B'], ['voltage', 'H'], ['pressure', 'f'], ['temperature','f']],
	endianess: 'little-endian',
	json_map:`{
			      "battery_voltage": {
			        "displayName": "Battery voltage",
			        "unit": "V",
			        "value": ($voltage*3.3)/1000
			      },
			      "device_id": 5100,
			      "pressure": {
			        "displayName": "Pressure",
			        "unit": "bar",
			        "value":$pressure
			      },
			      "protocol_version": $protocol_version,
			      "temperature": {
			        "displayName": "Temperature",
			        "unit": "\u00B0C",
			        "value": $temperature
			      }
			}`,
	condition:'$protocol_version==3'
};


const decoding_type2 = {
	variables: [['protocol_version', 'B'], ['voltage', 'H']],
	endianess: 'little-endian',
	json_map:`{
			      "battery_voltage": {
			        "displayName": "Battery voltage",
			        "unit": "V",
			        "value": ($voltage*3.3)/1000
			      },
			      "protocol_version": $protocol_version

			}`,
	condition:'$protocol_version<=2'
};


const decoding_type3 = {
	variables: [['protocol_version', 'B'], ['voltage', 'H'], ['pressure', 'f']],
	endianess: 'little-endian',
	json_map:`{
			      "battery_voltage": {
			        "displayName": "Battery voltage",
			        "unit": "V",
			        "value": ($voltage*3.3)/1000
			      },
			      "device_id": 5100,
			      "pressure": {
			        "displayName": "Pressure",
			        "unit": "bar",
			        "value": $pressure
			      },
			      "protocol_version": $protocol_version
			}`,
	condition:'default'
};

const decoding_types = [decoding_type1, decoding_type2, decoding_type3];

function generate_decoder(decoding_types){

	let js_code = `
function decodeUplink(input) {
	`
	for (let i = 0; i < decoding_types.length; i++) {

		pack_variables = decoding_types[i].variables.map(variables => variables[0]);
		pack_endianess = (decoding_types[i].endianess).replace('big-endian','>').replace('little-endian','<');
		pack_format =  pack_endianess+(decoding_types[i].variables.map(variables => variables[1])).join('');
		pack_size = struct(pack_format).size;
		pack_json = decoding_types[i].json_map;
		pack_condition = decoding_types[i].condition;
		
		for (let j = 0; j < pack_variables.length; j++){
			pack_json = pack_json.replace('$'+pack_variables[j], `payload[${j}]`)
			pack_condition = pack_condition.replace('$'+pack_variables[j], `payload[${j}]`)
		}

		if (decoding_types[i].condition === "default" || decoding_types[i].condition === "size") {

			js_code+= `
	if (input.bytes.length == ${pack_size}) {
		let format = struct(\"${pack_format}\");
		var buf = new ArrayBuffer(input.bytes.length);
		var bufView = new Uint8Array(buf);
		for (var i=0, inputLen=input.bytes.length; i<inputLen; i++) {
			bufView[i] = input.bytes[i];}
		var payload = format.unpack(buf);
			return {
			data: ${pack_json}
			};

	}
	`
		} else {

			js_code+= `
	if (input.bytes.length == ${pack_size}) {
		let format = struct(\"${pack_format}\");
		var buf = new ArrayBuffer(input.bytes.length);
		var bufView = new Uint8Array(buf);
		for (var i=0, inputLen=input.bytes.length; i<inputLen; i++) {
			bufView[i] = input.bytes[i];}
		var payload = format.unpack(buf);
			if (${pack_condition}) {
				return {
				data: ${pack_json}
				};
			}

	}
	`


		}


	}
	js_code+=`
		return {
		errors: "Formats doesn't match.",
	};
}
	`
	return js_header+js_code;

}

console.log(generate_decoder(decoding_types));
