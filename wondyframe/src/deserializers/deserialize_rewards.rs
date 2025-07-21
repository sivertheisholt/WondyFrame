use crate::models::drop_data::mission_rewards::Reward;
use core::fmt;

use serde::{
    Deserialize, Deserializer,
    de::{self, MapAccess, SeqAccess, Visitor},
};
use std::collections::HashMap;

pub fn deserialize_rewards<'de, D>(
    deserializer: D,
) -> Result<HashMap<String, Vec<Reward>>, D::Error>
where
    D: Deserializer<'de>,
{
    struct RewardsVisitor;

    impl<'de> Visitor<'de> for RewardsVisitor {
        type Value = HashMap<String, Vec<Reward>>;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a map of reward rotations or a flat list of rewards")
        }

        fn visit_map<M>(self, map: M) -> Result<Self::Value, M::Error>
        where
            M: MapAccess<'de>,
        {
            Deserialize::deserialize(de::value::MapAccessDeserializer::new(map))
        }

        fn visit_seq<A>(self, seq: A) -> Result<Self::Value, A::Error>
        where
            A: SeqAccess<'de>,
        {
            let rewards: Vec<Reward> =
                Deserialize::deserialize(de::value::SeqAccessDeserializer::new(seq))?;
            let mut map = HashMap::new();
            map.insert("Custom".to_string(), rewards);
            Ok(map)
        }
    }

    deserializer.deserialize_any(RewardsVisitor)
}
