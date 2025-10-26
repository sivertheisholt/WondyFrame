pub enum Thumbnail {
    Cetus,
    Fortuna,
    Deimos,
    Fissure,
    // DeepArchimedea,
    // TemporalArchimedea,
    Nightwave,
    Archon,
    SteelEssence,
    VoidTrader,
    Warframe,
    Item,
}

impl Thumbnail {
    pub fn url_with_item(&self, item_name: &str) -> &'static str {
        self.url_with_name(Some(item_name))
    }

    pub fn url(&self) -> &'static str {
        self.url_with_name(None)
    }

    fn url_with_name(&self, item_name: Option<&str>) -> &'static str {
        match self {
            Thumbnail::Cetus => "https://wiki.warframe.com/images/Cetus.png?a140d",
            Thumbnail::Fortuna => {
                "https://wiki.warframe.com/images/thumb/Orb_Vallis.png/1024px-Orb_Vallis.png?7f8e7"
            }
            Thumbnail::Deimos => {
                "https://wiki.warframe.com/images/thumb/CambionDrift.jpg/1024px-CambionDrift.jpg?f2516"
            }
            Thumbnail::Fissure => "https://wiki.warframe.com/images/VoidTraces.png?fbc05",
            // Thumbnail::DeepArchimedea => {
            //     "https://static.wikia.nocookie.net/warframe/images/b/b7/MurmurIcon.png/revision/latest?cb=20240326045206"
            // }
            // Thumbnail::TemporalArchimedea => "https://wiki.warframe.com/images/HexIcon.png?c8c7d",
            Thumbnail::Nightwave => "https://wiki.warframe.com/images/NightwaveSyndicate.png?e0486",
            Thumbnail::Archon => "https://wiki.warframe.com/images/IconNarmer.png?1337d",

            Thumbnail::SteelEssence => {
                "https://static.wikia.nocookie.net/warframe/images/1/10/SteelEssence.png/revision/latest?cb=20221214233649"
            }
            Thumbnail::VoidTrader => {
                "https://static.wikia.nocookie.net/warframe/images/a/a7/TennoCon2020BaroCropped.png/revision/latest?cb=20200712232455"
            }
            Thumbnail::Warframe => {
                "https://static.wikia.nocookie.net/warframe/images/e/e6/Site-logo.png/revision/latest?cb=20210617231240"
            }
            Thumbnail::Item => {
                if item_name
                    .as_deref()
                    .map_or(false, |s: &str| s.contains("System"))
                {
                    "https://static.wikia.nocookie.net/warframe/images/d/d2/PrimeSystems.png/revision/latest/scale-to-width-down/32?cb=20230222214252"
                } else if item_name
                    .as_deref()
                    .map_or(false, |s| s.contains("Chassis"))
                {
                    "https://static.wikia.nocookie.net/warframe/images/e/ef/PrimeChassis.png/revision/latest/scale-to-width-down/32?cb=20230222214229"
                } else if item_name
                    .as_deref()
                    .map_or(false, |s| s.contains("Neuroptics"))
                {
                    "https://static.wikia.nocookie.net/warframe/images/c/c1/PrimeHelmet.png/revision/latest/scale-to-width-down/32?cb=20230222214208"
                } else {
                    "https://static.wikia.nocookie.net/warframe/images/e/e8/ExcaliburPrimeFull.png/revision/latest?cb=20180628213418"
                }
            }
        }
    }
}
