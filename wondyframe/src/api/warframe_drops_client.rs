use log::info;
use reqwest::Client;

use crate::models::drop_data::{
    blueprint_locations::BlueprintLocations, cetus_bounty_rewards::CetusBountyRewards,
    enemy_blueprint_tables::EnemyBlueprintTables, enemy_mod_tables::EnemyModTables, info::Info,
    misc_items::MiscItems, mission_rewards::MissionRewards, mod_locations::ModLocations,
    relics::Relics, sortie_rewards::SortieRewards, syndicates::Syndicates,
    transient_rewards::TransientRewards, zariman_rewards::ZarimanRewards,
};

pub struct WarframeDropsClient {
    base_url: String,
    client: Client,
}

impl WarframeDropsClient {
    pub fn new() -> Self {
        Self {
            base_url: format!("https://drops.warframestat.us/data"),
            client: Client::new(),
        }
    }

    pub async fn fetch_mission_rewards(&self) -> Result<MissionRewards, reqwest::Error> {
        info!("Fetching mission rewards");
        let url = format!("{}/missionRewards.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<MissionRewards>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_relics(&self) -> Result<Relics, reqwest::Error> {
        info!("Fetching relics");
        let url = format!("{}/relics.json", self.base_url);
        let response = self.client.get(&url).send().await?.json::<Relics>().await?;
        Ok(response)
    }

    pub async fn fetch_transient_rewards(&self) -> Result<TransientRewards, reqwest::Error> {
        info!("Fetching transient rewards");
        let url = format!("{}/transientRewards.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<TransientRewards>()
            .await?;
        Ok(response)
    }

    pub async fn sortie_rewards(&self) -> Result<SortieRewards, reqwest::Error> {
        info!("Fetching sortie rewards");
        let url = format!("{}/sortieRewards.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<SortieRewards>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_mod_locations(&self) -> Result<ModLocations, reqwest::Error> {
        info!("Fetching mod locations");
        let url = format!("{}/modLocations.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<ModLocations>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_enemy_mod_tables(&self) -> Result<EnemyModTables, reqwest::Error> {
        info!("Fetching enemy mod tables");
        let url = format!("{}/enemyModTables.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<EnemyModTables>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_enemy_blueprint_tables(
        &self,
    ) -> Result<EnemyBlueprintTables, reqwest::Error> {
        info!("Fetching enemy blueprint tables");
        let url = format!("{}/enemyBlueprintTables.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<EnemyBlueprintTables>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_blueprint_locations(&self) -> Result<BlueprintLocations, reqwest::Error> {
        info!("Fetching blueprint locations");
        let url = format!("{}/blueprintLocations.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<BlueprintLocations>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_cetus_bounty_rewards(&self) -> Result<CetusBountyRewards, reqwest::Error> {
        info!("Fetching cetus bounty rewards");
        let url = format!("{}/cetusBountyRewards.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<CetusBountyRewards>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_zariman_rewards(&self) -> Result<ZarimanRewards, reqwest::Error> {
        info!("Fetching zariman rewards");
        let url = format!("{}/zarimanRewards.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<ZarimanRewards>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_syndicates(&self) -> Result<Syndicates, reqwest::Error> {
        info!("Fetching syndicates");
        let url = format!("{}/syndicates.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<Syndicates>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_misc_items(&self) -> Result<MiscItems, reqwest::Error> {
        info!("Fetching misc items");
        let url = format!("{}/miscItems.json", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<MiscItems>()
            .await?;
        Ok(response)
    }

    pub async fn fetch_info(&self) -> Result<Info, reqwest::Error> {
        info!("Fetching drops info");
        let url = format!("{}/info.json", self.base_url);
        let response = self.client.get(&url).send().await?.json::<Info>().await?;
        Ok(response)
    }
}
