import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import { useState } from 'react';
import './CodeBlock.css';

export interface CodeVariant {
  label: string;
  code: string;
  language?: 'tsx' | 'javascript';
}

export function CodeBlock({ variants }: { variants: CodeVariant[] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const active = variants[Math.min(activeIndex, variants.length - 1)];
  const trimmed = active.code.trim();
  const language = active.language ?? 'tsx';
  const grammar = language === 'javascript' ? Prism.languages.javascript : Prism.languages.tsx;
  const html = Prism.highlight(trimmed, grammar, language);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the code is still visible and selectable.
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-block-tabs">
          <button
            type="button"
            className="code-block-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Collapse code' : 'Expand code'}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={open ? 'code-block-chevron code-block-chevron-open' : 'code-block-chevron'}
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
          {variants.length > 1 ? (
            variants.map((variant, index) => (
              <button
                key={variant.label}
                type="button"
                className={
                  index === activeIndex ? 'code-block-tab code-block-tab-active' : 'code-block-tab'
                }
                onClick={() => setActiveIndex(index)}
              >
                {variant.label}
              </button>
            ))
          ) : (
            <span className="code-block-tab code-block-tab-active">{active.label}</span>
          )}
        </div>
        <button type="button" className="code-block-copy" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {open && (
        <pre className="code-block-pre">
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is Prism-generated from our own source, not user input */}
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      )}
    </div>
  );
}
