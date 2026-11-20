/* =====================================================================
   deck.js — 충남교총 〈교.바.시〉 자율연수 공용 슬라이드 엔진 (의존성 없음)
   사용법은 assets/AUTHORING.md 참고.
   ===================================================================== */
(function(){
'use strict';
var D=document, H=D.documentElement, B=D.body, W=window;
var $=function(s,r){return (r||D).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))};
var Q=location.search;
var reduce=W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var LITE=/[?&]lite/.test(Q)||(!/[?&]full/.test(Q)&&((navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)||(navigator.deviceMemory&&navigator.deviceMemory<=2)));
if(LITE)H.classList.add('lite');
if(/[?&]reveal/.test(Q))H.classList.add('reveal');

var cfg={
  deck:B.dataset.deck||'deck',
  part:B.dataset.part||'',
  title:B.dataset.title||D.title,
  hub:B.dataset.hub||'../',
  start:B.dataset.start||'',
  end:B.dataset.end||''
};
var LS='cnfta:'+cfg.deck+':';
function store(k,v){try{if(v===undefined)return localStorage.getItem(LS+k);if(v===null)localStorage.removeItem(LS+k);else localStorage.setItem(LS+k,v)}catch(e){return null}}

var ICON={
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  full:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  memo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v12l-4 4H5z"/><path d="M9 9h6M9 13h4"/></svg>',
  zoom:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M11 8.5v5M8.5 11h5"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  reset:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/></svg>'
};

/* ---------------- 구조 만들기 ---------------- */
var deck=$('.deck');
if(!deck){console.warn('[deck] .deck 요소가 없습니다');return}
B.classList.add('deck-page');
var vp=D.createElement('div');vp.id='vp';
var stage=D.createElement('div');stage.id='stage';
deck.parentNode.insertBefore(vp,deck);vp.appendChild(stage);
var bg=D.createElement('div');bg.className='aw-bg';bg.setAttribute('aria-hidden','true');stage.appendChild(bg);
stage.appendChild(deck);
(function sparkles(){
  var S=[[6,16,26,.8,5.5],[14,72,18,.6,6.2],[24,9,14,.55,4.8],[38,88,20,.5,7],[52,6,16,.6,5.2],[63,92,14,.5,6.5],[71,14,24,.75,5.8],[84,30,16,.55,6.8],[93,62,22,.7,5],[88,8,14,.5,7.2],[46,52,12,.35,6]];
  var P=[[10,40,7,.45],[19,86,5,.35],[33,20,6,.4],[58,80,8,.35],[77,46,5,.4],[90,90,7,.35],[67,4,5,.3],[3,64,6,.35]];
  S.forEach(function(s,i){var e=D.createElement('i');e.className='spk';e.style.cssText='left:'+s[0]+'%;top:'+s[1]+'%;--s:'+s[2]+'px;--o:'+s[3]+';--d:'+s[4]+'s;--dl:-'+(i*.7)+'s';bg.appendChild(e)});
  P.forEach(function(p){var e=D.createElement('i');e.className='dot';e.style.cssText='left:'+p[0]+'%;top:'+p[1]+'%;--s:'+p[2]+'px;--o:'+p[3];bg.appendChild(e)});
})();
var hud=D.createElement('div');hud.id='hud';
hud.innerHTML='<a class="hub" href="'+cfg.hub+'" title="연수 전체 안내로">'+ICON.home+'<span>전체 안내</span></a>'+
  '<div class="part">'+(cfg.part?'<b>'+cfg.part+'</b>':'')+'<span></span></div><div class="sp"></div>'+
  '<div class="clock" title="교사용: 계획 시각과 현재 시각"></div><div class="cnt"></div>';
$('.part span',hud).textContent=cfg.title;
stage.appendChild(hud);
var nav=D.createElement('div');nav.id='nav';
nav.innerHTML='<button class="grid-b" title="목록 보기 (G)" aria-label="목록 보기">'+ICON.grid+'</button><button class="prev" aria-label="이전">'+ICON.prev+'</button><button class="next" aria-label="다음">'+ICON.next+'</button>';
stage.appendChild(nav);
var tools=D.createElement('div');tools.id='tools';
tools.innerHTML='<button class="t-full" title="전체 화면 (F)">'+ICON.full+'<span>전체 화면</span></button><button class="t-teacher" title="교사용 메모 (T)">'+ICON.memo+'<span>교사 메모</span></button>';
stage.appendChild(tools);
var bar=D.createElement('div');bar.id='bar';stage.appendChild(bar);
var grid=D.createElement('div');grid.id='grid';
grid.innerHTML='<div class="gh"><h4>슬라이드 목록</h4><button class="btn ghost sm g-x">'+ICON.x.replace('<svg','<svg width="20" height="20"')+' 닫기</button></div><div class="gl"></div>';
stage.appendChild(grid);
var toastEl=D.createElement('div');toastEl.id='toast';toastEl.setAttribute('role','status');stage.appendChild(toastEl);
/* 모달은 무대 안에서 떠야 크기가 맞음 */
$$('.modal').forEach(function(m){stage.appendChild(m)});

/* 숫자 카운트업: 기본값은 최종 숫자 */
$$('[data-count]').forEach(function(e){if(!e.textContent.trim())e.textContent=(+e.dataset.count).toLocaleString('ko-KR')+(e.dataset.suffix||'')});
/* 젤리·실버 글자: data-text 자동 채우기 */
$$('.jelly,.silver').forEach(function(e){if(!e.dataset.text)e.dataset.text=e.textContent});

/* ---------------- 애니메이션 도우미 (Web Animations API) ---------------- */
function anim(el,frames,o){
  if(!el||!el.animate||reduce)return {finished:Promise.resolve(),cancel:function(){}};
  o=o||{};
  return el.animate(frames,{duration:o.d||600,delay:o.delay||0,easing:o.ease||'cubic-bezier(.2,.8,.2,1)',fill:o.fill||'both'});
}
var IN={
  up:[{opacity:0,transform:'translateY(42px)'},{opacity:1,transform:'none'}],
  down:[{opacity:0,transform:'translateY(-36px)'},{opacity:1,transform:'none'}],
  left:[{opacity:0,transform:'translateX(-60px)'},{opacity:1,transform:'none'}],
  right:[{opacity:0,transform:'translateX(60px)'},{opacity:1,transform:'none'}],
  pop:[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.06)',offset:.7},{opacity:1,transform:'none'}],
  zoom:[{opacity:0,transform:'scale(1.12)'},{opacity:1,transform:'none'}],
  blur:[{opacity:0,filter:'blur(16px)',transform:'translateY(16px)'},{opacity:1,filter:'blur(0)',transform:'none'}],
  fade:[{opacity:0},{opacity:1}]
};
function playIn(scope,base){
  var list=$$('[data-in]',scope).filter(function(e){return !e.closest('[data-frag]')||e.hasAttribute('data-frag')});
  list.forEach(function(e,i){
    var k=e.dataset.in||'up';if(!IN[k])k='up';
    var dl=(base||0)+(e.dataset.delay?+e.dataset.delay:i*110);
    anim(e,IN[k],{d:k==='pop'?640:700,delay:dl,fill:'backwards'});
  });
  $$('.jelly',scope).forEach(function(e,i){if(e.closest('[data-in]'))return;anim(e,IN.pop,{d:760,delay:(base||0)+120+i*120,fill:'backwards'})});
  counters(scope);
  $$('.flow-line',scope).forEach(function(fl){$$('.fl',fl).forEach(function(n,i){anim(n,IN.pop,{d:560,delay:(base||0)+300+i*160,fill:'backwards'})})});
}
function counters(scope){
  $$('[data-count]',scope).forEach(function(e){
    var to=parseFloat(e.dataset.count)||0,suf=e.dataset.suffix||'',dur=+e.dataset.dur||1300,t0=null,fmt=function(v){return Math.round(v).toLocaleString('ko-KR')+suf};
    if(reduce){e.textContent=fmt(to);return}
    e.textContent=fmt(0);
    function step(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur);p=1-Math.pow(1-p,3);e.textContent=fmt(to*p);if(p<1)requestAnimationFrame(step)}
    setTimeout(function(){requestAnimationFrame(step)},+e.dataset.delay||250);
  });
}

