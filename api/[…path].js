const TARGET_BASE_URL = 'https://vipcw.vercel.app/api';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const path = req.query.path || [];
    const targetPath = Array.isArray(path) ? path.join('/') : path;
    
    // Query params ko alag karna (path ke alawa)
    const queryParams = { ...req.query };
    delete queryParams.path;
    
    let targetUrl = `${TARGET_BASE_URL}/${targetPath}`;
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
      targetUrl += `?${queryString}`;
    }
    
    console.log(`[PROXY] ${req.method} ${targetUrl}`);
    
    // Headers clean karna
    const headers = {};
    const allowedHeaders = ['content-type', 'authorization', 'accept', 'x-requested-with'];
    
    Object.keys(req.headers).forEach(key => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers[key] = req.headers[key];
      }
    });
    
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    // Body handle karna
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body) {
        if (typeof req.body === 'object') {
          fetchOptions.body = JSON.stringify(req.body);
          headers['content-type'] = headers['content-type'] || 'application/json';
        } else {
          fetchOptions.body = req.body;
        }
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    // Response headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    const body = await response.text();
    res.status(response.status).send(body);
    
  } catch (error) {
    console.error('[PROXY ERROR]', error);
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: error.message 
    });
  }
};
