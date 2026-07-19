import React, { useEffect, useRef } from 'react';

const InteractiveDotGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dots: Dot[] = [];

    // 🔧 DENSITY + VISIBILITY SETTINGS
    const spacing = 22;           // 👈 dots closer (more count)
    const dotSize = 1;          // 👈 clearly visible
    const mouseRadius = 160;
    const mouseForce = 0.6;
    const returnForce = 0.06;
    const friction = 0.85;

    class Dot {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx = 0;
      vy = 0;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
      }

      update(mx: number, my: number) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          this.vx -= (dx / dist) * force * mouseForce;
          this.vy -= (dy / dist) * force * mouseForce;
        }

        // return to original position
        this.vx += (this.baseX - this.x) * returnForce;
        this.vy += (this.baseY - this.y) * returnForce;

        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff'; // ✨ white dots for contrast
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dots = [];

      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          dots.push(new Dot(x, y));
        }
      }
    };

    const animate = () => {
      // ⚪ white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // soft gray mouse glow
      const glow = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        mouseRadius
      );
      glow.addColorStop(0, 'rgba(255,255,255,0.16)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      dots.forEach(dot => {
        dot.update(mouseRef.current.x, mouseRef.current.y);
        dot.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', init);

    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
};

export default InteractiveDotGrid;
