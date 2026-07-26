const STORAGE_KEY = 'mood-zip-records-v1';
const moods = { spark: ['✦', '짜릿해'], sun: ['☀', '좋아'], cloud: ['☁', '그저 그래'], rain: ['☂', '조금 지쳐'], fire: ['♨', '불타는 중'] };
let selectedMood = 'spark';
const $ = (s) => document.querySelector(s);
const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
const records = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const writeRecords = (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

function dateLabel() { $('#date-label').textContent = new Intl.DateTimeFormat('ko-KR', { month:'long', day:'numeric', weekday:'short' }).format(new Date()).toUpperCase(); }
function showToast(text) { const el = $('#toast'); el.textContent = text; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }
function updateEnergy() { $('#energy-value').textContent = `${$('#energy').value}%`; }
function formatDate(key) { return new Intl.DateTimeFormat('ko-KR', { month:'numeric', day:'numeric', weekday:'short' }).format(new Date(`${key}T12:00:00`)); }
function recentSeven() { const all = records(); return Array.from({length:7}, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6-i)); const key = d.toLocaleDateString('en-CA', {timeZone:'Asia/Seoul'}); return all.find(r => r.date === key) || { date:key, energy:0 }; }); }
function render() {
  const all = records().sort((a,b) => b.createdAt - a.createdAt);
  const week = recentSeven(); const filled = week.filter(r => r.energy).length; const avg = filled ? Math.round(week.reduce((n,r) => n+r.energy,0)/filled) : 0;
  $('#week-bars').innerHTML = week.map((r,i) => `<div class="bar-wrap"><div class="bar ${i===6?'today':''}" style="height:${r.energy ? Math.max(12,r.energy) : 5}%"></div></div>`).join('');
  $('#week-caption').textContent = filled ? `${filled}일의 마음을 모았어요` : '아직 기록이 없어요';
  $('#week-score').textContent = filled ? `${avg}%` : '—';
  const strongest = [...week].sort((a,b)=>b.energy-a.energy)[0];
  if (strongest?.mood) { $('#recap-icon').textContent=moods[strongest.mood][0]; $('#recap-summary').innerHTML=`이번 주 에너지<br /><b>${avg}%</b>로 기록 중이에요.`; }
  const streak = (() => { let count=0; const keys=new Set(records().map(r=>r.date)); for(let i=0;i<365;i++){ const d=new Date();d.setDate(d.getDate()-i);if(keys.has(d.toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'})))count++;else break;} return count; })(); $('#streak').textContent=streak;
  $('#history').innerHTML = all.length ? all.slice(0,8).map(r => `<article class="history-item"><div class="history-mood">${moods[r.mood][0]}</div><div class="history-content"><small>${formatDate(r.date)} · ${moods[r.mood][1]}</small><p>${escapeHtml(r.thought)}</p></div><span class="history-energy">${r.energy}%</span></article>`).join('') : '<div class="empty-state">오늘의 한 줄이 여기에 쌓여요.<br />나중의 내가 가장 좋아할 기록이에요.</div>';
}
function escapeHtml(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function save() { const thought=$('#thought').value.trim(); if(!thought) return showToast('오늘을 한 줄로 적어주세요 ✍️'); const all=records().filter(r=>r.date!==todayKey()); all.push({date:todayKey(), mood:selectedMood, energy:+$('#energy').value, thought, createdAt:Date.now()}); writeRecords(all); render(); showToast('오늘이 예쁘게 ZIP됐어요 ✦'); }
function share() { const all=records(); const week=recentSeven(); const filled=week.filter(r=>r.energy).length; const avg=filled?Math.round(week.reduce((n,r)=>n+r.energy,0)/filled):0; const text=filled?`MOOD ZIP · 이번 주의 온도는 ${avg}% ☀\n${filled}일의 마음을 기록했어요.`:'MOOD ZIP으로 오늘의 마음을 한 줄로 남겨보세요.'; if(navigator.share) navigator.share({title:'MOOD ZIP',text}).catch(()=>{}); else navigator.clipboard.writeText(text).then(()=>showToast('공유 문구를 복사했어요!')); }
document.querySelectorAll('.mood').forEach(btn=>btn.addEventListener('click',()=>{ document.querySelectorAll('.mood').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); selectedMood=btn.dataset.mood; }));
$('#energy').addEventListener('input', updateEnergy); $('#thought').addEventListener('input',()=>$('#char-count').textContent=$('#thought').value.length); $('#save-button').addEventListener('click',save); $('#share-button').addEventListener('click',share); $('#clear-button').addEventListener('click',()=>{if(confirm('저장한 모든 ZIP을 지울까요? 이 작업은 되돌릴 수 없어요.')){localStorage.removeItem(STORAGE_KEY);render();showToast('모든 기록을 비웠어요.');}}); dateLabel(); updateEnergy(); render();
