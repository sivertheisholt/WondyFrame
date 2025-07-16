pub enum Colors {
    EmbedColor,
}

impl Colors {
    pub fn as_u32(&self) -> u32 {
        match self {
            Colors::EmbedColor => 0x0099ff,
        }
    }
}
