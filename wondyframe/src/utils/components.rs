use serenity::all::{CreateEmbed, CreateEmbedFooter, CreateSelectMenuOption};
use warframe::worldstate::{TimedEvent, queryable::Fissure};

use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

pub async fn handle_fissure_selection(ctx: Context<'_>, selected_type: &str) -> Result<(), Error> {
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let fissures: Vec<Fissure> = client.fetch::<Fissure>().await?;

    // Filter fissures by selected type
    let filtered_fissures: Vec<&Fissure> = fissures
        .iter()
        .filter(|f| f.mission_type == selected_type)
        .collect();

    if filtered_fissures.is_empty() {
        let embed = CreateEmbed::new()
            .title(format!("No {} fissures available", selected_type))
            .description("There are currently no fissures of this type available.")
            .color(0xff0000)
            .footer(CreateEmbedFooter::new(format!(
                "World state updated: {}",
                format_timestamp()
            )));

        let reply = poise::CreateReply::default().embed(embed);
        ctx.send(reply).await?;
        return Ok(());
    }

    // Create embed fields for the selected fissure type
    let fields: Vec<(String, String, bool)> = filtered_fissures
        .iter()
        .map(|f| {
            (
                f.node.clone(),
                format!("Tier: {}\nTime left: {}", f.tier, f.eta()),
                false,
            )
        })
        .collect();

    let mut embed = CreateEmbed::new()
        .title(format!("{} Fissures", selected_type))
        .color(0x0099ff)
        .thumbnail("https://wiki.warframe.com/images/Cetus.png?a140d")
        .footer(CreateEmbedFooter::new(format!(
            "World state updated: {}",
            format_timestamp()
        )));

    // Add fields to embed
    for (name, value, inline) in fields {
        embed = embed.field(name, value, inline);
    }

    let reply = poise::CreateReply::default().embed(embed);
    ctx.send(reply).await?;

    Ok(())
}
