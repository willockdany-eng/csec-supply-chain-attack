import { Link } from 'react-router-dom';
import { FiBookOpen, FiTarget, FiTerminal, FiShield, FiFileText, FiArrowRight } from 'react-icons/fi';

const sections = [
  {
    to: '/theory',
    icon: <FiBookOpen />,
    color: 'cyan',
    title: 'Theory & Concepts',
    desc: 'Interactive slide presentation covering attack taxonomy, MITRE ATT&CK mapping, dependency confusion, typosquatting, CI/CD attacks, and the kill chain.',
    tag: '12 slides',
  },
  {
    to: '/cases',
    icon: <FiFileText />,
    color: 'purple',
    title: 'Real-World Case Studies',
    desc: 'Deep dives into SolarWinds, event-stream, Codecov, Lottie Player, and TeamPCP/Trivy with timelines, technical details, and impact analysis.',
    tag: '5 cases ',
  },
  {
    to: '/labs',
    icon: <FiTarget />,
    color: 'green',
    title: 'Hands-On Labs',
    desc: 'Step-by-step walkthrough guides for TryHackMe Supply Chain Attack: Lottie room and PortSwigger Web Cache Poisoning labs.',
    tag: '3 labs ',
  },
  {
    to: '/demos',
    icon: <FiTerminal />,
    color: 'amber',
    title: 'Live Demos',
    desc: 'Run dependency confusion and malicious postinstall hook simulations live. See how attackers weaponize package managers.',
    tag: '3 demos ',
  },
  {
    to: '/defense',
    icon: <FiShield />,
    color: 'red',
    title: 'Defense & Mitigation',
    desc: 'Comprehensive cheat sheet of defensive measures: pinning, SRI, SBOM, CI/CD hardening, incident response playbook, and quick command reference.',
    tag: 'cheatsheet ',
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-badge">CSEC Cybersecurity Club..</div>
        
        <h1>
          <span className="gradient-text">Supply Chain</span><br />Attacks
        </h1>
        <p className="hero-subtitle">
          A comprehensive deep-dive into how adversaries compromise the software supply chain
          &mdash; from theory to real-world case studies to hands-on exploitation.
        </p>
        <div className="hero-actions">
          <Link to="/theory" className="btn btn-primary">
            Start Session <FiArrowRight />
          </Link>
          <Link to="/labs" className="btn btn-outline">
            Jump to Labs
          </Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-value">5</span>
            <span className="stat-label">Attack Types</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">5</span>
            <span className="stat-label">Case Studies</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">3</span>
            <span className="stat-label">Hands-On Labs</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">3</span>
            <span className="stat-label">Live Demos</span>
          </div>
        </div>
      </section>

      <section className="home-sections">
        <div className="section-grid">
          {sections.map(s => (
            <Link to={s.to} className="section-card" key={s.to}>
              <div className={`card-icon ${s.color}`}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="card-tag">{s.tag}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
