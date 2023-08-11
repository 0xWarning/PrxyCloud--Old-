const axios = require('axios');

async function testProxies(proxies) {
  const results = [];

  for (const proxy of proxies) {
    try {
      const startTime = Date.now();
      const response = await axios.get(targetUrl, {
        proxy: {
          host: proxy.ip,
          port: proxy.port,
        },
        timeout: 5000,
      });
      const endTime = Date.now();
      const speed = endTime - startTime;

      const status = response.status === 200 ? 'Working' : 'Not Working';
      const result = {
        ...proxy,
        status,
        speed,
      };

      process.send(result);
    } catch (error) {
      const result = {
        ...proxy,
        status: 'Error',
        speed: null,
      };

      process.send(result);
    }
  }
}

const targetUrl = 'https://www.google.com';

process.on('message', async message => {
  const { chunk } = message;
  await testProxies(chunk);
});