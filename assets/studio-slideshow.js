'use strict';
(()=>{
 const box=document.querySelector('.studio-slideshow');if(!box)return;
 const frames=[...box.querySelectorAll('img')];if(!frames.length)return;
 let index=0,hovered=false,timer;
 const paint=()=>frames.forEach((img,i)=>{img.hidden=i!==index;img.classList.toggle('studio-current',i===index)});
 function schedule(){clearTimeout(timer);if(hovered||document.hidden||frames.length<2)return;timer=setTimeout(()=>{index=(index+1)%frames.length;paint();schedule()},4000)}
 box.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;hovered=true;clearTimeout(timer)});
 box.addEventListener('pointerleave',()=>{hovered=false;schedule()});
 document.addEventListener('visibilitychange',schedule);
 paint();schedule();
})();
