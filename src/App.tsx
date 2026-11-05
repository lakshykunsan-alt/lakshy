import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type SyntheticEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories, projects, type Project } from './data';
import { I18nContext, dictionaries, initialLang, languages, loadFonts, rememberLang, useI18n, type Lang } from './i18n';

gsap.registerPlugin(ScrollTrigger);

type Theme = 'dark' | 'light';

const EMAIL = 'lakshy.kunsan@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/lakshy-chaudhary/';
const PHOTO = 'lakshy.jpg';
/* In page order, so the scroll-spy can treat the last section passed as the current one. */
const navItems = [
  ['work', '#projects'],
  ['about', '#about'],
  ['experience', '#experience'],
  ['research', '#research'],
  ['journey', '#journey'],
] as const;

/* A new key: the old one was written on every visit, so it cannot tell a real choice from the old default. */
const THEME_KEY = 'lakshy-scheme';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Cursor-following touches and scroll-linked drift only make sense with a mouse, and only when motion is welcome. */
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion();
const isProjectRoute = (hash: string) => /^#\/projects\//.test(hash);
const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'instant' : 'smooth');

/* The PhD started in September 2025; the year shown is derived from that, never hard-coded. */
function phdYear(now = new Date()) {
  const months = (now.getFullYear() - 2025) * 12 + now.getMonth() - 8;
  return Math.max(1, Math.floor(months / 12) + 1);
}

/* Moves keyboard focus to the main region without letting the browser jump around. */
function focusMain() {
  document.getElementById('main-content')?.focus({ preventScroll: true });
}

/* Projects keep their structure from data.ts; the words come from the active language. */
function useProjects(): Project[] {
  const { t } = useI18n();
  return useMemo(() => projects.map((project) => ({ ...project, ...t.projects[project.slug] })), [t]);
}

/* Wraps each word of a static heading in a mask so it can rise into place. Runs once per element. */
function splitWords(element: HTMLElement) {
  if (!element.dataset.split) {
    const walk = (node: Node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(part)); return; }
            const word = document.createElement('span');
            const inner = document.createElement('span');
            word.className = 'word';
            inner.className = 'word-inner';
            inner.textContent = part;
            word.appendChild(inner);
            fragment.appendChild(word);
          });
          child.replaceWith(fragment);
        } else if (child instanceof HTMLElement) {
          walk(child);
        }
      });
    };
    walk(element);
    element.dataset.split = 'true';
  }
  return element.querySelectorAll<HTMLElement>('.word-inner');
}

/* A photo that quietly turns into a paper placeholder if it fails to load. */
function markMissing(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.closest('figure, a')?.classList.add('img-missing');
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="icon"><path d="M5 15 15 5M6 5h9v9" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="icon"><path d="M3.5 10h12m-5-5 5 5-5 5" /></svg>
  );
}

/* Letters in a mask, so a word can rise into place one character at a time. */
function Letters({ text }: { text: string }) {
  return <span className="mask">{Array.from(text).map((char, index) => <span className="char" key={index}>{char}</span>)}</span>;
}

function Logo() {
  const { t } = useI18n();
  return <a className="brand" href="#top" aria-label={t.nav.home}><span className="brand-mark" aria-hidden="true">LC</span><span className="brand-name">Lakshy Chaudhary</span></a>;
}

function PhotoCredit({ project }: { project: Project }) {
  const { t } = useI18n();
  return <a className="photo-credit" href={project.imageCreditUrl} target="_blank" rel="noreferrer" aria-label={`${t.work.credit}: ${project.title}`}>{t.work.credit}</a>;
}

function GunsanTime() {
  const { t, lang } = useI18n();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  // Hindi reads more naturally as a 24-hour time than with Latin am/pm.
  const time = new Intl.DateTimeFormat(t.locale, { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul', ...(lang === 'hi' ? { hourCycle: 'h23' as const } : {}) }).format(now);
  return <p className="local-time"><span className="live-dot" aria-hidden="true" />{t.time.label} · <time>{time}</time> <span className="time-zone">{t.time.zone}</span></p>;
}

/* A slow ribbon of research areas; decorative, since the same list appears in the research section. */
function AreasMarquee() {
  const { t } = useI18n();
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const items = [...t.researchAreas, ...t.researchAreas, ...t.researchAreas, ...t.researchAreas];

  // With a mouse, a quick scroll pushes the strip faster for a moment before it eases back to its slow pace.
  useEffect(() => {
    const element = track.current;
    const animation = element?.getAnimations()[0];
    if (!element || !animation || !canHover()) return;
    const speed = { rate: 1 };
    const apply = () => { animation.playbackRate = speed.rate; };
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = Math.min(Math.abs(self.getVelocity()) / 300, 5);
        gsap.to(speed, { rate: 1 + boost, duration: .25, overwrite: true, onUpdate: apply, onComplete: () => { gsap.to(speed, { rate: 1, duration: 1.4, ease: 'power2.out', onUpdate: apply }); } });
      },
    });
    return () => { trigger.kill(); gsap.killTweensOf(speed); animation.playbackRate = 1; };
  }, []);

  return (
    <div className={`marquee-wrap${paused ? ' is-paused' : ''}`}>
      <div className="marquee" aria-hidden="true"><div className="marquee-track" ref={track}>{items.map((area, index) => <span key={index} className={index >= t.researchAreas.length ? 'is-copy' : undefined}>{area}<i>✳</i></span>)}</div></div>
      <button type="button" className="marquee-toggle" aria-pressed={paused} aria-label={paused ? t.marquee.play : t.marquee.pause} title={paused ? t.marquee.play : t.marquee.pause} onClick={() => setPaused((value) => !value)}>
        <svg aria-hidden="true" viewBox="0 0 20 20">{paused ? <path d="M7 5v10l8-5z" /> : <path d="M7 5v10M13 5v10" />}</svg>
      </button>
    </div>
  );
}

