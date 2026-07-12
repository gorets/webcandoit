import { useEffect, useRef, useState } from 'react';

// WebGPU is not part of TypeScript's bundled DOM lib in this project (no
// @webgpu/types dependency), so we describe the minimal shape we actually use
// and cast at the boundaries (navigator.gpu, canvas.getContext('webgpu')).

interface GPUAdapterInfoLike {
  vendor?: string;
  architecture?: string;
  device?: string;
  description?: string;
}

interface GPUCommandBufferLike {
  readonly __brand?: 'GPUCommandBuffer';
}

interface GPUTextureViewLike {
  readonly __brand?: 'GPUTextureView';
}

interface GPUTextureLike {
  createView(): GPUTextureViewLike;
}

interface GPURenderPassEncoderLike {
  end(): void;
}

interface GPUColorLike {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface GPURenderPassColorAttachmentLike {
  view: GPUTextureViewLike;
  clearValue: GPUColorLike;
  loadOp: 'clear' | 'load';
  storeOp: 'store' | 'discard';
}

interface GPURenderPassDescriptorLike {
  colorAttachments: GPURenderPassColorAttachmentLike[];
}

interface GPUCommandEncoderLike {
  beginRenderPass(descriptor: GPURenderPassDescriptorLike): GPURenderPassEncoderLike;
  finish(): GPUCommandBufferLike;
}

interface GPUQueueLike {
  submit(commandBuffers: GPUCommandBufferLike[]): void;
}

interface GPUDeviceLike {
  readonly queue: GPUQueueLike;
  createCommandEncoder(): GPUCommandEncoderLike;
  destroy(): void;
}

interface GPUCanvasContextLike {
  configure(config: {
    device: GPUDeviceLike;
    format: string;
    alphaMode?: 'opaque' | 'premultiplied';
  }): void;
  getCurrentTexture(): GPUTextureLike;
  unconfigure(): void;
}

interface GPUAdapterLike {
  readonly info?: GPUAdapterInfoLike;
  readonly features: Iterable<string>;
  requestDevice(): Promise<GPUDeviceLike>;
}

interface NavigatorGPULike {
  requestAdapter(): Promise<GPUAdapterLike | null>;
  getPreferredCanvasFormat(): string;
}

interface CanvasWithGPUContext {
  getContext(contextId: 'webgpu'): GPUCanvasContextLike | null;
  width: number;
  height: number;
}

function getNavigatorGpu(): NavigatorGPULike | undefined {
  return (navigator as unknown as { gpu?: NavigatorGPULike }).gpu;
}

type Status = 'idle' | 'requesting' | 'ready' | 'no-adapter' | 'error';

export default function WebGpuDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceRef = useRef<GPUDeviceLike | null>(null);
  const contextRef = useRef<GPUCanvasContextLike | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [adapterInfo, setAdapterInfo] = useState<GPUAdapterInfoLike | null>(null);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      try {
        contextRef.current?.unconfigure();
      } catch {
        // ignore cleanup errors
      }
      deviceRef.current?.destroy();
      deviceRef.current = null;
      contextRef.current = null;
    };
  }, []);

  const run = async () => {
    setError(null);
    setStatus('requesting');
    try {
      const gpu = getNavigatorGpu();
      if (!gpu) {
        setError('WebGPU is not available on navigator.gpu.');
        setStatus('error');
        return;
      }

      const adapter = await gpu.requestAdapter();
      if (!adapter) {
        setStatus('no-adapter');
        return;
      }
      setAdapterInfo(adapter.info ?? null);
      setFeatures(Array.from(adapter.features));

      const device = await adapter.requestDevice();
      deviceRef.current = device;

      const canvas = canvasRef.current as unknown as CanvasWithGPUContext | null;
      if (!canvas) {
        setError('Canvas element is not available.');
        setStatus('error');
        return;
      }
      const context = canvas.getContext('webgpu');
      if (!context) {
        setError('Could not obtain a WebGPU canvas context.');
        setStatus('error');
        return;
      }
      contextRef.current = context;

      const format = gpu.getPreferredCanvasFormat();
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

      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WebGPU initialization failed.');
      setStatus('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>
        Requests a GPU adapter and device, configures a canvas for WebGPU rendering, and clears it
        to a solid color via a render pass.
      </p>
      <div>
        <button type="button" onClick={run} disabled={status === 'requesting'}>
          {status === 'requesting' ? 'Initializing…' : 'Initialize WebGPU'}
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {status === 'no-adapter' && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          No GPU adapter is available on this device/browser.
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={480}
        height={270}
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
        }}
      />
      {(adapterInfo || features.length > 0) && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
          }}
        >
          <p style={{ margin: 0 }}>
            Adapter: <strong>{adapterInfo?.description || adapterInfo?.vendor || 'unknown'}</strong>
          </p>
          {adapterInfo?.architecture && (
            <p style={{ margin: '0.5rem 0 0' }}>Architecture: {adapterInfo.architecture}</p>
          )}
          <p style={{ margin: '0.5rem 0 0' }}>
            Features: {features.length > 0 ? features.join(', ') : 'none reported'}
          </p>
        </div>
      )}
    </div>
  );
}
