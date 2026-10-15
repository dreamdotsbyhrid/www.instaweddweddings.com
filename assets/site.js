'use strict';
const esc=IWStore.escape,localWorkspace=document.getElementById('localWorkspace'),localContent=document.getElementById('localContent');
let activeLocal='bookings',accountRender=0;window.savedWishlist=[];
function openAuthModal(){return Auth.open()}
async function openWorkspace(panel='bookings'){
 if(['profile','bookings','orders'].includes(panel)){location.assign('account.html'+(panel==='profile'?'':'?view='+(panel==='bookings'?'enquiries':'orders')));return;}
 closeGiftShop();closePhotoCheckout();closePackageDetail();closeGiftConfirmation();
 if(!await Auth.open(panel==='payment'?'Sign in to place your order and keep it in My Account.':'Sign in to view your enquiries, orders and saved gifts.'))return;
 if(!localWorkspace.open)localWorkspace.showModal();document.body.classList.add('modal-visible');renderLocal(panel);
}
function closeLocal(){localWorkspace.close();document.body.classList.remove('modal-visible')}
document.getElementById('localClose').onclick=closeLocal;localWorkspace.addEventListener('close',()=>document.body.classList.remove('modal-visible'));
document.querySelectorAll('[data-local]').forEach(b=>b.onclick=()=>renderLocal(b.dataset.local));
document.getElementById('accountBtn').onclick=()=>openWorkspace('profile');
document.getElementById('drawerAccountLink').onclick=e=>{e.preventDefault();closeDrawer();openWorkspace('profile')};
document.querySelectorAll('footer .requires-auth').forEach((a,i)=>{a.href=i===2?'journal.html':'#';a.onclick=e=>{if(i!==2){e.preventDefault();openWorkspace(['bookings','orders','planner','wishlist'][i])}}});
async function refreshWishlist(){try{window.savedWishlist=Auth.user?(await api('/api/wishlist')).items:[];renderGiftProducts();updateHearts()}catch{window.savedWishlist=[];updateHearts()}}
window.addEventListener('auth-change',()=>{refreshWishlist();document.getElementById('accountBtn').title=Auth.user?'My account':'Sign in';if(!Auth.user&&localWorkspace.open&&activeLocal!=='payment')closeLocal()});
async function renderLocal(panel){
 if(['profile','bookings','orders'].includes(panel)){location.assign('account.html'+(panel==='profile'?'':'?view='+(panel==='bookings'?'enquiries':'orders')));return;}
 activeLocal=panel;const renderId=++accountRender;
 document.querySelectorAll('[data-local]').forEach(b=>b.classList.toggle('active',b.dataset.local===panel));document.getElementById('profileCaption').textContent=Auth.user?'Signed in as '+Auth.user.name:'Sign in to continue';
 document.getElementById('localTitle').textContent=({bookings:'Your enquiries',orders:'Your orders',wishlist:'Saved gifts',payment:'Checkout',profile:'My account',cart:'Your cart'})[panel];
 if(panel==='cart'){return window.renderAccountCart()}
 if(panel==='payment'){return renderOrderReview()}
 if(!Auth.user){closeLocal();return openWorkspace(panel)}localContent.innerHTML='<p>Loading…</p>';
 try{
 if(panel==='wishlist'){await refreshWishlist();if(renderId!==accountRender)return;localContent.innerHTML=savedWishlist.map(p=>`<article class="local-card"><div class="local-card-row"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p>${money(p.price)}</p><div class="local-actions"><button data-add="${esc(p.id)}">Buy now</button><button data-remove="${esc(p.id)}">Remove ♥</button></div></div></div></article>`).join('')||'<p>Tap a heart on a gift to save it.</p>';localContent.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>toggleWishlist(b.dataset.remove));localContent.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{addGiftToCart(b.dataset.add);renderLocal('payment')});}
 }catch(e){localContent.textContent=e.message}
}
async function toggleWishlist(id){if(!await Auth.open('Sign in to keep this gift in your wishlist.'))return;try{const saved=savedWishlist.some(x=>x.id===id);await api('/api/wishlist',{method:saved?'DELETE':'PUT',body:JSON.stringify({id})});await refreshWishlist();if(localWorkspace.open&&activeLocal==='wishlist')renderLocal('wishlist')}catch(e){showToast(e.message)}}
function updateHearts(){document.querySelectorAll('[data-wish]').forEach(b=>{const saved=!!Auth.user&&savedWishlist.some(x=>x.id===b.dataset.wish);b.classList.toggle('active',saved);b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',saved?'Remove from saved gifts':'Save gift')})}
new MutationObserver(updateHearts).observe(giftProductsEl,{childList:true});
// Website submissions require sign-in; external enquiry links open the chosen app.
let enquiryDraftId=null;const enquiryForm=document.getElementById('enquiryForm');enquiryForm.addEventListener('input',()=>enquiryDraftId=null);
enquiryForm.onsubmit=async e=>{
 e.preventDefault();const button=e.submitter,channel=button?.value||'website',data=Object.fromEntries(new FormData(enquiryForm));button.disabled=true;
 const message=`Hello InstaWedd!\nName: ${data.customer}\nContact: ${data.contact}\nService: ${data.service}\nDate: ${data.date||'To discuss'}\nVenue: ${data.venue||'To discuss'}\n\n${data.message}`;
 try{if(channel==='email'){location.href='mailto:instaweddweddingphotography@gmail.com?subject='+encodeURIComponent(data.service+' enquiry')+'&body='+encodeURIComponent(message);document.getElementById('enquiryStatus').textContent='Review and send your enquiry in your email app.';return}
 if(channel==='whatsapp'){
    api('/api/enquiries',{method:'POST',body:JSON.stringify({...data,message:data.message+' (Via WhatsApp Button)'})}).catch(()=>{});
    window.open('https://wa.me/919605509516?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
    document.getElementById('enquiryStatus').textContent='Review your WhatsApp message and press Send.';
    return;
  }
 if(channel==='copy'){await navigator.clipboard.writeText(message);document.getElementById('enquiryStatus').textContent='Message copied.';return}
 if(!Auth.user){consultModal.classList.remove('open');const approved=await Auth.open('Sign in to send your enquiry and keep it in My Account.');consultModal.classList.add('open');if(!approved)return}
 if(!enquiryDraftId){const result=await api('/api/enquiries',{method:'POST',body:JSON.stringify(data)});enquiryDraftId=result.id}
 document.getElementById('enquiryStatus').textContent='Enquiry sent ✓ Our team has received it. You can find it in My Account → Enquiries.';
 }catch(err){document.getElementById('enquiryStatus').textContent=err.message}finally{button.disabled=false}
};

IWEnquiry.apply(enquiryForm);enquiryForm.elements.service.addEventListener('change',()=>{IWEnquiry.detail='';IWEnquiry.apply(enquiryForm);enquiryDraftId=null});
// Preselect the service without creating another consultation listener.
document.addEventListener('click',e=>{const b=e.target.closest('.js-consult-trigger');if(!b)return;const section=b.closest('section');const name=b.dataset.service||({photography:'Photography',bridal:'Makeup & Hair',events:'Event Management',gifting:'Gifting'})[section?.id];IWEnquiry.detail=b.dataset.enquiry||b.closest('.pkg')?.querySelector('.tier')?.textContent.trim()||'';IWEnquiry.apply(enquiryForm,name||'Multiple services');enquiryDraftId=null},true);
// All four services have a clear enquiry path.
for(const [id,name] of [['bridal','Makeup & Hair'],['gifting','Gifting']]){const parent=document.querySelector('#'+id+' > .container');if(parent){const div=document.createElement('div');div.className='service-enquiry';div.innerHTML=`<button class="btn ghost js-consult-trigger" data-service="${esc(name)}">Enquire about ${id==='bridal'?'makeup & hair':'gifting'} ↗</button>`;parent.append(div)}}
// A short, useful explanation of the booking journey.
const steps=document.createElement('section');steps.innerHTML='<div class="container"><p class="eyebrow">From an idea to your wedding day</p><h2>Let’s make it simple.</h2><div class="journey-steps"><article><span>01</span><h3>Explore what you love</h3><p>Browse photography, makeup, gifting and event services.</p></article><article><span>02</span><h3>Tell us about your day</h3><p>Message your date, venue and ideas. No phone call required.</p></article><article><span>03</span><h3>Confirm your plan together</h3><p>We’ll discuss availability and a quote before you book.</p></article></div></div>';steps.id='why-journey';document.getElementById('contact').before(steps);
function mediaHidden(url,data){return(data.media||[]).some(m=>m.url===url&&m.hidden)}
const galleryPromise=api('/api/gallery').catch(()=>({items:[],rules:[]}));
function slotSource(slot){return slot.url+'?slot='+encodeURIComponent(slot.id)+'&v='+encodeURIComponent(slot.updated||'')}
function frameStyle(url,data){const slotId=new URL(url,location.href).searchParams.get('slot');const r=(data.slots||[]).find(s=>s.id===slotId)||data.items.find(i=>i.url===url)||data.rules.find(i=>i.url===url);return `object-fit:${r?.fit||'cover'};object-position:${r?.x??50}% ${r?.y??50}%`;}
// Selected original photography assets, one clone on each end for seamless wrap.
(async()=>{
 const galleryState=await galleryPromise;
 const media=document.querySelector('.hero-media');const selected=galleryState.items.filter(i=>['hero','both'].includes(i.placement));const originalHeroPaths=['image/wedding.jpg','image/marriage.jpeg','image/bride.jpeg','image/bridemus.jpeg','image/wedd.jpeg','image/prewedd.jpeg'];const heroSlots=(galleryState.slots||[]).filter(s=>s.section==='Hero');const slidesByPosition=heroSlots.length?heroSlots.filter(s=>!s.hidden).map((slot,i)=>({url:slotSource(slot),position:i+1,original:true})):originalHeroPaths.map((url,i)=>({url,position:i+1,original:true}));selected.forEach(photo=>slidesByPosition.push({...photo,position:Math.max(1,photo.position)}));slidesByPosition.sort((a,b)=>a.position-b.position||Number(a.original)-Number(b.original));const sources=[...new Set(slidesByPosition.map(photo=>photo.url))];
 if(!sources.length){media.hidden=true;return}
 const slides=[sources.at(-1),...sources,sources[0]];const heroMotion=matchMedia('(prefers-reduced-motion: reduce)');let reduced=heroMotion.matches,heroVisible=true;
 media.innerHTML=`<div class="hero-carousel" aria-roledescription="carousel" aria-label="Wedding photographs"><div class="hero-track">${slides.map((s,i)=>`<div class="hero-slide" ${i===0||i===slides.length-1?'aria-hidden="true"':''}><img style="${frameStyle(s,galleryState)}" src="${esc(s)}" alt="InstaWedd wedding photograph ${((i-1+sources.length)%sources.length)+1}"></div>`).join('')}</div><div class="hero-controls"><div class="hero-arrows"><button id="heroPrevious" aria-label="Previous photograph">⪻</button><button id="heroNext" aria-label="Next photograph">⪼</button></div><div class="hero-dots">${sources.map((_,i)=>`<button data-slide="${i}" aria-label="Photograph ${i+1}"></button>`).join('')}</div><span class="hero-count" id="heroCount"></span><button id="heroPause" aria-label="Pause slideshow">Ⅱ</button></div></div>`;
 const track=media.querySelector('.hero-track'),dots=[...media.querySelectorAll('[data-slide]')];let pos=1,busy=false,paused=reduced,interactionUntil=0,settleTimer=null;const seen=new Set([0]);
 media.querySelectorAll('img').forEach(img=>img.onerror=()=>img.parentElement.classList.add('image-missing'));
 function index(){return (pos-1+sources.length)%sources.length}
 function paint(){track.querySelectorAll('.hero-slide').forEach((slide,i)=>{const active=i===pos;slide.classList.toggle('is-current',active);slide.setAttribute('aria-hidden',String(!active))})}
 function settle(){if(pos===0)pos=sources.length;else if(pos===sources.length+1)pos=1;track.style.transition='none';track.style.transform=`translateX(-${pos*100}%)`;busy=false;paint()}
 function move(next,manual=false){if(busy)return;if(manual)interactionUntil=Date.now()+7000;busy=true;pos=next;track.style.transition=reduced?'none':'transform 800ms cubic-bezier(.22,.61,.36,1)';track.style.transform=`translateX(-${pos*100}%)`;paint();if(reduced)settle();else settleTimer=setTimeout(()=>{if(busy)settle()},850)}
 track.addEventListener('transitionend',e=>{if(e.propertyName==='transform')settle()});media.querySelector('.hero-controls').remove();const arrows=document.createElement('div');arrows.className='hero-manual-arrows';arrows.innerHTML='<button type="button" data-direction="-1" aria-label="Previous photograph">⪻</button><button type="button" data-direction="1" aria-label="Next photograph">⪼</button>';media.append(arrows);arrows.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();settle();move(pos+Number(b.dataset.direction),true);schedule(3000)});settle();
 let timer;function schedule(delay=2000){clearTimeout(timer);if(galleryState.slideshows?.sections?.hero&&!reduced&&heroVisible&&!document.hidden)timer=setTimeout(()=>{if(!document.querySelector('dialog[open],.consult-modal-backdrop.open'))move(pos+1);schedule()},delay)}
 media.tabIndex=0;media.setAttribute('aria-label','Wedding photographs. Click left or right to change photograph.');media.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(pos+(e.key==='ArrowLeft'?-1:1));schedule(3000)}});media.addEventListener('click',e=>{clearTimeout(timer);clearTimeout(settleTimer);settle();move(pos+(e.clientX<media.getBoundingClientRect().left+media.clientWidth/2?-1:1));schedule(3000)});document.addEventListener('visibilitychange',()=>schedule());heroMotion.addEventListener('change',e=>{reduced=e.matches;schedule()});new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;media.classList.toggle('motion-asleep',!heroVisible);schedule()},{threshold:.05}).observe(media);schedule();

})();
// Missing local assets get a quiet placeholder, never an endless error loop.
document.querySelectorAll('img').forEach(img=>{if(img.closest('.hero-media'))return;img.addEventListener('error',()=>{img.style.opacity='.15';img.alt='Image not supplied'})});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeConsultModal()});
renderGiftCart();
Auth.ready.then(refreshWishlist);
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!consultModal.classList.contains('open'))return;const focusable=[...consultModal.querySelectorAll('button,input,textarea,select,a[href]')].filter(x=>!x.disabled);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});

