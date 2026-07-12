import type { DemoMeta } from '../demos/types';
import './UnsupportedPanel.css';

export function UnsupportedPanel({ meta }: { meta: DemoMeta }) {
  return (
    <div role="status" className="unsupported-panel">
      <p>
        <strong>{meta.title}</strong> is not supported in this browser.
      </p>
      <p>
        Check the <a href={meta.specUrl}>documentation</a> for current browser support.
      </p>
    </div>
  );
}
