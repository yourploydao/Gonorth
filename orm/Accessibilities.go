package orm

import "gorm.io/gorm"

type Accessibilities struct {
	gorm.Model
	Name      string     `gorm:"unique"`
	Locations []Location `gorm:"many2many:location_accessibility;"`
}
