use reqwest::Client;
use serde::de::DeserializeOwned;

pub struct WarframeDrops {
    base_url: String,
    client: Client,
}

impl WarframeDrops {
    pub fn new() -> Self {
        Self {
            base_url: format!("http://drops.warframestat.us/data/all.json"),
            client: Client::new(),
        }
    }

    pub async fn fetch<All>(&self) -> Result<All, reqwest::Error>
    where
        All: DeserializeOwned,
    {
        let url = format!("{}", self.base_url);
        let response = self.client.get(&url).send().await?.json::<All>().await?;
        Ok(response)
    }
}
