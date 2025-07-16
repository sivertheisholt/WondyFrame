use std::{fmt, str::FromStr};

#[derive(Debug, Clone, serde::Deserialize, PartialEq, Eq, Hash)]
pub enum Tier {
    Lith = 1,
    Meso = 2,
    Neo = 3,
    Axi = 4,
    Requiem = 5,
    Omnia = 6,
}

impl fmt::Display for Tier {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Tier::Lith => "Lith",
            Tier::Meso => "Meso",
            Tier::Neo => "Neo",
            Tier::Axi => "Axi",
            Tier::Requiem => "Requiem",
            Tier::Omnia => "Omnia",
        };
        write!(f, "{}", s)
    }
}

impl FromStr for Tier {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Lith" => Ok(Tier::Lith),
            "Meso" => Ok(Tier::Meso),
            "Neo" => Ok(Tier::Neo),
            "Axi" => Ok(Tier::Axi),
            "Requiem" => Ok(Tier::Requiem),
            "Omnia" => Ok(Tier::Omnia),
            _ => Err(()),
        }
    }
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Fissure {
    #[allow(dead_code)]
    pub id: String,

    #[allow(dead_code)]
    pub activation: String,

    #[allow(dead_code)]
    #[serde(rename = "startString")]
    pub start_string: String,

    #[allow(dead_code)]
    pub expiry: String,

    #[allow(dead_code)]
    pub active: bool,

    pub node: String,

    #[serde(rename = "missionType")]
    pub mission_type: String,

    #[allow(dead_code)]
    #[serde(rename = "missionKey")]
    pub mission_key: String,

    pub enemy: String,

    #[allow(dead_code)]
    #[serde(rename = "enemyKey")]
    pub enemy_key: String,

    #[allow(dead_code)]
    #[serde(rename = "nodeKey")]
    pub node_key: String,

    pub tier: Tier,

    #[allow(dead_code)]
    #[serde(rename = "tierNum")]
    pub tier_num: u8,

    #[allow(dead_code)]
    pub expired: bool,

    pub eta: String,

    #[allow(dead_code)]
    #[serde(rename = "isStorm")]
    pub is_storm: bool,

    #[allow(dead_code)]
    #[serde(rename = "isHard")]
    pub is_hard: bool,
}
