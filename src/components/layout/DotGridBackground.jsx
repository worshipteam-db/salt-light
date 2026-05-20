import React, { useRef, useEffect } from "react";

export default function DotGridBackground({
  dotSize = 5,
  gap = 15,
  baseColor = "#2F293A",
  activeColor = "#5227FF",
  proximity = 120,
  shockRadius = 250,
  shockStrength = 5,
  resistance = 750,
  returnDuration = 1.5,
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let animationFrame;

    const dots = [];

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;

      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      dots.length = 0;

      for (let x = 0; x < width; x += gap) {
        for (let y = 0; y < height; y += gap) {
          dots.push({
            x,
            y,
            offsetX: 0,
            offsetY: 0,
          });
        }
      }
    };

    resize();

    const handleResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();

      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const dx = mouseRef.current.x - dot.x;
        const dy = mouseRef.current.y - dot.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = 0;
        let targetY = 0;

        if (dist < shockRadius) {
          const force =
            ((shockRadius - dist) / shockRadius) * shockStrength;

          const angle = Math.atan2(dy, dx);

          targetX = -Math.cos(angle) * force * resistance * 0.01;
          targetY = -Math.sin(angle) * force * resistance * 0.01;
        }

        dot.offsetX += (targetX - dot.offsetX) * 0.08 * returnDuration;
        dot.offsetY += (targetY - dot.offsetY) * 0.08 * returnDuration;

        const drawX = dot.x + dot.offsetX;
        const drawY = dot.y + dot.offsetY;

        const isActive = dist < proximity;

        ctx.beginPath();
        ctx.fillStyle = isActive ? activeColor : baseColor;
        ctx.arc(drawX, drawY, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    dotSize,
    gap,
    baseColor,
    activeColor,
    proximity,
    shockRadius,
    shockStrength,
    resistance,
    returnDuration,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}