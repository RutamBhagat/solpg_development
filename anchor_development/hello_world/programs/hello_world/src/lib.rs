use anchor_lang::prelude::*;

declare_id!("3kbrkHtYDZbEWXiyoWarWNWfc6o53n8qqjtoY1FuY4Xd");

#[program]
pub mod hello_world {
    use super::*;

    pub fn hello(_ctx: Context<Hello>) -> Result<()> {
        msg!("Hello, World");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}
