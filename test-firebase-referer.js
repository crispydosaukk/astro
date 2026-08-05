const fetch = require('node-fetch');

async function testApiKeyWithReferer() {
  const apiKey = 'AIzaSyCXZ9S7Th0lpAVLMnZnRlgusCH1dPgF98g';
  const url = `https://identitytoolkit.googleapis.com/v1/projects?key=${apiKey}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'http://localhost:3000/'
      }
    });
    const data = await res.json();
    console.log('With Localhost:', data);
    
    const res2 = await fetch(url, {
      headers: {
        'Referer': 'http://notauthorized.com/'
      }
    });
    const data2 = await res2.json();
    console.log('With Bad Domain:', data2);
  } catch (err) {
    console.error(err);
  }
}

testApiKeyWithReferer();
