import React, { useState } from "react";
import styles from "../styles/signup.module.css";

const SignUp = () => {
  // State variables for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Registration logic here
    if (!agreeTerms) {
      alert("You must agree to the terms and conditions.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const payload = {
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: phoneNumber,
      password: password,
      confirmpassword: confirmPassword,
    };

    try {
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status === "ok") {
        alert(data.message || "Registered successfully!");
        window.location.href = "/login";
      } else {
        alert(data.error || data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.glasses}>
          </div>
          <div className={styles.logo}>
          </div>
          
          <h1 className={styles.title}>ลงทะเบียน</h1>
          <p className={styles.subtitle}>มาเริ่มต้นใช้งานบัญชีของคุณกันเถอะ</p>
          
          <form onSubmit={handleSubmit}>
            {/* First Name and Last Name fields in one row */}
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>ชื่อจริง</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  // placeholder="john"
                  className={styles.fieldInput}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>นามสกุล</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  // placeholder="doe"
                  className={styles.fieldInput}
                />
              </div>
            </div>
            
            {/* Email and Phone Number fields in one row */}
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // placeholder="john.doe@gmail.com"
                  className={styles.fieldInput}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  // placeholder="0000000000"
                  className={styles.fieldInput}
                />
              </div>
            </div>
            
            {/* Password field - full width */}
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>รหัสผ่าน</label>
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
            
            {/* Confirm Password field - full width */}
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>ยืนยันรหัสผ่าน</label>
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
            
            {/* Terms and Conditions checkbox */}
            <div className={styles.termsCheckbox}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className={styles.checkbox} 
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
              ฉันรับทราบและยินยอมตาม <a href="#" className={styles.termsLink}>เงื่อนไข</a> และ <a href="#" className={styles.termsLink}>นโยบายความเป็นส่วนตัว</a>
              </label>
            </div>
            
            {/* Create account button */}
            <button type="submit" className={styles.createButton}>
            สร้างบัญชี
            </button>
          </form>
          
          <div className={styles.loginLink}>
           มีบัญชีอยู่แล้วใช่ไหม? <a href="/login" className={styles.loginAnchor}>เข้าสู่ระบบ</a>
          </div>
          
          <div className={styles.divider}>
            <span className={styles.dividerText}>หรือลงทะเบียนด้วย</span>
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

export default SignUp;