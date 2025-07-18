use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;

use crate::api::warframe_client;
use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::models::archon::Archon;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::eta_from_utc;
use crate::utils::date::format_timestamp;

enum MissionLevel {
    First,
    Second,
    Third,
}

impl MissionLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            MissionLevel::First => "130-135",
            MissionLevel::Second => "135-140",
            MissionLevel::Third => "140-145",
        }
    }
}
#[poise::command(slash_command)]
pub async fn archon(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Archon command called");
    let is_public = public.unwrap_or(false);
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let archon: Archon = warframe_client.fetch::<Archon>("archonHunt").await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title(archon.boss)
        .url("https://wiki.warframe.com/w/Archon_Hunt")
        .color(Colors::EmbedColor.as_u32())
        .field(
            "",
            format!("**Expires:** {}", eta_from_utc(&archon.expiry)),
            false,
        )
        .fields(
            archon
                .missions
                .iter()
                .enumerate()
                .map(|(index, mission)| {
                    let required = if !mission.required_items.is_empty() {
                        format!(
                            "\nRequired: {}",
                            mission
                                .required_items
                                .iter()
                                .map(|item| format!("{}", item))
                                .collect::<Vec<_>>()
                                .join(", ")
                        )
                    } else {
                        String::new()
                    };
                    let auras = mission
                        .level_auras
                        .iter()
                        .map(|aura| format!("{}", aura))
                        .collect::<Vec<_>>()
                        .join(", ");
                    (
                        format!("{} - {}", mission.type_key, mission.node_key),
                        format!(
                            "Level: {}{}{}",
                            match index {
                                0 => MissionLevel::First,
                                1 => MissionLevel::Second,
                                2 => MissionLevel::Third,
                                _ => MissionLevel::First,
                            }
                            .as_str(),
                            if !required.is_empty() {
                                format!("\nRequired: {}", required)
                            } else {
                                "".to_string()
                            },
                            if !auras.is_empty() {
                                format!("\nAuras: {}", auras)
                            } else {
                                "".to_string()
                            }
                        ),
                        false,
                    )
                })
                .collect::<Vec<_>>(),
        )
        .thumbnail(Thumbnail::Archon.url())
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
