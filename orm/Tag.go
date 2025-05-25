package orm

import "gorm.io/gorm"

type Tag struct {
	gorm.Model
	TagName   string     `gorm:"unique"`
	LocationID uint
}

