use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Syndicates {
    pub syndicates: HashMap<String, Vec<Syndicate>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Syndicate {
    #[serde(rename = "_id")]
    pub id: String,
    pub item: String,
    pub chance: f32,
    pub rarity: String,
    pub place: String,
    pub standing: Option<u32>,
}
