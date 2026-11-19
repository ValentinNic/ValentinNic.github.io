// Point zero is the distribution centre. Routes include the return leg.
function scenario(seed, stores) {
  let state = seed;
  function random() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  }
  return [[50, 50], ...Array.from({length: stores}, () => [5 + 90 * random(), 5 + 90 * random()])];
}
function distances(points) {
  return points.map(([x,y]) => points.map(([u,v]) => Math.hypot(x-u,y-v)));
}
function lengthOf(route, d) {
  return route.slice(1).reduce((sum, stop, i) => sum + d[route[i]][stop], 0);
}
function nearest(d) {
  const remaining = new Set(d[0].map((_,i) => i).slice(1));
  const route = [0];
  while (remaining.size) {
    const last = route[route.length-1];
    const next = [...remaining].reduce((a,b) => d[last][a] <= d[last][b] ? a : b);
    route.push(next);
    remaining.delete(next);
  }
  return [...route,0];
}
function twoOpt(initial, d) {
  let route = initial.slice();
  while (true) {
    let candidate = route;
    let best = lengthOf(route,d);
    for (let i=1; i<route.length-2; i++) {
      for (let j=i+1; j<route.length-1; j++) {
        const reversed = [...route.slice(0,i), ...route.slice(i,j+1).reverse(), ...route.slice(j+1)];
        const distance = lengthOf(reversed,d);
        if (distance < best-1e-9) { best = distance; candidate = reversed; }
      }
    }
    if (candidate === route) return route;
    route = candidate;
  }
}
// Held–Karp: minimum cost to visit a subset and finish at each possible store.
function exact(d) {
  const n = d.length-1;
  if (n < 1 || n > 12) throw new RangeError('Exact solver supports 1 to 12 stores');
  const subsets = 1 << n;
  const costs = new Float64Array(subsets*n).fill(Infinity);
  const parents = new Int8Array(subsets*n).fill(-1);
  for (let mask=1; mask<subsets; mask++) {
    for (let end=0; end<n; end++) {
      if (!(mask & (1<<end))) continue;
      const prior = mask ^ (1<<end);
      const index = mask*n + end;
      if (!prior) { costs[index] = d[0][end+1]; continue; }
      for (let prev=0; prev<n; prev++) {
        if (!(prior & (1<<prev))) continue;
        const cost = costs[prior*n+prev] + d[prev+1][end+1];
        if (cost < costs[index]) { costs[index] = cost; parents[index] = prev; }
      }
    }
  }
  let mask = subsets-1;
  let last = 0;
  for (let i=1; i<n; i++) {
    if (costs[mask*n+i]+d[i+1][0] < costs[mask*n+last]+d[last+1][0]) last=i;
  }
  const reversed = [];
  while (mask) {
    reversed.push(last+1);
    const prev = parents[mask*n+last];
    mask ^= 1<<last;
    last = prev;
  }
  return [0,...reversed.reverse(),0];
}
if (typeof module !== 'undefined') module.exports = {scenario, distances, lengthOf, nearest, twoOpt, exact};
