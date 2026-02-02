export default function Footer() {
  return (
    <footer className="lk-footer">
      <div className="lk-footer__inner">
        <div>
          <div className="lk-footer__brand">LUKAIRO</div>
          <p>Revenue systems. Fully managed.</p>
        </div>
        <div className="lk-footer__links">
          <a href="#services">Services</a>
          <a href="#platform">Platform</a>
          <a href="#process">Process</a>
          <a href="#chat">Contact</a>
        </div>
      </div>
      <div className="lk-footer__meta">© {new Date().getFullYear()} LUKAIRO. All rights reserved.</div>
    </footer>
  );
}
