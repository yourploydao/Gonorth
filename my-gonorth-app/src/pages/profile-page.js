import { useState, useRef, useEffect } from "react";
import styles from "../styles/profile-page.module.css";

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
          <h1 className={styles.userName}>{user?.firstname} {user?.lastname}</h1>
          <p className={styles.userEmail}>{user?.email}</p>
        </section>

        {/* Account Details */}
        <section className={styles.accountSection}>
          <h2 className={styles.sectionTitle}>บัญชีผู้ใช้</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>ชื่อบัญชีผู้ใช้</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{user?.firstname} {user?.lastname}</span>
              <button className={styles.changeButton} onClick={() => setIsEditingUsername(true)}>แก้ไข</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ที่อยู่อีเมล</label>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{user?.email}</span>
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
              <span className={styles.value}>{user?.phone}</span>
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