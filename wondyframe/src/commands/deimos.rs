use log::{error, info};
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;
use warframe::worldstate::{TimedEvent, queryable::CambionDrift};

use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(
    slash_command,
    description_localized("en-US", "Get current Deimos details")
)]
pub async fn deimos(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Deimos command called");
    let is_public = public.unwrap_or(false);
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let cambion_drift: CambionDrift = match client.fetch::<CambionDrift>().await {
        Ok(v) => v,
        Err(e) => {
            error!("Error fetching data from API: {:?}", e);
            return Err("Could not fetch Deimos data at this time due to external failure.".into());
        }
    };

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
