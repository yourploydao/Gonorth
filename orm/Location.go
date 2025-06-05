package orm

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	LocationsName    string            `json:"name"`
	Address          string            `json:"address"`
	OpenTime         string            `json:"open_time"`
	CloseTime        string            `json:"close_time"`
	Topic            string            `json:"topic"`
	History          string            `json:"history"`
	HasParking       bool              `gorm:"default:false" json:"has_parking"`
	ParkingDetails   string            `json:"parking_details"`
	HasEntrance      bool              `gorm:"default:false" json:"has_entrance"`
	EntranceDetails  string            `json:"entrance_details"`
	Images           []Image           `gorm:"foreignKey:LocationID" json:"images"`
	Activities       []Activity        `gorm:"foreignKey:LocationID" json:"activities"`
	Tags             []Tag             `gorm:"many2many:location_tags;" json:"tags"`
	BudgetRange      string            `gorm:"type:varchar(20)" json:"budget_range"`
	Season           string            `gorm:"type:varchar(10);default:'summer'" json:"season"`
	DistanceFromCity float64           `gorm:"type:decimal(5,2)" json:"distance"`
	DrivingTime      string            `json:"driving_time"`
	AdmissionFee     int               `json:"admissionFee"`
	Latitude         float64           `json:"latitude"`
	Longitude        float64           `json:"longitude"`
	Reviews          []Review          `json:"reviews"`
	Amenities        []Amenities       `gorm:"many2many:location_amenities;" json:"amenities"`
}
