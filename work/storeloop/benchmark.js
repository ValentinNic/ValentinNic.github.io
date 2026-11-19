const assert = require('node:assert/strict');
const {scenario,distances,lengthOf,nearest,twoOpt,exact} = require('./engine');
function exhaustive(d, route=[0], remaining=d[0].map((_,i)=>i).slice(1)) {
  if (!remaining.length) return lengthOf([...route,0],d);
  return Math.min(...remaining.map(i=>exhaustive(d,[...route,i],remaining.filter(j=>j!==i))));
}
let baseline=0, improved=0, optimal=0, matches=0;
for (let seed=1; seed<=100; seed++) {
  const d=distances(scenario(seed,9));
  const first=nearest(d), refined=twoOpt(first,d), best=exact(d);
  for (const route of [first,refined,best]) {
    assert.deepEqual(route.slice(1,-1).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9]);
    assert.equal(route[0],0); assert.equal(route.at(-1),0);
  }
  const [a,b,c]=[first,refined,best].map(route=>lengthOf(route,d));
  assert.ok(a+1e-8>=b && b+1e-8>=c);
  baseline+=a; improved+=b; optimal+=c;
  if (Math.abs(b-c)<1e-8) matches++;
}
for (let seed=1; seed<=10; seed++) {
  const d=distances(scenario(seed,7));
  assert.ok(Math.abs(lengthOf(exact(d),d)-exhaustive(d))<1e-8);
}
console.log(JSON.stringify({scenarios:100,stores:9, reductionPercent:100*(1-improved/baseline),gapPercent:100*(improved/optimal-1), optimalMatches:matches},null,2));
