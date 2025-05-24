package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	AuthController "Gonorth/controller/auth"
	InformationController "Gonorth/controller/information"
	"Gonorth/orm"
)

func main() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	orm.InitDB()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"POST", "GET", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))
	r.POST("/signup", AuthController.Register)
	r.POST("/login", AuthController.Login)
	r.POST("/forgotpassword", AuthController.ForgotPassword)
	r.POST("/resendcode", AuthController.ResendCode)
	r.POST("/verifycode", AuthController.VerifyCode)
	r.POST("/resetpassword", AuthController.ResetPassword)
	r.POST("/locations", InformationController.CreateLocation)
	r.POST("/images", InformationController.CreateImage)
	r.POST("/activities", InformationController.CreateActivity)
	r.POST("/tags", InformationController.CreateTag)
	r.POST("/external-scores", InformationController.CreateExternalScore)
	r.POST("/reviews", InformationController.CreateReview)

	r.Run("localhost:8080")
}
