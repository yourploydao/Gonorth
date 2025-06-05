package orm

import "gorm.io/gorm"

type Accessibilities struct {
	gorm.Model
	Accessibilities      string     `gorm:"unique"`
	Locations []Location `gorm:"many2many:location_accessibility;"`
}
