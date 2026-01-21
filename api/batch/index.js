import axios from 'axios';
import allowCors from '../cors';

const BASE_URL = 'https://cw-api-website.vercel.app';

const handler = async (req, res) => {
  try {
    const { batchid, topicid, full, date } = req.query;
    
    let url = `${BASE_URL}/batch`;
    
    // Query parameters construct करें
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    // Original API का response forward करें
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    if (error.response) {
      // Original API से error आया है
      res.status(error.response.status).json({
        error: true,
        message: error.response.data || 'Error fetching data',
        status: error.response.status
      });
    } else if (error.request) {
      // Request timeout या network error
      res.status(500).json({
        error: true,
        message: 'Network error or timeout',
        details: error.message
      });
    } else {
      // अन्य error
      res.status(500).json({
        error: true,
        message: 'Internal server error',
        details: error.message
      });
    }
  }
};

export default allowCors(handler);
