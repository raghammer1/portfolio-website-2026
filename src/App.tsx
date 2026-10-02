import { useEffect, useState } from 'react';
import {
  capabilities,
  caseStudies,
  experience,
  identity,
  links,
  personalProjects,
} from './data/content';
import { Arrow, ObservatoryMark } from './components/Icons';
import { ExternalLink } from './components/ExternalLink';
import { ObservatoryVisual } from './components/ObservatoryVisual';
import { EngineeringCaseStudy } from './components/EngineeringCaseStudy';
import { ProjectPreview } from './components/ProjectPreview';

const sections = ['Work', 'Experience', 'About', 'Contact'];

function Navigation() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: 0 },
    );
    for (const section of sections) {
      const element = document.getElementById(section.toLowerCase());
      if (element) observer.observe(element);
    }
    const hero = document.getElementById('top');
    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive('');
      },
      { threshold: 0.6 },
    );
    if (hero) topObserver.observe(hero);
    return () => {
      observer.disconnect();
      topObserver.disconnect();
    };
  }, []);
  return (
    <header className={`site-header${active ? ' is-scrolled' : ''}`}>
      <div className="header-inner">
        <a className="wordmark" href="#top" aria-label="Raghav Agarwal, back to top">
          <ObservatoryMark />
          <span>
            Raghav Agarwal<span className="wordmark-dot">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          {sections.map((section) => (
            <a
              key={section}
              href={`#${section.toLowerCase()}`}
              aria-current={active === section.toLowerCase() ? 'location' : undefined}
            >
              {section}
            </a>
          ))}
        </nav>
        <a className="header-contact" href="#contact">
          Let’s talk <Arrow diagonal />
        </a>
      </div>
    </header>
  );
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label mono">
      <span>{number}</span>
      <span className="label-line" />
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <div className="hero-visual">
        <ObservatoryVisual />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-main section-shell">
        <div className="hero-copy">
          <p className="hero-eyebrow mono">
            <span className="signal-dot" />
            SOFTWARE ENGINEER · SYDNEY, AU
          </p>
          <h1 id="hero-heading">
            Engineering
            <br />
            <em>intelligent</em>
            <br />
            systems<span className="heading-stop">.</span>
          </h1>
          <p className="hero-introduction">{identity.introduction}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              Explore my work <Arrow />
            </a>
          </div>
        </div>
      </div>
      <div className="hero-foot section-shell mono">
        <a href="#work">
          <span className="scroll-arrow">↓</span>SCROLL TO EXPLORE
        </a>
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section id="work" className="work-section" aria-labelledby="work-heading">
      <div className="section-shell">
        <SectionLabel number="01">SELECTED ENGINEERING</SectionLabel>
        <div className="section-heading work-heading">
          <h2 id="work-heading">
            Built with purpose.
            <br />
            <em>Explained with care.</em>
          </h2>
          <p>
            A closer look at the systems I work on,
            <br className="desktop-break" /> and the thinking behind them.
          </p>
        </div>
      </div>
      <div className="case-list">
        {caseStudies.map((study) => (
          <EngineeringCaseStudy key={study.id} study={study} />
        ))}
      </div>
    </section>
  );
}

