pub enum Thumbnail {
    Cetus,
    Fortuna,
    Deimos,
    Fissure,
    Archimedea,
}

impl Thumbnail {
    pub fn url(&self) -> &'static str {
        match self {
            Thumbnail::Cetus => "https://wiki.warframe.com/images/Cetus.png?a140d",
            Thumbnail::Fortuna => {
                "https://wiki.warframe.com/images/thumb/Orb_Vallis.png/1024px-Orb_Vallis.png?7f8e7"
            }
            Thumbnail::Deimos => {
                "https://wiki.warframe.com/images/thumb/CambionDrift.jpg/1024px-CambionDrift.jpg?f2516"
            }
            Thumbnail::Fissure => {
                "https://wiki.warframe.com/images/thumb/Fissure.png/1024px-Fissure.png?00000"
            }
            Thumbnail::Archimedea => {
                "https://static.wikia.nocookie.net/warframe/images/b/b7/MurmurIcon.png/revision/latest?cb=20240326045206"
            }
        }
    }
}
