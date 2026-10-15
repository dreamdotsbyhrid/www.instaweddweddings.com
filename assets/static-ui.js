'use strict';
(()=>{
 const gallery=IW_PUBLIC_CONTENT['/api/gallery'];
 const slots=new Map(gallery.slots.map(s=>[s.id,s]));
 const media=new Map(gallery.media.map(s=>[s.url,s]));
 function message(text){const n=document.createElement('p');n.className='static-notice';n.setAttribute('role','status');n.textContent=text;document.body.append(n);setTimeout(()=>n.remove(),5000)}
 function whatsapp(text){window.open('https://wa.me/919605509516?text='+encodeURIComponent(text),'_blank','noopener,noreferrer')}
 function refresh(root=document){
  const images=[...(root.matches?.('img')?[root]:[]),...root.querySelectorAll?.('img')||[]];
  for(const image of images){
   const raw=image.getAttribute('src');if(!raw||raw.startsWith('data:'))continue;
   const url=new URL(raw,location.href),id=image.dataset.imageSlot||url.searchParams.get('slot'),slot=slots.get(id);
   const rule=slot||media.get(raw.split('?')[0]);
   if(rule?.hidden){image.hidden=true;continue;}
   let next=raw.replace(/^\/uploads\//,'uploads/');
   if(slot?.replacement)next='uploads/'+slot.replacement;
   else if(!slot&&rule?.replacement)next='uploads/'+rule.replacement;
   if(next!==raw)image.setAttribute('src',next);
   if(slot){image.style.objectPosition=`${slot.x??50}% ${slot.y??50}%`;image.style.objectFit=slot.fit||'cover';}
  }
  root.querySelectorAll?.('a[href^="account.html"],a[href^="owner.html"],a[href^="order.html"]').forEach(a=>a.remove());
  root.querySelectorAll?.('[data-gift-buy]').forEach(b=>{if(b.textContent!=='Enquire')b.textContent='Enquire'});
  root.querySelectorAll?.('form.service-enquiry-form button.btn,#enquiryForm button[value="website"]').forEach(b=>{if(b.textContent!=='Enquire on WhatsApp')b.textContent='Enquire on WhatsApp'});
 }
 document.addEventListener('submit',e=>{
  const form=e.target;if(!form.matches('#enquiryForm,.service-enquiry-form'))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!form.reportValidity())return;
  const values=Object.fromEntries(new FormData(form));
  const text=`Hello InstaWedd!\nName: ${values.customer||''}\nContact: ${values.contact||''}\nService: ${values.service||document.querySelector('h1')?.textContent||'Wedding services'}\nDate: ${values.date||'To discuss'}\nVenue: ${values.venue||'To discuss'}\n\n${values.message||''}`;
  const channel=e.submitter?.value;
  if(channel==='email')location.href='mailto:instaweddweddingphotography@gmail.com?subject=InstaWedd%20enquiry&body='+encodeURIComponent(text);
  else if(channel==='copy')navigator.clipboard.writeText(text).then(()=>message('Message copied.')).catch(()=>message('Please copy the details from the form.'));
  else whatsapp(text);
  const status=form.querySelector('.form-status,#enquiryStatus,[role="status"]');if(status)status.textContent='Review the message in your chosen app and press Send. Your enquiry is not submitted on this page.';
 },true);
 document.addEventListener('click',e=>{
  const buy=e.target.closest('[data-gift-buy],#giftCartBuyBtn,#photoPrintBtn,#checkoutPayBtn,#cartCheckout,[data-enquire-offer]');
  if(buy){e.preventDefault();e.stopImmediatePropagation();
   const product=IW_PUBLIC_CONTENT['/api/products'].products.find(p=>p.id===buy.dataset.giftBuy);
   const offer=IW_PUBLIC_CONTENT['/api/offers'].offers[buy.dataset.enquireOffer];
   whatsapp('Hello InstaWedd! Please share availability and details for '+(product?.name||offer?.title||'a personalised gift')+'.');return;
  }
 },true);
 window.renderOrderReview=()=>whatsapp('Hello InstaWedd! I would like to enquire about a gift.');
 refresh();
 new MutationObserver(records=>{for(const r of records){if(r.type==='attributes')refresh(r.target);else for(const node of r.addedNodes)if(node.nodeType===1)refresh(node);}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
})();
