(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stages=[...document.querySelectorAll('.device-stage')].map(el=>({el,current:0,target:0}));
 let raf=0;
 function update(){stages.forEach(s=>{const r=s.el.getBoundingClientRect();s.target=reduced.matches?0:Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)))});if(!raf)raf=requestAnimationFrame(draw)}
 function draw(){raf=0;let moving=false;stages.forEach(s=>{s.current+= (s.target-s.current)*.075;if(reduced.matches)s.current=0;const p=s.current,d=innerWidth<761?80:170;s.el.querySelector('.desktop-device').style.transform='translate3d(0,'+(-p*d)+'px,0)';s.el.querySelector('.mobile-device').style.transform='translate3d(0,'+(-p*d*1.65)+'px,0)';moving ||= Math.abs(s.current-s.target)>.001});
 document.querySelectorAll('.kinetic-title').forEach(el=>{const r=el.getBoundingClientRect(),p=reduced.matches?0:Math.max(-1,Math.min(1,(innerHeight*.5-r.top)/innerHeight));el.querySelectorAll('.title-row').forEach((row,i)=>row.style.transform='translate3d(0,'+(-p*(i?38:16))+'px,'+(i?25:0)+'px) rotateX('+p*5+'deg)')});
 document.querySelectorAll('.project-visual').forEach(el=>{const r=el.getBoundingClientRect(),p=reduced.matches?0:Math.max(-1,Math.min(1,(innerHeight*.5-r.top)/innerHeight));el.style.setProperty('--float-y',p*-14+'px')});
 if(moving)raf=requestAnimationFrame(draw)}
 function resize(){document.querySelectorAll('.desktop-window').forEach(el=>el.querySelector('iframe').style.transform='scale('+el.clientWidth/1440+')');update()}
 addEventListener('scroll',update,{passive:true});addEventListener('resize',resize);reduced.addEventListener('change',update);const ro=new ResizeObserver(resize);document.querySelectorAll('.desktop-window').forEach(el=>ro.observe(el));resize();
 // Preserve heading semantics and line breaks while animating individual glyphs.
 const splitText=(root, className)=>{
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   let index=0;
   nodes.forEach(node=>{
     const fragment=document.createDocumentFragment();
     // Keep words together so responsive wrapping never splits a word.
     node.textContent.split(/(\\s+)/).forEach(word=>{
       if(!word)return;
       if(/^\\s+$/.test(word)){fragment.append(document.createTextNode(word));return}
       const group=document.createElement('span');group.className='glyph-word';
       Array.from(word).forEach(char=>{const glyph=document.createElement('span');glyph.className=className;glyph.textContent=char;glyph.style.setProperty('--glyph-delay',Math.min(index++,42)*28+'ms');group.append(glyph)});
       fragment.append(group);
     });node.replaceWith(fragment);
   });
 };
 const headings=[...document.querySelectorAll('section h2,.compact h3,.strategy-title h3,.results h3')];
 const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{
   if(e.isIntersecting){e.target.classList.add('heading-visible');reveal.unobserve(e.target)}
 }),{threshold:.12});
 headings.forEach(el=>{
   el.setAttribute('aria-label',el.innerText);
   const content=document.createElement('span');content.setAttribute('aria-hidden','true');
   while(el.firstChild)content.append(el.firstChild);
   el.append(content);splitText(content,'reveal-glyph');el.classList.add('glyph-heading');
   if(reduced.matches)el.classList.add('heading-visible');else reveal.observe(el);
 });
 const titles=[...document.querySelectorAll('.kinetic-title')].map(el=>{
   const rows=[...el.querySelectorAll('.title-row')];
   rows.forEach(row=>{row.setAttribute('aria-hidden','true');splitText(row,'flip-glyph')});
   return {el,rows,index:0};
 });
 let timers=[];
 const interval=setInterval(()=>{
   if(reduced.matches||document.hidden)return;
   titles.forEach(title=>{
     const rect=title.el.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;
     const phrases=title.el.dataset.phrases.split(';');title.index=(title.index+1)%phrases.length;
     const lines=phrases[title.index].split('|');
     title.rows.forEach((row,lineIndex)=>{
       const oldChars=Array.from(row.textContent),newChars=Array.from(lines[lineIndex]);
       row.replaceChildren();
       for(let i=0;i<Math.max(oldChars.length,newChars.length);i++){
         const glyph=document.createElement('span');glyph.className='flip-glyph';
         glyph.textContent=(oldChars[i]||' ').replace(/ /g,'\u00a0');row.append(glyph);
         const delay=i*48+lineIndex*170;
         timers.push(setTimeout(()=>{
           const animation=glyph.animate([
             {transform:'perspective(400px) rotateX(0deg)',opacity:1},
             {transform:'perspective(400px) rotateX(-90deg)',opacity:0}
           ],{duration:220,easing:'ease-in',fill:'forwards'});
           animation.onfinish=()=>{
             glyph.textContent=(newChars[i]||'').replace(/ /g,'\u00a0');
             animation.cancel();
             glyph.animate([{transform:'perspective(400px) rotateX(90deg)',opacity:0},{transform:'perspective(400px) rotateX(0deg)',opacity:1}],{duration:360,easing:'cubic-bezier(.2,.8,.2,1)'});
           };
         },delay));
       }
     });
   });
 },5200);
 reduced.addEventListener('change',()=>{if(reduced.matches){
   headings.forEach(el=>el.classList.add('heading-visible'));
   timers.forEach(clearTimeout);timers=[];
   titles.forEach(t=>t.rows.forEach((row,i)=>{row.getAnimations({subtree:true}).forEach(a=>a.cancel());row.textContent=t.el.dataset.phrases.split(';')[t.index].split('|')[i];splitText(row,'flip-glyph')}));
 }});
 addEventListener('pagehide',()=>{clearInterval(interval);timers.forEach(clearTimeout)});
 const counter=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;counter.unobserve(e.target);const count=+e.target.dataset.count,start=performance.now();function tick(now){const p=reduced.matches?1:Math.min(1,(now-start)/1400);e.target.textContent=Math.round(count*(1-(1-p)**3)).toLocaleString('ko-KR');if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}),{threshold:.5});document.querySelectorAll('[data-count]').forEach(el=>counter.observe(el));
})();
