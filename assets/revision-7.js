(()=>{
 const homePage=location.pathname.endsWith('/index.html')||location.pathname.endsWith('/');
 let touched=false;for(const event of ['wheel','touchstart','pointerdown','keydown'])addEventListener(event,()=>touched=true,{once:true,passive:true});
 function align(){if(!homePage||!location.hash||touched)return;const target=document.getElementById(location.hash.slice(1));if(!target)return;document.documentElement.classList.remove('return-pending');document.body.classList.remove('intro-active');target.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));target.scrollIntoView({behavior:'instant',block:'start'})}
 addEventListener('iw-portal-ready',()=>requestAnimationFrame(align));addEventListener('load',align);addEventListener('pageshow',()=>requestAnimationFrame(align));document.fonts?.ready.then(align);
 if(document.body.classList.contains('gifting-page'))document.querySelectorAll('a[href^="#"]').forEach(a=>{if(['home','portfolio','photography','bridal','events','studio','serviceJourney'].includes(a.hash.slice(1)))a.href='index.html'+a.hash});
})();
