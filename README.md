# Auto-generated TTN Decoder

This application generates a javascript decoder function for The Things Network (TTN) that converts a sensor payload formated as a packed struct into a TTN decoded payload json following the instructions provided by a template decoder json as an input parameter.

The template decoder json should have the same keys and values as the desired TTN decoded payload json except by the use of reserved characters that will be replaced by the variables packed in the sensor payload, and a special field indicating in what conditions these decoding instructions should be executed. 

The packed values in the sensor payload are represented by the dolar sign symbol, followed by the data type and the starting byte index position inside square brackets. For example, the string "$\<f\[1\]" indicates that the generated TTN decoding function should decode a little\-endian float value starting from byte index number 1 of the sensor payload. 

Lets assume the following template decoder json as an example:

	{"protocol_version":"$B[0]", "temperature_celsius":"$<f[1]"} 

If the sensor payload is a packed struct with values 2 and 31.4 (little\-endian), the decoding function would provide as the decoded payload output the json: 

	{"protocol_version":2, "temperature_celsius":31.4}

When multiple sensor payload formats are used in an application, the decoder needs to know the conditions to apply each one of the decoding instructions. To represent in what condition we should use each template decoder, we use a reserved character "?" as its key and the condition as the value. 

For example, a more sofisticated template decoder json could be the following array:

	[ {"protocol_version":"$B[0]", "temperature_celsius":"$<f[1]", "?":"$B[0]<3"}, 
	  {"protocol_version":"$B[0]", "temperature_celsius":"$<f[1]", "humidity_percentage":"$<f[5]","?":"$B[0]>3"} ]

In this case, if a sensor payload is a packed struct with values 1, and 29.7 (little\-endian), the decoding function would provide as the decoded payload output the json: 

	{"protocol_version":1, "temperature_celsius":29.7}, 

while if a sensor payload is a packed struct with values 5, 21.4 (little\-endian), and 51.0 (little\-endian), it would provide as the decoded payload output the json: 

	{"protocol_version":5, "temperature_celsius":21.4,"humidity_percentage":51.0 }.


# Advanced Examples

sensor payload information:

	payload size: 11 bytes

	payload format: "<BHff"

		f : Float (4 bytes)
		f : Float (4 bytes)
		H : unsigned short (2 bytes)
		B : unsigned char (1 byte)

template decoder json:

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
	  },
	  "protocol_version": "$B[0]",
	  "temperature": {
	    "displayName": "Temperature",
	    "unit": "\u00B0C",
	    "value": "$<f[7]"
	  }
	}


