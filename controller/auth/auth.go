package auth

import (
	"Gonorth/orm"
	"fmt"
	"net/http"
	"os"
	"time"
	"math/rand"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": "An account with this email does not exists. Please sign up first."})
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
			"message": "Login failed. The password is incorrect.",
		})
	}
}

type ForgotPasswordBody struct {
	Email string `json:"email" binding:"required"`
}

func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	var user orm.User
	if err := orm.Db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account with this email does not exist"})
		return
	}

	code := fmt.Sprintf("%06d", rand.Intn(1000000)) // Generate 6 digit code

	reset := orm.PasswordReset{
		Email:     req.Email,
		Code:      code,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	orm.Db.Create(&reset)

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Verification code sent",
		"code":    code,
	})
}

type VerifyCodeBody struct {
	Code  string `json:"code" binding:"required"`
}

func VerifyCode(c *gin.Context) {
	var req VerifyCodeBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var reset orm.PasswordReset
	if err := orm.Db.Where("code = ?", req.Code).Order("created_at desc").First(&reset).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired code"})
		return
	}

	if time.Now().After(reset.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code has expired"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Code verified",
		"email":   reset.Email,
	})
}

type ResetPasswordBody struct {
	Password string `json:"password" binding:"required"`
	ResetCode string `json:"reset_code" binding:"required"`
}

func ResetPassword(c *gin.Context) {
	var req ResetPasswordBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var reset orm.PasswordReset
	if err := orm.Db.Where("code = ?", req.ResetCode).First(&reset).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset code"})
		return
	}
	// เช็คว่า reset code ยังไม่หมดอายุ
	if time.Now().After(reset.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reset code has expired"})
		return
	}
	// ค้นหาผู้ใช้จาก email ที่ดึงจาก reset code
	var user orm.User
	if err := orm.Db.Where("email = ?", reset.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User does not exist"})
		return
	}
	// สร้างรหัสผ่านใหม่
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}
	// อัปเดตรหัสผ่าน
	user.Password = string(hashedPassword)
	if err := orm.Db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Password reset successfully",
		"email":   user.Email,
	})
}