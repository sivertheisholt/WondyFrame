use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EnemyBlueprintTables {
    #[serde(rename = "enemyBlueprintTables")]
    pub enemy_blueprint_tables: Vec<EnemyBlueprintTable>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EnemyBlueprintTable {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "enemyName")]
    pub enemy_name: String,
    pub items: Vec<Item>,
    pub mods: Vec<Mod>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "itemName")]
    pub item_name: String,
    pub rarity: String,
    pub chance: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Mod {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "modName")]
    pub mod_name: String,
    pub rarity: String,
    pub chance: Option<f32>,
}