/* ---------------- 토스트 ---------------- */
var toastT;
function toast(msg,ms){
  toastEl.innerHTML=msg;clearTimeout(toastT);
  anim(toastEl,[{opacity:0,transform:'translate(-50%,-50%) scale(.85)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{d:320,ease:'cubic-bezier(.34,1.56,.64,1)'});
  toastT=setTimeout(function(){anim(toastEl,[{opacity:1},{opacity:0}],{d:350,fill:'forwards'})},ms||2300);
}

/* ---------------- 무대 맞춤 / 흐름 모드 ---------------- */
function wantFlow(){
  if(/[?&]stage/.test(Q))return false;if(/[?&]flow/.test(Q))return true;
  var w=innerWidth,h=innerHeight;return w<760||(h>w*1.15&&w<1000);
}
var FLOW=null,SCALE=1;
function fit(){
  var f=wantFlow();
  if(f!==FLOW){FLOW=f;H.classList.toggle('flow',f);if(f)setupFlow();else teardownFlow()}
  if(!FLOW){var w=H.clientWidth||innerWidth,h=H.clientHeight||innerHeight,v=W.visualViewport;
    if(v&&v.width){w=Math.min(w,Math.round(v.width));h=Math.min(h,Math.round(v.height))}
    var s=Math.min(w/1920,h/1080);SCALE=s;stage.style.transform='translate(-50%,-50%) scale('+s+')';}else SCALE=1;
  viewers.forEach(function(v){v.fit()});
}
addEventListener('resize',fit);addEventListener('orientationchange',function(){setTimeout(fit,250)});
if(W.visualViewport)visualViewport.addEventListener('resize',fit);

/* ---------------- 캡처 뷰어 + 하이라이트 ---------------- */
var viewers=[],MAXUP=1.1;   /* 캡처를 원본 픽셀보다 1.1배 넘게 늘리지 않음(흐림 방지) */
function makeViewer(host,list){
  var wrap=host.classList.contains('viewer')?host:(function(){var w=D.createElement('div');w.className='viewer';host.appendChild(w);return w})();
  wrap.innerHTML='';
  var tabs=null;
  if(list.length>1){tabs=D.createElement('div');tabs.className='vtabs';
    list.forEach(function(v,i){var b=D.createElement('button');b.className='vtab';b.type='button';
      b.innerHTML='<i>'+(i+1)+'</i><span></span>';var sp=b.lastChild;sp.textContent=v.label||('화면 '+(i+1));
      if(v.sub){var sm=D.createElement('small');sm.textContent=v.sub;sp.appendChild(sm)}
      b.onclick=function(){V.show(i,true)};tabs.appendChild(b)});wrap.appendChild(tabs)}
  var main=D.createElement('div');main.className='vmain';wrap.appendChild(main);
  var layer=D.createElement('div');layer.className='hlayer';
  var el=null,V={host:host,wrap:wrap,idx:-1,ready:false};
  V.fit=function(){
    if(!el)return;var nw=el.naturalWidth||el.videoWidth,nh=el.naturalHeight||el.videoHeight;if(!nw)return;
    if(FLOW){main.style.setProperty('--ar',nw+'/'+nh)}
    var cw=main.clientWidth,ch=main.clientHeight,r=nw/nh,w,h;
    if(cw/ch>r){h=ch;w=ch*r}else{w=cw;h=cw/r}
    /* 확대 상한: 실제 화면 픽셀(무대 배율 × devicePixelRatio, 최대 2)이 원본 픽셀의 1.1배를 넘지 않게.
       넘으면 늘리지 않고 그 크기로 가운데 두고, 하이라이트가 없는 장면은 테두리로 강조 */
    var capped=false,it=list[V.idx]||{};
    if(el.tagName==='IMG'){var k=SCALE*Math.min(W.devicePixelRatio||1,2),mw=nw*MAXUP/k;if(w>mw+.5){w=mw;h=w/r;capped=true}}
    /* align:"left"|"right" — 남는 폭을 한쪽으로 몰아 far-left/far-right 라벨 자리를 만듦(기본 가운데) */
    var L=FLOW?(cw-w)/2:it.align==='left'?Math.min(24,(cw-w)/2):it.align==='right'?Math.max(cw-w-24,(cw-w)/2):(cw-w)/2,T=(ch-h)/2;
    layer.style.cssText='left:'+L+'px;top:'+T+'px;width:'+w+'px;height:'+h+'px';
    if(el.tagName==='IMG')el.style.cssText=(capped||it.align)?'inset:auto;left:'+L+'px;top:'+T+'px;width:'+w+'px;height:'+h+'px':'';
    main.classList.toggle('v-capped',capped);main.classList.toggle('v-ring',capped&&!(it.hl&&it.hl.length));
    if(list[V.idx]&&list[V.idx].dim)layer.style.setProperty('--dim',list[V.idx].dim===true?.38:list[V.idx].dim);
  };
  function tick(){var t=el&&el.tagName==='VIDEO'?el.currentTime:0;
    $$('.hl',layer).forEach(function(h){var r=h._t;h.style.display=(!r||(t>=r[0]&&t<r[1]))?'block':'none'})}
  V.show=function(i,play){
    V.idx=i;var it=list[i];main.innerHTML='';layer.innerHTML='';
    if(tabs)$$('.vtab',tabs).forEach(function(b,k){b.classList.toggle('on',k===i)});
    if(it.k==='vid'||/\.(mp4|webm|mov)$/i.test(it.src)){
      el=D.createElement('video');el.controls=true;el.preload='metadata';el.playsInline=true;if(it.poster)el.poster=it.poster;
      var ld=D.createElement('div');ld.className='vload';ld.textContent='영상 불러오는 중…';
      el.addEventListener('loadedmetadata',function(){if(ld.parentNode)ld.remove();V.fit();tick()});
      el.addEventListener('timeupdate',tick);el.addEventListener('seeked',tick);
      el.addEventListener('error',function(){if(ld.parentNode)ld.textContent='영상을 불러오지 못했어요'});
      el.src=encodeURI(it.src)+(it.t0?'#t='+it.t0:'');main.appendChild(el);main.appendChild(ld);
      if(play&&it.autoplay)el.play().catch(function(){});
    }else{
      el=D.createElement('img');el.alt=it.alt||it.label||'';el.decoding='async';el.onload=function(){V.fit();tick()};el.src=encodeURI(it.src);main.appendChild(el);
      var zb=D.createElement('button');zb.className='vzoom';zb.type='button';zb.title='크게 보기';zb.innerHTML=ICON.zoom;zb.onclick=function(){openImage(it.src)};main.appendChild(zb);
    }
    main.appendChild(layer);
    (it.hl||[]).forEach(function(h,k){var d=D.createElement('div');d.className='hl '+(h.pos||'below');
      d.style.cssText='left:'+h.x+'%;top:'+h.y+'%;width:'+h.w+'%;height:'+h.h+'%';d._t=h.t||null;
      /* far-left/right/above/below: 라벨을 캡처 바깥 여백에 두고 가는 선으로 잇기(화면 글자·버튼을 가리지 않게) */
      /* edge-left/right: 라벨은 캡처 안쪽 가장자리(여백)에, 선은 상자에서 가장자리까지 */
      var far={'far-left':h.x/h.w,'far-right':(100-h.x-h.w)/h.w,'far-above':h.y/h.h,'far-below':(100-h.y-h.h)/h.h,'edge-left':h.x/h.w,'edge-right':(100-h.x-h.w)/h.w}[h.pos];
      if(far!==undefined){d.style.setProperty('--gap',(far*100)+'%');var ln=D.createElement('i');ln.className='lead';d.appendChild(ln)}
      if(h.text){var tg=D.createElement('div');tg.className='tag';tg.textContent=h.text;d.appendChild(tg)}
      layer.appendChild(d);if(!h.t)anim(d,IN.pop,{d:520,delay:250+k*220,fill:'backwards'})});
    if(it.cap){var c=D.createElement('div');c.className='vcap';c.textContent=it.cap;main.appendChild(c)}
    V.fit();tick();
  };
  V.init=function(){if(!V.ready){V.ready=true;V.show(0,false)}else V.fit()};
  V.pause=function(){if(el&&el.pause)el.pause()};
  viewers.push(V);
  return V;
}
$$('[data-media]').forEach(function(host){
  var list;try{list=JSON.parse(host.dataset.media)}catch(e){console.error('[deck] data-media JSON 오류',host,e);return}
  var V=makeViewer(host,list);
  var sl=host.closest('.slide');if(sl){(sl._viewers=sl._viewers||[]).push(V)}
});

/* ---------------- 영상 ---------------- */
$$('.video[data-src],.video[data-youtube]').forEach(function(box){
  var sl=box.closest('.slide');
  box._init=function(){
    if(box._ready)return;box._ready=true;
    if(box.dataset.youtube){
      var p=D.createElement('div');p.className='vposter';p.style.backgroundImage='url(https://i.ytimg.com/vi/'+box.dataset.youtube+'/hqdefault.jpg)';
      p.onclick=function(){var f=D.createElement('iframe');f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
        f.src='https://www.youtube-nocookie.com/embed/'+box.dataset.youtube+'?autoplay=1&rel=0';box.innerHTML='';box.appendChild(f)};
      box.appendChild(p);return}
    var v=D.createElement('video');v.controls=true;v.preload='metadata';v.playsInline=true;
    if(box.dataset.poster)v.poster=box.dataset.poster;if(box.hasAttribute('data-muted'))v.muted=true;if(box.hasAttribute('data-loop'))v.loop=true;
    v.src=encodeURI(box.dataset.src);box.appendChild(v);box._v=v;
  };
  box._pause=function(){if(box._v)box._v.pause();var f=$('iframe',box);if(f){box._ready=false;box.innerHTML=''}};
  if(sl)(sl._videos=sl._videos||[]).push(box);
});

/* ---------------- 모달 ---------------- */
function openModal(m){if(typeof m==='string')m=D.getElementById(m);if(!m)return;
  if(!$('.m-x',m)){var x=D.createElement('button');x.className='m-x';x.type='button';x.setAttribute('aria-label','닫기');x.innerHTML=ICON.x;$('.m-box',m).appendChild(x);x.onclick=function(){closeModal(m)}}
  m.classList.add('on');anim(m,IN.fade,{d:220});anim($('.m-box',m),IN.pop,{d:520});
  $$('[data-in]',m).forEach(function(e,i){anim(e,IN.up,{d:600,delay:200+i*100,fill:'backwards'})});
  counters(m);
}
function closeModal(m){if(!m){$$('.modal.on').forEach(closeModal);return}if(typeof m==='string')m=D.getElementById(m);if(!m||!m.classList.contains('on'))return;
  $$('video',m).forEach(function(v){v.pause()});
  var a=anim(m,[{opacity:1},{opacity:0}],{d:180,fill:'forwards'});a.finished.then(function(){m.classList.remove('on');a.cancel()})}
var imgModal=null;
function openImage(src){
  if(!imgModal){imgModal=D.createElement('div');imgModal.className='modal img';imgModal.innerHTML='<div class="m-box"><img alt=""></div>';stage.appendChild(imgModal);
    imgModal.addEventListener('click',function(e){if(e.target===imgModal)closeModal(imgModal)})}
  $('img',imgModal).src=encodeURI(src);openModal(imgModal);
}
D.addEventListener('click',function(e){
  var t=e.target.closest('[data-modal]');if(t){e.preventDefault();openModal(t.dataset.modal);return}
  var z=e.target.closest('img[data-zoom]');if(z){openImage(z.dataset.zoom||z.getAttribute('src'));return}
  var m=e.target.classList&&e.target.classList.contains('modal')?e.target:null;if(m)closeModal(m);
});

/* ---------------- 뒤집기 카드 · 체크리스트 · 퀴즈 ---------------- */
$$('.flip').forEach(function(f){
  if(!$('.fi',f)){var fi=D.createElement('div');fi.className='fi';while(f.firstChild)fi.appendChild(f.firstChild);f.appendChild(fi)}
  f.setAttribute('role','button');f.tabIndex=0;
  f.addEventListener('click',function(e){if(e.target.closest('a,button:not(.flip)'))return;f.classList.toggle('on')});
  f.addEventListener('keydown',function(e){if(e.key==='Enter'){f.classList.toggle('on')}});
});
$$('.checklist').forEach(function(cl){
  var items=$$('.check',cl),key=cl.dataset.save?'ck:'+cl.dataset.save:null,done=$('.ck-done',cl);
  var st=[];try{st=JSON.parse(key&&store(key)||'[]')}catch(e){}
  function upd(){var n=items.filter(function(c){return c.classList.contains('on')}).length;
    if(done)done.textContent=n===items.length?'모두 완료! 잘하셨어요':n+' / '+items.length+' 완료';
    if(key)store(key,JSON.stringify(items.map(function(c){return c.classList.contains('on')?1:0})))}
  items.forEach(function(c,i){if(c.tagName!=='BUTTON')c.setAttribute('role','checkbox');if(st[i])c.classList.add('on');
    c.addEventListener('click',function(){c.classList.toggle('on');if(c.classList.contains('on'))anim(c,[{transform:'scale(.97)'},{transform:'scale(1.02)'},{transform:'none'}],{d:300});upd()})});
  upd();
});
$$('.quiz').forEach(function(qz){
  var opts=$$('.opt',qz);
  opts.forEach(function(o,i){if(!$('i',o)){var n=D.createElement('i');n.textContent=String.fromCharCode(65+i);o.insertBefore(n,o.firstChild)}
    o.addEventListener('click',function(){
      if(qz.classList.contains('answered')&&!qz.hasAttribute('data-retry'))return;
      opts.forEach(function(x){x.classList.remove('right','wrong')});
      if(o.hasAttribute('data-correct')){o.classList.add('right');anim(o,IN.pop,{d:500});if(qz.dataset.ok!=='')toast(qz.dataset.ok||'정답이에요!')}
      else{o.classList.add('wrong');opts.forEach(function(x){if(x.hasAttribute('data-correct'))x.classList.add('right')});anim(o,[{transform:'translateX(0)'},{transform:'translateX(-10px)'},{transform:'translateX(10px)'},{transform:'none'}],{d:320})}
      qz.classList.add('answered');var ex=$('.explain',qz);if(ex)anim(ex,IN.up,{d:500});
    })});
  var rs=$('[data-quiz-reset]',qz);if(rs)rs.onclick=function(){qz.classList.remove('answered');opts.forEach(function(x){x.classList.remove('right','wrong')})};
});

/* ---------------- 타이머 ---------------- */
function beep(){try{var C=W.AudioContext||W.webkitAudioContext,c=new C();[0,.28,.56].forEach(function(t,i){var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=i===2?1046:784;
  g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(.25,c.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t+.25);o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.3)})}catch(e){}}
$$('.timer[data-sec]').forEach(function(tm){
  var total=+tm.dataset.sec||60,left=total,iv=null,R=44,C=2*Math.PI*R;
  tm.innerHTML='<svg class="ring" viewBox="0 0 100 100"><circle class="bgc" cx="50" cy="50" r="'+R+'"/><circle class="fg" cx="50" cy="50" r="'+R+'" stroke-dasharray="'+C+'" stroke-dashoffset="0"/></svg>'+
    '<span class="tm"></span><span class="tb"><button class="go" type="button" aria-label="시작">'+ICON.play+'</button><button class="rs" type="button" aria-label="처음으로">'+ICON.reset+'</button></span>';
  var fg=$('.fg',tm),out=$('.tm',tm),go=$('.go',tm);
  function draw(){var m=Math.floor(left/60),s=left%60;out.textContent=m+':'+(s<10?'0':'')+s;fg.style.strokeDashoffset=C*(1-left/total)}
  function stop(){clearInterval(iv);iv=null;go.innerHTML=ICON.play;go.setAttribute('aria-label','시작')}
  function start(){if(iv)return;if(left<=0)left=total;tm.classList.remove('done');go.innerHTML=ICON.pause;go.setAttribute('aria-label','멈춤');
    iv=setInterval(function(){left--;draw();if(left<=0){stop();tm.classList.add('done');beep();toast(tm.dataset.msg||'시간이 다 됐어요!')}},1000)}
  go.onclick=function(){iv?stop():start()};
  $('.rs',tm).onclick=function(){stop();left=total;tm.classList.remove('done');draw()};
  tm._start=start;tm._stop=stop;draw();
});

/* ---------------- 프롬프트 만들기 · 복사 · 저장 ---------------- */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function copyText(txt,btn,msg){
  function ok(){if(btn){var o=btn.innerHTML;btn.classList.add('done');btn.innerHTML='복사됨 ✓';setTimeout(function(){btn.innerHTML=o;btn.classList.remove('done')},1600)}if(msg)toast(msg)}
  function fb(){var a=D.createElement('textarea');a.value=txt;a.style.cssText='position:fixed;opacity:0';D.body.appendChild(a);a.select();try{D.execCommand('copy');ok()}catch(e){toast('복사하지 못했어요<br><small>글자를 드래그해서 복사해 주세요</small>')}a.remove()}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,fb);else fb();
}
var prompts={};
$$('.prompt').forEach(function(pr,pi){
  var id=pr.dataset.prompt||('p'+pi),body=$('.p-body',pr);if(!body)return;
  var tpl=body.dataset.tpl||body.textContent.replace(/^\n+|\s+$/g,'');body.dataset.tpl=tpl;
  var P={id:id,el:pr,body:body,tpl:tpl};prompts[id]=P;
  P.fields=function(){return $$('[data-for="'+id+'"]')};
  P.render=function(){
    var vals={};P.fields().forEach(function(f){vals[f.dataset.key]=f.value.trim()});
    var h='',plain='',miss=0,re=/\{\{\s*([\w-]+)\s*(?:\|([^}]*))?\}\}/g,last=0,m;
    while((m=re.exec(tpl))){h+=esc(tpl.slice(last,m.index));plain+=tpl.slice(last,m.index);
      var v=vals[m[1]],ph=(m[2]||m[1]).trim();
      if(v){h+='<mark class="f">'+esc(v)+'</mark>';plain+=v}else{h+='<mark class="e">['+esc(ph)+']</mark>';plain+='['+ph+']';miss++}
      last=re.lastIndex}
    h+=esc(tpl.slice(last));plain+=tpl.slice(last);body.innerHTML=h;P.plain=plain;P.miss=miss;return P;
  };
  P.fields().forEach(function(f){
    var k='pf:'+id+':'+f.dataset.key,sv=store(k);if(sv!==null&&sv!==undefined&&!f.value)f.value=sv;
    f.addEventListener('input',function(){store(k,f.value);P.render()});
    var fl=f.closest('.field');if(fl)$$('.opts [data-val]',fl).forEach(function(b){b.type='button';b.onclick=function(){f.value=b.dataset.val;store(k,f.value);P.render();anim(f,IN.pop,{d:400})}});
  });
  P.render();
});
D.addEventListener('click',function(e){
  var c=e.target.closest('[data-copy]');
  if(c){var pr=c.dataset.copy?prompts[c.dataset.copy]:null;if(!pr){var host=c.closest('.prompt');if(host)pr=prompts[host.dataset.prompt||'']||Object.values(prompts).filter(function(p){return p.el===host})[0]}
    if(!pr)return;pr.render();
    if(pr.miss&&pr.el.hasAttribute('data-strict')){toast('빈칸이 '+pr.miss+'개 남았어요<br><small>위 칸을 채우면 프롬프트가 완성돼요</small>');return}
    copyText(pr.plain,c,pr.miss?'복사했어요!<small>[ ] 빈칸 '+pr.miss+'개는 붙여 넣은 뒤 채워 주세요</small>':(c.dataset.msg||'복사했어요! 붙여 넣어 보세요'));return}
  var t=e.target.closest('[data-copy-text]');if(t){copyText(t.dataset.copyText,t.matches('button')?t:null,t.dataset.msg||'복사했어요!');return}
  var ex=e.target.closest('[data-example]');
  if(ex){var p=prompts[ex.dataset.example],src=$('script[data-example-for="'+ex.dataset.example+'"]'),o={};
    try{o=JSON.parse(ex.dataset.json||(src&&src.textContent)||'{}')}catch(er){console.error(er)}
    if(p){p.fields().forEach(function(f,i){if(o[f.dataset.key]!=null){f.value=o[f.dataset.key];store('pf:'+p.id+':'+f.dataset.key,f.value);anim(f,IN.pop,{d:420,delay:i*90})}});p.render();toast('강사 예시를 넣었어요<small>내 상황에 맞게 바꿔 써 보세요</small>')}
    return}
  var cl=e.target.closest('[data-clear]');
  if(cl){var q=prompts[cl.dataset.clear];if(q){q.fields().forEach(function(f){f.value='';store('pf:'+q.id+':'+f.dataset.key,null)});q.render()}return}
});
/* 그 밖의 입력 저장: data-save="이름" */
$$('input[data-save],textarea[data-save],select[data-save]').forEach(function(f){var k='f:'+f.dataset.save,v=store(k);if(v!=null&&!f.value)f.value=v;f.addEventListener('input',function(){store(k,f.value)})});

