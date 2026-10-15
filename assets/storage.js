/* Cart drafts remain on this browser; accounts, wishlist and journals live on the server. */
window.IWStore={
 uuid:()=>crypto.randomUUID(),
 user:()=>window.Auth?.user||{name:'Guest'},
 read(key,fallback=[]){try{return JSON.parse(localStorage.getItem('iw_v4_'+key))??fallback}catch{return fallback}},
 write(key,value){try{localStorage.setItem('iw_v4_'+key,JSON.stringify(value));return true}catch{alert('Browser storage is full. Remove unused photo previews before closing this page.');return false}},
 escape:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
};
function getCurrentUser(){return window.Auth?.user||null}
// Compact, persistent previews. Original files are attached by the customer in their email app.
async function localPhotoData(file){
 if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type))throw new Error('Please choose a JPG, PNG, WebP or GIF image.');
 if(file.size>15*1024*1024)throw new Error('Please choose an image smaller than 15 MB.');
 const url=URL.createObjectURL(file);
 try{return await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,700/Math.max(img.naturalWidth,img.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.72))};img.onerror=()=>reject(new Error('This image could not be read. Try a JPG or PNG.'));img.src=url})}finally{URL.revokeObjectURL(url)}
}
