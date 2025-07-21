use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct BlueprintLocations {
    #[serde(rename = "blueprintLocations")]
    pub blueprint_locations: Vec<BlueprintLocation>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlueprintLocation {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "blueprintName")]
    pub blueprint_name: String,
    pub enemies: Vec<Enemy>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Enemy {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "enemyName")]
    pub enemy_name: String,
    #[serde(rename = "enemyItemDropChance")]
    pub enemy_item_drop_chance: Option<f32>,
    #[serde(rename = "enemyBlueprintDropChance")]
    pub enemy_blueprint_drop_chance: Option<f32>,
    pub rarity: String,
    pub chance: Option<f32>,
}
