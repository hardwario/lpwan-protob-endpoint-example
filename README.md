<a href="https://www.hardwario.com/"><img src="https://www.hardwario.com/ci/assets/hw-logo.svg" width="200" alt="HARDWARIO Logo" align="right"></a>

# HARDWARIO LPWAN Protocol Buffers Endpoint Example

[![Travis](https://img.shields.io/travis/hardwario/lpwan-protob-endpoint-example/master.svg)](https://travis-ci.org/hardwario/lpwan-protob-endpoint-example)
[![License](https://img.shields.io/github/license/hardwario/lpwan-protob-endpoint-example.svg)](https://github.com/hardwario/lpwan-protob-endpoint-example/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/hardwario_en.svg?style=social&label=Follow)](https://twitter.com/hardwario_en)


This is an generic example HTTP endpoint for The Things Network (TTN) and České Radiokomunikace (CRA). You can use also the CLI tool to just decode the HEX string.

## Why protobuffers

Usually when low-power device sends data it has to pack them efficiently to the transmitting packet. This works fine if your packet is always the same and the items are fixed. It gets more complicated if you have different packets with different items. Now you have to have some kind of header which says to decoder which bytes are which items. 

This can get really complex and it adds more time to the development since you have to create a decoder in the device firmware usually in C/C++, then you have to create decoder on the server usually in node/python/anything.
Then every single change is time consuming and very prone to errors.

Protobuffers is a library which uses protofile `*.proto` which describes message, structures and number and positions of each item. We use version `proto3` which has every item optional. This way the device can decide which item in each packet will be and save data. Also it has smart encoding of numbers. The data type `int32` is flexible and if you have values 0-127 it fills just a single byte in teh message. If the number is bigger it can have 2, 3 or 4 bytes. This and many other features makes this library very efficient.

[Protocol buffers website](https://developers.google.com/protocol-buffers)

On the device in firmware we use smaller protobuf encoder called [nanopb](https://jpa.kapsi.fi/nanopb/) with static memory allocations.


## Download
```
git clone https://github.com/hardwario/lpwan-protob-endpoint-example.git
cd lpwan-protob-endpoint-example
npm install
```

## Development
When run in `dev` mode then the example proto file from `examples/message.proto` is used.

```
npm run dev
```

## Run
Create or copy message.proto file to the project directory and

```
npm start
```

## Environment variables

You can change setting using these environment variables. We are using [dotenv-defaults](https://www.npmjs.com/package/dotenv-defaults) package which loads this settings from `.env.defaults` file if you do not apply them syste-wide or from command-line.

|    Name    |    Default    |
| ---------- | ------------- |
| PORT       | 8080          |
| PROTO_FILE | message.proto |
| URL_PREFIX |               |

## Test with curl

Our simulated device is sending two types of packet. One with sensors and one with infrared image.
You can simulate these two types of packets by `curl` commands below.

Simulate CRA JSON
```
curl -X POST -H "Content-Type: application/json" -d @examples/cra_sensor.json http://localhost:8080/cra
curl -X POST -H "Content-Type: application/json" -d @examples/cra_infra.json http://localhost:8080/cra
```

Simulate TTN JSON
```
curl -X POST -H "Content-Type: application/json" -d @examples/ttn_sensor.json http://localhost:8080/ttn
curl -X POST -H "Content-Type: application/json" -d @examples/ttn_infra.json http://localhost:8080/ttn
```

## CLI tool

Choose the proto file and append HEX string. Use the `decode-hex` command.

```
npm run decode-hex examples/message.proto 0a0208054a86010810100c1805209c1128ab173278028821c210a3a4638e21648c31c20886d4764819a688414619e5bdc88e31679441481a8935e8d0296814424a2a14b927db39a78c41102a0c3527212a4488519a3269ad17e53a871052181b861e27a74b658c41d62a052a36a944428840102304b995f74d4494620e24e5c414b356434935ca22c55048f563
```

TTN sending data in `base64`. You can decode that with `decode-base64` command.

```
npm run decode-base64 examples/message.proto CgIIBUqGAQgQEAwYBSCcESirFzJ4AoghwhCjpGOOIWSMMcIIhtR2SBmmiEFGGeW9yI4xZ5RBSBqJNejQKWgUQkoqFLkn2zmnjEEQKgw1JyEqRIhRmjJprRflOocQUhgbhh4np0tljEHWKgUqNqlEQohAECMEuZX3TUSUYg4k5cQUs1ZDSTXKIsVQSPVj
```

## Test
You can run integrated tests by

```
npm run test
```

## HARDWARIO Protobuffers extensions

We've added some custom extensions/post-processing to the protobuf decoder.

First, in the protobuf there are some definitions which are ignored in the decoder, but are necessary in the device firmware. This includes `nanopb` encoder option and including `hio.proto` file which defines extensions.

```
import 'nanopb.proto';
option (nanopb_fileopt).long_names = false;

import 'src/protob/hio.proto';
```

This is the content of `hio.proto` which is not needed by decoder. Is here just for clarification so you can see the options.

```
syntax = "proto2";
import "google/protobuf/descriptor.proto";

message HioPBOptions {
    optional int32 multiplied = 1;
    optional int32 hex = 2;
}

extend google.protobuf.FieldOptions {
    optional HioPBOptions hio = 1020;
}
```

### Option `multiplied`

This option means that the fixed value for example from temperature sensor is multiplied by this coeficient
in the firmware before is send with protobuffers. If the decoder sees this option it automatically divide
received value by the same coefficient before is saved to output JSON.

```
int32 temperature = 1 [(hio).multiplied = 100];
```

### Option `hex`

This option converts received number to HEX string. It is useful for example for git commit hash.

```
int32 firmware = 3 [(hio).hex = 4];
```

### Infrared image decoding

The decoder can expand the efficient infrared image transfer. The sensor sends this structure which helps decoder to understand the dimension, number of bits per pixel and minimal and maximal temperature in the image.

```
message pb_infrared_t
{
    int32 width = 1;
    int32 height = 2;
    int32 bits = 3;
    int32 min = 4;
    int32 max = 5;
    bytes samples = 6;
}
```

The protobuffer decodes`samples` as base64 values of bytes, but since the each pixel temperature is bit-packed  using 5 bits, there is needed aditional post-processing. Decoder works in a way that if it finds structure called `pb_infrared_t` then it expects the items in the structure above and does the decoding.

Decoding works in a way that each 5 bits gives for each pixel a number from 0-31. This number is used to linearly interpolate the final temprature using the `min` and `max` value.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT/) - see the [LICENSE](LICENSE) file for details.

---

Made with &#x2764;&nbsp; by [**HARDWARIO s.r.o.**](https://www.hardwario.com/) in the heart of Europe.