/* ---------------- 슬라이드 엔진 ---------------- */
/* 숨긴 장(운영 관리): data-off 가 붙은 장은 목록·번호·그리드·시간 합계·#번호 이동에서 모두 빠지고 흐름 모드에서도 안 보임.
   /api/config 의 hiddenSlides[덱 이름]에 든 id 에는 시작 전에 data-off 를 붙임(아래 '시작'에서 최대 800ms 기다림).
   같은 탭에 관리자 세션(sessionStorage)이 있으면 숨기지 않고 HUD·목록에 '숨김'만 표시. */
var offCss=D.createElement('style');offCss.textContent='.deck .slide[data-off]{display:none!important}'+
  '#hud .off-tag,#grid .off-tag{display:inline-block;margin-left:.5em;padding:.06em .5em;border-radius:6px;font-size:.72em;font-style:normal;font-weight:800;letter-spacing:0;color:#fff;background:var(--accent);vertical-align:.12em}';
D.head.appendChild(offCss);
var ADMIN=(function(){try{var t=sessionStorage.getItem('cnfta-admin-token');if(!t)return false;var p=JSON.parse(atob(t.split('.')[0].replace(/-/g,'+').replace(/_/g,'/')));return !!p&&p.exp*1000>Date.now()}catch(e){return false}})();
var allSlides=$$('.slide',deck),HKEY='cnfta-hidden-slides:'+cfg.deck;
function markHidden(ids){var ch=false;ids=ids||[];
  allSlides.forEach(function(s){var want=!!s.id&&ids.indexOf(s.id)>=0;
    if(ADMIN){if(want!==s.hasAttribute('data-hidden')){ch=true;if(want)s.setAttribute('data-hidden','');else s.removeAttribute('data-hidden')}return}
    var has=s.hasAttribute('data-off-cfg');
    if(want&&!has){s.setAttribute('data-off','1');s.setAttribute('data-off-cfg','');ch=true}
    else if(!want&&has){s.removeAttribute('data-off');s.removeAttribute('data-off-cfg');ch=true}});
  return ch}
