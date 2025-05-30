package auth

import (
	"Gonorth/orm"
	"Gonorth/utils"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	// "github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	// "gopkg.in/gomail.v2"
)

var hmacSampleSecret []byte

type RegisterBody struct {
	Firstname       string `json:"firstname" binding:"required"`
	Lastname        string `json:"lastname" binding:"required"`
	Email           string `json:"email" binding:"required"`
	Phone           string `json:"phone" binding:"required"`
	Password        string `json:"password" binding:"required"`
	ConfirmPassword string `json:"confirmpassword" binding:"required"`
	ProfileImage    string `json:"profileImage"`
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

	profileImage := json.ProfileImage
	if profileImage == "" {
		profileImage = "https://res.cloudinary.com/dqjpnlm38/image/upload/v1748119561/73-730154_open-default-profile-picture-png_adwe46.png"
	}
	user := orm.User{
		Firstname: json.Firstname,
		Lastname:  json.Lastname,
		Email:     json.Email,
		Phone:     json.Phone,
		Password:  string(encryptedPassword),
		ProfileImage: profileImage,
	}

	orm.Db.Create(&user)
	if user.ID > 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "Registeration successful",
			"userId":  user.ID,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
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
			"exp": time.Now().Add(time.Hour * 24).Unix(),    
			"iat":    time.Now().Unix(),
			"iss":    "gonorth",
		})
		tokenString, err := token.SignedString(hmacSampleSecret)
		fmt.Println(tokenString, err)

		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"token":   tokenString,
			"user": gin.H{
				"id": userExist.ID,
				"firstname": userExist.Firstname,
				"lastname": userExist.Lastname,
				"email": userExist.Email,
			},
		})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Login failed. The password is incorrect.",
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

	code := fmt.Sprintf("%06d", rand.Intn(1000000))  
	expiration := time.Now().Add(5 * time.Minute)

	orm.Db.Where("email = ?", req.Email).Delete(&orm.PasswordReset{})
	reset := orm.PasswordReset{
		Email:     req.Email,
		Code:      code,
		ExpiresAt: expiration,
	}
	if err := orm.Db.Create(&reset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save reset code"})
		return
	}

	body := utils.GenerateOtpHtml(code)
	if err := utils.SendEmail(req.Email, "Password Reset Code", body); err != nil {
		log.Println("DB Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reset code resent to email",
	})
}

type ResendCodeBody struct {
	Email string `json:"email" binding:"required,email"`
}

func ResendCode(c *gin.Context) {
	var req ResendCodeBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	fmt.Println("ResendCode called with email:", req.Email)

	var user orm.User
	if err := orm.Db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account with this email does not exist"})
		return
	}

	code := fmt.Sprintf("%06d", rand.Intn(1000000))  
	expiration := time.Now().Add(5 * time.Minute)

	orm.Db.Where("email = ?", req.Email).Delete(&orm.PasswordReset{})
	reset := orm.PasswordReset{
		Email:     req.Email,
		Code:      code,
		ExpiresAt: expiration,
	}

	if err := orm.Db.Create(&reset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save reset code (resending)"})
		return
	}

	body := utils.GenerateOtpHtml(code)
	if err := utils.SendEmail(req.Email, "Password Reset Code", body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset email (resending)"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reset code resent"})
}

type VerifyCodeBody struct {
	Email string `json:"email"`
	Code  string `json:"code" binding:"required"`
}

func VerifyCode(c *gin.Context) {
	var req VerifyCodeBody
	if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    var reset orm.PasswordReset
    if err := orm.Db.Where("email = ? AND code = ?", req.Email, req.Code).First(&reset).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid code or email"})
        return
    }

    if time.Now().After(reset.ExpiresAt) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Code expired"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Code verified"})
}

type ResetPasswordBody struct {
	Email string `json:"email"`
    Code string `json:"code"`
    NewPassword string `json:"new_password"`
}

