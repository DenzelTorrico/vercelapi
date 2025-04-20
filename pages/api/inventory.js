import fs from 'fs';
import path from 'path';
import { UAParser } from 'ua-parser-js';  
import requestIp from 'request-ip';
//import geoip from 'geoip-lite';
let inventoryData = [];
export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  try {
    // Obtener info básica
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip && ip.includes(',')) ip = ip.split(',')[0];
    ip = ip.replace('::ffff:', '').trim();

    const userAgent = req.headers['user-agent'];
    const method = req.method;
    const url = req.url;
    const token = req.headers.authorization?.split(' ')[1] || 'No token';
    const ipclient = requestIp.getClientIp(req);
    const isDev = process.env.NODE_ENV === 'development';
    //const geo = isDev ? geoip.lookup('8.8.8.8') : geoip.lookup(ip);  
    const ua = new UAParser(req.headers['user-agent']).getResult();
    
    // Crear mensaje de log
    const log = `[${timestamp}] ${method} ${url}
IP: ${ip}
User-Agent: ${userAgent}
Token: ${token}
IP Client: ${ipclient}
UA: ${JSON.stringify(ua)}
browser: ${ua.browser?.name} ${ua.browser?.version}
engine: ${ua.engine?.name} ${ua.engine?.version}
os: ${ua.os?.name} ${ua.os?.version}
cpu: ${ua.cpu?.architecture}
device: ${ua.device?.vendor} ${ua.device?.model}
type: ${ua.device?.type}`;

    const logPath = path.join(process.cwd(), 'logs.txt');
    fs.appendFileSync(logPath, log + '\n', 'utf8');

    // Procesar peticiones
    if (method === 'GET') {
      const data = req.query;
      return res.status(200).json({ message: "data get", inventoryData });
    }

    if (method === 'POST') {
      const data = req.body;
      return res.status(200).json({ message: "data post", data });
    }

    if (method === 'DELETE') {
      const data = req.body;
      return res.status(200).json({ message: "data delete", data });
    }

    if (method === 'PUT') {
      const data = req.body;
      return res.status(200).json({ message: "data put", data });
    }

    // Si no coincide ningún método
    return res.status(405).json({ message: "Método no permitido" });

  } catch (error) {
    const userAgent = req.headers['user-agent'];
    const method = req.method;
    const url = req.url;
    const token = req.headers.authorization?.split(' ')[1] || 'No token';
    const ipclient = requestIp.getClientIp(req);
    const isDev = process.env.NEXT_PUBLIC_NODE_ENV === 'development';
    //const geo = isDev ? geoip.lookup('8.8.8.8') : geoip.lookup(ip);  
    const ua = new UAParser(req.headers['user-agent']).getResult();
    // Crear log de error
    const errorLog = `[${timestamp}] ERROR
Error: ${error.message}
Stack: ${error.stack}
Method: ${req.method}
URL: ${req.url}
IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}
User-Agent: ${req.headers['user-agent']}
Token: ${req.headers.authorization || 'No token'}
IP Client: ${ipclient}
UA: ${JSON.stringify(ua)}
browser: ${ua.browser?.name} ${ua.browser?.version}
engine: ${ua.engine?.name} ${ua.engine?.version}
os: ${ua.os?.name} ${ua.os?.version}
cpu: ${ua.cpu?.architecture}
device: ${ua.device?.vendor} ${ua.device?.model}
type: ${ua.device?.type};
`;

    const errorLogPath = path.join(process.cwd(), 'error_logs.txt');
    fs.appendFileSync(errorLogPath, errorLog + '\n', 'utf8');

    return res.status(500).json({ message: "Ocurrió un error en el servidor", error: error.message });
  }
}