function PersonalProjects() {
  return (
    <section className="projects-section section-shell" aria-labelledby="projects-heading">
      <div className="projects-heading">
        <div>
          <p className="eyebrow mono">OFF THE CLOCK / INTO THE DETAILS</p>
          <h2 id="projects-heading">
            Curiosity, <em>put to work.</em>
          </h2>
        </div>
        <ExternalLink className="text-link" href={links.github}>
          All repositories
        </ExternalLink>
      </div>
      <div className="projects-grid">
        {personalProjects.map((project) => (
          <article className="personal-project" key={project.kind}>
            <ProjectPreview kind={project.kind} />
            <div className="project-copy">
              <p className="project-type mono">{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p className="project-tech">{project.technologies}</p>
              <div className="project-links">
                {project.actions.map((action) => (
                  <ExternalLink key={action.url} href={action.url}>
                    {action.label}
                  </ExternalLink>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="project-art-note mono">
        ORIGINAL ILLUSTRATIONS OF EACH PROJECT’S UNDERLYING IDEAS.
      </p>
    </section>
  );
}

function Experience() {
  return (
    <section
      className="experience-section section-shell"
      id="experience"
      aria-labelledby="experience-heading"
    >
      <SectionLabel number="02">THE TRAJECTORY</SectionLabel>
      <div className="experience-layout">
        <div className="experience-intro">
          <h2 id="experience-heading">
            Always building.
            <br />
            <em>Always learning.</em>
          </h2>
          <p>
            From understanding systems on the ground to designing the software that moves them
            forward.
          </p>
          <div className="trajectory-art" aria-hidden="true">
            <svg viewBox="0 0 280 180" fill="none">
              <path
                d="M-20 177C33 69 98 184 167 84S238 31 297-3"
                stroke="#788f9e"
                strokeOpacity=".5"
              />
              <path
                d="M-20 192C33 84 98 199 167 99S238 46 297 12"
                stroke="#788f9e"
                strokeOpacity=".15"
              />
              <circle cx="61" cy="128" r="3" fill="#8d9eab" />
              <circle cx="161" cy="92" r="3" fill="#b2cee4" />
              <circle cx="238" cy="27" r="4" fill="#d1a569" />
              <circle cx="238" cy="27" r="10" stroke="#d1a569" strokeOpacity=".3" />
            </svg>
            <span className="mono">A CONTINUING EXPLORATION</span>
          </div>
        </div>
        <div className="experience-list">
          {experience.map((job, index) => (
            <article className="experience-row" key={job.company}>
              <div className="experience-top">
                <span className="experience-date mono">{job.dates}</span>
                {index === 0 && (
                  <span className="current-role mono">
                    <i />
                    CURRENT
                  </span>
                )}
              </div>
              <h3>{job.company}</h3>
              <p className="experience-role">{job.role}</p>
              <p className="experience-detail">{job.detail}</p>
              {job.recognition && (
                <span className="recognition">
                  <span aria-hidden="true">✧</span>
                  {job.recognition}
                </span>
              )}
            </article>
          ))}
          <div className="earlier-experience">
            <p className="eyebrow mono">THE FOUNDATION</p>
            <p>
              Earlier enterprise IT support experience with NBN, Johnson & Johnson, SC Johnson and
              Capgemini.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="section-shell">
        <SectionLabel number="03">BEYOND THE CODE</SectionLabel>
        <h2 className="about-name" id="about-heading">
          Raghav <em>Agarwal.</em>
        </h2>
        <div className="about-layout">
          <div className="about-title">
            <p className="eyebrow mono">ENGINEER. BUILDER. PERPETUAL STUDENT.</p>
            <h3 className="about-statement">
              The best part?
              <br />
              <em>
                There’s always
                <br />
                more to understand.
              </em>
            </h3>
          </div>
          <div className="about-copy">
            <p className="about-lead">
              I like making things work.
              <br />I like understanding <em>why</em> they work even more.
            </p>
            <p>
              That thread runs through my work—from enterprise IT support and early Python and SQL
              automation, to full-stack applications, data performance and applied AI.
            </p>
            <p>
              Outside software, I created{' '}
              <a
                className="inline-link"
                href={links.curiosity}
                target="_blank"
                rel="noopener noreferrer"
              >
                Unwinding Curiosity<span className="sr-only"> (opens in a new tab)</span>
              </a>{' '}
              to explore science through articles and conversations. The questions change; the
              impulse to look closer stays the same.
            </p>
            <div className="education">
              <span className="education-mark" aria-hidden="true">
                ↗
              </span>
              <div>
                <p className="education-title">Bachelor of Computer Science</p>
                <p>UNSW · 2021 – 2024</p>
                <p className="education-note">
                  Founded the UNSW Active Thinkers Society and served as its president.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="capabilities">
          <div className="capabilities-heading">
            <span className="eyebrow mono">THE WORKING TOOLBOX</span>
            <span className="mono">TOOLS FOLLOW THE PROBLEM.</span>
          </div>
          <div className="capabilities-grid">
            {capabilities.map((capability) => (
              <div className="capability" key={capability.number}>
                <span className="capability-number mono">/{capability.number}</span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <p className="capability-tools">{capability.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="contact-horizon" aria-hidden="true" />
      <div className="section-shell contact-content">
        <SectionLabel number="04">OPEN CHANNEL</SectionLabel>
        <p className="contact-kicker mono">GOOD CONVERSATIONS ARE A STARTING POINT.</p>
        <h2 id="contact-heading">
          Let’s build
          <br />
          <em>what’s next.</em>
        </h2>
        <p className="contact-intro">
          Have an interesting problem, an idea, or a question?
          <br />
          I’d like to hear about it.
        </p>
        <a className="contact-email" href={links.email}>
          {identity.email}
          <Arrow diagonal />
        </a>
        <div className="contact-socials">
          <ExternalLink href={links.linkedin}>Connect on LinkedIn</ExternalLink>
          <ExternalLink href={links.github}>Explore GitHub</ExternalLink>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-observed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll('.section-heading, .projects-heading, .experience-intro, .about-title')
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Hero />
        <SelectedWork />
        <PersonalProjects />
        <Experience />
        <About />
        <Contact />
      </main>
      <footer className="site-footer section-shell">
        <a className="footer-signature" href="#top">
          <ObservatoryMark />
          <span>Raghav Agarwal</span>
        </a>
        <span className="mono">DESIGNED WITH INTENTION. BUILT WITH CURIOSITY.</span>
        <a className="back-to-top" href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </footer>
      <div className="image-credits">
        <span>Planetary imagery:</span>
        <a
          href="https://science.nasa.gov/resource/mars-planet-globe/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA / JPL-Caltech <span className="sr-only">(opens in a new tab)</span>
        </a>
        <a
          href="https://www.nasa.gov/image-article/sun-rises-above-horizon-illuminating-earth/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </>
  );
}
