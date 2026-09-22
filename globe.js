(() => {
  const orb = document.querySelector('.hero .orb');
  if (!orb) return;
  orb.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  orb.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Stylized continent silhouettes, in longitude / latitude coordinates.
  const land = [
    [[-168,68],[-140,70],[-125,58],[-125,48],[-117,32],[-100,18],[-85,9],[-77,24],[-81,30],[-65,47],[-55,52],[-80,65],[-110,73]],
    [[-81,12],[-67,10],[-50,0],[-35,-7],[-40,-22],[-54,-35],[-68,-55],[-75,-40],[-80,-10]],
    [[-18,35],[0,37],[12,33],[33,31],[43,12],[51,11],[40,-13],[32,-31],[18,-35],[10,-20],[3,3],[-15,12]],
    [[-10,36],[-9,44],[5,49],[10,58],[25,71],[45,68],[60,73],[100,76],[140,68],[177,60],[160,50],[140,45],[130,31],[121,20],[106,5],[96,20],[78,7],[68,24],[50,30],[35,42],[25,37],[14,42]],
    [[112,-11],[130,-10],[143,-16],[154,-27],[145,-39],[128,-34],[114,-24]],
    [[-54,59],[-44,60],[-20,76],[-30,83],[-58,80]],
    [[47,-13],[51,-16],[49,-25],[44,-23]],
    [[130,32],[141,45],[145,43],[140,34]],
    [[96,5],[115,0],[131,-5],[140,-9],[112,-8]],
    [[-9,50],[-3,51],[0,58],[-6,59]]
  ];
  function inside(x,y,polygon) {
    let result=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
      const [a,b]=polygon[i], [c,d]=polygon[j];
      if((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a) result=!result;
    }
    return result;
  }
  const points=[];
  for(let lat=-78;lat<82;lat+=1.5) {
    for(let lon=-180;lon<180;lon+=1.5/Math.cos(lat*Math.PI/180)) {
      const earth=land.some(p=>inside(lon,lat,p));
      const hash=Math.abs(Math.sin(lon*12.9898+lat*78.233));
      if(earth || hash>.84) points.push({lat:lat*Math.PI/180,lon:lon*Math.PI/180,earth,hash});
    }
  }
  let size=0,raf=0,visible=true,angle=-.25,last=0;
  function resize(){size=orb.clientWidth;const dpr=Math.min(devicePixelRatio,2);canvas.width=size*dpr;canvas.height=size*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function draw(){
    ctx.clearRect(0,0,size,size);
    const c=size/2,r=size*.445;
    const halo=ctx.createRadialGradient(c,c,r*.65,c,c,r*1.12);
    halo.addColorStop(0,'#101526');halo.addColorStop(.8,'#10243c');halo.addColorStop(.89,'#5a9cdd55');halo.addColorStop(1,'#6399e000');
    ctx.fillStyle=halo;ctx.fillRect(0,0,size,size);
    ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.fillStyle='#090f1b';ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.clip();
    for(const p of points){
      const longitude=p.lon+angle,cos=Math.cos(p.lat),z=cos*Math.cos(longitude);
      if(z<0)continue;
      const x=c+r*cos*Math.sin(longitude),y=c-r*Math.sin(p.lat);
      ctx.fillStyle=p.earth?`rgba(135,194,255,${.35+z*.55})`:`rgba(103,143,202,${.12+z*.2})`;
      const dot=(p.earth?.7:.4)*Math.max(.65,size/850)*(0.7+p.hash*.6);
      ctx.beginPath();ctx.arc(x,y,dot,0,Math.PI*2);ctx.fill();
      if(p.earth&&p.hash>.994){ctx.fillStyle='#d3e7ff';ctx.fillRect(x-1,y-1,2,2);}
    }
    ctx.strokeStyle='#659bdc18';ctx.lineWidth=.6;
    for(let lat=-60;lat<=60;lat+=20){const y=c-r*Math.sin(lat*Math.PI/180),rr=r*Math.cos(lat*Math.PI/180);ctx.beginPath();ctx.ellipse(c,y,rr,rr*.04,0,0,Math.PI*2);ctx.stroke();}
    for(let k=0;k<8;k++){ctx.beginPath();ctx.ellipse(c,c,r*Math.abs(Math.sin(angle+k*Math.PI/8)),r,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
    const shade=ctx.createLinearGradient(0,0,0,size);shade.addColorStop(0,'#090b1100');shade.addColorStop(.6,'#090b1120');shade.addColorStop(1,'#090b11dd');ctx.fillStyle=shade;ctx.fillRect(0,0,size,size);
  }
  function frame(now){raf=0;if(!visible||document.hidden||reduced.matches){last=0;return;}if(last)angle+=Math.min(now-last,60)*.000025;last=now;draw();raf=requestAnimationFrame(frame);}
  function resume(){if(!raf&&visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(frame);else draw();}
  new ResizeObserver(resize).observe(orb);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(orb);
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  addEventListener('pagehide',()=>cancelAnimationFrame(raf));
})();
