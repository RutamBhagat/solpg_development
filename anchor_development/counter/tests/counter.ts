import * as anchor from "@coral-xyz/anchor";

import { Counter } from "../target/types/counter";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const authority = provider.wallet.publicKey;

  let counterPDA: anchor.web3.PublicKey;

  before(async () => {
    [counterPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [authority.toBuffer()],
      program.programId
    );
  });

  it("Creates a counter", async () => {
    const tx = await program.methods
      .createCounter()
      .accounts({
        authority: authority,
      })
      .rpc();

    console.log("Your transaction signature", tx);

    // Fetch the created account
    const counterAccount = await program.account.counter.fetch(counterPDA);

    expect(counterAccount.authority.toString()).to.equal(authority.toString());
    expect(counterAccount.count.toNumber()).to.equal(0);
  });

  it("Updates the counter", async () => {
    const tx = await program.methods
      .updateCounter()
      .accounts({
        counter: counterPDA,
      })
      .rpc();

    console.log("Your transaction signature", tx);

    // Fetch the updated account
    const counterAccount = await program.account.counter.fetch(counterPDA);

    expect(counterAccount.count.toNumber()).to.equal(1);
  });

  it("Updates the counter multiple times", async () => {
    for (let i = 0; i < 5; i++) {
      await program.methods
        .updateCounter()
        .accounts({
          counter: counterPDA,
        })
        .rpc();
    }

    // Fetch the updated account
    const counterAccount = await program.account.counter.fetch(counterPDA);

    expect(counterAccount.count.toNumber()).to.equal(6); // 1 from previous test + 5 from this test
  });
});
