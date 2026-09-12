(()=>{'use strict';
const KEY='examforge.exam.datetime.v1';
const $=id=>document.getElementById(id);
const currentTime=$('examCurrentTime'),currentDate=$('examCurrentDate'),dateDisplay=$('examDateDisplay'),dateHint=$('examDateHint'),countdown=$('examCountdown'),countdownHint=$('examCountdownHint'),displayBox=document.querySelector('.countdown-display'),input=$('examDateTimeInput'),editor=$('examClockEditor'),editBtn=$('examEditBtn');
let examValue=localStorage.getItem(KEY)||'';
const pad=n=>String(n).padStart(2,'0');

function installAnalogueClock(){
  const timeBox=currentTime?.closest('.exam-clock-item');
  if(!timeBox||$('examAnalogueClock')) return;
  const wrap=document.createElement('div');
  wrap.className='analogue-clock-wrap';
  wrap.innerHTML='<canvas id="examAnalogueClock" width="160" height="160" role="img" aria-label="Running analogue clock showing the current time"></canvas>';
  const label=timeBox.querySelector('span');
  if(label) label.insertAdjacentElement('afterend',wrap); else timeBox.prepend(wrap);
}

function drawAnalogueClock(now){
  const canvas=$('examAnalogueClock');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  const size=canvas.width;
  const c=size/2;
  const r=c-7;
  ctx.clearRect(0,0,size,size);

  ctx.save();
  ctx.translate(c,c);
  ctx.beginPath();
  ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle='#ffffff';
  ctx.fill();
  ctx.lineWidth=4;
  ctx.strokeStyle='#0f3d75';
  ctx.stroke();

  for(let i=0;i<60;i++){
    const a=(i*Math.PI/30)-Math.PI/2;
    const major=i%5===0;
    const inner=r-(major?13:7);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);
    ctx.lineTo(Math.cos(a)*(r-2),Math.sin(a)*(r-2));
    ctx.lineWidth=major?3:1;
    ctx.strokeStyle=major?'#0f3d75':'#9fb3c8';
    ctx.stroke();
  }

  ctx.fillStyle='#344054';
  ctx.font='700 13px system-ui,-apple-system,Segoe UI,sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  [[12,0,-r+25],[3,r-25,0],[6,0,r-25],[9,-r+25,0]].forEach(([n,x,y])=>ctx.fillText(String(n),x,y));

  const seconds=now.getSeconds()+now.getMilliseconds()/1000;
  const minutes=now.getMinutes()+seconds/60;
  const hours=(now.getHours()%12)+minutes/60;

  function hand(angle,length,width,color){
    const a=angle-Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(-Math.cos(a)*7,-Math.sin(a)*7);
    ctx.lineTo(Math.cos(a)*length,Math.sin(a)*length);
    ctx.lineCap='round';
    ctx.lineWidth=width;
    ctx.strokeStyle=color;
    ctx.stroke();
  }

  hand(hours*Math.PI/6,r*.48,6,'#0f3d75');
  hand(minutes*Math.PI/30,r*.68,4,'#1769aa');
  hand(seconds*Math.PI/30,r*.76,2,'#b42318');

  ctx.beginPath();
  ctx.arc(0,0,5,0,Math.PI*2);
  ctx.fillStyle='#0f3d75';
  ctx.fill();
  ctx.restore();
}

function localInputValue(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function formatExam(d){return new Intl.DateTimeFormat(undefined,{weekday:'short',day:'2-digit',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}).format(d)}
function duration(ms){let sec=Math.max(0,Math.floor(Math.abs(ms)/1000));const days=Math.floor(sec/86400);sec%=86400;const h=Math.floor(sec/3600);sec%=3600;const m=Math.floor(sec/60);const s=sec%60;return `${days}d ${pad(h)}:${pad(m)}:${pad(s)}`}
function render(){
  const now=new Date();
  drawAnalogueClock(now);
  currentTime.textContent=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit'}).format(now);
  currentDate.textContent=new Intl.DateTimeFormat(undefined,{weekday:'long',day:'2-digit',month:'short',year:'numeric'}).format(now);
  displayBox?.classList.remove('is-close','is-over');
  if(!examValue){dateDisplay.textContent='Not set';dateHint.textContent='Set your exam date';countdown.textContent='--d --:--:--';countdownHint.textContent='Waiting for exam date';return}
  const exam=new Date(examValue);
  if(Number.isNaN(exam.getTime())){localStorage.removeItem(KEY);examValue='';return render()}
  dateDisplay.textContent=formatExam(exam);dateHint.textContent='Saved on this device';
  const diff=exam-now;
  if(diff>0){countdown.textContent=duration(diff);countdownHint.textContent='Remaining until exam';if(diff<=86400000)displayBox?.classList.add('is-close')}
  else{countdown.textContent=duration(diff);countdownHint.textContent='Since exam time';displayBox?.classList.add('is-over')}
}
function openEditor(){input.value=examValue?localInputValue(new Date(examValue)):localInputValue(new Date(Date.now()+86400000));editor.hidden=false;editBtn.setAttribute('aria-expanded','true');input.focus()}
function closeEditor(){editor.hidden=true;editBtn.setAttribute('aria-expanded','false')}
editBtn?.addEventListener('click',()=>editor.hidden?openEditor():closeEditor());
$('examCancelBtn')?.addEventListener('click',closeEditor);
$('examSaveBtn')?.addEventListener('click',()=>{if(!input.value){input.focus();return}const d=new Date(input.value);if(Number.isNaN(d.getTime()))return;examValue=input.value;localStorage.setItem(KEY,examValue);render();closeEditor();window.dispatchEvent(new CustomEvent('examforge:exam-updated',{detail:{examDateTime:examValue}}))});
$('examClearBtn')?.addEventListener('click',()=>{examValue='';localStorage.removeItem(KEY);input.value='';render();closeEditor();window.dispatchEvent(new CustomEvent('examforge:exam-updated',{detail:{examDateTime:null}}))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!editor.hidden)closeEditor()});
installAnalogueClock();
render();
setInterval(render,250);
})();
