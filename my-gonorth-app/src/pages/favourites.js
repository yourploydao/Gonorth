import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/favourites.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";

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

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
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
        console.log("Favorite IDs:", data.map(d => d.location_id));

        setFavorites(data);

        const dynamicHeartStatus = {};
        const dynamicSelectedPlaces = {};

        data.forEach(item => {
          // ใช้ ID จาก response หลัก (item.ID) แทน location.ID
          dynamicHeartStatus[item.ID] = true;
          dynamicSelectedPlaces[item.ID] = false;
        });

        setHeartStatus(dynamicHeartStatus);
        setSelectedPlaces(dynamicSelectedPlaces);

      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    console.log("Favorites in state:", favorites);
  }, [favorites]);

  const handleViewPlace = (id) => {
    router.push(`/story-page?id=${id}`);
  };

  const handleHeartClick = async (itemId) => {
    setHeartStatus(prev => ({
      ...prev,
      [itemId]: false,
    }));

    try {
      // หา location_id จาก favorites array
      const favoriteItem = favorites.find(fav => fav.ID === itemId);
      if (!favoriteItem) {
        showNotificationPopup("ไม่พบข้อมูลสถานที่");
        // รีเซ็ต heart กลับเป็น filled ถ้าเกิด error
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
        showNotificationPopup(`${getPlaceName(itemId)} removed from favorites`);
        
        // รอ 1.5 วินาทีแล้วค่อยลบออกจากรายการ
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
        }, 1500);

      } else {
        const errorData = await response.json();
        showNotificationPopup(errorData.error || "Failed to remove from favorites");
        
        // รีเซ็ต heart กลับเป็น filled ถ้าเกิด error
        setHeartStatus(prev => ({
          ...prev,
          [itemId]: true,
        }));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      showNotificationPopup("เกิดข้อผิดพลาดในการลบรายการโปรด");
      
      // รีเซ็ต heart กลับเป็น filled ถ้าเกิด error
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
      showNotificationPopup(`Creating route map starting with ${getPlaceName(currentPlace)}`);
    } else {
      showNotificationPopup("Please select at least one destination for your route");
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
    
    // หารูปหลัก (IsMain: true) ก่อน
    const mainImage = images.find(img => img.IsMain === true);
    if (mainImage && mainImage.URL) return mainImage.URL;
    
    // ถ้าไม่มีรูปหลัก ใช้รูปแรก
    if (images[0] && images[0].URL) return images[0].URL;
    
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainContent}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Favourites</h1>
          <button className={styles.moreInfoHeaderButton} onClick={handleInfoButtonClick}>
            <img src="https://cdn-icons-png.flaticon.com/128/14836/14836604.png" alt="info" className={styles.moreInfoIcon} />
          </button>
        </div>

        <div className={styles.favouritesList}>
          {favorites.map((item, index) => {
            // ตัวแปรสำหรับข้อมูล location 
            const location = item.location || {};
            const itemId = item.ID || index;
            
            return (
              <div key={itemId} className={styles.favouriteItem}>
                <div className={styles.selectCheckbox}>
                  <input
                    type="checkbox"
                    id={`check-${itemId}`}
                    checked={selectedPlaces[itemId] || false}
                    onChange={() => handleSelectPlace(itemId)}
                  />
                  <label htmlFor={`check-${itemId}`}>Select for route</label>
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
                      onClick={() => handleViewPlace(location.ID || itemId)}
                    >
                      View Place
                    </button>
                  </div>
                </div>

                <div className={styles.destinationRating}>
                  <div className={styles.ratingScore}>
                    {location.LocationsRating || "N/A"}
                  </div>
                  <div className={styles.ratingText}>
                    {(location.LocationsRating || 0) >= 4.5 ? "Very Good" : "Good"}
                  </div>
                  <div className={styles.reviewCount}>
                    {location.ReviewCount || 0} reviews
                  </div>
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
          Create Route Map
        </button>
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button className={styles.closePopup} onClick={handleClosePopup}>×</button>
            <div className={styles.popupContent}>
              <h3>Set as Starting Point</h3>
              <p>Do you want to set <strong>{getPlaceName(currentPlace)}</strong> as the starting point for your route?</p>
              <button 
                className={styles.confirmButton}
                onClick={() => {
                  setSelectedPlaces(prev => ({...prev, [currentPlace]: true}));
                  showNotificationPopup(`${getPlaceName(currentPlace)} set as starting point`);
                  setShowPopup(false);
                }}
              >
                Confirm
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
              <h3>Route Planning Information</h3>
              <p>The first location you select will be<br/>set as the starting point of your route.</p>
              <button 
                className={styles.gotItButton}
                onClick={handleCloseInfoPopup}
              >
                Got it!
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

      <Footer />
    </div>
  );
};

export default Favourites;