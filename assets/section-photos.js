'use strict';
(()=>{
 const esc=IWStore.escape;
 const groups={photography:{label:'Photography',slot:['Photography','Photography packages'],target:'photography'},videography:{label:'Cinematic videography',slot:['Videography'],target:'videography-gallery'},makeup:{label:'Makeup',slot:['Makeup'],target:'bridal'},gifting:{label:'Gifting',slot:['Gifting'],target:'gifting'},events:{label:'Events',slot:['Events'],target:'events'},studio:{label:'Our studio',slot:['Studio'],target:'studio'},gallery:{label:'Portfolio',slot:['Portfolio'],target:'portfolio'}};
 let data,serviceData;
 const ready=Promise.all([api('/api/gallery'),api('/api/services')]).then(([g,s])=>{data=g;serviceData=s});
 const mounted=new WeakSet();
 function collection(key){const group=groups[key],seen=new Set();const rows=[...(data.slots||[]).filter(s=>group.slot.includes(s.section)&&!s.hidden).map(s=>({...s,url:s.url+'?slot='+encodeURIComponent(s.id)+'&v='+encodeURIComponent(s.updated||''),identity:s.replacement||s.url})),...data.items.filter(p=>p.placement===key||key==='gallery'&&p.placement==='both').map(p=>({...p,identity:p.url}))];return rows.filter(p=>{if(seen.has(p.identity))return false;seen.add(p.identity);return true})}
 function mount(target,key){if(mounted.has(target))return;const auto=!!data.slideshows?.sections?.[key];const photos=auto?collection(key):data.items.filter(p=>p.placement===key);if(!photos.length)return;mounted.add(target);
  const box=document.createElement('section');box.className='section-photo-collection container';box.setAttribute('aria-label',groups[key].label+' photographs');
  box.innerHTML=`<h3>${esc(groups[key].label)} photographs</h3><div class="section-photo-grid ${auto?'is-slideshow':''}">${photos.map((p,i)=>`<figure ${auto&&i?'hidden':''}><img loading="lazy" src="${esc(p.url)}" alt="${esc(p.title||groups[key].label+' photograph')}" style="object-fit:${p.fit==='cover'?'cover':'contain'};object-position:${Number(p.x??50)}% ${Number(p.y??50)}%"></figure>`).join('')}</div>`;
  target.append(box);if(!auto||photos.length<2)return;
  box.insertAdjacentHTML('beforeend','<div class="section-photo-controls"><button type="button" data-prev aria-label="Previous photograph">←</button><span data-count></span><button type="button" data-next aria-label="Next photograph">→</button><button type="button" data-pause>Pause</button></div>');
  const frames=[...box.querySelectorAll('figure')],motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,paused=motion.matches,visible=false;
  const pause=box.querySelector('[data-pause]'),count=box.querySelector('[data-count]');
  function paint(){frames.forEach((f,i)=>f.hidden=i!==index);count.textContent=`${index+1} / ${frames.length}`;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused))}
  function move(d){index=(index+d+frames.length)%frames.length;paint()}
  box.querySelector('[data-prev]').onclick=()=>{paused=true;move(-1)};box.querySelector('[data-next]').onclick=()=>{paused=true;move(1)};pause.onclick=()=>{paused=!paused;paint()};
  box.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();paused=true;move(e.key==='ArrowLeft'?-1:1)}});
  const observer=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);observer.observe(box);
  const timer=setInterval(()=>{if(!box.isConnected){clearInterval(timer);observer.disconnect();return}if(visible&&!paused&&!document.hidden&&!box.matches(':hover,:focus-within'))move(1)},2000);
  motion.addEventListener('change',e=>{if(e.matches){paused=true;paint()}});paint();
 }
 async function render(){try{await ready;
  const main=document.getElementById('portalMain'),page=document.body.dataset.portal;
  if(page==='service'){const s=serviceData.services.find(s=>s.id===new URLSearchParams(location.search).get('id'));if(s&&main?.querySelector('.package-layout')){const key=s.id==='cinematic'?'videography':s.category;if(groups[key])mount(main,key)}return}
  if(page==='services'){const select=document.getElementById('serviceFilter');if(!select)return;let anchor=document.getElementById('categoryPhotoCollection');if(!anchor){anchor=document.createElement('div');anchor.id='categoryPhotoCollection';main.append(anchor);select.addEventListener('change',()=>{anchor.replaceChildren();mounted.delete(anchor);if(groups[select.value])mount(anchor,select.value)})}if(groups[select.value])mount(anchor,select.value);return}
  for(const [key,g]of Object.entries(groups)){
   if(key==='gallery'){if(data.slideshows?.sections?.gallery){document.body.classList.add('portfolio-photo-slides');const portfolio=document.getElementById('portfolio');if(portfolio)mount(portfolio,key)}continue;}
   let target=document.getElementById(g.target);if(key==='studio'&&!target)target=document.getElementById('store');
   if(key==='videography'&&!target&&document.getElementById('photography')){target=document.createElement('div');target.id=g.target;document.getElementById('photography').append(target)}
   if(target&&!(document.body.classList.contains('gifting-page')&&key!=='gifting'))mount(target,key);
  }
 }catch(error){console.warn('Section photographs could not load:',error.message)}}
 addEventListener('iw-portal-ready',render);render();
})();