try{markHidden(JSON.parse(localStorage.getItem(HKEY)||'[]'))}catch(e){}   /* 지난번 설정으로 먼저(네트워크가 늦을 때 대비) */
function visibleSlides(){return allSlides.filter(function(s){if(s.hasAttribute('data-off')){s.classList.remove('active');s.setAttribute('aria-hidden','true');return false}s.removeAttribute('aria-hidden');return true})}
var slides=visibleSlides(),n=slides.length,idx=-1,busy=false,fragPos=0;
slides.forEach(function(s,i){s.dataset.no=i+1;s.setAttribute('aria-roledescription','slide')});
function steps(s){
  var fs=$$('[data-frag]',s);if(!fs.length)return [];
  var groups=[],map={};
  fs.forEach(function(f,i){var v=f.dataset.frag,k=/^\d+$/.test(v)?'n'+v:'i'+i,ord=/^\d+$/.test(v)?(+v)*1e4:i;
    if(!map[k]){map[k]={ord:ord,els:[]};groups.push(map[k])}map[k].els.push(f)});
  groups.sort(function(a,b){return a.ord-b.ord});return groups.map(function(g){return g.els});
}
function resetFrags(s){$$('[data-frag]',s).forEach(function(f){f.style.opacity='';f.style.visibility='';f.getAnimations&&f.getAnimations().forEach(function(a){a.cancel()})});fragPos=0}
function showFrag(els){els.forEach(function(f,i){f.style.visibility='visible';f.style.opacity='1';var k=f.dataset.in&&IN[f.dataset.in]?f.dataset.in:'up';anim(f,IN[k],{d:560,delay:i*90,fill:'backwards'});
  if(f.matches('.hl-step'))f.classList.add('on')})}
