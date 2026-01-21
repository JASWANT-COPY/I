// index.js - YAHI EK HI FILE BANANI HAI

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const TARGET_HOST = 'cw-api-website.vercel.app';

const server = http.createServer(async (req, res) => {
  try {
    console.log(`${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Prepare options for target request
    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        'Host': TARGET_HOST,
        'User-Agent': 'Proxy-Server/1.0'
      }
    };
    
    // Make request to target API
    const proxyReq = https.request(options, (proxyRes) => {
      // Copy status code
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe the response
      proxyRes.pipe(res);
    });
    
    // Handle errors
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
    });
    
    // If there's request body, pipe it
    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`🎯 Target: https://${TARGET_HOST}`);
  console.log(`🔗 Example: http://localhost:${PORT}/batch/1377`);
});
