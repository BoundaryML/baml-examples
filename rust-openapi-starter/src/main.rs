use baml_client::models::ExtractResumeRequest;
use baml_client::apis::default_api as b;

#[tokio::main]
async fn main() {
    let config = baml_client::apis::configuration::Configuration::default();

    let resp = b::extract_resume(&config, ExtractResumeRequest {
        resume: "Tony Hoare is a British computer scientist who has made foundational contributions to programming languages, algorithms, operating systems, formal verification, and concurrent computing.".to_string(),
    }).await.unwrap();

    println!("{:#?}", resp);
}
