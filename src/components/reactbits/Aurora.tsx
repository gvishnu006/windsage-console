import React, { useEffect, useRef } from 'react';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
  opacity?: number;
}

export const Aurora: React.FC<AuroraProps> = ({
  colorStops = ['#0e2a38', '#17556f', '#0b1d28'],
  amplitude = 1.0,
  speed = 0.6,
  className = '',
  opacity = 0.35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (mediaQuery && mediaQuery.matches) return;
    } catch {
      // ignore
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 400);
    let height = (canvas.height = canvas.offsetHeight || 200);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 400;
      height = canvas.height = canvas.offsetHeight || 200;
    };

    window.addEventListener('resize', handleResize);

    let t = 0;
    const render = () => {
      if (width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      t += 0.008 * speed;
      ctx.clearRect(0, 0, width, height);

      const numWaves = 3;
      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        const baseColor = colorStops[i % colorStops.length];
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `${baseColor}00`);
        gradient.addColorStop(0.5, `${baseColor}99`);
        gradient.addColorStop(1, `${baseColor}00`);

        ctx.fillStyle = gradient;

        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 20) {
          const y =
            height * 0.45 +
            Math.sin(x * 0.003 + t + i * 1.5) * 35 * amplitude +
            Math.cos(x * 0.006 - t * 0.8 + i) * 20 * amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorStops, amplitude, speed]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ opacity }}
        className="h-full w-full block transition-opacity duration-700"
      />
    </div>
  );
};

export default Aurora;
