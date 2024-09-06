class BookOrder {
  orderId string @description(#"
    The ID of the book order
  "#)
  title string @description(#"
    The title of the ordered book
  "#)
  quantity int @description(#"
    The quantity of books ordered
  "#)
  price float @description(#"
    The price of the book
  "#)
}

class FlightEndpoint {
  airport string @description(#"
    Airport code (three letters)
  "#)
  time string
}

class FlightConfirmation {
  confirmationNumber string @description(#"
    The flight confirmation number
  "#)
  flightNumber string | int @description(#"
    The flight number
  "#)
  departure string | FlightEndpoint @description(#"
    If no time is specified, just return the airport code as a string
  "#)
  seatNumber string @description(#"
    The seat number assigned on the flight
  "#)
  baggageRules map<string, BaggageRestriction> @description(#"
    The baggage rules for the flight
  "#)
}

class BaggageRestriction {
  weightLimit float @description(#"
    The weight of the baggage in kilograms
  "#)
  count int @description(#"
    The number of bags allowed
  "#)
}

class GroceryReceipt {
  receiptId string @description(#"
    The ID of the grocery receipt
  "#)
  storeName string @description(#"
    The name of the grocery store
  "#)
  items (string | int | float)[] @description(#"
    A list of items purchased. Each item consists of a name, quantity, and price.
  "#)
  totalAmount float @description(#"
    The total amount spent on groceries
  "#)
}

function ParseEmail(input: string) -> BookOrder | FlightConfirmation | GroceryReceipt {
  client "openai/gpt-4o-mini"
  prompt #"
    Given the below email, extract either an order for a book, a flight confirmation, or a grocery receipt.

    {{ ctx.output_format }}

    Email:
    
    {{ input}}
  "#
}

test ParseEmail {
  functions [ParseEmail]
  args {
    input #"
Dear [Your Name],

Thank you for booking with [Airline Name]! We are pleased to confirm your upcoming flight.

Flight Confirmation Details:

Booking Reference: ABC123
Passenger Name: [Your Name]
Flight Number: XY789
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
    "#
  }
}