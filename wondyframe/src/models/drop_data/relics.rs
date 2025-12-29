use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Relics {
    pub relics: Vec<Relic>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Relic {
    pub tier: String,
    #[serde(rename = "relicName", default)]
    pub relic_name: String,
    pub state: String,
    pub rewards: Vec<Reward>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Reward {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "itemName")]
    pub item_name: String,
    pub rarity: String,
    pub chance: f32,
}
