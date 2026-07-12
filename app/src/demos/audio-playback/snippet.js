async function createToneUrl() {
  const duration = 1.2;
  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);

  const oscillator = offlineCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = 440;

  const gain = offlineCtx.createGain();
  gain.gain.value = 0.2;
  oscillator.connect(gain);
  gain.connect(offlineCtx.destination);
  oscillator.start(0);
  oscillator.stop(duration);

  const rendered = await offlineCtx.startRendering();
  const samples = rendered.getChannelData(0);
  const wavBytes = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    wavBytes[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return URL.createObjectURL(new Blob([wavBytes.buffer], { type: 'audio/wav' }));
}

const audio = document.querySelector('#tone-audio');
audio.src = await createToneUrl();

if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Generated Tone',
    artist: 'whatpwacando.today',
    album: 'Media Session demo',
  });
  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('stop', () => {
    audio.pause();
    audio.currentTime = 0;
  });
}
