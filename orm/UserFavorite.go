package orm

import "gorm.io/gorm"

type UserFavorite struct {
	gorm.Model
	UserID     uint	`gorm:"foreignKey:UserID" json:"user_id"`
	LocationID uint `gorm:"foreignKey:LocationID" json:"location_id"`
	Location   Location `gorm:"foreignKey:LocationID" json:"location"`
}