// Times are whole minutes after 08:00. Office closes at 20:00.
export const CLOSE = 720
export const BASE = {late:1, policy:'fifo'}
export function ticketsFor(seed, pattern='afternoon') {
  let state=seed>>>0
  const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296}
  const profiles={
    afternoon:[4,5,6,7,8,10,13,16,18,15,10,6],
    steady:[8,8,9,9,9,9,9,9,9,9,8,8],
    morning:[15,16,14,12,10,9,8,7,6,5,4,4]
  }
  const tickets=[]
  for(const [hour,rate] of profiles[pattern].entries()){
    let offset=0
    while(true){
      offset+=-Math.log(1-random())*60/rate
      if(offset>=60)break
      tickets.push({id:tickets.length+1,at:hour*60+Math.floor(offset),service:6+Math.floor(random()*18),urgent:random()<0.23})
    }
  }
  return tickets
}
export function simulate(tickets,{late,policy}){
  const jobs=tickets.map(t=>({...t,start:null,end:null,agent:null})).sort((a,b)=>a.at-b.at || a.id-b.id)
  const agents=Array.from({length:5},(_,i)=>({id:i+1,from:i<5-late?0:240,to:i<5-late?480:CLOSE,free:0}))
  const pending=[],events=new Set([0,240,480,CLOSE,...jobs.map(j=>j.at)])
  let next=0
  while(events.size){
    const at=Math.min(...events);events.delete(at)
    if(at>=CLOSE)break
    while(next<jobs.length && jobs[next].at<=at)pending.push(jobs[next++])
    for(const a of agents){
      if(!pending.length)break
      if(at<a.from || at>=a.to || a.free>at)continue
      const priority=policy==='priority'?pending.findIndex(j=>j.urgent):-1
      const [j]=pending.splice(Math.max(0,priority),1)
      j.agent=a.id;j.start=at;j.end=at+j.service;a.free=j.end
      if(j.end<CLOSE)events.add(j.end)
    }
  }
  return {jobs,agents}
}
export const statusAt=(j,t)=>j.at>t?'Future':j.start===null || j.start>t?'Waiting':j.end>t?'In service':'Completed'
export function snapshot(run,t){
  const arrived=run.jobs.filter(j=>j.at<=t),started=arrived.filter(j=>j.start!==null && j.start<=t)
  const waits=started.map(j=>j.start-j.at).sort((a,b)=>a-b)
  const quantile=p=>waits.length?waits[Math.ceil(p*waits.length)-1]:null
  return {arrived:arrived.length,started:started.length,waiting:arrived.length-started.length,median:quantile(.5),p90:quantile(.9),completed:started.filter(j=>j.end<=t).length}
}
export const clock=m=>String(8+Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')
export function overrun(run){return run.jobs.reduce((sum,j)=>j.end===null?sum:sum+Math.max(0,j.end-run.agents[j.agent-1].to),0)}
