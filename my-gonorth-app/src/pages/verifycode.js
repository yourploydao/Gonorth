import { useRouter } from 'next/router';
import React, { useState } from "react";
import styles from "../styles/verifycode.module.css";

const VerifyCode = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    // ดึง email จาก localStorage
    const savedEmail = localStorage.getItem("forgotPasswordEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      alert("No email found. Please go back to Forgot Password page.");
      router.push("/forgotpassword");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/verifycode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: code }),
      });

      const data = await res.json();

      if (res.ok && data.message === "Code verified") {
        alert("Verified! You can now reset your password.");
        const encodedCode = btoa(code); // base64 encode
        router.push(`/resetpassword?reset_code=${encodedCode}`);
      } else {
        alert(data.error || "Invalid code.");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
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