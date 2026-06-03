/* ======================================================
   Shared components: icons, charts, avatars, helpers
====================================================== */

const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Icons (inline SVG, original) ---------- */
const Icon = {
  dash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>,
  book: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z"/><path d="M4 17.5h15"/></svg>,
  users: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.8-3.2 3.4-5 6-5s4.9 1.8 6 5"/><circle cx="17" cy="6.5" r="2.4"/><path d="M16 13c2.6 0 4.5 1.4 5 4"/></svg>,
  chart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-7"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><polyline points="4 12 10 18 20 6"/></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2H4.5L6 16Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3l2.6 5.5 5.9.8-4.3 4.1 1.1 5.9L12 16.8 6.7 19.3l1.1-5.9L3.5 9.3l5.9-.8L12 3Z"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  edit: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="M14 6l4 4"/></svg>,
  save: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M8 4v5h7V4"/><rect x="8" y="14" width="9" height="5"/></svg>,
  cap: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.6 2.7 3 6 3s6-1.4 6-3v-5"/><path d="M22 9v5"/></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 20s-7-4.4-9-9a4.5 4.5 0 0 1 8-3.4A4.5 4.5 0 0 1 21 11c-2 4.6-9 9-9 9Z"/></svg>,
  sparkle: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z"/></svg>,
  alert: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v5"/><circle cx="12" cy="17.5" r="1" fill="currentColor"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>,
};

/* ---------- Helpers ---------- */
const totalScore = (s) => (s.collected || 0) + (s.midterm || 0) + (s.final || 0);
const grade = (t) => {
  if (t >= 80) return { letter: "A",  gpa: 4.0, tone: "good" };
  if (t >= 75) return { letter: "B+", gpa: 3.5, tone: "good" };
  if (t >= 70) return { letter: "B",  gpa: 3.0, tone: "good" };
  if (t >= 65) return { letter: "C+", gpa: 2.5, tone: "warn" };
  if (t >= 60) return { letter: "C",  gpa: 2.0, tone: "warn" };
  if (t >= 55) return { letter: "D+", gpa: 1.5, tone: "bad" };
  if (t >= 50) return { letter: "D",  gpa: 1.0, tone: "bad" };
  return        { letter: "F",  gpa: 0.0, tone: "bad" };
};
const attendanceRate = (att) => {
  const valid = att.filter(x => x !== "H");
  const present = valid.filter(x => x === "P" || x === "L").length;
  return valid.length ? present / valid.length : 0;
};

/* ---------- Avatar ---------- */
function Avatar({ name, seed = 1, size = 32 }) {
  const initials = (name || "").split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <span className={"avatar av-" + seed} style={{ width: size, height: size, borderRadius: Math.round(size * .3), display: 'inline-grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: Math.round(size * .38), fontFamily: 'var(--font-thai)' }}>
      {initials || "?"}
    </span>
  );
}

/* ---------- Animated number ---------- */
function AnimNum({ value, decimals = 0, suffix = "", duration = 700 }) {
  const [v, setV] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    let raf, t0 = performance.now();
    const from = start.current;
    const to = Number(value) || 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else start.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="num">{v.toFixed(decimals)}{suffix}</span>;
}

/* ---------- Radar chart ---------- */
function RadarChart({ axes, values, target, size = 380 }) {
  const n = axes.length;
  const cx = size / 2, cy = size / 2;
  const r = size * 0.34;
  const rings = [0.25, 0.5, 0.75, 1];

  const point = (i, mag) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(ang) * r * mag, cy + Math.sin(ang) * r * mag];
  };

  const polygon = (vals) => vals.map((v, i) => point(i, Math.max(0.02, v)).join(",")).join(" ");
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let raf, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      setAnim(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [JSON.stringify(values)]);

  const animVals = values.map(v => v * anim);

  return (
    <svg className="radar" viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="55%">
          <stop offset="0%"  stopColor="oklch(0.78 0.22 320)" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="oklch(0.65 0.22 260)" stopOpacity="0.10"/>
        </radialGradient>
      </defs>
      {rings.map((rg, i) => (
        <polygon key={i} className="ring"
          points={axes.map((_, idx) => point(idx, rg).join(",")).join(" ")} />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} className="axis" x1={cx} y1={cy} x2={x} y2={y} />;
      })}
      {target && (
        <polygon className="target-area" points={polygon(target)} />
      )}
      <polygon className="area" points={polygon(animVals)} />
      {animVals.map((v, i) => {
        const [x, y] = point(i, Math.max(0.02, v));
        return <circle key={i} className="dot" cx={x} cy={y} r="4" />;
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1.18);
        const anchor = Math.abs(x - cx) < 4 ? "middle" : (x > cx ? "start" : "end");
        return (
          <text key={i} className="label" x={x} y={y} textAnchor={anchor} dominantBaseline="middle">
            {a.short || a.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------- Donut (single value 0..1) ---------- */
function Donut({ value, size = 110, thickness = 12, label, sub, color = "url(#donutGrad)" }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, Math.max(0, value)));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="oklch(0.72 0.25 340)"/>
            <stop offset="100%" stopColor="oklch(0.75 0.18 220)"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="color-mix(in oklab, white 8%, transparent)" strokeWidth={thickness} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={thickness} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transform: `rotate(-90deg)`, transformOrigin: 'center', transition: 'stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', lineHeight: 1.05 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: size * .26 }}>{label}</div>
          {sub && <div style={{ color: 'var(--fg-3)', fontSize: 10, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sparkline ---------- */
function Sparkline({ data, color = "var(--magenta)", width = 120, height = 36 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const norm = (v) => height - ((v - min) / Math.max(0.01, max - min)) * (height - 4) - 2;
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    return (i === 0 ? "M" : "L") + x + "," + norm(v).toFixed(1);
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={path + ` L ${width},${height} L 0,${height} Z`} fill="url(#sparkFill)"/>
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ---------- Bar chart (horizontal) ---------- */
function HBar({ value, max = 100, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar"><i style={{ width: pct + '%', background: color || 'var(--grad-hero)' }}/></div>
  );
}

/* ---------- Stat card ---------- */
function Stat({ label, value, suffix = "", trend, accent = "var(--magenta)", sub }) {
  return (
    <div className="stat">
      <div className="accent" style={{ background: accent }}/>
      <div className="label">{label}</div>
      <div className="value">
        <b><AnimNum value={value} decimals={Number.isInteger(value) ? 0 : 1} /></b>
        {suffix && <span>{suffix}</span>}
      </div>
      {sub && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{sub}</div>}
      {trend && (
        <div className={"trend " + (trend.dir === "down" ? "down" : "")}>
          {trend.dir === "down" ? "▼" : "▲"} {trend.value}
        </div>
      )}
    </div>
  );
}

/* ---------- Toast ---------- */
function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);
  const Toast = () => toast ? (
    <div className="toast"><span className="dot"/> {toast}</div>
  ) : null;
  return [Toast, setToast];
}

Object.assign(window, { Icon, Avatar, AnimNum, RadarChart, Donut, Sparkline, HBar, Stat, useToast, totalScore, grade, attendanceRate });
