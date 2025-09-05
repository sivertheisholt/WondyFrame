use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryItem {
    #[serde(rename = "uniqueName")]
    pub unique_name: String,
    pub item: String,
    pub ducats: u32,
    pub credits: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VoidTrader {
    pub id: String,
    pub activation: String,
    #[serde(rename = "startString")]
    pub start_string: Option<String>,
    pub expiry: String,
    pub active: Option<bool>,
    pub character: String,
    pub location: String,
    pub inventory: Vec<InventoryItem>,
    #[serde(rename = "psId")]
    pub ps_id: String,
    #[serde(rename = "endString")]
    pub end_string: Option<String>,
    #[serde(rename = "initialStart")]
    pub initial_start: String,
    pub schedule: Vec<String>,
}
