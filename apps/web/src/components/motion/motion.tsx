"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach(el => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    const safety = setTimeout(() => document.querySelectorAll("[data-reveal]:not(.in)").forEach(el => el.getBoundingClientRect().top < innerHeight && el.classList.add("in")), 1500);
    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(safety);
    };
  }, [path]);
  return null;
}

export function CountUp({ value, className, duration = 1400 }: { value: number; className?: string; duration?: number }) {
  const [n, setN] = useState(value);
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (reduced() || value === 0) return setN(value);
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setN(Math.round(value * (1 - Math.pow(2, -10 * k))));
        if (k < 1) raf = requestAnimationFrame(tick);
        else setN(value);
      };
      raf = requestAnimationFrame(tick);
    });
    if (el.current) io.observe(el.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return <span ref={el} className={className}>{n.toLocaleString("en-IN")}</span>;
}

export function FadeImg({ className = "", ...p }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [ok, setOk] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (ref.current?.complete) setOk(true);
  }, []);
  return <img ref={ref} {...p} alt={p.alt ?? ""} className={`img-fade ${ok ? "ready" : ""} ${className}`} onLoad={() => setOk(true)} />;
}

export function Tilt({ children, className = "", max = 7, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const d = el.current;
    if (!d || reduced() || matchMedia("(pointer: coarse)").matches) return;
    const host = d.parentElement ?? d;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      d.style.transform = `perspective(1100px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
      d.style.transitionDuration = "0.25s";
    };
    const leave = () => {
      d.style.transform = "";
      d.style.transitionDuration = "";
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return <div ref={el} className={`tilt ${className}`} style={style}>{children}</div>;
}

export function Roll({ value }: { value: number }) {
  const prev = useRef(value);
  const dir = value >= prev.current ? "roll-up" : "roll-down";
  const changed = value !== prev.current;
  useEffect(() => {
    prev.current = value;
  }, [value]);
  return <span key={value} className={`tabular-nums ${changed ? dir : ""}`}>{value}</span>;
}
