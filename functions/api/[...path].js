// Import your existing Worker code components
import { getKVPrxList, getPrxList, checkPrxHealth } from '../../utils/protocols.js';
import { generateSubscription } from '../../utils/subscription.js';
import { shuffleArray, getFlagEmoji } from '../../utils/helpers.js';

// Constants from your Worker
const horse = "dHJvamFu";
const flash = "dm1lc3M=";
const v2 = "djJyYXk=";
const neko = "Y2xhc2g=";

const PORTS = [443, 80];
const PROTOCOLS = [atob(horse), atob(flash), "ss"];
const SUB_PAGE_URL = "https://foolvpn.me/nautica";
const KV_PRX_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/kvProxyList.json";
const PRX_BANK_URL = "https://raw.githubusercontent.com/FoolVPN-ID/Nautica/refs/heads/main/proxyList.txt";
const PRX_HEALTH_CHECK_API = "https://id1.foolvpn.me/api/v1/check";
const CONVERTER_URL = "https://api.foolvpn.me/convert";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // Remove 'api' from path segments
  const apiPath = '/' + pathSegments.slice(1).join('/');
  
  try {
    // Handle different API endpoints
    if (apiPath === '/v1/sub' || apiPath === '/sub') {
      return await handleSubscription(request, url);
    } else if (apiPath === '/v1/check' || apiPath === '/check') {
      return await handleHealthCheck(request, url);
    } else if (apiPath === '/v1/myip' || apiPath === '/myip') {
      return await handleMyIP(request);
    } else {
      return new Response('API endpoint not found', { 
        status: 404,
        headers: CORS_HEADERS 
      });
    }
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}

async function handleSubscription(request, url) {
  const filterCC = url.searchParams.get('cc')?.split(',') || [];
  const filterPort = url.searchParams.get('port')?.split(',') || PORTS;
  const filterVPN = url.searchParams.get('vpn')?.split(',') || PROTOCOLS;
  const filterLimit = parseInt(url.searchParams.get('limit')) || 10;
  const filterFormat = url.searchParams.get('format') || 'raw';
  const fillerDomain = url.searchParams.get('domain') || url.hostname;

  const prxList = await getPrxList();
  
  // Apply filters
  let filteredPrx = prxList;
  if (filterCC.length) {
    filteredPrx = filteredPrx.filter(prx => filterCC.includes(prx.country));
  }
  
  shuffleArray(filteredPrx);
  
  // Generate subscription links
  const results = [];
  const uuid = crypto.randomUUID();
  
  for (const prx of filteredPrx.slice(0, filterLimit)) {
    for (const port of filterPort) {
      for (const protocol of filterVPN) {
        if (results.length >= filterLimit) break;
        
        const uri = new URL(`${protocol}://${fillerDomain}`);
        
        if (protocol === 'ss') {
          uri.username = btoa(`none:${uuid}`);
          uri.searchParams.set('plugin', 
            `${atob(v2)}-plugin${port == 80 ? '' : ';tls'};mux=0;mode=websocket;path=/${prx.prxIP}-${prx.prxPort};host=${fillerDomain}`
          );
        } else {
          uri.username = uuid;
        }
        
        uri.port = port.toString();
        uri.searchParams.set('encryption', 'none');
        uri.searchParams.set('type', 'ws');
        uri.searchParams.set('host', fillerDomain);
        uri.searchParams.set('security', port == 443 ? 'tls' : 'none');
        uri.searchParams.set('sni', port == 80 && protocol == atob(flash) ? '' : fillerDomain);
        uri.searchParams.set('path', `/${prx.prxIP}-${prx.prxPort}`);
        
        uri.hash = `${results.length + 1} ${getFlagEmoji(prx.country)} ${prx.org} WS ${port == 443 ? 'TLS' : 'NTLS'}`;
        
        results.push(uri.toString());
      }
    }
  }
  
  let finalResult = '';
  switch (filterFormat) {
    case 'raw':
      finalResult = results.join('\n');
      break;
    case atob(v2):
      finalResult = btoa(results.join('\n'));
      break;
    case atob(neko):
    case 'sfa':
    case 'bfr':
      // Implement converter API call if needed
      finalResult = results.join('\n');
      break;
    default:
      finalResult = results.join('\n');
  }
  
  return new Response(finalResult, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}

async function handleHealthCheck(request, url) {
  const target = url.searchParams.get('target');
  if (!target) {
    return new Response('Missing target parameter', { status: 400 });
  }
  
  const [ip, port = '443'] = target.split(':');
  const result = await checkPrxHealth(ip, port);
  
  return new Response(JSON.stringify(result), {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json'
    }
  });
}

async function handleMyIP(request) {
  const ipInfo = {
    ip: request.headers.get('cf-connecting-ip') || 
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for'),
    colo: request.headers.get('cf-ray')?.split('-')[1] || 'unknown',
    country: request.cf?.country || 'unknown',
    asn: request.cf?.asn || 'unknown'
  };
  
  return new Response(JSON.stringify(ipInfo), {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json'
    }
  });
}
