// engine/seed.ts
let seed = 1;

export function setSeed(newSeed: number) {
  seed = newSeed;
}

// Returns a number between 0 and 1
export function seededRandom(): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Example: random number in range
export function randomInRange(min: number, max: number): number {
  return min + seededRandom() * (max - min);
}
