import { CATEGORY_ORDER } from '../categories';
import { demoMetas } from '../registry';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero">
      <p className="hero-eyebrow">Web Platform</p>
      <h1 className="hero-title">See what your browser can do</h1>
      <p className="hero-subtitle">
        Live, working demos of the web platform APIs your browser supports today — installable apps,
        on-device AI, hardware access, and everything in between.
      </p>
      <p className="hero-stats">
        <span>{demoMetas.length} demos</span>
        <span aria-hidden="true">·</span>
        <span>{CATEGORY_ORDER.length} categories</span>
        <span aria-hidden="true">·</span>
        <span>runs entirely in your browser</span>
      </p>
    </section>
  );
}
