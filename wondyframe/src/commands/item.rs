use std::collections::HashMap;

use fuzzy_matcher::FuzzyMatcher;
use fuzzy_matcher::skim::SkimMatcherV2;
use log::info;
use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;

use crate::enums::colors::Colors;
use crate::enums::thumbnail::Thumbnail;
use crate::models::drop_data::relics::Relics;
use crate::services::drops_service::DropLocation;
use crate::services::drops_service::Drops;
use crate::types::context::Context;
use crate::types::error::Error;

#[poise::command(
    slash_command,
    description_localized("en-US", "Get current item details and drop locations")
)]
pub async fn item(
    ctx: Context<'_>,
    #[description = "Item name"] item_name: String,
    #[description = "Reply visible to other users?"] public: Option<bool>,
) -> Result<(), Error> {
    info!("Item command called");
    let is_public = public.unwrap_or(false);
    let warframe_drops: &Drops = &ctx.data().warframe_drops;
    let warframe_drop_locations: &HashMap<String, Vec<DropLocation>> =
        &warframe_drops.drop_locations;
    let warframe_relics: &Relics = &warframe_drops.relics;

    let item_locations =
        match get_item_locations(warframe_drop_locations, &item_name.to_lowercase()) {
            Ok(location) => location,
            Err(_) => {
                let reply = poise::CreateReply::default()
                    .content(format!("Could not find item: {}", item_name))
                    .ephemeral(!is_public);
                ctx.send(reply).await?;
                return Ok(());
            }
        };

    let embed: CreateEmbed;
    if item_locations.item_name.contains("prime") {
        let mut relics_with_drop_locations: Vec<RelicWithDropLocations> = Vec::new();

        for location in &item_locations.drop_locations {
            if let (Some(relic_name), Some(relic_tier), Some(relic_state)) = (
                &location.relic_name,
                &location.relic_tier,
                &location.relic_state,
            ) {
                if *relic_state != "Intact" {
                    continue;
                }

                if let Some(relic) = warframe_relics.relics.iter().find(|r| {
                    r.relic_name == *relic_name && r.tier == *relic_tier && r.state == *relic_state
                }) {
                    relics_with_drop_locations.push(RelicWithDropLocations {
                        relic_name: relic.relic_name.clone(),
                        relic_tier: relic.tier.clone(),
                        chance: location.chance.unwrap_or(0.0),
                        rarity: location.rarity.clone(),
                        drop_locations: get_relic_drop_locations(
                            &warframe_drop_locations,
                            &location
                                .relic_tier
                                .clone()
                                .unwrap_or("".to_string())
                                .to_lowercase(),
                            &location
                                .relic_name
                                .clone()
                                .unwrap_or("".to_string())
                                .to_lowercase(),
                        ),
                    });
                }
            }
        }
        embed = create_prime_embed(
            &ctx,
            &item_locations.drop_locations[0].item_name.to_string(),
            &relics_with_drop_locations,
        );
    } else {
        embed = create_non_prime_embed(
            &ctx,
            &item_locations.drop_locations[0].item_name.to_string(),
            item_locations,
        );
    }

    let reply = poise::CreateReply::default()
        .embed(embed)
        .ephemeral(!is_public);

    ctx.send(reply).await?;

    Ok(())
}

fn create_non_prime_embed(
    ctx: &Context<'_>,
    item_name: &str,
    item_locations: DropLocationsWithItemName,
) -> CreateEmbed {
    return CreateEmbed::new()
        .title(item_name)
        .color(Colors::EmbedColor.as_u32())
        .fields(
            item_locations
                .drop_locations
                .iter()
                .take(9)
                .map(|location| {
                    (
                        if location.location_type == "Mission" {
                            format!(
                                "{} - {}",
                                location.planet.clone().unwrap_or("Unknown".to_string()),
                                location.mission.clone().unwrap_or("Unknown".to_string())
                            )
                        } else if location.location_type == "Transient" {
                            format!(
                                "{}",
                                location
                                    .objective_name
                                    .clone()
                                    .unwrap_or("Unknown".to_string())
                            )
                        } else if location.location_type == "Sortie" {
                            format!(
                                "{}",
                                location
                                    .objective_name
                                    .clone()
                                    .unwrap_or("Unknown".to_string())
                            )
                        } else if location.location_type == "Enemy" {
                            format!(
                                "{}",
                                location.enemy_name.clone().unwrap_or("Unknown".to_string())
                            )
                        } else if location.location_type == "Bounty" {
                            format!(
                                "{} - {}",
                                location.planet.clone().unwrap_or("Unknown".to_string()),
                                location.mission.clone().unwrap_or("Unknown".to_string())
                            )
                        } else if location.location_type == "Syndicate" {
                            format!(
                                "{}",
                                location
                                    .objective_name
                                    .clone()
                                    .unwrap_or("Unknown".to_string())
                            )
                        } else {
                            "Unknown".to_string()
                        },
                        format!(
                            "Type: {}\nRotation: {}\nChance: {} %",
                            location.game_mode.clone().unwrap_or("Unknown".to_string()),
                            location.rotation.clone().unwrap_or("Any".to_string()),
                            (location.chance.clone().unwrap_or(0.0) * 100.0).round() / 100.0,
                        ),
                        true,
                    )
                })
                .collect::<Vec<(String, String, bool)>>(),
        )
        .thumbnail(Thumbnail::Warframe.url_with_item(item_name))
        .footer(CreateEmbedFooter::new(format!(
            "Drop tables updated: {}",
            ctx.data().warframe_drops_modified_last
        )));
}

