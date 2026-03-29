import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiBookOpen, FiTarget, FiTerminal, FiShield, FiFileText, FiMenu, FiX, FiHome } from 'react-icons/fi';

const links = [
  { to: '/', label: 'Home', icon: <FiHome /> },
  { to: '/theory', label: 'Theory', icon: <FiBookOpen /> },
  { to: '/cases', label: 'Case Studies', icon: <FiFileText /> },
  { to: '/labs', label: 'Labs', icon: <FiTarget /> },
  { to: '/demos', label: 'Demos', icon: <FiTerminal /> },
  { to: '/defense', label: 'Defense', icon: <FiShield /> },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}
      <nav className="navbar" ref={navRef}>
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">CS</span>
          <span>CSEC <span className="brand-accent">// Supply Chain</span></span>
        </Link>
        <ul className={`navbar-links${open ? ' open' : ''}`}>
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={pathname === l.to ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                {l.icon} {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </nav>
    </>
  );
}
