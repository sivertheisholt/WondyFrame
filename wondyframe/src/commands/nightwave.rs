use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;

use crate::api::warframe_client;
use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::models::nightwave::Nightwave;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::eta_from_utc;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn nightwave(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Nightwave command called");
    let is_public = public.unwrap_or(false);
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let nightwave: Nightwave = warframe_client.fetch::<Nightwave>("nightwave").await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Nightwave")
        .url("https://warframe.fandom.com/wiki/Nightwave")
        .color(Colors::EmbedColor.as_u32())
        .thumbnail(Thumbnail::Nightwave.url())
        .field(
            "",
            format!(
                "**Season:** {} \n **Phase:** {} \n **Ends in:** {}",
                nightwave.season,
                nightwave.phase + 1,
                eta_from_utc(&nightwave.expiry)
            ),
            false,
        )
        .field(
            "Daily",
            nightwave
                .active_challenges
                .iter()
                .filter(|challenge| challenge.is_daily)
                .map(|challenge| {
                    format!(
                        ":white_small_square: **{} ({})** \n {}",
                        challenge.title, challenge.reputation, challenge.desc
                    )
                })
                .collect::<Vec<_>>()
                .join("\n"),
            false,
        )
        .field("", "", false)
        .field(
            "Weekly",
            nightwave
                .active_challenges
                .iter()
                .filter(|challenge| !challenge.is_daily)
                .map(|challenge| {
                    format!(
                        ":white_small_square: **{} ({})** \n {}",
                        challenge.title, challenge.reputation, challenge.desc
                    )
                })
                .collect::<Vec<_>>()
                .join("\n"),
            false,
        )
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
