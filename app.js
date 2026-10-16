'use strict';
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>Number(x||0).toLocaleString('zh-CN');
const platformNames={luogu:'洛谷',codeforces:'CF',qoj:'QOJ'};
const pageNames={overview:'累计过题',weekly:'近七天',freshmen:'新生训练',activity:'通过动态'};
let state,page='overview',paused=false,elapsed=0,offline=false;
const rankPage=0;
const size=()=>Math.max(4,Math.min(10,Math.floor((innerHeight-270)/72)));
const timeText=(t,full=false)=>t?new Date(t*1000).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',...(full?{year:'numeric'}:{}),month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'暂无';
function activeMembers(){return state.members.filter(m=>m.active&&(page!=='freshmen'||m.cohort===state.settings.freshman_year));}
function navigate(next){if(!pageNames[next])return;page=next;elapsed=0;render();}
function nextBoard(direction=1){const pages=Object.keys(pageNames);navigate(pages[(pages.indexOf(page)+direction+pages.length)%pages.length]);}
function header(){return `<header><div class="brand"><img class="university-logo" src="./nuist-emblem.png" alt="南京信息工程大学校徽" width="72" height="72"><div class="brand-copy"><span class="university-name">南京信息工程大学</span><h1>${esc(state.settings.title||'NUIST ACM 训练看板')}</h1></div></div><div class="datetime"><b id="clock"></b><span id="date"></span></div></header><nav aria-label="看板切换">${Object.entries(pageNames).map(([id,label])=>`<button data-page="${id}" class="${page===id?'selected':''}">${label}</button>`).join('')}<div class="nav-actions"><button data-action="prev" aria-label="上一个看板">←</button><span>${Object.keys(pageNames).indexOf(page)+1} / 4</span><button data-action="next" aria-label="下一个看板">→</button><button data-action="pause">${paused?'继续轮播':'暂停'}</button><button data-action="fullscreen">全屏</button></div></nav>`;}
function render(){if(!state)return;document.title=state.settings.title||'ACM 训练看板';$('#app').innerHTML=`<div class="screen">${header()}<main>${page==='activity'?activityView():rankingView()}</main><footer><span class="freshness ${offline?'offline':''}"><i></i>${offline?'网络中断 · 显示缓存数据':'数据更新 '+timeText(state.generated_at)}</span><span>${page==='overview'||page==='freshmen'?'累计取主页总量与已知去重题数的较大值；+ 表示已采集下限。':'近七天按北京时间统计当前已知首次通过，历史补采中。'}</span><div class="rotation"><span id="remaining"></span><div><i id="rotation-fill"></i></div></div></footer></div>`;updateClock();updateRotation();}
function updateClock(){const d=new Date();if($('#clock'))$('#clock').textContent=d.toLocaleTimeString('en-GB',{timeZone:'Asia/Shanghai',hour12:false});if($('#date'))$('#date').textContent=d.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'long'});}
function updateRotation(){if(!state||!$('#remaining'))return;const seconds=state.settings.rotation_seconds||25;$('#remaining').textContent=paused?'轮播已暂停':`${Math.max(0,seconds-elapsed)} 秒后切换看板`;$('#rotation-fill').style.width=(elapsed/seconds*100)+'%';}
async function refresh(){try{const response=await fetch(window.BOARD_CONFIG.dataUrl+'?v='+Math.floor(Date.now()/60000),{cache:'no-store'});if(!response.ok)throw Error('数据暂不可用');const data=await response.json();state=BoardData.toState(data);offline=false;try{localStorage.setItem('acm-public-cache',JSON.stringify(data));}catch{}render();}catch{offline=true;if(!state){try{state=BoardData.toState(JSON.parse(localStorage.getItem('acm-public-cache')));}catch{}}if(state)render();else $('#app').innerHTML='<div class="loading"><b>训练数据暂不可用</b><span>正在重试连接，请检查网络。</span></div>';}}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.page){navigate(b.dataset.page);return;}switch(b.dataset.action){case'next':nextBoard();break;case'prev':nextBoard(-1);break;case'pause':paused=!paused;render();break;case'fullscreen':if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();break;}});
document.addEventListener('keydown',e=>{if(!state)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();nextBoard(e.key==='ArrowRight'?1:-1);}if(e.code==='Space'){e.preventDefault();paused=!paused;render();}});
addEventListener('resize',()=>{if(state)render();});
setInterval(()=>{updateClock();if(!state)return;if(!paused){elapsed++;if(elapsed>=(state.settings.rotation_seconds||25))nextBoard();}updateRotation();},1000);
setInterval(refresh,30000);refresh();
