init();
if(window.visualViewport){const fullHeight=innerHeight;visualViewport.addEventListener('resize',()=>document.body.classList.toggle('keyboarding',visualViewport.height<fullHeight*.75))}

if(current==='home'&&!params.get('state'))document.querySelector('[data-section=recommend] .product-grid')?.classList.add('scroll-rail');
if(current==='intro'&&!params.get('frame'))setTimeout(()=>go('onboarding-1'),1600);document.addEventListener('click',e=>{const a=e.target.closest('.product-visual a');if(a&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const image=a.querySelector('.product-photo');if(image)image.style.viewTransitionName='product-image'}});

