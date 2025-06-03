package orm

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	LocationsName   string
	Address         string
	OpenTime        string
	Topic			string
	History         string
	HasParking      bool     `gorm:"default:false"`
	ParkingDetails	string
	HasEntrance		bool	 `gorm:"default:false"`
	EntranceDetails	string	 
	Images          []Image  `gorm:"foreignKey:LocationID"`
	Activities      []Activity `gorm:"foreignKey:LocationID"`
	Tags            []Tag    `gorm:"many2many:location_tags;"`
	BudgetRange 	string 	 `gorm:"type:varchar(20)" json:"budget_range"`
	Season 			string 	 `gorm:"type:varchar(10);default:'summer'" json:"season"`
	DistanceFromCity float64 `gorm:"type:decimal(5,2)"`
	ExternalScores  []ExternalScore
	Reviews         []Review
	FavoritedBy     []User     `gorm:"many2many:user_favorite"`
}