const axios = require('axios');

const BASE_URL = 'https://cw-api-website.vercel.app';

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method (preflight request)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: true,
      message: 'Method not allowed. Only GET requests are supported.'
    });
  }

  try {
    const { batchid, topicid, full, date } = req.query;
    
    let url = `${BASE_URL}/batch`;
    
    // Construct query parameters
    const params = new URLSearchParams();
    
    if (batchid) params.append('batchid', batchid);
    if (topicid) params.append('topicid', topicid);
    if (full) params.append('full', full);
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    console.log('Fetching from:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    // Forward the response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: true,
        message: 'Gateway timeout',
        details: 'The request took too long to complete'
      });
    }
    
    if (error.response) {
      res.status(error.response.status).json({
        error: true,
        message: 'Error from upstream API',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      res.status(502).json({
        error: true,
        message: 'Network error',
        details: 'Unable to connect to the upstream API'
      });
    } else {
      res.status(500).json({
        error: true,
        message: 'Internal server error',
        details: error.message
      });
    }
  }
};