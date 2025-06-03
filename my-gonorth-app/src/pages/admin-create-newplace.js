import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/admin-create-newplace.module.css";

const AdminCreateDestination = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state with initial empty values for creating new destination
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    description: "",
    briefHistory: "",
    category: "",
    address: "",
    bestSeason: "",
    admissionFeeLocal: "",
    openTime: "",
    closeTime: "",
    parking: "มี",
    images: [], // Array for multiple images
    amenities: {
      baggageStorage: false,
      freeWifi: false,
      toilet: false,
      restaurant: false,
      barOnSite: false,
      souvenirShop: false,
      informationCenter: false,
      shuttleService: false
    },
    accessibility: {
      wheelchairCarPark: false,
      wheelchairEntrance: false,
      wheelchairToilet: false,
      goodForKids: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category, name) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: !prev[category][name]
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.admissionFeeLocal) {
      alert('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Creating new destination:', formData);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities' || key === 'accessibility') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'images') {
          formData[key].forEach((file, index) => {
            submitData.append(`image_${index}`, file);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Mock API call - replace with actual endpoint
      // const response = await fetch('/api/destinations', {
      //   method: 'POST',
      //   body: submitData,
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create destination');
      // }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('สร้างสถานที่ท่องเที่ยวใหม่เรียบร้อยแล้ว!');
      router.push('/admin/destinations');
      
    } catch (error) {
      console.error('Error creating destination:', error);
      alert('เกิดข้อผิดพลาดในการสร้างสถานที่ท่องเที่ยว');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('คุณต้องการยกเลิกการสร้างสถานที่ท่องเที่ยวใหม่หรือไม่? ข้อมูลที่กรอกจะหายไป')) {
      router.push('/admin/destinations');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>สร้างสถานที่ท่องเที่ยวใหม่</h1>
          <p className={styles.pageSubtitle}>เพิ่มสถานที่ท่องเที่ยวใหม่เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className={`${styles.createForm} ${loading ? styles.loading : ''}`}>
          {/* Basic Information Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>ข้อมูลพื้นฐาน</h2>
            <p className={styles.sectionNote}>กรอกข้อมูลพื้นฐานของสถานที่ท่องเที่ยว</p>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label data-required="true">ชื่อสถานที่ท่องเที่ยว</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="เช่น วัดพระธาตุดอยสุเทพ"
                  required
                />
              </div>
              
              <div className={styles.formField}>
                <label>ประเภทสถานที่</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={styles.seasonSelect}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="Nature">ธรรมชาติ</option>
                  <option value="Culture">วัฒนธรรม</option>
                  <option value="Food">อาหาร</option>
                  <option value="Adventure">ผจญภัย</option>
                  <option value="Shopping">ช้อปปิ้ง</option>
                  <option value="Entertainment">บันเทิง</option>
                </select>
              </div>
            </div>

            <div className={styles.formField}>
              <label>ชื่อเรื่องเล่า</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="เช่น วัดพระธาตุดอยสุเทพราชวรวิหาร"
              />
            </div>

            <div className={styles.formField}>
              <label>ประวัติโดยย่อ</label>
              <textarea
                name="briefHistory"
                value={formData.briefHistory}
                onChange={handleInputChange}
                placeholder="กรอกประวัติโดยย่อของสถานที่ท่องเที่ยว เช่น สร้างขึ้นเมื่อใด โดยใคร มีความสำคัญอย่างไร"
                rows={3}
              />
            </div>

            <div className={styles.formField}>
              <label>คำอธิบายสถานที่ท่องเที่ยว</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="อธิบายรายละเอียดของสถานที่ท่องเที่ยว สิ่งที่น่าสนใจ กิจกรรมที่สามารถทำได้"
                rows={4}
              />
            </div>

            <div className={styles.formField}>
              <label>ที่อยู่</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="เช่น ถนนห้วยแก้ว ตำบลสุเทพ อำเภอเมือง จังหวัดเชียงใหม่ 50200"
              />
            </div>

            <div className={styles.formField}>
              <label>ฤดูที่เหมาะสมกับการท่องเที่ยว</label>
              <select
                name="bestSeason"
                value={formData.bestSeason}
                onChange={handleInputChange}
                className={styles.seasonSelect}
              >
                <option value="">เลือกฤดูที่เหมาะสม</option>
                <option value="winter">ฤดูหนาว (พฤศจิกายน - กุมภาพันธ์)</option>
                <option value="summer">ฤดูร้อน (มีนาคม - พฤษภาคม)</option>
                <option value="rainy">ฤดูฝน (มิถุนายน - ตุลาคม)</option>
                <option value="all">ทุกฤดู</option>
              </select>
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>รายละเอียดการเยี่ยมชม</h2>
            <p className={styles.sectionNote}>ข้อมูลเกี่ยวกับเวลาทำการและค่าใช้จ่าย</p>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label data-required="true">ค่าเข้าชมสำหรับคนไทย (บาท)</label>
                <input
                  type="number"
                  name="admissionFeeLocal"
                  value={formData.admissionFeeLocal}
                  onChange={handleInputChange}
                  placeholder="กรอกค่าเข้าชม หรือ 0 ถ้าฟรี"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>เวลาเปิดทำการ</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formField}>
                <label>เวลาปิดทำการ</label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Parking Section */}
            <div className={styles.formField}>
              <label>ที่จอดรถ</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="parking"
                    value="มี"
                    checked={formData.parking === "มี"}
                    onChange={handleInputChange}
                  />
                  <span>มี</span>
                </label>
                
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="parking"
                    value="ไม่มี"
                    checked={formData.parking === "ไม่มี"}
                    onChange={handleInputChange}
                  />
                  <span>ไม่มี</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>รูปภาพสถานที่ท่องเที่ยว</h2>
            <p className={styles.sectionNote}>อัพโหลดรูปภาพที่แสดงความงามของสถานที่ท่องเที่ยว</p>
            
            <div className={styles.formField}>
              <label>อัพโหลดรูปภาพ</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className={styles.imagePreview}>
                <h4>รูปภาพที่เลือก ({formData.images.length} รูป):</h4>
                {formData.images.map((image, index) => (
                  <div key={index} className={styles.imageItem}>
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Preview ${index + 1}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageBtn}
                      title="ลบรูปภาพ"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>สิ่งอำนวยความสะดวก</h2>
            <p className={styles.sectionNote}>เลือกสิ่งอำนวยความสะดวกที่มีในสถานที่ท่องเที่ยว</p>
            
            <div className={styles.checkboxGrid}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.baggageStorage}
                  onChange={() => handleCheckboxChange('amenities', 'baggageStorage')}
                />
                <span>ห้องฝากสัมภาระ</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.freeWifi}
                  onChange={() => handleCheckboxChange('amenities', 'freeWifi')}
                />
                <span>อินเทอร์เน็ตฟรี</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.toilet}
                  onChange={() => handleCheckboxChange('amenities', 'toilet')}
                />
                <span>ห้องน้ำ</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.restaurant}
                  onChange={() => handleCheckboxChange('amenities', 'restaurant')}
                />
                <span>ร้านอาหาร</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.barOnSite}
                  onChange={() => handleCheckboxChange('amenities', 'barOnSite')}
                />
                <span>บาร์ในสถานที่ท่องเที่ยว</span>
              </label>

              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.souvenirShop}
                  onChange={() => handleCheckboxChange('amenities', 'souvenirShop')}
                />
                <span>ร้านขายของที่ระลึก</span>
              </label>

              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.informationCenter}
                  onChange={() => handleCheckboxChange('amenities', 'informationCenter')}
                />
                <span>จุดบริการข้อมูลนักท่องเที่ยว</span>
              </label>

              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.shuttleService}
                  onChange={() => handleCheckboxChange('amenities', 'shuttleService')}
                />
                <span>จุดบริการรถรับส่ง</span>
              </label>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>ความสะดวกในการเข้าถึง</h2>
            <p className={styles.sectionNote}>ข้อมูลสำหรับผู้ที่ต้องการความช่วยเหลือพิเศษ</p>
            
            <div className={styles.checkboxGrid}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairCarPark}
                  onChange={() => handleCheckboxChange('accessibility', 'wheelchairCarPark')}
                />
                <span>ที่จอดรถสำหรับผู้ใช้รถเข็น</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairEntrance}
                  onChange={() => handleCheckboxChange('accessibility', 'wheelchairEntrance')}
                />
                <span>ทางเข้าเหมาะสำหรับผู้ใช้รถเข็น</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairToilet}
                  onChange={() => handleCheckboxChange('accessibility', 'wheelchairToilet')}
                />
                <span>มีห้องน้ำสำหรับผู้ใช้รถเข็น</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.goodForKids}
                  onChange={() => handleCheckboxChange('accessibility', 'goodForKids')}
                />
                <span>เหมาะสำหรับเด็ก</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างสถานที่ท่องเที่ยว'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateDestination;