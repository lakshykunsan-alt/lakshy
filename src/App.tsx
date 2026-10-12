import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { additionalExperience, categories, certifications, education, experience, journey, projects, researchAreas, topSkills, type Project } from './data';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'lakshy.kunsan@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/lakshy-chaudhary/?isSelfProfile=true';
const navItems = [
  ['Work', '#projects'],
  ['About', '#about'],
  ['Research', '#research'],
  ['Journey', '#journey'],
] as const;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="icon"><path d="M5 15 15 5M6 5h9v9" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="icon"><path d="M3.5 10h12m-5-5 5 5-5 5" /></svg>
  );
}

function Logo() {
  return <a className="brand" href="#top" aria-label="Lakshy Chaudhary, home"><span className="brand-mark">L<span>.</span></span><span className="brand-name">Lakshy<br /><small>Research in AI & perception</small></span></a>;
}

function ProjectCard({ project, showcase = false }: { project: Project; showcase?: boolean }) {
  return (
    <article className={`project-card${showcase ? ' showcase-card' : ''}`}>
      <div className="project-copy">
        <div className="project-meta"><span>{project.number} <b>—</b> {project.category}</span></div>
        <h3><a href={`#/projects/${project.slug}`} aria-label={`Read about ${project.title}`}>{project.title}<Arrow diagonal /></a></h3>
        <p>{project.summary}</p>
        <a className="text-link" href={`#/projects/${project.slug}`}>Explore project <Arrow /></a>
      </div>
    </article>
  );
}

function SiteHeader({ theme, onThemeToggle }: { theme: 'dark' | 'light'; onThemeToggle: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner"><Logo />
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? 'Close' : 'Menu'}</span><i className={menuOpen ? 'menu-lines open' : 'menu-lines'} aria-hidden="true"><b /><b /></i></button>
        <nav id="primary-navigation" className={menuOpen ? 'primary-nav open' : 'primary-nav'} aria-label="Main navigation">
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a href="#contact" onClick={() => setMenuOpen(false)} className="nav-contact">Say hello <Arrow diagonal /></a>
        </nav>
        <button type="button" className="theme-toggle" onClick={onThemeToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><svg className="theme-icon-svg" viewBox="0 0 24 24" aria-hidden="true">{theme === 'dark' ? <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></> : <><path d="M20.4 15.2A8.7 8.7 0 0 1 8.8 3.6 8.8 8.8 0 1 0 20.4 15.2Z"/><path d="m17 4 .4 1.6L19 6l-1.6.4L17 8l-.4-1.6L15 6l1.6-.4L17 4Z"/></>}</svg></button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero section-pad" id="top" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> AI Convergence Lab · Gunsan, South Korea</p>
          <h1 id="hero-title">I build AI systems<br />that <em>see, reason,</em><br />and act<span className="period">.</span></h1>
          <p className="hero-intro">I’m Lakshy Chaudhary — an AI PhD scholar researching brain imaging and Neuro AI, with broader interests in systems that perceive and act.</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">Explore my work <Arrow /></a><a className="button button-quiet" href="#contact">Get in touch <Arrow diagonal /></a></div>
          <div className="hero-footnote"><span className="mini-marker">↳</span><span>Researching perception, reasoning<br />and action in intelligent systems.</span></div>
        </div>
          <aside className="hero-focus" aria-label="Current doctoral research">
            <p className="eyebrow"><span className="eyebrow-line" /> Currently</p>
            <h2 className="hero-focus-title">Brain imaging<br /><em>& Neuro AI</em></h2>
            <p className="hero-focus-note">My doctoral work brings deep learning and cognitive signal processing to EEG/fMRI research in the AI Convergence Lab at Kunsan National University.</p>
            <div className="hero-focus-meta"><span>PhD research</span><span>Gunsan, South Korea</span></div>
          </aside>
      </div>
      <a className="scroll-cue" href="#approach"><span>Scroll to explore</span><i /></a>
      <span className="hero-index">Research portfolio <b>—</b> AI & Neuro AI</span>
    </section>
  );
}

