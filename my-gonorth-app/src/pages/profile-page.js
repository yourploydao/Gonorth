import { useState, useRef } from "react";
import styles from "../styles/profile-page.module.css";
import Header from "../components/navigation";

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
    {/* Use the Header component */}
    <Header />

      <div className={styles.mainContent}>
        {/* Profile Banner */}
        <section className={styles.profileBanner}>
          <div className={styles.colorBanner}></div>
          <div className={styles.profileImageContainer}>
            <div className={styles.profileImageLarge}>
              <img src={profileImage} alt="Profile" />
            </div>
            <button className={styles.uploadPhotoBtn} onClick={triggerFileInput}>
              <span className={styles.cameraIcon}></span> Upload new photo
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
          <h2 className={styles.sectionTitle}>Account</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{username}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingUsername(true)}>Change</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{email}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingEmail(true)}>Change</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>••••••••••</span>
              <button className={styles.changeButton} onClick={() => setIsEditingPassword(true)}>Change</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone number</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{phone}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingPhone(true)}>Change</button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Popups for Editing */}
      {isEditingUsername && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Change Username</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>New Username</label>
              <input 
                type="text" 
                value={tempUsername} 
                onChange={(e) => setTempUsername(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingUsername(false)}>Cancel</button>
              <button className={styles.modalSave} onClick={handleSaveUsername}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {isEditingEmail && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Change Email</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>New Email</label>
              <input 
                type="email" 
                value={tempEmail} 
                onChange={(e) => setTempEmail(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingEmail(false)}>Cancel</button>
              <button className={styles.modalSave} onClick={handleSaveEmail}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {isEditingPassword && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Change Password</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className={styles.modalInput} 
              />
              
              <label className={styles.modalLabel}>New Password</label>
              <input 
                type="password" 
                value={tempPassword} 
                onChange={(e) => setTempPassword(e.target.value)} 
                className={styles.modalInput} 
              />
              
              <label className={styles.modalLabel}>Confirm New Password</label>
              <input 
                type="password" 
                value={tempConfirmPassword} 
                onChange={(e) => setTempConfirmPassword(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingPassword(false)}>Cancel</button>
              <button className={styles.modalSave} onClick={handleSavePassword}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {isEditingPhone && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Change Phone Number</h3>
            <div className={styles.modalContent}>
              <label className={styles.modalLabel}>New Phone Number</label>
              <input 
                type="tel" 
                value={tempPhone} 
                onChange={(e) => setTempPhone(e.target.value)} 
                className={styles.modalInput} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setIsEditingPhone(false)}>Cancel</button>
              <button className={styles.modalSave} onClick={handleSavePhone}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.footerLogoImage} />
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Explore & Experience</h3>
            <ul className={styles.footerLinks}>
              <li><a href="/explore/mountain-views">Mountain & Scenic Views</a></li>
              <li><a href="/explore/eco-tourism">Nature & Eco Tourism</a></li>
              <li><a href="/explore/cultural-sites">Cultural & Heritage Sites</a></li>
              <li><a href="/explore/cafes">Gardens & Cafés</a></li>
              <li><a href="/explore/adventure">Adventure & Outdoor Activities</a></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>Contact Us</h3>
            <p className={styles.contactInfo}>
              King Mongkut's University of Technology Thonburi<br />
              126 Pracha Uthit Rd,<br />
              Khwaeng Bang Mot,<br />
              Khet Thung Khru, Bangkok 10140
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <p className={styles.contactDetail}>
              Email: athitan.maha@kmutt.ac.th<br />
              Tel: 099-9999999
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;