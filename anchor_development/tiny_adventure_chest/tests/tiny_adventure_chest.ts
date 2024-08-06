import * as anchor from "@coral-xyz/anchor";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { Program } from "@coral-xyz/anchor";
import { TinyAdventureTwo } from "../target/types/tiny_adventure_two";
import { expect } from "chai";

describe("tiny_adventure_two", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .TinyAdventureTwo as Program<TinyAdventureTwo>;
  const player = provider.wallet;

  let gameDataAccount: PublicKey;
  let chestVault: PublicKey;

  before(async () => {
    [gameDataAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("level1")],
      program.programId
    );

    [chestVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("chestVault")],
      program.programId
    );
  });

  it("Initializes level one", async () => {
    const tx = await program.methods
      .initializeLevelOne()
      .accounts({
        signer: player.publicKey,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(
      gameDataAccount
    );
    expect(gameData.playerPosition === 0);
  });

  it("Resets level and spawns chest", async () => {
    const initialBalance = await provider.connection.getBalance(chestVault);

    await program.methods
      .resetLevelAndSpawnChest()
      .accounts({
        payer: player.publicKey,
        gameDataAccount: gameDataAccount,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(
      gameDataAccount
    );
    expect(gameData.playerPosition === 0);

    const newBalance = await provider.connection.getBalance(chestVault);
    expect(newBalance === initialBalance + LAMPORTS_PER_SOL / 10);
  });

  it("Moves right (positions 0 to 2)", async () => {
    for (let i = 0; i < 2; i++) {
      await program.methods
        .moveRight("dummy")
        .accounts({
          gameDataAccount: gameDataAccount,
          player: player.publicKey,
        })
        .rpc();

      const gameData = await program.account.gameDataAccount.fetch(
        gameDataAccount
      );
      expect(gameData.playerPosition === i + 1);
    }
  });

  it("Fails to move right with wrong password", async () => {
    try {
      await program.methods
        .moveRight("wrong")
        .accounts({
          gameDataAccount: gameDataAccount,
          player: player.publicKey,
        })
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.error.errorMessage === "Password was wrong");
    }
  });

  it("Moves right with correct password and collects reward", async () => {
    const initialPlayerBalance = await provider.connection.getBalance(
      player.publicKey
    );
    const initialChestBalance = await provider.connection.getBalance(
      chestVault
    );

    await program.methods
      .moveRight("gib")
      .accounts({
        gameDataAccount: gameDataAccount,
        player: player.publicKey,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(
      gameDataAccount
    );
    expect(gameData.playerPosition === 3);

    const newPlayerBalance = await provider.connection.getBalance(
      player.publicKey
    );
    const newChestBalance = await provider.connection.getBalance(chestVault);

    expect(newPlayerBalance).to.be.above(initialPlayerBalance);
    expect(newChestBalance === initialChestBalance - LAMPORTS_PER_SOL / 10);
  });

  it("Cannot move right after reaching the end", async () => {
    const tx = await program.methods
      .moveRight("dummy")
      .accounts({
        gameDataAccount: gameDataAccount,
        player: player.publicKey,
      })
      .rpc();

    const gameData = await program.account.gameDataAccount.fetch(
      gameDataAccount
    );
    expect(gameData.playerPosition === 3);
  });
});
