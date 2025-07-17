use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;
use warframe::worldstate::{TimedEvent, queryable::Cetus};

use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn cetus(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Cetus command called");
    let is_public = public.unwrap_or(false);
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let cetus: Cetus = client.fetch::<Cetus>().await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Cetus")
        .url("https://warframe.fandom.com/wiki/Cetus")
        .color(Colors::EmbedColor.as_u32())
        .field("Current state", cetus.state.to_string(), false)
        .field("Time left", cetus.eta().to_string(), false)
        .thumbnail(Thumbnail::Cetus.url())
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
