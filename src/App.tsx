import { useEffect, useLayoutEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories, projects, type Project } from './data';
import { I18nContext, dictionaries, initialLang, languages, loadFonts, rememberLang, useI18n, type Lang } from './i18n';

gsap.registerPlugin(ScrollTrigger);

type Theme = 'dark' | 'light';

const EMAIL = 'lakshy.kunsan@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/lakshy-chaudhary/?isSelfProfile=true';
const PHOTO = 'lakshy.jpg';
const navItems = [
  ['work', '#projects'],
  ['about', '#about'],
  ['research', '#research'],
  ['journey', '#journey'],
] as const;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

function Logo() {
  const { t } = useI18n();
  return <a className="brand" href="#top" aria-label={t.nav.home}><span className="brand-mark" aria-hidden="true">LC</span><span className="brand-name">Lakshy Chaudhary</span></a>;
}

function PhotoCredit({ project }: { project: Project }) {
  const { t } = useI18n();
  return <a className="photo-credit" href={project.imageCreditUrl} target="_blank" rel="noreferrer">{t.work.credit}</a>;
}

function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t.nav.language}>
      {languages.map((language) => <button type="button" key={language.code} lang={language.code} className={lang === language.code ? 'active' : undefined} aria-pressed={lang === language.code} aria-label={language.label} title={language.label} onClick={() => setLang(language.code)}>{language.short}</button>)}
    </div>
  );
}

function SiteHeader({ theme, onThemeToggle, activeSection, scrolled }: { theme: Theme; onThemeToggle: () => void; activeSection: string; scrolled: boolean }) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const themeLabel = theme === 'dark' ? t.nav.toLight : t.nav.toDark;
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
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

function Hero() {
  const { t } = useI18n();
  const hero = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = hero.current;
    if (!element || prefersReducedMotion()) return;
    const context = gsap.context(() => {
      const words = splitWords(element.querySelector<HTMLElement>('h1')!);
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.hero-hello', { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% 0% -20% 0%)', duration: 1.1, ease: 'power2.inOut' })
        .from(words, { yPercent: 115, rotate: 3, duration: 1, stagger: .06, ease: 'power4.out' }, '-=.5')
        .fromTo('.scribble path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, '-=.3')
        .from('.hero-intro, .hero-actions', { y: 18, autoAlpha: 0, duration: .7, stagger: .12 }, '-=.8')
        // Explicit end values: the print has a CSS transform transition, which made .from() land on its start pose.
        .fromTo('.hero-print', { y: -70, rotation: -12, autoAlpha: 0 }, { y: 0, rotation: 2.5, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.3)', clearProps: 'transform' }, '-=1.4')
        .from('.tape', { scaleX: 0, duration: .45, ease: 'power2.out' }, '-=.3')
        .from('.hero-facts > div', { y: 16, autoAlpha: 0, duration: .6, stagger: .08 }, '-=.6');
    }, element);
    return () => context.revert();
  }, []);

  const [before, emphasis, after] = t.hero.title;
  return (
    <section className="hero section-pad" id="top" aria-labelledby="hero-title" ref={hero}>
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-hello">{t.hero.hello}</p>
          <h1 id="hero-title">{before}<span className="scribble-wrap"><em>{emphasis}</em><svg className="scribble" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 15c40-8 85-10 130-6 38 3 75 6 112 1 18-2 34-5 50-4" /></svg></span>{after}</h1>
          <p className="hero-intro">{t.hero.intro}</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">{t.hero.cta} <Arrow /></a><a className="text-link" href="#contact">{t.hero.sayHello} <Arrow diagonal /></a></div>
        </div>
        <figure className="hero-print">
          <span className="tape" aria-hidden="true" />
          <img src={PHOTO} alt={t.hero.photoAlt} width={400} height={400} fetchPriority="high" onError={markMissing} />
          <figcaption className="handwritten">{t.hero.caption}</figcaption>
        </figure>
      </div>
      <dl className="hero-facts">
        {t.hero.facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}
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
          <span className="step-number">{index + 1}</span>
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
  return (
    <section className="work-section section-pad" id="projects">
      <div className="section-heading split-heading"><div><p className="eyebrow">{t.work.eyebrow}</p><h2>{t.work.title[0]}<em>{t.work.title[1]}</em></h2></div><p className="section-lede">{t.work.lede}</p></div>
      <div className="feature-list">
        {items.map((project, index) => <article className={`feature${index % 2 ? ' is-flipped' : ''}`} key={project.slug}>
          <figure className="feature-media">
            <a href={`#/projects/${project.slug}`} tabIndex={-1} aria-hidden="true"><img src={project.image} alt="" loading="lazy" onError={markMissing} /></a>
            <figcaption><PhotoCredit project={project} /></figcaption>
          </figure>
          <div className="feature-copy reveal">
            <p className="feature-meta"><span>{t.work.number} {project.number}</span>{project.category}</p>
            <h3><a href={`#/projects/${project.slug}`}>{project.title}</a></h3>
            <p className="feature-summary">{project.summary}</p>
            <p className="feature-question">“{project.problem}”</p>
            <ul className="method-list" aria-label={t.work.methods}>{project.methods.map((method) => <li key={method}>{method}</li>)}</ul>
            <a className="text-link" href={`#/projects/${project.slug}`}>{t.work.read} <Arrow /></a>
          </div>
        </article>)}
      </div>
    </section>
  );
}

