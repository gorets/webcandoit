import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8080);
createApp({
  pushStorePath: process.env.PUSH_STORE_PATH,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
}).listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
