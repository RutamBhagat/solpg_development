import * as anchor from "@coral-xyz/anchor";

import { HelloWorld } from "../target/types/hello_world";
import { Program } from "@coral-xyz/anchor";

describe("hello_world", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.HelloWorld as Program<HelloWorld>;

  // console log the program's id
  console.log("Program ID: ", program.programId.toString());

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.hello().rpc();
    console.log("Your transaction signature", tx);
  });
});
