/* Reveal deep links only after the current layout is in place. */
(()=>{
 const root=document.documentElement,home=location.pathname.endsWith('/index.html')||location.pathname.endsWith('/');
 let touched=false,ready=false;
 for(const event of ['wheel','touchstart','pointerdown','keydown'])addEventListener(event,()=>touched=true,{once:true,passive:true});
 function align(){if(!home||!location.hash||touched)return;const target=document.getElementById(location.hash.slice(1));if(!target)return;document.body.classList.remove('intro-active');target.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));target.scrollIntoView({behavior:'instant',block:'start'})}
 async function finish(){if(ready)return;ready=true;await Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,300))]);requestAnimationFrame(()=>{align();clearTimeout(window.iwRouteFallback);root.classList.remove('route-pending','return-pending')})}
 addEventListener('iw-portal-ready',finish,{once:true});addEventListener('pageshow',e=>{if(e.persisted){root.classList.remove('route-pending','return-pending');align()}});
 if(document.body.classList.contains('gifting-page'))document.querySelectorAll('a[href^="#"]').forEach(a=>{if(['home','portfolio','photography','bridal','events','studio','serviceJourney'].includes(a.hash.slice(1)))a.href='index.html'+a.hash});
})();
