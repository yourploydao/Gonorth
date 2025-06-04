// story-page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/story-page.module.css";

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
  
  // เพิ่ม state สำหรับข้อมูลผู้ใช้
  const [user, setUser] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    total_reviews: 0,
    average_rating: 0,
    rating_distribution: {}
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id) {
      return;
    }

    const token = localStorage.getItem("token");  

    const fetchUserProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8080/profile", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("User profile (review):", data);
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchLocation = async () => {
      try {
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
        console.log("Location data:", data);
        setLocationData(data);

        // ใช้ field images, isMain, url (ตัวเล็ก)
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const images = data.images;
          const mainImage = images.find((img) => img.IsMain) || images[0];
          setCurrentMainImage(mainImage?.URL || null);
          setGalleryImages(images.map((img) => img.URL));
        } else {
          setCurrentMainImage(null);
          setGalleryImages([]);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setLocationData(null);
      }
    };

    const checkFavorite = async () => {
      try {
        const res = await fetch(`http://localhost:8080/favorite/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Favorite check data:", data);
          setIsInFavorites(data.isFavorite);
        } else {
          setIsInFavorites(false);
        }
      } catch (error) {
        console.error("Error checking favorite:", error);
        setIsInFavorites(false);
      }
    };

    // ดึงข้อมูลรีวิว
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const res = await fetch(`http://localhost:8080/location/${id}/reviews?page=${currentPage}&limit=5`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          console.log("Fetched reviews:", data.reviews);
          setTotalPages(data.pagination?.total_pages || 1);
        } else {
          console.error("Failed to fetch reviews:", res.status, res.statusText);
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    // ดึงสถิติรีวิว
    const fetchReviewStats = async () => {
      try {
        const res = await fetch(`http://localhost:8080/location/${id}/review-stats`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Review stats data:", data);
          setReviewStats(data);
        }
      } catch (error) {
        console.error("Error fetching review stats:", error);
      }
    };

    // เรียกฟังก์ชันทั้งหมด
    fetchLocation();
    checkFavorite();
    fetchReviews();
    fetchReviewStats();
    fetchUserProfile();
  }, [id, router.isReady, currentPage]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const url = `http://localhost:8080/favorite`;
      const method = isInFavorites ? "DELETE" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location_id: parseInt(id) }),
      });

      if (res.ok) {
        setIsInFavorites((prev) => !prev);
      } else {
        const errorText = await res.text();
        console.error("Toggle favorite failed:", errorText);
        alert("Fail to add favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Server error");
    }
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

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนเขียนรีวิว");
      return;
    }

    if (reviewRating === 0) {
      alert("กรุณาให้คะแนน");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          location_id: parseInt(id),
          rating: reviewRating,
          comment: reviewText.trim()
        }),
      });

      if (res.ok) {
        alert("เขียนรีวิวสำเร็จ!");
        handleCloseModal();
        
        const reviewsRes = await fetch(`http://localhost:8080/location/${id}/reviews?page=1&limit=5`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
          setCurrentPage(1);
        }

        const statsRes = await fetch(`http://localhost:8080/location/${id}/review-stats`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setReviewStats(statsData);
        }

      } else {
        const errorData = await res.json();
        alert(errorData.error || "เกิดข้อผิดพลาดในการเขียนรีวิว");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("เกิดข้อผิดพลาดในการเขียนรีวิว");
    }
  };

  const handleStarClick = (rating) => {
    setReviewRating(rating);
  };

  // Function สำหรับแปลงคะแนนเป็นข้อความ
  const getRatingText = (rating) => {
    if (rating >= 4.5) return "ยอดเยี่ยม";
    if (rating >= 4.0) return "ดีเยี่ยม";
    if (rating >= 3.0) return "ดี";
    if (rating >= 2.0) return "พอใช้";
    return "แย่";
  };

  // Function สำหรับ pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Function สำหรับ format วันที่
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  // Function สำหรับแสดงชื่อผู้ใช้ - ปรับปรุงให้รับมือกับโครงสร้างข้อมูลที่หลากหลาย
  const getReviewerName = (review) => {
    // ตรวจสอบทุกความเป็นไปได้
    if (review?.User?.username) {
      return review.User.username;
    }
    
    if (review?.User?.firstname && review?.User?.lastname) {
      return `${review.User.firstname} ${review.User.lastname}`;
    }
    
    if (review?.User?.firstname) {
      return review.User.firstname;
    }
    
    if (review?.username) {
      return review.username;
    }
    
    if (review?.user_name) {
      return review.user_name;
    }
    
    if (review?.reviewer_name) {
      return review.reviewer_name;
    }
    
    // ตรวจสอบ fields อื่นๆ ที่อาจมี
    const possibleNameFields = [
      'name', 'full_name', 'display_name', 'first_name', 'last_name'
    ];
    
    for (const field of possibleNameFields) {
      if (review?.[field]) {
        return review[field];
      }
    }
    
    return 'ผู้ใช้งาน';
  };

  const getReviewComment = (review) => {
    if (review?.comment && review.comment.trim() !== '') {
      return review.comment;
    }
    
    if (review?.review_text && review.review_text.trim() !== '') {
      return review.review_text;
    }
    
    if (review?.text && review.text.trim() !== '') {
      return review.text;
    }
    
    // ตรวจสอบ fields อื่นๆ ที่อาจมี
    const possibleCommentFields = [
      'content', 'description', 'message', 'review_content'
    ];
    
    for (const field of possibleCommentFields) {
      if (review?.[field] && review[field].trim() !== '') {
        return review[field];
      }
    }
    
    return 'ไม่มีความคิดเห็นเพิ่มเติม';
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Destination Title with Favorite Button */}
        <div className={styles.destinationTitleSection}>
          <h1 className={styles.destinationTitle}>{locationData?.name}</h1>
          <button 
            className={`${styles.favoriteButton} ${isInFavorites ? styles.active : ''}`}
            onClick={handleToggleFavorite}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 75.35l-3.45-3.32C30.4 57.36 22 48.28 22 37.5 22 28.42 28.42 22 37.5 22c5.24 0 10.41 2.81 12.5 6.09 2.09-3.28 7.26-6.09 12.5-6.09 9.08 0 15.5 6.42 15.5 15.5 0 10.78-8.4 19.86-24.55 34.54L50 75.35z"/>
            </svg>
          </button>
        </div>

        {/* Rating Display - ใช้ข้อมูลจาก reviewStats */}
        <div className={styles.ratingContainer}>
          <div className={styles.ratingScore}>
            {reviewStats.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0'}
          </div>
          <div className={styles.ratingText}>
            {reviewStats.average_rating ? getRatingText(reviewStats.average_rating) : 'ไม่มีรีวิว'}
          </div>
          <div className={styles.reviewCount}>
            {reviewStats.total_reviews} รีวิว
          </div>
        </div>

        <div className={styles.mainImageContainer}>
          {currentMainImage && (
            <img 
              src={currentMainImage}
              alt={locationData?.name || "main image"} 
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
              <span className={styles.infoText}>{locationData?.address}</span>
            </div>
            <div className={styles.timeInfo}>
              <span className={styles.infoIcon}>
                <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" alt="Location Icon" />
              </span>
              <span className={styles.infoText}>เปิดให้เข้าชม : {locationData?.open_time} - {locationData?.close_time}</span>
            </div>
          </div>
        </div>

        {/* Destination Details */}
        <div className={styles.detailsContainer}>
          <h2 className={styles.detailsTitle}>ประวัติของ {locationData?.name}</h2>
          <div className={styles.detailsContent}>
            {locationData?.history && (
              <p>{locationData.history}</p>
            )}

            <h3 className={styles.activitiesTitle}>กิจกรรมแนะนำ</h3>
            <ul className={styles.activitiesList}>
              {locationData?.activities && locationData.activities.map((activity, index) => (
                <li key={index}>
                  <span className={styles.activityDot}></span>
                  {activity.ActivityName}
                </li>
              ))}
            </ul>
            
            <div className={styles.parkingInfo}>
              <span className={styles.parkingIcon}>P</span>
              <span className={styles.parkingText}>{locationData?.parking_details}</span>
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
            <div className={styles.ratingNumber}>
              {reviewStats.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0'}
            </div>
            <div className={styles.ratingLabel}>
              {reviewStats.average_rating ? getRatingText(reviewStats.average_rating) : 'ไม่มีรีวิว'}
            </div>
          </div>
          
          {/* Individual Reviews */}
          <div className={styles.reviewList}>
            {isLoadingReviews ? (
              <div className={styles.loadingMessage}>กำลังโหลดรีวิว...</div>
            ) : reviews.length > 0 ? (
              [...reviews]
                .sort((a, b) => (b.Rating || 0) - (a.Rating || 0))
                .map((review, index) => (
                <div key={review?.ID || index} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <img
                        src={review?.user?.ProfileImage || "https://cdn-icons-png.flaticon.com/128/847/847969.png"}
                        alt={`${review?.user?.Firstname || ""} ${review?.user?.Lastname || ""}`}
                        className={styles.reviewerImage}
                      />
                      <div className={styles.reviewerDetails}>
                        <div className={styles.reviewRating}>
                          {/* ใช้ดาวแสดง rating แทน ถ้าจะใช้เลขก้เอาที่คอมเมนต์ได้เลย */}
                          {/* <div className={styles.reviewRating}>
                            {review?.Rating || 0}.0 {getRatingText(review?.Rating || 0)}
                          </div> */}
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={review?.Rating >= star ? styles.activeStar : styles.inactiveStar}
                              style={{ color: review?.Rating >= star ? '#FFD700' : '#ccc' }} // gold or gray
                            >
                              ★
                            </span>
                          ))}
                          <span className={styles.ratingText}>
                            {getRatingText(review?.Rating || 0)}
                          </span>
                        </div>
                        <div className={styles.reviewerName}>
                          {review?.user?.Firstname} {review?.user?.Lastname}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reviewContent}>
                    {review?.Comment || "ไม่มีความคิดเห็น"}
                  </div>
                  {review?.created_at && (
                    <div className={styles.reviewDate}>
                      {formatDate(review.created_at)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noReviews}>ยังไม่มีรีวิวสำหรับสถานที่นี้</div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.paginationArrow}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ←
              </button>
              <div className={styles.paginationText}>
                {currentPage} จาก {totalPages}
              </div>
              <button 
                className={styles.paginationArrow}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal - แก้ไขให้แสดงข้อมูลผู้ใช้จาก profile */}
      {showReviewModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>เขียนความคิดเห็นของคุณ</h3>
              <button className={styles.closeModalButton} onClick={handleCloseModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {user && (
                <div className={styles.userReviewInfo}>
                  <img
                    src={user.profileImage}
                    alt={`${user.firstname} ${user.lastname}`}
                    className={styles.reviewerImage}
                  />
                  <span className={styles.profileName}>
                    {user.firstname} {user.lastname} 
                  </span>
                </div>
              )}
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
                  value={reviewText || ""}
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
    </div>
  );
};

export default StoryPage;