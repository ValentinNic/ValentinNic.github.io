import assert from 'node:assert/strict'
import {BASE,CLOSE,ticketsFor,simulate,snapshot,overrun} from './model.mjs'
for(const pattern of ['afternoon','steady','morning'])for(let seed=1;seed<=10;seed++){
 const tickets=ticketsFor(seed,pattern)
 assert.deepEqual(tickets,ticketsFor(seed,pattern))
 for(const policy of ['fifo','priority'])for(let late=0;late<=5;late++){
  const run=simulate(tickets,{late,policy})
  assert.equal(run.agents.reduce((s,a)=>s+a.to-a.from,0),2400)
  for(const a of run.agents){
   let free=a.from
   for(const j of run.jobs.filter(j=>j.agent===a.id).sort((a,b)=>a.start-b.start)){
    assert.ok(j.start>=j.at && j.start>=free && j.start<a.to)
    assert.equal(j.end-j.start,j.service);free=j.end
   }
  }
  for(const t of [0,120,240,480,CLOSE]){
   const s=snapshot(run,t);assert.equal(s.arrived,s.started+s.waiting);assert.ok(s.completed<=s.started)
  }
 }
}
const example=[{id:1,at:0,service:15},{id:2,at:1,service:5},{id:3,at:2,service:1,urgent:true}]
assert.equal(simulate(example,{late:4,policy:'priority'}).jobs[2].start,15)
assert.equal(simulate(example,{late:4,policy:'fifo'}).jobs[1].start,15)
assert.equal(snapshot(simulate([],BASE),720).p90,null)
assert.equal(overrun(simulate([{id:1,at:719,service:10}],BASE)),9)
console.log('360 scenario configurations and boundary fixtures passed.')
