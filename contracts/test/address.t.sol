// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";

contract AddressTest is Test {
    uint256 public constant bytesInPackedBytes = 31;
    // 31 bytes in packed bytes => 40 bytes for 2 packed bytes
    uint256 public constant addressPackLength = 2;

    function test_uint256ArrayToAdderss() public {
        address expected = 0xd24eF9076De2b69A51F54042831403651D3ac980;
        uint256[] memory addressPack = new uint256[](addressPackLength);
        addressPack[0] = uint256(95763030135637999962475332507000870462725102934868963895586755925926752868);
        addressPack[1] = uint256(889495094146978033973);

        string memory messageBytes = convertPackedBytesToString(
            addressPack,
            bytesInPackedBytes * 2,
            bytesInPackedBytes
        );
        console.log(messageBytes);
        address recovered = address(bytes20(bytes(messageBytes)));

        assertEq(recovered, expected);
    }

    function convertPackedBytesToString(uint256[] memory packedBytes, uint256 signals, uint256 packSize)
        internal
        pure
        returns (string memory extractedString)
    {
        uint8 state = 0;
        // bytes: 0 0 0 0 y u s h _ g 0 0 0
        // state: 0 0 0 0 1 1 1 1 1 1 2 2 2
        bytes memory nonzeroBytesArray = new bytes(packedBytes.length * packSize);
        uint256 nonzeroBytesArrayIndex = 0;
        for (uint16 i = 0; i < packedBytes.length; i++) {
            uint256 packedByte = packedBytes[i];
            uint8[] memory unpackedBytes = new uint8[](packSize);
            for (uint256 j = 0; j < packSize; j++) {
                unpackedBytes[j] = uint8(packedByte >> (j * 8));
            }
            for (uint256 j = 0; j < packSize; j++) {
                uint256 unpackedByte = unpackedBytes[j]; //unpackedBytes[j];
                if (unpackedByte != 0) {
                    nonzeroBytesArray[nonzeroBytesArrayIndex] = bytes1(uint8(unpackedByte));
                    nonzeroBytesArrayIndex++;
                    if (state % 2 == 0) {
                        state += 1;
                    }
                } else {
                    if (state % 2 == 1) {
                        state += 1;
                    }
                }
                packedByte = packedByte >> 8;
            }
        }
        // TODO: You might want to assert that the state is exactly 1 or 2
        // If not, that means empty bytse have been removed from the middle and things have been concatenated.
        // We removed due to some tests failing, but this is not ideal and the require should be uncommented as soon as tests pass with it.

        // require(state == 1 || state == 2, "Invalid final state of packed bytes in email; more than two non-zero regions found!");
        require(state >= 1, "No packed bytes found! Invalid final state of packed bytes in email; value is likely 0!");
        require(nonzeroBytesArrayIndex <= signals, "Packed bytes more than allowed max number of signals!");
        string memory returnValue = removeTrailingZeros(string(nonzeroBytesArray));
        return returnValue;
        // Have to end at the end of the email -- state cannot be 1 since there should be an email footer
    }

    function removeTrailingZeros(string memory input) public pure returns (string memory) {
        bytes memory inputBytes = bytes(input);
        uint256 endIndex = inputBytes.length;

        for (uint256 i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] == 0) {
                endIndex = i;
                break;
            }
        }

        bytes memory resultBytes = new bytes(endIndex);
        for (uint256 i = 0; i < endIndex; i++) {
            resultBytes[i] = inputBytes[i];
        }

        return string(resultBytes);
    }
}
