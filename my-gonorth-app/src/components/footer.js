import React from "react";
import styles from "../styles/footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
        <a href="/home-after-login">
          <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.footerLogoImage} />
        </a>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>ค้นหาและสัมผัสประสบการณ์</h3>
          <ul className={styles.footerLinks}>
            <li><a href="/explore/mountain-views">ภูเขาและวิวทิวทัศน์ที่สวยงาม</a></li>
            <li><a href="/explore/eco-tourism">การท่องเที่ยวเชิงธรรมชาติและนิเวศ</a></li>
            <li><a href="/explore/cultural-sites">สถานที่ทางวัฒนธรรมและมรดก</a></li>
            <li><a href="/explore/cafes">สวนสวยและร้านกาแฟ</a></li>
            <li><a href="/explore/adventure">กิจกรรมแนวผจญภัยและกิจกรรมกลางแจ้ง</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>ติดต่อเรา</h3>
          <p className={styles.contactInfo}>
            มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี<br />
            เลขที่ 126 ถนนประชาอุทิศ <br />
            แขวงบางมด<br />
            เขตทุ่งครุ กรุงเทพมหานคร 10140
          </p>
        </div>
        
        <div className={styles.footerSection}>
          <p className={styles.contactDetail}>
          อีเมล: athitan.maha@kmutt.ac.th<br />
          โทร: 099-9999999
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;