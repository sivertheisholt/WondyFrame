use reqwest::Client;
use serde::de::DeserializeOwned;

pub struct WarframeClient {
    base_url: String,
    client: Client,
}

impl WarframeClient {
    pub fn new(platform: &str) -> Self {
        Self {
            base_url: format!("https://api.warframestat.us/{}/", platform),
            client: Client::new(),
        }
    }

    pub async fn fetch<T>(&self, endpoint: &str) -> Result<T, reqwest::Error>
    where
        T: DeserializeOwned,
    {
        let url = format!("{}{}", self.base_url, endpoint);
        let response = self.client.get(&url).send().await?.json::<T>().await?;
        Ok(response)
    }
}
