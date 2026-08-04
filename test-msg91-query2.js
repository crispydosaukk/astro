const fetch = require('node-fetch');

async function testMsg91Query() {
  const authKey = '556810Tz6GUA2yAti6a7210f1P1';
  const templateId = '6a72130b9c56d8f88f079d52';
  const mobile = '917981255989'; // Indian test number
  // or a UK number
  // const mobile = '447448055754';

  const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${mobile}&authkey=${authKey}`;
  const options = {
    method: 'POST',
  };

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Body:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testMsg91Query();
