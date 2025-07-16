use poise::CreateReply;
use serenity::all::{
    ComponentInteraction, ComponentInteractionCollector, ComponentInteractionDataKind,
    CreateActionRow, CreateEmbed, CreateEmbedFooter, CreateInteractionResponse,
    CreateInteractionResponseMessage, CreateSelectMenu, CreateSelectMenuKind,
    CreateSelectMenuOption,
};
use std::str::FromStr;

use crate::api::warframe_client;
use crate::enums::thumbnail::Thumbnail;
use crate::models::fissure::{Fissure, Tier};
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn fissures(ctx: Context<'_>) -> Result<(), Error> {
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let fissures: Result<Vec<Fissure>, reqwest::Error> =
        warframe_client.fetch::<Vec<Fissure>>("fissures").await;
    if fissures.is_err() {
        println!("Error fetching fissures: {:?}", fissures.err());
        return Ok(());
    }

    let fissures = fissures.unwrap();

    let ctx_id: u64 = ctx.id();
    let relics_dropdown: String = format!("{}relics_dropdown", ctx_id);

    let mut fissure_types: Vec<Tier> = fissures
        .iter()
        .map(|f| f.tier.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    fissure_types.sort_by_key(|tier| tier.clone() as u8);

    let embed: CreateEmbed = create_fissure_embed(fissures.clone(), Tier::Lith).await;
    let components: Vec<CreateActionRow> =
        create_components(fissure_types.clone(), Tier::Lith, relics_dropdown.clone()).await;

    let reply: CreateReply = CreateReply::default().components(components).embed(embed);

    ctx.send(reply).await?;

    while let Some(press) = ComponentInteractionCollector::new(ctx)
        .filter(move |press: &ComponentInteraction| {
            press.data.custom_id.starts_with(&ctx_id.to_string())
        })
        .timeout(std::time::Duration::from_secs(3600 * 24))
        .await
    {
        let selected_tier = match &press.data.kind {
            ComponentInteractionDataKind::StringSelect { values } => {
                let tier_str = values[0].clone();
                Tier::from_str(&tier_str).unwrap()
            }
            _ => panic!("unexpected interaction data kind"),
        };

        match &press.data.custom_id {
            x if x == &relics_dropdown => {
                handle_dropdown_interaction(
                    ctx,
                    press,
                    fissures.clone(),
                    selected_tier.clone(),
                    fissure_types.clone(),
                    relics_dropdown.clone(),
                )
                .await?
            }
            _ => {}
        }
    }

    Ok(())
}

async fn create_components(
    fissure_types: Vec<Tier>,
    selected_tier: Tier,
    relics_dropdown: String,
) -> Vec<CreateActionRow> {
    let options: Vec<CreateSelectMenuOption> = fissure_types
        .iter()
        .map(|fissure_type| {
            let mut option =
                CreateSelectMenuOption::new(fissure_type.to_string(), fissure_type.to_string());
            if *fissure_type == selected_tier {
                option = option.default_selection(true);
            }
            option
        })
        .collect();
    let select_menu = CreateSelectMenu::new(
        relics_dropdown,
        CreateSelectMenuKind::String { options: options },
    );
    return vec![CreateActionRow::SelectMenu(select_menu)];
}

async fn create_fissure_embed(fissures: Vec<Fissure>, tier: Tier) -> CreateEmbed {
    let filtered_fissures: Vec<Fissure> = fissures
        .iter()
        .filter(|fissure| fissure.tier == tier)
        .cloned()
        .collect();

    return CreateEmbed::new()
        .title("Fissurs")
        .color(0x0099ff)
        .thumbnail(Thumbnail::Fissure.url())
        .fields(
            filtered_fissures
                .iter()
                .map(|fissure| {
                    (
                        fissure.mission_type.to_string(),
                        format!(
                            "{} against {} \n **Expires** in  {}",
                            fissure.node, fissure.enemy, fissure.eta
                        ),
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

async fn handle_dropdown_interaction(
    ctx: Context<'_>,
    interaction: ComponentInteraction,
    fissures: Vec<Fissure>,
    selected_tier: Tier,
    fissure_types: Vec<Tier>,
    relics_dropdown: String,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_fissure_embed(fissures.clone(), selected_tier.clone()).await;

    let components: Vec<CreateActionRow> =
        create_components(fissure_types, selected_tier, relics_dropdown).await;

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
