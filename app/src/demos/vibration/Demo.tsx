export default function VibrationDemo() {
  return (
    <div>
      <button type="button" onClick={() => navigator.vibrate(200)}>
        Vibrate 200ms
      </button>
      <button type="button" onClick={() => navigator.vibrate([100, 50, 100, 50, 300])}>
        Vibrate pattern
      </button>
    </div>
  );
}