const processSteps = [
  { number: '01', title: 'Observe', theme: 'Perception', detail: 'Take in camera observations and make sense of the scene.' },
  { number: '02', title: 'Approach', theme: 'Reasoning', detail: 'Relate an instruction to objects and possible actions.' },
  { number: '03', title: 'Grasp', theme: 'Action', detail: 'Translate an intention into a physical interaction.' },
  { number: '04', title: 'Place', theme: 'Action', detail: 'Complete the sequence with a deliberate placement.' },
];

function ProcessSection() {
  const [active, setActive] = useState(0);
  const sequence = useRef<HTMLElement>(null);
  useEffect(() => {
    const cards = sequence.current?.querySelectorAll<HTMLElement>('.process-step');
    if (!cards?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const triggers = Array.from(cards).map((card, index) => ScrollTrigger.create({
      trigger: card,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(index),
      onEnterBack: () => setActive(index),
    }));
    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);
  return (
    <section className="process-section section-pad" id="approach" ref={sequence}>
      <div className="section-heading"><p className="eyebrow"><span className="eyebrow-line" /> How I think about it</p><h2>From seeing<br /><em>to doing.</em></h2><p className="section-lede">Intelligent systems move through a loop: observe the world, reason about it, then act.</p></div>
      <div className="process-layout">
        <div className="process-readout-panel" aria-live="polite">
          <span className="process-panel-label">A conceptual lens · {processSteps[active]?.number}</span>
          <p className="process-panel-theme">{processSteps[active]?.theme}</p>
          <h3>{processSteps[active]?.title}</h3>
          <p>{processSteps[active]?.detail}</p>
          <span className="process-panel-note">A way to frame the research — not a depiction of experimental results.</span>
        </div>
        <div className="process-steps">
          {processSteps.map((step, index) => <article className={`process-step${active === index ? ' is-active' : ''}`} key={step.number}>
            <span className="step-number">{step.number}</span><div><p className="step-theme">{step.theme}</p><h3>{step.title}</h3><p>{step.detail}</p></div><span className="step-indicator" aria-hidden="true" />
          </article>)}
        </div>
      </div>
      <p className="illustration-note">These stages describe a conceptual framework, not research footage or evidence of project results.</p>
    </section>
  );
}

function Showcase() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const sectionEl = section.current;
    const trackEl = track.current;
    if (!sectionEl || !trackEl) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 1100px) and (prefers-reduced-motion: no-preference)', () => {
      const slides = gsap.utils.toArray<HTMLElement>('.showcase-card', trackEl);
      gsap.set(trackEl, { display: 'flex', width: `${slides.length * 100}%` });
      gsap.set(slides, { flex: `0 0 ${100 / slides.length}%`, minWidth: 0 });
      const travel = 100 - 100 / slides.length;
      const tween = gsap.to(trackEl, { xPercent: -travel, ease: 'none', scrollTrigger: { trigger: sectionEl, start: 'top top+=80', end: '+=1700', scrub: 0.7, pin: '.showcase-viewport', anticipatePin: 1 } });
      const scrollTrigger = tween.scrollTrigger;
      const onFocus = (event: FocusEvent) => {
        if (!scrollTrigger || !(event.target instanceof Element)) return;
        const slide = event.target.closest<HTMLElement>('.showcase-card');
        if (!slide) return;
        const index = slides.indexOf(slide);
        const progress = index / Math.max(1, slides.length - 1);
        window.scrollTo({ top: scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress, behavior: 'smooth' });
      };
      sectionEl.addEventListener('focusin', onFocus);
      return () => { sectionEl.removeEventListener('focusin', onFocus); tween.scrollTrigger?.kill(); tween.kill(); gsap.set(trackEl, { clearProps: 'all' }); gsap.set(slides, { clearProps: 'all' }); };
    });
    return () => media.revert();
  }, []);
  return (
    <section className="showcase-section section-pad" id="projects" ref={section}>
      <div className="section-heading heading-row"><div><p className="eyebrow"><span className="eyebrow-line" /> Selected work</p><h2>Questions worth<br /><em>getting hands-on with.</em></h2></div><p className="section-lede">Ongoing explorations across embodied AI, perception, and patterns in complex data.</p></div>
      <div className="showcase-viewport" aria-label="Selected research projects">
        <div className="showcase-window" ref={track}>
          {projects.map((project) => <ProjectCard key={project.slug} project={project} showcase />)}
        </div>
      </div>
      <div className="showcase-hint"><span>Scroll to move through the work</span><span className="showcase-hint-line" /></div>
    </section>
  );
}

