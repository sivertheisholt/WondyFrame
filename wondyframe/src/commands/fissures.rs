use log::{error, info};
use poise::CreateReply;
use serenity::all::{
    ComponentInteraction, ComponentInteractionCollector, ComponentInteractionDataKind,
    CreateActionRow, CreateEmbed, CreateEmbedFooter, CreateInteractionResponse,
    CreateInteractionResponseMessage, CreateSelectMenu, CreateSelectMenuKind,
    CreateSelectMenuOption,
};
use std::str::FromStr;

use crate::api::warframe_client;
use crate::enums::colors::Colors;
use crate::enums::difficulty::Difficulty;
use crate::enums::thumbnail::Thumbnail;
use crate::models::fissure::{Fissure, Tier};
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::{eta_from_utc, format_timestamp};

#[poise::command(
    slash_command,
    description_localized("en-US", "Get current Fissures details")
)]
pub async fn fissures(
    ctx: Context<'_>,
    #[description = "Mission difficulty"] difficulty: Difficulty,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Fissures command called");
    let is_public = public.unwrap_or(false);
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let fissures: Vec<Fissure> = match warframe_client.fetch::<Vec<Fissure>>("fissures").await {
        Ok(v) => v,
        Err(e) => {
            error!("Error fetching data from API: {:?}", e);
            return Err(
                "Could not fetch Fissures data at this time due to external failure.".into(),
            );
        }
    };

    let ctx_id: u64 = ctx.id();
    let relics_dropdown: String = format!("{}relics_dropdown", ctx_id);

    let mut fissure_types: Vec<Tier> = fissures
        .iter()
        .map(|f| f.tier.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    fissure_types.sort_by_key(|tier| tier.clone() as u8);

    let embed: CreateEmbed = create_fissures_embed(&fissures, &Tier::Lith, &difficulty);
    let components: Vec<CreateActionRow> =
        create_components(&fissure_types, &Tier::Lith, &relics_dropdown);

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
                    &fissures,
                    &selected_tier,
                    &fissure_types,
                    &relics_dropdown,
                    &difficulty,
                )
                .await?
            }
            _ => {}
        }
    }

    Ok(())
}

fn create_components(
    fissure_types: &Vec<Tier>,
    selected_tier: &Tier,
    relics_dropdown: &str,
) -> Vec<CreateActionRow> {
    let options: Vec<CreateSelectMenuOption> = fissure_types
        .iter()
        .map(|fissure_type| {
            let mut option =
                CreateSelectMenuOption::new(fissure_type.to_string(), fissure_type.to_string());
            if *fissure_type == *selected_tier {
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

fn create_fissures_embed(
    fissures: &Vec<Fissure>,
    tier: &Tier,
    difficulty: &Difficulty,
) -> CreateEmbed {
    let filtered_fissures: Vec<Fissure> = fissures
        .iter()
        .filter(|fissure| {
            fissure.tier == *tier
                && fissure.is_hard
                    == match difficulty {
                        Difficulty::Normal => false,
                        Difficulty::SP => true,
                    }
        })
        .cloned()
        .collect();

    return CreateEmbed::new()
        .title(format!("{} Fissures", tier))
        .url("https://warframe.fandom.com/wiki/Void_Fissure")
        .color(Colors::EmbedColor.as_u32())
        .thumbnail(Thumbnail::Fissure.url())
        .fields(
            filtered_fissures
                .iter()
                .map(|fissure| {
                    (
                        fissure.mission_type.to_string(),
                        format!(
                            "{} against {} \n **Expires** in  {}",
                            fissure.node,
                            fissure.enemy,
                            eta_from_utc(&fissure.expiry)
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
    fissures: &Vec<Fissure>,
    selected_tier: &Tier,
    fissure_types: &Vec<Tier>,
    relics_dropdown: &str,
    difficulty: &Difficulty,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_fissures_embed(fissures, selected_tier, difficulty);

    let components: Vec<CreateActionRow> =
        create_components(fissure_types, selected_tier, relics_dropdown);

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
