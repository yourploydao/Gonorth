// components/Header.js
import React from "react";
import styles from "../styles/navigation.module.css";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleLogoClick = () => {
    router.push('/home-after-login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={handleLogoClick}>
        <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.logoImage} />
      </div>
      <div className={styles.headerButtons}>
        <a href="/favourites" className={styles.favouritesButton}>
          <img 
            src="https://cdn-icons-png.flaticon.com/128/2550/2550290.png" 
            alt="Heart" 
            className={styles.heartIcon} 
          /> Favourites
        </a>
        {/* Divider between favourites and profile */}
        <div className={styles.headerDivider}></div>
        <div className={styles.userProfile} onClick={handleProfileClick}>
          <img src="/assets/Profile.jpg" alt="John D." className={styles.profileImage} />
          <span className={styles.profileName}>John D.</span>
        </div>
      </div>
    </header>
  );
};

export default Header;