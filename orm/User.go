package orm

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Role     string `gorm:"type:varchar(20);default:'user'" json:"role"` 
	Firstname string
	Lastname string
	Email string `gorm:"unique"`
	Phone string
	Password string
	ProfileImage string `gorm:"default:'https://res.cloudinary.com/dqjpnlm38/image/upload/v1748119561/73-730154_open-default-profile-picture-png_adwe46.png'"`
	Favorites []Location `gorm:"many2many:user_favorite"`
}