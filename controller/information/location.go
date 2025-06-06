package information

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"Gonorth/orm"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Activity
type ActivityInput struct {
	Name string `json:"Name"`
}

// Location
type LocationInput struct {
    Name             string                `json:"name"`
    Address          string                `json:"address"`
    OpenTime         string                `json:"openTime"`
    CloseTime        string                `json:"closeTime"`
    Topic            string                `json:"topic"`
    History          string                `json:"history"`
    HasParking       bool                  `json:"hasParking"`
    ParkingDetails   string                `json:"parkingDetails"`
    HasEntrance      bool                  `json:"hasEntrance"`
    EntranceDetails  string                `json:"entranceDetails"`
    BudgetRange      string                `json:"budgetRange"`
    Season           string                `json:"season"`
    DistanceFromCity float64               `json:"distanceFromCity"`
    DrivingTime      string                `json:"drivingTime"`
    AdmissionFee     int                   `json:"admission_fee"`
    Latitude         float64               `json:"latitude"`
    Longitude        float64               `json:"longitude"`
    Images           []orm.Image           `json:"images"`
    Activities       []ActivityInput       `json:"activities"`
    Tag              string                `json:"tags"` // เปลี่ยนจาก []orm.Tag เป็น string นะ
    Amenities        []orm.Amenities       `json:"amenities"`
}

func CreateLocation(c *gin.Context) {
    var input LocationInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    validTags := []string{"Nature", "Culture", "Food", "Adventure", ""}
    tagValid := false
    for _, validTag := range validTags {
        if input.Tag == validTag {
            tagValid = true
            break
        }
    }
    if !tagValid {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag: " + input.Tag})
        return
    }

    // ดึง amenities
    var amenities []orm.Amenities
    for _, am := range input.Amenities {
        var amen orm.Amenities
        if err := orm.Db.Where("amenities = ?", am.Amenities).First(&amen).Error; err == nil {
            amenities = append(amenities, amen)
        }
    }

    // สร้าง activities
    var activities []orm.Activity
    for _, a := range input.Activities {
        act := orm.Activity{ActivityName: a.Name}
        activities = append(activities, act)
    }

    location := orm.Location{
        LocationsName:    input.Name,
        Address:          input.Address,
        OpenTime:         input.OpenTime,
        CloseTime:        input.CloseTime,
        Topic:            input.Topic,
        History:          input.History,
        HasParking:       input.HasParking,
        ParkingDetails:   input.ParkingDetails,
        HasEntrance:      input.HasEntrance,
        EntranceDetails:  input.EntranceDetails,
        BudgetRange:      input.BudgetRange,
        Season:           input.Season,
        DistanceFromCity: input.DistanceFromCity,
        DrivingTime:      input.DrivingTime,
        AdmissionFee:     input.AdmissionFee,
        Latitude:         input.Latitude,
        Longitude:        input.Longitude,
        Images:           input.Images,
        Activities:       activities,
        Tag:              input.Tag, // ใช้ string โดยตรง
        Amenities:        amenities,
    }

    if err := orm.Db.Create(&location).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, location)
}

func UpdateLocation(c *gin.Context) {
    locationID := c.Param("id")
    
    id, err := strconv.ParseUint(locationID, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location ID"})
        return
    }

    var existingLocation orm.Location
    if err := orm.Db.First(&existingLocation, uint(id)).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }

    var input LocationInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบ Tag
    validTags := []string{"Nature", "Culture", "Food", "Adventure", ""}
    tagValid := false
    for _, validTag := range validTags {
        if input.Tag == validTag {
            tagValid = true
            break
        }
    }
    if !tagValid {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag: " + input.Tag})
        return
    }

    tx := orm.Db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var amenities []orm.Amenities
    for _, am := range input.Amenities {
        var amen orm.Amenities
        if err := tx.Where("amenities = ?", am.Amenities).First(&amen).Error; err == nil {
            amenities = append(amenities, amen)
        }
    }

    var activities []orm.Activity
    for _, a := range input.Activities {
        act := orm.Activity{ActivityName: a.Name}
        activities = append(activities, act)
    }

    existingLocation.LocationsName = input.Name
    existingLocation.Address = input.Address
    existingLocation.OpenTime = input.OpenTime
    existingLocation.CloseTime = input.CloseTime
    existingLocation.Topic = input.Topic
    existingLocation.History = input.History
    existingLocation.HasParking = input.HasParking
    existingLocation.ParkingDetails = input.ParkingDetails
    existingLocation.HasEntrance = input.HasEntrance
    existingLocation.EntranceDetails = input.EntranceDetails
    existingLocation.BudgetRange = input.BudgetRange
    existingLocation.Season = input.Season
    existingLocation.DistanceFromCity = input.DistanceFromCity
    existingLocation.DrivingTime = input.DrivingTime
    existingLocation.AdmissionFee = input.AdmissionFee
    existingLocation.Latitude = input.Latitude
    existingLocation.Longitude = input.Longitude
    existingLocation.Tag = input.Tag // อัปเดต Tag string

    if err := tx.Save(&existingLocation).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
        return
    }

    // ลบความสัมพันธ์เก่า
    if err := tx.Model(&existingLocation).Association("Images").Clear(); err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear images"})
        return
    }
    
    if err := tx.Model(&existingLocation).Association("Activities").Clear(); err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear activities"})
        return
    }
    
    if err := tx.Model(&existingLocation).Association("Amenities").Clear(); err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear amenities"})
        return
    }

    // เพิ่มความสัมพันธ์ใหม่
    if len(input.Images) > 0 {
        if err := tx.Model(&existingLocation).Association("Images").Append(input.Images); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update images"})
            return
        }
    }

    if len(activities) > 0 {
        if err := tx.Model(&existingLocation).Association("Activities").Append(activities); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update activities"})
            return
        }
    }

    if len(amenities) > 0 {
        if err := tx.Model(&existingLocation).Association("Amenities").Append(amenities); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update amenities"})
            return
        }
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
        return
    }

    var updatedLocation orm.Location
    if err := orm.Db.
        Preload("Images").
        Preload("Activities").
        Preload("Amenities").
        First(&updatedLocation, existingLocation.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated location"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Location updated successfully",
        "location": updatedLocation,
    })
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

