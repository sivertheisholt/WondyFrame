use crate::models::data::Data;
use crate::types::error::Error;

pub type Context<'a> = poise::Context<'a, Data, Error>;
