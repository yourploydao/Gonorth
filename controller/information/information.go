package information

import (
	"fmt"
	"net/http"
	"strconv"

	"Gonorth/orm"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Location
type LocationInput struct {
	LocationsName   string         `json:"LocationsName"`
	LocationsRating float64        `json:"LocationsRating"`
	ReviewCount     int            `json:"ReviewCount"`
	Address         string         `json:"Address"`
	OpenTime        string         `json:"OpenTime"`
	Topic           string         `json:"Topic"`
	History         string         `json:"History"`
	HasParking      bool           `json:"HasParking"`
	ParkingDetails	string		   `json:"ParkingDetails"`	
	HasEntrance		bool	 	   `json:"HasEntrance"`
	EntranceDetails string		   `json:"EntranceDetails"`
	// Reviews			string		   `json:"Reviews"`
	BudgetRange     string           `json:"BudgetRange"`
	Season    		string           `json:"Season"`
	Images          []orm.Image    `json:"Images"`
	Activities      []orm.Activity `json:"Activities"`
	Tags            []struct {
		TagName string `json:"TagName"`
	} `json:"Tags"`
}

func CreateLocation(c *gin.Context) {
	var input LocationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ดึง tag จริงจาก db ตาม TagName ที่ส่งมา
	var tags []orm.Tag
	for _, t := range input.Tags {
		var tag orm.Tag
		err := orm.Db.Where("tag_name = ?", t.TagName).First(&tag).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Tag not found: " + t.TagName})
				return
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		tags = append(tags, tag)
	}

	location := orm.Location{
		LocationsName:   input.LocationsName,
		LocationsRating: input.LocationsRating,
		ReviewCount:     input.ReviewCount,
		Address:         input.Address,
		OpenTime:        input.OpenTime,
		Topic:           input.Topic,
		History:         input.History,
		HasParking:		 input.HasParking,   
		ParkingDetails:	 input.ParkingDetails,	
		HasEntrance:	 input.HasEntrance,		
		EntranceDetails: input.EntranceDetails,
		// Reviews: 		 input.Reviews,
		BudgetRange:     input.BudgetRange,
		Images:          input.Images,
		Activities:      input.Activities,
		Tags:            tags,
	} 

	if err := orm.Db.Create(&location).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, location)
}

// Image
func CreateImage(c *gin.Context) {
	var image orm.Image
	if err := c.ShouldBindJSON(&image); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := orm.Db.Create(&image).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, image)
}

// Activity
func CreateActivity(c *gin.Context) {
	var activity orm.Activity
	if err := c.ShouldBindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := orm.Db.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, activity)
}

// Tag
func CreateTag(c *gin.Context) {
	var tag orm.Tag
	if err := c.ShouldBindJSON(&tag); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := orm.Db.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, tag)
}

// ExternalScore
func CreateExternalScore(c *gin.Context) {
	var score orm.ExternalScore
	if err := c.ShouldBindJSON(&score); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := orm.Db.Create(&score).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, score)
}

func GetLocation(c *gin.Context) {
	locationID := c.Param("id")
	var location orm.Location

	if err := orm.Db.
		Preload("Images").
		Preload("Activities").
		First(&location, locationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	c.JSON(http.StatusOK, location)
}

func GetLatestLocations(c *gin.Context) {
    limitParam := c.DefaultQuery("limit", "3")
    limit, err := strconv.Atoi(limitParam)
    if err != nil || limit <= 0 {
        limit = 3
    }

    var locations []orm.Location 
    result := orm.Db.Preload("Images").Order("created_at DESC").Limit(limit).Find(&locations)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, locations) 
}

func GetAllLocations(c *gin.Context) {
    var locations []orm.Location

    result := orm.Db.Preload("Images").Find(&locations)
    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, locations)
}

func GetLocationsBySeason(c *gin.Context) {
	season := c.Param("season")

	var locations []orm.Location
	result := orm.Db.
		Preload("Images").
		Preload("Activities").
		Where("season = ?", season).
		Find(&locations)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, locations)
}

