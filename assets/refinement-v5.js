/* Consistent navigation and direct manipulation for the photo editor. */
document.querySelector('.shared-toggle')?.addEventListener('click',e=>{const h=e.currentTarget.closest('header'),open=h.classList.toggle('nav-open');e.currentTarget.setAttribute('aria-expanded',String(open))});
(()=>{
 if(!document.getElementById('giftPhotoSlot'))return;
 const slot=document.getElementById('giftPhotoSlot');slot.tabIndex=0;slot.setAttribute('aria-label','Photo framing: scroll to zoom, drag to reposition; keyboard plus and minus zoom, arrows move');
 const help=document.createElement('p');help.className='photo-gesture-help';help.textContent='Scroll to zoom · drag in any direction · double-click to fit';slot.closest('.personalizer-preview-stage').after(help);
 const panLimit=(img,box,axis)=>Math.max(100,((axis==='x'?img.width/box.clientWidth:img.height/box.clientHeight)-1)*100);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function geometry(img,crop,w,h){const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight)*crop.zoom;const width=img.naturalWidth*scale,height=img.naturalHeight*scale;return {width,height,left:(w-width)/2+crop.x*w/200,top:(h-height)/2+crop.y*h/200}}
 function pose(img,crop,box){if(!img.naturalWidth)return;const g=geometry(img,crop,box.clientWidth,box.clientHeight);Object.assign(img.style,{width:g.width+'px',height:g.height+'px',maxWidth:'none',maxHeight:'none',left:g.left+'px',top:g.top+'px',position:'absolute',transform:'none',objectFit:'contain'});img.draggable=false;}
 window.iwDrawCrop=function(source,crop,canvas){const g=geometry(source,crop,canvas.width,canvas.height),ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,g.left,g.top,g.width,g.height)};
 function exportCrop(item,crop,done){const source=slot.querySelector('img')?.getAttribute('src')===item.url&&slot.querySelector('img').complete?slot.querySelector('img'):new Image();const draw=()=>{const canvas=document.createElement('canvas');canvas.width=700;canvas.height=700;iwDrawCrop(source,crop,canvas);item.crop={...crop,version:2};item.cropUrl=canvas.toDataURL('image/jpeg',.9);done?.()};if(source.complete&&source.naturalWidth)draw();else{source.onload=draw;source.src=item.url}}
 const originalPreview=showGiftPreview;showGiftPreview=function(index){originalPreview(index);const item=currentImage(),img=slot.querySelector('img');if(!item||!img)return;img.onload=()=>{if(!item.crop||item.crop.version!==2)item.crop={zoom:Math.min(img.naturalWidth,img.naturalHeight)/Math.max(img.naturalWidth,img.naturalHeight),x:0,y:0,version:2};pose(img,item.crop,slot);saveInline()};img.src=item.url;if(img.complete&&img.naturalWidth)img.onload()};
 new ResizeObserver(()=>{const item=currentImage(),img=slot.querySelector('img');if(item?.crop&&img?.getAttribute('src')===item.url)pose(img,item.crop,slot)}).observe(slot);
 let timer;
 function currentImage(){return uploadedGiftImages[selectedGiftImageIndex]}
 function edit(){const item=currentImage();if(!item)return null;item.crop||={zoom:1,x:0,y:0,version:2};const img=slot.querySelector('img');if(img.getAttribute('src')!==item.url){img.src=item.url;img.onload=()=>pose(img,item.crop,slot)}pose(img,item.crop,slot);return item}
 function saveInline(){const item=currentImage();if(!item)return;clearTimeout(timer);exportCrop(item,{...item.crop},()=>{const thumb=giftUploadPreviews.querySelectorAll('.upload-preview img')[selectedGiftImageIndex];if(thumb)thumb.src=item.cropUrl})}
 document.getElementById('addToCartBtn').addEventListener('click',()=>{if(currentImage()?.crop)saveInline()},{capture:true});
 function changed(){const item=edit();if(!item)return;pose(slot.querySelector('img'),item.crop,slot);clearTimeout(timer);timer=setTimeout(saveInline,150)}
 slot.addEventListener('wheel',e=>{const item=edit();if(!item)return;e.preventDefault();item.crop.zoom=clamp(item.crop.zoom*Math.exp(-e.deltaY*.002),.1,5);changed()},{passive:false});
 slot.addEventListener('dblclick',()=>{const item=edit(),img=slot.querySelector('img');if(!item||!img.naturalWidth)return;item.crop={zoom:Math.min(img.naturalWidth,img.naturalHeight)/Math.max(img.naturalWidth,img.naturalHeight),x:0,y:0,version:2};changed()});
 const pointers=new Map();let pinch=0;
 slot.addEventListener('pointerdown',e=>{if(!edit())return;e.preventDefault();slot.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch=pointers.size===2?distance():0});
 function distance(){const a=[...pointers.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}
 slot.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const item=edit(),prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const d=distance();if(pinch)item.crop.zoom=clamp(item.crop.zoom*d/pinch,.1,5);pinch=d}else{const img=slot.querySelector('img');item.crop.x=clamp(item.crop.x+(e.clientX-prev.x)*200/slot.clientWidth,-panLimit(img,slot,'x'),panLimit(img,slot,'x'));item.crop.y=clamp(item.crop.y+(e.clientY-prev.y)*200/slot.clientHeight,-panLimit(img,slot,'y'),panLimit(img,slot,'y'))}changed()});
 for(const event of ['pointerup','pointercancel'])slot.addEventListener(event,e=>{pointers.delete(e.pointerId);pinch=0;saveInline()});
 slot.addEventListener('keydown',e=>{if(!['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;const item=edit();if(!item)return;e.preventDefault();if(['+','=','-'].includes(e.key))item.crop.zoom=clamp(item.crop.zoom+(e.key==='-'?-.1:.1),.1,5);else{const axis=['ArrowLeft','ArrowRight'].includes(e.key)?'x':'y';item.crop[axis]=clamp(item.crop[axis]+(['ArrowRight','ArrowDown'].includes(e.key)?10:-10),-100,100)}changed()});
 // The crop dialog uses the same geometry as the saved square, with wheel/drag controls.
 const viewport=document.querySelector('.crop-viewport');viewport.tabIndex=0;giftCropZoom.min='.1';giftCropZoom.max='5';giftCropX.min=giftCropY.min='-500';giftCropX.max=giftCropY.max='500';
 updateCropPreview=function(){const crop={zoom:+giftCropZoom.value,x:+giftCropX.value,y:+giftCropY.value};pose(giftCropImage,crop,viewport);giftCropZoomValue.value=crop.zoom.toFixed(2)+'×';giftCropXValue.value=crop.x;giftCropYValue.value=crop.y};
 giftCropImage.addEventListener('load',updateCropPreview);
 viewport.addEventListener('wheel',e=>{e.preventDefault();giftCropZoom.value=clamp(+giftCropZoom.value*Math.exp(-e.deltaY*.002),.1,5);updateCropPreview()},{passive:false});
 let drag;
 viewport.addEventListener('pointerdown',e=>{e.preventDefault();drag={x:e.clientX,y:e.clientY};viewport.setPointerCapture(e.pointerId)});
 viewport.addEventListener('pointermove',e=>{if(!drag)return;giftCropX.value=clamp(+giftCropX.value+(e.clientX-drag.x)*200/viewport.clientWidth,-panLimit(giftCropImage,viewport,'x'),panLimit(giftCropImage,viewport,'x'));giftCropY.value=clamp(+giftCropY.value+(e.clientY-drag.y)*200/viewport.clientHeight,-panLimit(giftCropImage,viewport,'y'),panLimit(giftCropImage,viewport,'y'));drag={x:e.clientX,y:e.clientY};updateCropPreview()});
 viewport.addEventListener('pointerup',()=>drag=null);viewport.addEventListener('pointercancel',()=>drag=null);
 viewport.insertAdjacentHTML('afterend','<p class="photo-gesture-help">Scroll to zoom · drag to position</p>');
})();
