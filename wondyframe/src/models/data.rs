use warframe::worldstate::Client;

use crate::api::warframe_client::WarframeClient;

pub struct Data {
    pub client: Client,
    pub warframe_client: WarframeClient,
}
