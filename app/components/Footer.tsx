import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Papelería Lady Laura</h3>
          <p>Tu aliado en útiles escolares y de oficina desde 2025</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/cart">Carrito</Link>
            </li>
            <li>
              <Link href="/quotes">Cotizaciones</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <ul className="contact-list">
            <li>
              <EmailIcon fontSize="small" />
              <span>info@papelerialadylaura.com</span>
            </li>
            <li>
              <PhoneIcon fontSize="small" />
              <span>+593 984677140</span>
            </li>
            <li>
              <LocationOnIcon fontSize="small" />
              <span>Calle Principal #123</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="Twitter">
              <TwitterIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Papelería Lady Laura. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
