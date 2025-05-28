package orm

import "gorm.io/gorm"

type UserFavorite struct {
	gorm.Model
	UserID     uint	`gorm:"foreignKey:UserID"`
	LocationID uint `gorm:"foreignKey:LocationID"`
}