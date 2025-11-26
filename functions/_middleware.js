// Global middleware for all requests
export async function onRequest(context) {
  const { request, next } = context;
  
  // Add CORS headers to all responses
  const response = await next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}
