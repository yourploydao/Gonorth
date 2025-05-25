package orm

import (
	"fmt"
	"os"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Db *gorm.DB
var err error

func InitDB() {
	dsn := os.Getenv("PG_DSN")
	fmt.Println("Connecting to DB with DSN:", dsn)

	Db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	err = Db.AutoMigrate(
		&User{},
		&PasswordReset{},
		&Location{},
		&Image{},
		&Budget{},
		&Activity{},
		&Tag{},
		&ExternalScore{},
		&Review{},
	)
	if err != nil {
		panic("AutoMigrate failed: " + err.Error())
	}

	fmt.Println("Connected and migrated PostgreSQL DB.")
}
