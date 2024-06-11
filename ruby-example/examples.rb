# typed: strict
require_relative "baml_client/client"
require "pp"

b = Baml.Client

##################################################################################################

puts "Example 1: calling GPT4 with the ClassifyMessage function"

input = "Can't access my account using my usual login credentials"
classified = b.ClassifyMessage(input: input)

puts "ClassifyMessage response:"
pp classified.serialize
puts

##################################################################################################

puts "Example 2: calling GPT4 with the ExtractOrderInfo function"

email = Baml::Types::Email.new(
        from_address: "\"Amazon.com\" <shipment-tracking@amazon.com>",
        subject: "Your Amazon.com order of \"Wood Square Dowel Rods...\" has shipped!",
        body: "Amazon Shipping Confirmation\nwww.amazon.com?ie=UTF8&ref_=scr_home\n\nHi Samuel, your package will arrive:\n\nThursday, April 4\n\nTrack your package:\nwww.amazon.com/gp/your-account/ship-track?ie=UTF8&orderId=113-7540940-3785857&packageIndex=0&shipmentId=Gx7wk71F9&ref_=scr_pt_tp_t\n\nOn the way:\nWood Square Dowel Rods...\nOrder #113-7540940-3785857\n\nAn Amazon driver may contact you by text message or call you for help on the day of delivery.    \n\nShip to:\n    Sam\n    SEATTLE, WA\n\nShipment total:\n$0.00",
)
order_info = b.ExtractOrderInfo(email: email)

puts "ExtractOrderInfo response:"
pp order_info.serialize

##################################################################################################
