const button = document.querySelector('#webgpu-init-button');
const canvas = document.querySelector('#webgpu-canvas');

button.addEventListener('click', async () => {
  try {
    if (!navigator.gpu) {
      console.error('WebGPU is not available on navigator.gpu.');
      return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.log('No GPU adapter is available on this device/browser.');
      return;
    }
    console.log('Adapter info:', adapter.info, 'Features:', Array.from(adapter.features));

    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'opaque' });

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.11, g: 0.42, b: 0.86, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.end();
    device.queue.submit([encoder.finish()]);
  } catch (err) {
    console.error('WebGPU initialization failed.', err);
  }
});
