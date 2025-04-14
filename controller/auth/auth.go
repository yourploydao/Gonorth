package auth

import (
	"Comsci/webpro/orm"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var hmacSampleSecret []byte

type RegisterBody struct {
	Firstname       string `json:"firstname" binding:"required"`
	Lastname        string `json:"lastname" binding:"required"`
	Email           string `json:"email" binding:"required"`
	Phone           string `json:"phone" binding:"required"`
	Password        string `json:"password" binding:"required"`
	ConfirmPassword string `json:"confirmpassword" binding:"required"`
}

func Register(c *gin.Context) {
	var json RegisterBody
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Check user exists
	var userExist orm.User
	orm.Db.Where("email = ?", json.Email).First(&userExist)
	if userExist.ID > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "An account with this email already exists"})
		return
	}
	// Check password
	if json.Password != json.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password and ConfirmPassword do not match"})
		return
	}
	//Create user
	encryptedPassword, _ := bcrypt.GenerateFromPassword([]byte(json.Password), 10)
	user := orm.User{
		Firstname: json.Firstname,
		Lastname:  json.Lastname,
		Email:     json.Email,
		Phone:     json.Phone,
		Password:  string(encryptedPassword)}
	orm.Db.Create(&user)
	if user.ID > 0 {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Registeration successful",
			"userId":  user.ID,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Registeration failed",
		})
	}
}

type LoginBody struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var json LoginBody
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Check user exists
	var userExist orm.User
	orm.Db.Where("email = ?", json.Email).First(&userExist)
	if userExist.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "An account with this email does not exists"})
		return
	}
	// Check login password
	err := bcrypt.CompareHashAndPassword([]byte(userExist.Password), ([]byte(json.Password)))
	if err == nil {
		hmacSampleSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"userId": userExist.ID,
			"exp":    time.Now().Add(time.Minute * 3).Unix(),
		})
		tokenString, err := token.SignedString(hmacSampleSecret)
		fmt.Println(tokenString, err)

		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Login successful",
			"token":   tokenString,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"status":  "error",
			"message": "Login failed",
		})
	}
}