func GetLocation(c *gin.Context) {
    locationID := c.Param("id")
    var location orm.Location

    if err := orm.Db.
        Preload("Images").
        Preload("Activities").
        Preload("Amenities").
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

    result := orm.Db.Preload("Images").Preload("Activities").Preload("Amenities").Find(&locations)
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
        Preload("Amenities").
        Where("season = ?", season).
        Find(&locations)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, locations)
}

func FilterLocations(c *gin.Context) {
    tag := c.Query("tag")
    distanceRange := c.Query("distance_range")
    budget := c.Query("budget_range")
    name := c.Query("name")

    var locations []orm.Location

    query := orm.Db.Preload("Images").Preload("Activities").Preload("Amenities")

    if name != "" {
        query = query.Where("locations_name ILIKE ?", "%"+name+"%")
    }

    if tag != "" && tag != "ทั้งหมด" && tag != "all" {
        query = query.Where("tag = ?", tag)
    }

    switch distanceRange {
    case "", "ทั้งหมด", "all":
    case "0 km":
        query = query.Where("distance_from_city = ?", 0)
    case "0-10 km":
        query = query.Where("distance_from_city BETWEEN ? AND ?", 0, 10)
    case "11-20 km":
        query = query.Where("distance_from_city BETWEEN ? AND ?", 11, 20)
    case "21+ km":
        query = query.Where("distance_from_city >= ?", 21)
    }

    switch budget {
    case "", "ทั้งหมด", "all":
    case "ฟรี", "0-0":
        query = query.Where("budget_range = ?", "0")
    case "0-2000":
        query = query.Where("budget_range = ?", "0-2000")
    case "2000-5000":
        query = query.Where("budget_range = ?", "2000-5000")
    case "5000-10000":
        query = query.Where("budget_range = ?", "5000-10000")
    case "10000+":
        query = query.Where("budget_range = ?", "10000+")
    }

    if err := query.Find(&locations).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to filter locations"})
        return
    }

    log.Printf("Filter params - tag: %s, distance: %s, budget: %s, name: %s", tag, distanceRange, budget, name)
    log.Printf("Found %d locations", len(locations))

    c.JSON(http.StatusOK, locations)
}

// ลบสถานที่ท่องเที่ยวทีละรายการ
func DeleteLocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location ID"})
		return
	}

	// ลบ location (user_favorites จะถูกลบอัตโนมัติด้วย ON DELETE CASCADE)
	result := orm.Db.Unscoped().Delete(&orm.Location{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete location: " + result.Error.Error()})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Location deleted successfully"})
}

// ลบสถานที่ท่องเที่ยวหลายรายการ
func BulkDeleteLocation(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}
	
	// Debug: แสดงข้อมูลที่ได้รับ
	fmt.Printf("Content-Type: %s\n", c.GetHeader("Content-Type"))
	fmt.Printf("Method: %s\n", c.Request.Method)
	
	// ใช้ ShouldBindJSON แทน manual parsing
	if err := c.ShouldBindJSON(&req); err != nil {
		// Debug: แสดง error และ raw body
		bodyBytes, _ := c.GetRawData()
		fmt.Printf("Raw body: %s\n", string(bodyBytes))
		fmt.Printf("Bind error: %v\n", err)
		
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON format: " + err.Error(),
			"received_body": string(bodyBytes),
		})
		return
	}
	
	// ตรวจสอบว่ามี IDs
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No IDs provided",
		})
		return
	}
	
	// ตรวจสอบว่า IDs ไม่มีค่า 0
	for _, id := range req.IDs {
		if id == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ID: ID cannot be 0",
			})
			return
		}
	}

	result := orm.Db.Unscoped().Delete(&orm.Location{}, req.IDs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete locations: " + result.Error.Error(),
		})
		return
	}
	
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "No locations found with provided IDs",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Locations deleted successfully",
		"deleted_count": result.RowsAffected,
	})
}