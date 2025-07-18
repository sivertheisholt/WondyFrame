use log::info;
use poise::CreateReply;
use serenity::all::{
    ButtonStyle, ComponentInteraction, ComponentInteractionCollector, CreateActionRow,
    CreateButton, CreateEmbed, CreateEmbedFooter, CreateInteractionResponse,
    CreateInteractionResponseMessage,
};

use crate::api::warframe_client;
use crate::enums::archimedea_type::ArchimedeaType;
use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::models::archimedea::Archimedea;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn archimedea(
    ctx: Context<'_>,
    #[description = "Deep or Temporal"] r#type: ArchimedeaType,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Archimedea command called");
    let is_public = public.unwrap_or(false);
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let endpoint = match r#type {
        ArchimedeaType::Deep => "deepArchimedea",
        ArchimedeaType::Temporal => "temporalArchimedea",
    };
    let archimedea: Archimedea = warframe_client.fetch::<Archimedea>(endpoint).await?;

    let ctx_id: u64 = ctx.id();
    let modifiers_button: String = format!("{}modifiers", ctx_id);
    let archimedea_button: String = format!("{}archimedea", ctx_id);

    let embed: CreateEmbed = create_archimedea_embed(&archimedea, &r#type);

    let components: Vec<CreateActionRow> = vec![CreateActionRow::Buttons(vec![
        CreateButton::new(&modifiers_button)
            .label("Modifiers")
            .style(poise::serenity_prelude::ButtonStyle::Primary),
    ])];

    let reply: CreateReply = CreateReply::default()
        .components(components)
        .embed(embed)
        .ephemeral(!is_public);

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
                handle_modifiers_interaction(ctx, press, &archimedea, &archimedea_button, &r#type)
                    .await?
            }
            x if x == &archimedea_button => {
                handle_archimedea_interaction(ctx, press, &archimedea, &modifiers_button, &r#type)
                    .await?
            }
            _ => {}
        }
    }

    Ok(())
}

fn create_modifiers_embed(archimedea: &Archimedea, r#type: &ArchimedeaType) -> CreateEmbed {
    return CreateEmbed::new()
        .title("Modifiers")
        .color(Colors::EmbedColor.as_u32())
        .thumbnail(match r#type {
            ArchimedeaType::Deep => Thumbnail::DeepArchimedea.url(),
            ArchimedeaType::Temporal => Thumbnail::TemporalArchimedea.url(),
        })
        .fields(
            archimedea
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
        .fields(match r#type {
            ArchimedeaType::Deep => archimedea
                .missions
                .iter()
                .flat_map(|mission| &mission.risk_variables)
                .map(|risk| (risk.name.to_string(), risk.description.to_string(), false))
                .collect::<Vec<_>>(),
            ArchimedeaType::Temporal => archimedea
                .missions
                .iter()
                .flat_map(|mission| &mission.risk_variables)
                .map(|risk| (risk.name.to_string(), risk.description.to_string(), false))
                .collect::<Vec<_>>(),
        })
        .fields(
            archimedea
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

fn create_archimedea_embed(archimedea: &Archimedea, r#type: &ArchimedeaType) -> CreateEmbed {
    return CreateEmbed::new()
        .title(match r#type {
            ArchimedeaType::Deep => "Deep Archimedea",
            ArchimedeaType::Temporal => "Temporal Archimedea",
        })
        .url(match r#type {
            ArchimedeaType::Deep => "https://warframe.fandom.com/wiki/Deep_Archimedea",
            ArchimedeaType::Temporal => "https://wiki.warframe.com/w/Temporal_Archimedea",
        })
        .color(Colors::EmbedColor.as_u32())
        .thumbnail(match r#type {
            ArchimedeaType::Deep => Thumbnail::DeepArchimedea.url(),
            ArchimedeaType::Temporal => Thumbnail::TemporalArchimedea.url(),
        })
        .fields(match r#type {
            ArchimedeaType::Deep => archimedea
                .missions
                .iter()
                .enumerate()
                .collect::<Vec<_>>()
                .into_iter()
                .rev()
                .map(|(i, mission)| {
                    let emojis = [":one:", ":two:", ":three:"];
                    let emoji = emojis.get(2 - i).unwrap_or(&":grey_question:");

                    (
                        format!("{} {}", emoji, mission.mission.to_string()),
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
            ArchimedeaType::Temporal => archimedea
                .missions
                .iter()
                .enumerate()
                .map(|(i, mission)| {
                    let emojis = [":one:", ":two:", ":three:"];
                    let emoji = emojis.get(i).unwrap_or(&":grey_question:");

                    (
                        format!("{} {}", emoji, mission.mission.to_string()),
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
        })
        .field(
            ":grey_exclamation: Personal modifiers",
            archimedea
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
    archimedea: &Archimedea,
    modifiers_button: &str,
    r#type: &ArchimedeaType,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_archimedea_embed(archimedea, r#type);

    let components: Vec<CreateActionRow> = vec![CreateActionRow::Buttons(vec![
        CreateButton::new(modifiers_button)
            .label("Modifiers")
            .style(ButtonStyle::Primary),
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
    archimedea: &Archimedea,
    archimedea_button: &str,
    r#type: &ArchimedeaType,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_modifiers_embed(archimedea, r#type);

    let components: Vec<CreateActionRow> = vec![CreateActionRow::Buttons(vec![
        CreateButton::new(archimedea_button)
            .label("Archimedea")
            .style(ButtonStyle::Primary),
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
