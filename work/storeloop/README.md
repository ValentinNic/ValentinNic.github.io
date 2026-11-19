# StoreLoop
Open demo.html in a browser. Select a network, stop count and algorithm to compare closed delivery tours from the same distribution centre. All locations are synthetic.

Run `node benchmark.js` with Node 18+ to reproduce the comparison across seeds 1–100 with nine stores per network. The script validates route feasibility, distance ordering, and the exact solver against exhaustive permutation search on ten seven-store networks. The reduction is calculated from summed route lengths. Matching the optimum uses a tolerance of 1e-8 model km.

engine.js contains the deterministic generator, distance matrix and three solvers. Nearest neighbour picks the closest remaining store. Best-improvement 2-opt reverses a segment until no reversal shortens the tour. Held–Karp uses subset dynamic programming with parent pointers to recover the optimal tour. Its memory scales as O(n 2^n) and time as O(n² 2^n). The interactive solver caps runs at 12 stores. Road networks, vehicle capacity, driver hours and store delivery windows are outside this model.
