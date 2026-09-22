/* FORME hero: framework-free, per-slide durations in milliseconds. */
(() => {
  const slides = [
    { image:'hero.png', mobile:'mobile-v2.png', duration:6000, label:'THE SHELL', eyebrow:'COLLECTION 01 — AUTUMN 2026', title:'Room<br>to be you.', text:'정해진 틀 밖으로.<br>나만의 여유를 입는 방식.', cta:'새로운 컬렉션 만나기', url:'list.html', alt:'아이보리 쉘 재킷과 차콜 팬츠를 입은 남성의 전신 착장' },
    { image:'hero-blazer.png', mobile:'hero-blazer-mobile.png', duration:7000, label:'THE TAILORING', eyebrow:'THE EVERYDAY EDIT — RELAXED TAILORING', title:'Ease,<br>in every line.', text:'어깨의 힘은 덜고, 선은 또렷하게.<br>일상과 취향 사이의 균형.', cta:'릴랙스 블레이저 보기', url:'detail.html?id=blazer', alt:'밝은 석조 공간에서 차콜 블레이저를 입은 남성의 전신 착장' },
    { image:'hero-knit.png', mobile:'hero-knit-mobile.png', duration:6000, label:'THE TEXTURE', eyebrow:'A QUIETER SEASON — SOFT TEXTURES', title:'A softer<br>kind of day.', text:'차분한 색, 부드러운 형태.<br>서두르지 않는 하루를 위해.', cta:'소프트 니트 만나기', url:'detail.html?id=knit', alt:'따뜻한 빛의 공간에서 브라운 니트와 밝은 팬츠를 입은 남성의 전신 착장' }
  ];
  let teardown = () => {};
  window.initHeroSlider = () => {
    teardown();
    const root=document.querySelector('.hero');
    if(!root)return;
    root.classList.add('hero-slider');
    root.setAttribute('aria-roledescription','캐러셀');
    root.setAttribute('aria-label','FORME 컬렉션, 3개의 슬라이드');
    root.innerHTML=slides.map((s,i)=>`<div class="hero-slide ${i===0?'is-active':''}" data-slide="${i}" role="group" aria-roledescription="슬라이드" aria-label="${i+1} / 3 — ${s.label}" aria-hidden="${i!==0}" ${i?'inert':''} style="--stay:${s.duration}ms"><picture><source media="(max-width:700px)" srcset="images/${s.mobile}"><img src="images/${s.image}" alt="${s.alt}" ${i?'loading="eager"':'fetchpriority="high"'} decoding="async"></picture><div class="hero-copy"><span class="eyebrow">${s.eyebrow}</span><${i?'h2':'h1'} class="hero-title">${s.title}</${i?'h2':'h1'}><p>${s.text}</p><a class="btn" href="${s.url}">${s.cta} ↗</a></div></div>`).join('')+`<div class="hero-controls"><div class="hero-pagination" role="group" aria-label="슬라이드 선택">${slides.map((s,i)=>`<button type="button" class="hero-step ${i===0?'is-current':''}" data-hero-go="${i}" aria-label="${i+1}번 ${s.label}, ${s.duration/1000}초" aria-current="${i===0?'true':'false'}"><span class="hero-step-label"><span>0${i+1}</span><span>${s.label}</span></span><span class="hero-track"><span class="hero-fill"></span></span></button>`).join('')}</div><div class="hero-playback"><button type="button" class="hero-arrow" data-hero-prev aria-label="이전 슬라이드">←</button><button type="button" class="hero-toggle" aria-label="자동 슬라이드 일시정지" aria-pressed="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg></button><button type="button" class="hero-arrow" data-hero-next aria-label="다음 슬라이드">→</button></div></div><div class="hero-meta"><span>FORME / EVERYDAY UNIFORM</span><span class="hero-time">01 / 03 · 6 SECONDS</span><a href="#collection">SCROLL TO EXPLORE ↓</a></div><span class="hero-announcement sr-only" role="status"></span>`;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const panels=[...root.querySelectorAll('.hero-slide')],steps=[...root.querySelectorAll('.hero-step')],fills=[...root.querySelectorAll('.hero-fill')],toggle=root.querySelector('.hero-toggle');
    let current=0,elapsed=0,last=performance.now(),raf=0,paused=media.matches,inView=true,focused=false,touchStart=null,destroyed=false;
    const updateToggle=()=>{toggle.setAttribute('aria-label',paused?'자동 슬라이드 재생':'자동 슬라이드 일시정지');toggle.setAttribute('aria-pressed',String(paused));toggle.innerHTML=paused?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>';};
    const paint=()=>fills.forEach((f,i)=>f.style.transform=`scaleX(${i===current?Math.min(1,elapsed/slides[current].duration):0})`);
    const select=(index,manual=false)=>{
      const next=(index+slides.length)%slides.length;
      const nextImage=panels[next].querySelector('img');
      if(!nextImage.complete||!nextImage.naturalWidth)return;
      current=next;elapsed=0;last=performance.now();
      panels.forEach((panel,i)=>{panel.classList.toggle('is-active',i===current);panel.setAttribute('aria-hidden',String(i!==current));panel.inert=i!==current;steps[i].classList.toggle('is-current',i===current);steps[i].setAttribute('aria-current',String(i===current));});
      root.querySelector('.hero-time').textContent=`0${current+1} / 03 · ${slides[current].duration/1000} SECONDS`;
      if(manual)root.querySelector('.hero-announcement').textContent=`${current+1} / 3, ${slides[current].label}`;
      paint();
    };
    const tick=now=>{
      if(destroyed)return;
      const currentImage=panels[current].querySelector('img');
      const running=!paused&&!document.hidden&&inView&&!focused&&currentImage.complete&&currentImage.naturalWidth>0;
      root.classList.toggle('is-paused',!running);
      if(running){elapsed+=Math.min(now-last,100);paint();if(elapsed>=slides[current].duration)select(current+1);}
      last=now;raf=requestAnimationFrame(tick);
    };
    const onClick=e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('[data-hero-go]'))select(Number(b.dataset.heroGo),true);if(b.matches('[data-hero-prev]'))select(current-1,true);if(b.matches('[data-hero-next]'))select(current+1,true);if(b===toggle){paused=!paused;updateToggle();if(!paused){focused=false;toggle.blur();}}};
    const onKey=e=>{if(!e.target.closest('.hero-controls'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(current+(e.key==='ArrowRight'?1:-1),true);steps[current].focus();}};
    const onFocus=e=>{if(e.target.matches(':focus-visible'))focused=true;};
    const onBlur=e=>{if(!root.contains(e.relatedTarget))focused=false;};
    const onTouchStart=e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};};
    const onTouchEnd=e=>{if(!touchStart)return;let dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)select(current+(dx<0?1:-1),true);touchStart=null;};
    const onMotion=()=>{if(media.matches){paused=true;updateToggle();}};
    root.addEventListener('click',onClick);root.addEventListener('keydown',onKey);root.addEventListener('focusin',onFocus);root.addEventListener('focusout',onBlur);root.addEventListener('touchstart',onTouchStart,{passive:true});root.addEventListener('touchend',onTouchEnd,{passive:true});media.addEventListener('change',onMotion);
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;last=performance.now();},{threshold:.15});observer.observe(root);updateToggle();paint();raf=requestAnimationFrame(tick);
    teardown=()=>{destroyed=true;cancelAnimationFrame(raf);observer.disconnect();media.removeEventListener('change',onMotion);root.removeEventListener('click',onClick);root.removeEventListener('keydown',onKey);root.removeEventListener('focusin',onFocus);root.removeEventListener('focusout',onBlur);root.removeEventListener('touchstart',onTouchStart);root.removeEventListener('touchend',onTouchEnd);};
  };
  window.initHeroSlider();
})();
