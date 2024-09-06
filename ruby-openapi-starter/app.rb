require 'baml_client'
require 'pp'

# Configure API client
api_client = BamlClient::ApiClient.new
b = BamlClient::DefaultApi.new(api_client)

# Example 1: see 01-extract-receipt.baml
image = (BamlClient::BamlImageUrl.new(url: 'https://i.redd.it/adzt4bz4llfc1.jpeg'))
req = BamlClient::ExtractReceiptRequest.new(receipt: image)
resp = b.extract_receipt(req)
pp resp

# Example 2: see 02-extract-resume.baml
extract_resume_request = BamlClient::ExtractResumeRequest.new(
  resume_text: <<~RESUME
    John Doe

    Education
    - University of California, Berkeley
    - B.S. in Computer Science
    - graduated 2020

    Skills
    - Python
    - Java
    - C++
  RESUME
)

begin
  result = b.extract_resume(extract_resume_request)
  pp result

  edu0 = result.education[0]
  puts "Education: #{edu0.school}, #{edu0.degree}, #{edu0.year}"
rescue BamlClient::ApiError => e
  puts "Error when calling DefaultApi#extract_resume"
  pp e
end

# Example 3: see parse-email.baml
input = <<~EMAIL
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
EMAIL

resp = b.parse_email(BamlClient::ParseEmailRequest.new(input: input))
puts "Parsed email: #{resp}"

case resp
when BamlClient::BookOrder
  puts "Book title: #{resp.title}"
when BamlClient::FlightConfirmation
  flight_num = resp.flight_number
  case flight_num
  when String
    puts "Flight number string: #{flight_num}"
  when Integer
    puts "Flight number int: #{flight_num}"
  end

  departure = resp.departure
  case departure
  when BamlClient::FlightEndpoint
    puts "Departure airport and time: #{departure.airport} in #{departure.time}"
  when String
    puts "Departure airport string (i.e. airport code): #{departure}"
  end
when BamlClient::GroceryReceipt
  puts "Grocery receipt: #{resp.store_name}"
end