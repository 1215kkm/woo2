// Drive local portfolio previews only; the delivered source folders remain untouched.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const frames=[...document.querySelectorAll('.shop-case iframe')];
 const indices=new WeakMap();
 const timer=setInterval(()=>{
   if(document.hidden||reduced.matches)return;
   frames.forEach(frame=>{
     const bounds=frame.closest('.device-stage').getBoundingClientRect();
     if(bounds.bottom<0||bounds.top>innerHeight)return;
     try{
       const doc=frame.contentDocument;if(!doc||doc.readyState!=='complete')return;
       const src=frame.getAttribute('src');
       if(src.includes('/forme/')){
         // Pause its viewport-sensitive timer, then advance on the preview clock.
         const toggle=doc.querySelector('.hero-toggle');
         if(toggle?.getAttribute('aria-pressed')==='false')toggle.click();
         doc.querySelector('[data-hero-next]')?.click();
       }else if(src.includes('/wellife/')){
         doc.querySelector('.hero-swiper')?.swiper?.slideNext();
       }else if(src.includes('/afterclass/')){
         const hero=doc.querySelector('.fullscreen-hero');
         const pic=hero?.querySelector('picture'),img=pic?.querySelector('img');
         if(!img)return;
         const slides=[
           ['images/hero-fullscreen.png','images/look-fullbody.png','가을 컬렉션 캠페인'],
           ['images/editorial.png','images/editorial.png','방과 후 스타일 에디토리얼'],
           ['images/look-fullbody.png','images/look-fullbody.png','가을 데일리 스타일']
         ];
         const next=((indices.get(frame)||0)+1)%slides.length;
         const pre=new frame.contentWindow.Image();pre.src=slides[next][0];
         pre.onload=()=>{
           indices.set(frame,next);
           pic.querySelector('source')?.setAttribute('srcset',slides[next][1]);
           img.src=slides[next][0];img.alt=slides[next][2];
           pic.animate([{opacity:.25},{opacity:1}],{duration:800,easing:'ease-out'});
           hero.dataset.previewSlide=next;
         };
       }
     }catch(error){console.warn('Preview slideshow:',error.message)}
   });
 },4200);
 addEventListener('pagehide',()=>clearInterval(timer));
})();
