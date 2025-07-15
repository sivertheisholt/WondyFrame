use poise::CreateReply;
use serenity::all::{
    ComponentInteraction, ComponentInteractionCollector, CreateActionRow, CreateButton,
    CreateEmbed, CreateEmbedFooter, CreateInteractionResponse, CreateInteractionResponseMessage,
};
use warframe::worldstate::queryable::DeepArchimedea;

use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn archimedea(ctx: Context<'_>) -> Result<(), Error> {
    let client: &warframe::worldstate::Client = &ctx.data().client;
    let deep_archimedea: DeepArchimedea = client.fetch::<DeepArchimedea>().await?;

    let ctx_id: u64 = ctx.id();
    let modifiers_button: String = format!("{}modifiers", ctx_id);
    let archimedea_button: String = format!("{}archimedea", ctx_id);

    let embed: CreateEmbed = create_archimedea_embed(deep_archimedea.clone()).await;

    let components: Vec<CreateActionRow> = vec![CreateActionRow::Buttons(vec![
        CreateButton::new(&modifiers_button)
            .label("Modifiers")
            .style(poise::serenity_prelude::ButtonStyle::Primary),
    ])];

    let reply: CreateReply = CreateReply::default().components(components).embed(embed);

    ctx.send(reply).await?;

    while let Some(press) = ComponentInteractionCollector::new(ctx)
        .filter(move |press: &ComponentInteraction| {
            press.data.custom_id.starts_with(&ctx_id.to_string())
        })
        .timeout(std::time::Duration::from_secs(3600 * 24))
        .await
    {
        match &press.data.custom_id {
            x if x == &modifiers_button => {
                handle_modifiers_interaction(
                    ctx,
                    press,
                    deep_archimedea.clone(),
                    &archimedea_button,
                )
                .await?
            }
            x if x == &archimedea_button => {
                handle_archimedea_interaction(
                    ctx,
                    press,
                    deep_archimedea.clone(),
                    &modifiers_button,
                )
                .await?
            }
            _ => {}
        }
    }

    Ok(())
}

async fn create_modifiers_embed(deep_archimedea: DeepArchimedea) -> CreateEmbed {
    return CreateEmbed::new()
        .title("Modifiers")
        .color(0x0099ff)
        .thumbnail(Thumbnail::Archimedea.url())
        .fields(
            deep_archimedea
                .missions
                .iter()
                .map(|mission| {
                    (
                        mission.deviation.name.to_string(),
                        mission.deviation.description.to_string(),
                        false,
                    )
                })
                .collect::<Vec<_>>(),
        )
        .fields(
            deep_archimedea
                .missions
                .iter()
                .flat_map(|mission| &mission.risk_variables)
                .map(|risk| (risk.name.to_string(), risk.description.to_string(), false))
                .collect::<Vec<_>>(),
        )
        .fields(
            deep_archimedea
                .personal_modifiers
                .iter()
                .map(|modifier| {
                    (
                        modifier.name.to_string(),
                        modifier.description.to_string(),
                        false,
                    )
                })
                .collect::<Vec<_>>(),
        )
        .footer(CreateEmbedFooter::new(format!(
            "World state updated: {}",
            format_timestamp()
        )));
}

async fn create_archimedea_embed(deep_archimedea: DeepArchimedea) -> CreateEmbed {
    return CreateEmbed::new()
        .title("Deep Archimedea")
        .color(0x0099ff)
        .thumbnail(Thumbnail::Archimedea.url())
        .fields(
            deep_archimedea
                .missions
                .iter()
                .enumerate()
                .map(|(i, mission)| {
                    let emojis = [":one:", ":two:", ":three:"];
                    let emoji = emojis.get(i).unwrap_or(&":grey_question:");

                    (
                        format!("{} {}", emoji, mission.r#type.to_string()),
                        format!(
                            "**Deviation:** {} \n **Risks:** {}",
                            mission.deviation.name,
                            mission
                                .risk_variables
                                .iter()
                                .map(|risk| risk.name.to_string())
                                .collect::<Vec<String>>()
                                .join(", "),
                        ),
                        false,
                    )
                })
                .collect::<Vec<_>>(),
        )
        .field(
            ":grey_exclamation: Personal modifiers",
            deep_archimedea
                .personal_modifiers
                .iter()
                .map(|modifier| modifier.name.to_string())
                .collect::<Vec<String>>()
                .join("\n"),
            true,
        )
        .footer(CreateEmbedFooter::new(format!(
            "World state updated: {}",
            format_timestamp()
        )));
}

async fn handle_archimedea_interaction(
    ctx: Context<'_>,
    interaction: ComponentInteraction,
    deep_archimedea: DeepArchimedea,
    modifiers_button: &String,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_archimedea_embed(deep_archimedea).await;

    let components: Vec<CreateActionRow> = vec![CreateActionRow::Buttons(vec![
        CreateButton::new(modifiers_button)
            .label("Modifiers")
            .style(poise::serenity_prelude::ButtonStyle::Primary),
    ])];

    interaction
        .create_response(
            ctx.serenity_context(),
            CreateInteractionResponse::UpdateMessage(
                CreateInteractionResponseMessage::new()
                    .embed(embed)
                    .components(components),
            ),
        )
        .await?;

    Ok(())
}

async fn handle_modifiers_interaction(
    ctx: Context<'_>,
    interaction: ComponentInteraction,
    deep_archimedea: DeepArchimedea,
    archimedea_button: &String,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_modifiers_embed(deep_archimedea).await;

    let components: Vec<CreateActionRow> = vec![CreateActionRow::Buttons(vec![
        CreateButton::new(archimedea_button)
            .label("Archimedea")
            .style(poise::serenity_prelude::ButtonStyle::Primary),
    ])];

    interaction
        .create_response(
            ctx.serenity_context(),
            CreateInteractionResponse::UpdateMessage(
                CreateInteractionResponseMessage::new()
                    .embed(embed)
                    .components(components),
            ),
        )
        .await?;

    Ok(())
}
