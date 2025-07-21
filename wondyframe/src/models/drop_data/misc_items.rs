use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MiscItems {
    #[serde(rename = "miscItems")]
    pub misc_items: Vec<MiscItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MiscItem {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "enemyName")]
    pub enemy_name: String,
    #[serde(rename = "enemyItemDropChance")]
    pub enemy_item_drop_chance: String,
    pub items: Vec<Item>,
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
