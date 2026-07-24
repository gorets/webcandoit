const target = document.querySelector('#target');

const observer = new IntersectionObserver(
  ([entry]) => {
    console.log('visible:', Math.round(entry.intersectionRatio * 100) + '%');
    entry.target.classList.toggle('on-screen', entry.isIntersecting);
  },
  { threshold: [0, 0.25, 0.5, 0.75, 1] },
);

observer.observe(target);

// Stop watching with: observer.disconnect();
