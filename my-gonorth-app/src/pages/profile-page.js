import { useState, useRef, useEffect } from "react";
import styles from "../styles/profile-page.module.css";
import Header from "../components/navigation";

const UserProfile = () => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [tempConfirmPassword, setTempConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const res = await fetch("http://localhost:8080/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
        });

        if (res.ok) {
            const data = await res.json();
            console.log("User profile:", data);
            setUser(data.user);
          } else {
            console.error("Failed to fetch user profile");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setTempUsername(`${user.firstname} ${user.lastname}`);
      setTempEmail(user.email);
      setTempPhone(user.phone);
    }
  }, [user]);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:8080/change-profileimage', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        const errorMessage = contentType?.includes('application/json')
          ? (await response.json()).error
          : await response.text();
        throw new Error(errorMessage || 'Upload failed');
      }

      const data = await response.json();
      console.log('Uploaded image URL:', data.image_url);

      setUser((prevUser) => ({
        ...prevUser,
        profileImage: data.image_url,
      }));

    } catch (error) {
      console.error('Error uploading image:', error.message);
      alert(`Upload failed: ${error.message}`);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveUsername = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    const [firstname, ...lastnameParts] = tempUsername.trim().split(" ");
    const lastname = lastnameParts.join(" ");

    try {
      const res = await fetch("http://localhost:8080/change-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ firstname, lastname }),
      });

      if (res.ok) {
        alert("Username updated successfully!");
        setIsEditingUsername(false);
        setUser(prev => ({ ...prev, firstname, lastname }));
      } else {
        const data = await res.json();
        alert(`Failed to update name: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  const handleSaveEmail = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: tempEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Email updated successfully!");
        setIsEditingEmail(false);
        setUser(prev => ({ ...prev, email: tempEmail }));
      } else {
        alert(`Failed to update email: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  const handleSavePassword = async () => {
    if (tempPassword !== tempConfirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (!currentPassword.trim()) {
      alert("Please enter your current password.");
      return;
    }

    if (!tempPassword.trim()) {
      alert("Please enter a new password.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: tempPassword,
        }),
      });

      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { error: responseText };
      }

      if (res.ok) {
        alert("Password updated successfully!");
        setIsEditingPassword(false);
        setTempPassword("");
        setTempConfirmPassword("");
        setCurrentPassword("");
      } else if (res.status === 401) {
        alert("Authentication failed. Current password is incorrect.");
      } else {
        alert(`Failed to update password: ${responseData.error || responseText}`);
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  const handleSavePhone = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/change-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: tempPhone }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Phone number updated successfully!");
        setIsEditingPhone(false);
        setUser(prev => ({ ...prev, phone: tempPhone }));
      } else {
        alert(`Failed to update phone: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
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
              <img
                src={user?.profileImage}
                alt={`${user?.firstname} ${user?.lastname}`}
                className={styles.profileImage}
              />
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
          <h1 className={styles.userName}>{user?.firstname} {user?.lastname}</h1>
          <p className={styles.userEmail}>{user?.email}</p>
        </section>

        {/* Account Details */}
        <section className={styles.accountSection}>
          <h2 className={styles.sectionTitle}>Account</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{user?.firstname} {user?.lastname}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingUsername(true)}>Change</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{user?.email}</span>
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
              <span className={styles.value}>{user?.phone}</span>
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