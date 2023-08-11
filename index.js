
const express = require('express');
const path = require('path');
const axios = require('axios');
const ejs = require('ejs');

const app = express();
const port = 3000;

const proxyScrapeUrl = 'https://pastebin.com/raw/ATDCLxbn';
const chunkSize = 50; // Number of proxies per request

let countdown = 60; // Initial countdown time in seconds
let startTime = Date.now(); // Store the server start time

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  const now = Date.now();
  const currentCountdown = Math.max(0, countdown - Math.floor((now - startTime) / 1000));

  const workingProxies = await checkProxies();

  res.render('index', {
    countdown: currentCountdown,
    workingProxies,
  });
});

app.get('/refresh', async (req, res) => {
  startTime = Date.now(); // Reset the start time
  countdown = 60; // Reset the countdown to the initial value

  res.redirect('/');
});

async function checkProxies() {
  try {
    const response = await axios.get(proxyScrapeUrl);
    const proxyList = response.data.split('\r\n');

    const workingProxies = await Promise.all(proxyList.slice(0, chunkSize).map(async proxy => {
      const [ip, port] = proxy.split(':');

      try {
        const startTime = Date.now();
        const response = await axios.get('https://www.google.com', {
          proxy: {
            host: ip,
            port: port,
          },
          timeout: 5000,
        });
        const endTime = Date.now();
        const speed = endTime - startTime;

        return {
          ip,
          port,
          status: 'Working',
          speed,
        };
      } catch (error) {
        return null;
      }
    }));

    return workingProxies.filter(proxy => proxy !== null);
  } catch (error) {
    console.error('Error checking proxies:', error);
    return [];
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
