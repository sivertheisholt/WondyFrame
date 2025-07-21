use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SortieRewards {
    #[serde(rename = "sortieRewards")]
    pub sortie_rewards: Vec<SortieReward>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SortieReward {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "itemName")]
    pub item_name: String,
    pub rarity: String,
    pub chance: f32,
}
