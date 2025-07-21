use crate::{
    api::{warframe_client::WarframeClient, warframe_drops_client::WarframeDropsClient},
    commands::{
        archimedea::archimedea, archon::archon, baro::baro, cetus::cetus, deimos::deimos,
        fissures::fissures, fortuna::fortuna, item::item, nightwave::nightwave, teshin::teshin,
    },
    models::data::Data,
    services::drops_service::initialize_drops,
    utils::date::format_timestamp_from_utc,
};
use ::serenity::all::{ActivityData, ClientBuilder, Context, GatewayIntents, GuildId};
use log::info;

use poise::{
    Framework, FrameworkOptions,
    samples::{register_globally, register_in_guild},
    serenity_prelude as serenity,
};
use warframe::worldstate::Client;

use dotenv::{dotenv, var};

mod api;
mod commands;
mod deserializers;
mod enums;
mod models;
mod services;
mod types;
mod utils;

async fn on_bot_ready(ctx: &Context, ready: &serenity::Ready) {
    info!("Bot {} is now connected and ready!", ready.user.name);
    ctx.set_activity(Some(ActivityData::playing("Warframe")));
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    env_logger::init();
    let token = var("DISCORD_TOKEN").expect("missing DISCORD_TOKEN");
    let intents = GatewayIntents::non_privileged();

    let framework = Framework::builder()
        .options(FrameworkOptions {
            commands: vec![
                cetus(),
                fortuna(),
                deimos(),
                archimedea(),
                fissures(),
                nightwave(),
                teshin(),
                archon(),
                baro(),
                item(),
            ],

            ..Default::default()
        })
        .setup(|ctx: &Context, _ready, framework| {
            Box::pin(async move {
                if var("ENVIRONMENT").unwrap_or_default() == "prod" {
                    register_globally(ctx, &framework.options().commands).await?;
                } else {
                    let guild_id = GuildId::new(1236683291164414054);
                    register_in_guild(ctx, &framework.options().commands, guild_id).await?;
                }
                let warframe_drops_client = WarframeDropsClient::new();

                let warframe_drops = initialize_drops(&warframe_drops_client).await;
                let warframe_drops_info = warframe_drops_client.fetch_info().await.unwrap();

                on_bot_ready(ctx, _ready).await;
                Ok(Data {
                    client: Client::new(),
                    warframe_client: WarframeClient::new("pc"),
                    warframe_drops: warframe_drops,
                    warframe_drops_modified_last: format_timestamp_from_utc(
                        warframe_drops_info.modified,
                    ),
                })
            })
        })
        .build();

    let client = ClientBuilder::new(token, intents)
        .framework(framework)
        .await;
    client.unwrap().start().await.unwrap();
}
