// story-page.js
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/story-page.module.css";
import Header from "../components/navigation";
import Footer from "../components/footer";

const StoryPage = () => {
  const router = useRouter();
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [currentMainImage, setCurrentMainImage] = useState("https://today-obs.line-scdn.net/0hD9HSJp0yGxZ1KgpR3SxkQU18F2dGTAEfV08GIAMoFXVcBl9BGkpIdVIoQjpREwsVVRhScFZ6EiIMTl5AGg/w644");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [username, setUsername] = useState("John D."); // This would be fetched from the database

  // Sample image gallery data - would be fetched from database
  const galleryImages = [
    "https://today-obs.line-scdn.net/0hD9HSJp0yGxZ1KgpR3SxkQU18F2dGTAEfV08GIAMoFXVcBl9BGkpIdVIoQjpREwsVVRhScFZ6EiIMTl5AGg/w644",
    "https://static.ticket2attraction.com/gallery/1ea4fe7f-71c1-4170-b95f-4f0b70f19ece/adcfe8c9-9316-4e4f-89c2-4669cec51d5d-1200.webp",
    "https://i.ytimg.com/vi/9_0j8BOBiE8/maxresdefault.jpg",
    "https://www.govivigo.com/content/upload/images/Lampang/Kau-Fau-Waterfall.jpg",
    "https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg",
    "https://jjubbbbb.wordpress.com/wp-content/uploads/2016/11/grand-canyon-of-chiang-mai2.jpg",
    "https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg"
  ];

  const handleToggleFavorite = () => {
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
          <h1 className={styles.destinationTitle}>สวนสนบ่อแก้ว</h1>
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
          <div className={styles.ratingText}>Very Good</div>
          <div className={styles.reviewCount}>54 reviews</div>
        </div>

        {/* Main Image Carousel */}
        <div className={styles.mainImageContainer}>
          <img 
            src={currentMainImage}
            alt="สวนสนบ่อแก้ว" 
            className={styles.mainImage} 
          />
        </div>

        {/* Thumbnail Gallery */}
        <div className={styles.thumbnailGallery}>
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              className={styles.thumbnail}
              onClick={() => handleThumbnailClick(image)}
            >
              <img src={image} alt={`สวนสนบ่อแก้ว thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Address & Time Section */}
        <div className={styles.infoContainer}>
          <h2 className={styles.infoTitle}>Address & Time</h2>
          <div className={styles.infoContent}>
            <div className={styles.addressInfo}>
              <span className={styles.infoIcon}>📍</span>
              <span className={styles.infoText}>ถนนฮอด-แม่สะเรียง ตำบลบ่อหลวง อำเภอฮอด จังหวัดเชียงใหม่</span>
            </div>
            <div className={styles.timeInfo}>
              <span className={styles.infoIcon}>🕒</span>
              <span className={styles.infoText}>เปิดให้เข้าชม : 08.00-17.00 น.</span>
            </div>
          </div>
        </div>

        {/* Destination Details */}
        <div className={styles.detailsContainer}>
          <h2 className={styles.detailsTitle}>ประวัติของสวนสนบ่อแก้ว</h2>
          <div className={styles.detailsContent}>
            <p>สวนสนบ่อแก้ว ตั้งอยู่ในอำเภอเชียงดาว จังหวัดเชียงใหม่</p>
            <p>เป็นสถานที่ท่องเที่ยวเชิงธรรมชาติที่มีความสวยงามและเป็นที่รู้จักในฐานะแหล่งท่องเที่ยวเชิงนิเวศน์ จุดเด่นของสวนสนบ่อแก้วคือการปลูกต้นสนที่มีการจัดสวนอย่างสวยงาม มีทั้งการปลูกต้นสนหลายชนิดเช่น สนสามใบ, สนสองใบ และต้นสนพันธุ์ของเขตร้อนในไทย มีลักษณะภูมิประเทศเป็นป่าสนที่มีวิวทิศที่สวยงาม รวมถึงอากาศเย็นสบายตลอดทั้งปี</p>
            <p>สวนสนบ่อแก้วถือเป็นพื้นที่ที่อุดมสมบูรณ์ที่ใช้ประโยชน์จากทรัพยากรป่าไม้และเนื้อเวลาผ่านไปได้มีการพัฒนาและพัฒนาให้กลายเป็นแหล่งท่องเที่ยวที่สำคัญ โดยเฉพาะนักท่องเที่ยวที่สนใจในธรรมชาติและการเดินป่า นอกจากความสวยงามของต้นสนแล้ว สวนสนบ่อแก้วยังเป็นสถานที่ที่นักท่องเที่ยวสามารถทำกิจกรรมต่าง ๆ เช่น เดินป่า ขี่จักรยาน และพักผ่อนในบรรยากาศที่เงียบสงบ</p>
            <p>นอกจากนี้ ยังมีเส้นทางเดินป่าที่เชื่อมต่อไปยังสถานที่ท่องเที่ยวอื่น ๆ ในเขตอุทยานแห่งชาติ สวนสนบ่อแก้วถือเป็นหนึ่งในจุดท่องเที่ยวที่นักท่องเที่ยวสามารถสัมผัสกับธรรมชาติที่สวยงามและเงียบสงบในภาคเหนือ</p>
            <p>สวนสนบ่อแก้ว ที่เที่ยว Unseen อีกแห่งของเชียงใหม่ สวยหยดกับเกาะมาบาบิ เกาะหิเลอเที่ยวฉะ ตั้งอยู่ใกล้กับ อุทยานแห่งชาติออบหลวง ไปประมาณ 22 กิโลเมตร เป็นพื้นที่ทดลองปลูกสนอยู่หลายชนิดต่างๆ ทำให้มีต้นสนสูงเรียงราย ไปอย่างสวยงาม ได้ฟีล Alice in Wonderland ไปอีก งานนี้หลุดเธอสสวยๆ ไปยิ้มเก้อ ถ่ายรูปกันได้เลยจ้า</p>
            
            <h3 className={styles.activitiesTitle}>กิจกรรมแนะนำ</h3>
            <ul className={styles.activitiesList}>
              <li><span className={styles.activityDot}></span>จุดพักผ่อนชมธรรมชาติ</li>
              <li><span className={styles.activityDot}></span>เดินเล่น</li>
              <li><span className={styles.activityDot}></span>ถ่ายรูป</li>
            </ul>
            
            <div className={styles.parkingInfo}>
              <span className={styles.parkingIcon}>P</span>
              <span className={styles.parkingText}>จอดรถด้านหน้าสวนสนบ่อแก้ว ไม่มีค่าใช้จ่าย</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Reviews</h2>
            <button className={styles.reviewButton} onClick={handleReviewSubmit}>Give your review</button>
          </div>
          
          <div className={styles.overallRating}>
            <div className={styles.ratingNumber}>4.2</div>
            <div className={styles.ratingLabel}>Very good</div>
          </div>
          
          {/* Individual Reviews */}
          <div className={styles.reviewList}>
            <div className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="User" className={styles.reviewerImage} />
                  <div className={styles.reviewerDetails}>
                    <div className={styles.reviewRating}>5.0 Amazing</div>
                    <div className={styles.reviewerName}>Omar Siphron</div>
                  </div>
                </div>
                <div className={styles.reviewFlag}>🏴</div>
              </div>
              <div className={styles.reviewContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </div>
            </div>
            
            <div className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="User" className={styles.reviewerImage} />
                  <div className={styles.reviewerDetails}>
                    <div className={styles.reviewRating}>5.0 Amazing</div>
                    <div className={styles.reviewerName}>Cristofer Ekstrom Bothman</div>
                  </div>
                </div>
                <div className={styles.reviewFlag}>🏴</div>
              </div>
              <div className={styles.reviewContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </div>
            </div>
            
            <div className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img src="https://cdn-icons-png.flaticon.com/128/847/847969.png" alt="User" className={styles.reviewerImage} />
                  <div className={styles.reviewerDetails}>
                    <div className={styles.reviewRating}>5.0 Amazing</div>
                    <div className={styles.reviewerName}>Kaiya Lubin</div>
                  </div>
                </div>
                <div className={styles.reviewFlag}>🏴</div>
              </div>
              <div className={styles.reviewContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.paginationArrow}>←</button>
            <div className={styles.paginationText}>1 of 12</div>
            <button className={styles.paginationArrow}>→</button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Write Your Review</h3>
              <button className={styles.closeModalButton} onClick={handleCloseModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userReviewInfo}>
                <img src="/assets/Profile.jpg" alt={username} className={styles.reviewerImage} />
                <span className={styles.reviewerName}>{username}</span>
              </div>

              <div className={styles.starRatingContainer}>
                <div className={styles.starRatingLabel}>Your Rating</div>
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
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 5 && "Amazing"}
                </div>
              </div>

              <div className={styles.reviewTextareaContainer}>
                <label htmlFor="reviewText" className={styles.reviewTextLabel}>Your Review</label>
                <textarea
                  id="reviewText"
                  className={styles.reviewTextarea}
                  placeholder="Share your experience with this place..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelButton} onClick={handleCloseModal}>Cancel</button>
                <button 
                  className={styles.submitButton} 
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0}
                >
                  Submit Review
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