package orm

import (
	"gorm.io/gorm"
	"time"
)

type ExternalScore struct {
	gorm.Model
	LocationID   uint
	Source       string
	Score        float64
	TotalReviews int
	LastUpdated  time.Time `gorm:"autoUpdateTime"`
}
