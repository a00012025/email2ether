import { bufferToHex, ecrecover, pubToAddress } from "ethereumjs-util";
import { hexToBytes, keccak256, stringToBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
require("dotenv").config();

privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  .signMessage({
    message: {
      raw: "0xa299977ccc66d51b8483ea6345007f62e1ab9de9b3b74d2e4fe7f4cee08709ff",
    },
  })
  .then((signature) => {
    console.log("signature", signature);

    const msgToHash = Uint8Array.from([
      ...stringToBytes("\x19Ethereum Signed Message:\n32"),
      ...hexToBytes(
        "0xa299977ccc66d51b8483ea6345007f62e1ab9de9b3b74d2e4fe7f4cee08709ff"
      ),
    ]);
    const finalHash = keccak256(msgToHash);
    console.log("finalHash", finalHash);

    const msgHash = Buffer.from(finalHash.substring(2), "hex");
    const r = Buffer.from(signature.slice(2, 66), "hex");
    const s = Buffer.from(signature.slice(66, 130), "hex");
    const v = Buffer.from(signature.slice(130, 132), "hex");
    const pub = ecrecover(msgHash, v, r, s);
    const addrBuf = pubToAddress(pub);
    const addr = bufferToHex(addrBuf);
    console.log(addr);
  });

// const hash = "4b274ead69d863cbee344109ede44c38961e754d383a480f2727465ea3e8a2a6";
// const signature =
// "cfd2a3413ce2cc1bf6c0877e933549859d137673abe0b613336a7d35f4f1d2ad30d031bab015a652da650956df8a1c4614735dddb5923d8993a4bc55176289c41c";
