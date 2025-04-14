package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"net/http"
)

// ฟังก์ชันจัดการ API
func helloHandler(c *gin.Context) {
	// กำหนด struct สำหรับรับข้อมูลจาก body
	var json struct {
		Message string `json:"message"`
	}

	// Binding JSON data จาก body
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	// ตอบกลับไปยัง Next.js
	c.JSON(http.StatusOK, gin.H{
		"message": "Received: " + json.Message,
	})
}

func main() {
	r := gin.Default()

	// เปิดใช้งาน CORS เพื่อให้ Next.js ติดต่อกับ Gin ได้
	r.Use(cors.Default())

	// กำหนด API Endpoint
	r.POST("/api/hello", helloHandler)

	// เริ่มเซิร์ฟเวอร์ที่พอร์ต 8080
	r.Run(":8080")
}



// package main

// import (
// 	"fmt"
// 	"github.com/gin-gonic/gin"
// 	"gorm.io/gorm"
// 	"gorm.io/driver/postgres"
// 	"log"
// )

// // Model User
// type User struct {
// 	ID    uint   `json:"id" gorm:"primaryKey"`
// 	Name  string `json:"name"`
// 	Email string `json:"email"`
// }

// // ฟังก์ชันเชื่อมต่อฐานข้อมูล
// func connectDB() *gorm.DB {
// 	dsn := "host=localhost user=postgres password=mypass dbname=mydb port=5432 sslmode=disable"
// 	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
// 	if err != nil {
// 		log.Fatal("Failed to connect to database:", err)
// 	}
// 	return db
// }

// func main() {
// 	// เชื่อมต่อกับฐานข้อมูล
// 	db := connectDB()

// 	// สร้าง Table อัตโนมัติ
// 	db.AutoMigrate(&User{})

// 	// สร้าง Gin router
// 	r := gin.Default()

// 	// API endpoint
// 	r.GET("/api/hello", func(c *gin.Context) {
// 		c.JSON(200, gin.H{
// 			"message": "Hello from Gin with GORM!",
// 		})
// 	})

// 	// เริ่มเซิร์ฟเวอร์ที่ port 8080
// 	r.Run(":8080")

// 	// คุณสามารถเช็คการสร้าง Table ได้จากฐานข้อมูล
// 	fmt.Println("Server is running on port 8080")