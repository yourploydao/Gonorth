package orm

import "gorm.io/gorm"

type Image struct {
	gorm.Model
	LocationID uint
	URL        string
	IsMain     bool `gorm:"default:false"`
	SortOrder  int  `gorm:"default:0"`
}