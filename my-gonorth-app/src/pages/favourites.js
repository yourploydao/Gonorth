import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/favourites.module.css";

const Favourites = () => {
  const [favorites, setFavorites] = useState([]);
  const [heartStatus, setHeartStatus] = useState({});
  const [selectedPlaces, setSelectedPlaces] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [currentPlace, setCurrentPlace] = useState('');
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const router = useRouter();
  
  // เปลี่ยนจาก reviewStats เดี่ยว เป็น object ที่เก็บ stats ของแต่ละ location
  const [locationReviewStats, setLocationReviewStats] = useState({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    // ดึงข้อมูลรายการโปรด
    const fetchFavorites = async () => {
      try {
        console.log("Token:", token);
        const res = await fetch("http://localhost:8080/userfavorites", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log("Response status:", res.status);

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();
        console.log("Data from API:", data);

        setFavorites(data);

        const dynamicHeartStatus = {};
        const dynamicSelectedPlaces = {};

        data.forEach(item => {
          dynamicHeartStatus[item.ID] = true;
          dynamicSelectedPlaces[item.ID] = false;
        });

        setHeartStatus(dynamicHeartStatus);
        setSelectedPlaces(dynamicSelectedPlaces);

        // ดึงสถิติรีวิวสำหรับแต่ละ location
        await fetchAllReviewStats(data, token);

      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  // ฟังก์ชันใหม่สำหรับดึงสถิติรีวิวของทุก location
  const fetchAllReviewStats = async (favoritesData, token) => {
    setIsLoadingStats(true);
    const statsPromises = favoritesData.map(async (item) => {
      try {
        const locationId = item.location?.ID || item.location_id;
        if (!locationId) return null;

        const res = await fetch(`http://localhost:8080/location/${locationId}/review-stats`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          return {
            locationId: locationId,
            stats: data
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching review stats for location ${item.location?.ID}:`, error);
        return null;
      }
    });

    try {
      const results = await Promise.all(statsPromises);
      const statsObject = {};
      
      results.forEach(result => {
        if (result) {
          statsObject[result.locationId] = result.stats;
        }
      });
      
      setLocationReviewStats(statsObject);
    } catch (error) {
      console.error("Error processing review stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleViewPlace = (id) => {
    router.push(`/story-page?id=${id}`);
  };

  const handleHeartClick = async (itemId) => {
    setHeartStatus(prev => ({
      ...prev,
      [itemId]: false,
    }));

    try {
      const favoriteItem = favorites.find(fav => fav.ID === itemId);
      if (!favoriteItem) {
        showNotificationPopup("ไม่พบข้อมูลสถานที่");
        setHeartStatus(prev => ({
          ...prev,
          [itemId]: true,
        }));
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/deletefavorite", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          location_id: favoriteItem.location_id
        }),
      });

      if (response.ok) {
        showNotificationPopup(`${getPlaceName(itemId)} ลบออกจากรายการโปรด`);
        
        setTimeout(() => {
          setFavorites(prev => prev.filter(fav => fav.ID !== itemId));
          
          setHeartStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[itemId];
            return newStatus;
          });
          
          setSelectedPlaces(prev => {
            const newSelected = { ...prev };
            delete newSelected[itemId];
            return newSelected;
          });

          // ลบ review stats ของ location นี้ด้วย
          setLocationReviewStats(prev => {
            const newStats = { ...prev };
            const locationId = favoriteItem.location?.ID || favoriteItem.location_id;
            if (locationId) {
              delete newStats[locationId];
            }
            return newStats;
          });
        }, 1500);

      } else {
        const errorData = await response.json();
        showNotificationPopup(errorData.error || "Failed to remove from favorites");
        
        setHeartStatus(prev => ({
          ...prev,
          [itemId]: true,
        }));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      showNotificationPopup("เกิดข้อผิดพลาดในการลบรายการโปรด");
      
      setHeartStatus(prev => ({
        ...prev,
        [itemId]: true,
      }));
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

  const getPlaceName = (id) => {
    const item = favorites.find(fav => fav.ID === id);
    if (item && item.location) {
      return item.location.LocationsName || item.location.title || `Location ${id}`;
    }
    return `Location ${id}`;
  };

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return "https://via.placeholder.com/300x200?text=No+Image";
    
    const mainImage = images.find(img => img.IsMain === true);
    if (mainImage && mainImage.URL) return mainImage.URL;
    
    if (images[0] && images[0].URL) return images[0].URL;
    
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  // ฟังก์ชันใหม่สำหรับดึงข้อมูลรีวิวของแต่ละ location
  const getLocationReviewStats = (locationId) => {
    return locationReviewStats[locationId] || {
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: {}
    };
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return "ยอดเยี่ยม";
    if (rating >= 4.0) return "ดีเยี่ยม";
    if (rating >= 3.0) return "ดี";
    if (rating >= 2.0) return "พอใช้";
    return "แย่";
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>รายการโปรด</h1>
          <button className={styles.moreInfoHeaderButton} onClick={handleInfoButtonClick}>
            <img src="https://cdn-icons-png.flaticon.com/128/14836/14836604.png" alt="info" className={styles.moreInfoIcon} />
          </button>
        </div>

        <div className={styles.favouritesList}>

          {favorites.map((item, index) => {
            const location = item.location || {};
            const itemId = item.ID || index;
            const locationId = location.ID || item.location_id;
            const reviewStats = getLocationReviewStats(locationId);
            
            return (
              <div key={itemId} className={styles.favouriteItem}>
                <div className={styles.selectCheckbox}>
                  <input
                    type="checkbox"
                    id={`check-${itemId}`}
                    checked={selectedPlaces[itemId] || false}
                    onChange={() => handleSelectPlace(itemId)}
                  />
                  <label htmlFor={`check-${itemId}`}>เลือกจุดหมายสำหรับเส้นทาง</label>
                </div>

                <div className={styles.favouriteImage}>
                  <img 
                    src={getImageUrl(location.Images)} 
                    alt={location.LocationsName || "Location Image"} 
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                </div>

                <div className={styles.favouriteInfo}>
                  <h3 className={styles.favouriteTitle}>
                    {location.LocationsName || "ไม่มีชื่อสถานที่"}
                  </h3>

                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📍</span>
                    <span className={styles.infoText}>
                      {location.Address || "ไม่มีข้อมูลที่อยู่"}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🎫</span>
                    <span className={styles.infoText}>
                      {location.EntranceDetails || "ไม่มีข้อมูลทางเข้า"}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🕒</span>
                    <span className={styles.infoText}>
                      {location.OpenTime || "ไม่มีข้อมูลเวลาเปิด"}
                    </span>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={styles.heartButton}
                      onClick={() => handleHeartClick(itemId)}
                    >
                      <img
                        src={
                          heartStatus[itemId]
                            ? "https://cdn-icons-png.flaticon.com/128/4340/4340223.png"
                            : "https://cdn-icons-png.flaticon.com/128/4340/4340091.png"
                        }
                        alt="Favorite"
                        className={styles.heartButtonIcon}
                      />
                    </button>
                    <button
                      className={styles.moreInfoButton}
                      onClick={() => handleMoreInfoClick(itemId)}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/854/854878.png"
                        alt="More Info"
                        className={styles.moreInfoButtonIcon}
                      />
                    </button>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewPlace(locationId)}
                    >
                      ชมสถานที่
                    </button>
                  </div>
                </div>

                <div className={styles.destinationRating}>
                  {isLoadingStats ? (
                    <div className={styles.loadingRating}>Loading...</div>
                  ) : (
                    <>
                      <div className={styles.ratingScore}>
                        {reviewStats.average_rating ? reviewStats.average_rating.toFixed(1) : "N/A"}
                      </div>
                      <div className={styles.ratingText}>
                        {getRatingText(reviewStats.average_rating || 0)}
                      </div>
                      <div className={styles.reviewCount}>
                        {reviewStats.total_reviews || 0} reviews
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {favorites.length === 0 && (
          <div className={styles.emptyState}>
            <p>ไม่มีสถานที่โปรดในขณะนี้</p>
          </div>
        )}

        <button className={styles.createRouteButton} onClick={handleCreateRouteMap}>
        สร้างแผนที่การเดินทาง
        </button>
      </div>

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

      {showNotification && (
        <div className={styles.notificationPopup}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default Favourites;