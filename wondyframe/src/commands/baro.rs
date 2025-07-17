use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;

use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn baro(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Baro command called");
    let is_public = public.unwrap_or(false);
    //let client: &warframe::worldstate::Client = &ctx.data().client;
    //let void_trader: VoidTrader = client.fetch::<VoidTrader>().await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Orb Vallis")
        .color(Colors::EmbedColor.as_u32())
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
