export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">CSEC CYBERSECURITY CLUB</div>
      <div>Supply Chain Attack Session &copy; {new Date().getFullYear()}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Developed by Abudi_47</div>
    </footer>
  );
}
