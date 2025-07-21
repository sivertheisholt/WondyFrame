use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TransientRewards {
    #[serde(rename = "transientRewards")]
    pub transient_rewards: Vec<TransientReward>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransientReward {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "objectiveName")]
    pub objective_name: String,
    pub rewards: Vec<Reward>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Reward {
    #[serde(rename = "_id")]
    pub id: String,
    pub rotation: Option<String>,
    #[serde(rename = "itemName")]
    pub item_name: String,
    pub rarity: String,
    pub chance: f32,
}
