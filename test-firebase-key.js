const fetch = require('node-fetch');

async function testApiKey() {
  const apiKey = 'AIzaSyCXZ9S7Th0lpAVLMnZnRlgusCH1dPgF98g';
  const url = `https://identitytoolkit.googleapis.com/v1/projects?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testApiKey();
