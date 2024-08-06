import * as anchor from "@coral-xyz/anchor";

import { Program } from "@coral-xyz/anchor";
import { TinyAdventure } from "../target/types/tiny_adventure";
import { expect } from "chai";

describe("tiny_adventure", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TinyAdventure as Program<TinyAdventure>;

  let gameDataPDA: anchor.web3.PublicKey;

  before(async () => {
    // Derive the PDA for the game data account
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("level1"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    gameDataPDA = pda;
  });

  it("Initializes the game", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Your transaction signature", tx);

    // Fetch the created account
    const gameData = await program.account.gameDataAccount.fetch(gameDataPDA);
    expect(gameData.playerPosition === 0);
  });

  it("Moves right", async () => {
    await program.methods
      .moveRight()
      .accounts({
        gameDataAccount: gameDataPDA,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(gameDataPDA);
    expect(gameData.playerPosition === 1);
  });

  it("Moves left", async () => {
    await program.methods
      .moveLeft()
      .accounts({
        gameDataAccount: gameDataPDA,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(gameDataPDA);
    expect(gameData.playerPosition === 0);
  });

  it("Cannot move left from the starting position", async () => {
    await program.methods
      .moveLeft()
      .accounts({
        gameDataAccount: gameDataPDA,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(gameDataPDA);
    expect(gameData.playerPosition === 0);
  });

  it("Reaches the end position", async () => {
    // Move right 3 times to reach the end
    for (let i = 0; i < 3; i++) {
      await program.methods
        .moveRight()
        .accounts({
          gameDataAccount: gameDataPDA,
        })
        .rpc();
    }

    const gameData = await program.account.gameDataAccount.fetch(gameDataPDA);
    expect(gameData.playerPosition === 3);
  });

  it("Cannot move right from the end position", async () => {
    await program.methods
      .moveRight()
      .accounts({
        gameDataAccount: gameDataPDA,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(gameDataPDA);
    expect(gameData.playerPosition === 3);
  });
});
