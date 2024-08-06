use anchor_lang::prelude::*;

declare_id!("CTr8vsYTN24cNSUmSzLPrkXzP8xUDnsYaf3tQQBd6RCz");

#[program]
pub mod tiny_adventure {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game_data_account = &mut ctx.accounts.new_game_data_account;
        game_data_account.player_position = 0;
        print_player(game_data_account.player_position);
        Ok(())
    }

    pub fn move_left(ctx: Context<Move>) -> Result<()> {
        let game_data_account = &mut ctx.accounts.game_data_account;
        if game_data_account.player_position == 0 {
            msg!("You are back at the start.");
        } else {
            game_data_account.player_position -= 1;
            print_player(game_data_account.player_position);
        }
        Ok(())
    }

    pub fn move_right(ctx: Context<Move>) -> Result<()> {
        let game_data_account = &mut ctx.accounts.game_data_account;
        if game_data_account.player_position == 3 {
            print_player(game_data_account.player_position);
        } else {
            game_data_account.player_position = game_data_account.player_position + 1;
            print_player(game_data_account.player_position);
        }
        Ok(())
    }
}

fn print_player(player_position: u8) {
    if player_position == 0 {
        msg!("A Journey Begins!");
        msg!("o.......");
    } else if player_position == 1 {
        msg!("..o.....");
    } else if player_position == 2 {
        msg!("....o...");
    } else if player_position == 3 {
        msg!("........\\o/");
        msg!("You have reached the end! Congratulations!");
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 1 byte come from NewAccount.data being type u8.
    // (u8 = 8 bits unsigned integer = 1 byte)
    // You can also use the signer as seed [signer.key().as_ref()],
    #[account(
        init_if_needed,
        seeds = [b"level1", signer.key().as_ref()],
        bump,
        payer = signer,
        space = 8 + 1
    )]
    pub new_game_data_account: Account<'info, GameDataAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Move<'info> {
    #[account(mut)]
    pub game_data_account: Account<'info, GameDataAccount>,
}

#[account]
pub struct GameDataAccount {
    player_position: u8,
}
