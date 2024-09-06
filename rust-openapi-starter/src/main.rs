use anyhow::Result;
use baml_client::models::{BamlImage, BamlImageUrl, ExtractReceiptRequest, ExtractReceiptRequestReceipt, ExtractResumeRequest, FlightConfirmationDeparture, FlightConfirmationFlightNumber, ParseEmailRequest, ParseEmailResponse};
use baml_client::apis::default_api as b;

#[tokio::main]
async fn main() -> Result<()> {
    let config = baml_client::apis::configuration::Configuration::default();

    // Example 1: Extract Receipt
    {
        let image = BamlImage::BamlImageUrl(BamlImageUrl {
            url: "https://i.redd.it/adzt4bz4llfc1.jpeg".to_string(),
            media_type: None,
        }.into()).into();
        let req = ExtractReceiptRequest {
            receipt: ExtractReceiptRequestReceipt::BamlImage(image).into(),
        };
        let resp = b::extract_receipt(&config, req).await?;
        dbg!(resp);
    }

    // Example 2: Extract Resume
    {
        let resume_text = r#"
        John Doe

        Education
        - University of California, Berkeley
        - B.S. in Computer Science
        - graduated 2020

        Skills
        - Python
        - Java
        - C++
        "#.to_string();
        let req = ExtractResumeRequest {
            resume_text,
        };
        let resp = b::extract_resume(&config, req).await?;
        dbg!(resp);
    }

    // Example 3: Parse Email
    {
        let input = r#"
Dear [Your Name],

Thank you for booking with [Airline Name]! We are pleased to confirm your upcoming flight.

Flight Confirmation Details:

Booking Reference: ABC123
Passenger Name: [Your Name]
Flight Number: 789
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

[Airline Name] Customer Service
        "#.to_string();
        let req = ParseEmailRequest {
            input,
        };
        let resp = b::parse_email(&config, req).await?;
        dbg!(&resp);

        match resp {
            ParseEmailResponse::BookOrder(book_order) => {
                dbg!(book_order);
            }
            ParseEmailResponse::FlightConfirmation(flight_confirmation) => {
                match flight_confirmation.flight_number.as_ref() {
                    FlightConfirmationFlightNumber::Integer(flight_number) => {
                        println!("flight number as int");
                        dbg!(flight_number);
                    }
                    FlightConfirmationFlightNumber::String(flight_number) => {
                        println!("flight number as string");
                        dbg!(flight_number);
                    }
                }

                match flight_confirmation.departure.as_ref() {
                    FlightConfirmationDeparture::FlightEndpoint(endpoint) => {
                        println!("departure as FlightEndpoint");
                        dbg!(endpoint);
                    }
                    FlightConfirmationDeparture::String(airport) => {
                        println!("departure as string");
                        dbg!(airport);
                    }
                }
            }
            ParseEmailResponse::GroceryReceipt(grocery_receipt) => {
                dbg!(grocery_receipt);
            }
        }
    }

    Ok(())
}