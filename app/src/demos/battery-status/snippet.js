const statusEl = document.querySelector('#battery-status');

function update(battery) {
  const percent = Math.round(battery.level * 100);
  statusEl.textContent = `${percent}% · ${battery.charging ? 'Charging' : 'Not charging'}`;
}

if ('getBattery' in navigator) {
  navigator.getBattery().then((battery) => {
    update(battery);
    battery.addEventListener('levelchange', () => update(battery));
    battery.addEventListener('chargingchange', () => update(battery));
    battery.addEventListener('chargingtimechange', () => update(battery));
    battery.addEventListener('dischargingtimechange', () => update(battery));
  });
} else {
  statusEl.textContent = 'The Battery Status API is not available in this browser.';
}