function hideFrag(els){els.forEach(function(f){var a=anim(f,[{opacity:1},{opacity:0}],{d:200,fill:'forwards'});a.finished.then(function(){f.style.visibility='hidden';f.style.opacity='';a.cancel()})})}
function initSlide(s){
  (s._viewers||[]).forEach(function(v){v.init()});
  (s._videos||[]).forEach(function(b){b._init()});
  $$('.timer[data-auto]',s).forEach(function(t){t._start&&t._start()});
}
function enter(s,first,still){
  initSlide(s);
  resetFrags(s);if(H.classList.contains('reveal'))steps(s).forEach(function(g){g.forEach(function(f){f.style.visibility='visible';f.style.opacity='1'})});
  if(still)counters(s);else playIn(s,first?80:200);
  s.dispatchEvent(new CustomEvent('deck:enter',{detail:{index:idx}}));
  setTimeout(function(){viewers.forEach(function(v){v.fit()})},60);
}
function leave(s){(s._viewers||[]).forEach(function(v){v.pause()});(s._videos||[]).forEach(function(b){b._pause()});$$('.timer',s).forEach(function(t){t._stop&&t._stop()});
  s.dispatchEvent(new CustomEvent('deck:leave'))}
/* 화면 전환 — 쿼카 모션랩 '화면 전환' 갈래(trs-·trp-·trc-)를 슬라이드용으로 옮김.
   TR[이름](방향) → [들어오는 장 키프레임, 나가는 장 키프레임] 또는 {i,o,d,od,e,oe,clip}
   clip:true 인 전환은 들어오는 장을 잘라 가며 보여 주므로 나가는 장은 끝까지 그대로 둔다. */
