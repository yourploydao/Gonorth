package utils

import (
	"fmt"
	"net/smtp"
)

// ส่งอีเมล
func SendEmail(to string, subject string, body string) error {
	from := "gonorth.chaingmai@gmail.com"
	password := "trwl uzrk cbss uexr"

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	msg := []byte("Subject: " + subject + "\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		"\r\n" +
		body + "\r\n")

	auth := smtp.PlainAuth("", from, password, smtpHost)

	addr := smtpHost + ":" + smtpPort
	err := smtp.SendMail(addr, auth, from, []string{to}, msg)
	if err != nil {
		fmt.Println("Error sending email:", err)
		return err
	}
	fmt.Println("Email sent successfully")
	return nil
}

// รูปแบบอีเมล
func GenerateOtpHtml(otp string) string {
	return fmt.Sprintf(`
	<!DOCTYPE html>
	<html lang="th">
	<head>
		<meta charset="UTF-8">
		<title>รหัส OTP ของคุณ - Gonorth</title>
		<style>
			@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;600&display=swap');
			body {
				font-family: 'Prompt', sans-serif;
				background-color: #f4f4f4;
				padding: 20px;
				color: #333;
			}
			.container {
				max-width: 500px;
				margin: auto;
				background: white;
				border-radius: 10px;
				padding: 30px;
				box-shadow: 0 0 10px rgba(0,0,0,0.1);
			}
			.otp {
				font-size: 24px;
				font-weight: bold;
				color: #1a73e8;
			}
			.footer {
				margin-top: 20px;
				font-size: 12px;
				color: #888;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<h2>รหัส OTP ของคุณ</h2>
			<p>กรุณาใช้รหัสด้านล่างเพื่อยืนยันการดำเนินการของคุณ:</p>
			<p class="otp">%s</p>
			<p>รหัสนี้จะหมดอายุภายใน 5 นาที</p>
			<div class="footer">
				หากคุณไม่ได้ร้องขอรหัสนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้<br><br>
				ขอบคุณ,<br>
				Gonorth Support Team
			</div>
		</div>
	</body>
	</html>`, otp)
}