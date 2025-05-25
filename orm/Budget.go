package orm

import "gorm.io/gorm"

type Budget struct {
	gorm.Model
	ID   uint   `gorm:"primaryKey"`
	Range string 
	Min  uint   
	Max  *uint 
}