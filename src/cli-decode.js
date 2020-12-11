const fs = require('fs');
const protob = require('./protob');

try {

  if (process.argv.length !== 4) {
    throw Error('Usage: npm run decode <proto-file-path> <hex-string>');
  }

  if (!fs.existsSync(process.argv[2])) {
    throw Error(`Cannot find proto file: ${process.argv[2]}`);
  }
  const buffer = Buffer.from(process.argv[3], 'hex');
  const PBPacket = protob.createPBPacket(process.argv[2]);
  const data = protob.decodePacket(PBPacket, buffer);
  console.log(JSON.stringify(data, null, 2));

} catch (error) {
  console.error(error.toString() + '\n\n\n');
  process.exit(1);
}
