package main

import (
	"github.com/a00012025/email2ether/backend/email"
)

func main() {
	res := email.GetLatestEmail()
	if res != nil {
		println(*res)
	}
}
