use log::{error, info};
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;
use warframe::worldstate::{TimedEvent, queryable::OrbVallis};

use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(
    slash_command,
    description_localized("en-US", "Get current Orb Vallis details")
)]
pub async fn fortuna(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Fortuna command called");
    let is_public = public.unwrap_or(false);
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let orb_vallis: OrbVallis = match client.fetch::<OrbVallis>().await {
        Ok(v) => v,
        Err(e) => {
            error!("Error fetching data from API: {:?}", e);
            return Err(
                "Could not fetch Fortuna data at this time due to external failure.".into(),
            );
        }
    };

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Orb Vallis")
        .url("https://warframe.fandom.com/wiki/Orb_Vallis")
        .color(Colors::EmbedColor.as_u32())
        .field("Current state", orb_vallis.state.to_string(), false)
        .field("Time left", orb_vallis.eta().to_string(), false)
        .thumbnail(Thumbnail::Fortuna.url())
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
