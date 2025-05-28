// story-page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/story-page.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";

const StoryPage = () => {
  const router = useRouter();
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { id } = router.query;
  const [locationData, setLocationData] = useState(null);
  const [currentMainImage, setCurrentMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (!router.isReady || !id) {
      console.log("Router not ready or no ID provided", { isReady: router.isReady, id });
      return;
    }

    const fetchLocation = async () => {
      try {
        const token = localStorage.getItem("token");

        console.log("Fetching location with ID:", id);

        const res = await fetch(`http://localhost:8080/location/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
        });

        if (!res.ok) {
          console.error("API response not OK:", res.status, res.statusText);
          return;
        }

        const data = await res.json();
        console.log("LocationsName:", data.LocationsName); 
        console.log("Images:", data.Images); 
        console.log("Activities:", data.Activities); 
        
        setLocationData(data);

        if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
          console.log("Processing images...");
          const images = data.Images;
          const mainImage = images.find((img) => img.IsMain) || images[0];
          
          console.log("Main image found:", mainImage);
          console.log("All image URLs:", images.map((img) => img.URL));
          
          setCurrentMainImage(mainImage?.URL || null);
          setGalleryImages(images.map((img) => img.URL));
        } else {
          console.log("No images found or Images is not an array");
          setCurrentMainImage(null);
          setGalleryImages([]);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setLocationData(null);
      }
    };


    fetchLocation();
  }, [id]);

  const handleToggleFavorite = async () => {
    setIsInFavorites(!isInFavorites);
  };

  const handleThumbnailClick = (imageUrl) => {
    setCurrentMainImage(imageUrl);
  };

  const handleReviewSubmit = () => {
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setReviewRating(0);
    setReviewText("");
  };

  const handleSubmitReview = () => {
    // Here you would implement the logic to submit the review to the database
    console.log("Submitting review:", {
      rating: reviewRating,
      text: reviewText,
      username: username
    });
    
    // Close the modal after submission
    handleCloseModal();
  };

  const handleStarClick = (rating) => {
    setReviewRating(rating);
  };

  return (
    <div className={styles.container}>
      {/* Use the Header component */}
      <Header />

      <div className={styles.mainContent}>
        {/* Destination Title with Favorite Button */}
        <div className={styles.destinationTitleSection}>
          <h1 className={styles.destinationTitle}>{locationData?.LocationsName}</h1>
          {/* <p className={styles.subtitle}>{locationData?.Topic}</p> */}
          <button 
            className={`${styles.favoriteButton} ${isInFavorites ? styles.active : ''}`}
            onClick={handleToggleFavorite}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 75.35l-3.45-3.32C30.4 57.36 22 48.28 22 37.5 22 28.42 28.42 22 37.5 22c5.24 0 10.41 2.81 12.5 6.09 2.09-3.28 7.26-6.09 12.5-6.09 9.08 0 15.5 6.42 15.5 15.5 0 10.78-8.4 19.86-24.55 34.54L50 75.35z"/>
            </svg>
          </button>
        </div>

        {/* Rating Display */}
        <div className={styles.ratingContainer}>
          <div className={styles.ratingScore}>4.2</div>
          <div className={styles.ratingText}>ดีเยี่ยม</div>
          <div className={styles.reviewCount}>54 รีวิว</div>
        </div>

        <div className={styles.mainImageContainer}>
          {currentMainImage && (
            <img 
              src={currentMainImage}
              alt={locationData?.LocationsName || "main image"} 
              className={styles.mainImage} 
            />
          )}
        </div>

        <div className={styles.thumbnailGallery}>
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              className={styles.thumbnail}
              onClick={() => handleThumbnailClick(image)}
            >
              <img src={image} alt={`thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Address & Time Section */}
        <div className={styles.infoContainer}>
          <h2 className={styles.infoTitle}>Address & Time</h2>
          <div className={styles.infoContent}>
            <div className={styles.addressInfo}>

            <span className={styles.infoIcon}>
              <img src="https://cdn-icons-png.flaticon.com/128/684/684908.png" alt="Location Icon" />
            </span>
              <span className={styles.infoText}>{locationData?.Address}</span>
            </div>
            <div className={styles.timeInfo}>
            <span className={styles.infoIcon}>
              <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Location Icon" />
            </span>
              <span className={styles.infoText}>เปิดให้เข้าชม : {locationData?.OpenTime}</span>
            </div>
          </div>
        </div>

        {/* Destination Details */}
        <div className={styles.detailsContainer}>
          <h2 className={styles.detailsTitle}>ประวัติของ{locationData?.LocationsName}</h2>
          <div className={styles.detailsContent}>
            {locationData?.History && (
              <p>{locationData.History}</p>
            )}

            <h3 className={styles.activitiesTitle}>กิจกรรมแนะนำ</h3>
            <ul className={styles.activitiesList}>
              {locationData?.Activities.map((activity, index) => (
                <li key={index}>
                  <span className={styles.activityDot}></span>
                  {activity.ActivityName}
                </li>
              ))}
            </ul>
            
            <div className={styles.parkingInfo}>
              <span className={styles.parkingIcon}>P</span>
              <span className={styles.parkingText}>{locationData?.ParkingDetails}</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>รีวิว</h2>
            <button className={styles.reviewButton} onClick={handleReviewSubmit}>เขียนรีวิวของคุณ</button>
          </div>
          
          <div className={styles.overallRating}>
            <div className={styles.ratingNumber}>4.2</div>
            <div className={styles.ratingLabel}>ดีเยี่ยม</div>
          </div>
          
          {/* Individual Reviews */}
          <div className={styles.reviewList}>
            <div className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="User" className={styles.reviewerImage} />
                  <div className={styles.reviewerDetails}>
                    <div className={styles.reviewRating}>5.0 ยอดเยี่ยม</div>
                    <div className={styles.reviewerName}>จอนจองกุก</div>
                  </div>
                </div>
                <div className={styles.reviewFlag}>
                <img src="https://cdn-icons-png.flaticon.com/128/11244/11244136.png" alt="Flag Icon" />
              </div>
              </div>
              <div className={styles.reviewContent}>
              สวนสนบ่อแก้วบรรยากาศดีมาก ร่มรื่นและเงียบสงบ เหมาะสำหรับพักผ่อนสุด ๆ ครับ
              </div>
            </div>
            
            <div className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="User" className={styles.reviewerImage} />
                  <div className={styles.reviewerDetails}>
                    <div className={styles.reviewRating}>5.0 ดีเยี่ยม</div>
                    <div className={styles.reviewerName}>เจคคึ</div>
                  </div>
                </div>
                <div className={styles.reviewFlag}>
                <img src="https://cdn-icons-png.flaticon.com/128/11244/11244136.png" alt="Flag Icon" />
              </div>
              </div>
              <div className={styles.reviewContent}>
              ชอบที่นี่มาก ต้นสนเยอะ อากาศสดชื่น เดินเล่นสบาย ๆ ได้ทั้งวันเลย
              </div>
            </div>
            
            <div className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="User" className={styles.reviewerImage} />
                  <div className={styles.reviewerDetails}>
                    <div className={styles.reviewRating}>5.0 ดีเยี่ยม</div>
                    <div className={styles.reviewerName}>จอนละจอนละจอห์นนี่</div>
                  </div>
                </div>
                <div className={styles.reviewFlag}>
                <img src="https://cdn-icons-png.flaticon.com/128/11244/11244136.png" alt="Flag Icon" />
              </div>
              </div>
              <div className={styles.reviewContent}>
              เป็นสวนที่สงบ เหมาะกับการมานั่งพักผ่อน ถ่ายรูปก็สวย แนะนำเลยครับ
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.paginationArrow}>←</button>
            <div className={styles.paginationText}>1 จาก 2</div>
            <button className={styles.paginationArrow}>→</button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>เขียนความคิดเห็นของคุณ</h3>
              <button className={styles.closeModalButton} onClick={handleCloseModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userReviewInfo}>
                <img src="/assets/Profile.jpg" alt={username} className={styles.reviewerImage} />
                <span className={styles.reviewerName}>{username}</span>
              </div>

              <div className={styles.starRatingContainer}>
                <div className={styles.starRatingLabel}>การให้คะแนนของคุณ</div>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      className={`${styles.star} ${reviewRating >= star ? styles.active : ''}`}
                      onClick={() => handleStarClick(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className={styles.ratingText}>
                  {reviewRating === 1 && "แย่"}
                  {reviewRating === 2 && "พอใช้"}
                  {reviewRating === 3 && "ดี"}
                  {reviewRating === 4 && "ดีมาก"}
                  {reviewRating === 5 && "ยอดเยี่ยม"}
                </div>
              </div>

              <div className={styles.reviewTextareaContainer}>
                <label htmlFor="reviewText" className={styles.reviewTextLabel}>ความคิดเห็นของคุณ</label>
                <textarea
                  id="reviewText"
                  className={styles.reviewTextarea}
                  placeholder="แชร์ประสบการณ์ของคุณกับสถานที่แห่งนี้..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelButton} onClick={handleCloseModal}>ยกเลิก</button>
                <button 
                  className={styles.submitButton} 
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0}
                >
                  ส่งรีวิว
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Replaced with Footer component */}
      <Footer />
    </div>
  );
};

export default StoryPage;