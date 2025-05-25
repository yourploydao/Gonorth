package orm

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	LocationsName   string
	LocationsRating float64 `gorm:"type:decimal(2,1)"`
	ReviewCount     int     `gorm:"default:0"`
	Address         string
	OpenTime        string
	Topic			string
	History         string
	HasParking      bool     `gorm:"default:false"`
	FreeParking     bool     `gorm:"default:false"`
	Images          []Image  `gorm:"foreignKey:LocationID"`
	Activities      []Activity `gorm:"foreignKey:LocationID"`
	Tags            []Tag    `gorm:"foreignKey:LocationID"`
	BudgetAmount    uint
	// ExternalScores  []ExternalScore
	// Reviews         []Review
}