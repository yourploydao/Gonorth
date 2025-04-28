// components/Footer.js
import React from "react";
import styles from "../styles/footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.footerLogoImage} />
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Explore & Experience</h3>
          <ul className={styles.footerLinks}>
            <li><a href="/explore/mountain-views">Mountain & Scenic Views</a></li>
            <li><a href="/explore/eco-tourism">Nature & Eco Tourism</a></li>
            <li><a href="/explore/cultural-sites">Cultural & Heritage Sites</a></li>
            <li><a href="/explore/cafes">Gardens & Cafés</a></li>
            <li><a href="/explore/adventure">Adventure & Outdoor Activities</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Contact Us</h3>
          <p className={styles.contactInfo}>
            King Mongkut's University of Technology Thonburi<br />
            126 Pracha Uthit Rd,<br />
            Khwaeng Bang Mot,<br />
            Khet Thung Khru, Bangkok 10140
          </p>
        </div>
        
        <div className={styles.footerSection}>
          <p className={styles.contactDetail}>
            Email: athitan.maha@kmutt.ac.th<br />
            Tel: 099-9999999
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;