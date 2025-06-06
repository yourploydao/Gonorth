import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import styles from "../styles/resetpassword.module.css";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { reset_code } = router.query;
    const [email, setEmail] = useState("");

    useEffect(() => {
      if (!router.isReady) return;
    
      const storedEmail = localStorage.getItem("forgotPasswordEmail");
      if (!storedEmail) {
        console.error("No email found. Please go back to Forgot Password page.");
        router.push("/forgotpassword");
        return;
      }
    
      setEmail(storedEmail);
    
      if (!reset_code) {
        console.error("Invalid reset code.");
        router.push("/forgotpassword");
      }
    }, [router.isReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reset_code) {
      console.error("Invalid reset code.");
      return;
    }
    
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8080/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          code: atob(reset_code), // decode เป็นรหัสจริง
          new_password: password,
        }),
      });
    
      const data = await res.json();
    
      if (res.ok && data.message === "Password reset successful") {
        router.push("/login");
      } else {
        console.error("Failed to reset password:", data.error);
      }
    } catch (err) {
      console.error("Error resetting password:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.resetCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
          </div>
          
          <h1 className={styles.title}>ตั้งรหัสผ่านใหม่</h1>
          <p className={styles.subtitle}>รหัสผ่านเดิมของคุณถูกรีเซ็ตแล้ว<br></br>โปรดตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>สร้างรหัสผ่านใหม่</label>
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
                    src={
                      showPassword
                      ? "https://cdn-icons-png.flaticon.com/128/2767/2767194.png" // show password icon
                      : "https://cdn-icons-png.flaticon.com/128/4855/4855030.png" // hide password icon
                    }
                    alt="Toggle password visibility"
                    width="20"
                    height="20"
                  />
                  </button>
                </div>
            </div>
            
            <div className={styles.formField}>
                <label className={styles.fieldLabel}>ยืนยันรหัสผ่านใหม่</label>
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
                    src={
                      showConfirmPassword  // เปลี่ยนจาก showPassword เป็น showConfirmPassword
                      ? "https://cdn-icons-png.flaticon.com/128/2767/2767194.png" // show password icon
                      : "https://cdn-icons-png.flaticon.com/128/4855/4855030.png" // hide password icon
                    }
                    alt="Toggle password visibility"
                    width="20"
                    height="20"
                  />
                  </button>
                </div>
            </div>

            <button type="submit" className={styles.resetButton}>
            ตั้งรหัสผ่าน
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