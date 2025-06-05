package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	AuthController "Gonorth/controller/auth"
	InformationController "Gonorth/controller/information"
	Middleware "Gonorth/controller/middleware"
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
		AllowMethods:     []string{"POST", "GET", "DELETE", "PUT", "PATCH", "OPTIONS"},
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
	r.GET("/locations/latest", InformationController.GetLatestLocations)
	r.GET("/locations/all", InformationController.GetAllLocations)
	r.GET("/locations/season/:season", InformationController.GetLocationsBySeason)
	r.GET("/locations/filter", InformationController.FilterLocations)
	r.GET("/location/:id/review-stats", InformationController.GetLocationReviewStats)

	auth := r.Group("/")
	auth.Use(Middleware.Middleware())
	{
		auth.GET("/profile", AuthController.Profile)
		auth.POST("/change-profileimage", AuthController.ChangeProfileImage)
		auth.POST("/change-username", AuthController.ChangeUsername)
		auth.POST("/change-email", AuthController.ChangeEmail)
		auth.POST("/change-password", AuthController.ChangePassword)
		auth.POST("/change-phone", AuthController.ChangePhone)
		auth.GET("/location/:id", InformationController.GetLocation)
		auth.GET("/locations-login/latest", InformationController.GetLatestLocations)
		auth.GET("/locations-login/all", InformationController.GetAllLocations)
		auth.POST("/favorite", InformationController.AddFavorite)
		auth.GET("favorite/:locationID", InformationController.CheckFavorite)
		auth.DELETE("/favorite", InformationController.DeleteFavorite)
		auth.GET("userfavorites", InformationController.GetFavorites)
		auth.DELETE("/deletefavorite", InformationController.DeleteFavorite)
		auth.GET("/location/:id/reviews", InformationController.GetLocationReviews)
		auth.POST("/reviews", InformationController.CreateReviewForLocation)

		admin := auth.Group("/")
		admin.Use(Middleware.AdminOnly())
		{
			admin.POST("/locations", InformationController.CreateLocation)
			admin.PUT("/locations/:id", InformationController.UpdateLocation)
			admin.DELETE("/locations/:id", InformationController.DeleteLocation)          
			admin.POST("/locations/bulk-delete", InformationController.BulkDeleteLocation)
			admin.GET("/users", AuthController.GetAllUsers)
			admin.PUT("/users/:id", AuthController.UpdateUser)
			admin.DELETE("/users/:id", AuthController.DeleteUser)
			admin.PATCH("/users/bulk-update", AuthController.BulkUpdateUsers)
			admin.DELETE("/users/bulk-delete", AuthController.BulkDeleteUsers)
		}
	}

	r.Run("localhost:8080")
}
