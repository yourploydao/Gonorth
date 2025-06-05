package orm

import "gorm.io/gorm"

type Amenities struct {
	gorm.Model
	Amenities      string     `gorm:"unique"`
	Locations []Location `gorm:"many2many:location_amenities;"`
}
