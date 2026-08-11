const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
if (match) {
  const key = match[1];
  // Replace \\n with \n so it is a real string before encoding
  const actualKey = key.replace(/\\n/g, '\n');
  console.log("BASE64 START");
  console.log(Buffer.from(actualKey).toString('base64'));
  console.log("BASE64 END");
}
