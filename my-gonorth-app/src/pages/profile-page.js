import { useState, useRef } from "react";
import styles from "../styles/profile-page.module.css";

const UserProfile = () => {
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@gmail.com");
  const [phone, setPhone] = useState("0000000000");
  const [profileImage, setProfileImage] = useState("/assets/profile-placeholder.png");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPassword, setTempPassword] = useState("");
  const [tempConfirmPassword, setTempConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [tempPhone, setTempPhone] = useState(phone);
  
  const fileInputRef = useRef(null);

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveUsername = () => {
    setUsername(tempUsername);
    setIsEditingUsername(false);
  };

  const handleSaveEmail = () => {
    setEmail(tempEmail);
    setIsEditingEmail(false);
  };

  const handleSavePassword = () => {
    // Here you would typically validate the password and send to backend
    setIsEditingPassword(false);
    setTempPassword("");
    setTempConfirmPassword("");
    setCurrentPassword("");
  };

  const handleSavePhone = () => {
    setPhone(tempPhone);
    setIsEditingPhone(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Profile Banner */}
        <section className={styles.profileBanner}>
          <div className={styles.colorBanner}></div>
          <div className={styles.profileImageContainer}>
            <div className={styles.profileImageLarge}>
              <img src={profileImage} alt="Profile" />
            </div>
            <button className={styles.uploadPhotoBtn} onClick={triggerFileInput}>
              <span className={styles.cameraIcon}></span> อัปโหลดรูปใหม่
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePicChange} 
              className={styles.fileInput} 
              accept="image/*"
            />
          </div>
        </section>

        {/* User Info */}
        <section className={styles.userInfoSection}>
          <h1 className={styles.userName}>{username}</h1>
          <p className={styles.userEmail}>{email}</p>
        </section>

        {/* Account Details */}
        <section className={styles.accountSection}>
          <h2 className={styles.sectionTitle}>บัญชีผู้ใช้</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>ชื่อบัญชีผู้ใช้</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{username}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingUsername(true)}>แก้ไข</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ที่อยู่อีเมล</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{email}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingEmail(true)}>แก้ไข</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>รหัสผ่าน</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>••••••••••</span>
              <button className={styles.changeButton} onClick={() => setIsEditingPassword(true)}>แก้ไข</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>เบอร์โทรศัพท์</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{phone}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingPhone(true)}>แก้ไข</button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Popups for Editing */}
      {isEditingUsername && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>เปลี่ยนชื่อผู้ใช้</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>ชื่อบัญชีผู้ใช้ใหม่</label>
              <input 
                type="text" 
                value={tempUsername} 
                onChange={(e) => setTempUsername(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingUsername(false)}>ยกเลิก</button>
              <button className={styles.modalSave} onClick={handleSaveUsername}>บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}

      {isEditingEmail && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>แก้ไขที่อยู่อีเมล</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>อีเมลใหม่</label>
              <input 
                type="email" 
                value={tempEmail} 
                onChange={(e) => setTempEmail(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingEmail(false)}>ยกเลิก</button>
              <button className={styles.modalSave} onClick={handleSaveEmail}>บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}

      {isEditingPassword && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>เปลี่ยนรหัสผ่าน</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>รหัสผ่านปัจจุบัน</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className={styles.modalInput} 
              />
              
              <label className={styles.modalLabel}>รหัสผ่านใหม่</label>
              <input 
                type="password" 
                value={tempPassword} 
                onChange={(e) => setTempPassword(e.target.value)} 
                className={styles.modalInput} 
              />
              
              <label className={styles.modalLabel}>ยืนยันการตั้งรหัสผ่านใหม่</label>
              <input 
                type="password" 
                value={tempConfirmPassword} 
                onChange={(e) => setTempConfirmPassword(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingPassword(false)}>ยกเลิก</button>
              <button className={styles.modalSave} onClick={handleSavePassword}>บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}

      {isEditingPhone && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>เปลี่ยนหมายเลขโทรศัพท์</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>หมายเลขโทรศัพท์ใหม่</label>
              <input 
                type="tel" 
                value={tempPhone} 
                onChange={(e) => setTempPhone(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingPhone(false)}>ยกเลิก</button>
              <button className={styles.modalSave} onClick={handleSavePhone}>บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;