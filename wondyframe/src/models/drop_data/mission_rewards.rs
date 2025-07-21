use crate::deserializers::deserialize_rewards::deserialize_rewards;
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MissionRewards {
    #[serde(rename = "missionRewards")]
    pub mission_rewards: HashMap<String, HashMap<String, Mission>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Mission {
    #[serde(rename = "gameMode")]
    pub game_mode: String,
    #[serde(rename = "isEvent")]
    pub is_event: bool,
    #[serde(deserialize_with = "deserialize_rewards")]
    pub rewards: HashMap<String, Vec<Reward>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Reward {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "itemName")]
    pub item_name: String,
    pub chance: f32,
    #[serde(rename = "rarity")]
    pub rarity: String,
}