function ProjectExplorer() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => projects.filter((project) => {
    const searchText = `${project.title} ${project.category} ${project.summary} ${project.methods.join(' ')}`.toLowerCase();
    return (category === 'All' || category === project.category) && searchText.includes(query.trim().toLowerCase());
  }), [query, category]);
  return (
    <section className="explorer-section section-pad" aria-labelledby="explorer-title">
      <div className="explorer-top"><div><p className="eyebrow"><span className="eyebrow-line" /> Research index</p><h2 id="explorer-title">Explore the work<span className="period">.</span></h2></div><p>Search across the themes and methods behind each project.</p></div>
      <div className="project-controls"><label className="search-box"><svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects or methods" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-list" aria-label="Filter projects by category">{categories.map((item) => <button type="button" key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
      {filtered.length ? <div className="project-grid">{filtered.map((project) => <ProjectCard key={project.slug} project={project} />)}</div> : <div className="empty-state"><span>NO MATCHING PROJECTS</span><p>Try another keyword or select a different research area.</p><button type="button" className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters <Arrow /></button></div>}
      <p className="ongoing-note"><span className="pulse-dot" /> All listed projects are ongoing research explorations.</p>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section section-pad" id="about">
      <p className="about-location"><span>BASED IN</span><strong>Gunsan</strong><span>South Korea</span></p>
      <div className="about-main"><p className="eyebrow"><span className="eyebrow-line" /> A little about me</p><h2>Research that<br />doesn’t stop at<br /><em>the screen.</em></h2></div>
      <div className="about-body"><p className="about-lead">I’m Lakshy Chaudhary (Lucky), an AI PhD scholar and Global Korea Scholarship recipient at Kunsan National University.</p><p>Originally from Meerut, India, I’m now based in Gunsan, South Korea. My current doctoral focus is Brain Imaging Data (Neuro AI), exploring AI and machine learning methods for EEG/fMRI and cognitive signal processing.</p><p>My broader interests include robot manipulation, computer vision, vision-language models, and applied machine learning.</p><a className="text-link" href="#experience">Experience & education <Arrow /></a><a className="text-link" href="#contact">Start a conversation <Arrow /></a></div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="career-section section-pad" id="experience">
      <div className="career-heading"><p className="eyebrow"><span className="eyebrow-line" /> Experience & education</p><h2>A path through<br /><em>people and ideas.</em></h2></div>
      <div className="career-columns">
        <div className="career-list">
          <h3 className="career-label">Experience</h3>
          {experience.map((item) => <article className="career-entry" key={`${item.organization}-${item.role}`}>
            <div className="career-entry-date">{item.date}</div>
            <div className="career-entry-copy"><h4>{item.role}</h4><p className="career-organization">{item.organization}{item.location ? ` · ${item.location}` : ''}</p>{item.detail && <p className="career-detail">{item.detail}</p>}</div>
          </article>)}
          {additionalExperience.map((item) => <article className="career-entry" key={`${item.organization}-${item.role}`}>
            <div className="career-entry-date">{item.date}</div>
            <div className="career-entry-copy"><h4>{item.role}</h4><p className="career-organization">{item.organization}</p></div>
          </article>)}
        </div>
        <div className="career-side">
          <div className="education-list">
            <h3 className="career-label">Education</h3>
            {education.map((item) => <article className="education-entry" key={item.institution}>
              <span>{item.date}</span><h4>{item.qualification}</h4><p>{item.institution} · {item.location}</p>
            </article>)}
          </div>
          <div className="certification-list">
            <h3 className="career-label">Certificates</h3>
            {certifications.map((item) => <p className="certification-entry" key={item}>{item}</p>)}
          </div>
          <p className="top-skills-note"><span>Top skills</span>{topSkills.join(' · ')}</p>
        </div>
      </div>
    </section>
  );
}

function ResearchSection() {
  return (
    <section className="research-section section-pad" id="research">
      <div className="research-heading"><p className="eyebrow"><span className="eyebrow-line" /> Research & publications</p><h2>Curiosity, with<br /><em>room to move.</em></h2><p className="section-lede">I work across methods and questions, following the problem wherever it leads.</p></div>
      <div className="research-content"><div className="areas-list"><p className="list-label">Areas I return to</p>{researchAreas.map((area) => <div className="area-row" key={area}><p>{area}</p></div>)}</div><div className="publication-card"><div className="pub-card-top"><span>Publications</span></div><h3>Still taking shape.</h3><p>There are no publications to list here yet. I’ll add them when there’s something confirmed to share.</p></div></div>
    </section>
  );
}

const skills = ['Brain imaging data', 'Neuro AI', 'EEG / fMRI', 'Deep learning', 'Cognitive signal processing', 'Robot manipulation', 'Computer vision', 'Vision-language models', 'Segmentation', 'Camera observations', 'Facial action units', 'Event data', 'Temporal modeling', 'Applied machine learning', ...topSkills];
function SkillsSection() {
  return <section className="skills-section section-pad" aria-labelledby="skills-title"><div className="skills-intro"><p className="eyebrow"><span className="eyebrow-line" /> Methods & toolkit</p><h2 id="skills-title">A growing<br /><em>set of tools.</em></h2><p>Methods and technical areas reflected in my current research.</p></div><div className="skill-cloud">{skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div></section>;
}

function JourneyGallery() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = useRef(false);

  useLayoutEffect(() => {
    const trackElement = track.current;
    if (!trackElement) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = trackElement.querySelectorAll<HTMLElement>('.journey-gallery-card');
      gsap.fromTo(cards, { y: 24, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: trackElement, start: 'top 84%', once: true },
      });
    });
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => media.revert();
  }, []);

  const updateActive = () => {
    const trackElement = track.current;
    if (!trackElement) return;
    const center = trackElement.getBoundingClientRect().left + trackElement.clientWidth / 2;
    const cards = Array.from(trackElement.querySelectorAll<HTMLElement>('.journey-gallery-card'));
    const nearest = cards.reduce((best, card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActive(nearest.index);
  };

  const goTo = (index: number) => {
    const trackElement = track.current;
    const card = trackElement?.querySelectorAll<HTMLElement>('.journey-gallery-card')[index];
    if (!trackElement || !card) return;
    trackElement.scrollTo({
      left: card.offsetLeft - (trackElement.clientWidth - card.clientWidth) / 2,
      behavior: reducedMotion.current ? 'auto' : 'smooth',
    });
    setActive(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLButtonElement) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(Math.min(journey.length - 1, active + 1));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(Math.max(0, active - 1));
    }
  };

  return (
    <div className="journey-gallery" aria-labelledby="journey-gallery-title">
      <div className="journey-gallery-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> A personal archive</p>
          <h3 id="journey-gallery-title">A journey,<br /><em>in chapters.</em></h3>
        </div>
        <div className="journey-gallery-controls">
          <span className="journey-gallery-count" aria-hidden="true">0{active + 1}<i />0{journey.length}</span>
          <button type="button" onClick={() => goTo(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous journey chapter"><span aria-hidden="true">←</span></button>
          <button type="button" onClick={() => goTo(Math.min(journey.length - 1, active + 1))} disabled={active === journey.length - 1} aria-label="Next journey chapter"><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div className="journey-gallery-track" id="journey-gallery-track" ref={track} role="region" aria-label="Journey chapters" aria-roledescription="carousel" tabIndex={0} onScroll={updateActive} onKeyDown={handleKeyDown}>
        {journey.map((entry, index) => (
          <article className={`journey-gallery-card${active === index ? ' is-current' : ''}`} key={entry.title} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${journey.length}: ${entry.title}`} tabIndex={0}>
            <div className="journey-gallery-copy">
              <span className="journey-gallery-date">{entry.date || 'Date to be added'}</span>
              <h4>{entry.title}</h4>
              <p>{entry.detail}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="journey-gallery-footer">
        <p>This archive is intentionally typographic for now; personal photographs will be added only when available.</p>
        <div className="journey-gallery-progress" aria-hidden="true"><span style={{ transform: `scaleX(${(active + 1) / journey.length})` }} /></div>
      </div>
    </div>
  );
}

function JourneySection() {
  return (
    <section className="journey-section section-pad" id="journey">
      <div className="journey-top">
        <div className="journey-intro"><p className="eyebrow"><span className="eyebrow-line" /> Research journey</p><h2>Still <em>becoming.</em></h2><p>A few coordinates in the journey so far. Dates are left open until there’s a confirmed timeline to share.</p></div>
        <div className="timeline"><span className="timeline-fill" aria-hidden="true" />{journey.map((entry) => <article className="timeline-entry" key={entry.title}><div className="timeline-date">{entry.date}</div><span className="timeline-dot" aria-hidden="true" /><div className="timeline-copy"><h3>{entry.title}</h3><p>{entry.detail}</p></div></article>)}</div>
      </div>
      <JourneyGallery />
    </section>
  );
}

function NotesSection() {
  return <section className="notes-section section-pad" id="notes"><div><p className="eyebrow"><span className="eyebrow-line" /> Field notes</p><h2>Ideas in progress<span className="period">.</span></h2></div><div className="notes-empty"><span className="notes-mark" aria-hidden="true">···</span><p>No research notes published yet.</p><span>When there’s something ready to share, it’ll appear here.</span></div></section>;
}

function ContactSection() {
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
  return <section className="contact-section section-pad" id="contact"><p className="eyebrow"><span className="eyebrow-line" /> Get in touch</p><h2>Have a good<br /><em>question?</em></h2><p className="contact-intro">I’m always happy to hear from people thinking about intelligent systems and the worlds they act in.</p><div className="contact-actions"><a className="button button-primary" href={`mailto:${EMAIL}`}>Write me an email <Arrow diagonal /></a><button type="button" className="copy-email" onClick={copyEmail}>{copied ? 'Email copied ✓' : EMAIL}<span>{copied ? 'Ready to paste' : 'Copy email'}</span></button><a className="contact-link" href={LINKEDIN} target="_blank" rel="noreferrer">Find me on LinkedIn <Arrow diagonal /></a></div><div className="contact-meta"><span>Based in Gunsan, South Korea</span><span>Originally from Meerut, India</span></div></section>;
}

function Footer({ projectPage = false }: { projectPage?: boolean }) {
  return <footer className="site-footer"><Logo /><p>Thoughtfully curious.<br />Always in progress.</p><a href={projectPage ? '#main-content' : '#top'} className="back-top">Back to top <span>↑</span></a><span className="copyright">© {new Date().getFullYear()} Lakshy Chaudhary</span></footer>;
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  useEffect(() => { document.title = `${project.title} — Lakshy Chaudhary`; window.scrollTo(0, 0); return () => { document.title = 'Lakshy Chaudhary — AI, Neuro AI & Robotics'; }; }, [project]);
  return <main className="detail-page" id="main-content"><div className="detail-top"><a className="back-link" href="#projects" onClick={onBack}><span>←</span> All projects</a><span className="detail-number">Project {project.number}</span></div><div className="detail-hero"><div><p className="eyebrow"><span className="eyebrow-line" /> {project.category} · Ongoing</p><h1>{project.title}<span className="period">.</span></h1><p className="detail-deck">{project.summary}</p></div></div><div className="detail-body"><div className="detail-overview"><p className="eyebrow"><span className="eyebrow-line" /> Project overview</p><h2>Understanding<br /><em>the question.</em></h2></div><div className="detail-sections"><section><span>The problem</span><p>{project.problem}</p></section><section><span>Approach</span><p>{project.approach}</p></section><section><span>Methods</span><div className="detail-methods">{project.methods.map((method) => <span key={method}>{method}</span>)}</div></section><section><span>Current status</span><p>This project is ongoing. More detail will be added as the work develops and confirmed information is available.</p></section><section><span>Limitations</span><p>{project.limitations}</p></section><section><span>Media</span><p>No project media has been supplied for this page.</p></section></div></div>{(project.codeUrl || project.paperUrl) && <div className="detail-links"><span>Further reading</span>{project.codeUrl && <a href={project.codeUrl} target="_blank" rel="noreferrer">Code <Arrow diagonal /></a>}{project.paperUrl && <a href={project.paperUrl} target="_blank" rel="noreferrer">Paper <Arrow diagonal /></a>}</div>}<div className="detail-next"><span>Continue exploring</span><div>{projects.filter((item) => item.slug !== project.slug).map((item) => <a key={item.slug} href={`#/projects/${item.slug}`}>{item.title}<Arrow diagonal /></a>)}</div></div></main>;
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('lakshy-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const [route, setRoute] = useState(window.location.hash);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const projectSlug = route.match(/^#\/projects\/([^/?#]+)/)?.[1];
  const project = projectSlug ? projects.find((item) => item.slug === projectSlug) : undefined;

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('lakshy-theme', theme); } catch { /* Theme still works for this session. */ }
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(height > 0 ? window.scrollY / height * 100 : 0);
      setShowTop(window.scrollY > 700);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [project]);

  useLayoutEffect(() => {
    if (project) return;
    const context = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>('.reveal, .section-heading, .explorer-top, .about-main, .research-heading, .skills-intro, .journey-intro, .notes-section > div:first-child, .contact-section > *').forEach((element) => {
        gsap.fromTo(element, { y: 18 }, { y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
      });
      const timelineFill = document.querySelector<HTMLElement>('.timeline-fill');
      const timeline = document.querySelector<HTMLElement>('.timeline');
      if (timelineFill && timeline) gsap.fromTo(timelineFill, { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 72%', end: 'bottom 76%', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.timeline-entry').forEach((entry) => {
        gsap.fromTo(entry.querySelector('.timeline-dot'), { scale: 0.7 }, { scale: 1, duration: 0.35, scrollTrigger: { trigger: entry, start: 'top 78%', once: true } });
      });
    });
    return () => context.revert();
  }, [project]);

  const goToProjects = () => { window.location.hash = '#projects'; };
  const unknownRoute = projectSlug && !project;
  return (
    <div className="app-shell">
      <div className="reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${readingProgress / 100})` }} /></div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader theme={theme} onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
      {project ? <ProjectDetail project={project} onBack={() => setRoute('#projects')} /> : unknownRoute ? <main className="not-found" id="main-content"><p className="eyebrow">PROJECT NOT FOUND</p><h1>That page isn’t<br /><em>in the index.</em></h1><button className="button button-primary" onClick={goToProjects}>Back to projects <Arrow /></button></main> : <main id="main-content"><Hero /><ProcessSection /><Showcase /><ProjectExplorer /><AboutSection /><ExperienceSection /><ResearchSection /><SkillsSection /><JourneySection /><NotesSection /><ContactSection /></main>}
      <Footer projectPage={Boolean(project)} />
      {showTop && <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })} aria-label="Back to top">↑</button>}
    </div>
  );
}

export default App;
