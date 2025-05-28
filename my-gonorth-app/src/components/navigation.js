import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/navigation.module.css";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const res = await fetch("http://localhost:8080/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
        });

        if (res.ok) {
            const data = await res.json();
            console.log("User profile:", data);
            setUser(data.user); // backend ควรส่ง: { user: { firstname, lastname, profileImage } }
          } else {
            console.error("Failed to fetch user profile");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };

    fetchProfile();
  }, []);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const dropdownRef = useRef(null);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogoClick = () => {
    setIsRouting(true);
    setShowDropdown(false);
    router.push('/home-after-login').finally(() => {
      setTimeout(() => setIsRouting(false), 100);
    });
  };

  const handleMyAccountClick = () => {
    setIsRouting(true);
    setShowDropdown(false);
    router.push('/profile-page').finally(() => {
      setTimeout(() => setIsRouting(false), 100);
    });
  };

  const handleLogout = () => {
    setIsRouting(true);
    setShowDropdown(false);
    // ใส่โค้ดสำหรับ logout ที่นี่
    router.push('/login').finally(() => {
      setTimeout(() => setIsRouting(false), 100);
    });
  };

  // ปิด dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ปิด dropdown เมื่อเปลี่ยนหน้า
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setShowDropdown(false);
      setIsRouting(true);
    };
    
    const handleRouteChangeComplete = () => {
      setTimeout(() => setIsRouting(false), 100);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <header className={`${styles.header} ${isRouting ? styles.headerTransitioning : ''}`}>
      <div className={styles.logo} onClick={handleLogoClick}>
        <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.logoImage} />
      </div>
      <div className={styles.headerButtons}>
        <a href="/favourites" className={styles.favouritesButton}>
          <img 
            src="https://cdn-icons-png.flaticon.com/128/2550/2550290.png" 
            alt="Heart" 
            className={styles.heartIcon} 
          /> รายการโปรด
        </a>
        {/* Divider between favourites and profile */}
        <div className={styles.headerDivider}></div>
        <div className={styles.userProfileContainer} ref={dropdownRef}>
          {user && (
          <div className={styles.userProfile} onClick={handleProfileClick}>
            <img
              src={user.profileImage}
              alt={`${user.firstname} ${user.lastname}`}
              className={styles.profileImage}
            />
            <span className={styles.profileName}>
              {user.firstname} {user.lastname} 
            </span>
          </div>
        )}
          
          {showDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <img src="/assets/Profile.jpg" alt="John Doe" className={styles.dropdownProfileImage} />
                <div className={styles.profileInfo}>
                  <h3 className={styles.profileFullName}>John Doe.</h3>
                </div>
              </div>
              
              <div className={styles.dropdownDivider}></div>
              
              <div className={styles.dropdownItem} onClick={handleMyAccountClick}>
                <div className={styles.dropdownIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span>บัญชีของฉัน</span>
                <div className={styles.arrowIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </div>
              
              <div className={styles.dropdownDivider}></div>
              
              <div className={styles.dropdownItem} onClick={handleLogout}>
                <div className={styles.dropdownIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </div>
                <span>ออกจากระบบ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;