use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;
use warframe::worldstate::{TimedEvent, queryable::CambionDrift};

use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn deimos(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Deimos command called");
    let is_public = public.unwrap_or(false);
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let cambion_drift: CambionDrift = client.fetch::<CambionDrift>().await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Deimos")
        .url("https://warframe.fandom.com/wiki/Deimos")
        .color(Colors::EmbedColor.as_u32())
        .field("Current state", cambion_drift.state.to_string(), false)
        .field("Time left", cambion_drift.eta().to_string(), false)
        .thumbnail(Thumbnail::Deimos.url())
        .footer(CreateEmbedFooter::new(format!(
            "World state updated: {}",
            format_timestamp()
        )));

    let reply = poise::CreateReply::default()
        .embed(embed)
        .ephemeral(!is_public);

    ctx.send(reply).await?;

    Ok(())
}
