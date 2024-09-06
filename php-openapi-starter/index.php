<?php
require_once(__DIR__ . '/vendor/autoload.php');

// Disable output buffering
ob_end_flush();

// Disable Apache output buffering (if using Apache)
if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', '1');
}

// Disable zlib output compression
ini_set('zlib.output_compression', '0');

// Set headers for chunked transfer encoding
header('Content-Type: text/html; charset=utf-8');
header('X-Accel-Buffering: no');

use BamlClient\Api\DefaultApi;
use BamlClient\Model\ExtractResumeRequest;
use BamlClient\Model\BamlImage;
use BamlClient\Model\BamlImageUrl;
use BamlClient\Model\ExtractReceiptRequest;
use BamlClient\Model\ExtractReceiptRequestReceipt;
use BamlClient\Model\Message;
use BamlClient\Model\ClassifyMessageRequest;
use BamlClient\Model\Category;
use BamlClient\Model\ParseEmailRequest;
use BamlClient\Model\BookOrder;
use BamlClient\Model\FlightConfirmation;
use BamlClient\Model\GroceryReceipt;
use BamlClient\Model\FlightEndpoint;

$apiInstance = new DefaultApi( new GuzzleHttp\Client());

// Example 1: see 01-extract-receipt.baml
(function() use ($apiInstance) {
    $receipt = new ExtractReceiptRequestReceipt();
    $receipt->setUrl( "https://i.redd.it/adzt4bz4llfc1.jpeg");
    $req = new ExtractReceiptRequest();
    $req->setReceipt($receipt);
    $resp = $apiInstance->extractReceipt($req);
    echo "<pre> ExtractReceipt: " . print_r($resp, true) . "</pre>";
})();

// Example 2: see 02-extract-resume.baml
(function() use ($apiInstance) {
    $extract_resume_request = new ExtractResumeRequest();
    $extract_resume_request->setResumeText(<<<EOD
        John Doe

        Education
        - University of California, Berkeley
        - B.S. in Computer Science
        - graduated 2020

        Skills
        - Python
        - Java
        - C++
    EOD);
    $result = $apiInstance->extractResume($extract_resume_request);
    echo "<pre> ExtractResume: " . print_r($result, true) . "</pre>";
    $edu0 = $result->getEducation()[0];
    echo "<pre> Education: " . print_r($edu0, true) . "</pre>";
})();

// Example 3: see 03-classify-user-msg.baml
(function() use ($apiInstance) {
    $message = new Message();
    $message->setUserName("Alice");
    $message->setMessage("I can't access my account using my login credentials. I havent received the promised reset password email. Please help.");
    $req = new ClassifyMessageRequest();
    $req->setMessage($message);
    $resp = $apiInstance->classifyMessage($req);
    echo "<pre> ClassifyMessage: " . print_r($resp, true) . "</pre>";
    if ($resp == Category::ACCOUNT_ISSUE) {
        echo "<pre> Category: Account Issue</pre>";
    }
    if ($resp == Category::CANCEL_ORDER) {
        echo "<pre> Category: Cancel Order</pre>";
    }
    if ($resp == Category::QUESTION) {
        echo "<pre> Category: Question</pre>";
    }
    if ($resp == Category::REFUND) {
        echo "<pre> Category: Refund</pre>";
    }
    if ($resp == Category::TECHNICAL_SUPPORT) {
        echo "<pre> Category: Technical Support</pre>";
    }
})();

// Example 4: see parse-email.baml
(function() use ($apiInstance) {
    $input = <<<EOD

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
EOD;
    $req = new ParseEmailRequest();
    $req->setInput($input);
    $resp = $apiInstance->parseEmail($req);
    echo "<pre> ParseEmail: " . print_r($resp, true) . "</pre>";

    // PHP doesn't have discriminants on the generated union types, so we have to make do by guessing based
    // on the shape of the response
    if ($resp->getOrderId() != null) {
        echo "<pre> ParseEmail was a BookOrder: " . print_r($resp, true) . "</pre>";
    } elseif ($resp->getConfirmationNumber() != null) {
        echo "<pre> ParseEmail was a FlightConfirmation: " . print_r($resp, true) . "</pre>";
        echo "<pre> ParseEmail was a FlightConfirmation as json: " . $resp->__toString() . "</pre>";

        // WARNING: this code does not work.
        //
        // It turns out that OpenAPI PHP codegen doesn't really support oneOf (note that oneOf is marked
        // as explicitly unsupported in the docs: https://openapi-generator.tech/docs/generators/php/) and
        // adding oneOf support is explicitly called out as something that OpenAPI intends to
        // implement in php-nextgen (see https://github.com/OpenAPITools/openapi-generator/issues/13192)
        //
        // Please reach out to us (https://docs.boundaryml.com/contact) if this is a problem for you, and
        // we can work with you to find a solution.
        $flightNum = $resp->getFlightNumber();
        if (is_string($flightNum)) {
            echo "<pre> Flight number is a string: " . print_r($flightNum, true) . "</pre>";
        } elseif (is_int($flightNum)) {
            echo "<pre> Flight number is an int: " . print_r($flightNum, true) . "</pre>";
        } else {
            echo "<pre> Flight number is an unknown type: " . print_r($flightNum, true) . "</pre>";
        }

        // Same as the above, this code doesn't work.
        $departure = $resp->getDeparture();
        if (is_string($departure)) {
            echo "<pre> Departure is a string: " . print_r($departure, true) . "</pre>";
        } else {
            echo "<pre> Departure is an unknown type: " . print_r($departure, true) . "</pre>";
        }

        echo "<pre> Baggage rules: " . print_r($resp->getBaggageRules(), true) . "</pre>";
    } elseif ($resp->getReceiptId() != null) {
        echo "<pre> ParseEmail was a GroceryReceipt: " . print_r($resp, true) . "</pre>";
    } else {
        echo "<pre> ParseEmail was an unknown type" . print_r($resp->getModelName(), true) . "</pre>";
    }
})();
