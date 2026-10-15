'use strict';
(()=>{
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const photo=(name,alt)=>`<img src="image/${name}.png" data-banner-photo="${name}" alt="${alt}" loading="lazy">`;
 const banner=(eyebrow,title,copy,image,link='',label='Explore more')=>`<section class="collection-banner"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${copy}</p>${link?`<a class="btn" href="${link}">${label} →</a>`:''}</div><div class="collection-banner-photo">${photo(image,eyebrow)}</div></section>`;

 const isAbout=location.pathname.endsWith('about.html'),isJournal=location.pathname.endsWith('journal.html');

 if(isJournal){document.body.classList.add('collection-journal');const title=$('.journal-title');if(title){title.innerHTML='<p class="eyebrow">OUR WEDDING JOURNAL</p><h1>A personal space<br>for your <em>big day.</em></h1><p>Capture your thoughts, plan your dreams,<br>keep track of your journey — one page closer<br>to forever.</p>';title.classList.add('collection-journal-banner')}}
 const enhance=()=>{
  const main=$('#portalMain');
  if(main&&!main.dataset.collectionReady&&$('h1',main)){
   main.dataset.collectionReady='true';const page=document.body.dataset.portal;
   if(page==='offers'&&!$('.offer-full',main)){
    const h=$('h1',main);h?.previousElementSibling?.classList.contains('eyebrow')&&h.previousElementSibling.remove();h?.remove();
    const head=document.createElement('div');head.innerHTML=banner('SPECIAL OFFERS','Make your special moments<br>even more special.','Explore our studio offers, created to bring more meaning to your celebration.','gifting-banner');main.prepend(head);
    const row=$('.offer-banner-row',main);if(row){const cards=$$('.offer-banner',row);const tags=[...new Set(cards.map(c=>$('small',c)?.textContent).filter(Boolean))];const filters=document.createElement('div');filters.className='collection-filters';filters.setAttribute('aria-label','Filter offers');for(const tag of ['All Offers',...tags]){const b=document.createElement('button');b.textContent=tag;b.setAttribute('aria-pressed',String(tag==='All Offers'));b.onclick=()=>{cards.forEach(c=>c.hidden=tag!=='All Offers'&&$('small',c)?.textContent!==tag);$$('button',filters).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))};filters.append(b)}row.before(filters)}
   }
   if(page==='services'){
    const box=$('.portal-intro',main),select=$('#serviceFilter',main);
    const paint=()=>{const category=select?.value||'all';const titles={photography:['Photography','Your moments, beautifully remembered.'],makeup:['Makeup & Hair','Beauty that feels like you.'],gifting:['Gifting','Made with love, meant to be cherished.'],events:['Events','Beautiful celebrations, thoughtfully planned.'],planner:['Wedding Planner','Your wedding, one lovely page at a time.'],store:['Our Studio','Visit our studio.'],all:['Our Services','Every detail, thoughtfully planned.']};const d=titles[category]||titles.all;const copy={photography:'Wedding photographs and films that keep your people, emotions and favourite moments close.',makeup:'Bridal and occasion makeup, thoughtfully shaped around your style and celebration.',events:'Thoughtful styling, décor and coordination for the moments you bring everyone together.',planner:'Keep your notes, budget and wedding plans together in your personal journal.',gifting:'Personalised details and keepsakes, made for your favourite people.',store:'Visit our studio to explore frames, albums and gifts, and talk through your plans.'}[category]||'Photography, beauty and thoughtful details for a celebration that feels like you.';const hero={planner:'wedding-journal.png',makeup:'makeup-service.jpeg',events:'event-service.jpeg',gifting:'gifting-banner.png',store:'store-interior.webp'}[category]||'services-hero.jpg';if(box){box.innerHTML=`<section class="service-listing-hero service-hero-${category}"><div><p class="eyebrow">${d[0]}</p><h1>${d[1]}</h1><p>${copy}</p><a class="btn" href="${category==='gifting'?'index.html#gifting':'#serviceResults'}">${category==='gifting'?'Explore gifts':'Explore packages'} ↗</a></div><img src="image/${hero}" alt="${d[0]} at InstaWedd"></section>`;box.classList.add('collection-listing-banner')}};paint();select?.addEventListener('change',paint);
   }
  }
  $$('.gift-shop-hero:not([data-collection-ready])').forEach(el=>{el.dataset.collectionReady='true';const im=$('img',el);if(im){im.src='image/gifting-banner.png';im.classList.add('collection-gift-image')}});
  $$('.portal-account-panel:not([data-collection-ready])').forEach(el=>{el.dataset.collectionReady='true';const label=document.createElement('p');label.className='eyebrow';label.textContent='YOUR PERSONAL SPACE';el.prepend(label)});
  observeReveals();
 };
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('collection-visible');revealObserver.unobserve(e.target)}}),{threshold:.08});
 function observeReveals(){if(motion.matches)return;$$('.collection-banner,.collection-story,.service-list-card,.offer-banner,.journal-invitation-inner,.journey-steps article,.gift-product').forEach((el,i)=>{if(el.dataset.collectionObserved)return;el.dataset.collectionObserved='true';el.classList.add('collection-reveal');el.style.setProperty('--reveal-delay',Math.min(i%3*65,130)+'ms');revealObserver.observe(el)})}
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}}).observe(document.body,{childList:true,subtree:true});enhance();
})();
