use crate::{
    commands::{archimedea::archimedea, cetus::cetus, deimos::deimos, fortuna::fortuna},
    models::data::Data,
};
use ::serenity::all::{ClientBuilder, GatewayIntents, GuildId};
use poise::{
    Framework, FrameworkOptions,
    samples::{register_globally, register_in_guild},
    serenity_prelude as serenity,
};
use warframe::worldstate::Client;

use dotenv::{dotenv, var};

mod commands;
mod enums;
mod models;
mod types;
mod utils;

async fn on_bot_ready(ready: &serenity::Ready) {
    println!("Bot {} is now connected and ready!", ready.user.name);
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let token = var("DISCORD_TOKEN").expect("missing DISCORD_TOKEN");
    let intents = GatewayIntents::non_privileged();

    let framework = Framework::builder()
        .options(FrameworkOptions {
            commands: vec![cetus(), fortuna(), deimos(), archimedea()],

            ..Default::default()
        })
        .setup(|ctx, _ready, framework| {
            Box::pin(async move {
                if var("ENVIRONMENT").unwrap_or_default() == "prod" {
                    register_globally(ctx, &framework.options().commands).await?;
                } else {
                    let guild_id = GuildId::new(1236683291164414054);
                    register_in_guild(ctx, &framework.options().commands, guild_id).await?;
                }

                on_bot_ready(_ready).await;
                Ok(Data {
                    client: Client::new(),
                })
            })
        })
        .build();

    let client = ClientBuilder::new(token, intents)
        .framework(framework)
        .await;
    client.unwrap().start().await.unwrap();
}
