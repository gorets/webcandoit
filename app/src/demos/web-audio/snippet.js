// AudioContext must be created or resumed from a user gesture.
const ctx = new AudioContext();

document.querySelector('#play').addEventListener('click', async () => {
  await ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 440; // A4
  gain.gain.value = 0.2;

  // Build the graph: oscillator -> gain -> speakers.
  osc.connect(gain).connect(ctx.destination);
  osc.start();

  // Stop after 1 second.
  osc.stop(ctx.currentTime + 1);
});
