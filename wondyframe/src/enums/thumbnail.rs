pub enum Thumbnail {
    Cetus,
    Fortuna,
    Deimos,
    Fissure,
    DeepArchimedea,
    TemporalArchimedea,
    Nightwave,
    Archon,
    SteelEssence,
    VoidTrader,
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
            Thumbnail::Fissure => "https://wiki.warframe.com/images/VoidTraces.png?fbc05",
            Thumbnail::DeepArchimedea => {
                "https://static.wikia.nocookie.net/warframe/images/b/b7/MurmurIcon.png/revision/latest?cb=20240326045206"
            }
            Thumbnail::TemporalArchimedea => "https://wiki.warframe.com/images/HexIcon.png?c8c7d",
            Thumbnail::Nightwave => "https://wiki.warframe.com/images/NightwaveSyndicate.png?e0486",
            Thumbnail::Archon => "https://wiki.warframe.com/images/IconNarmer.png?1337d",

            Thumbnail::SteelEssence => {
                "https://static.wikia.nocookie.net/warframe/images/1/10/SteelEssence.png/revision/latest?cb=20221214233649"
            }
            Thumbnail::VoidTrader => {
                "https://static.wikia.nocookie.net/warframe/images/a/a7/TennoCon2020BaroCropped.png/revision/latest?cb=20200712232455"
            }
        }
    }
}
