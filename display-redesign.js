/* Bury CSC spectator display redesign
 * Works from the existing spectator DOM in index.html.
 */
(function(){'use strict';
const STYLE_ID='bury-csc-spectator-redesign-v2';
const css=`
#spectator-display.bsx-redesign-active{background:#071018!important;color:#fff!important}
#spectator-display.bsx-redesign-full .sidebar{display:none!important}
#spectator-display.bsx-redesign-full .layout-split{display:block!important;width:100vw!important}
#spectator-display.bsx-redesign-full .layout-full{width:100vw!important;height:100vh!important;box-sizing:border-box!important;padding:3vh 3vw!important;background:linear-gradient(180deg,#061019,#0b151d)!important;color:#fff!important;overflow:hidden!important}
#spectator-display.bsx-redesign-full .full-title{font-family:'Segoe UI',Arial,sans-serif!important;font-size:5vh!important;font-weight:950!important;color:#ffd400!important;text-transform:uppercase!important;text-align:center!important;letter-spacing:.05em!important;margin:0 0 1vh!important;border:0!important;padding:0 0 1vh!important;width:100%!important}
#spectator-display.bsx-redesign-full .full-container{width:100%!important;display:block!important;flex:1!important;overflow:hidden!important}
#spectator-display.bsx-redesign-standings .card-group{background:#0e1922!important;border:1px solid #243744!important;border-radius:16px!important;border-top:1px solid #243744!important;padding:0!important;margin:0!important;box-shadow:none!important}
#spectator-display.bsx-redesign-standings .card-title{background:#101d27!important;color:#90a6b6!important;font-family:'Segoe UI',Arial,sans-serif!important;font-size:1.65vh!important;text-transform:uppercase!important;letter-spacing:.08em!important;margin:0!important;padding:1.05vh 1vw!important;border-bottom:1px solid #2c3c48!important}
#spectator-display.bsx-redesign-standings .lb-item,#spectator-display.bsx-redesign-standings .standing-row,#spectator-display.bsx-redesign-standings .rider-row{background:#0e1922!important;border-bottom:1px solid #1f303b!important;border-radius:0!important;padding:1.05vh 1vw!important;font-family:'Segoe UI',Arial,sans-serif!important}
#spectator-display.bsx-redesign-standings .lb-score{color:#ffd400!important}
#spectator-display.bsx-redesign-standings .next-ride,#spectator-display.bsx-redesign-standings .next,#spectator-display.bsx-redesign-standings .small-text{color:#b8c7d2!important}
#spectator-display.bsx-redesign-schedule .multi-col-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-rows:1fr!important;gap:.9vw!important;height:100%!important;overflow:hidden!important}
#spectator-display.bsx-redesign-schedule .card-group{background:#0e1922!important;border:1px solid #253a49!important;border-radius:14px!important;border-top:1px solid #253a49!important;padding:1vw!important;margin:0!important;overflow:hidden!important}
#spectator-display.bsx-redesign-schedule .card-title{font-family:'Segoe UI',Arial,sans-serif!important;font-size:2.1vh!important;font-weight:950!important;color:#fff!important;text-align:left!important;border:0!important;padding:0 0 .45vh!important;margin:0!important}
#spectator-display.bsx-redesign-schedule .sch-rider,#spectator-display.bsx-redesign-schedule .rider-row,#spectator-display.bsx-redesign-schedule .schedule-rider{font-family:'Segoe UI',Arial,sans-serif!important;font-size:1.5vh!important;font-weight:900!important;background:rgba(255,255,255,.035)!important;border-radius:7px!important;padding:.35vh .45vw!important;margin:.25vh 0!important}
#spectator-display.bsx-redesign-schedule .gate-red{border-left:4px solid #d50000!important}#spectator-display.bsx-redesign-schedule .gate-blue{border-left:4px solid #1590ff!important}#spectator-display.bsx-redesign-schedule .gate-white{border-left:4px solid #f5f5f5!important}#spectator-display.bsx-redesign-schedule .gate-yellow{border-left:4px solid #ffd400!important}
#spectator-display.bsx-redesign-results .full-container{max-width:1200px!important;margin:auto!important}
#spectator-display.bsx-redesign-results .card-group{background:#101b25!important;border:1px solid #2b3e4c!important;border-radius:16px!important;border-top:1px solid #2b3e4c!important;margin:.7vh 0!important;padding:1.5vh 1.5vw!important;font-family:'Segoe UI',Arial,sans-serif!important}
#spectator-display.bsx-redesign-results .winner,#spectator-display.bsx-redesign-results .first{border:3px solid #ffd400!important;box-shadow:0 0 35px rgba(255,212,0,.14)!important}
#spectator-display.bsx-redesign-results .card-title{color:#fff!important;font-size:2.7vh!important;font-weight:950!important}
#spectator-display.bsx-redesign-results .score-val.total{color:#ffd400!important}
@media(max-width:1100px){#spectator-display.bsx-redesign-schedule .multi-col-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
`;
function addStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=css;document.head.appendChild(s)}
function text(el){return(el?.textContent||'').replace(/\s+/g,' ').trim().toUpperCase()}
function detectPage(){const root=document.getElementById('spectator-display');if(!root||getComputedStyle(root).display==='none')return null;const t=text(root);if(/RESULT|RACE RESULTS|HEAT .* RESULT/.test(t))return'results';if(/SCHEDULE|PROGRAMME|UPCOMING HEATS/.test(t))return'schedule';if(/STANDINGS|LEADERBOARD|CHAMPIONSHIP/.test(t))return'standings';return null}
function apply(){const root=document.getElementById('spectator-display');if(!root)return;root.classList.remove('bsx-redesign-active','bsx-redesign-full','bsx-redesign-results','bsx-redesign-standings','bsx-redesign-schedule');const page=detectPage();if(page){root.classList.add('bsx-redesign-active','bsx-redesign-full','bsx-redesign-'+page);root.innerHTML=root.innerHTML.replace(/rides completed/gi,'races completed')}}
function start(){addStyle();apply();const root=document.getElementById('spectator-display');if(root)new MutationObserver(()=>apply()).observe(root,{subtree:true,childList:true,characterData:true,attributes:true});setInterval(apply,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();