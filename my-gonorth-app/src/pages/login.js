import React, { useState } from "react";
import styles from "../styles/login.module.css";

const Login = () => {
  // เช็ค logo
  // console.log("Logo URL:", logo);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Authentication logic here
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
  
    const payload = { email, password };
  
    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (res.ok && data.message == "Login successful") {
        alert(data.message); 
        localStorage.setItem("token", data.token);
        window.location.href = "/home-after-login";
      } else {
        alert(data.error || data.message || "Login failed"); 
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.glasses}>
            <div className={styles.lens}></div>
            <div className={styles.lens}></div>
            <div className={styles.bridge}></div>
          </div>
          <div className={styles.logo}>
          {/* <img src={require("../assets/gonorth-logo.png")} alt="GONORTH Logo" /> ดึงจาก assets ไม่มา*/}
          </div>
          
          <h1 className={styles.title}>เข้าสู่ระบบ</h1>
          <p className={styles.subtitle}>เข้าสู่ระบบเพื่อเข้าถึงบัญชี Gonorth ของคุณ</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>อีเมล</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                //placeholder="email"
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>รหัสผ่าน</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
                <button 
                  type="button" 
                  className={styles.eyeIcon}
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
            
            <div className={styles.rememberForgot}>
              <div className={styles.remember}>
                <input type="checkbox" id="remember" className={styles.checkbox} />
                <label htmlFor="remember" className={styles.label}>จำฉันไว้ในระบบ</label>
              </div>
              <a href="/forgotpassword" className={styles.forgotPassword}>ลืมรหัสผ่าน</a>
            </div>
            
            <button type="submit" className={styles.loginButton}>
              เข้าสู่ระบบ
            </button>
          </form>
          
          <div className={styles.noAccount}>
          ยังไม่มีบัญชีใช่ไหม? <a href="/signup" className={styles.signUp}>ลงทะเบียน</a>
          </div>
          
          <div className={styles.divider}>
            <span className={styles.dividerText}>หรือเข้าสู่ระบบด้วย</span>
          </div>
          
          <div className={styles.socialLogin}>
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

export default Login;
