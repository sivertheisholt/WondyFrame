use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ZarimanRewards {
    #[serde(rename = "zarimanRewards")]
    pub zariman_rewards: Vec<ZarimanReward>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ZarimanReward {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "bountyLevel")]
    pub bounty_level: String,
    pub rewards: HashMap<String, Vec<Reward>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Reward {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "itemName")]
    pub item_name: String,
    pub rarity: String,
    pub chance: Option<f32>,
    pub stage: String,
}
