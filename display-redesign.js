/* Emergency-safe spectator presentation enhancement.
 * Intentionally no MutationObserver and no polling.
 * This file only applies lightweight CSS and terminology changes.
 */
(function(){'use strict';
  function install(){
    if(document.getElementById('bury-csc-safe-display-css')) return;
    const style=document.createElement('style');
    style.id='bury-csc-safe-display-css';
    style.textContent=`
      #spectator-display .full-title{font-weight:900;letter-spacing:.04em}
      #spectator-display .card-group{border-radius:14px}
      #spectator-display .lb-score{font-weight:900}
    `;
    document.head.appendChild(style);
    const root=document.getElementById('spectator-display');
    if(!root) return;
    const fix=()=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[]; let n;
      while((n=walker.nextNode())) nodes.push(n);
      for(const node of nodes){
        if(node.nodeValue) node.nodeValue=node.nodeValue.replace(/rides completed/gi,'races completed');
      }
    };
    fix();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})();
