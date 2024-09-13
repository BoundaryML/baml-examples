package main

import (
	"context"
	"log"
	baml "my-golang-app/baml_client"
)

func main() {
	cfg := baml.NewConfiguration()
	b := baml.NewAPIClient(cfg).DefaultAPI

	// Example 1: Extract Receipt
	{
		imageUrl := "https://i.redd.it/adzt4bz4llfc1.jpeg"
		req := baml.ExtractReceiptRequest{
			Receipt: baml.BamlImage{
				BamlImageUrl: &baml.BamlImageUrl{
					Url: imageUrl,
				},
			},
		}
		resp, _, err := b.ExtractReceipt(context.Background()).ExtractReceiptRequest(req).Execute()
		if err != nil {
			log.Printf("Error when calling ExtractReceipt: %v\n", err)
		} else {
			log.Printf("ExtractReceipt Response: %v\n", resp)
		}
	}

	// Example 2: Extract Resume
	{
		extractResumeRequest := baml.ExtractResumeRequest{
			ResumeText: `
			John Doe

			Education
			- University of California, Berkeley
			- B.S. in Computer Science
			- graduated 2020

			Skills
			- Python
			- Java
			- C++
			`,
		}
		resp, _, err := b.ExtractResume(context.Background()).ExtractResumeRequest(extractResumeRequest).Execute()
		if err != nil {
			log.Printf("Error when calling ExtractResume: %v\n", err)
			return
		}

		log.Printf("Resume: %+v\n", resp)
		edu := resp.GetEducation()[0]
		log.Printf("Education: %v, %v, %v\n", edu.School, edu.Degree, edu.Year)
	}

	// Example 3: see 03-classify-user-msg.baml
	{
		req := baml.ClassifyMessageRequest{
			Message: *baml.NewMessage("Alice", "I can't access my account using my login credentials. I havent received the promised reset password email. Please help."),
		}
		resp, _, err := b.ClassifyMessage(context.Background()).ClassifyMessageRequest(req).Execute()
		if err != nil {
			log.Printf("Error when calling ClassifyMessage: %v\n", err)
			return
		}
		log.Printf("ClassifyMessage: %v\n", *resp)
		if *resp == baml.CATEGORY_ACCOUNT_ISSUE {
			log.Printf(" Category: Account Issue\n")
		}
		if *resp == baml.CATEGORY_CANCEL_ORDER {
			log.Printf(" Category: Cancel Order\n")
		}
		if *resp == baml.CATEGORY_QUESTION {
			log.Printf(" Category: Question\n")
		}
		if *resp == baml.CATEGORY_REFUND {
			log.Printf(" Category: Refund\n")
		}
		if *resp == baml.CATEGORY_TECHNICAL_SUPPORT {
			log.Printf(" Category: Technical Support\n")
		}
	}

	// Example 4: working with unions, see parse-email.baml
	{
		input := `
	Dear [Your Name],

Thank you for booking with [Airline Name]! We are pleased to confirm your upcoming flight.

Flight Confirmation Details:

Booking Reference: ABC123
Passenger Name: [Your Name]
Flight Number: XY789
Departure Date: September 15, 2024
Departure Time: 10:30 AM
Arrival Time: 1:45 PM
Departure Airport: John F. Kennedy International Airport (JFK), New York, NY
Arrival Airport: Los Angeles International Airport (LAX), Los Angeles, CA
Seat Number: 12A
Class: Economy
Baggage Allowance:

Checked Baggage: 1 piece, up to 23 kg
Carry-On Baggage: 1 piece, up to 7 kg
Important Information:

Please arrive at the airport at least 2 hours before your scheduled departure.
Check-in online via our website or mobile app to save time at the airport.
Ensure that your identification documents are up to date and match the name on your booking.
Contact Us:

If you have any questions or need to make changes to your booking, please contact our customer service team at 1-800-123-4567 or email us at support@[airline].com.

We wish you a pleasant journey and thank you for choosing [Airline Name].

Best regards,

[Airline Name] Customer Service`

		resp2, _, _ := b.ParseEmail(context.Background()).ParseEmailRequest(baml.ParseEmailRequest{
			Input: input,
		}).Execute()
		log.Printf("Parsed email: %v\n", resp2)

		if resp2.BookOrder != nil {
			log.Printf("BookOrder: %v\n", resp2.BookOrder)
		}

		if resp2.FlightConfirmation != nil {
			flight := resp2.FlightConfirmation

			flightNum := flight.FlightNumber

			if flightNum.Int32 != nil {
				log.Printf("FlightNumber (int): %v\n", *flightNum.Int32)
			}
			if flightNum.String != nil {
				log.Printf("FlightNumber (string): %v\n", *flightNum.String)
			}

			departure := flight.Departure
			if departure.FlightEndpoint != nil {
				log.Printf("Departure FlightEndpoint: %v\n", *departure.FlightEndpoint)
			}
			if departure.String != nil {
				log.Printf("Departure String: %v\n", *departure.String)
			}

			log.Printf("Baggage restrictions: %v\n", flight.BaggageRules)
		}

		if resp2.GroceryReceipt != nil {
			log.Printf("GroceryReceipt: %v\n", resp2.GroceryReceipt)
		}

	}
}
