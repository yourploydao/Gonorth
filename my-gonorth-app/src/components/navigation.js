// components/Header.js
import React, { useEffect, useState } from "react";
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
      </div>
    </header>
  );
};

export default Header;