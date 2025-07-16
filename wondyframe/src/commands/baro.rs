use serenity::all::CreateEmbed;
use serenity::all::CreateEmbedFooter;

use crate::enums::thumbnail::Thumbnail;
use crate::types::context::Context;
use crate::types::error::Error;
use crate::utils::date::format_timestamp;

#[poise::command(slash_command)]
pub async fn baro(ctx: Context<'_>) -> Result<(), Error> {
    //let client: &warframe::worldstate::Client = &ctx.data().client;
    //let void_trader: VoidTrader = client.fetch::<VoidTrader>().await?;

    let embed: CreateEmbed = CreateEmbed::new()
        .title("Orb Vallis")
        .color(0x0099ff)
        .thumbnail(Thumbnail::Fortuna.url())
        .footer(CreateEmbedFooter::new(format!(
            "World state updated: {}",
            format_timestamp()
        )));

    let reply = poise::CreateReply::default().embed(embed);

    ctx.send(reply).await?;

    Ok(())
}
