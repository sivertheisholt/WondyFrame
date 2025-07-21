use warframe::worldstate::Client;

use crate::{api::warframe_client::WarframeClient, services::drops_service::Drops};

pub struct Data {
    pub client: Client,
    pub warframe_client: WarframeClient,
    pub warframe_drops: Drops,
    pub warframe_drops_modified_last: String,
}
