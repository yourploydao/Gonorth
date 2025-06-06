import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "../styles/admin-create-storypage.module.css";
import 'leaflet/dist/leaflet.css';

const MapSelector = dynamic(() => import("../components/map-selector.js"), {
  ssr: false, // ปิดการโหลดในฝั่ง Server
});

const validTags = ["Nature", "Culture", "Food", "Adventure"];

const AdminCreateDestination = () => {
  const router = useRouter();
  const { id } = router.query;
  const [destination, setDestination] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState('');
  const [drivingTimeMinutes, setDrivingTimeMinutes] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    history: "",
    tags: "",
    activities: [],
    address: "",
    bestSeason: "",
    latitude: "",
    longitude: "",
    budgetRange: "", // เพิ่ม budget (แก้ไขจาก budget_range)
    admissionFee: "",
    distance_from_city: "",
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateDistanceAndTime = (lat, lng) => {
    const chiangMaiCityHallLat = 18.7883;
    const chiangMaiCityHallLng = 98.9853;
    const straightLineDistance = calculateDistance(lat, lng, chiangMaiCityHallLat, chiangMaiCityHallLng);
    const distance = straightLineDistance.toFixed(1);
    const drivingTime = Math.round(straightLineDistance);

    setDistanceKm(distance);
    setDrivingTimeMinutes(drivingTime);
    setFormData(prev => ({
      ...prev,
      distance_from_city: distance,
      drivingTime: `${drivingTime} นาทีด้วยรถ`
    }));
  };

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
      distance_from_city: parseFloat(distance), // เก็บเป็นตัวเลข
      drivingTime: `${drivingTime} นาทีด้วยรถยนต์`
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    if (name === "admissionFee") {
      if (value === "" || (/^\d*$/.test(value) && value.length <= 10)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }; // เพิ่ม closing brace ที่หายไป

  const handleAddActivity = () => {
    if (newActivity.trim() === '') return;
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity.trim()]
    }));
    setNewActivity('');
  };

  const handleRemoveActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
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

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.admissionFee) {
      alert('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด รวมถึงค่าเข้าชม');
      return;
    }

    // ตรวจสอบว่า admissionFee เป็นตัวเลข
    const admissionFeeValue = Number(formData.admissionFee);
    if (isNaN(admissionFeeValue)) {
      alert('กรุณากรอกค่าเข้าชมเป็นตัวเลขที่ถูกต้อง');
      return;
    }

    if (!formData.budgetRange) {
      alert('กรุณาเลือกงบประมาณ');
      return;
    }

    let imageUrls = destination?.images || [];
    if (formData.images.length > 0) {
      for (let file of formData.images) {
        if (typeof file !== "string") {
          const url = await uploadImageToCloud(file);
          imageUrls.push({ URL: url, IsMain: false });
        }
      }
      if (imageUrls.length > 0 && !imageUrls.some(img => img.IsMain)) {
        imageUrls[0].IsMain = true;
      }
    }

    // แปลงข้อมูลให้ตรงกับ Backend
    const payload = {
      name: formData.name,
      address: formData.address,
      openTime: formData.openTime || null,
      closeTime: formData.closeTime || null,
      topic: formData.topic,
      history: formData.history,
      hasParking: formData.parking === "มี",
      parkingDetails: formData.parkingDetails,
      hasEntrance: true,
      entranceDetails: "",
      budgetRange: formData.budgetRange,
      season: formData.bestSeason,
      distanceFromCity: Number(formData.distance_from_city) || 0,
      drivingTime: formData.drivingTime,
      admissionFee: admissionFeeValue, // ใช้ค่า Number โดยตรง
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      images: imageUrls,
      activities: formData.activities.map(act => ({ Name: act })),
      tags: formData.tags || "",
      amenities: convertAmenities(formData.amenities),
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
        router.push("/admin-destination-control");
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleCancel = () => {
    router.push('/admin-destination-control');
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

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:8080/location/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error("Unauthorized or not found");
          return res.json();
        })
        .then(data => {
          console.log("API response data:", data);
          setDestination(data);
          
          const newFormData = {
            name: data.name || "",
            topic: data.topic || "",
            history: data.history || "",
            tags: data.tags || "",
            activities: Array.isArray(data.activities) ? data.activities.map(act => act.ActivityName || "").filter(Boolean) : [],
            address: data.address || "",
            bestSeason: data.season || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
            // แก้ไข: ใช้ budget_range จาก API (snake_case)
            budgetRange: data.budget_range || "0", 
            admissionFee: data.admissionFee != null ? data.admissionFee.toString() : "0",
            // แก้ไข: ใช้ distance จาก API (ไม่ใช่ distanceFromCity)
            distance_from_city: data.distance?.toString() || "",
            // แก้ไข: ใช้ driving_time จาก API (snake_case)
            drivingTime: data.driving_time || "",
            // แก้ไข: ใช้ open_time และ close_time จาก API (snake_case)
            openTime: data.open_time || "",
            closeTime: data.close_time || "",
            // แก้ไข: ใช้ has_parking จาก API (snake_case)
            parking: data.has_parking ? "มี" : "ไม่มี",
            // แก้ไข: ใช้ parking_details จาก API (snake_case)
            parkingDetails: data.parking_details || "",
            images: Array.isArray(data.images) ? data.images.map(img => img.URL || "").filter(Boolean) : [],
            amenities: {
              baggageStorage: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "baggageStorage"),
              freeWifi: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "freeWifi"),
              toilet: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "toilet"),
              restaurant: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "restaurant"),
              barOnSite: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "barOnSite"),
              souvenirShop: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "souvenirShop"),
              informationCenter: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "informationCenter"),
              shuttleService: Array.isArray(data.amenities) && data.amenities.some(a => a?.Name === "shuttleService"),
            },
            accessibility: {
              wheelchairCarPark: false,
              wheelchairEntrance: false,
              wheelchairToilet: false,
              goodForKids: false
            }
          };
          
          setFormData(newFormData);
          
          const lat = parseFloat(data.latitude) || 0;
          const lng = parseFloat(data.longitude) || 0;
          setMapLocation({
            lat,
            lng,
            address: data.address || `${lat.toFixed(2)}, ${lng.toFixed(2)}`
          });
          
          // แก้ไข: ใช้ data.distance และ data.driving_time
          if (lat && lng && (!data.distance || !data.driving_time)) {
            updateDistanceAndTime(lat, lng);
          } else {
            setDistanceKm(data.distance?.toString() || "");
            // แก้ไข: parsing driving_time ที่ถูกต้อง
            const drivingTimeStr = data.driving_time || "";
            const drivingTimeMatch = drivingTimeStr.match(/(\d+)/);
            setDrivingTimeMinutes(drivingTimeMatch ? drivingTimeMatch[1] : "");
          }
          
          console.log("formData after set:", newFormData);
        })
        .catch(err => {
          console.error("โหลดข้อมูลไม่สำเร็จ", err);
          alert("ไม่สามารถโหลดข้อมูลสถานที่ได้");
        });
    }
  }, [id]);

  if (id && !destination) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>สร้างสถานที่ท่องเที่ยวใหม่</h1>
          <p className={styles.pageSubtitle}>เพิ่มสถานที่ใหม่เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.createForm}>
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
                <label>ประเภทสถานที่ *</label>
                <select
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">เลือกประเภท</option>
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
              <div className={styles.activityInput}>
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="กรอกกิจกรรม (เช่น ปีนเขา)"
                />
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className={styles.addActivityBtn}
                >
                  เพิ่ม
                </button>
              </div>
              {formData.activities.length > 0 && (
                <ul className={styles.activityList}>
                  {formData.activities.map((activity, index) => (
                    <li key={index} className={styles.activityItem}>
                      <span>{activity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(index)}
                        className={styles.removeActivityBtn}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
                  name="distance_from_city"
                  value={distanceKm ? `${distanceKm} กิโลเมตรจากศาลากลางจังหวัดเชียงใหม่` : ""}
                  placeholder="คำนวณอัตโนมัติเมื่อเลือกตำแหน่ง"
                  readOnly
                />
              </div>
              
              <div className={styles.formField}>
                <label>ระยะเวลาเดินทางโดยรถยนต์จากศาลากลาง</label>
                <input
                  type="text"
                  name="drivingTime"
                  value={drivingTimeMinutes ? `${drivingTimeMinutes} นาทีด้วยรถ` : ""}
                  onChange={handleInputChange}
                  placeholder="คำนวณอัตโนมัติเมื่อเลือกตำแหน่ง"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>รายละเอียด</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>งบประมาณ *</label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
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
                  step="1"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>เวลาเปิด</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formField}>
                <label>เวลาปิด</label>
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

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>รูปภาพสถานที่ท่องเที่ยว</h2>
            
            <div className={styles.formField}>
              <label>อัปโหลดรูปสถานที่ท่องเที่ยว</label>
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
                <span>บาร์ในสถานที่</span>
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
          {/* <div className={styles.formSection}>
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
          </div> */}

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