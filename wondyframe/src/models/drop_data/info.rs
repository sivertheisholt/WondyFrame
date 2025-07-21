use serde::Deserialize;

#[derive(Deserialize)]
pub struct Info {
    #[allow(dead_code)]
    pub hash: String,
    #[allow(dead_code)]
    pub timestamp: f32,
    pub modified: f32,
}