function _bands(n,t,vertical,lag,rev){
  var pts=[];
  for(var i=0;i<n;i++){
    var k=rev?n-1-i:i, p=Math.max(0,Math.min(1,t*(1+lag*(n-1))-lag*k));
    p=1-Math.pow(1-p,3);
    var a=i*100/n, b=(i+1)*100/n;
    if(!vertical){ var y1=a+(b-a)*p; pts.push('0% '+a+'%','100% '+a+'%','100% '+y1+'%','0% '+y1+'%'); }
    else { var top=100-100*p; pts.push(a+'% 100%',a+'% '+top+'%',b+'% '+top+'%',b+'% 100%'); }
  }
  return 'polygon('+pts.join(',')+')';
}
function _grid(cols,rows,t,ox,oy){
  var pts=[],maxd=Math.hypot(Math.max(ox,1-ox),Math.max(oy,1-oy));
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
    var cx=(c+.5)/cols,cy=(r+.5)/rows,dd=Math.hypot(cx-ox,cy-oy)/maxd;
    var p=Math.max(0,Math.min(1,t*1.8-dd*0.8)); p=1-Math.pow(1-p,3);
    var w=50.5/cols*p,h=50.5/rows*p,X=cx*100,Y=cy*100;
    /* 기준점(0,0)에서 칸으로 갔다가 그대로 돌아오는 길이라 연결선에는 면적이 생기지 않음 */
    pts.push('0% 0%',(X-w)+'% '+(Y-h)+'%',(X+w)+'% '+(Y-h)+'%',(X+w)+'% '+(Y+h)+'%',(X-w)+'% '+(Y+h)+'%',(X-w)+'% '+(Y-h)+'%','0% 0%');
  }
  return 'polygon('+pts.join(',')+')';
}
function _steps(fn,k){var a=[];for(var i=0;i<=k;i++)a.push({clipPath:fn(i/k),offset:i/k});return a}
var STAY=[{transform:'none'},{transform:'none'}];
var TR={
  fade:function(d){return [[{opacity:0},{opacity:1}],[{opacity:1},{opacity:0}]]},
  slide:function(d){return [[{opacity:0,transform:'translateX('+(d*140)+'px)'},{opacity:1,transform:'none'}],[{opacity:1,transform:'none'},{opacity:0,transform:'translateX('+(-d*140)+'px)'}]]},
  zoom:function(d){return [[{opacity:0,transform:'scale(.92)',filter:'blur(10px)'},{opacity:1,transform:'none',filter:'blur(0)'}],[{opacity:1,transform:'none'},{opacity:0,transform:'scale(1.05)'}]]},
  rise:function(d){return [[{opacity:0,transform:'translateY(80px)'},{opacity:1,transform:'none'}],[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-40px)'}]]},
  /* trs-circle-grow · iris-reveal: 가운데서 원이 커지며 열림 */
  circle:function(d){return {clip:1,d:820,e:'cubic-bezier(.7,0,.2,1)',i:[{clipPath:'circle(0% at 50% 55%)'},{clipPath:'circle(75% at 50% 55%)'}],o:[{transform:'scale(1)'},{transform:'scale(.96)'}]}},
  /* trs-ring-ripple 변형: 아래 모서리에서 번지며 열림 */
  corner:function(d){var x=d>0?'0%':'100%';return {clip:1,d:860,e:'cubic-bezier(.65,0,.25,1)',i:[{clipPath:'circle(0% at '+x+' 100%)'},{clipPath:'circle(150% at '+x+' 100%)'}],o:STAY}},
  /* trs-diamond-wipe: 마름모가 커지며 열림 */
  diamond:function(d){return {clip:1,d:820,e:'cubic-bezier(.7,0,.2,1)',i:[{clipPath:'polygon(50% 50%,50% 50%,50% 50%,50% 50%)'},{clipPath:'polygon(50% -55%,155% 50%,50% 155%,-55% 50%)'}],o:[{filter:'brightness(1)'},{filter:'brightness(.94)'}]}},
  /* diagonal-wipe: 사선으로 닦아 내며 열림 */
  diagonal:function(d){var f=function(t){var X=t*140;return d>0?'polygon(0% 0%,'+X+'% 0%,'+(X-40)+'% 100%,0% 100%)':'polygon(100% 0%,'+(100-X+40)+'% 0%,'+(100-X)+'% 100%,100% 100%)'};return {clip:1,d:760,e:'cubic-bezier(.65,0,.3,1)',i:[{clipPath:f(0)},{clipPath:f(1)}],o:STAY}},
  /* trs-venetian-turn · stripe-blinds: 가로 블라인드가 차례로 열림 */
  blinds:function(d){return {clip:1,d:860,e:'linear',i:_steps(function(t){return _bands(8,t,false,0.07,d<0)},12),o:STAY}},
  /* trs-band-shutter · trs-split-slide: 세로 띠가 아래에서 차례로 올라옴 */
  shutter:function(d){return {clip:1,d:900,e:'linear',i:_steps(function(t){return _bands(6,t,true,0.1,d<0)},12),o:STAY}},
  /* grid-reveal · trs-hex-tiles: 격자 칸이 가운데서부터 번지며 열림 */
  grid:function(d){return {clip:1,d:980,e:'linear',i:_steps(function(t){return _grid(10,6,t,.5,.5)},14),o:[{filter:'brightness(1)'},{filter:'brightness(.95)'}]}},
  /* band-push 변형: 가운데서 커튼처럼 양옆으로 열림 */
  curtain:function(d){return {clip:1,d:780,e:'cubic-bezier(.7,0,.2,1)',i:[{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(0 0% 0 0%)'}],o:[{transform:'scale(1)'},{transform:'scale(.97)'}]}},
  /* trc-zoom-blur: 앞으로 빨려 들어가듯 */
  zoomblur:function(d){return {d:720,e:'cubic-bezier(.2,.8,.2,1)',i:[{opacity:0,transform:'scale(1.18)',filter:'blur(14px)'},{opacity:1,transform:'none',filter:'blur(0)'}],o:[{opacity:1,transform:'none',filter:'blur(0)'},{opacity:0,transform:'scale(.86)',filter:'blur(8px)'}],od:420}},
  /* trc-whip-pan: 옆으로 휙 */
  whip:function(d){return {d:640,e:'cubic-bezier(.16,1,.3,1)',i:[{opacity:0,transform:'translateX('+(d*38)+'%) skewX('+(-d*6)+'deg)',filter:'blur(16px)'},{opacity:1,transform:'none',filter:'blur(0)'}],o:[{opacity:1,transform:'none',filter:'blur(0)'},{opacity:0,transform:'translateX('+(-d*30)+'%)',filter:'blur(14px)'}],od:360}},
  /* trc-spin-zoom: 살짝 돌며 다가옴 */
  spin:function(d){return {d:760,e:'cubic-bezier(.2,.9,.25,1)',i:[{opacity:0,transform:'rotate('+(-d*7)+'deg) scale(.78)'},{opacity:1,transform:'none'}],o:[{opacity:1,transform:'none'},{opacity:0,transform:'rotate('+(d*5)+'deg) scale(1.15)'}],od:460}},
  /* trc-cube-turn: 3D 큐브가 돌듯 */
  cube:function(d){var a=d>0?'0% 50%':'100% 50%',b=d>0?'100% 50%':'0% 50%';return {d:820,e:'cubic-bezier(.55,0,.25,1)',i:[{transformOrigin:a,transform:'perspective(1800px) rotateY('+(d*82)+'deg)',filter:'brightness(.85)'},{transformOrigin:a,transform:'perspective(1800px) rotateY(0deg)',filter:'brightness(1)'}],o:[{transformOrigin:b,transform:'perspective(1800px) rotateY(0deg)',opacity:1},{transformOrigin:b,transform:'perspective(1800px) rotateY('+(-d*82)+'deg)',opacity:.4}],od:820,oe:'cubic-bezier(.55,0,.25,1)'}},
  /* trp-paper-unfold · trp-page-turn: 종이가 펼쳐지듯 */
  unfold:function(d){var o=d>0?'0% 50%':'100% 50%';return {d:780,e:'cubic-bezier(.2,.8,.2,1)',i:[{transformOrigin:o,transform:'perspective(2000px) rotateY('+(d*-70)+'deg)',opacity:0},{transformOrigin:o,transform:'perspective(2000px) rotateY(0)',opacity:1}],o:[{opacity:1},{opacity:0}],od:520}},
  /* trp-paper-push: 겹친 종이를 밀어내듯 */
  push:function(d){return {d:720,e:'cubic-bezier(.22,1,.36,1)',i:[{transform:'translateX('+(d*100)+'%)',boxShadow:'-30px 0 60px rgba(35,20,32,.18)'},{transform:'none',boxShadow:'0 0 0 rgba(35,20,32,0)'}],o:[{transform:'none',filter:'brightness(1)'},{transform:'translateX('+(-d*18)+'%) scale(.96)',filter:'brightness(.9)'}],od:720,oe:'cubic-bezier(.22,1,.36,1)',solid:1}},
  /* trc-focus-pull: 초점이 옮겨 가듯 */
  focus:function(d){return {d:700,e:'ease-out',i:[{opacity:0,filter:'blur(18px)',transform:'scale(1.02)'},{opacity:1,filter:'blur(0)',transform:'none'}],o:[{opacity:1,filter:'blur(0)'},{opacity:0,filter:'blur(18px)'}],od:520}},
  /* lift: 아래에서 떠오르며 */
  lift:function(d){return {d:700,e:'cubic-bezier(.16,1,.3,1)',i:[{opacity:0,transform:'translateY(14%) scale(.96)'},{opacity:1,transform:'none'}],o:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-6%) scale(.98)'}],od:420}},
  none:function(){return null}
};
function go(to,dir,first){
  if(FLOW){var t=slides[to];if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});return}
  if(to<0||to>=n||busy||to===idx)return;
  closeModal();gridShow(false);
  var from=slides[idx],nxt=slides[to];dir=dir||(to>idx?1:-1);
  if(first||!from){nxt.classList.add('active');idx=to;enter(nxt,true);hudUpd();return}
  busy=true;leave(from);nxt.classList.add('active');nxt.style.zIndex=2;from.style.zIndex=1;idx=to;
  var kind=nxt.dataset.trans||'fade',f=(TR[kind]||TR.fade)(dir);
  if(f&&f.length===2)f={i:f[0],o:f[1],d:680,od:408,oe:'ease-in'};
  enter(nxt,false,!!(f&&(f.clip||f.solid)&&!reduce));hudUpd();
  var bgc=getComputedStyle(nxt).backgroundColor;
  var solid=!!(f&&(f.clip||f.solid)&&(bgc==='transparent'||/,\s*0\)$/.test(bgc)));
  if(solid)nxt.style.background='var(--bg)';
  function done(){from.classList.remove('active');from.style.zIndex='';nxt.style.zIndex='';if(solid)nxt.style.background='';busy=false;viewers.forEach(function(v){v.fit()})}
  if(!f||reduce){done();return}
  var k=LITE?0.55:1;
  var a=anim(nxt,f.i,{d:(f.d||680)*k,ease:f.e}),b=anim(from,f.o,{d:(f.od||f.d||680)*k,ease:f.oe||(f.clip?'linear':'ease-in')});
  Promise.all([a.finished,b.finished]).then(function(){a.cancel();b.cancel();done()},done);
}
function next(){var s=slides[idx];if(!s)return;var g=steps(s);if(fragPos<g.length){showFrag(g[fragPos++]);hudUpd();return}go(idx+1,1)}
function prev(){var s=slides[idx];if(!s)return;var g=steps(s);if(fragPos>0){hideFrag(g[--fragPos]);hudUpd();return}go(idx-1,-1)}

/* HUD */
var cntEl=$('.cnt',hud),clockEl=$('.clock',hud);
function hm(str){var m=/^(\d{1,2}):(\d{2})$/.exec(str||'');return m?(+m[1])*60+(+m[2]):null}
function fmt(min){min=Math.round(min);var h=Math.floor(min/60)%24,m=min%60;return h+':'+(m<10?'0':'')+m}
function plannedAt(i){var st=hm(cfg.start);if(st==null)return null;var sum=0,has=false;for(var k=0;k<i;k++){var v=parseFloat(slides[k].dataset.min);if(v){sum+=v;has=true}}return has||i===0?st+sum:null}
function clockUpd(){
  if(!H.classList.contains('teacher'))return;
  var now=new Date(),nm=now.getHours()*60+now.getMinutes(),p=plannedAt(idx),en=hm(cfg.end),txt='지금 <i>'+fmt(nm)+'</i>';
  if(p!=null)txt='계획 <i>'+fmt(p)+'</i> · '+txt;
  if(en!=null&&nm<=en&&nm>=(hm(cfg.start)||0)-30)txt+=' · 종료까지 <i>'+(en-nm)+'분</i>';
  clockEl.innerHTML=txt;clockEl.classList.toggle('late',p!=null&&nm>p+3&&nm<=(en||1440));
}
setInterval(clockUpd,15000);
function hudUpd(){
  if(idx<0)return;
  cntEl.innerHTML='<b>'+(idx+1)+'</b> / '+n+(slides[idx].hasAttribute('data-hidden')?'<em class="off-tag">숨김</em>':'');bar.style.width=((idx+1)/n*100)+'%';
  $('.prev',nav).disabled=idx===0&&fragPos===0;$('.next',nav).disabled=idx===n-1&&fragPos>=steps(slides[idx]).length;
  $$('.gc',grid).forEach(function(c,i){c.classList.toggle('on',i===idx)});
  try{history.replaceState(null,'','#'+(idx+1))}catch(e){}
  clockUpd();
}
/* 목록 보기 */
function buildGrid(){$('.gl',grid).innerHTML='';
slides.forEach(function(s,i){
  var h=$('h1,h2',s),t=s.dataset.title||(h?h.textContent:'')||'슬라이드';t=t.replace(/\s+/g,' ').trim();
  var c=D.createElement('button');c.className='gc';c.type='button';c.innerHTML='<b>'+(i+1)+'</b><span></span>';c.lastChild.textContent=t;
  if(s.hasAttribute('data-hidden'))c.lastChild.insertAdjacentHTML('beforeend','<em class="off-tag">숨김</em>');
  c.onclick=function(){gridShow(false);go(i)};$('.gl',grid).appendChild(c);
});}
buildGrid();
function gridShow(on){grid.classList.toggle('on',!!on);if(on){var c=$$('.gc',grid)[idx];if(c)c.scrollIntoView({block:'nearest'})}}
$('.g-x',grid).onclick=function(){gridShow(false)};
$('.grid-b',nav).onclick=function(){gridShow(!grid.classList.contains('on'))};
$('.prev',nav).onclick=prev;$('.next',nav).onclick=next;
function teacher(on){H.classList.toggle('teacher',on);try{sessionStorage.setItem('cnfta-teacher',on?'1':'0')}catch(e){}clockUpd();if(on)toast('교사용 메모 켜짐<small>T 키로 끄고 켤 수 있어요</small>',1400)}
$('.t-teacher',tools).onclick=function(){teacher(!H.classList.contains('teacher'))};
function full(){if(!D.fullscreenElement){(H.requestFullscreen||H.webkitRequestFullscreen||function(){}).call(H)}else{(D.exitFullscreen||D.webkitExitFullscreen).call(D)}}
$('.t-full',tools).onclick=full;
try{if(/[?&]teacher/.test(Q)||sessionStorage.getItem('cnfta-teacher')==='1')H.classList.add('teacher')}catch(e){}

D.addEventListener('click',function(e){
  var g=e.target.closest('[data-goto]');if(g){e.preventDefault();var t=D.getElementById(g.dataset.goto);var i=slides.indexOf(t);if(i<0&&/^\d+$/.test(g.dataset.goto))i=+g.dataset.goto-1;if(i>=0)go(i);return}
  if(e.target.closest('[data-next]')){next();return}
  if(e.target.closest('[data-prev]')){prev();return}
});
addEventListener('keydown',function(e){
  var t=e.target,tag=t&&t.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable)){if(e.key==='Escape')t.blur();return}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  var k=e.key;
  if(k==='Escape'){if($('.modal.on'))closeModal();else if(grid.classList.contains('on'))gridShow(false);return}
  if(k==='t'||k==='T'){teacher(!H.classList.contains('teacher'));return}
  if(k==='f'||k==='F'){full();return}
  if(k==='g'||k==='G'){gridShow(!grid.classList.contains('on'));return}
  if($('.modal.on')||FLOW)return;
  if(k==='ArrowRight'||k==='PageDown'||(k===' '&&tag!=='VIDEO'&&tag!=='BUTTON')){e.preventDefault();next()}
  else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();prev()}
  else if(k==='Home'){go(0)}else if(k==='End'){go(n-1)}
});
/* 옆으로 넘기기(터치) */
(function(){var sx=0,sy=0,st=0,ok=false;
  stage.addEventListener('pointerdown',function(e){if(FLOW||e.pointerType==='mouse')return;ok=!e.target.closest('input,textarea,select,video,iframe,.vtabs,.p-body,.gl,.modal.on,[data-noswipe]');sx=e.clientX;sy=e.clientY;st=Date.now()},{passive:true});
  stage.addEventListener('pointerup',function(e){if(!ok||FLOW)return;ok=false;var dx=e.clientX-sx,dy=e.clientY-sy;if(Date.now()-st<700&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4){dx<0?next():prev()}},{passive:true});
})();

/* ---------------- 흐름 모드: 스크롤로 보기 ---------------- */
var io=null;
function setupFlow(){
  slides.forEach(function(s){s.classList.add('active')});
  if(!('IntersectionObserver' in W)){slides.forEach(initSlide);return}
  io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var s=en.target;
    if(!s._seen){s._seen=true;initSlide(s);playIn(s,0)}
    idx=slides.indexOf(s);$('.cnt',hud).textContent=(idx+1)+' / '+n}})},{rootMargin:'0px 0px -25% 0px',threshold:.08});
  slides.forEach(function(s){io.observe(s)});
  addEventListener('scroll',flowBar,{passive:true});flowBar();
}
function teardownFlow(){if(io){io.disconnect();io=null}removeEventListener('scroll',flowBar);slides.forEach(function(s,i){if(i!==idx)s.classList.remove('active')})}
function flowBar(){var h=D.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:100)+'%'}

