package orm

import (
	"time"
	"gorm.io/gorm"
)

type PasswordReset struct {
	gorm.Model
	Email string `gorm:"index"`
	Code string                      
	ExpiresAt time.Time                 
}