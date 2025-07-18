use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    pub name: String,
    pub cost: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Steelpath {
    pub rotation: Vec<Item>,
    pub evergreen: Vec<Item>,
}
