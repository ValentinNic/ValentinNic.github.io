import {BASE,CLOSE,ticketsFor,simulate,snapshot,statusAt,clock,overrun} from './model.mjs'
const $=id=>document.getElementById(id)
let base,plan,page=0,timer=null
const size=10
for(let n=0;n<=5;n++)$('late').add(new Option(n+' late · '+(5-n)+' early',n))
$('late').value='2'
function stop(){clearInterval(timer);timer=null;$('play').textContent=+$('time').value===720?'Replay day':'Play'}
function recalculate(){
  if(!$('seed').checkValidity()){stop();$('seed').reportValidity();return}
  const tickets=ticketsFor(Number($('seed').value),$('pattern').value),late=+$('late').value
  base=simulate(tickets,BASE);plan=simulate(tickets,{late,policy:$('policy').value})
  $('shifts').textContent=(5-late)+' on 08:00–16:00 · '+late+' on 12:00–20:00'
  page=0;stop();render()
}
function drawChart(t){
  const points=Array.from({length:145},(_,i)=>i*5)
  const counts=run=>points.map(m=>snapshot(run,m).waiting)
  const a=counts(base),b=counts(plan),max=Math.max(4,Math.ceil(Math.max(...a,...b)/4)*4)
  const x=m=>38+644*m/720,y=n=>175-n*150/max
  const line=values=>points.filter(m=>m<=t).map((m,i)=>(i?'L':'M')+x(m).toFixed(1)+','+y(values[i]).toFixed(1)).join(' ')
  const grid=[0,1,2,3,4].map(i=>'<path d="M38 '+y(i*max/4)+'h644" stroke="#d9e3e2" stroke-dasharray="3 4"/><text x="31" y="'+(y(i*max/4)+4)+'" text-anchor="end">'+i*max/4+'</text>').join('')
  const labels=[0,120,240,360,480,600,720].map(m=>'<text x="'+x(m)+'" y="202" text-anchor="middle">'+clock(m)+'</text>').join('')
  $('chart').innerHTML='<g font-size="12" fill="#465e65">'+grid+labels+'</g><path d="'+line(a)+'" fill="none" stroke="#7954a0" stroke-width="3" stroke-dasharray="6 3"/><path d="'+line(b)+'" fill="none" stroke="#08765d" stroke-width="3"/><line x1="'+x(t)+'" x2="'+x(t)+'" y1="20" y2="177" stroke="#66827e"/><circle cx="'+x(t)+'" cy="'+y(b[t/5])+'" r="4" fill="#08765d"/>'
}
function ledger(t){
  const filter=$('filter').value
  const rows=plan.jobs.map((j,i)=>[j,base.jobs[i]]).filter(([j])=>j.at<=t&&(filter==='all'||(filter==='urgent'?j.urgent:statusAt(j,t)==='Waiting')))
  page=Math.min(page,Math.max(0,Math.ceil(rows.length/size)-1))
  const wait=j=>j.start===null||j.start>t?(t-j.at)+'m so far':(j.start-j.at)+'m'
  $('ledger').innerHTML=rows.slice(page*size,(page+1)*size).map(([j,b])=>'<tr><td>#'+String(j.id).padStart(3,'0')+'</td><td class="'+(j.urgent?'urgent':'')+'">'+(j.urgent?'Urgent':'Standard')+'</td><td>'+clock(j.at)+'</td><td>'+j.service+' min</td><td>'+wait(b)+'</td><td>'+wait(j)+'</td><td>'+statusAt(j,t)+'</td></tr>').join('')||'<tr><td colspan="7">No matching arrivals at this time.</td></tr>'
  $('count').textContent=rows.length?(page*size+1)+'–'+Math.min(rows.length,(page+1)*size)+' of '+rows.length+' tickets':'0 tickets'
  $('prev').disabled=page===0;$('next').disabled=(page+1)*size>=rows.length
}
function render(){
  const t=+$('time').value,a=snapshot(base,t),b=snapshot(plan,t)
  $('asof').textContent='As of '+clock(t);$('timeLabel').textContent=clock(t);$('time').setAttribute('aria-valuetext',clock(t))
  $('metrics').innerHTML=[['Waiting tickets','waiting',''],['90th-percentile wait','p90',' min'],['Median wait','median',' min']].map(([label,k,u])=>'<article class="metric"><span>'+label+'</span><b>'+(b[k]===null?'—':b[k]+u)+'</b><small>Baseline '+(a[k]===null?'—':a[k]+u)+'</small></article>').join('')
  $('handover').textContent='By '+clock(t)+', your plan has started '+b.started+' of '+b.arrived+' tickets and completed '+b.completed+'. The baseline has started '+a.started+' and completed '+a.completed+'.'
  $('coverage').textContent='Wait statistics include started tickets only.'+(t===CLOSE?' Total shift overrun: '+overrun(plan)+' agent-minutes in your plan and '+overrun(base)+' in the baseline.':'')
  drawChart(t);ledger(t)
}
for(const id of ['pattern','seed','late','policy'])$(id).addEventListener('change',recalculate)
$('reset').onclick=()=>{$('pattern').value='afternoon';$('seed').value=42;$('late').value=2;$('policy').value='fifo';$('time').value=720;$('filter').value='all';recalculate()}
$('time').oninput=()=>{stop();page=0;render()}
$('play').onclick=()=>{if(timer){stop();return}if(+$('time').value===CLOSE)$('time').value=0;page=0;render();$('play').textContent='Pause';timer=setInterval(()=>{$('time').value=Math.min(CLOSE,+$('time').value+5);render();if(+$('time').value>=CLOSE)stop()},130)}
$('filter').onchange=()=>{page=0;ledger(+$('time').value)}
$('prev').onclick=()=>{page--;ledger(+$('time').value)}
$('next').onclick=()=>{page++;ledger(+$('time').value)}
recalculate()
