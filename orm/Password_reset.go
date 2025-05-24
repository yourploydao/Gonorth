package orm

import (
	"time"
)

type PasswordReset struct {
	ID        uint      `gorm:"primaryKey"`
	Email     string    `gorm:"uniqueIndex"`
	Code      string
	ExpiresAt time.Time
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}