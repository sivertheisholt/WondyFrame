use std::collections::HashMap;

use reqwest::Client;
use serde::de::DeserializeOwned;

pub struct WarframeClient {
    base_url: String,
    query_params: HashMap<String, String>,
    client: Client,
}

impl WarframeClient {
    pub fn new(platform: &str) -> Self {
        Self {
            base_url: format!("https://api.warframestat.us/{}/", platform),
            query_params: HashMap::from([("language".to_string(), "en".to_string())]),
            client: Client::new(),
        }
    }

    pub async fn fetch<T>(&self, endpoint: &str) -> Result<T, reqwest::Error>
    where
        T: DeserializeOwned,
    {
        let url = if endpoint == "steelpath" {
            format!("https://api.warframestat.us/steelpath")
        } else {
            format!("{}{}", self.base_url, endpoint)
        };
        let response = self
            .client
            .get(&url)
            .query(&self.query_params)
            .send()
            .await?
            .json::<T>()
            .await?;
        Ok(response)
    }
}
