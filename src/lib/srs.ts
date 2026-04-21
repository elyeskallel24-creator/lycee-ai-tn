// SM-2 spaced repetition algorithm
export type Quality = 0 | 3 | 4 | 5; // Again / Hard / Good / Easy

export interface SrsState {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string; // ISO
}

export function sm2(prev: { ease_factor: number; interval: number; repetitions: number }, q: Quality): SrsState {
  let { ease_factor, interval, repetitions } = prev;
  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ease_factor);
    ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  const next = new Date();
  next.setDate(next.getDate() + interval);
  return { ease_factor, interval, repetitions, next_review: next.toISOString() };
}
