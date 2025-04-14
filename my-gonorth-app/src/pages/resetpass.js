import { useRouter } from 'next/router';
import React, { useState } from "react";
import styles from "../styles/resetpassword.module.css";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // TODO: reset password logic here
  
      router.push('/login'); // redirect after password reset
    };

  return (
    <div className={styles.container}>
      <div className={styles.resetCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            {/* Logo image would be here */}
            {/* <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.gonorthLogo} /> */}
          </div>
          
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.subtitle}>Your previous password has been reseted.<br></br>Please set a new password for your account.</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>Create Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.fieldInput}
                  />
                  <button 
                    type="button" 
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img 
                      src="https://cdn-icons-png.flaticon.com/128/4855/4855030.png" 
                      alt="Toggle visibility"
                      className={styles.eyeIcon}
                    />
                  </button>
                </div>
            </div>
            
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>Re-enter Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.fieldInput}
                  />
                  <button 
                    type="button" 
                    className={styles.togglePassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <img 
                      src="https://cdn-icons-png.flaticon.com/128/4855/4855030.png" 
                      alt="Toggle visibility"
                      className={styles.eyeIcon}
                    />
                  </button>
                </div>
            </div>

            <button type="submit" className={styles.resetButton}>
                Set password
            </button>
          </form>
        </div>
        
        <div className={styles.imageSection}>
          <div className={styles.slideControls}>
            <button className={`${styles.slideButton} ${styles.active}`}></button>
            <button className={styles.slideButton}></button>
            <button className={styles.slideButton}></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;