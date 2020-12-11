const fs = require('fs');
const protob = require('./protob');

try {

  if (process.argv.length !== 5) {
    throw Error('Usage: \n' +
      'npm run decode-hex <proto-file-path> <hex-string>\n' +
      'npm run decode-bae64 <proto-file-path> <hex-string>');
  }

  const filename = process.argv[3];

  if (!fs.existsSync(filename)) {
    throw Error(`Cannot find proto file: ${filename}`);
  }
  const buffer = Buffer.from(process.argv[4], process.argv[2]);
  const PBPacket = protob.createPBPacket(filename);
  const data = protob.decodePacket(PBPacket, buffer);
  console.log(JSON.stringify(data, null, 2));

} catch (error) {
  console.error(error.toString() + '\n\n\n');
  process.exit(1);
}
