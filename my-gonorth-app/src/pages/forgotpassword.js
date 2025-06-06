import { useRouter } from 'next/router';
import React, { useState } from "react";
import styles from "../styles/forgotpass.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting email:", email); // เพิ่มบรรทัดนี้
  
    try {
      const res = await fetch("http://localhost:8080/forgotpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
    
      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response OK:", res.ok);
      console.log("Response data:", data);
    
      if (res.ok && data.status === "ok") {
        console.log("Conditions met, redirecting..."); // เพิ่มบรรทัดนี้
        localStorage.setItem("forgotPasswordEmail", email);
        router.push("/verifycode"); 
      } else {
        console.error("Failed to send reset code:", data.error || "Something went wrong.");
        console.log("res.ok:", res.ok, "data.status:", data.status); // เพิ่มบรรทัดนี้
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.recoveryCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
          </div>
          
          <div className={styles.backLink}>
            <a href="/login"><span className={styles.backArrow}>&#8249;</span> กลับไปที่หน้าเข้าสู่ระบบ</a>
          </div>
          
          <h1 className={styles.title}>ลืมรหัสผ่านใช่ไหม?</h1>
          <p className={styles.subtitle}>ไม่ต้องกังวล เรื่องนี้เกิดขึ้นได้กับทุกคน<br></br>กรอกอีเมลของคุณด้านล่างเพื่อกู้คืนรหัสผ่าน</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>อีเมล</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.fieldInput}
                />
            </div>

            <button type="submit" className={styles.submitButton}>
            ส่งคำขอ
            </button>
          </form>
          
          <div className={styles.divider}>
            <span className={styles.dividerText}>หรือเข้าสู่ระบบด้วย</span>
          </div>
          
          <div className={styles.socialButtons}>
            <button className={styles.socialButton}>
              <img 
                src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png" 
                alt="Facebook" 
                className={styles.socialIcon} 
              />
            </button>
            <button className={styles.socialButton}>
              <img 
                src="https://cdn-icons-png.flaticon.com/128/2702/2702602.png" 
                alt="Google" 
                className={styles.socialIcon} 
              />
            </button>
            <button className={styles.socialButton}>
              <img 
                src="https://cdn-icons-png.flaticon.com/128/731/731985.png" 
                alt="Apple" 
                className={styles.socialIcon} 
              />
            </button>
          </div>
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

export default ForgotPassword;