use crate::{
    api::warframe_client::WarframeClient,
    commands::{
        archimedea::archimedea, cetus::cetus, deimos::deimos, fissures::fissures, fortuna::fortuna,
        nightwave::nightwave,
    },
    models::data::Data,
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
mod enums;
mod models;
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

                on_bot_ready(ctx, _ready).await;
                Ok(Data {
                    client: Client::new(),
                    warframe_client: WarframeClient::new("pc"),
                })
            })
        })
        .build();

    let client = ClientBuilder::new(token, intents)
        .framework(framework)
        .await;
    client.unwrap().start().await.unwrap();
}