function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t.nav.language}>
      {languages.map((language) => <button type="button" key={language.code} lang={language.code} className={lang === language.code ? 'active' : undefined} aria-pressed={lang === language.code} aria-label={language.label} title={language.label} onClick={() => setLang(language.code)}>{language.short}</button>)}
    </div>
  );
}

function SiteHeader({ theme, onThemeToggle, activeSection, scrolled, route }: { theme: Theme; onThemeToggle: () => void; activeSection: string; scrolled: boolean; route: string }) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Any navigation closes the menu.
  useEffect(() => { setMenuOpen(false); }, [route]);

  useEffect(() => {
    if (!menuOpen) return;
    header.current?.querySelector<HTMLElement>('.primary-nav a')?.focus();
    const close = (returnFocus: boolean) => {
      setMenuOpen(false);
      if (returnFocus) menuButton.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(true); };
    const onPointer = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) close(false); };
    const onFocus = (event: FocusEvent) => { if (!header.current?.contains(event.target as Node)) close(false); };
    const desktop = window.matchMedia('(min-width: 1081px)');
    const onBreakpoint = () => { if (desktop.matches) close(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocus);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocus);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [menuOpen]);

  const themeLabel = theme === 'dark' ? t.nav.toLight : t.nav.toDark;
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`} ref={header}>
      <div className="header-inner">
        <Logo />
        <nav id="primary-navigation" className={menuOpen ? 'primary-nav open' : 'primary-nav'} aria-label={t.nav.label}>
          {navItems.map(([key, href]) => <a key={href} href={href} aria-current={activeSection === href.slice(1) ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{t.nav[key]}</a>)}
          <a href="#contact" onClick={() => setMenuOpen(false)} className="nav-contact">{t.nav.sayHello} <Arrow diagonal /></a>
        </nav>
        <div className="header-actions">
          <LanguageSwitch />
          <button type="button" className="theme-toggle" onClick={onThemeToggle} aria-label={themeLabel} title={themeLabel}><svg className="theme-icon-svg" viewBox="0 0 24 24" aria-hidden="true">{theme === 'dark' ? <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></> : <path d="M20.4 15.2A8.7 8.7 0 0 1 8.8 3.6 8.8 8.8 0 1 0 20.4 15.2Z" />}</svg></button>
          <button className="menu-toggle" ref={menuButton} type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? t.nav.close : t.nav.menu}</button>
        </div>
      </div>
    </header>
  );
}

/* The intro plays once per visit; switching language should not replay it. */
let introPlayed = false;

function Hero() {
  const { t } = useI18n();
  const hero = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = hero.current;
    if (!element || prefersReducedMotion()) return;
    const context = gsap.context(() => {
      if (!introPlayed) {
        // The rules draw across first, the red name rises, a crimson panel opens over the portrait and pulls away, then the surname and the details follow.
        const header = document.querySelector('.site-header');
        gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { introPlayed = true; } })
          .fromTo('.hero-top', { '--rule': 0 }, { '--rule': 1, duration: 1.2, ease: 'power3.inOut' })
          .from(header, { yPercent: -100, duration: .9 }, '<.1')
          .from('.hero-back .char', { yPercent: 115, rotate: 6, transformOrigin: '0% 100%', duration: 1.15, stagger: .06, ease: 'power4.out' }, '<.15')
          .fromTo('.hero-portrait .photo-frame', { clipPath: 'inset(100% 0% 0% 0%)', '--wipe': 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power4.inOut' }, '-=.9')
          .to('.hero-portrait .photo-frame', { '--wipe': 0, duration: .9, ease: 'power4.inOut' }, '-=.15')
          .from('.hero-portrait img', { scale: 1.35, duration: 1.6, ease: 'power3.out' }, '<')
          .from('.hero-front .char', { yPercent: 115, rotate: 6, transformOrigin: '0% 100%', duration: .9, stagger: .035, ease: 'power4.out' }, '-=1.5')
          .fromTo('.hero-bottom, .hero-facts', { '--rule': 0 }, { '--rule': 1, duration: 1.1, stagger: .12, ease: 'power3.inOut' }, '-=1')
          .from('.hero-stagger', { y: 20, opacity: 0, duration: .75, stagger: .1 }, '-=.9')
          .from('.hero-facts > div', { y: 14, opacity: 0, duration: .6, stagger: .07 }, '-=.5');
      }
      // As the page scrolls, the two name lines slide apart a little and the portrait rises ahead of them.
      if (canHover()) {
        const scrub = () => ({ trigger: element, start: 'top top', end: 'bottom top', scrub: true });
        gsap.to('.hero-back', { xPercent: -5, ease: 'none', scrollTrigger: scrub() });
        gsap.to('.hero-front', { xPercent: 3, ease: 'none', scrollTrigger: scrub() });
        gsap.to('.hero-portrait', { yPercent: -12, ease: 'none', scrollTrigger: scrub() });
        gsap.to('.hero-portrait img', { yPercent: 6, ease: 'none', scrollTrigger: scrub() });
      }
    }, element);
    return () => context.revert();
  }, []);

  const [before, emphasis, after] = t.hero.title;
  const current = t.experience[0];
  return (
    <section className="hero" id="top" aria-labelledby="hero-title" ref={hero}>
      <div className="hero-top">
        <p className="tech-label hero-stagger">{current.role} — {current.organization}</p>
        <div className="hero-stagger"><GunsanTime /></div>
      </div>
      <div className="hero-stage">
        <h1 id="hero-title" className="hero-name">
          <span className="sr-only">Lakshy Chaudhary</span>
          <span className="hero-back" aria-hidden="true"><Letters text="Lakshy" /></span>
          <span className="hero-front" aria-hidden="true"><Letters text="Chaudhary" /></span>
        </h1>
        <figure className="hero-portrait">
          <div className="photo-frame"><img src={PHOTO} alt={t.hero.photoAlt} width={400} height={400} fetchPriority="high" onError={markMissing} /></div>
          <figcaption className="tech-label hero-stagger">{t.hero.caption}</figcaption>
        </figure>
      </div>
      <div className="hero-bottom">
        <p className="hero-statement hero-stagger"><span className="hero-hello">{t.hero.hello}</span> {before}<em>{emphasis}</em>{after}</p>
        <div className="hero-side hero-stagger">
          <p className="hero-intro">{t.hero.intro}</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">{t.hero.cta} <Arrow /></a><a className="text-link" href="#contact">{t.hero.sayHello} <Arrow diagonal /></a></div>
        </div>
      </div>
      <dl className="hero-facts">
        {t.hero.facts.map(([term, value], index) => <div key={term}><dt>{term}</dt><dd>{value}{index === 0 && <small>{t.hero.year(phdYear())}</small>}</dd></div>)}
      </dl>
    </section>
  );
}

function ProcessSection() {
  const { t } = useI18n();
  return (
    <section className="process-section section-pad" id="approach">
      <div className="section-heading split-heading"><div><p className="eyebrow">{t.process.eyebrow}</p><h2>{t.process.title[0]}<em>{t.process.title[1]}</em></h2></div><p className="section-lede">{t.process.lede}</p></div>
      <ol className="process-steps">
        {t.process.steps.map((step, index) => <li className="process-step reveal" key={step.title}>
          <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
          <p className="step-theme">{step.theme}</p>
          <h3>{step.title}</h3>
          <p>{step.detail}</p>
        </li>)}
      </ol>
      <p className="illustration-note">{t.process.note}</p>
    </section>
  );
}

function FeaturedWork() {
  const { t } = useI18n();
  const items = useProjects();
  const section = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  // A round "View" label trails the mouse over project photos.
  useEffect(() => {
    const badge = cursor.current;
    if (!badge || !section.current || !canHover()) return;
    const x = gsap.quickTo(badge, 'x', { duration: .45, ease: 'power3' });
    const y = gsap.quickTo(badge, 'y', { duration: .45, ease: 'power3' });
    const move = (event: PointerEvent) => { x(event.clientX); y(event.clientY); };
    const enter = (event: PointerEvent) => { gsap.set(badge, { x: event.clientX, y: event.clientY }); gsap.to(badge, { scale: 1, autoAlpha: 1, duration: .35, ease: 'back.out(1.7)' }); };
    const leave = () => { gsap.to(badge, { scale: .3, autoAlpha: 0, duration: .25, ease: 'power2.in' }); };
    const frames = Array.from(section.current.querySelectorAll<HTMLElement>('.feature-media > a'));
    frames.forEach((frame) => {
      frame.addEventListener('pointerenter', enter);
      frame.addEventListener('pointermove', move);
      frame.addEventListener('pointerleave', leave);
    });
    return () => frames.forEach((frame) => {
      frame.removeEventListener('pointerenter', enter);
      frame.removeEventListener('pointermove', move);
      frame.removeEventListener('pointerleave', leave);
    });
  }, []);

  return (
    <section className="work-section section-pad" id="projects" ref={section}>
      <div className="view-cursor" ref={cursor} aria-hidden="true"><span>{t.work.view}</span><Arrow diagonal /></div>
      <div className="section-heading split-heading"><div><p className="eyebrow">{t.work.eyebrow}</p><h2>{t.work.title[0]}<em>{t.work.title[1]}</em></h2></div><p className="section-lede">{t.work.lede}</p></div>
      <div className="feature-list">
        {/* Three compositions take turns, so the list reads as a sequence rather than a stack of cards. */}
        {items.map((project, index) => <article className={`feature is-layout-${index % 3}`} key={project.slug}>
          <figure className="feature-media">
            <a href={`#/projects/${project.slug}`} tabIndex={-1} aria-hidden="true"><img src={project.image} alt="" loading="lazy" onError={markMissing} /></a>
            <figcaption><PhotoCredit project={project} /></figcaption>
          </figure>
          <div className="feature-copy reveal">
            <div className="feature-head">
              <span className="feature-number" aria-hidden="true">{project.number}</span>
              <p className="feature-meta"><span className="sr-only">{t.work.number} {project.number}</span><span>{project.category}</span><span className="status-badge">{t.work.ongoing}</span></p>
              <h3><a href={`#/projects/${project.slug}`}>{project.title}</a></h3>
            </div>
            <div className="feature-body">
              <p className="feature-summary">{project.summary}</p>
              <p className="feature-question">“{project.problem}”</p>
              <ul className="method-list" aria-label={t.work.methods}>{project.methods.map((method) => <li key={method}>{method}</li>)}</ul>
              <a className="text-link" href={`#/projects/${project.slug}`}>{t.work.read} <Arrow /></a>
            </div>
          </div>
        </article>)}
      </div>
    </section>
  );
}