function ProjectExplorer() {
  const { t } = useI18n();
  const items = useProjects();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => items.filter((project, index) => {
    // Search the English wording too, so technical terms work in any language.
    const original = projects[index];
    const searchText = `${project.title} ${project.category} ${project.summary} ${project.methods.join(' ')} ${original.title} ${original.category} ${original.summary} ${original.methods.join(' ')}`.toLowerCase();
    return (category === 'All' || category === original.category) && searchText.includes(query.trim().toLowerCase());
  }), [items, query, category]);
  return (
    <section className="explorer-section section-pad" aria-labelledby="explorer-title">
      <div className="explorer-top"><div><p className="eyebrow">{t.explorer.eyebrow}</p><h2 id="explorer-title">{t.explorer.title}<span className="period">{t.explorer.period}</span></h2></div><p className="section-lede">{t.explorer.lede}</p></div>
      <div className="project-controls"><label className="search-box"><svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg><span className="sr-only">{t.explorer.search}</span><input type="search" placeholder={t.explorer.placeholder} value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-list" aria-label={t.explorer.filter}>{categories.map((item) => <button type="button" key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'All' ? t.explorer.all : t.categories[item] ?? item}</button>)}</div></div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{t.explorer.found(filtered.length)}</p>
      {filtered.length ? <ul className="index-list">{filtered.map((project) => <li key={project.slug}><a href={`#/projects/${project.slug}`}><span className="index-number">{project.number}</span><span className="index-title">{project.title}</span><span className="index-category">{project.category}</span><span className="index-summary">{project.summary}</span><Arrow diagonal /></a></li>)}</ul> : <div className="empty-state"><p>{t.explorer.empty}</p><button type="button" className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>{t.explorer.clear} <Arrow /></button></div>}
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
          <img src={PHOTO} alt={t.about.photoAlt} width={400} height={400} loading="lazy" onError={markMissing} />
          <figcaption className="handwritten">{t.about.caption}</figcaption>
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
            <div className="career-entry-copy"><h4>{item.role}{index === 0 && <span className="now-note handwritten">{t.career.now}</span>}</h4><p className="career-organization">{item.organization}{item.location ? `, ${item.location}` : ''}</p>{item.detail && <p className="career-detail">{item.detail}</p>}</div>
          </article>)}
          {t.additionalExperience.map((item) => <article className="career-entry reveal" key={`${item.organization}-${item.role}`}>
            <div className="career-entry-date">{item.date}</div>
            <div className="career-entry-copy"><h4>{item.role}</h4><p className="career-organization">{item.organization}</p></div>
          </article>)}
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
  return (
    <section className="research-section section-pad" id="research">
      <div className="section-heading split-heading"><div><p className="eyebrow">{t.research.eyebrow}</p><h2>{t.research.title[0]}<em>{t.research.title[1]}</em></h2></div><p className="section-lede">{t.research.lede}</p></div>
      <div className="research-content">
        <div>
          <h3 className="career-label">{t.research.areas}</h3>
          <ul className="areas-list">{t.researchAreas.map((area) => <li key={area}>{area}</li>)}</ul>
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
        <ol className="timeline"><span className="timeline-fill" aria-hidden="true" />{t.journey.map((entry) => <li className="timeline-entry" key={entry.title}><span className="timeline-dot" aria-hidden="true" /><div className="timeline-date">{entry.date}</div><h3>{entry.title}</h3><p>{entry.detail}</p></li>)}</ol>
      </div>
    </section>
  );
}

function ContactSection() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };
  return (
    <section className="contact-section section-pad" id="contact">
      <div className="contact-card">
        <p className="eyebrow">{t.contact.eyebrow}</p>
        <h2>{t.contact.title[0]}<em>{t.contact.title[1]}</em></h2>
        <p className="contact-intro">{t.contact.intro}</p>
        <div className="contact-actions">
          <a className="button button-primary" href={`mailto:${EMAIL}`}>{t.contact.write} <Arrow diagonal /></a>
          <button type="button" className="copy-email" onClick={copyEmail} aria-live="polite">{copied ? t.contact.copied : EMAIL}<span>{copied ? '' : t.contact.copyHint}</span></button>
          <a className="text-link" href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn <Arrow diagonal /></a>
        </div>
        <p className="contact-signoff handwritten">{t.contact.signoff}</p>
      </div>
      <p className="notes-empty">{t.contact.notes}</p>
    </section>
  );
}