/* 숨긴 장 목록이 바뀌면 번호·그리드·흐름 모드를 다시 맞춤(보던 장이 숨겨지면 다음 보이는 장으로) */
function relist(){
  var cur=idx>=0?slides[idx]:null;
  slides=visibleSlides();n=slides.length;if(W.Deck)W.Deck.slides=slides;
  slides.forEach(function(s,i){s.dataset.no=i+1;s.setAttribute('aria-roledescription','slide')});
  buildGrid();
  if(FLOW){if(io){io.disconnect();io=null}setupFlow();return}
  if(!cur)return;
  var ni=slides.indexOf(cur);if(ni>=0){idx=ni;hudUpd();return}
  var k=allSlides.indexOf(cur),to=n-1;for(var j=0;j<n;j++){if(allSlides.indexOf(slides[j])>k){to=j;break}}
  leave(cur);cur.classList.remove('active');idx=-1;busy=false;go(to,1,true);
}

/* ---------------- 시작 ---------------- */
fit();
var booted=false;
function boot(){if(booted)return;booted=true;
  var hmatch=location.hash.match(/^#(\d+)$/),start=hmatch?Math.min(n-1,Math.max(0,+hmatch[1]-1)):0;
  if(FLOW){idx=start;if(start>0)setTimeout(function(){slides[start].scrollIntoView()},300)}
  else go(start,1,true);
}
/* 운영 관리 설정(/api/config)을 최대 800ms 기다렸다가 시작 — file:// 이거나 /api 가 없으면(로컬 서버) 바로 진행.
   page-guard.js 가 먼저 불러 둔 요청(window.CNFTA_CONFIG)이 있으면 그것을 같이 씀. 늦게 오면 그때 다시 맞춤. */
var cfgReq=W.CNFTA_CONFIG||(/^https?:$/.test(location.protocol)&&W.fetch&&W.Promise?fetch('/api/config',{cache:'no-store',headers:{accept:'application/json'}}).then(function(r){
  if(!r.ok||!/json/i.test(r.headers.get('content-type')||''))throw new Error('no config');return r.json()}):null);
if(!cfgReq)boot();
else{var bootT=setTimeout(boot,800);
  cfgReq.then(function(c){var ids=c&&c.hiddenSlides&&Array.isArray(c.hiddenSlides[cfg.deck])?c.hiddenSlides[cfg.deck]:[];
    try{localStorage.setItem(HKEY,JSON.stringify(ids))}catch(e){}
    if(markHidden(ids))relist();clearTimeout(bootT);boot()},
  function(){clearTimeout(bootT);boot()})}

W.Deck={go:function(i){go(i)},next:next,prev:prev,toast:toast,openModal:openModal,closeModal:closeModal,openImage:openImage,
  current:function(){return idx},slides:slides,isFlow:function(){return FLOW},copy:copyText,prompts:prompts};
})();
