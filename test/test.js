/* eslint-disable max-len */
process.env.PROTO_FILE = 'test/test.proto';

const request = require('supertest');
const expect = require('chai').expect;
const server = require('../src/index');

const DATA = '0a0208054a86010810100c1805209c1128ab173278028821c210a3a4638e21648c31c20886d4764819a688414619e5bdc88e31679441481a8935e8d0296814424a2a14b927db39a78c41102a0c3527212a4488519a3269ad17e53a871052181b861e27a74b658c41d62a052a36a944428840102304b995f74d4494620e24e5c414b356434935ca22c55048f563';

describe('Test', function () {

  it('should receive data from ttn', async () => {
    await request(server)
      .post(process.env.URL_PREFIX + '/ttn')
      .send({
        app_id: 'hio-example',
        dev_id: '1',
        hardware_serial: 'AABBCCDDEEFF0011',
        port: 1,
        counter: 1,
        payload_raw: (Buffer.from(DATA, 'hex')).toString('base64'),
        metadata: { time: '2020-11-20T12:00:00.00Z', frequency: 867.3, modulation: 'LORA', data_rate: 'SF9BW125', coding_rate: '4/5', gateways: [] },
        downlink_url: 'https://integrations.thethingsnetwork.org/ttn-eu/api/v2/down/...',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((res) => {
        expect(res.body.frame.sequence).to.equal(5);
        expect(res.body.infrared.width).to.equal(16);
        expect(res.body.infrared.height).to.equal(12);
        expect(res.body.infrared.temperature.min).to.equal(22.04);
        expect(res.body.infrared.temperature.max).to.equal(29.87);
        expect(res.body.infrared.temperature.samples.length).to.equal(16 * 12);
        expect(res.body.infrared.temperature.samples[0]).to.approximately(22.54, 0.01);
        expect(res.body.infrared.temperature.samples[1]).to.equal(22.04);
      });
  });

  it('should receive data from cra', async () => {
    await request(server)
      .post(process.env.URL_PREFIX + '/cra')
      .send({
        type: 'D',
        data: `{"cmd":"gw","seqno":170869130,"EUI":"AABBCCDDEEFF0011","ts":1605830400,"fcnt":510,"port":2,"freq":868500000,"toa":905,"dr":"SF11 BW125 4/5","ack":true,"gws":[],"bat":254,"data":"${DATA}"}`,
        tech: 'L',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((res) => {
        expect(res.body.frame.sequence).to.equal(5);
        expect(res.body.infrared.width).to.equal(16);
        expect(res.body.infrared.height).to.equal(12);
        expect(res.body.infrared.temperature.min).to.equal(22.04);
        expect(res.body.infrared.temperature.max).to.equal(29.87);
        expect(res.body.infrared.temperature.samples.length).to.equal(16 * 12);
        expect(res.body.infrared.temperature.samples[0]).to.approximately(22.54, 0.01);
        expect(res.body.infrared.temperature.samples[1]).to.equal(22.04);
      });
  });

});
