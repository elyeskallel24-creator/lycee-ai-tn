import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#6C3BFF', '#4F46E5', '#00FFB2', '#FFD60A', '#FF6B6B'],
  });
};