type ExplorerState = { query: string; setQuery: (value: string) => void; category: string; setCategory: (value: string) => void };

function ProjectExplorer({ query, setQuery, category, setCategory }: ExplorerState) {
  const { t } = useI18n();
  const items = useProjects();
  const [hovered, setHovered] = useState<Project | null>(null);
  const [showPreview] = useState(canHover);
  const preview = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  useEffect(() => {
    if (!preview.current) return;
    follow.current = { x: gsap.quickTo(preview.current, 'x', { duration: .6, ease: 'power3' }), y: gsap.quickTo(preview.current, 'y', { duration: .6, ease: 'power3' }) };
  }, [showPreview]);
  const trackPointer = (event: ReactPointerEvent) => { follow.current?.x(event.clientX); follow.current?.y(event.clientY); };
  const filtered = useMemo(() => items.filter((project, index) => {
    // Search the English wording too, so technical terms work in any language.
    const original = projects[index];
    const searchText = `${project.title} ${project.category} ${project.summary} ${project.methods.join(' ')} ${original.title} ${original.category} ${original.summary} ${original.methods.join(' ')}`.toLowerCase();
    return (category === 'All' || category === original.category) && searchText.includes(query.trim().toLowerCase());
  }), [items, query, category]);
  return (
    <section className="explorer-section section-pad" aria-labelledby="explorer-title">
      <div className="explorer-top"><div><p className="eyebrow">{t.explorer.eyebrow}</p><h2 id="explorer-title">{t.explorer.title}<span className="period">{t.explorer.period}</span></h2></div><p className="section-lede">{t.explorer.lede}</p></div>
      <div className="project-controls"><label className="search-box"><svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg><span className="sr-only">{t.explorer.search}</span><input type="search" placeholder={t.explorer.placeholder} value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-list" role="group" aria-label={t.explorer.filter}>{categories.map((item) => <button type="button" key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'All' ? t.explorer.all : t.categories[item] ?? item}</button>)}</div></div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{t.explorer.found(filtered.length)}</p>
      {showPreview && <div className={`index-preview${hovered ? ' is-visible' : ''}`} ref={preview} aria-hidden="true">{items.map((project) => <img key={project.slug} src={project.image} alt="" loading="lazy" className={hovered?.slug === project.slug ? 'is-current' : undefined} />)}</div>}
      {filtered.length ? <ul className="index-list" onPointerMove={showPreview ? trackPointer : undefined} onPointerLeave={() => setHovered(null)}>{filtered.map((project) => <li key={project.slug}><a href={`#/projects/${project.slug}`} onPointerEnter={showPreview ? (event) => { if (!hovered) { follow.current?.x(event.clientX, event.clientX); follow.current?.y(event.clientY, event.clientY); } setHovered(project); } : undefined}><span className="index-number">{project.number}</span><span className="index-title">{project.title}</span><span className="index-category">{project.category}</span><span className="index-summary">{project.summary}</span><Arrow diagonal /></a></li>)}</ul> : <div className="empty-state"><p>{t.explorer.empty}</p><button type="button" className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>{t.explorer.clear} <Arrow /></button></div>}
      <p className="ongoing-note">{t.explorer.ongoing}</p>
    </section>
  );
}