func AddFavorite(c *gin.Context) {
    var input struct {
        LocationID uint `json:"location_id"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

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

    // ตรวจว่า Location มีจริงไหม
    var location orm.Location
    if err := orm.Db.First(&location, input.LocationID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location"})
        return
    }

    // ตรวจว่า favorite นี้เคยมีหรือยัง
    var existing orm.UserFavorite
    if err := orm.Db.Where("user_id = ? AND location_id = ?", user.ID, input.LocationID).First(&existing).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Already in favorites"})
        return
    }

    favorite := orm.UserFavorite{
        UserID:     user.ID,
        LocationID: input.LocationID,
    }

    if err := orm.Db.Create(&favorite).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create favorite"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Added to favorites"})
}

func CheckFavorite(c *gin.Context) {
    locationIDParam := c.Param("locationID")
    locationIDUint64, err := strconv.ParseUint(locationIDParam, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location ID"})
        return
    }
    locationID := uint(locationIDUint64)

    userValue, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    user, ok := userValue.(orm.User)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
        return
    }

    var favorite orm.UserFavorite
    result := orm.Db.Where("user_id = ? AND location_id = ?", user.ID, locationID).First(&favorite)

    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            c.JSON(http.StatusOK, gin.H{"isFavorite": false})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        }
        return
    }

    c.JSON(http.StatusOK, gin.H{"isFavorite": true})
}

func DeleteFavorite(c *gin.Context) {
	var request struct {
		LocationID uint `json:"location_id"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}
	user, ok := userValue.(orm.User)
	if !ok {
		c.JSON(500, gin.H{"error": "Invalid user type"})
		return
	}

	result := orm.Db.Unscoped().Where("user_id = ? AND location_id = ?", user.ID, request.LocationID).Delete(&orm.UserFavorite{})
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to hard delete favorite"})
		return
	}

	c.JSON(200, gin.H{"message": "Permanently removed from favorites"})
}

func GetFavorites(c *gin.Context) {
    userVal, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
        return
    }

    user, ok := userVal.(orm.User)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "User in context is invalid"})
        return
    }

    var favorites []orm.UserFavorite
    if err := orm.Db.Preload("Location.Images").Where("user_id = ?", user.ID).Find(&favorites).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorites"})
        return
    }

    c.JSON(http.StatusOK, favorites)
}

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

	// อัปเดต rating เฉลี่ยและจำนวนรีวิวของ Location
	updateLocationRating(input.LocationID)

	// ดึงข้อมูลรีวิวพร้อม User เพื่อส่งกลับ
	if err := orm.Db.Preload("User").First(&review, review.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load review data"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// ฟังก์ชันสำหรับดึงรีวิวของสถานที่
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
        Order("rating DESC, created_at DESC").
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
        "reviews":     reviews,
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

// ฟังก์ชันสำหรับดึงสถิติรีวิวของสถานที่
func GetLocationReviewStats(c *gin.Context) {
	locationID := c.Param("id")

	var stats struct {
		TotalReviews   int64   `json:"total_reviews"`
		AverageRating  float64 `json:"average_rating"`
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

	// คำนวณการกระจายของ rating
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

// ฟังก์ชันสำหรับแก้ไขรีวิว
func UpdateReview(c *gin.Context) {
	reviewID := c.Param("reviewId")
	
	var input struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบ rating
	if input.Rating < 1 || input.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 1 and 5"})
		return
	}

	// ดึงข้อมูล user
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

	// หารีวิวและตรวจสอบว่าเป็นของ user นี้หรือไม่
	var review orm.Review
	if err := orm.Db.Where("id = ? AND user_id = ?", reviewID, user.ID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found or not authorized"})
		return
	}

	// อัปเดตรีวิว
	review.Rating = input.Rating
	review.Comment = input.Comment

	if err := orm.Db.Save(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	// อัปเดต rating เฉลี่ยของ Location
	updateLocationRating(review.LocationID)

	c.JSON(http.StatusOK, review)
}

// ฟังก์ชันสำหรับลบรีวิว
func DeleteReview(c *gin.Context) {
	reviewID := c.Param("reviewId")

	// ดึงข้อมูล user
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

	// หารีวิวและตรวจสอบ ownership
	var review orm.Review
	if err := orm.Db.Where("id = ? AND user_id = ?", reviewID, user.ID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found or not authorized"})
		return
	}

	locationID := review.LocationID

	// ลบรีวิว
	if err := orm.Db.Delete(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	// อัปเดต rating เฉลี่ยของ Location
	updateLocationRating(locationID)

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}

// ฟังก์ชันช่วยสำหรับอัปเดต rating เฉลี่ยของ Location
func updateLocationRating(locationID uint) {
	var avgResult struct {
		Avg   float64
		Count int64
	}

	orm.Db.Model(&orm.Review{}).
		Select("AVG(rating) as avg, COUNT(*) as count").
		Where("location_id = ?", locationID).
		Scan(&avgResult)

	// อัปเดต Location
	orm.Db.Model(&orm.Location{}).
		Where("id = ?", locationID).
		Updates(orm.Location{
			LocationsRating: avgResult.Avg,
			ReviewCount:     int(avgResult.Count),
		})
}

