import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function SlidePresenter({ slides }) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setCurrent(c => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const slide = slides[current];
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="slide-container">
      <div className="slide-progress">
        <div className="slide-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="slide" key={current}>
        {slide.tag && <div className="slide-tag">{slide.tag}</div>}
        <h2 dangerouslySetInnerHTML={{ __html: slide.title }} />
        <div className="slide-body">{slide.content}</div>
      </div>

      <div className="slide-nav">
        <button onClick={prev} disabled={current === 0}><FiChevronLeft /></button>
        <div className="slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slide-dot${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <span className="slide-counter">{current + 1} / {total}</span>
        <button onClick={next} disabled={current === total - 1}><FiChevronRight /></button>
      </div>
    </div>
  );
}
