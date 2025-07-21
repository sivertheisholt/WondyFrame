use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ModLocations {
    #[serde(rename = "modLocations")]
    pub mod_locations: Vec<ModLocation>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModLocation {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "modName")]
    pub mod_name: String,
    pub enemies: Vec<Enemy>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Enemy {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "enemyName")]
    pub enemy_name: String,
    #[serde(rename = "enemyModDropChance")]
    pub enemy_mod_drop_chance: Option<f32>,
    pub rarity: String,
    pub chance: Option<f32>,
}
