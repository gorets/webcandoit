const nameInput = document.querySelector('#cookie-name');
const valueInput = document.querySelector('#cookie-value');
const setButton = document.querySelector('#cookie-set');
const cookieList = document.querySelector('#cookie-list');

async function refresh() {
  const cookies = await window.cookieStore.getAll();
  cookieList.textContent = cookies.map((c) => `${c.name}=${c.value}`).join(', ');
}

setButton.addEventListener('click', async () => {
  await window.cookieStore.set(nameInput.value, valueInput.value);
  await refresh();
});

window.cookieStore.addEventListener('change', () => {
  refresh();
});

refresh();
