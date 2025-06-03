import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/favourites.module.css";

const Favourites = () => {
  const router = useRouter();
  const [heartStatus, setHeartStatus] = useState({
    'grand-canyon-chiangmai': true,
    'mon-hong-waterfall': true,
    'suan-bo-kaew': true,
    'hydrangea-royal-project': true
  });
  
  const [selectedPlaces, setSelectedPlaces] = useState({
    'grand-canyon-chiangmai': false,
    'mon-hong-waterfall': false,
    'suan-bo-kaew': false,
    'hydrangea-royal-project': false
  });
  
  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [currentPlace, setCurrentPlace] = useState('');
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const handleViewPlace = () => {
    router.push('/story-page');
  };

  const handleHeartClick = (id) => {
    setHeartStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // Show notification when unfavoriting a place
    if (heartStatus[id]) {
      showNotificationPopup(`${getPlaceName(id)} ลบออกจากรายการโปรด`);
    } else {
      showNotificationPopup(`${getPlaceName(id)} เพิ่มเข้าไปในรายการโปรดแล้ว`);
    }
  };
  
  const handleMoreInfoClick = (id) => {
    setCurrentPlace(id);
    setShowPopup(true);
  };
  
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  
  const handleSelectPlace = (id) => {
    setSelectedPlaces(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const showNotificationPopup = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleCreateRouteMap = () => {
    const selectedDestinations = Object.keys(selectedPlaces).filter(place => selectedPlaces[place]);
    
    if (currentPlace && selectedDestinations.length > 0) {
      // Implementation for creating route map with currentPlace as starting point
      showNotificationPopup(`กำลังสร้างแผนที่เส้นทางโดยเริ่มจาก... ${getPlaceName(currentPlace)}`);
    } else {
      showNotificationPopup("คุณต้องเลือกอย่างน้อยหนึ่งจุดหมายเพื่อสร้างเส้นทาง");
    }
  };

  const handleInfoButtonClick = () => {
    setShowInfoPopup(true);
  };

  const handleCloseInfoPopup = () => {
    setShowInfoPopup(false);
  };

  // Get place name from ID
  const getPlaceName = (id) => {
    const placeNames = {
      'grand-canyon-chiangmai': 'แกรนด์แคนยอน เชียงใหม่',
      'mon-hong-waterfall': 'น้ำตกม่อนฮ่อง (ป่าแป๋)',
      'suan-bo-kaew': 'สวนบ่อแก้ว',
      'hydrangea-royal-project': 'ทุ่งดอกไฮเดรนเยีย โครงการหลวงขุนแปะ'
    };
    return placeNames[id] || id;
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Page Title and More Info Button */}
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>รายการโปรด</h1>
          <button className={styles.moreInfoHeaderButton} onClick={handleInfoButtonClick}>
            <img src="https://cdn-icons-png.flaticon.com/128/14836/14836604.png" alt="info" className={styles.moreInfoIcon} />
          </button>
        </div>

        {/* Favourites List */}
        <div className={styles.favouritesList}>
          {/* Favourite Item 1 */}
          <div className={styles.favouriteItem}>
            <div className={styles.selectCheckbox}>
              <input 
                type="checkbox" 
                id="check-grand-canyon-chiangmai"
                checked={selectedPlaces['grand-canyon-chiangmai']}
                onChange={() => handleSelectPlace('grand-canyon-chiangmai')}
              />
              <label htmlFor="check-grand-canyon-chiangmai">เลือกจุดหมายสำหรับเส้นทาง</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg" alt="แกรนด์แคนยอน เชียงใหม่" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>แกรนด์แคนยอน เชียงใหม่</h3>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
              </span>
                <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                <span className={styles.infoText}>เข้าชมฟรี</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  className={styles.heartButton}
                  onClick={() => handleHeartClick('grand-canyon-chiangmai')}
                >
                  <img 
                    src={heartStatus['grand-canyon-chiangmai'] 
                      ? "https://cdn-icons-png.flaticon.com/128/4340/4340223.png" 
                      : "https://cdn-icons-png.flaticon.com/128/4340/4340091.png"} 
                    alt="Favorite" 
                    className={styles.heartButtonIcon} 
                  />
                </button>
                <button 
                  className={styles.moreInfoButton}
                  onClick={() => handleMoreInfoClick('grand-canyon-chiangmai')}
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/854/854878.png" alt="More Info" className={styles.moreInfoButtonIcon} />
                </button>
                <button 
                  className={styles.viewButton}
                  onClick={() => handleViewPlace('story-page')}
                >
                  ชมสถานที่
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>5.0</div>
              <div className={styles.ratingText}>ดีเยี่ยม</div>
              <div className={styles.reviewCount}>25 รีวิว</div>
            </div>
          </div>

          {/* Favourite Item 2 */}
          <div className={styles.favouriteItem}>
            <div className={styles.selectCheckbox}>
              <input 
                type="checkbox" 
                id="check-mon-hong-waterfall"
                checked={selectedPlaces['mon-hong-waterfall']}
                onChange={() => handleSelectPlace('mon-hong-waterfall')}
              />
              <label htmlFor="check-mon-hong-waterfall">เลือกจุดหมายสำหรับเส้นทาง</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg" alt="น้ำตกม่อนฮ่อง (ป่าแป๋)" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>น้ำตกม่อนฮ่อง (ป่าแป๋)</h3>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
              </span>
                <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                <span className={styles.infoText}>เข้าชมฟรี</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  className={styles.heartButton}
                  onClick={() => handleHeartClick('mon-hong-waterfall')}
                >
                  <img 
                    src={heartStatus['mon-hong-waterfall'] 
                      ? "https://cdn-icons-png.flaticon.com/128/4340/4340223.png" 
                      : "https://cdn-icons-png.flaticon.com/128/4340/4340091.png"} 
                    alt="Favorite" 
                    className={styles.heartButtonIcon} 
                  />
                </button>
                <button 
                  className={styles.moreInfoButton}
                  onClick={() => handleMoreInfoClick('mon-hong-waterfall')}
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/854/854878.png" alt="More Info" className={styles.moreInfoButtonIcon} />
                </button>
                <button 
                  className={styles.viewButton}
                  onClick={() => handleViewPlace('mon-hong-waterfall')}
                >
                  ชมสถานที่
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>4.5</div>
              <div className={styles.ratingText}>ดีเยี่ยม</div>
              <div className={styles.reviewCount}>15 รีวิว</div>
            </div>
          </div>

          {/* Favourite Item 3 */}
          <div className={styles.favouriteItem}>
            <div className={styles.selectCheckbox}>
              <input 
                type="checkbox" 
                id="check-suan-bo-kaew"
                checked={selectedPlaces['suan-bo-kaew']}
                onChange={() => handleSelectPlace('suan-bo-kaew')}
              />
              <label htmlFor="check-suan-bo-kaew">เลือกจุดหมายสำหรับเส้นทาง</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://i.ytimg.com/vi/9_0j8BOBiE8/maxresdefault.jpg" alt="สวนบ่อแก้ว" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>สวนบ่อแก้ว</h3>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
              </span>
                <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                <span className={styles.infoText}>เข้าชมฟรี</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  className={styles.heartButton}
                  onClick={() => handleHeartClick('suan-bo-kaew')}
                >
                  <img 
                    src={heartStatus['suan-bo-kaew'] 
                      ? "https://cdn-icons-png.flaticon.com/128/4340/4340223.png" 
                      : "https://cdn-icons-png.flaticon.com/128/4340/4340091.png"} 
                    alt="Favorite" 
                    className={styles.heartButtonIcon} 
                  />
                </button>
                <button 
                  className={styles.moreInfoButton}
                  onClick={() => handleMoreInfoClick('suan-bo-kaew')}
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/854/854878.png" alt="More Info" className={styles.moreInfoButtonIcon} />
                </button>
                <button 
                  className={styles.viewButton}
                  onClick={() => handleViewPlace('suan-bo-kaew')}
                >
                  ชมสถานที่
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>4.2</div>
              <div className={styles.ratingText}>ดีเยี่ยม</div>
              <div className={styles.reviewCount}>12 รีวิว</div>
            </div>
          </div>

          {/* Favourite Item 4 */}
          <div className={styles.favouriteItem}>
            <div className={styles.selectCheckbox}>
              <input 
                type="checkbox" 
                id="check-hydrangea-royal-project"
                checked={selectedPlaces['hydrangea-royal-project']}
                onChange={() => handleSelectPlace('hydrangea-royal-project')}
              />
              <label htmlFor="check-hydrangea-royal-project">Select for route</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://static.ticket2attraction.com/gallery/1ea4fe7f-71c1-4170-b95f-4f0b70f19ece/adcfe8c9-9316-4e4f-89c2-4669cec51d5d-1200.webp" alt="ทุ่งดอกไฮเดรนเยีย โครงการหลวงขุนแปะ" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>ทุ่งดอกไฮเดรนเยีย โครงการหลวงขุนแปะ</h3>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/526/526754.png" alt="Car Icon" />
              </span>
                <span className={styles.infoText}>ห่างจากใจกลางเมือง 20 กิโลเมตร</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/1614/1614997.png" alt="Ticket Icon" />
                </span>
                <span className={styles.infoText}>เข้าชมฟรี</span>
              </div>
              
              <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                  <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Time Icon" />
                </span>
                <span className={styles.infoText}>เปิดทำการ เวลา 09:00 น. – 16:00 น.</span>
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  className={styles.heartButton}
                  onClick={() => handleHeartClick('hydrangea-royal-project')}
                >
                  <img 
                    src={heartStatus['hydrangea-royal-project'] 
                      ? "https://cdn-icons-png.flaticon.com/128/4340/4340223.png" 
                      : "https://cdn-icons-png.flaticon.com/128/4340/4340091.png"} 
                    alt="Favorite" 
                    className={styles.heartButtonIcon} 
                  />
                </button>
                <button 
                  className={styles.moreInfoButton}
                  onClick={() => handleMoreInfoClick('hydrangea-royal-project')}
                >
                  <img src="https://cdn-icons-png.flaticon.com/128/854/854878.png" alt="More Info" className={styles.moreInfoButtonIcon} />
                </button>
                <button 
                  className={styles.viewButton}
                  onClick={() => handleViewPlace('hydrangea-royal-project')}
                >
                  ชมสถานที่
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>4.0</div>
              <div className={styles.ratingText}>ดี</div>
              <div className={styles.reviewCount}>8 reviews</div>
            </div>
          </div>
        </div>

        {/* Create Route Map Button */}
        <button className={styles.createRouteButton} onClick={handleCreateRouteMap}>
        สร้างแผนที่การเดินทาง
        </button>

      </div>

      {/* Popup for More Info */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button className={styles.closePopup} onClick={handleClosePopup}>×</button>
            <div className={styles.popupContent}>
              <h3>ถูกกำหนดเป็นจุดเริ่มต้น</h3>
              <p>คุณต้องการตั้ง <strong>{getPlaceName(currentPlace)}</strong> เป็นจุดเริ่มต้นสำหรับเส้นทางของคุณหรือไม่?</p>
              <button 
                className={styles.confirmButton}
                onClick={() => {
                  // Set this place as starting point logic
                  setSelectedPlaces(prev => ({...prev, [currentPlace]: true}));
                  showNotificationPopup(`${getPlaceName(currentPlace)} กำหนดเป็นจุดเริ่มต้น`);
                  setShowPopup(false);
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Popup (centered with Got it! button) */}
      {showInfoPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.infoPopup}>
            <button className={styles.closePopup} onClick={handleCloseInfoPopup}>×</button>
            <div className={styles.popupContent}>
              <h3>รายละเอียดการวางแผนเส้นทาง</h3>
              <p>สถานที่แรกที่คุณเลือก<br></br>จะถูกตั้งเป็นจุดเริ่มต้นของเส้นทางของคุณ</p>
              <button 
                className={styles.gotItButton}
                onClick={handleCloseInfoPopup}
              >
                เข้าใจแล้ว!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {showNotification && (
        <div className={styles.notificationPopup}>
          <div className={styles.notificationContent}>
            {notificationMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favourites;