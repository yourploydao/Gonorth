package orm

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	created_at	string `gorm:"autoCreateTime"`	
	updated_at	string `gorm:"autoUpdateTime"`
	UserID     uint
	LocationID uint
	Rating     int    `gorm:"check:rating >= 1 AND rating <= 5"`
	Comment    string
	User     User     `json:"user" gorm:"foreignKey:UserID"`
    Location Location `json:"location" gorm:"foreignKey:LocationID"`
}
