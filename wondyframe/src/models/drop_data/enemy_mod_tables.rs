use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EnemyModTables {
    #[serde(rename = "enemyModTables")]
    pub enemy_mod_tables: Vec<EnemyModTable>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EnemyModTable {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "enemyName")]
    pub enemy_name: String,
    #[serde(rename = "enemyModDropChance")]
    pub enemy_mod_drop_chance: String,
    pub mods: Vec<Mod>,
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
