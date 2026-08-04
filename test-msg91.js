const fetch = require('node-fetch');

async function testMsg91() {
  const authKey = '556810Tz6GUA2yAti6a7210f1P1';
  const templateId = '6a72130b9c56d8f88f079d52';
  const mobile = '917981255989';

  const url = 'https://control.msg91.com/api/v5/otp';
  const options = {
    method: 'POST',
    headers: {
      'authkey': authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile: mobile,
    }),
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

testMsg91();
