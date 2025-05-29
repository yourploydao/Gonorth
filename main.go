package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	AuthController "Gonorth/controller/auth"
	Middleware "Gonorth/controller/middleware"
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
        AllowMethods:     []string{"POST", "GET", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))
	r.POST("/signup", AuthController.Register)
	r.POST("/login", AuthController.Login)
	r.POST("/forgotpassword", AuthController.ForgotPassword)
	r.POST("/resendcode", AuthController.ResendCode)
	r.POST("/verifycode", AuthController.VerifyCode)
	r.POST("/resetpassword", AuthController.ResetPassword)
	r.GET("/location/:id", InformationController.GetLocation)
	r.GET("/locations/latest", InformationController.GetLatestLocations)
	r.GET("/locations/all", InformationController.GetAllLocations)

	auth := r.Group("/")
	auth.Use(Middleware.Middleware())
	{
		auth.GET("/profile" , AuthController.Profile)
		auth.POST("/change-password", AuthController.ChangePassword)
		auth.POST("/locations", InformationController.CreateLocation)
		auth.POST("/images", InformationController.CreateImage)
		auth.GET("/locations-login/latest", InformationController.GetLatestLocations)
		auth.GET("/locations-login/all", InformationController.GetAllLocations)
		auth.POST("/budget", InformationController.CreateBudget)
		auth.POST("/activities", InformationController.CreateActivity)
		auth.POST("/tags", InformationController.CreateTag)
		auth.POST("/external-scores", InformationController.CreateExternalScore)
		auth.POST("/reviews", InformationController.CreateReview)
	}

	r.Run("localhost:8080")
}
