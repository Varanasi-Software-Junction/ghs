(()=>{'use strict';
const KEY='examforge.exam.datetime.v1';
const $=id=>document.getElementById(id);
const currentTime=$('examCurrentTime'),currentDate=$('examCurrentDate'),dateDisplay=$('examDateDisplay'),dateHint=$('examDateHint'),countdown=$('examCountdown'),countdownHint=$('examCountdownHint'),displayBox=document.querySelector('.countdown-display'),input=$('examDateTimeInput'),editor=$('examClockEditor'),editBtn=$('examEditBtn');
let examValue=localStorage.getItem(KEY)||'';
const pad=n=>String(n).padStart(2,'0');
function localInputValue(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function formatExam(d){return new Intl.DateTimeFormat(undefined,{weekday:'short',day:'2-digit',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}).format(d)}
function duration(ms){let sec=Math.max(0,Math.floor(Math.abs(ms)/1000));const days=Math.floor(sec/86400);sec%=86400;const h=Math.floor(sec/3600);sec%=3600;const m=Math.floor(sec/60);const s=sec%60;return `${days}d ${pad(h)}:${pad(m)}:${pad(s)}`}
function render(){
  const now=new Date();
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
render();setInterval(render,1000);
})();
