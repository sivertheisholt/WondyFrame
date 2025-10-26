use log::{error, info};
use poise::CreateReply;
use serenity::all::ActionRowComponent;
use serenity::all::ButtonKind;
use serenity::all::ComponentInteraction;
use serenity::all::ComponentInteractionCollector;
use serenity::all::ComponentInteractionDataKind;
use serenity::all::CreateActionRow;
use serenity::all::CreateButton;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;
use serenity::all::CreateInteractionResponse;
use serenity::all::CreateInteractionResponseMessage;
use serenity::all::CreateSelectMenu;
use serenity::all::CreateSelectMenuKind;
use serenity::all::CreateSelectMenuOption;

use crate::api::warframe_client;
use crate::enums::colors::Colors;
use crate::enums::emojis::Emojis;
use crate::enums::thumbnail::Thumbnail;
use crate::models::void_trader::VoidTrader;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::eta_from_utc;
use crate::utils::date::format_timestamp;

const MAX_PAGE_SIZE: i32 = 15;

#[poise::command(
    slash_command,
    description_localized("en-US", "Get current Void Trader inventory")
)]
pub async fn baro(
    ctx: Context<'_>,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Baro command called");
    let is_public = public.unwrap_or(false);
    let warframe_client: &warframe_client::WarframeClient = &ctx.data().warframe_client;
    let void_traders: Vec<VoidTrader> = match warframe_client
        .fetch::<Vec<VoidTrader>>("voidTraders")
        .await
    {
        Ok(v) => v,
        Err(e) => {
            error!("Error fetching data from API: {:?}", e);
            return Err("Could not fetch Baro data at this time due to external failure.".into());
        }
    };

    let page: i32 = 1;
    let ctx_id: u64 = ctx.id();
    let void_traders_dropdown: String = format!("{}void_traders_dropdown", ctx_id);
    let void_trader_next_page: String = format!("{}void_trader_next_page", ctx_id);
    let void_trader_page: String = format!("{}void_trader_page", ctx_id);
    let void_trader_previous_page: String = format!("{}void_trader_previous_page", ctx_id);

    let embed: CreateEmbed = create_baro_embed(&void_traders[0], page);
    let components: Vec<CreateActionRow> = create_components(
        &void_traders[0].ps_id,
        &void_traders,
        &void_traders_dropdown,
        &void_trader_next_page,
        &void_trader_previous_page,
        &void_trader_page,
        page,
    );

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
        let mut current_page = press
            .message
            .components
            .iter()
            .flat_map(|row| &row.components)
            .find_map(|component| match component {
                ActionRowComponent::Button(button) => {
                    if let ButtonKind::NonLink { custom_id, .. } = &button.data {
                        if custom_id == &void_trader_page {
                            return button
                                .label
                                .as_ref()
                                .and_then(|label| label.parse::<i32>().ok());
                        }
                    }
                    None
                }
                _ => None,
            })
            .unwrap_or(1);

        let selected_void_trader = match &press.data.kind {
            ComponentInteractionDataKind::StringSelect { values } => {
                let void_trader_str = values[0].clone();
                void_trader_str
            }
            _ => press
                .message
                .components
                .iter()
                .flat_map(|row| &row.components)
                .find_map(|component| {
                    if let ActionRowComponent::SelectMenu(select_menu) = component {
                        select_menu.options.iter().find_map(|option| {
                            if option.default {
                                Some(option.value.clone())
                            } else {
                                None
                            }
                        })
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| String::new()),
        };

        match &press.data.custom_id {
            x if x == &void_traders_dropdown => {
                current_page = 1;
                handle_dropdown_interaction(
                    ctx,
                    press,
                    &void_traders,
                    &selected_void_trader,
                    &void_traders_dropdown,
                    &void_trader_next_page,
                    &void_trader_previous_page,
                    &void_trader_page,
                    current_page,
                )
                .await?
            }
            x if x == &void_trader_next_page => {
                current_page += 1;
                handle_dropdown_interaction(
                    ctx,
                    press,
                    &void_traders,
                    &selected_void_trader,
                    &void_traders_dropdown,
                    &void_trader_next_page,
                    &void_trader_previous_page,
                    &void_trader_page,
                    current_page,
                )
                .await?
            }
            x if x == &void_trader_previous_page => {
                current_page -= 1;
                handle_dropdown_interaction(
                    ctx,
                    press,
                    &void_traders,
                    &selected_void_trader,
                    &void_traders_dropdown,
                    &void_trader_next_page,
                    &void_trader_previous_page,
                    &void_trader_page,
                    current_page,
                )
                .await?
            }
            _ => {}
        }
    }

    Ok(())
}

fn create_components(
    selected_void_trader: &str,
    void_traders: &Vec<VoidTrader>,
    void_traders_dropdown: &str,
    void_trader_next_page: &str,
    void_trader_previous_page: &str,
    void_trader_page: &str,
    page: i32,
) -> Vec<CreateActionRow> {
    let options: Vec<CreateSelectMenuOption> = void_traders
        .iter()
        .map(|void_trader| {
            let mut option = CreateSelectMenuOption::new(
                format!("{} - {}", void_trader.character, void_trader.location),
                void_trader.ps_id.to_string(),
            );
            if *void_trader.ps_id == *selected_void_trader {
                option = option.default_selection(true);
            }
            option
        })
        .collect();
    let select_menu = CreateSelectMenu::new(
        void_traders_dropdown.to_string(),
        CreateSelectMenuKind::String { options: options },
    );

    let next_page = CreateButton::new(&void_trader_next_page.to_string())
        .label("Next")
        .style(poise::serenity_prelude::ButtonStyle::Primary)
        .disabled({
            let count = void_traders
                .iter()
                .find(|v| v.ps_id == selected_void_trader)
                .map(|v| v.inventory.len())
                .unwrap_or(0) as i32;
            page * MAX_PAGE_SIZE >= count
        });
    let page_button = CreateButton::new(&void_trader_page.to_string())
        .label(page.to_string())
        .style(poise::serenity_prelude::ButtonStyle::Secondary)
        .disabled(true);
    let previous_page = CreateButton::new(&void_trader_previous_page.to_string())
        .label("Previous")
        .style(poise::serenity_prelude::ButtonStyle::Primary)
        .disabled(page == 1);

    return vec![
        CreateActionRow::SelectMenu(select_menu),
        CreateActionRow::Buttons(vec![previous_page, page_button, next_page]),
    ];
}

fn create_baro_embed(void_trader: &VoidTrader, page: i32) -> CreateEmbed {
    return CreateEmbed::new()
        .title(void_trader.character.to_string())
        .url("https://warframe.fandom.com/wiki/Void_Trader")
        .color(Colors::EmbedColor.as_u32())
        .thumbnail(Thumbnail::VoidTrader.url())
        .field("Location", &void_trader.location.to_string(), true)
        .field(
            "Arrives",
            eta_from_utc(&void_trader.activation).replace("expired", "Active"),
            true,
        )
        .field("Expires", eta_from_utc(&void_trader.expiry), true)
        .fields(
            // I need to add pagination here?
            void_trader
                .inventory
                .iter()
                .skip(((page - 1) * MAX_PAGE_SIZE) as usize)
                .take(MAX_PAGE_SIZE as usize)
                .map(|item| {
                    (
                        item.item.to_string(),
                        format!(
                            "{} {}\n{} {}",
                            Emojis::OrokinDucats.full_definition(),
                            item.ducats,
                            Emojis::Credits.full_definition(),
                            item.credits,
                        ),
                        true,
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
    void_traders: &Vec<VoidTrader>,
    selected_void_trader: &str,
    void_traders_dropdown: &str,
    void_trader_next_page: &str,
    void_trader_previous_page: &str,
    void_trader_page: &str,
    page: i32,
) -> Result<(), Error> {
    let embed: CreateEmbed = create_baro_embed(
        &void_traders
            .iter()
            .find(|v| v.ps_id == selected_void_trader)
            .unwrap(),
        page,
    );

    let components: Vec<CreateActionRow> = create_components(
        selected_void_trader,
        void_traders,
        void_traders_dropdown,
        &void_trader_next_page,
        &void_trader_previous_page,
        &void_trader_page,
        page,
    );

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
