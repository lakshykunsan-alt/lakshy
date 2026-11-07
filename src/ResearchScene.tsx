import { useId, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useI18n } from './i18n';

// A lightweight illustration, not a model or recording of the research hardware.
const poses = [
  { elbow: [226, 166], wrist: [340, 150], object: 0 },
  { elbow: [245, 182], wrist: [400, 245], object: 0 },
  { elbow: [275, 211], wrist: [400, 288], object: 0 },
  { elbow: [332, 178], wrist: [520, 288], object: 120 },
];

export function ResearchScene({ phase }: { phase: number }) {
  const { t } = useI18n();
  const scene = useRef<SVGSVGElement>(null);
  const id = useId().replace(/:/g, '');
  useLayoutEffect(() => {
    const svg = scene.current;
    if (!svg) return;
    const pose = poses[phase];
    const [ex, ey] = pose.elbow;
    const [wx, wy] = pose.wrist;
    const reduced = document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeline = gsap.timeline({ defaults: { duration: reduced ? 0 : .85, ease: 'power3.inOut' } });
    timeline
      .to(svg.querySelectorAll('.arm-link'), { attr: { d: `M180 320 L${ex} ${ey} L${wx} ${wy}` } }, 0)
      .to(svg.querySelector('.elbow-joint'), { attr: { cx: ex, cy: ey } }, 0)
      .to(svg.querySelector('.wrist-joint'), { attr: { cx: wx, cy: wy } }, 0)
      .to(svg.querySelector('.robot-gripper'), { attr: { transform: `translate(${wx} ${wy})` } }, 0)
      .to(svg.querySelector('.lab-object'), { attr: { transform: `translate(${pose.object} 0)` } }, 0);
    return () => { timeline.kill(); };
  }, [phase]);

  return (
    <div className="research-scene" id="research-scene" role="group" aria-label={t.process.note}>
      <div className="scene-topline"><span className="scene-caption"><span className="live-dot" />{t.process.steps[phase].theme}</span><span className="scene-counter">0{phase + 1} / 04</span></div>
      <svg ref={scene} viewBox="0 0 720 440" fill="none" aria-hidden="true">
        <defs>
          <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" className="lab-grid" /></pattern>
          <linearGradient id={`${id}-metal`} x1="180" y1="160" x2="440" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="var(--text)" stopOpacity=".9" /><stop offset="1" stopColor="var(--muted)" stopOpacity=".45" /></linearGradient>
          <radialGradient id={`${id}-glow`}><stop stopColor="var(--red)" stopOpacity=".15" /><stop offset="1" stopColor="var(--red)" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="720" height="440" fill={`url(#${id}-grid)`} />
        <ellipse cx="360" cy="275" rx="280" ry="200" fill={`url(#${id}-glow)`} />
        <g className="lab-construction"><path d="M80 370H640M80 386H640M105 370v25M615 370v25" /><path d="M180 100v270M400 100v270M520 100v270" strokeDasharray="3 7" /><ellipse cx="180" cy="370" rx="78" ry="15" /><ellipse cx="400" cy="370" rx="35" ry="9" /><ellipse cx="520" cy="370" rx="35" ry="9" /></g>
        <g className={`vision-field${phase === 0 ? ' is-active' : ''}`}><path d="m102 100 298 234-70 37Z" /><path d="m102 100 298 251" strokeDasharray="4 6" /><path d="M90 82h28v20H90zM118 86l12-6v24l-12-6" /></g>
        <path className="lab-trajectory" d="M400 328Q460 226 520 328" pathLength="1" strokeDasharray="4 6" />
        <g className="lab-target"><path d="M500 330v-8h8M532 322h8v8M500 354v8h8M532 362h8v-8" /><path d="M510 342h20M520 332v20" /></g>
        <path d="M145 361v-22q0-11 11-11h48q11 0 11 11v22Z" fill="var(--card)" stroke="var(--line-strong)" strokeWidth="2" />
        <path d="M134 366h92" stroke="var(--muted)" strokeWidth="5" strokeLinecap="round" />
        <path className="arm-link arm-outline" d="M180 320 L226 166 L340 150" stroke="var(--bg)" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        <path className="arm-link" d="M180 320 L226 166 L340 150" stroke={`url(#${id}-metal)`} strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" />
        <path className="arm-link arm-highlight" d="M180 320 L226 166 L340 150" stroke="var(--text)" strokeOpacity=".35" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="180" cy="320" r="19" fill="var(--card)" stroke="var(--muted)" strokeWidth="2" />
        <circle cx="180" cy="320" r="7" fill="var(--red)" />
        <circle className="elbow-joint" cx="226" cy="166" r="16" fill="var(--card)" stroke="var(--accent)" strokeWidth="3" />
        <circle className="wrist-joint" cx="340" cy="150" r="10" fill="var(--card)" stroke="var(--muted)" strokeWidth="2" />
        <g className="robot-gripper" transform="translate(340 150)" stroke="var(--text)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M0 10v11M-13 22h26M-13 22v15l6 7M13 22v15l-6 7" /></g>
        <g className="lab-object" transform="translate(0 0)"><path d="m400 326 19 10v24l-19 10-19-10v-24Z" fill="var(--red-deep)" stroke="var(--accent)" strokeWidth="1.5" /><path d="m381 336 19 10 19-10M400 346v24" stroke="var(--paper)" strokeOpacity=".5" /></g>
        <g className="lab-coordinates"><path d="M604 125h36M604 125v-36M604 125l-20 20" /><circle cx="604" cy="125" r="3" fill="var(--accent)" /></g>
      </svg>
      <div className="scene-bottomline"><span>{t.process.steps[phase].title}</span><span className="scene-signal" aria-hidden="true">{[0, 1, 2, 3].map((step) => <i key={step} className={step <= phase ? 'is-on' : undefined} />)}</span><span>PERCEPTION → ACTION</span></div>
    </div>
  );
}