function AboutSection() {
  const { t } = useI18n();
  return (
    <section className="about-section section-pad" id="about">
      <div className="about-inner">
        <figure className="about-photo">
          <div className="photo-frame"><img src={PHOTO} alt={t.about.photoAlt} width={400} height={400} loading="lazy" onError={markMissing} /></div>
          <figcaption className="tech-label">{t.about.caption}</figcaption>
        </figure>
        <div className="about-content">
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h2>{t.about.title[0]}<em>{t.about.title[1]}</em></h2>
          <div className="about-text reveal">
            <p className="about-lead">{t.about.lead}</p>
            {t.about.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="about-links"><a className="text-link" href="#experience">{t.about.experienceLink} <Arrow /></a><a className="text-link" href="#contact">{t.about.contactLink} <Arrow /></a></div>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  const { t } = useI18n();
  return (
    <section className="career-section section-pad" id="experience">
      <div className="section-heading"><p className="eyebrow">{t.career.eyebrow}</p><h2>{t.career.title[0]}<em>{t.career.title[1]}</em></h2></div>
      <div className="career-columns">
        <div className="career-list">
          <h3 className="career-label">{t.career.experience}</h3>
          {t.experience.map((item, index) => <article className="career-entry reveal" key={`${item.organization}-${item.role}`}>
            <div className="career-entry-date">{item.date}</div>
            <div className="career-entry-copy"><h4>{item.role}{index === 0 && <span className="now-note">{t.career.now}</span>}</h4><p className="career-organization">{item.organization}{item.location ? `, ${item.location}` : ''}</p>{item.detail && <p className="career-detail">{item.detail}</p>}</div>
          </article>)}
          {/* Entries without dates or details stay compact rather than leaving a broken-looking row. */}
          {t.additionalExperience.map((item) => <p className="career-also" key={`${item.organization}-${item.role}`}><span>{t.career.also}</span>{item.role}, {item.organization}</p>)}
        </div>
        <aside className="career-side">
          <h3 className="career-label">{t.career.education}</h3>
          {t.education.map((item) => <article className="education-entry reveal" key={item.institution}>
            <span>{item.date}</span><h4>{item.qualification}</h4><p>{item.institution}, {item.location}</p>
          </article>)}
          <h3 className="career-label">{t.career.certificates}</h3>
          {t.certifications.map((item) => <p className="certification-entry" key={item} lang="en">{item}</p>)}
        </aside>
      </div>
    </section>
  );
}

function ResearchSection() {
  const { t } = useI18n();
  const focus = t.researchAreas.slice(0, 2);
  const interests = t.researchAreas.slice(2);
  return (
    <section className="research-section section-pad" id="research">
      <div className="section-heading split-heading"><div><p className="eyebrow">{t.research.eyebrow}</p><h2>{t.research.title[0]}<em>{t.research.title[1]}</em></h2></div><p className="section-lede">{t.research.lede}</p></div>
      <div className="research-content">
        <div>
          <h3 className="career-label">{t.research.focus}</h3>
          <ul className="areas-list is-focus">{focus.map((area) => <li key={area}>{area}</li>)}</ul>
          <h3 className="career-label areas-label-gap">{t.research.interests}</h3>
          <ul className="areas-list">{interests.map((area) => <li key={area}>{area}</li>)}</ul>
        </div>
        <div className="toolkit">
          {t.skillGroups.map((group) => <div className="toolkit-group reveal" key={group.title}><h3 className="career-label">{group.title}</h3><p>{group.items.join(', ')}</p></div>)}
          <div className="publication-note reveal"><h3 className="career-label">{t.research.publications}</h3><p>{t.research.publicationNote}</p></div>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const { t } = useI18n();
  return (
    <section className="journey-section section-pad" id="journey">
      <div className="journey-inner">
        <div className="journey-intro"><p className="eyebrow">{t.journeySection.eyebrow}</p><h2>{t.journeySection.title[0]}<em>{t.journeySection.title[1]}</em></h2><p className="section-lede">{t.journeySection.lede}</p></div>
        <ol className="timeline"><span className="timeline-fill" aria-hidden="true" />{t.journey.map((entry, index) => <li className={`timeline-entry${index === t.journey.length - 1 ? ' is-current' : ''}`} key={index}><span className="timeline-dot" aria-hidden="true" />{entry.date && <div className="timeline-date">{entry.date}</div>}<h3>{entry.title}</h3><p>{entry.detail}</p></li>)}</ol>
      </div>
    </section>
  );
}

function ContactSection() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };
  return (
    <section className="contact-section section-pad" id="contact">
      <div className="contact-card">
        <p className="eyebrow">{t.contact.eyebrow}</p>
        <h2>{t.contact.title[0]}<em>{t.contact.title[1]}</em></h2>
        <a className="contact-email" href={`mailto:${EMAIL}`}><span className="tech-label">{t.contact.write}</span><span className="contact-address">{EMAIL}<Arrow diagonal /></span></a>
        <div className="contact-body">
          <div>
            <p className="contact-intro">{t.contact.intro}</p>
            <div className="contact-actions">
              <button type="button" className="copy-email" onClick={copyEmail} aria-label={`${t.contact.copyLabel}: ${EMAIL}`}>
                <span className="copy-address">{copied ? t.contact.copied : t.contact.copyLabel}</span>
                <span className="copy-hint" aria-hidden="true">{copied ? '✓' : <><span className="hint-click">{t.contact.copyHint}</span><span className="hint-tap">{t.contact.tapHint}</span></>}</span>
              </button>
              <span className="sr-only" role="status">{copied ? t.contact.copied : ''}</span>
              <a className="text-link" href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn <Arrow diagonal /></a>
            </div>
          </div>
          <div className="contact-topics">
            <h3 className="career-label">{t.contact.topicsLabel}</h3>
            <ul>{t.contact.topics.map((topic) => <li key={topic.text}><a href={topic.project ? `#/projects/${topic.project}` : `mailto:${EMAIL}?subject=${encodeURIComponent(topic.text)}`}>{topic.text}<Arrow diagonal /></a></li>)}</ul>
          </div>
        </div>
        <div className="contact-foot"><GunsanTime /><p className="contact-signoff">{t.contact.signoff}</p></div>
      </div>
    </section>
  );
}

function Footer({ project }: { project?: Project }) {
  const { t } = useI18n();
  const toTop = (event: ReactMouseEvent) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    focusMain();
  };
  return (
    <footer className="site-footer">
      {project && <a className="footer-cta" href={`mailto:${EMAIL}?subject=${encodeURIComponent(t.detail.mailSubject(project.title))}`}><span>{t.time.cta}{' '}<em>{t.time.ctaEm}</em></span><Arrow diagonal /></a>}
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} Lakshy Chaudhary · {t.footer.place}</p>
        {project && <GunsanTime />}
        <nav className="footer-links" aria-label={t.footer.label}><a href={`mailto:${EMAIL}`}>{t.footer.email}</a><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a><a href="#top" onClick={toTop}>{t.footer.top}<span aria-hidden="true"> ↑</span></a></nav>
      </div>
    </footer>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: (event: ReactMouseEvent) => void }) {
  const { t } = useI18n();
  const items = useProjects();
  const page = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const index = items.findIndex((item) => item.slug === project.slug);
  const neighbours = [
    { label: t.detail.previous, item: items[(index - 1 + items.length) % items.length] },
    { label: t.detail.next, item: items[(index + 1) % items.length] },
  ];

  useEffect(() => {
    const description = document.querySelector('meta[name="description"]');
    document.title = `${project.title} — Lakshy Chaudhary`;
    description?.setAttribute('content', project.summary);
    return () => { document.title = t.meta.title; description?.setAttribute('content', t.meta.description); };
  }, [project.title, project.summary, t]);
  // Start each project at the top and tell assistive tech where we are.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    heading.current?.focus({ preventScroll: true });
  }, [project.slug]);
  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.back-link, .detail-hero .eyebrow', { x: -16, opacity: 0, duration: .5, stagger: .08 })
        .from('.detail-hero h1, .detail-deck', { y: 30, opacity: 0, duration: .8, stagger: .1 }, '-=.3')
        .fromTo('.detail-media img', { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'power4.inOut' }, '-=.5');
      gsap.utils.toArray<HTMLElement>('.detail-body section, .detail-next a').forEach((element) => {
        gsap.from(element, { y: 22, opacity: 0, duration: .7, scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
    }, page.current);
    return () => context.revert();
  }, [project.slug]);

  return (
    <main className="detail-page" id="main-content" ref={page} tabIndex={-1}>
      <a className="back-link" href="#projects" onClick={onBack}><span aria-hidden="true">←</span> {t.detail.all}</a>
      <header className="detail-hero">
        <p className="eyebrow">{t.work.number} {project.number} · {project.category} <span className="status-badge">{t.detail.ongoing}</span></p>
        <h1 ref={heading} tabIndex={-1}>{project.title}</h1>
        <p className="detail-deck">{project.summary}</p>
      </header>
      <figure className="detail-media"><img src={project.image} alt={project.imageAlt} onError={markMissing} /><figcaption>{t.detail.photoNote} <PhotoCredit project={project} /></figcaption></figure>
      <div className="detail-body">
        <section><h2 className="career-label">{t.detail.question}</h2><p className="detail-lead">{project.problem}</p></section>
        <section><h2 className="career-label">{t.detail.approach}</h2><p>{project.approach}</p></section>
        <section><h2 className="career-label">{t.detail.methods}</h2><ul className="method-list">{project.methods.map((method) => <li key={method}>{method}</li>)}</ul></section>
        <section><h2 className="career-label">{t.detail.related}</h2><ul className="method-list is-areas">{project.areas.map((area) => <li key={area}><a href="#research">{t.researchAreas[area]}</a></li>)}</ul></section>
        <section><h2 className="career-label">{t.detail.status}</h2><p><span className="status-badge">{t.detail.ongoing}</span> {t.detail.ongoingText}</p></section>
        {project.limitations && <section><h2 className="career-label">{t.detail.limitations}</h2><p>{project.limitations}</p></section>}
      </div>
      {(project.codeUrl || project.paperUrl) && <div className="detail-links">{project.codeUrl && <a className="text-link" href={project.codeUrl} target="_blank" rel="noreferrer">{t.detail.code} <Arrow diagonal /></a>}{project.paperUrl && <a className="text-link" href={project.paperUrl} target="_blank" rel="noreferrer">{t.detail.paper} <Arrow diagonal /></a>}</div>}
      <nav className="detail-next" aria-label={t.detail.others}>{neighbours.map(({ label, item }) => <a key={label} href={`#/projects/${item.slug}`}><img src={item.image} alt="" loading="lazy" onError={markMissing} /><span><small>{label} · {item.category}</small>{item.title}</span></a>)}</nav>
    </main>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = dictionaries[lang];
  const i18n = useMemo(() => ({ lang, t, setLang }), [lang, t]);
  const [route, setRoute] = useState(window.location.hash);
  const [showTop, setShowTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  // Search state lives here so it survives the remount that a language change causes.
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const progress = useRef<HTMLSpanElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const homeScroll = useRef<{ hash: string; y: number } | null>(null);
  const returning = useRef(false);
  const previousRoute = useRef(route);
  const projectSlug = route.match(/^#\/projects\/([^/?#]+)/)?.[1];
  const baseProject = projectSlug ? projects.find((item) => item.slug === projectSlug) : undefined;
  const project = useMemo(() => (baseProject ? { ...baseProject, ...t.projects[baseProject.slug] } : undefined), [baseProject, t]);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    // Every history entry gets an index, so back/forward (an entry that already has one) can be told apart from new navigation.
    let lastIndex = 0;
    window.history.replaceState({ ...window.history.state, entry: lastIndex }, '');
    const onHashChange = () => {
      const next = window.location.hash;
      const state = window.history.state as { entry?: number } | null;
      if (typeof state?.entry === 'number') returning.current = true;
      else window.history.replaceState({ ...state, entry: ++lastIndex }, '');
      // Remember where the visitor was on the home page before opening a project.
      if (!isProjectRoute(previousRoute.current) && isProjectRoute(next)) homeScroll.current = { hash: previousRoute.current, y: window.scrollY };
      setRoute(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // The page is rendered by script, so the browser cannot jump to #section on its own when the home view appears.
  useLayoutEffect(() => {
    const previous = previousRoute.current;
    const firstRender = previous === route;
    previousRoute.current = route;
    const isReturn = returning.current;
    returning.current = false;
    if (projectSlug) return;
    if (!firstRender && !isProjectRoute(previous)) return; // Ordinary in-page anchors scroll natively.
    const saved = isReturn ? homeScroll.current : null;
    const id = route.slice(1);
    const settle = () => {
      if (saved) {
        window.scrollTo({ top: saved.y, behavior: 'instant' });
      } else if (/^[a-z][a-z-]*$/.test(id) && id !== 'top') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else if (!firstRender) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      ScrollTrigger.refresh();
    };
    const frame = requestAnimationFrame(settle);
    // Fonts can shift the layout of a deep link; settle again once they are ready.
    if (firstRender && id) document.fonts?.ready.then(() => requestAnimationFrame(settle));
    return () => cancelAnimationFrame(frame);
  }, [route, projectSlug]);

  // Moving between the home page and a project, a crimson curtain covers the swap and lifts away.
  // It starts covering before the first paint of the new view, so navigation itself is never delayed.
  const shownView = useRef(projectSlug ?? '');
  useLayoutEffect(() => {
    const view = projectSlug ?? '';
    if (view === shownView.current) return;
    shownView.current = view;
    if (!curtain.current || prefersReducedMotion()) return;
    const tween = gsap.fromTo(curtain.current, { yPercent: 0, visibility: 'visible' }, { yPercent: -100, duration: .9, ease: 'power4.inOut', onComplete: () => { gsap.set(curtain.current, { visibility: 'hidden' }); } });
    return () => { tween.kill(); gsap.set(curtain.current, { visibility: 'hidden' }); };
  }, [projectSlug]);

  // With a mouse, primary buttons lean a little toward the pointer and spring back when it leaves.
  useEffect(() => {
    if (!canHover()) return;
    let active: HTMLElement | null = null;
    const release = () => {
      if (active) gsap.to(active, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .45)' });
      active = null;
    };
    const move = (event: PointerEvent) => {
      const button = event.target instanceof Element ? event.target.closest<HTMLElement>('.button-primary') : null;
      if (button !== active) release();
      if (!button) return;
      active = button;
      const box = button.getBoundingClientRect();
      const x = event.clientX - (box.left - Number(gsap.getProperty(button, 'x')) + box.width / 2);
      const y = event.clientY - (box.top - Number(gsap.getProperty(button, 'y')) + box.height / 2);
      gsap.to(button, { x: x * .25, y: y * .35, duration: .4, ease: 'power3.out', overwrite: 'auto' });
    };
    document.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', release);
    return () => { document.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', release); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0a0a' : '#efebe4');
  }, [theme]);
  // Only a real choice is remembered, so the dark default can still reach everyone else.
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Theme still works for this session. */ }
    setTheme(next);
  };

  useEffect(() => {
    rememberLang(lang);
    loadFonts(lang);
    document.documentElement.lang = lang;
    const set = (selector: string, value: string) => document.querySelector(selector)?.setAttribute('content', value);
    set('meta[property="og:title"]', t.meta.title);
    set('meta[name="twitter:title"]', t.meta.title);
    set('meta[property="og:description"]', t.meta.description);
    set('meta[name="twitter:description"]', t.meta.description);
    set('meta[property="og:locale"]', t.meta.ogLocale);
    if (!projectSlug) {
      set('meta[name="description"]', t.meta.description);
      document.title = t.meta.title;
    } else if (!baseProject) {
      document.title = `${t.notFound.eyebrow} — Lakshy Chaudhary`;
    }
  }, [lang, t, projectSlug, baseProject]);

  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('.site-footer');
      // The footer has its own "Back to top" link, so the floating button steps aside there.
      setShowTop(window.scrollY > 900 && (!footer || footer.getBoundingClientRect().top > window.innerHeight));
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
      setScrolled(window.scrollY > 16);
      // The last nav section whose top has passed 40% of the viewport is current; the contact area belongs to none.
      const line = window.innerHeight * .4;
      const passed = [...navItems.map(([, href]) => href.slice(1)), 'contact'].filter((id) => {
        const section = document.getElementById(id);
        return section !== null && section.getBoundingClientRect().top <= line;
      });
      const current = passed[passed.length - 1] ?? 'top';
      setActiveSection(current === 'contact' ? '' : current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [projectSlug, lang]);

  // Animations split headings into words, so the page is remounted (keyed by language) whenever the language changes.
  useLayoutEffect(() => {
    if (projectSlug) return;
    const context = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const once = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true });
      // Reveals animate opacity rather than visibility, so content stays focusable and readable by screen readers.
      gsap.utils.toArray<HTMLElement>('main h2').forEach((heading) => {
        gsap.from(splitWords(heading), { yPercent: 115, rotate: 3, duration: .95, stagger: .045, ease: 'power4.out', scrollTrigger: once(heading, 'top 88%') });
      });
      gsap.utils.toArray<HTMLElement>('main .eyebrow, main .section-lede').forEach((element) => {
        gsap.from(element, { y: 16, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: once(element, 'top 90%') });
      });
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element, index) => {
        gsap.from(element, { y: 26, opacity: 0, duration: .8, delay: (index % 3) * .07, ease: 'power3.out', scrollTrigger: once(element, 'top 92%') });
      });
      // Section dividers draw across from the left as they come into view.
      gsap.utils.toArray<HTMLElement>('.work-section, .about-section, .career-section, .research-section, .journey-section, .contact-section, .contact-body, .career-entry').forEach((element) => {
        gsap.fromTo(element, { '--rule': 0 }, { '--rule': 1, duration: 1.4, ease: 'power3.inOut', scrollTrigger: once(element, 'top 94%') });
      });
      // Photos open like a curtain, a crimson panel pulls away from them, and with a mouse they drift gently inside their frames as the page scrolls.
      const drift = canHover();
      gsap.utils.toArray<HTMLElement>('.feature-media > a, .about-photo .photo-frame').forEach((frame) => {
        const image = frame.querySelector('img');
        gsap.timeline({ scrollTrigger: once(frame, 'top 82%') })
          .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)', '--wipe': 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.inOut' })
          .to(frame, { '--wipe': 0, duration: 1, ease: 'power4.inOut' }, '-=.2');
        if (!image) return;
        gsap.fromTo(image, { scale: 1.3 }, { scale: 1, duration: 1.9, ease: 'power3.out', scrollTrigger: once(frame, 'top 82%') });
        if (drift) gsap.fromTo(image, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // The big project numbers slide a touch against the scroll.
      if (drift) gsap.utils.toArray<HTMLElement>('.feature-number').forEach((number) => {
        gsap.fromTo(number, { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: number, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>('.areas-list').forEach((list) => {
        gsap.from(list.children, { x: -30, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: once(list) });
      });
      // The timeline draws downward and each stop lights up as it is reached.
      const timeline = document.querySelector<HTMLElement>('.timeline');
      if (timeline) gsap.fromTo('.timeline-fill', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.timeline-entry').forEach((entry) => {
        ScrollTrigger.create({ trigger: entry, start: 'top 70%', onEnter: () => entry.classList.add('is-reached'), onLeaveBack: () => entry.classList.remove('is-reached') });
        gsap.from(entry, { x: 24, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: once(entry, 'top 88%') });
      });
      // The big address rises out of its own baseline.
      const email = document.querySelector('.contact-email');
      if (email) gsap.timeline({ scrollTrigger: once(email, 'top 92%') })
        .from('.contact-email .tech-label', { y: 16, opacity: 0, duration: .7, ease: 'power3.out' })
        .fromTo('.contact-address', { yPercent: 60, clipPath: 'inset(0% 0% 100% 0%)' }, { yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out', clearProps: 'clipPath' }, '-=.45');
    });
    // A keyboard user tabbing ahead of the scroll should never land on something still faded out.
    const reveal = (event: FocusEvent) => {
      for (let node = event.target as HTMLElement | null; node && node !== document.body; node = node.parentElement) {
        if (node.style.opacity && Number(node.style.opacity) < 1) gsap.set(node, { opacity: 1, x: 0, y: 0, scale: 1 });
      }
    };
    document.addEventListener('focusin', reveal);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { document.removeEventListener('focusin', reveal); window.removeEventListener('load', refresh); context.revert(); };
  }, [projectSlug, lang]);

  const skipToContent = (event: ReactMouseEvent) => {
    event.preventDefault();
    focusMain();
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'instant' });
  };
  // Back to the projects: return to the exact spot on the home page when we came from there.
  const backToProjects = (event: ReactMouseEvent) => {
    if (homeScroll.current) {
      event.preventDefault();
      returning.current = true;
      window.location.hash = homeScroll.current.hash || '#';
    }
  };
  const unknownRoute = projectSlug && !project;
  return (
    <I18nContext.Provider value={i18n}>
      <div className="app-shell">
        <div className="reading-progress" aria-hidden="true"><span ref={progress} /></div>
        <a className="skip-link" href="#main-content" onClick={skipToContent}>{t.nav.skip}</a>
        <SiteHeader theme={theme} scrolled={scrolled} activeSection={activeSection} route={route} onThemeToggle={toggleTheme} />
        {project ? <ProjectDetail key={project.slug} project={project} onBack={backToProjects} />
          : unknownRoute ? <main className="not-found" id="main-content" tabIndex={-1} key={lang}><p className="eyebrow">{t.notFound.eyebrow}</p><h1>{t.notFound.title[0]}<em>{t.notFound.title[1]}</em></h1><a className="button button-primary" href="#projects">{t.notFound.back} <Arrow /></a></main>
          : <main id="main-content" tabIndex={-1} key={lang}><Hero /><AreasMarquee /><ProcessSection /><FeaturedWork /><ProjectExplorer query={query} setQuery={setQuery} category={category} setCategory={setCategory} /><AboutSection /><ExperienceSection /><ResearchSection /><JourneySection /><ContactSection /></main>}
        <Footer project={project} />
        <div className="page-curtain" ref={curtain} aria-hidden="true"><span>{project ? project.title : 'Lakshy Chaudhary'}</span></div>
        {showTop && <button className="back-to-top" type="button" onClick={() => { window.scrollTo({ top: 0, behavior: scrollBehavior() }); focusMain(); }} aria-label={t.footer.topLabel}><svg aria-hidden="true" viewBox="0 0 20 20" className="icon"><path d="M10 16.5v-12m-5 5 5-5 5 5" /></svg></button>}
      </div>
    </I18nContext.Provider>
  );
}

export default App;
