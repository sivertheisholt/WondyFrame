use std::collections::HashMap;

use crate::{api::warframe_drops_client::WarframeDropsClient, models::drop_data::relics::Relics};

pub struct Drops {
    pub drop_locations: HashMap<String, Vec<DropLocation>>,
    pub relics: Relics,
}

#[derive(Debug, Clone)]
pub struct DropLocation {
    pub relic_tier: Option<String>,
    pub relic_name: Option<String>,
    pub relic_state: Option<String>,
    pub enemy_name: Option<String>,
    pub objective_name: Option<String>,
    pub planet: Option<String>,
    pub mission: Option<String>,
    pub rarity: String,
    pub chance: Option<f32>,
    pub rotation: Option<String>,
    pub game_mode: Option<String>,
    pub location_type: String,
    pub item_name: String,
}

pub async fn initialize_drops(warframe_drops_client: &WarframeDropsClient) -> Drops {
    let mission_rewards = warframe_drops_client.fetch_mission_rewards().await.unwrap();
    let transient_rewards = warframe_drops_client
        .fetch_transient_rewards()
        .await
        .unwrap();
    let sortie_rewards = warframe_drops_client.sortie_rewards().await.unwrap();
    let mod_locations = warframe_drops_client.fetch_mod_locations().await.unwrap();
    let enemy_mod_tables = warframe_drops_client
        .fetch_enemy_mod_tables()
        .await
        .unwrap();
    let enemy_blueprint_tables = warframe_drops_client
        .fetch_enemy_blueprint_tables()
        .await
        .unwrap();
    let blueprint_locations = warframe_drops_client
        .fetch_blueprint_locations()
        .await
        .unwrap();
    let cetus_bounty_rewards = warframe_drops_client
        .fetch_cetus_bounty_rewards()
        .await
        .unwrap();
    let zariman_rewards = warframe_drops_client.fetch_zariman_rewards().await.unwrap();
    let misc_items = warframe_drops_client.fetch_misc_items().await.unwrap();
    let relics = warframe_drops_client.fetch_relics().await.unwrap();
    let syndicates = warframe_drops_client.fetch_syndicates().await.unwrap();

    let mut item_locations: HashMap<String, Vec<DropLocation>> = HashMap::new();

    for (planet, missions) in &mission_rewards.mission_rewards {
        for (mission_name, mission) in missions {
            for (rotation, rewards) in &mission.rewards {
                for reward in rewards {
                    item_locations
                        .entry(reward.item_name.to_string().to_lowercase())
                        .or_default()
                        .push(DropLocation {
                            relic_tier: None,
                            relic_name: None,
                            relic_state: None,
                            enemy_name: None,
                            objective_name: None,
                            planet: Some(planet.to_string()),
                            mission: Some(mission_name.to_string()),
                            rarity: reward.rarity.to_string(),
                            chance: Some(reward.chance),
                            rotation: Some(rotation.to_string()),
                            game_mode: Some(mission.game_mode.to_string()),
                            location_type: "Mission".to_string(),
                            item_name: reward.item_name.to_string(),
                        });
                }
            }
        }
    }

    for objective in &transient_rewards.transient_rewards {
        for reward in &objective.rewards {
            item_locations
                .entry(reward.item_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: None,
                    objective_name: Some(objective.objective_name.to_string()),
                    planet: None,
                    mission: None,
                    rarity: reward.rarity.to_string(),
                    chance: Some(reward.chance),
                    rotation: reward.rotation.clone(),
                    game_mode: Some(objective.objective_name.to_lowercase()),
                    location_type: "Transient".to_string(),
                    item_name: reward.item_name.to_string(),
                });
        }
    }

    for sortie_reward in &sortie_rewards.sortie_rewards {
        item_locations
            .entry(sortie_reward.item_name.to_string().to_lowercase())
            .or_default()
            .push(DropLocation {
                relic_tier: None,
                relic_name: None,
                relic_state: None,
                enemy_name: None,
                objective_name: Some("Sortie".to_string()),
                planet: None,
                mission: None,
                rarity: sortie_reward.rarity.clone(),
                chance: Some(sortie_reward.chance),
                rotation: None,
                game_mode: Some("Sortie".to_string()),
                location_type: "Sortie".to_string(),
                item_name: sortie_reward.item_name.to_string(),
            });
    }

    for mod_location in &mod_locations.mod_locations {
        for enemy in &mod_location.enemies {
            item_locations
                .entry(mod_location.mod_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: Some(enemy.enemy_name.clone()),
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: enemy.rarity.clone(),
                    chance: enemy.chance.clone(),
                    rotation: None,
                    game_mode: Some("Enemy".to_string()),
                    location_type: "Enemy".to_string(),
                    item_name: mod_location.mod_name.to_string(),
                });
        }
    }

    for enemy_mod_table in &enemy_mod_tables.enemy_mod_tables {
        for r#mod in &enemy_mod_table.mods {
            item_locations
                .entry(r#mod.mod_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: Some(enemy_mod_table.enemy_name.clone()),
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: r#mod.rarity.to_string(),
                    chance: r#mod.chance.clone(),
                    rotation: None,
                    game_mode: Some("Enemy".to_string()),
                    location_type: "Enemy".to_string(),
                    item_name: r#mod.mod_name.to_string(),
                });
        }
    }

    for enemy_blueprint_table in &enemy_blueprint_tables.enemy_blueprint_tables {
        for item in &enemy_blueprint_table.items {
            item_locations
                .entry(item.item_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: Some(enemy_blueprint_table.enemy_name.clone()),
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: item.rarity.clone(),
                    chance: item.chance.clone(),
                    rotation: None,
                    game_mode: Some("Enemy".to_string()),
                    location_type: "Enemy".to_string(),
                    item_name: item.item_name.to_string(),
                });
        }
        for r#mod in &enemy_blueprint_table.mods {
            item_locations
                .entry(r#mod.mod_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: Some(enemy_blueprint_table.enemy_name.clone()),
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: r#mod.rarity.clone(),
                    chance: r#mod.chance.clone(),
                    rotation: None,
                    game_mode: Some("Enemy".to_string()),
                    location_type: "Enemy".to_string(),
                    item_name: r#mod.mod_name.to_string(),
                });
        }
    }

    for blueprint_location in &blueprint_locations.blueprint_locations {
        for enemy in &blueprint_location.enemies {
            item_locations
                .entry(blueprint_location.blueprint_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: Some(enemy.enemy_name.clone()),
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: enemy.rarity.clone(),
                    chance: enemy.chance.clone(),
                    rotation: None,
                    game_mode: Some("Enemy".to_string()),
                    location_type: "Enemy".to_string(),
                    item_name: blueprint_location.blueprint_name.to_string(),
                });
        }
    }

    for cetus_bounty_reward in &cetus_bounty_rewards.cetus_bounty_rewards {
        for (rotation, rewards) in &cetus_bounty_reward.rewards {
            for reward in rewards {
                item_locations
                    .entry(reward.item_name.to_string().to_lowercase())
                    .or_default()
                    .push(DropLocation {
                        relic_tier: None,
                        relic_name: None,
                        relic_state: None,
                        enemy_name: None,
                        objective_name: None,
                        planet: Some("Cetus".to_string()),
                        mission: Some(cetus_bounty_reward.bounty_level.clone()),
                        rarity: reward.rarity.clone(),
                        chance: reward.chance.clone(),
                        rotation: Some(rotation.clone()),
                        game_mode: Some("Bounty".to_string()),
                        location_type: "Bounty".to_string(),
                        item_name: reward.item_name.to_string(),
                    });
            }
        }
    }

    for zariman_reward in &zariman_rewards.zariman_rewards {
        for (rotation, rewards) in &zariman_reward.rewards {
            for reward in rewards {
                item_locations
                    .entry(reward.item_name.to_string().to_lowercase())
                    .or_default()
                    .push(DropLocation {
                        relic_tier: None,
                        relic_name: None,
                        relic_state: None,
                        enemy_name: None,
                        objective_name: None,
                        planet: Some("Zariman".to_string()),
                        mission: Some(zariman_reward.bounty_level.clone()),
                        rarity: reward.rarity.clone(),
                        chance: reward.chance.clone(),
                        rotation: Some(rotation.clone()),
                        game_mode: Some("Bounty".to_string()),
                        location_type: "Bounty".to_string(),
                        item_name: reward.item_name.to_string(),
                    });
            }
        }
    }

    for misc_item in &misc_items.misc_items {
        for item in &misc_item.items {
            item_locations
                .entry(item.item_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: Some(misc_item.enemy_name.clone()),
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: item.rarity.clone(),
                    chance: item.chance.clone(),
                    rotation: None,
                    game_mode: Some("Enemy".to_string()),
                    location_type: "Enemy".to_string(),
                    item_name: item.item_name.to_string(),
                });
        }
    }

    for relic in &relics.relics {
        for reward in &relic.rewards {
            item_locations
                .entry(reward.item_name.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: Some(relic.tier.clone()),
                    relic_name: Some(relic.relic_name.clone()),
                    relic_state: Some(relic.state.clone()),
                    enemy_name: None,
                    objective_name: None,
                    planet: None,
                    mission: None,
                    rarity: reward.rarity.clone(),
                    chance: Some(reward.chance),
                    rotation: None,
                    game_mode: Some("Relic".to_string()),
                    location_type: "Relic".to_string(),
                    item_name: reward.item_name.to_string(),
                });
        }
    }

    for (syndicate_name, syndicate_rewards) in &syndicates.syndicates {
        for reward in syndicate_rewards {
            item_locations
                .entry(reward.item.to_string().to_lowercase())
                .or_default()
                .push(DropLocation {
                    relic_tier: None,
                    relic_name: None,
                    relic_state: None,
                    enemy_name: None,
                    objective_name: Some(syndicate_name.to_string()),
                    planet: None,
                    mission: None,
                    rarity: reward.rarity.clone(),
                    chance: Some(reward.chance),
                    rotation: Some("Shop".to_string()),
                    game_mode: Some("Syndicate".to_string()),
                    location_type: "Syndicate".to_string(),
                    item_name: reward.item.to_string(),
                });
        }
    }

    return Drops {
        drop_locations: item_locations,
        relics: relics,
    };
}
