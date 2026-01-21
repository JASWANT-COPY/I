const axios = require('axios');

const BASE_URL = 'https://cw-api-website.vercel.app';

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method (preflight request)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { batchId } = req.query;
    const { topicid, full, date } = req.query;
    
    if (!batchId) {
      return res.status(400).json({
        error: true,
        message: 'Batch ID is required'
      });
    }
    
    let url = `${BASE_URL}/batch/${batchId}`;
    
    // Query parameters construct करें
    const params = new URLSearchParams();
    
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    // Original API का response forward करें
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: true,
        message: error.response.data || 'Error fetching data',
        status: error.response.status
      });
    } else if (error.request) {
      res.status(500).json({
        error: true,
        message: 'Network error or timeout',
        details: error.message
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