const express = require('express');

require('dotenv-defaults').config();
const app = express();
app.use(express.json());

const protob = require('./protob');

const PBPacket = protob.createPBPacket(process.env.PROTO_FILE);

function onDataRecv (identity, data, res) {
  console.log('Data recv', identity, data);
  res.status(201).json(data);
}

// Example endpoint for LoRaWAN The Things Network (TTN)
app.post(process.env.URL_PREFIX + '/ttn', function (req, res) {
  const buffer = Buffer.from(req.body.payload_raw, 'base64');
  const data = protob.decodePacket(PBPacket, buffer);
  onDataRecv(req.body.hardware_serial, data, res);
});

// Example endpoint for LoRaWAN CRA
app.post(process.env.URL_PREFIX + '/cra', function (req, res) {
  const msg = JSON.parse(req.body.data);
  const buffer = Buffer.from(msg.data, 'hex');
  const data = protob.decodePacket(PBPacket, buffer);
  onDataRecv(msg.EUI, data, res);
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${server.address().port}`);
});

module.exports = server;
