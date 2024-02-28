// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";

import {Verifier} from "../src/email-account/Verifier.sol";

contract VerifierTest is Test {
    function test_verifier() public {
      uint256[8] memory proof = [
        0x11a1a213f5f01600f7a694eaccb3daa569f33f2652e70ab8a989921b5b0dd53c,
        0x02ce485d91106ebc0943aab292561640d23dfc4e21125c601a4b361d6d5a22d0,
        0x235c0d2503b4f252b4147412b6350986fdc5156b0f7a165044d3735af541e0f8,
        0x2a3fa5a2b070a007455d362c69130f1c26b4b6daaabb36132d3cb945b6683d67,
        0x0aadee79a595bb8f4d3ee3a0193138c815ca1a047c684d84dac12ccdf2bb5d3b,
        0x27a7dccfb3a02e23e29a029d31545d1598b5d5a90ae4d388bce13bfc7a40d20e,
        0x0cc8d7cadd136f374b3931b4d8f1068f86ef4243ccae15f55974ce3dd6fa6883,
        0x1eb8e3e4325fd6ed837ff5acac7dfe2566ab4b568afd4bb7b752b111afa6840d
      ]; 
      uint256[5] memory signals = [
        0x0ea9c777dc7110e5a9e89b13f0cfc540e3845ba120b2b6dc24024d61488d4788,
        0x01d0b7776a4c1940b435457c922c21b6d0cff2de3eadbbd8de7b65557f8eee2f,
        0x0038313766306366434530643132323466464342373932634239343531303930,
        0x0000000000000000000000000000000000000000000000333365353032323339,
        0x00dca0c7a9b16b8386afcc30799a420c5bedf32267e098a3c3badef211bbd1e5
      ];

      Verifier verifier = new Verifier();
      bool result = verifier.verifyProof(
        [proof[0], proof[1]],
        [[proof[2], proof[3]], [proof[4], proof[5]]],
        [proof[6], proof[7]],
        signals
      );
      assertEq(result, true);
    }
}
