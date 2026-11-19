'use strict';
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:1}).format(n);
const pct=(n,d)=>d?fmt(100*n/d)+'%':'—';
const hour=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const sum=(rows,key)=>rows.reduce((a,r)=>a+r[key],0);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=['Overview','Operations','People & time','Quality','Incidents','Movement ledger'];
const fields=['Receiving','Putaway','Replenishment','Picking','Packing','Dispatch','Returns','Cycle count','Quality inspection'];
let data,tab=groups[0],generation=0,query='',filter='',page=0;
const card=(title,value,note)=>'<article class="card"><div>'+title+'</div><strong>'+value+'</strong><small>'+note+'</small></article>';
const panel=(title,body)=>'<article class="panel"><h2>'+title+'</h2>'+body+'</article>';
const table=(heads,rows)=>'<div class="table"><table><thead><tr>'+heads.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const button=(label,section,term='',kind='')=>'<button class="link" data-tab="'+section+'" data-term="'+esc(term)+'" data-kind="'+esc(kind)+'">'+esc(label)+'</button>';
function flow(){
  const counts=fields.map(f=>sum(data.events.filter(e=>e.task===f),'units'));
  return fields.map((f,i)=>'<div class="flow"><div>'+button(f,'Movement ledger','',f)+'<b>'+fmt(counts[i])+'</b></div><div class="bar"><i style="width:'+100*counts[i]/Math.max(1,...counts)+'%"></i></div></div>').join('');
}
function overview(){
  const w=data.workers, p=sum(w,'picks'), err=sum(w,'errors');
  const open=data.cases.filter(c=>c.status!=='Closed');
  return '<div class="cards">'+card('First-pass pick accuracy',pct(p-err,p),fmt(err)+' corrected units / '+fmt(p)+' picked')+card('Direct labour performance',pct(sum(w,'earned'),sum(w,'direct')),'Standard minutes earned / direct minutes')+card('Colleagues on shift',w.length,fmt(sum(w,'direct')/60)+' direct labour hours')+card('Unresolved cases',open.length,open.filter(c=>c.priority==='High').length+' high priority')+'</div><div class="split">'+panel('Units processed by activity',flow()+'<small>A unit can pass through several activities. Each activity has its own count.</small>')+panel('Manager handover',table(['Unresolved issue','Area'],open.filter(c=>c.priority==='High').map(c=>[button(c.description,'Incidents',c.id),esc(c.area)]))+'<p>'+button('View all cases','Incidents')+'</p><h2>Time on shift</h2>'+table(['Time category','Labour hours'],[['Direct work',fmt(sum(w,'direct')/60)],['Briefing and bay wait',fmt(sum(w,'support')/60)],['Recorded breaks',fmt(sum(w,'breaks')/60)]]))+'</div>';
}
function operations(){
  const rows=fields.map(f=>{
    const e=data.events.filter(e=>e.task===f),u=sum(e,'units'),m=e.reduce((s,x)=>s+x.end-x.start,0), t=e[0].target;
    return [button(f,'Movement ledger','',f),fmt(u),fmt(m/60),fmt(60*u/m),t,pct(60*u/t,m)];
  });
  const hourly=Array.from({length:8},(_,i)=>{
    const end=data.start+60*(i+1), list=data.events.filter(e=>e.end>end-60 && e.end<=end);
    return [hour(end-60)+'–'+hour(end),...['Receiving','Picking','Dispatch'].map(f=>fmt(sum(list.filter(e=>e.task===f),'units')))];
  });
  return panel('Activity performance',table(['Activity','Units','Direct hours','Units / direct h','Scenario target / h','Performance'],rows)+'<p class="muted">Targets are fictional and activity-specific. Performance divides standard minutes earned by direct working minutes.</p>')+panel('Inbound and outbound by hour',table(['Completion window','Received units','Picked units','Dispatched units'],hourly)+'<small>All units in a movement count in its completion hour.</small>');
}
function controls(label,opts){
  return '<div class="sectionhead"><label>Search '+label+'<input id="query" type="search" value="'+esc(query)+'"></label>'+(opts?'<label>Filter<select id="filter"><option value="">All</option>'+opts.map(x=>'<option'+(filter===x?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>':'')+'</div>';
}
function matches(values){return values.join(' ').toLowerCase().includes(query.trim().toLowerCase());}
function listing(rows,headers){
  const size=25;page=Math.min(page,Math.max(0,Math.ceil(rows.length/size)-1));
  return rows.length?table(headers,rows.slice(page*size,(page+1)*size))+'<div class="pager"><span>'+fmt(page*size+1)+'–'+fmt(Math.min(rows.length,(page+1)*size))+' of '+fmt(rows.length)+'</span><button data-page="-1" '+(page===0?'disabled':'')+'>Previous</button><button data-page="1" '+((page+1)*size>=rows.length?'disabled':'')+'>Next</button></div>':'<p>No matching records.</p>';
}
function people(){
  const w=data.workers.filter(w=>matches([w.name]));
  return panel('Colleague time and productivity','<p>Select a colleague to inspect their chronological activity, including breaks and waiting. Units per hour use direct working time. Compare colleagues doing similar tasks.</p>'+controls('colleagues')+listing(w.map(x=>[button(x.name,'Movement ledger',x.name),fmt(x.direct),x.breaks,x.support,fmt(x.units),fmt(60*x.units/x.direct),pct(x.earned,x.direct),pct(x.picks-x.errors,x.picks)]),['Colleague','Direct min','Break min','Support min','Task units','Units / direct h','Performance','Pick accuracy']));
}
function quality(){
  const e=data.events.filter(x=>x.task==='Picking'),p=sum(e,'units'),bad=sum(e,'errors'),issues=e.filter(x=>x.errors);
  return '<div class="cards">'+card('First-pass pick accuracy',pct(p-bad,p),'Correct units / picked units')+card('Picked units',fmt(p),'All simulated pick units are checked')+card('Corrected pick units',fmt(bad),'Errors recorded before dispatch')+'</div>'+panel('Pick exceptions',controls('exceptions')+listing(issues.filter(x=>matches([x.worker,x.id,x.sku,x.exception])).map(x=>[button(x.id,'Movement ledger',x.id),hour(x.end),esc(x.worker),esc(x.sku),esc(x.exception),x.errors]),['Movement','Time','Colleague','Product','Exception','Units corrected']));
}
function incidents(){
  const rows=data.cases.filter(c=>(!filter||c.status===filter)&&matches(Object.values(c)));
  return panel('Site incident register','<p>Shift-end case status, accountable team, and follow-up for each fictional incident. Select an event to inspect the associated activity.</p>'+controls('cases',['Open','Under review','Closed'])+listing(rows.map(c=>[hour(c.opened),esc(c.category),esc(c.description),'<span class="pill '+(c.priority==='High'?'priority':'')+'">'+esc(c.priority)+'</span>',esc(c.status),esc(c.area),esc(c.owner),esc(c.action),button(c.eventId,'Movement ledger',c.eventId)]),['Logged','Category','Case','Priority','Status','Area','Owner','Follow-up','Linked event']));
}
function ledger(){
  const rows=data.events.filter(e=>(!filter||e.task===filter)&&matches([e.id,e.worker,e.task,e.from,e.to,e.sku,e.exception]));
  return panel('Movement and activity ledger',controls('events, people, products or locations',[...fields,'Briefing','Bay wait','Break'])+listing(rows.map(e=>[esc(e.id),hour(e.start)+'–'+hour(e.end),e.end-e.start,esc(e.worker),esc(e.task),esc(e.from)||'—',esc(e.to)||'—',esc(e.sku)||'—',e.target?e.units:'—',esc(e.exception)||'—']),['Event','Local time','Minutes','Colleague','Activity','From','To','Product','Units','Quality flag']));
}
function draw(){
  $('tabs').innerHTML=groups.map(g=>'<button data-tab="'+g+'" aria-current="'+(tab===g)+'">'+g+'</button>').join('');
  $('content').innerHTML=[overview,operations,people,quality,incidents,ledger][groups.indexOf(tab)]();
}
async function loadReport(){
  const token=++generation,day=$('day').value,shift=$('shift').value;
  data=null;$('content').innerHTML='';$('tabs').innerHTML='';$('status').textContent='Loading report…';
  try{
    const report=shiftReports[day+'-'+shift];
    data=report;query='';filter='';page=0;
    $('status').textContent=data.workers.length+' colleagues · '+fmt(data.events.length)+' recorded activities · '+data.cases.length+' logged cases';draw();
  }catch(err){if(token===generation)$('status').textContent='Unable to load this shift. Reload the page to retry.';}
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||!data)return;
  if(b.dataset.tab){tab=b.dataset.tab;query=b.dataset.term||'';filter=b.dataset.kind||'';page=0;draw();}
  else if(b.dataset.page){page+=Number(b.dataset.page);draw();}
});
document.addEventListener('input',e=>{
  if(e.target.id!=='query')return;
  const pos=e.target.selectionStart;query=e.target.value;page=0;draw();
  $('query').focus();$('query').setSelectionRange(pos,pos);
});
document.addEventListener('change',e=>{
  if(e.target.id==='filter'){filter=e.target.value;page=0;draw();}
  if(['day','shift'].includes(e.target.id))loadReport();
});
for(let i=9;i<=13;i++){const s='2026-11-'+String(i).padStart(2,'0');$('day').add(new Option(s,s));}
loadReport();
