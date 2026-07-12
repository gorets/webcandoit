const getOnceButton = document.querySelector('#get-position');
const watchButton = document.querySelector('#watch-position');
const output = document.querySelector('#position-output');
let watchId = null;

function renderPosition(pos) {
  output.textContent =
    `Lat: ${pos.coords.latitude.toFixed(6)}, ` +
    `Lng: ${pos.coords.longitude.toFixed(6)}, ` +
    `Accuracy: ${Math.round(pos.coords.accuracy)} m`;
}

function handleError(err) {
  console.error('Geolocation error', err);
  output.textContent = 'Could not determine your location.';
}

getOnceButton.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(renderPosition, handleError, {
    enableHighAccuracy: true,
    timeout: 10000,
  });
});

watchButton.addEventListener('click', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    return;
  }
  watchId = navigator.geolocation.watchPosition(renderPosition, handleError, {
    enableHighAccuracy: true,
    timeout: 10000,
  });
});
