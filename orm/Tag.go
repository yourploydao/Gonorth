package orm

import "gorm.io/gorm"

type Tag struct {
	gorm.Model
	TagName   string     `gorm:"unique"`
	Locations []Location `gorm:"many2many:location_tags;"`
}