function Footer({ projectPage = false }: { projectPage?: boolean }) {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} Lakshy Chaudhary · {t.footer.place}</p>
        <nav className="footer-links" aria-label={t.footer.label}><a href={`mailto:${EMAIL}`}>{t.footer.email}</a><a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a><a href={projectPage ? '#main-content' : '#top'}>{t.footer.top}</a></nav>
      </div>
    </footer>
  );
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const { t } = useI18n();
  const items = useProjects();
  const page = useRef<HTMLElement>(null);
  useEffect(() => { document.title = `${project.title} — Lakshy Chaudhary`; return () => { document.title = t.meta.title; }; }, [project, t]);
  useEffect(() => { window.scrollTo(0, 0); }, [project.slug]);
  useLayoutEffect(() => {
    if (!page.current || prefersReducedMotion()) return;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.back-link, .detail-hero .eyebrow', { x: -16, autoAlpha: 0, duration: .5, stagger: .08 })
        .from('.detail-hero h1, .detail-deck', { y: 30, autoAlpha: 0, duration: .8, stagger: .1 }, '-=.3')
        .fromTo('.detail-media img', { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'power4.inOut' }, '-=.5');
      gsap.utils.toArray<HTMLElement>('.detail-body section, .detail-next a').forEach((element) => {
        gsap.from(element, { y: 22, autoAlpha: 0, duration: .7, scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
    }, page.current);
    return () => context.revert();
  }, [project.slug]);
  return (
    <main className="detail-page" id="main-content" ref={page}>
      <a className="back-link" href="#projects" onClick={onBack}><span aria-hidden="true">←</span> {t.detail.all}</a>
      <header className="detail-hero">
        <p className="eyebrow">{t.work.number} {project.number} · {project.category} · {t.detail.ongoing}</p>
        <h1>{project.title}</h1>
        <p className="detail-deck">{project.summary}</p>
      </header>
      <figure className="detail-media"><img src={project.image} alt={project.imageAlt} onError={markMissing} /><figcaption>{t.detail.photoNote} <PhotoCredit project={project} /></figcaption></figure>
      <div className="detail-body">
        <section><h2 className="career-label">{t.detail.question}</h2><p className="detail-lead">{project.problem}</p></section>
        <section><h2 className="career-label">{t.detail.approach}</h2><p>{project.approach}</p></section>
        <section><h2 className="career-label">{t.detail.methods}</h2><ul className="method-list">{project.methods.map((method) => <li key={method}>{method}</li>)}</ul></section>
        <section><h2 className="career-label">{t.detail.stands}</h2><p>{t.detail.standsText}</p></section>
        <section><h2 className="career-label">{t.detail.limitations}</h2><p>{project.limitations}</p></section>
      </div>
      {(project.codeUrl || project.paperUrl) && <div className="detail-links">{project.codeUrl && <a className="text-link" href={project.codeUrl} target="_blank" rel="noreferrer">{t.detail.code} <Arrow diagonal /></a>}{project.paperUrl && <a className="text-link" href={project.paperUrl} target="_blank" rel="noreferrer">{t.detail.paper} <Arrow diagonal /></a>}</div>}
      <nav className="detail-next" aria-label={t.detail.others}><h2 className="career-label">{t.detail.keepReading}</h2>{items.filter((item) => item.slug !== project.slug).map((item) => <a key={item.slug} href={`#/projects/${item.slug}`}><img src={item.image} alt="" loading="lazy" onError={markMissing} /><span><small>{item.category}</small>{item.title}</span></a>)}</nav>
    </main>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem('lakshy-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = dictionaries[lang];
  const i18n = useMemo(() => ({ lang, t, setLang }), [lang, t]);
  const [route, setRoute] = useState(window.location.hash);
  const [showTop, setShowTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const projectSlug = route.match(/^#\/projects\/([^/?#]+)/)?.[1];
  const baseProject = projectSlug ? projects.find((item) => item.slug === projectSlug) : undefined;
  const project = baseProject ? { ...baseProject, ...t.projects[baseProject.slug] } : undefined;

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('lakshy-theme', theme); } catch { /* Theme still works for this session. */ }
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1a1815' : '#f4efe6');
  }, [theme]);
  useEffect(() => {
    rememberLang(lang);
    loadFonts(lang);
    document.documentElement.lang = lang;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
    if (!baseProject) document.title = t.meta.title;
  }, [lang, t, baseProject]);
  useEffect(() => {
    const update = () => {
      setShowTop(window.scrollY > 900);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
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
  }, [baseProject, lang]);

  // Animations split headings into words, so the page is remounted (keyed by language) whenever the language changes.
  useLayoutEffect(() => {
    if (baseProject) return;
    const context = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const once = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true });
      // Headings rise in word by word; eyebrows and ledes follow.
      gsap.utils.toArray<HTMLElement>('main h2').forEach((heading) => {
        gsap.from(splitWords(heading), { yPercent: 115, rotate: 3, duration: .95, stagger: .045, ease: 'power4.out', scrollTrigger: once(heading, 'top 88%') });
      });
      gsap.utils.toArray<HTMLElement>('main .eyebrow, main .section-lede').forEach((element) => {
        gsap.from(element, { y: 16, autoAlpha: 0, duration: .8, ease: 'power3.out', scrollTrigger: once(element, 'top 90%') });
      });
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element, index) => {
        gsap.from(element, { y: 26, autoAlpha: 0, duration: .8, delay: (index % 3) * .07, ease: 'power3.out', scrollTrigger: once(element, 'top 92%') });
      });
      // Project photos open like a curtain, then drift gently with the scroll.
      gsap.utils.toArray<HTMLElement>('.feature-media > a').forEach((frame) => {
        const image = frame.querySelector('img');
        gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut', scrollTrigger: once(frame, 'top 82%') });
        if (!image) return;
        gsap.fromTo(image, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'power3.out', scrollTrigger: once(frame, 'top 82%') });
        gsap.fromTo(image, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      gsap.fromTo('.about-photo img', { y: 50, rotation: -8, autoAlpha: 0 }, { y: 0, rotation: -1.5, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.2)', clearProps: 'transform', scrollTrigger: once(document.querySelector('.about-photo')!) });
      gsap.fromTo('.about-photo figcaption', { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% 0% -20% 0%)', duration: 1.2, delay: .6, ease: 'power2.inOut', scrollTrigger: once(document.querySelector('.about-photo')!) });
      // Step numbers pop in one after another.
      const steps = document.querySelector('.process-steps');
      if (steps) gsap.from('.step-number', { scale: .3, rotation: -25, autoAlpha: 0, duration: .7, stagger: .14, ease: 'back.out(2)', scrollTrigger: once(steps) });
      const areas = document.querySelector('.areas-list');
      if (areas) gsap.from('.areas-list li', { x: -30, autoAlpha: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: once(areas) });
      // The timeline draws downward and each stop lights up as it is reached.
      const timeline = document.querySelector<HTMLElement>('.timeline');
      if (timeline) gsap.fromTo('.timeline-fill', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.timeline-entry').forEach((entry) => {
        ScrollTrigger.create({ trigger: entry, start: 'top 70%', onEnter: () => entry.classList.add('is-reached'), onLeaveBack: () => entry.classList.remove('is-reached') });
        gsap.from(entry, { x: 24, autoAlpha: 0, duration: .8, ease: 'power3.out', scrollTrigger: once(entry, 'top 88%') });
      });
      const card = document.querySelector('.contact-card');
      if (card) {
        gsap.from(card, { y: 40, scale: .96, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: once(card) });
        gsap.fromTo('.contact-signoff', { clipPath: 'inset(-30% 100% -30% 0%)' }, { clipPath: 'inset(-30% 0% -30% 0%)', duration: 1.3, delay: .8, ease: 'power2.inOut', scrollTrigger: once(card) });
      }
    });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { window.removeEventListener('load', refresh); context.revert(); };
  }, [baseProject, lang]);

  const goToProjects = () => { window.location.hash = '#projects'; };
  const unknownRoute = projectSlug && !project;
  return (
    <I18nContext.Provider value={i18n}>
      <div className="app-shell">
        <div className="reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${readingProgress})` }} /></div>
        <a className="skip-link" href="#main-content">{t.nav.skip}</a>
        <SiteHeader theme={theme} scrolled={scrolled} activeSection={activeSection} onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
        {project ? <ProjectDetail key={project.slug} project={project} onBack={() => setRoute('#projects')} /> : unknownRoute ? <main className="not-found" id="main-content" key={lang}><p className="eyebrow">{t.notFound.eyebrow}</p><h1>{t.notFound.title[0]}<em>{t.notFound.title[1]}</em></h1><button className="button button-primary" onClick={goToProjects}>{t.notFound.back} <Arrow /></button></main> : <main id="main-content" key={lang}><Hero /><ProcessSection /><FeaturedWork /><ProjectExplorer /><AboutSection /><ExperienceSection /><ResearchSection /><JourneySection /><ContactSection /></main>}
        <Footer projectPage={Boolean(project)} />
        {showTop && <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })} aria-label={t.footer.topLabel}>↑</button>}
      </div>
    </I18nContext.Provider>
  );
}

export default App;
