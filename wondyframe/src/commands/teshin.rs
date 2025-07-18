use chrono::Duration;
use chrono::NaiveDate;
use chrono::Utc;
use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;

use crate::api::warframe_client;
use crate::enums::colors::Colors;
use crate::enums::emojis::Emojis;
use crate::enums::thumbnail::Thumbnail;
use crate::models::steelpath::Steelpath;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn teshin(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Steelpath command called");
    let is_public = public.unwrap_or(false);
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let teshin_offerings: Steelpath = warframe_client.fetch::<Steelpath>("steelpath").await?;

    let today = Utc::now().date_naive();
    let week = steel_path_offering_week();
    let total = teshin_offerings.rotation.len();

    // Find the start date of the current rotation week
    let reference = NaiveDate::from_ymd_opt(2025, 6, 23).unwrap();
    let duration = today.signed_duration_since(reference);
    let weeks_since_reference = duration.num_days() / 7;
    let current_week_start = reference + Duration::days(weeks_since_reference * 7);

    let upcoming_str = (1..=8)
        .map(|i| {
            let idx = (week as usize - 1 + i) % total;
            let item = &teshin_offerings.rotation[idx];
            let next_rotation_date = current_week_start + Duration::days((i as i64) * 7);
            let days_until = (next_rotation_date - today).num_days();
            let when = if days_until == 1 {
                "in 1 day".to_string()
            } else {
                format!("in {} days", days_until)
            };
            format!("{} {}", when, item.name)
        })
        .collect::<Vec<_>>()
        .join("\n");

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Teshin offerings")
        .url("https://warframe.fandom.com/wiki/Teshin")
        .color(Colors::EmbedColor.as_u32())
        .thumbnail(Thumbnail::SteelEssence.url())
        .field(
            "Rotation",
            format!(
                "{} - {} <:steel_essence:{}>",
                teshin_offerings.rotation[week as usize - 1].name,
                teshin_offerings.rotation[week as usize - 1].cost,
                Emojis::SteelEssence.id()
            ),
            false,
        )
        .field("Upcoming", upcoming_str, false)
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

fn steel_path_offering_week() -> u32 {
    let today = Utc::now().date_naive();
    let reference = NaiveDate::from_ymd_opt(2025, 6, 23).unwrap();
    let duration = today.signed_duration_since(reference);
    let weeks = duration.num_days() / 7;
    ((weeks % 8 + 8) % 8 + 1) as u32
}
