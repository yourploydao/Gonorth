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
          
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Login to access your Gonorth account</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
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
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  //placeholder="pass"
                  required
                  className={styles.input}
                />
                <button 
                  type="button" 
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img 
                    src="https://cdn-icons-png.flaticon.com/128/4855/4855030.png" 
                    alt="Toggle password visibility"
                    width="20"
                    height="20"
                    //ใส่ icon ตาเปิดเพิ่ม
                  />
                </button>
              </div>
            </div>
            
            <div className={styles.rememberForgot}>
              <div className={styles.remember}>
                <input type="checkbox" id="remember" className={styles.checkbox} />
                <label htmlFor="remember" className={styles.label}>Remember me</label>
              </div>
              <a href="/forgotpass" className={styles.forgotPassword}>Forgot Password</a>
            </div>
            
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
          
          <div className={styles.noAccount}>
            Don't have an account? <a href="/signup" className={styles.signUp}>Sign up</a>
          </div>
          
          <div className={styles.divider}>
            <span className={styles.dividerText}>Or login with</span>
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
