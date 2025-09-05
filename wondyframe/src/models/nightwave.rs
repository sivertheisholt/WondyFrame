use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Nightwave {
    pub id: String,

    pub activation: String,

    #[serde(rename = "startString")]
    pub start_string: Option<String>,

    pub expiry: String,

    pub active: Option<bool>,

    pub season: u32,

    pub tag: String,

    pub phase: u32,

    pub params: Params,

    #[serde(rename = "possibleChallenges")]
    pub possible_challenges: Vec<Challenge>,

    #[serde(rename = "activeChallenges")]
    pub active_challenges: Vec<Challenge>,

    #[serde(rename = "rewardTypes")]
    pub reward_types: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Params {}

#[derive(Debug, Serialize, Deserialize)]
pub struct Challenge {
    pub id: String,

    pub activation: String,

    #[serde(rename = "startString")]
    pub start_string: Option<String>,

    pub expiry: String,

    pub active: Option<bool>,

    #[serde(rename = "isDaily")]
    pub is_daily: bool,

    #[serde(rename = "isElite")]
    pub is_elite: bool,

    pub desc: String,

    pub title: String,

    pub reputation: u32,

    #[serde(rename = "isPermanent")]
    pub is_permanent: bool,
}
