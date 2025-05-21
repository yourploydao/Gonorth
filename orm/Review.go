package orm

import (
	"gorm.io/gorm"
	"time"
)

type Review struct {
	gorm.Model
	UserID     uint
	LocationID uint
	Rating     int    `gorm:"check:rating >= 1 AND rating <= 5"`
	Comment    string
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}
