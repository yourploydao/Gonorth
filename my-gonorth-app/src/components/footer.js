import React, { useState, useEffect } from "react";
import styles from "../styles/footer.module.css";
import { useRouter } from "next/router";

const Footer = () => {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  // จัดการ router events เพื่อป้องกันการหดขยาย
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsRouting(true);
    };

    const handleRouteChangeComplete = () => {
      setTimeout(() => setIsRouting(false), 200);
    };

    const handleRouteChangeError = () => {
      setTimeout(() => setIsRouting(false), 200);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  // ฟังก์ชันสำหรับจัดการการคลิกลิงก์
  const handleLinkClick = (e, href) => {
    if (isRouting) {
      e.preventDefault();
      return;
    }
    setIsRouting(true);
    
    // ใช้ router.push แทน href ปกติ
    e.preventDefault();
    router.push(href).finally(() => {
      setTimeout(() => setIsRouting(false), 200);
    });
  };

  const handleLogoClick = (e) => {
    if (isRouting) {
      e.preventDefault();
      return;
    }
    setIsRouting(true);
    
    e.preventDefault();
    router.push('/home-after-login').finally(() => {
      setTimeout(() => setIsRouting(false), 200);
    });
  };

  return (
    <footer className={`${styles.footer} ${isRouting ? styles.footerTransitioning : ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <a 
            href="/home-after-login" 
            onClick={handleLogoClick}
            style={{ cursor: isRouting ? 'not-allowed' : 'pointer' }}
          >
            <img 
              src="/assets/gonorth-logo.png" 
              alt="GONORTH" 
              className={styles.footerLogoImage}
              loading="lazy" // เพิ่ม lazy loading
            />
          </a>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>ค้นหาและสัมผัสประสบการณ์</h3>
          <ul className={styles.footerLinks}>
            <li>
              <a 
                href="/explore/mountain-views" 
                onClick={(e) => handleLinkClick(e, '/explore/mountain-views')}
                style={{ cursor: isRouting ? 'not-allowed' : 'pointer' }}
              >
                ภูเขาและวิวทิวทัศน์ที่สวยงาม
              </a>
            </li>
            <li>
              <a 
                href="/explore/eco-tourism" 
                onClick={(e) => handleLinkClick(e, '/explore/eco-tourism')}
                style={{ cursor: isRouting ? 'not-allowed' : 'pointer' }}
              >
                การท่องเที่ยวเชิงธรรมชาติและนิเวศ
              </a>
            </li>
            <li>
              <a 
                href="/explore/cultural-sites" 
                onClick={(e) => handleLinkClick(e, '/explore/cultural-sites')}
                style={{ cursor: isRouting ? 'not-allowed' : 'pointer' }}
              >
                สถานที่ทางวัฒนธรรมและมรดก
              </a>
            </li>
            <li>
              <a 
                href="/explore/cafes" 
                onClick={(e) => handleLinkClick(e, '/explore/cafes')}
                style={{ cursor: isRouting ? 'not-allowed' : 'pointer' }}
              >
                สวนสวยและร้านกาแฟ
              </a>
            </li>
            <li>
              <a 
                href="/explore/adventure" 
                onClick={(e) => handleLinkClick(e, '/explore/adventure')}
                style={{ cursor: isRouting ? 'not-allowed' : 'pointer' }}
              >
                กิจกรรมแนวผจญภัยและกิจกรรมกลางแจ้ง
              </a>
            </li>
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