import struct


##### Inputs to the automatic javascript decoder generator

# Variables: what packed variables and types are you receiving from the sensor? (list in the packet order with respective data types)
# Endianess: What endianess should the decoder use to unpack variables from the sensor packet? ('big-endian' or 'little-endian'?)
# JSON map: What format of json do you want the function to return? (use '$' symbol before variable name as a identifier)
# Condition: In what condition should this json map be used? ("default" should always be last, "size", conditions with variable if variable is always in same location)


variables1 = [('protocol_version', 'B'), ('voltage', 'H'), ('pressure', 'f'), ('temperature','f')]
endianess1 = 'little-endian'
json_map1 = '''{
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
			}'''
condition1 = '$protocol_version==3'



variables2 = [('protocol_version', 'B'), ('voltage', 'H')]
endianess2 = 'little-endian'
json_map2 = '''{
			      "battery_voltage": {
			        "displayName": "Battery voltage",
			        "unit": "V",
			        "value": ($voltage*3.3)/1000
			      },
			      "protocol_version": $protocol_version

			}'''
condition2 = '$protocol_version<=2'



variables3 = [('protocol_version', 'B'), ('voltage', 'H'), ('pressure', 'f')]
endianess3 = 'little-endian'
json_map3 = '''{
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
			}'''
condition3 = 'default'

 

# We store all decoding types as a list (* conditions are tested in the list order)
decoding_types = [(variables1, endianess1, json_map1, condition1), 
		   			   (variables2, endianess2, json_map2, condition2), 
		   		  	   (variables3, endianess3, json_map3, condition3)]


##### Unpack functions to be added to the Javascript file
##### Supported data types (source: https://github.com/lyngklip/structjs)
#
# Format 	C Type 			ES Type 			Size
# x 		pad byte 		-					1
# c 		char 			String of length 1 	1
# b 		signed char 	Number 				1
# B 		unsigned char 	Number 				1
# ? 		_Bool 			Boolean 			1
# h 		short 			Number 				2
# H 		unsigned short 	Number 				2
# i 		int 			Number 				4
# I 		unsigned int 	Number 				4
# f 		float 			Number 				4
# d 		double 			Number 				8
# s 		char[] 			String 				-
# p 		char[] 			String				-

struct_functions = """
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
"""




### Decoder generating function

def generate_decoder(decoding_types):

	# javascript code header
	js_code = """

function decodeUplink(input) {

	"""

	# creates a javascript block for each decoder type 
	for decoder in decoding_types:

		# stores variables necessary for the decoder 
		pack_variables = [item[0] for item in decoder[0]]
		pack_endianess = decoder[1].replace('big-endian','>').replace('little-endian','<')
		pack_format = pack_endianess+''.join([item[1] for item in decoder[0]]) 
		pack_size = struct.calcsize(pack_format)
		

		# select the javascript block if no further condition than byte array length is required
		if (decoder[3]) == "default" or decoder[3] == "size":

			js_block = """
	if (input.bytes.length == {pack_size}) {{
		let format = struct(\"{pack_format}\");
		var buf = new ArrayBuffer(input.bytes.length);
		var bufView = new Uint8Array(buf);
		for (var i=0, inputLen=input.bytes.length; i<inputLen; i++) {{
			bufView[i] = input.bytes[i];}}
		var payload = format.unpack(buf);
			return {{
			data: {json_message},
			}};

	}}
				""".format(pack_size= pack_size, 
						   pack_format = pack_format,
						   json_message = decoder[2])

		# select the javascript block including the condition after the byte array length
		else:

			js_block = """
	if (input.bytes.length == {pack_size}) {{
		let format = struct(\"{pack_format}\");
		var buf = new ArrayBuffer(input.bytes.length);
		var bufView = new Uint8Array(buf);
		for (var i=0, inputLen=input.bytes.length; i<inputLen; i++) {{
			bufView[i] = input.bytes[i];}}
		var payload = format.unpack(buf);
		if ({pack_condition}) {{
			return {{
			data: {json_message},
			}};
		}}
	}}
				""".format(pack_size= pack_size, 
						   pack_format = pack_format,
						   pack_condition = decoder[3],
						   json_message = decoder[2])

		# replaces variable names with payload variable name and position
		for index,variable in enumerate(pack_variables):
			js_block = js_block.replace('$'+variable, 'payload[{}]'.format(index))

		# updates the javascript code
		js_code+=js_block

	# closes the javascript code
	js_code+="""

	return {
		errors: "Formats doesn't match.",
	};
}
	"""

	return js_code


# runs the decoder function
js_code = generate_decoder(decoding_types)

# writes the javascript code to a file
with open('decoder.js', 'w') as f:
	f.write(struct_functions)
	f.write(js_code)


