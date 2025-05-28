import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "../styles/admin-create-storypage.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";
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
    description: "",
    category: "",
    address: "",
    latitude: "",
    longitude: "",
    budget: "",
    distance: "",
    drivingTime: "",
    openTime: "",
    closeTime: "",
    images: [],
    amenities: {
      baggageStorage: false,
      freeWifi: false,
      toilet: false,
      restaurant: false,
      barOnSite: false
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
      distance: `${distance} km from Chiang Mai City Hall`,
      drivingTime: `${drivingTime} minutes by car`
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert('Please fill in required fields and select location on map');
      return;
    }

    console.log('Creating destination:', formData);
    
    // Here you would typically send the data to your backend
    // For now, we'll just show success message and redirect
    alert('Destination created successfully!');
    router.push('/admin/destinations');
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

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Create New Destination</h1>
          <p className={styles.pageSubtitle}>Add a new destination to the system</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.createForm}>
          {/* Basic Information Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Destination Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter destination name"
                  required
                />
              </div>
              
              <div className={styles.formField}>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="Nature">Nature</option>
                  <option value="Culture">Culture</option>
                  <option value="Food">Food</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>
            </div>

            <div className={styles.formField}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter destination description"
                rows={4}
              />
            </div>

            <div className={styles.formField}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
              />
            </div>
          </div>

          {/* Location & Map Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Location & Map</h2>
            <p className={styles.sectionNote}>Click "Select Location" to choose the destination location on map</p>
            
            <div className={styles.mapSelectorContainer}>
              <button
                type="button"
                onClick={openMapModal}
                className={styles.selectLocationBtn}
              >
                {mapLocation ? 'Change Location' : 'Select Location on Map'}
              </button>
              
              {mapLocation && (
                <div className={styles.selectedLocation}>
                  <h4>Selected Location:</h4>
                  <p>Coordinates: {mapLocation.address}</p>
                  <p>Distance: {distanceKm} km from Chiang Mai City Hall</p>
                  <p>Driving Time: {drivingTimeMinutes} minutes by car</p>
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Latitude *</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="Select location on map"
                  readOnly
                />
              </div>
              
              <div className={styles.formField}>
                <label>Longitude *</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="Select location on map"
                  readOnly
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Distance from Chiang Mai City Hall</label>
                <input
                  type="text"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  placeholder="Auto-calculated when location is selected"
                  readOnly
                />
              </div>
              
              <div className={styles.formField}>
                <label>Driving Time from City Hall</label>
                <input
                  type="text"
                  name="drivingTime"
                  value={formData.drivingTime}
                  onChange={handleInputChange}
                  placeholder="Auto-calculated when location is selected"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Details</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Budget Range</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                >
                  <option value="">Select Budget Range</option>
                  <option value="0 - 2,000 THB">0 - 2,000 THB</option>
                  <option value="2,000 - 5,000 THB">2,000 - 5,000 THB</option>
                  <option value="5,000 - 10,000 THB">5,000 - 10,000 THB</option>
                  <option value="10,000+ THB">10,000+ THB</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Opening Time</label>
                <input
                  type="time"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formField}>
                <label>Closing Time</label>
                <input
                  type="time"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Images</h2>
            
            <div className={styles.formField}>
              <label>Upload Images</label>
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
                      src={URL.createObjectURL(image)} 
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
            <h2 className={styles.sectionTitle}>Amenities</h2>
            
            <div className={styles.checkboxGrid}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.baggageStorage}
                  onChange={() => handleCheckboxChange('amenities', 'baggageStorage')}
                />
                <span>Baggage Storage</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.freeWifi}
                  onChange={() => handleCheckboxChange('amenities', 'freeWifi')}
                />
                <span>Free Wi-Fi</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.toilet}
                  onChange={() => handleCheckboxChange('amenities', 'toilet')}
                />
                <span>Toilet</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.restaurant}
                  onChange={() => handleCheckboxChange('amenities', 'restaurant')}
                />
                <span>Restaurant</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.amenities.barOnSite}
                  onChange={() => handleCheckboxChange('amenities', 'barOnSite')}
                />
                <span>Bar on Site</span>
              </label>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Accessibility</h2>
            
            <div className={styles.checkboxGrid}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairCarPark}
                  onChange={() => handleCheckboxChange('accessibility', 'wheelchairCarPark')}
                />
                <span>Wheelchair-accessible Car Park</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairEntrance}
                  onChange={() => handleCheckboxChange('accessibility', 'wheelchairEntrance')}
                />
                <span>Wheelchair-accessible Entrance</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.wheelchairToilet}
                  onChange={() => handleCheckboxChange('accessibility', 'wheelchairToilet')}
                />
                <span>Wheelchair-accessible Toilet</span>
              </label>
              
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={formData.accessibility.goodForKids}
                  onChange={() => handleCheckboxChange('accessibility', 'goodForKids')}
                />
                <span>Good for Kids</span>
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
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              Create Destination
            </button>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className={styles.mapModal}>
          <div className={styles.mapModalContent}>
            <div className={styles.mapModalHeader}>
              <h3>Select Location on Map</h3>
              <button onClick={closeMapModal} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.mapModalBody}>
              <MapSelector onSelect={handleMapSelect} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminCreateDestination;