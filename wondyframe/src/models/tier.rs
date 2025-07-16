use warframe::worldstate::Client;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Tier {
    pub id: String,
    pub activation: String,
    pub startString: String,
    pub expiry: String,
    pub active: bool,
    pub node: String,
    pub missionType: String,
    pub missionKey: String,
    pub enemy: String,
    pub enemyKey: String,
    pub nodeKey: String,
    pub tier: String,
    pub tierNum: u8,
    pub expired: bool,
    pub eta: String,
    pub isStorm: bool,
    pub isHard: bool,
}
