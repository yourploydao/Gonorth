package information

import (
	"fmt"
	"net/http"
	"strconv"

	"Gonorth/orm"
	"github.com/gin-gonic/gin"
)

// ฟังก์ชันสำหรับสร้างรีวิวใหม่
func CreateReviewForLocation(c *gin.Context) {
	var input struct {
		LocationID uint   `json:"location_id"`
		Rating     int    `json:"rating"`
		Comment    string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบ rating ว่าอยู่ในช่วง 1-5
	if input.Rating < 1 || input.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 1 and 5"})
		return
	}

	// ดึงข้อมูล user จาก context
	userRaw, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, ok := userRaw.(orm.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user in context"})
		return
	}

	// ตรวจสอบว่า Location มีจริงไหม
	var location orm.Location
	if err := orm.Db.First(&location, input.LocationID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Location not found"})
		return
	}

	// ตรวจสอบว่า user เคยรีวิวสถานที่นี้แล้วหรือยัง
	var existingReview orm.Review
	if err := orm.Db.Where("user_id = ? AND location_id = ?", user.ID, input.LocationID).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already reviewed this location"})
		return
	}

	// สร้างรีวิวใหม่
	review := orm.Review{
		UserID:     user.ID,
		LocationID: input.LocationID,
		Rating:     input.Rating,
		Comment:    input.Comment,
	}

	if err := orm.Db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	if err := orm.Db.Preload("User").First(&review, review.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load review data"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// ดึงรีวิวของสถานที่
func GetLocationReviews(c *gin.Context) {
	locationID := c.Param("id")
	fmt.Printf("Getting reviews for location ID: %s\n", locationID)

	// รับ query parameters สำหรับ pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	offset := (page - 1) * limit

	var reviews []orm.Review
	var totalCount int64

	// นับจำนวนรีวิวทั้งหมด
	countResult := orm.Db.Model(&orm.Review{}).Where("location_id = ?", locationID).Count(&totalCount)
	if countResult.Error != nil {
		fmt.Printf("Error counting reviews: %v\n", countResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count reviews: " + countResult.Error.Error()})
		return
	}
	fmt.Printf("Total reviews count: %d\n", totalCount)

	// ดึงรีวิวพร้อม User data และ pagination
	reviewsResult := orm.Db.
		Preload("User").
		Preload("Location").
		Where("location_id = ?", locationID).
		Order("rating DESC, created_at DESC, updated_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reviews)

	if reviewsResult.Error != nil {
		fmt.Printf("Error fetching reviews: %v\n", reviewsResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews: " + reviewsResult.Error.Error()})
		return
	}
	fmt.Printf("Found %d reviews\n", len(reviews))

	// คำนวณข้อมูล pagination
	totalPages := int((totalCount + int64(limit) - 1) / int64(limit))

	response := gin.H{
		"reviews": reviews,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"total_count":  totalCount,
			"has_next":     page < totalPages,
			"has_prev":     page > 1,
		},
	}

	fmt.Printf("Sending response with %d reviews\n", len(reviews))
	c.JSON(http.StatusOK, response)
}

// ดึงสถิติรีวิวของสถานที่
func GetLocationReviewStats(c *gin.Context) {
	locationID := c.Param("id")

	var stats struct {
		TotalReviews       int64         `json:"total_reviews"`
		AverageRating      float64       `json:"average_rating"`
		RatingDistribution map[int]int64 `json:"rating_distribution"`
	}

	// นับจำนวนรีวิวทั้งหมด
	orm.Db.Model(&orm.Review{}).Where("location_id = ?", locationID).Count(&stats.TotalReviews)

	// คำนวณ rating เฉลี่ย
	var avgResult struct {
		Avg float64
	}
	orm.Db.Model(&orm.Review{}).
		Select("AVG(rating) as avg").
		Where("location_id = ?", locationID).
		Scan(&avgResult)
	stats.AverageRating = avgResult.Avg

	stats.RatingDistribution = make(map[int]int64)
	for i := 1; i <= 5; i++ {
		var count int64
		orm.Db.Model(&orm.Review{}).
			Where("location_id = ? AND rating = ?", locationID, i).
			Count(&count)
		stats.RatingDistribution[i] = count
	}

	c.JSON(http.StatusOK, stats)
}