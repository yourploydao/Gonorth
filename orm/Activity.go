package orm

import "gorm.io/gorm"

type Activity struct {
	gorm.Model
	LocationID   uint
	ActivityName string
}
