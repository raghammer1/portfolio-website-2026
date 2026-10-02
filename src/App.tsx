import { useEffect, useState } from 'react';
import { capabilities, caseStudies, experience, identity, links } from './data/content';
import { Arrow, ObservatoryMark } from './components/Icons';
import { ExternalLink } from './components/ExternalLink';
import { ObservatoryVisual } from './components/ObservatoryVisual';
import { EngineeringCaseStudy } from './components/EngineeringCaseStudy';
import { PersonalProjects } from './components/PersonalProjects';
import { RocketScrollbar } from './components/RocketScrollbar';
import { JourneyProvider } from './components/journey/JourneyProvider';
import { JourneyCopy, JourneyInvitation, JourneyFlightLog } from './components/journey/JourneyCopy';

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
          <JourneyCopy at="top">
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
              <a className="button button-secondary" href={links.resume} download>
                Download résumé <Arrow diagonal />
              </a>
            </div>
            <JourneyInvitation />
          </JourneyCopy>
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
            Engineering
            <br />
            <em>in practice.</em>
          </h2>
          <div className="work-directory" aria-label="Engineering case studies">
            {caseStudies.map((study) => (
              <a href={`#${study.id}`} key={study.id}>
                <span className="mono">{study.number}</span>
                <span>{study.discipline}</span>
                <Arrow diagonal />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="section-shell career-reading" aria-label="Detailed case studies">
        <p className="eyebrow mono">READ THE ENGINEERING DETAILS</p>
        <div className="career-reading-links">
          <a href="/case-studies/python-performance.html">
            Python performance <Arrow diagonal />
          </a>
          <a href="/case-studies/e-invoicing.html">
            E-invoicing application <Arrow diagonal />
          </a>
          <a href="/case-studies/reliable-transport.html">
            Reliable transport over UDP <Arrow diagonal />
          </a>
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
          <JourneyCopy at="experience">
            <h2 id="experience-heading">
              Built on
              <br />
              <em>experience.</em>
            </h2>
            <p>
              From enterprise systems to applied AI. A continuing progression toward deeper, more
              useful engineering.
            </p>
          </JourneyCopy>
        </div>
        <div className="experience-list">
          {experience.map((job, index) => (
            <article className="experience-row" key={job.company}>
              <span className="experience-index" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="experience-entry">
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
              </div>
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
        <div className="about-layout">
          <div className="about-title">
            <JourneyCopy at="about">
              <p className="eyebrow mono">RAGHAV AGARWAL / ENGINEER & EXPLORER</p>
              <h2 id="about-heading">
                Stay curious.
                <br />
                <em>Go deeper.</em>
              </h2>
            </JourneyCopy>
            <ExternalLink className="button button-primary curiosity-link" href={links.curiosity}>
              Unwinding Curiosity
            </ExternalLink>
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
              Outside software, I created Unwinding Curiosity to explore science through articles
              and conversations. The questions change; the impulse to look closer stays the same.
            </p>
            <div className="education">
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
            <span className="eyebrow mono">CAPABILITIES</span>
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
        <JourneyCopy at="contact">
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
        </JourneyCopy>
        <a className="contact-email" href={links.email}>
          {identity.email}
          <Arrow diagonal />
        </a>
        <div className="contact-socials">
          <ExternalLink href={links.linkedin}>Connect on LinkedIn</ExternalLink>
          <ExternalLink href={links.github}>Explore GitHub</ExternalLink>
          <a href={links.resume} download>
            Download résumé
          </a>
        </div>
        <JourneyFlightLog />
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
    <JourneyProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <RocketScrollbar />
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
        <span>Imagery: NASA / JPL-Caltech / MSSS / USGS</span>
        <a href="/image-credits.txt" target="_blank" rel="noopener noreferrer">
          Image credits<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </JourneyProvider>
  );
}
