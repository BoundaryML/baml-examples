package main

import (
	"context"
	"fmt"
	"log"
	baml "openapi"
)

func main() {
	fmt.Println("Hello, World!")

	cfg := baml.NewConfiguration()
	b := baml.NewAPIClient(cfg).DefaultAPI
	extractResumeRequest := baml.ExtractResumeRequest{
		Resume: "Ada Lovelace (@gmail.com) was an English mathematician and writer",
	}
	resp, r, err := b.ExtractResume(context.Background()).ExtractResumeRequest(extractResumeRequest).Execute()
	if err != nil {
		fmt.Printf("Error when calling b.ExtractResume: %v\n", err)
		fmt.Printf("Full HTTP response: %v\n", r)
		return
	}
	// Response from server
	log.Printf("Response from server: %v\n", resp)
}
