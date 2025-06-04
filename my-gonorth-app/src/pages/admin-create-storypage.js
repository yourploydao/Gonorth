import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "../styles/admin-create-storypage.module.css";
import 'leaflet/dist/leaflet.css';


// Dynamic import สำหรับ MapSelector
const MapSelector = dynamic(() => import("../components/map-selector.js"), {
  ssr: false, // ปิดการโหลดในฝั่ง Server
});

const AdminCreateDestination = () => {
  const router = useRouter();
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState('');
  const [drivingTimeMinutes, setDrivingTimeMinutes] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    history: "",
    tags: "",
    activities: "",
    address: "",
    bestSeason: "",
    latitude: "",
    longitude: "",
    budget_range: "", // เพิ่ม budget
    admissionFee: "",
    distance: "",
    drivingTime: "",
    openTime: "",
    closeTime: "",
    parking: "มี",
    parkingDetails: "",
    images: [],
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

  // ฟังก์ชันคำนวณระยะทางแบบเส้นตรง
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ฟังก์ชันจัดการเมื่อเลือกตำแหน่งบนแผนที่
  const handleMapSelect = (lat, lng, routeInfo) => {
    // พิกัดศาลหลักเมืองเชียงใหม่
    const chiangMaiCityHallLat = 18.7883;
    const chiangMaiCityHallLng = 98.9853;

    // คำนวณระยะทางแบบเส้นตรง (สำรอง)
    const straightLineDistance = calculateDistance(lat, lng, chiangMaiCityHallLat, chiangMaiCityHallLng);

    // ใช้ข้อมูลจาก routing หรือใช้การคำนวณสำรอง
    const distance = routeInfo?.distance || straightLineDistance.toFixed(1);
    const drivingTime = routeInfo?.duration || Math.round(straightLineDistance * 2);

    // อัพเดท state
    setMapLocation({ 
      lat, 
      lng, 
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` 
    });
    setDistanceKm(distance);
    setDrivingTimeMinutes(drivingTime);
    setShowMapModal(false);

    // อัพเดท form data
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      distance: `${distance} กิโลเมตรจากศาลากลางจังหวัดเชียงใหม่`,
      drivingTime: `${drivingTime} นาทีด้วยรถยนต์`
    }));
  };

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
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert('Please fill in required fields and select location on map');
      return;
    }

    let imageUrls = [];
    if (formData.images.length > 0) {
      for (let file of formData.images) {
        const url = await uploadImageToCloud(file);
        imageUrls.push({ URL: url, IsMain: false });
      }
      if (imageUrls.length > 0) imageUrls[0].IsMain = true;
    }

    // แปลงข้อมูลให้ตรงกับ Backend
    const payload = {
      name: formData.name,
      address: formData.address,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      topic: formData.topic,
      history: formData.history, 
      hasParking: formData.parking === "มี", // แปลงเป็น boolean
      parkingDetails: formData.parkingDetails,
      hasEntrance: true, 
      entranceDetails: "", 
      budgetRange: formData.budget_range,
      season: formData.bestSeason, 
      distanceFromCity: formData.distance, 
      drivingTime: formData.drivingTime, 
      admissionFee: parseInt(formData.admissionFee) || 0,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      images: imageUrls,
      activities: convertActivities(formData.activities), 
      tags: convertTags(formData.tags),
      amenities: convertAmenities(formData.amenities),
      accessibilities: convertAccessibility(formData.accessibility),
    };

    console.log('Payload to send:', payload);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("บันทึกข้อมูลสำเร็จ!");
        router.push("/admin/destinations");
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleCancel = () => {
    router.push('/admin/destinations');
  };

  const openMapModal = () => {
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
  };

  const convertAmenities = (amenitiesObj) =>
    Object.entries(amenitiesObj)
      .filter(([_, checked]) => checked)
      .map(([name]) => ({ Name: name }));

  const convertAccessibility = (accessObj) =>
    Object.entries(accessObj)
      .filter(([_, checked]) => checked)
      .map(([name]) => ({ Name: name }));

  // ถ้าเลือกเดียว
  const convertTags = (tagStr) =>
    tagStr ? [{ TagName: tagStr }] : [];

  const convertActivities = (activitiesStr) =>
    activitiesStr
      .split(",")
      .map(act => act.trim())
      .filter(act => act)
      .map(act => ({ Name: act })); 

  // ฟังก์ชันอัปโหลดภาพขึ้น Cloudinary (ใส่ไว้ในไฟล์นี้ได้เลย)
  const uploadImageToCloud = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; // ชื่อ cloud ของคุณ
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; // ชื่อ upload preset (unsigned)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    return data.secure_url;
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>สร้างสถานที่ท่องเที่ยวใหม่</h1>
          <p className={styles.pageSubtitle}>เพิ่มสถานที่ใหม่เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.createForm}>
          {/* Basic Information Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>ข้อมูลพื้นฐาน</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>ชื่อสถานที่ท่องเที่ยว *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="กรอกชื่อสถานที่ท่องเที่ยว"
                  required
                />
              </div>
              
              <div className={styles.formField}>
                <label>ประเภทสถานที่</label>
                <select
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                >
                  <option value="">ตัวเลือก</option>
                  <option value="Nature">ธรรมชาติ</option>
                  <option value="Culture">วัฒนธรรม</option>
                  <option value="Food">อาหาร</option>
                  <option value="Adventure">ผจญภัย</option>
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
                placeholder="กรอกชื่อเรื่องเล่าหรือประวัติที่เกี่ยวข้อง"
              />
            </div>

            <div className={styles.formField}>
              <label>คำอธิบายสถานที่ท่องเที่ยว</label>
              <textarea
                name="history"
                value={formData.history}
                onChange={handleInputChange}
                placeholder="กรอกเรื่องเล่าหรือประวัติของสถานที่ท่องเที่ยวและรายละเอียดเพิ่มเติม"
                rows={4}
              />
            </div>

            <div className={styles.formField}>
              <label>กิจกรรมที่น่าสนใจ</label>
              <textarea
                name="activities"
                value={formData.activities}
                onChange={handleInputChange}
                placeholder="กรอกกิจกรรมที่น่าสนใจที่สามารถทำได้ที่สถานที่ท่องเที่ยวนี้ (ใส่ , (comma) คั่นกิจกรรม กรณีที่มีกิจกรรมหลายอย่าง เช่น ปีนเขา, ถ่ายรูป, ชมวิว)"
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
                placeholder="กรอกที่อยู่ของสถานที่ท่องเที่ยว"
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
              </select>
            </div>
          </div>

          {/* Location & Map Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>ตำแหน่งที่ตั้งและแผนที่</h2>
            <p className={styles.sectionNote}>กด "เลือกตำแหน่ง" เพื่อกำหนดตำแหน่งจุดหมายบนแผนที่</p>
            
            <div className={styles.mapSelectorContainer}>
              <button
                type="button"
                onClick={openMapModal}
                className={styles.selectLocationBtn}
              >
                {mapLocation ? 'เปลี่ยนตำแหน่ง' : 'เลือกตำแหน่ง'}
              </button>
              
              {mapLocation && (
                <div className={styles.selectedLocation}>
                  <h4>เลือกตำแหน่ง:</h4>
                  <p>พิกัด: {mapLocation.address}</p>
                  <p>ระยะทาง: {distanceKm} กิโลเมตรจากศาลากลางจังหวัดเชียงใหม่</p>
                  <p>ระยะเวลาเดินทางโดยรถยนต์: {drivingTimeMinutes} นาทีด้วยรถยนต์</p>
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>ละติจูด *</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="เลือกตำแหน่ง"
                  readOnly
                />
              </div>
              
              <div className={styles.formField}>
                <label>ลองจิจูด *</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="เลือกตำแหน่ง"
                  readOnly
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>ระยะทางห่างจากศาลากลางเชียงใหม่</label>
                <input
                  type="text"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  placeholder="คำนวณอัตโนมัติเมื่อเลือกตำแหน่งแล้ว"
                  readOnly
                />
              </div>
              
              <div className={styles.formField}>
                <label>ระยะเวลาเดินทางโดยรถยนต์จากศาลากลาง</label>
                <input
                  type="text"
                  name="drivingTime"
                  value={formData.drivingTime}
                  onChange={handleInputChange}
                  placeholder="คำนวณอัตโนมัติเมื่อเลือกตำแหน่งแล้ว"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>รายละเอียด</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>งบประมาณ</label>
                <select
                  name="budget_range"
                  value={formData.budget_range}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">เลือกงบประมาณ</option>
                  <option value="0">ฟรี</option>
                  <option value="0-2000">0-2,000 บาท</option>
                  <option value="2000-5000">2,000-5,000 บาท</option>
                  <option value="5000-10000">5,000-10,000 บาท</option>
                  <option value="10000+">มากกว่า 10,000 บาท</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>ค่าเข้าชม (บาท)</label>
                <input
                  type="number"
                  name="admissionFee"
                  value={formData.admissionFee}
                  onChange={handleInputChange}
                  placeholder="กรอกค่าเข้าชม (เช่น 50, 100) หรือ 0 ถ้าฟรี"
                  min="0"
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

            <div className={styles.formField}>
              <label>รายละเอียดที่จอดรถ</label>
              <input
                type="text"
                name="parkingDetails"
                value={formData.parkingDetails}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดที่จอดรถ (ถ้ามี) เช่น สถานที่จอด ค่าจอดรถ"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>รูปภาพสถานที่ท่องเที่ยว</h2>
            
            <div className={styles.formField}>
              <label>อัพโหลดรูปสถานที่ท่องเที่ยว</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </div>

            {formData.images.length > 0 && (
              <div className={styles.imagePreview}>
                {formData.images.map((image, index) => (
                  <div key={index} className={styles.imageItem}>
                    <img 
                      src={typeof image === "string" ? image : URL.createObjectURL(image)} 
                      alt={`Preview ${index + 1}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageBtn}
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
                <span>มีห้องน้ำสำหรับผู้ใช้รถเข็นใกล้ทางเข้า</span>
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
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              สร้างสถานที่ท่องเที่ยว
            </button>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className={styles.mapModal}>
          <div className={styles.mapModalContent}>
            <div className={styles.mapModalHeader}>
              <h3>เลือกตำแหน่งจากแผนที่</h3>
              <button onClick={closeMapModal} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.mapModalBody}>
              <MapSelector onSelect={handleMapSelect} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreateDestination;