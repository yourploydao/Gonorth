package orm

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Firstname string
	Lastname string
	Email string `gorm:"unique"`
	Phone string
	Password string
}