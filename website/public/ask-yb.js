const btn = document.getElementById('ask-yb-launcher');
let box;
btn.onclick = () => {
  box ??= createBox();
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  document.getElementById('yb-input')?.focus();
};

function createBox(){
  const el = document.createElement('div');
  el.style = 'position:fixed; right:20px; bottom:80px; width:320px; height:420px; background:#0b1020; color:#f5f7ff; border-radius:16px; box-shadow:0 10px 24px rgba(0,0,0,.35); z-index:9999; display:block; overflow:hidden; font:14px system-ui, sans-serif;';
  el.innerHTML = `
    <div style="padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; justify-content:space-between; align-items:center">
      <strong>Ask YB</strong>
      <button id="yb-close" style="all:unset; cursor:pointer; padding:4px 8px">✕</button>
    </div>
    <div id="yb-log" style="padding:12px; height:310px; overflow:auto"></div>
    <form id="yb-form" style="display:flex; gap:6px; padding:10px; border-top:1px solid rgba(255,255,255,.08)">
      <input id="yb-input" placeholder="Type your question…" style="flex:1; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:#0f1630; color:#fff"/>
      <button style="padding:8px 12px; border-radius:10px; border:0; background:#4a7dff; color:#fff; cursor:pointer">Send</button>
    </form>`;
  document.body.appendChild(el);
  el.querySelector('#yb-close').onclick = () => el.style.display = 'none';
  el.querySelector('#yb-form').onsubmit = async (e) => {
    e.preventDefault();
    const q = el.querySelector('#yb-input').value.trim();
    if(!q) return;
    log('user', q);
    el.querySelector('#yb-input').value = '';
    try{
      const r = await fetch('/.netlify/functions/ask-yb', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({ question: q })
      });
      const data = await r.json();
      log('yb', data.answer ?? 'No answer.');
    }catch(err){
      log('yb', 'Error contacting assistant.');
    }
  };
  function log(who, text){
    const line = document.createElement('div');
    line.style = `margin:8px 0; ${who==='yb' ? 'color:#bcd3ff' : 'color:#fff'}`
    line.textContent = (who==='yb'?'YB: ':'You: ') + text;
    const area = el.querySelector('#yb-log');
    area.appendChild(line); area.scrollTop = area.scrollHeight;
  }
  return el;
}
