/* Bury CSC spectator presentation layer
 * Leaves the original controller and state model untouched.
 * Replaces only the public spectator presentation for Results, Standings and Schedule.
 */
(function () {
  'use strict';

  const GATES = ['RED','BLUE','WHITE','YELLOW'];
  const GATE_CLASS = ['red','blue','white','yellow'];

  const css = `
  #bsx-results{position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at center,#1f1b0a 0%,#080b10 55%,#050607 100%);color:#fff;font-family:Segoe UI,Arial,sans-serif;padding:3vh 4vw;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;overflow:hidden}
  #bsx-results .bsx-title,#bsx-standings .bsx-title,#bsx-schedule .bsx-title{font-size:5vh;color:#ffd400;text-transform:uppercase;text-align:center;margin:0 0 1vh;letter-spacing:.05em;font-weight:950}
  #bsx-results .bsx-sub,#bsx-standings .bsx-sub,#bsx-schedule .bsx-sub{text-align:center;color:#aebdca;font-size:2.1vh;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:2vh}
  .bsx-result-list{width:min(86vw,1200px);display:grid;gap:1vh;}
  .bsx-result-row{display:grid;grid-template-columns:10% 15% 1fr 17% 18%;align-items:center;padding:1.5vh 1.5vw;border-radius:16px;background:#101b25;border:1px solid #2b3e4c;font-size:2.7vh;font-weight:950}
  .bsx-result-row.first{border:3px solid #ffd400;box-shadow:0 0 35px rgba(255,212,0,.14)}
  .bsx-result-pos{font-size:4vh}.bsx-result-num{color:#9fb0bf}.bsx-result-pts{text-align:right}.bsx-result-total{text-align:right;color:#ffd400}
  .bsx-podium{margin-top:2vh;font-size:2vh;color:#c4d0d8;font-weight:800;text-align:center}
  #bsx-standings{position:fixed;inset:0;z-index:9998;background:linear-gradient(180deg,#071018,#0b131a);color:#fff;font-family:Segoe UI,Arial,sans-serif;padding:3vh 3vw;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden}
  .bsx-stand-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.2vw;flex:1;min-height:0}
  .bsx-table{background:#0e1922;border:1px solid #243744;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;min-height:0}
  .bsx-th,.bsx-tr{display:grid;grid-template-columns:9% 11% 1fr 18% 20%;align-items:center;padding:1.05vh 1vw}
  .bsx-th{font-size:1.65vh;color:#90a6b6;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #2c3c48}
  .bsx-tr{font-size:2.05vh;font-weight:900;border-bottom:1px solid #1f303b;flex:1;min-height:0}
  .bsx-tr:nth-child(-n+4){background:rgba(255,255,255,.025)}
  .bsx-tr .next{color:#b8c7d2;font-size:1.55vh}.bsx-tr .total{font-size:2.6vh;text-align:right;color:#fff}.bsx-tr .rank{text-align:center}.bsx-tr .num{color:#94a6b4}.bsx-note{text-align:center;color:#7e93a3;font-size:1.45vh;font-weight:700;padding-top:1vh}
  #bsx-schedule{position:fixed;inset:0;z-index:9997;background:linear-gradient(180deg,#061019,#0a1620);color:#fff;font-family:Segoe UI,Arial,sans-serif;padding:2.4vh 2.3vw;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden}
  .bsx-schedule-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:.9vw;flex:1;min-height:0}
  .bsx-heat{background:#0e1922;border:1px solid #253a49;border-radius:14px;padding:.9vw;overflow:hidden}.bsx-heat.current{border:3px solid #d50000;box-shadow:0 0 25px rgba(213,0,0,.18)}
  .bsx-heat h3{font-size:2.1vh;margin:0 0 .45vh}.bsx-heat .state{font-size:1.2vh;color:#93a6b5;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.45vh}.bsx-rider{font-size:1.5vh;font-weight:900;padding:.35vh .45vw;border-radius:7px;background:rgba(255,255,255,.035);margin:.25vh 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bsx-rider .gate{display:inline-block;width:26%;font-size:1.05vh;color:#93a6b5}.bsx-rider.red{border-left:4px solid #d50000}.bsx-rider.blue{border-left:4px solid #1590ff}.bsx-rider.white{border-left:4px solid #f5f5f5}.bsx-rider.yellow{border-left:4px solid #ffd400}
  .bsx-hidden{display:none!important}
  @media(max-width:1100px){.bsx-schedule-grid{grid-template-columns:repeat(3,1fr)}.bsx-stand-grid{grid-template-columns:1fr}.bsx-tr{font-size:1.8vh}}
  `;

  function addCss() { const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s); }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function teamName(state,id){return id ? ((state.teams||[]).find(t=>t.id===id)?.name||'') : '';}
  function rider(state,id){return (state.riders||[]).find(r=>r.id===id);}
  function formulaRiders(state,h){const nums=state.formula?.[h-1]||[];return nums.map(n=>(state.riders||[]).find(r=>r.entryNum===n)).filter(Boolean);}
  function standings(state){const arr=(state.riders||[]).map(r=>{let gross=0,pens=0,races=0;for(const h of(state.completedHeats||[])){const x=(h.results||[]).find(v=>v.riderId===r.id);if(x){gross+=Number(x.points||0);pens+=Number(x.penalty||0);races++;}}return{...r,total:gross-pens,races};});arr.sort((a,b)=>b.total-a.total||a.entryNum-b.entryNum);arr.forEach((r,i)=>r.rank=i+1);return arr;}
  function nextRide(state,r){for(let h=Math.max(1,Number(state.currentHeatNum||1));h<=(state.formula?.length||0);h++){if(formulaRiders(state,h).some(x=>x.id===r.id))return h;}return null;}
  function ensureHosts(){
    if(!document.getElementById('bsx-results')) document.body.insertAdjacentHTML('beforeend','<div id="bsx-results" class="bsx-hidden"></div>');
    if(!document.getElementById('bsx-standings')) document.body.insertAdjacentHTML('beforeend','<div id="bsx-standings" class="bsx-hidden"></div>');
    if(!document.getElementById('bsx-schedule')) document.body.insertAdjacentHTML('beforeend','<div id="bsx-schedule" class="bsx-hidden"></div>');
  }
  function hideAll(){['bsx-results','bsx-standings','bsx-schedule'].forEach(id=>document.getElementById(id)?.classList.add('bsx-hidden'));}
  function renderResults(state){
    const heat=Number(state.currentHeatNum||1), data=(state.completedHeats||[]).find(h=>Number(h.heatNum)===heat); if(!data)return;
    const rows=(data.results||[]).map(x=>({...x,r:rider(state,x.riderId)})).filter(x=>x.r).sort((a,b)=>{const order=v=>({'1ST':1,'2ND':2,'3RD':3,'4TH':4,'EX':5,'DNF':6})[String(v).toUpperCase()]||99;return order(a.posText)-order(b.posText);});
    const totals=standings(state), byId=new Map(totals.map(x=>[x.id,x]));
    document.getElementById('bsx-results').innerHTML=`<div class="bsx-title">HEAT ${heat} RESULT</div><div class="bsx-sub">Race results and championship points</div><div class="bsx-result-list">${rows.map((x,i)=>{const t=byId.get(x.r.id);return `<div class="bsx-result-row ${i===0?'first':''}"><div class="bsx-result-pos">${i+1===1?'🥇':i+1===2?'🥈':i+1===3?'🥉':'4️⃣'}</div><div class="bsx-result-num">#${esc(x.r.entryNum)}</div><div>${esc(x.r.name)}<div style="font-size:1.45vh;color:#8fa2b0;font-weight:700">${esc(teamName(state,x.r.teamId))}</div></div><div class="bsx-result-pts">${Number(x.points||0)} pts</div><div class="bsx-result-total">${t?.total??0} total</div></div>`}).join('')}</div><div class="bsx-podium">Next: Heat ${Math.min(heat+1,state.formula?.length||heat)}</div>`;
  }
  function renderStandings(state){
    const rows=standings(state), mid=Math.ceil(rows.length/2), chunks=[rows.slice(0,mid),rows.slice(mid)];
    document.getElementById('bsx-standings').innerHTML=`<div class="bsx-title">CURRENT STANDINGS</div><div class="bsx-sub">Mini Speedway GP • points after heat ${Number(state.currentHeatNum||1)}</div><div class="bsx-stand-grid">${chunks.map(chunk=>`<div class="bsx-table"><div class="bsx-th"><div>#</div><div>RIDER</div><div></div><div>RACES</div><div>TOTAL</div></div>${chunk.map(r=>{const n=nextRide(state,r);return `<div class="bsx-tr"><div class="rank">${r.rank}</div><div class="num">#${esc(r.entryNum)}</div><div><div>${esc(r.name)}</div><div class="next">Next race: ${n?`Heat ${n}`:'—'}</div></div><div>${r.races} ${r.races===1?'race':'races'} completed</div><div class="total">${r.total}</div></div>`}).join('')}</div>`).join('')}</div><div class="bsx-note">1st = 4 pts • 2nd = 3 pts • 3rd = 2 pts • 4th = 1 pt</div>`;
  }
  function renderSchedule(state){
    const total=state.formula?.length||0, current=Number(state.currentHeatNum||1), start=Math.max(1,current-2), end=Math.min(total,start+15), heats=[];for(let h=start;h<=end;h++)heats.push(h);
    document.getElementById('bsx-schedule').innerHTML=`<div class="bsx-title">RACE SCHEDULE</div><div class="bsx-sub">Heats ${start}–${end} of ${total}</div><div class="bsx-schedule-grid">${heats.map(h=>{const rs=formulaRiders(state,h), cls=h===current?' current':'';return `<div class="bsx-heat${cls}"><h3>HEAT ${h}</h3><div class="state">${h<current?'Completed':h===current?'Current':'Upcoming'}</div>${rs.map((r,i)=>`<div class="bsx-rider ${GATE_CLASS[i]}"><span class="gate">${GATES[i]}</span>#${esc(r.entryNum)} ${esc(r.name)}</div>`).join('')}</div>`}).join('')}</div>`;
  }
  function apply(state){
    if(!state || !window.isDisplayMode)return;
    ensureHosts(); hideAll();
    if(state.displayState==='RESULTS'){renderResults(state);document.getElementById('bsx-results').classList.remove('bsx-hidden');}
    else if(state.displayState==='STANDINGS'){renderStandings(state);document.getElementById('bsx-standings').classList.remove('bsx-hidden');}
    else if(state.displayState==='SCHEDULE'){renderSchedule(state);document.getElementById('bsx-schedule').classList.remove('bsx-hidden');}
  }
  function patch(){
    if(typeof window.renderDisplay!=='function'){setTimeout(patch,250);return;}
    const original=window.renderDisplay;
    window.renderDisplay=function(state){ original(state); apply(state); };
    addCss(); ensureHosts();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch); else patch();
})();
