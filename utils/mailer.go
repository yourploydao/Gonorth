package utils

import (
	"fmt"
	"net/smtp"
	// "os"
)

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
