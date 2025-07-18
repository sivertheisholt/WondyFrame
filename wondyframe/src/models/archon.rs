use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Archon {
    pub id: String,

    pub activation: String,

    #[serde(rename = "startString")]
    pub start_string: String,

    #[serde(rename = "expiry")]
    pub expiry: String,

    pub active: bool,

    #[serde(rename = "rewardPool")]
    pub reward_pool: String,

    #[serde(rename = "variants")]
    pub variants: Vec<String>,

    pub missions: Vec<Mission>,

    pub boss: String,

    pub faction: String,

    #[serde(rename = "factionKey")]
    pub faction_key: String,

    pub expired: bool,

    pub eta: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Mission {
    pub node: String,

    #[serde(rename = "nodeKey")]
    pub node_key: String,

    #[serde(rename = "type")]
    pub type_: String,

    #[serde(rename = "typeKey")]
    pub type_key: String,

    pub nightmare: bool,

    #[serde(rename = "archwingRequired")]
    pub archwing_required: bool,

    #[serde(rename = "isSharkwing")]
    pub is_sharkwing: bool,

    #[serde(rename = "advancedSpawners")]
    pub advanced_spawners: Vec<String>,

    #[serde(rename = "requiredItems")]
    pub required_items: Vec<String>,

    #[serde(rename = "levelAuras")]
    pub level_auras: Vec<String>,
}
