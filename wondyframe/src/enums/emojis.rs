use dotenv::var;

pub enum Emojis {
    SteelEssence,
}

fn is_prod() -> bool {
    var("ENVIRONMENT").unwrap_or_default() == "prod"
}

impl Emojis {
    pub fn id(&self) -> &'static str {
        match self {
            Emojis::SteelEssence => {
                if is_prod() {
                    "1395849810900422717"
                } else {
                    "1395859165502640138"
                }
            }
        }
    }
}
