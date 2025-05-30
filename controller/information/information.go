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
