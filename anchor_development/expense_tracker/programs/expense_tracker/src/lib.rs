use anchor_lang::prelude::*;

declare_id!("7UeJ7A5uC2KfUit9g8SLWgyXAfqkTVTHh4ixBFHLEqUz");

#[program]
pub mod expense_tracker {
    use super::*;

    pub fn initialize_expense(
        ctx: Context<InitializeExpense>,
        id: u64,
        merchant_name: String,
        amount: u64,
    ) -> Result<()> {
        let expense_account = &mut ctx.accounts.expense_account;

        expense_account.id = id;
        expense_account.merchant_name = merchant_name;
        expense_account.amount = amount;
        expense_account.owner = *ctx.accounts.authority.key;

        Ok(())
    }

    pub fn modify_expense(
        ctx: Context<ModifyExpense>,
        _id: u64,
        merchant_name: String,
        amount: u64,
    ) -> Result<()> {
        let expense_account = &mut ctx.accounts.expense_account;
        expense_account.merchant_name = merchant_name;
        expense_account.amount = amount;

        Ok(())
    }

    pub fn delete_expense(_ctx: Context<DeleteExpense>, _id: u64) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct InitializeExpense<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = ExpenseAccount::INIT_SPACE,
        seeds = [b"expense", authority.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub expense_account: Account<'info, ExpenseAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct ModifyExpense<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"expense", authority.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub expense_account: Account<'info, ExpenseAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct DeleteExpense<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        close = authority,
        seeds = [b"expense", authority.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub expense_account: Account<'info, ExpenseAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct ExpenseAccount {
    pub id: u64,
    pub owner: Pubkey,
    pub merchant_name: String,
    pub amount: u64,
}

impl Space for ExpenseAccount {
    const INIT_SPACE: usize = 8 + 8 + 32 + (4 + 12) + 8 + 1;
}
