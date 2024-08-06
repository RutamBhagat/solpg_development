import * as anchor from "@coral-xyz/anchor";

import { ExpenseTracker } from "../target/types/expense_tracker";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("expense_tracker", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ExpenseTracker as Program<ExpenseTracker>;

  const expense1 = {
    id: 1,
    amount: 100,
    merchantName: "Merchant 1",
  };

  const expense2 = {
    id: 1,
    amount: 200,
    merchantName: "Merchant 2",
  };

  let expenseAccount: anchor.web3.PublicKey;

  before(async () => {
    [expenseAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("expense"),
        provider.wallet.publicKey.toBuffer(),
        new anchor.BN(expense1.id).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
  });

  it("Initializes an expense", async () => {
    await program.methods
      .initializeExpense(
        new anchor.BN(expense1.id),
        expense1.merchantName,
        new anchor.BN(expense1.amount)
      )
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.expenseAccount.fetch(expenseAccount);
    expect(account.id.toNumber() === expense1.id);
    expect(account.merchantName === expense1.merchantName);
    expect(account.amount.toNumber() === expense1.amount);
    expect(account.owner.toString() === provider.wallet.publicKey.toString());
  });

  it("Modifies an existing expense", async () => {
    await program.methods
      .modifyExpense(
        new anchor.BN(expense2.id),
        expense2.merchantName,
        new anchor.BN(expense2.amount)
      )
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.expenseAccount.fetch(expenseAccount);
    expect(account.id.toNumber() === expense2.id);
    expect(account.merchantName === expense2.merchantName);
    expect(account.amount.toNumber() === expense2.amount);
  });

  it("Deletes an expense", async () => {
    await program.methods
      .deleteExpense(new anchor.BN(expense2.id))
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .rpc();

    try {
      await program.account.expenseAccount.fetch(expenseAccount);
      expect.fail("The account should have been deleted");
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error.message).to.include("Account does not exist");
    }
  });
});
