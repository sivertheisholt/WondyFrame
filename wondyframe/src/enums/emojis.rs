use dotenv::var;

pub enum Emojis {
    SteelEssence,
    OrokinDucats,
    Credits,
}

fn is_prod() -> bool {
    var("ENVIRONMENT").unwrap_or_default() == "prod"
}

impl Emojis {
    pub fn full_definition(&self) -> String {
        match self {
            Emojis::SteelEssence => format!("<:{}:{}>", self.name(), self.id()),
            Emojis::OrokinDucats => format!("<:{}:{}>", self.name(), self.id()),
            Emojis::Credits => format!("<:{}:{}>", self.name(), self.id()),
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Emojis::SteelEssence => "steel_essence",
            Emojis::OrokinDucats => "orokin_ducats",
            Emojis::Credits => "credits",
        }
    }

    pub fn id(&self) -> &'static str {
        match self {
            Emojis::SteelEssence => {
                if is_prod() {
                    "1395849810900422717"
                } else {
                    "1395859165502640138"
                }
            }
            Emojis::OrokinDucats => {
                if is_prod() {
                    "1396527605829603458"
                } else {
                    "1396526351124664520"
                }
            }
            Emojis::Credits => {
                if is_prod() {
                    "1396527847836880937"
                } else {
                    "1396527922369658941"
                }
            }
        }
    }
}