#[derive(Debug)]
pub struct RelicWithDropLocations {
    pub relic_name: String,
    pub relic_tier: String,
    pub chance: f32,
    pub rarity: String,
    pub drop_locations: Vec<DropLocation>,
}
fn create_prime_embed(
    ctx: &Context<'_>,
    item_name: &str,
    relics: &Vec<RelicWithDropLocations>,
) -> CreateEmbed {
    let relics_to_show: Vec<&RelicWithDropLocations> = {
        let with_locations: Vec<_> = relics
            .iter()
            .filter(|r| !r.drop_locations.is_empty())
            .collect();
        if !with_locations.is_empty() {
            with_locations
        } else {
            relics.iter().collect()
        }
    };

    let mut embed = CreateEmbed::new()
        .footer(CreateEmbedFooter::new(format!(
            "Drop tables updated: {}",
            ctx.data().warframe_drops_modified_last
        )))
        .title(item_name)
        .fields(
            relics_to_show
                .iter()
                .map(|relic| {
                    (
                        format!("{} {}", relic.relic_tier, relic.relic_name),
                        format!(
                            "Rarity: {}\nChance: {} %\nVaulted: {}",
                            relic.rarity,
                            relic.chance,
                            relic.drop_locations.len() == 0
                        ),
                        true,
                    )
                })
                .collect::<Vec<(String, String, bool)>>(),
        )
        .thumbnail(Thumbnail::Item.url_with_item(item_name));

    for relic in relics {
        // Add the relic field
        if relic.drop_locations.len() > 0 {
            embed = embed.field(
                "",
                format!(
                    "**Top 6 drop locations for {} {}:**",
                    relic.relic_tier, relic.relic_name
                ),
                false,
            );
        }

        // Add up to 6 drop location fields for this relic
        let mut locations = relic.drop_locations.clone();
        locations.sort_by(|a, b| {
            b.chance
                .partial_cmp(&a.chance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        for location in locations.into_iter().take(6) {
            embed = embed.field(
                format!(
                    "{} - {}",
                    location.planet.clone().unwrap_or("Unknown".to_string()),
                    location.mission.clone().unwrap_or("Unknown".to_string())
                ),
                format!(
                    "Type: {}\nRotation: {}\nChance: {}%",
                    location.game_mode.clone().unwrap_or("Unknown".to_string()),
                    location.rotation.clone().unwrap_or("Any".to_string()),
                    (location.chance.clone().unwrap_or(0.0) * 100.0).round() / 100.0
                ),
                true,
            );
        }
    }

    embed = embed.color(Colors::EmbedColor.as_u32());
    embed
}

fn get_relic_drop_locations(
    item_locations: &HashMap<String, Vec<DropLocation>>,
    relic_tier: &str,
    relic_name: &str,
) -> Vec<DropLocation> {
    if let Some(locations) = item_locations.get(&format!("{} {} relic", relic_tier, relic_name)) {
        let mut sorted_locations = locations.clone();
        sorted_locations.sort_by(|a, b| {
            b.chance
                .partial_cmp(&a.chance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        return sorted_locations;
    } else {
        return vec![];
    }
}

pub struct DropLocationsWithItemName {
    pub item_name: String,
    pub drop_locations: Vec<DropLocation>,
}

fn get_item_locations(
    item_locations: &HashMap<String, Vec<DropLocation>>,
    item_name: &str,
) -> Result<DropLocationsWithItemName, ()> {
    let matcher = SkimMatcherV2::default();

    // Find the best match using fuzzy-matcher
    let (best_item, best_score): (&String, i64) = item_locations
        .iter()
        .filter_map(|(k, _)| {
            matcher
                .fuzzy_match(&k.to_lowercase(), &item_name.to_lowercase())
                .map(|score| (k, score))
        })
        .max_by_key(|(_, score)| *score)
        .unwrap();

    // You can adjust this threshold as needed
    if best_score < 30 {
        return Err(());
    }

    if let Some(locations) = item_locations.get(best_item) {
        let mut sorted_locations = locations.clone();
        sorted_locations.sort_by(|a, b| {
            b.chance
                .partial_cmp(&a.chance)
                .unwrap_or(std::cmp::Ordering::Equal)
                .then_with(|| a.rarity.cmp(&b.rarity))
        });

        return Ok(DropLocationsWithItemName {
            item_name: best_item.to_string(),
            drop_locations: sorted_locations,
        });
    } else {
        return Err(());
    }
}
