package orm

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	LocationsName   string
	LocationsRating float64 `gorm:"type:decimal(2,1)"`
	ReviewCount     int     `gorm:"default:0"`
	Address         string
	OpenTime        string
	History         string
	HasParking      bool     `gorm:"default:false"`
	FreeParking     bool     `gorm:"default:false"`
	Images          []Image
	Activities      []Activity
	Tags            []Tag    `gorm:"many2many:location_tags;"`
	ExternalScores  []ExternalScore
	Reviews         []Review
}