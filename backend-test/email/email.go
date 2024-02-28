package email

import (
	"encoding/base64"
	"fmt"
	"log"

	"google.golang.org/api/gmail/v1"
)

func GetLatestEmail() *string {
	mailRes, err := srv.Users.Messages.List("me").Do()
	if err != nil {
		log.Fatalf("Unable to retrieve messages: %v", err)
		return nil
	}
	if len(mailRes.Messages) == 0 {
		fmt.Println("No messages found.")
		return nil
	}
	latestEmailId := mailRes.Messages[0].Id
	res := GetEmail(srv, latestEmailId)
	return &res
}

func GetEmail(srv *gmail.Service, messageId string) string {
	gmailMessageResponse, err := srv.Users.Messages.Get("me", messageId).Format("RAW").Do()
	if err != nil {
		log.Println("error when getting mail content: ", err)
		return ""
	}
	if gmailMessageResponse != nil {
		decodedData, err := base64.URLEncoding.DecodeString(gmailMessageResponse.Raw)
		if err != nil {
			log.Println("error b64 decoding: ", err)
			panic(err)
		}
		return string(decodedData)
	}
	return ""
}
