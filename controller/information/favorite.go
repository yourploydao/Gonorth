package information

import (
	"net/http"
	"strconv"

	"Gonorth/orm"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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