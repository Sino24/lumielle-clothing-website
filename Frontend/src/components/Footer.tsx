// src/components/Footer/Footer.tsx

import { Link } from "react-router-dom";
import "../styles/ComponentStyle/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand + Newsletter */}
        <div>
          <h3 className="footer__brand-name">
            Lumi<em>elle</em>
          </h3>
          <p className="footer__brand-tagline">
            Clothing crafted for those who find beauty in stillness. Ethically made, endlessly wearable.
          </p>
          <div className="footer__newsletter">
            <input type="email" placeholder="Your email address" aria-label="Email for newsletter" />
            <button type="button">Subscribe</button>
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="footer__col-title">Shop</p>
          <ul className="footer__col-links">
            <li><Link to="/product">Collections</Link></li>
            <li><Link to="/sale">Sale</Link></li>
      
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="footer__col-title">Info</p>
          <ul className="footer__col-links">
            <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/terms">Terms And Conditions</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <p className="footer__col-title">Help</p>
          <ul className="footer__col-links">
    
            <li><Link to="/size-guide">Size Guide</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          © 2026 Lumielle. All rights reserved.
        </p>

        <div className="footer__socials">
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-link"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>

          {/* Pinterest */}
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-link"
            aria-label="Pinterest"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.4 1.27-5.4s-.32-.65-.32-1.61c0-1.5.87-2.63 1.96-2.63.92 0 1.37.7 1.37 1.53 0 .93-.59 2.32-.9 3.61-.26 1.08.53 1.96 1.58 1.96 1.9 0 3.19-2.44 3.19-5.34 0-2.2-1.49-3.74-3.63-3.74-2.47 0-3.92 1.85-3.92 3.77 0 .75.29 1.55.65 1.99.07.09.08.17.06.26-.07.27-.21.87-.24.99-.04.16-.13.19-.3.12-1.12-.52-1.82-2.16-1.82-3.48 0-2.83 2.06-5.43 5.93-5.43 3.11 0 5.53 2.22 5.53 5.19 0 3.1-1.95 5.59-4.65 5.59-.91 0-1.76-.47-2.05-1.03l-.56 2.08c-.2.78-.75 1.75-1.12 2.34.85.26 1.74.4 2.67.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-link"
            aria-label="TikTok"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;