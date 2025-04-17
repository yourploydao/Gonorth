import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/favourites.module.css";

// const Favourites = () => {
//   const router = useRouter();
//   const [heartStatus, setHeartStatus] = useState({
//     'grand-canyon-chiangmai': true,
//     'mon-hong-waterfall': true,
//     'suan-bo-kaew': true,
//     'hydrangea-royal-project': true
//   });
  
//   const [selectedPlaces, setSelectedPlaces] = useState({
//     'grand-canyon-chiangmai': false,
//     'mon-hong-waterfall': false,
//     'suan-bo-kaew': false,
//     'hydrangea-royal-project': false
//   });
  
  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [currentPlace, setCurrentPlace] = useState('');
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleFavouritesClick = () => {
    router.push('/favourites');
  };

//   const handleViewPlace = (storypage) => {
//     router.push(`/storypage/${storypage}`);
//   };

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
      showNotificationPopup(`${getPlaceName(id)} removed from favorites`);
    } else {
      showNotificationPopup(`${getPlaceName(id)} added to favorites`);
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
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/assets/gonorth-logo.png" alt="GONORTH" className={styles.logoImage} />
        </div>
        <div className={styles.headerButtons}>
        <a href="/favourites" className={styles.favouritesButton}>
        <img 
            src="https://cdn-icons-png.flaticon.com/128/2550/2550290.png" 
            alt="Heart" 
            className={styles.heartIcon} 
        /> Favourites
        </a>
          {/* Removed the more info button from here */}
          {/* Divider between favourites and profile */}
          <div className={styles.headerDivider}></div>
          <div className={styles.userProfile} onClick={handleProfileClick}>
            <img src="/assets/Profile.jpg" alt="John D." className={styles.profileImage} />
            <span className={styles.profileName}>John D.</span>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Page Title and More Info Button */}
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Favourites</h1>
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
              <label htmlFor="check-grand-canyon-chiangmai">Select for route</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg" alt="แกรนด์แคนยอน เชียงใหม่" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>แกรนด์แคนยอน เชียงใหม่</h3>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🚗</span>
                <span className={styles.infoText}>20 km from city center</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🎫</span>
                <span className={styles.infoText}>Free entrance</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕒</span>
                <span className={styles.infoText}>Open 08:00 am - 17:00 pm</span>
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
                  View Place
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>5.0</div>
              <div className={styles.ratingText}>Very Good</div>
              <div className={styles.reviewCount}>25 reviews</div>
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
              <label htmlFor="check-mon-hong-waterfall">Select for route</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg" alt="น้ำตกม่อนฮ่อง (ป่าแป๋)" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>น้ำตกม่อนฮ่อง (ป่าแป๋)</h3>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🚗</span>
                <span className={styles.infoText}>20 km from city center</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🎫</span>
                <span className={styles.infoText}>Free entrance</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕒</span>
                <span className={styles.infoText}>Open 08:00 am - 17:00 pm</span>
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
                  View Place
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>4.5</div>
              <div className={styles.ratingText}>Very Good</div>
              <div className={styles.reviewCount}>15 reviews</div>
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
              <label htmlFor="check-suan-bo-kaew">Select for route</label>
            </div>
            <div className={styles.favouriteImage}>
              <img src="https://i.ytimg.com/vi/9_0j8BOBiE8/maxresdefault.jpg" alt="สวนบ่อแก้ว" />
            </div>
            <div className={styles.favouriteInfo}>
              <h3 className={styles.favouriteTitle}>สวนบ่อแก้ว</h3>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🚗</span>
                <span className={styles.infoText}>20 km from city center</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🎫</span>
                <span className={styles.infoText}>Free entrance</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕒</span>
                <span className={styles.infoText}>Open 08:00 am - 17:00 pm</span>
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
                  View Place
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>4.2</div>
              <div className={styles.ratingText}>Very Good</div>
              <div className={styles.reviewCount}>12 reviews</div>
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
                <span className={styles.infoIcon}>🚗</span>
                <span className={styles.infoText}>20 km from city center</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🎫</span>
                <span className={styles.infoText}>Free entrance</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕒</span>
                <span className={styles.infoText}>Open 08:00 am - 17:00 pm</span>
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
                  View Place
                </button>
              </div>
            </div>
            
            <div className={styles.destinationRating}>
              <div className={styles.ratingScore}>4.0</div>
              <div className={styles.ratingText}>Very Good</div>
              <div className={styles.reviewCount}>8 reviews</div>
            </div>
          </div>
        </div>

        {/* Create Route Map Button */}
        <button className={styles.createRouteButton} onClick={handleCreateRouteMap}>
          Create Route Map
        </button>

      </div>

      {/* Popup for More Info */}
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
                  // Set this place as starting point logic
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

      {/* Info Popup (centered with Got it! button) */}
      {showInfoPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.infoPopup}>
            <button className={styles.closePopup} onClick={handleCloseInfoPopup}>×</button>
            <div className={styles.popupContent}>
              {/* <div className={styles.infoIconLarge}>ℹ️</div> */}
              <h3>Route Planning Information</h3>
              <p>The first location you select will be<br></br>set as the starting point of your route.</p>
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

      {/* Notification Popup */}
      {showNotification && (
        <div className={styles.notificationPopup}>
          <div className={styles.notificationContent}>
            {notificationMessage}
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

export default Favourites;