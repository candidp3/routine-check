const CACHE='routine-check-v6-53';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  // 파일 하나가 없어도 나머지는 저장되도록 개별 처리
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(a=>c.add(a)))));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // 도서 검색 등 외부 API는 캐시하지 않고 그대로 통과
  if(url.origin!==self.location.origin)return;
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.status===200){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
  );
});
