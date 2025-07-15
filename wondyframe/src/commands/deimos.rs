use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;
use warframe::worldstate::{TimedEvent, queryable::CambionDrift};

use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn deimos(ctx: Context<'_>) -> Result<(), Error> {
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let cambion_drift: CambionDrift = client.fetch::<CambionDrift>().await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Orb Vallis")
        .color(0x0099ff)
        .field("Current state", cambion_drift.state.to_string(), false)
        .field("Time left", cambion_drift.eta().to_string(), false)
        .thumbnail(Thumbnail::Deimos.url())
        .footer(CreateEmbedFooter::new(format!(
            "World state updated: {}",
            format_timestamp()
        )));

    let reply = poise::CreateReply::default().embed(embed);

    ctx.send(reply).await?;

    Ok(())
}
