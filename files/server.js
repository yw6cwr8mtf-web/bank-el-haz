// Bank El Haz server: no dependencies. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),R=new Map();
const get=c=>{let r=R.get(c);if(!r)R.set(c,r={s:null,cl:new Set(),t:0});r.t=Date.now();return r};
const out=(r,d,e)=>r.write((e?'event: '+e+'\n':'')+'data: '+d+'\n\n');
const PORT=process.env.PORT||3000;
http.createServer((q,r)=>{
const u=new URL(q.url,'http://x'),p=u.pathname,c=(u.searchParams.get('room')||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12);
if(p=='/events'&&c){const m=get(c);r.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','X-Accel-Buffering':'no'});r.write('retry: 2000\n\n');m.cl.add(r);if(m.s)out(r,JSON.stringify(m.s));q.on('close',()=>m.cl.delete(r));return}
if(p=='/state'&&c){const m=R.get(c);if(m&&m.s){r.writeHead(200,{'Content-Type':'application/json'});return r.end(JSON.stringify(m.s))}r.writeHead(204);return r.end()}
if((p=='/set'||p=='/ev')&&c&&q.method=='POST'){let b='';q.on('data',d=>{b+=d;if(b.length>2e5)q.destroy()});q.on('end',()=>{try{const s=JSON.parse(b),m=get(c);
if(p=='/ev'){m.cl.forEach(x=>out(x,JSON.stringify({e:String(s.e).slice(0,4),n:String(s.n||'').slice(0,14)}),'ev'));r.writeHead(204);return r.end()}
if(typeof s.v!='number')throw 0;
if(!m.s||s.v>m.s.v){m.s=s;m.cl.forEach(x=>out(x,b));r.writeHead(204);r.end()}
else{r.writeHead(409,{'Content-Type':'application/json'});r.end(JSON.stringify(m.s))}}catch(e){r.writeHead(400);r.end()}});return}
fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{r.writeHead(e?500:200,{'Content-Type':'text/html; charset=utf-8'});r.end(d)})
}).listen(PORT,()=>console.log('Bank El Haz on http://localhost:'+PORT));
setInterval(()=>{const n=Date.now();R.forEach((m,c)=>{m.cl.forEach(x=>x.write(': ping\n\n'));if(!m.cl.size&&n-m.t>216e5)R.delete(c)})},20000);
