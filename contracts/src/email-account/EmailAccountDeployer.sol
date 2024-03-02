// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./EmailAccountFactory.sol";
import "./EmailAccount.sol";
import "./Verifier.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract EmailAccountDeployer {
    event EmailAccountImplCreated(address emailAccountImpl);
    event EmailAccountFactoryCreated(address factory);
    event VerifierCreated(address impl);

    function deployVerifier(bytes32 salt) public returns (address) {
        address deployedAddress;
        deployedAddress = Create2.deploy(0, salt, type(Verifier).creationCode);
        emit VerifierCreated(deployedAddress);
        return deployedAddress;
    }

    function deployEmailAccountImpl(
        bytes32 salt,
        IEntryPoint entryPoint,
        Verifier verifier
    ) public returns (address) {
        address deployedAddress = Create2.deploy(
            0,
            salt,
            type(EmailAccount).creationCode
        );
        EmailAccount(payable(deployedAddress)).initialize(
            entryPoint,
            verifier,
            0
        );
        emit EmailAccountImplCreated(deployedAddress);
        return deployedAddress;
    }

    function deployEmailAccountFactory(
        bytes32 salt,
        IEntryPoint entryPoint,
        Verifier verifier,
        EmailAccount emailAccountImpl
    ) public returns (address) {
        address deployedAddress;
        deployedAddress = Create2.deploy(
            0,
            salt,
            type(EmailAccountFactory).creationCode
        );
        EmailAccountFactory(deployedAddress).initialize(
            entryPoint,
            verifier,
            emailAccountImpl
        );
        emit EmailAccountFactoryCreated(deployedAddress);
        return deployedAddress;
    }

    // function computeEmailAccountFactoryAddress(
    //     bytes32 salt
    // ) public view returns (address) {
    //     return
    //         Create2.computeAddress(
    //             salt,
    //             type(EmailAccountFactory).creationCode
    //         );
    // }
}
