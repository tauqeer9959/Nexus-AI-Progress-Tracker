// Native fetch in Node 18+

async function testApi() {
  console.log('Sending test request to http://localhost:3001/api/chat...');
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Hello! Are you working?', 
        history: [] 
      })
    });
    
    console.log('Status Code:', response.status);
    const data = await response.json();
    console.log('Response Body:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApi();
