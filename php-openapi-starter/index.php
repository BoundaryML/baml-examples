<?php
require_once(__DIR__ . '/vendor/autoload.php');

$apiInstance = new \OpenAPI\Client\Api\DefaultApi(
    new GuzzleHttp\Client()
);
$extract_resume_request = new \OpenAPI\Client\Model\ExtractResumeRequest();
$extract_resume_request->setResume("Marie Curie was a Polish and naturalised-French physicist and chemist who conducted pioneering research on radioactivity");

try {
    $result = $apiInstance->extractResume($extract_resume_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling DefaultApi->extractResume: ', $e->getMessage(), PHP_EOL;
}
