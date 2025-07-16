use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Archimedea {
    #[allow(dead_code)]
    pub id: String,

    #[allow(dead_code)]
    pub activation: String,

    #[allow(dead_code)]
    pub expiry: String,

    pub missions: Vec<Mission>,

    #[serde(rename = "personalModifiers")]
    pub personal_modifiers: Vec<Modifier>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Mission {
    pub mission: String,

    pub deviation: Modifier,

    #[serde(rename = "riskVariables")]
    pub risk_variables: Vec<Modifier>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Modifier {
    #[allow(dead_code)]
    pub key: String,

    pub name: String,

    pub description: String,
}