func ResetPassword(c *gin.Context) {
	var req ResetPasswordBody
	if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }
    var reset orm.PasswordReset
    if err := orm.Db.Where("email = ? AND code = ?", req.Email, req.Code).First(&reset).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid code or email"})
        return
    }
    if time.Now().After(reset.ExpiresAt) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Code expired"})
        return
    }
    var user orm.User
    if err := orm.Db.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
        return
    }
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    user.Password = string(hashedPassword)
    orm.Db.Save(&user)
    orm.Db.Delete(&reset) // ลบ code ทิ้ง 
    c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

func Profile(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found in context"})
		return
	}

	user := userInterface.(orm.User)

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"firstname":    user.Firstname,
			"lastname":     user.Lastname,
			"profileImage": user.ProfileImage,
			"email":        user.Email,
			"password":     user.Password,
			"phone":        user.Phone,
		},
	})
}

func ChangePassword(c *gin.Context) {
    userID, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var req struct {
        CurrentPassword string `json:"currentPassword"`
        NewPassword     string `json:"newPassword"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    var user orm.User
    if err := orm.Db.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
        return
    }

    // เช็ครหัสผ่านเดิม
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect current password"})
        return
    }

    // รหัสผ่านใหม่
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    // อัปเดตรหัสผ่าน
    user.Password = string(hashedPassword)
    if err := orm.Db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func ChangeUsername(c *gin.Context) {
	var req struct {
		Firstname string `json:"firstname" binding:"required"`
		Lastname  string `json:"lastname" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user := userInterface.(orm.User)

	if err := orm.Db.Model(&orm.User{}).
		Where("id = ?", user.ID).
		Updates(map[string]interface{}{
			"firstname": req.Firstname,
			"lastname":  req.Lastname,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update name"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Name updated successfully"})
}

func ChangeEmail(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, ok := userInterface.(orm.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	// ตรวจสอบอีเมลซ้ำ
	var existingUser orm.User
	if err := orm.Db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil && existingUser.ID != user.ID {
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already in use"})
		return
	}

	// อัปเดตอีเมล
	if err := orm.Db.Model(&orm.User{}).
		Where("id = ?", user.ID).
		Update("email", req.Email).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email updated successfully"})
}
func ChangePhone(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required,len=10,numeric"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid phone format"})
		return
	}

	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, ok := userInterface.(orm.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	if err := orm.Db.Model(&orm.User{}).
		Where("id = ?", user.ID).
		Update("phone", req.Phone).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update phone number"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Phone number updated successfully"})
}

func ChangeProfileImage(c *gin.Context) {
    userInterface, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    user, ok := userInterface.(orm.User)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
        return
    }

    file, err := c.FormFile("image")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Image is required"})
        return
    }

    // เปิดไฟล์
    openedFile, err := file.Open()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot open image"})
        return
    }
    defer openedFile.Close()

    // อ่านไฟล์เป็น bytes
    fileBytes, err := io.ReadAll(openedFile)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot read image"})
        return
    }

    // ตั้งค่า Cloudinary
    cld, err := cloudinary.NewFromParams(
        os.Getenv("CLOUDINARY_CLOUD_NAME"),
        os.Getenv("CLOUDINARY_API_KEY"),
        os.Getenv("CLOUDINARY_API_SECRET"),
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary config error"})
        return
    }

    // อัปโหลดภาพไป Cloudinary
    uploadResult, err := cld.Upload.Upload(context.Background(), bytes.NewReader(fileBytes), uploader.UploadParams{
        Folder:   "Profile",
        PublicID: fmt.Sprintf("user_%v_profile", user.ID),
    })
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed", "details": err.Error()})
        return
    }

    if uploadResult.SecureURL == "" {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload succeeded but URL is empty"})
        return
    }

    // อัปเดต URL รูปโปรไฟล์ใน DB
    user.ProfileImage = uploadResult.SecureURL

    if err := orm.Db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message":   "Profile picture updated",
        "image_url": uploadResult.SecureURL,
    })
}
