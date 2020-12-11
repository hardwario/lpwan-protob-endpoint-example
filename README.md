<a href="https://www.hardwario.com/"><img src="https://www.hardwario.com/ci/assets/hw-logo.svg" width="200" alt="HARDWARIO Logo" align="right"></a>

# HARDWARIO LPWAN Protocol Buffers Endpoint Example

[![Travis](https://img.shields.io/travis/hardwario/lpwan-protob-endpoint-example/master.svg)](https://travis-ci.org/hardwario/lpwan-protob-endpoint-example)
[![License](https://img.shields.io/github/license/hardwario/lpwan-protob-endpoint-example.svg)](https://github.com/hardwario/lpwan-protob-endpoint-example/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/hardwario_en.svg?style=social&label=Follow)](https://twitter.com/hardwario_en)


This is an example HTTP endpoint for TheThingNetwork and CRA Czech Radio Communication. You can use also the CLI tool to just decode the HEX string.

## Download

```
git clone https://github.com/hardwario/lpwan-protob-endpoint-example.git
cd lpwan-protob-endpoint-example
npm install
```

## Development
Uses example proto file from `examples/message.proto`
```
npm run dev
```

## Run
Create or copy message.proto file to the project directory and
```
npm start
```

## Environment variables

|    Name    |    Default    |
| ---------- | ------------- |
| PORT       | 8080          |
| PROTO_FILE | message.proto |
| URL_PREFIX |               |

## Test with curl

```
curl -X POST -H "Content-Type: application/json" -d @examples/cra.json http://localhost:8080/cra
```

## CLI tool

```
npm run decode examples/message.proto 0a0208054a86010810100c1805209c1128ab173278028821c210a3a4638e21648c31c20886d4764819a688414619e5bdc88e31679441481a8935e8d0296814424a2a14b927db39a78c41102a0c3527212a4488519a3269ad17e53a871052181b861e27a74b658c41d62a052a36a944428840102304b995f74d4494620e24e5c414b356434935ca22c55048f563
```

## Test
You can run integrated tests by

```
npm run test
```

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT/) - see the [LICENSE](LICENSE) file for details.

---

Made with &#x2764;&nbsp; by [**HARDWARIO s.r.o.**](https://www.hardwario.com/) in the heart of Europe.
