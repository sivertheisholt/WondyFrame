use serenity::all::{CreateEmbed, CreateEmbedFooter, CreateSelectMenu, CreateSelectMenuOption};
use warframe::worldstate::{TimedEvent, queryable::Fissure};

use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn fissure(ctx: Context<'_>) -> Result<(), Error> {
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let fissures: Vec<Fissure> = client.fetch::<Fissure>().await?;

    // Get unique fissure types
    let mut fissure_types: Vec<String> = fissures
        .iter()
        .map(|f| f.mission_type.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    fissure_types.sort();

    // Create select menu options
    let options: Vec<CreateSelectMenuOption> = fissure_types
        .iter()
        .map(|fissure_type| CreateSelectMenuOption::new(fissure_type.clone(), fissure_type.clone()))
        .collect();

    // let select_menu = CreateSelectMenu::new(
    //     "fissure_type",
    //     CreateSelectMenuOption::new("Select fissure type", "placeholder")
    //         .description("Choose a fissure type to view"),
    // )
    // .options(options);

    // let embed = CreateEmbed::new()
    //     .title("Fissure Missions")
    //     .description("Select a fissure type from the dropdown below to view available missions.")
    //     .color(0x0099ff)
    //     .thumbnail("https://wiki.warframe.com/images/Cetus.png?a140d")
    //     .footer(CreateEmbedFooter::new(format!(
    //         "World state updated: {}",
    //         format_timestamp()
    //     )));

    // let reply = poise::CreateReply::default()
    //     .embed(embed)
    //     .select_menu(select_menu);

    // ctx.send(reply).await?;

    Ok(())
}
