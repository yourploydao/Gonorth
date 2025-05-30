package information

import (
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

// Review
func CreateReview(c *gin.Context) {
	var review orm.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := orm.Db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, review)
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


