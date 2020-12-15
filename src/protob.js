const protobuf = require('protobufjs');

function findPBPacket (root) {
  for (const name in root.nested) {
    if (name.startsWith('pb_packet')) {
      return root.lookup(name);
    }
  }
};

function map (x, in_min, in_max, out_min, out_max) {
  let val = (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  if (val > out_max) {
    val = out_max;
  }
  if (val < out_min) {
    val = out_min;
  }
  return val;
}

function updateData (data, field) {

  if (Array.isArray(data)) {
    for (let i = 0, l = data.length; i < l; i++) {
      updateData(data[i], field);
    }
    return;
  }

  for (const key in data) {
    if (field.fields === undefined) {
      continue;
    }

    if (field.fields[key].type === 'pb_infrared_t') {
      const infra = data[key];
      const buffer = Buffer.from(infra.samples, 'base64');
      const min = infra.min / 100.0;
      const max = infra.max / 100.0;
      const samples = [];

      let bit = 0;
      const mask = (1 << infra.bits) - 1; // mask and max number
      let val, index, offset;

      for (let i = 0, l = infra.width * infra.height; i < l; i++) {

        index = Math.floor(bit / 8);
        offset = bit % 8;

        if (offset > (8 - infra.bits)) {
          val = buffer[index] >> offset | buffer[index + 1] << (8 - offset);
        } else {
          val = buffer[index] >> offset;
        }

        bit += infra.bits;
        val &= mask;

        samples.push(map(val, 0, mask, min, max));
      }

      data[key] = {
        width: infra.width,
        height: infra.height,
        temperature: {
          min,
          max,
          samples,
        },
      };

    } else if (field.fields[key].resolvedType) {
      updateData(data[key], field.fields[key].resolvedType);

    } else if (field.fields[key].options) {
      const options = field.fields[key].options;

      if ('(hio).multiplied' in options) {
        data[key] /= parseFloat(options['(hio).multiplied']);
      }

      if ('(hio).offset' in options) {
        data[key] += parseFloat(options['(hio).offset']);
      }

      if ('(hio).hex' in options) {
        data[key] = data[key].toString(16).toUpperCase().padStart(parseInt(options['(hio).hex']) * 2, '0');
      }
    }
  }
}

exports.createPBPacket = (filename) => {
  const root = new protobuf.Root();
  root.loadSync(filename, { keepCase: true });

  // Obtain a message type
  const PBPacket = findPBPacket(root);

  if (!PBPacket) {
    throw Error('Can not find pb_packet in proto file.');
  }

  return PBPacket;
};

exports.decodePacket = (PBPacket, buffer) => {
  const packet = PBPacket.decode(buffer);
  const data = packet.toJSON();
  updateData(data, PBPacket);
  return data;
};
