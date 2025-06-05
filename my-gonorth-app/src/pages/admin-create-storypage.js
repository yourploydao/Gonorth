import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "../styles/admin-create-storypage.module.css";
import 'leaflet/dist/leaflet.css';

// Dynamic import สำหรับ MapSelector
const MapSelector = dynamic(() => import("../components/map-selector.js"), {
  ssr: false,
});

// รายการตัวเลือกที่ถูกต้องสำหรับ tags
const validTags = ["Nature", "Culture", "Food", "Adventure"];

const AdminCreateDestination = () => {
  const router = useRouter();
  const { id } = router.query;
  const [destination, setDestination] = useState(null);
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
    budget_range: "",
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
    const chiangMaiCityHallLat = 18.7883;
    const chiangMaiCityHallLng = 98.9853;
    const straightLineDistance = calculateDistance(lat, lng, chiangMaiCityHallLat, chiangMaiCityHallLng);
    const distance = routeInfo?.distance || straightLineDistance.toFixed(1);
    const drivingTime = routeInfo?.duration || Math.round(straightLineDistance);

    setMapLocation({ 
      lat, 
      lng, 
      address: `${lat.toFixed(2)}, ${lng.toFixed(2)}` 
    });
    setDistanceKm(distance);
    setDrivingTimeMinutes(drivingTime);
    setShowMapModal(false);

    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      distance_from_city: distance,
      drivingTime: `${drivingTime} นาทีด้วยรถ`
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    if (name === "admissionFee") {
      // อนุญาตเฉพาะตัวเลขและว่างเปล่า จำกัดความยาวไม่เกิน 10 หลัก
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

    if (!formData.name || !formData.latitude || !formData.longitude || formData.admissionFee === "") {
      alert('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด รวมถึงค่าเข้าชม');
      return;
    }

    const admissionFeeValue = Number(formData.admissionFee);
    if (isNaN(admissionFeeValue) || admissionFeeValue < 0) {
      alert('ค่าเข้าชมต้องเป็นตัวเลขที่ไม่ติดลบ');
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

    const payload = {
      name: formData.name,
      address: formData.address,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      topic: formData.topic,
      history: formData.history,
      hasParking: formData.parking === "มี",
      parkingDetails: formData.parkingDetails,
      hasEntrance: true,
      entranceDetails: "",
      budgetRange: formData.budget_range,
      season: formData.bestSeason,
      distanceFromCity: Number(formData.distance_from_city) || 0,
      drivingTime: formData.drivingTime,
      admission_fee: admissionFeeValue,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      images: imageUrls,
      activities: convertActivities(formData.activities),
      tags: convertTags(formData.tags),
      amenities: convertAmenities(formData.amenities),
      accessibilities: convertAccessibility(formData.accessibility),
    };

    console.log('Payload to send:', JSON.stringify(payload, null, 2));

    try {
      const token = localStorage.getItem("token");
      const method = id ? "PUT" : "POST";
      const url = id ? `http://localhost:8080/locations/${id}` : "http://localhost:8080/locations";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (res.ok) {
        alert(id ? "แก้ไขข้อมูลสำเร็จ!" : "บันทึกข้อมูลสำเร็จ!");
        router.push("/home-after-login");
      } else {
        console.error("Error response:", responseData);
        alert(`เกิดข้อผิดพลาดในการ${id ? 'แก้ไข' : 'บันทึก'}ข้อมูล: ${responseData.error || 'Unknown error'}`);
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

  const convertAmenities = (amenitiesObj) => {
    if (!amenitiesObj) return [];
    return Object.entries(amenitiesObj)
      .filter(([_, checked]) => checked)
      .map(([name]) => ({ Name: name }));
  };

  const convertAccessibility = (accessObj) => {
    if (!accessObj) return [];
    return Object.entries(accessObj)
      .filter(([_, checked]) => checked)
      .map(([name]) => ({ Name: name }));
  };

  const convertTags = (tagStr) => {
    if (!tagStr) return [];
    return [{ TagName: tagStr }];
  };

  const convertActivities = (activitiesStr) => {
    if (!activitiesStr) return [];
    return activitiesStr
      .split(",")
      .map(act => act.trim())
      .filter(act => act)
      .map(act => ({ Name: act }));
  };

  const uploadImageToCloud = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
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
          console.log("Tags from API:", data.tags);
          console.log("Amenities from API:", data.amenities);
          console.log("AdmissionFee from API:", data.admissionFee);
          setDestination(data);
          const newFormData = {
            name: data.name || "",
            topic: data.topic || "",
            history: data.history || "",
            tags: data.tags && Array.isArray(data.tags) && data.tags.length > 0 && validTags.includes(data.tags[0].TagName)
              ? data.tags[0].TagName
              : "",
            activities: Array.isArray(data.activities)
              ? data.activities.map(act => act.Name || "").filter(Boolean).join(", ")
              : "",
            address: data.address || "",
            bestSeason: data.season || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
            budget_range: data.budget_range || "",
            admissionFee: data.admissionFee != null ? data.admissionFee.toString() : "",
            distance_from_city: data.distance?.toString() || "",
            drivingTime: data.driving_time || "",
            openTime: data.open_time || "",
            closeTime: data.close_time || "",
            parking: data.has_parking ? "มี" : "ไม่มี",
            parkingDetails: data.parking_details || "",
            images: Array.isArray(data.images) ? data.images.map(img => img.URL || "") : [],
            amenities: {
              baggageStorage: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "baggageStorage") : false,
              freeWifi: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "freeWifi") : false,
              toilet: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "toilet") : false,
              restaurant: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "restaurant") : false,
              barOnSite: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "barOnSite") : false,
              souvenirShop: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "souvenirShop") : false,
              informationCenter: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "informationCenter") : false,
              shuttleService: data.amenities && Array.isArray(data.amenities) ? data.amenities.some(a => a?.Name === "shuttleService") : false,
            },
            accessibility: {
              wheelchairCarPark: data.accessibilities && Array.isArray(data.accessibilities) ? data.accessibilities.some(a => a?.Name === "wheelchairCarPark") : false,
              wheelchairEntrance: data.accessibilities && Array.isArray(data.accessibilities) ? data.accessibilities.some(a => a?.Name === "wheelchairEntrance") : false,
              wheelchairToilet: data.accessibilities && Array.isArray(data.accessibilities) ? data.accessibilities.some(a => a?.Name === "wheelchairToilet") : false,
              goodForKids: data.accessibilities && Array.isArray(data.accessibilities) ? data.accessibilities.some(a => a?.Name === "goodForKids") : false,
            }
          };
          setFormData(newFormData);
          console.log("formData after set:", newFormData);
        })
        .catch(err => console.error("โหลดข้อมูลไม่สำเร็จ", err));
    }
  }, [id]);

  if (id && !destination) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{id ? "แก้ไขสถานที่ท่องเที่ยว" : "สร้างสถานที่ท่องเที่ยวใหม่"}</h1>
          <p className={styles.pageSubtitle}>{id ? "แก้ไขข้อมูลสถานที่ในระบบ" : "เพิ่มสถานที่ใหม่เข้าสู่ระบบ"}</p>
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
                  name="distance_from_city"
                  value={
                    formData.distance_from_city !== ""
                      ? `${formData.distance_from_city} กิโลเมตรจากศาลากลางจังหวัดเชียงใหม่`
                      : ""
                  }
                  placeholder="คำนวณอัตโนมัติเมื่อเลือกตำแหน่ง"
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
                <label>ค่าเข้าชม (บาท) *</label>
                <input
                  type="text"
                  name="admissionFee"
                  value={formData.admissionFee}
                  onChange={handleInputChange}
                  placeholder="กรอกค่าเข้าชม (เช่น 50, 100) หรือ 0 ถ้าฟรี"
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
              {id ? "บันทึกการเปลี่ยนแปลง" : "สร้างสถานที่ท่องเที่ยว"}
            </button>
          </div>
        </form>
      </div>

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