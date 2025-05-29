package auth

import (
	"Gonorth/orm"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ตรวจสอบ Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// แยก Bearer
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			c.Abort()
			return
		}

		// ตรวจ token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET_KEY")), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// ดึง claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userId := uint(claims["userId"].(float64)) // JWT stores numbers as float64

			// ตรวจว่า user มีจริง
			var user orm.User
			if err := orm.Db.First(&user, userId).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
				c.Abort()
				return
			}

			// เก็บ user ใน context
			c.Set("user", user)
			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}
	}
}