galleryPromise.then(data=>{
 const container=document.querySelector('#portfolio .gallery');const originals=(data.slots||[]).filter(s=>s.section==='Portfolio'&&!s.hidden).map(s=>({url:slotSource(s)}));
 const photos=[...data.items.filter(i=>['gallery','both'].includes(i.placement)),...originals];
 container.className='gallery infinity-gallery';container.setAttribute('aria-label','Photographs moving along an infinity path');container.innerHTML='<svg class="infinity-guide" aria-hidden="true"><path fill="none"/></svg>'+photos.slice(0,10).map((p,i)=>`<button class="infinity-photo" data-story="${i}" aria-label="Open gallery photograph ${i+1}"><img loading="lazy" src="${esc(p.url)}" alt="Wedding photograph ${i+1}" style="${frameStyle(p.url,data)}"></button>`).join('')+'<button class="infinity-pause" aria-label="Pause infinity animation">Ⅱ</button>';
 const orbitCards=[...container.querySelectorAll('.infinity-photo')],motionQuery=matchMedia('(prefers-reduced-motion: reduce)');let orbitPhase=0,orbitPaused=motionQuery.matches,orbitVisible=false,orbitHover=false,orbitFocus=false,orbitFrame=null,lastTime=0,orbitWidth=0,orbitHeight=0,cardWidth=0,cardHeight=0;
 function paintOrbit(){if(!orbitCards.length)return;const ax=Math.max(0,(orbitWidth-cardWidth*1.65)/2-8),ay=Math.max(0,(orbitHeight-cardHeight*1.65)/2-28);const positions=orbitCards.map((card,i)=>{const t=orbitPhase+i*Math.PI*2/orbitCards.length;return{card,t,depth:(Math.cos(t)+1)/2}});const front=new Set([...positions].sort((a,b)=>b.depth-a.depth).slice(0,3).map(p=>p.card));positions.forEach(({card,t,depth})=>{const scale=.46+1.14*Math.pow(depth,1.5),x=orbitWidth/2+ax*Math.sin(t),y=orbitHeight/2+ay*Math.sin(2*t);card.classList.toggle('orbit-front',front.has(card));card.style.transform=`translate(${x-cardWidth/2}px,${y-cardHeight/2}px) scale(${scale}) rotate(${Math.sin(t)*5}deg)`;card.style.zIndex=String(Math.round(depth*100)+1);card.style.opacity=String(.58+.42*depth)})}
 function measureOrbit(){orbitWidth=container.clientWidth;orbitHeight=container.clientHeight;cardWidth=orbitCards[0]?.offsetWidth||100;cardHeight=orbitCards[0]?.offsetHeight||120;const ax=Math.max(0,(orbitWidth-cardWidth*1.65)/2-8),ay=Math.max(0,(orbitHeight-cardHeight*1.65)/2-28);let d='';for(let i=0;i<=120;i++){const t=i/120*Math.PI*2;d+=(i?'L':'M')+(orbitWidth/2+ax*Math.sin(t)).toFixed(1)+','+(orbitHeight/2+ay*Math.sin(2*t)).toFixed(1)}container.querySelector('svg').setAttribute('viewBox',`0 0 ${orbitWidth} ${orbitHeight}`);container.querySelector('path').setAttribute('d',d+'Z');paintOrbit()}
 function tickOrbit(now){orbitFrame=null;if(!orbitVisible||orbitPaused||orbitHover||orbitFocus||document.hidden||viewer.open){lastTime=0;return}if(lastTime)orbitPhase+=(Math.min(now-lastTime,60)/85000)*Math.PI*2;lastTime=now;paintOrbit();orbitFrame=requestAnimationFrame(tickOrbit)}
 function runOrbit(){if(orbitFrame===null)orbitFrame=requestAnimationFrame(tickOrbit)}
 const orbitPlay=container.querySelector('.infinity-pause');function orbitLabel(){orbitPlay.textContent=orbitPaused?'▶':'Ⅱ';orbitPlay.setAttribute('aria-label',orbitPaused?'Play infinity animation':'Pause infinity animation')}orbitPlay.onclick=()=>{orbitPaused=!orbitPaused;orbitLabel();runOrbit()};orbitLabel();container.addEventListener('pointerover',e=>{orbitHover=!!e.target.closest('.infinity-photo');runOrbit()});container.addEventListener('pointerleave',()=>{orbitHover=false;runOrbit()});container.addEventListener('focusin',e=>{orbitFocus=!!e.target.closest('.infinity-photo');runOrbit()});container.addEventListener('focusout',e=>{orbitFocus=!!e.relatedTarget?.closest?.('.infinity-photo');runOrbit()});motionQuery.addEventListener('change',e=>{orbitPaused=e.matches;orbitLabel();runOrbit()});document.addEventListener('visibilitychange',runOrbit);new ResizeObserver(measureOrbit).observe(container);new IntersectionObserver(entries=>{orbitVisible=entries[0].isIntersecting;runOrbit()},{threshold:.05}).observe(container);
 const viewer=document.createElement('dialog');viewer.id='portfolioBrowser';viewer.className='circle-slideshow';viewer.setAttribute('aria-label','Wedding photo slideshow');viewer.innerHTML='<button class="gallery-close" aria-label="Close gallery">×</button><div class="trio-stage"></div>';document.body.append(viewer);
 viewer.insertAdjacentHTML('afterbegin','<button class="gallery-back" aria-label="Previous photograph" title="Previous photograph">↶</button>');
 const allViewer=document.createElement('dialog');allViewer.className='all-photos';allViewer.innerHTML='<button class="gallery-close" aria-label="Close all photos">×</button><div class="all-photo-grid"></div>';document.body.append(allViewer);allViewer.insertAdjacentHTML('afterbegin','<a class="gallery-instagram" href="https://www.instagram.com/instawedd_weddings/" target="_blank" rel="noopener" aria-label="Instagram instawedd_weddings"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7"/></svg> <span>@instawedd_weddings ↗</span></a>');
 let index=0,timer;const stage=viewer.querySelector('.trio-stage');
 function schedule(){clearTimeout(timer);if(viewer.open&&!document.hidden&&!motionQuery.matches&&photos.length>1)timer=setTimeout(()=>{index=(index+1)%photos.length;show()},2500)}
 stage.innerHTML=photos.map((p,i)=>`<button class="trio-photo" data-photo-index="${i}" aria-label="Open photograph ${i+1}"><img src="${esc(p.url)}" alt="Wedding photograph"></button>`).join('');
 const trioCards=[...stage.querySelectorAll('button')];trioCards.forEach(b=>b.onclick=()=>{index=+b.dataset.photoIndex;show()});
 function show(){trioCards.forEach((b,i)=>{const side=i===index?'centre':i===(index-1+photos.length)%photos.length?'left':i===(index+1)%photos.length?'right':'away';b.dataset.position=side;b.classList.toggle('centre',side==='centre');b.inert=side==='away';b.setAttribute('aria-hidden',String(side==='away'))});schedule()}

 function open(i=0){if(!photos.length)return;index=i;viewer.showModal();show()}
 viewer.querySelector('.gallery-back').onclick=()=>{index=(index-1+photos.length)%photos.length;show()};let wheelAt=0;stage.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)+Math.abs(e.deltaX)<8)return;e.preventDefault();if(Date.now()-wheelAt<450)return;wheelAt=Date.now();index=(index+(e.deltaY+e.deltaX>0?1:-1)+photos.length)%photos.length;show()},{passive:false});
 viewer.querySelector('.gallery-close').onclick=()=>viewer.close();viewer.addEventListener('close',()=>{clearTimeout(timer);runOrbit()});document.addEventListener('visibilitychange',schedule);viewer.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();index=(index+(e.key==='ArrowLeft'?-1:1)+photos.length)%photos.length;show()}});
 allViewer.querySelector('.gallery-close').onclick=()=>allViewer.close();allViewer.querySelector('.all-photo-grid').innerHTML=photos.map((p,i)=>`<button data-photo="${i}" aria-label="Open photograph ${i+1}"><img loading="lazy" src="${esc(p.url)}" alt="Wedding photograph"></button>`).join('');allViewer.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>{allViewer.close();open(+b.dataset.photo)});
 container.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>open(+b.dataset.story));const actions=document.createElement('div');actions.className='portfolio-actions';actions.innerHTML='<button class="btn" id="browsePortfolio">Explore all photos ↗</button>';container.after(actions);actions.querySelector('button').disabled=!photos.length;actions.querySelector('button').onclick=()=>allViewer.showModal();

});
// Keep phone, Instagram and enquiry actions aligned as a single contact group.
const contactContainer=document.querySelector('#contact .container');if(contactContainer){const actions=document.createElement('div');actions.className='contact-actions';contactContainer.querySelectorAll(':scope > .btn').forEach(a=>actions.append(a));contactContainer.append(actions)}
// Every image position has its own replacement and crop state.
galleryPromise.then(data=>{window.websiteSlots=data.slots||[];function apply(root){const imgs=root.matches?.('img')?[root]:[...root.querySelectorAll?.('img')||[]];for(const img of imgs){const slot=(data.slots||[]).find(s=>s.id===img.dataset.imageSlot);if(!slot)continue;img.src=slotSource(slot);img.hidden=!!slot.hidden;img.style.display=slot.hidden?'none':'';img.style.objectFit=slot.fit;img.style.objectPosition=slot.x+'% '+slot.y+'%'}}apply(document.body);new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)}))).observe(document.body,{childList:true,subtree:true})});
