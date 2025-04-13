import { useRouter } from 'next/router';
import React, { useState } from "react";
import styles from "../styles/verifycode.module.css";

const VerifyCode = () => {
    const [code, setCode] = useState("");
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // TODO: verify code logic here
  
      router.push('/resetpass'); // redirect after verification
    };

  return (
    <div className={styles.container}>
      <div className={styles.verifyCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            {/* Logo image would be here */}
            {/* <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.gonorthLogo} /> */}
          </div>
          
          <h1 className={styles.title}>Verify code</h1>
          <p className={styles.subtitle}>An authentication code has been sent to your email.</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>Enter Code</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    // placeholder="7789BM6X"
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
            
            <div className={styles.resendWrapper}>
              <p className={styles.resendText}>Didn't receive a code? <a href="#" className={styles.resendLink}>Resend</a></p>
            </div>

            <button type="submit" className={styles.verifyButton}>
                Verify
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

export default VerifyCode;