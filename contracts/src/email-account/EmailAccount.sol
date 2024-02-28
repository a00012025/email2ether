// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "account-abstraction/core/BaseAccount.sol";
import "account-abstraction/core/Helpers.sol";
import "../callback/TokenCallbackHandler.sol";

import {Verifier} from "./Verifier.sol";
import "../utils/StringUtils.sol";

/**
 * minimal account.
 *  this is sample minimal account.
 *  has execute, eth handling methods
 *  has a single signer that can send requests through the entryPoint.
 */
contract EmailAccount is
    BaseAccount,
    TokenCallbackHandler,
    UUPSUpgradeable,
    Initializable
{
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using StringUtils for *;

    address public owner;
    uint256 public emailHash;

    IEntryPoint private immutable _entryPoint;

    uint16 public constant bytesInPackedBytes = 31;

    bytes32 public constant appleEmailKeyHash =
        0x1234567890123456789012345678901234567890123456789012345678901234;
    bytes32 public constant gmailKeyHash =
        0x0ea9c777dc7110e5a9e89b13f0cfc540e3845ba120b2b6dc24024d61488d4788;

    uint32 public constant pubKeyHashIndexInSignals = 0; // index of DKIM public key hash in signals array
    uint32 public constant emailHashIndexInSignals = 1; // index of email hash in signals array
    uint32 public constant ownerIndexInSignals = 2; // index of first packed owner address in signals array
    uint32 public constant ownerLengthInSignals = 2; // length of packed owner address in signals array
    uint32 public constant nullifierIndexInSignals = 4; // index of nullifier in signals array
    Verifier public immutable verifier;
    mapping(uint256 => bool) public usedNullifiers;

    event EmailAccountInitialized(
        IEntryPoint indexed entryPoint,
        uint256 indexed emailHash
    );
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    constructor(IEntryPoint anEntryPoint, Verifier anVerifier) {
        _entryPoint = anEntryPoint;
        verifier = anVerifier;

        _disableInitializers();
    }

    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(
            msg.sender == owner || msg.sender == address(this),
            "only owner"
        );
    }

    function _requireNoneZeroAddress(address addr) internal pure {
        require(addr != address(0), "invalid zero address");
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function transferOwnership(
        uint256[8] memory proof,
        uint256[5] memory signals
    ) public virtual {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

        // Verify the nullifier has not been used before
        uint256 nullifier = signals[nullifierIndexInSignals];
        require(nullifier < snark_scalar_field, "invalid nullifier");
        require(!usedNullifiers[nullifier], "nullifier has been used before");
        usedNullifiers[nullifier] = true;

        // Verify the DKIM public key hash stored on-chain matches the one used in circuit
        bytes32 dkimPublicKeyHashInCircuit = bytes32(
            signals[pubKeyHashIndexInSignals]
        );
        require(
            dkimPublicKeyHashInCircuit == appleEmailKeyHash ||
                dkimPublicKeyHashInCircuit == gmailKeyHash,
            "invalid public key hash"
        );

        // Verify the email hash stored on-chain matches the one used in circuit
        uint256 emailHashInCircuit = signals[emailHashIndexInSignals];
        require(emailHashInCircuit == emailHash, "invalid email hash");

        // Veiry RSA and proof
        require(
            verifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                signals
            ),
            "Invalid Proof"
        );

        // Extract the owner chunks from the signals.
        uint256[] memory ownerAddressPack = new uint256[](ownerLengthInSignals);
        for (
            uint256 i = ownerIndexInSignals;
            i < (ownerIndexInSignals + ownerLengthInSignals);
            i++
        ) {
            ownerAddressPack[i - ownerIndexInSignals] = signals[i];
        }

        // Convert the owner chunks to an address
        string memory messageBytes = StringUtils.convertPackedBytesToString(
            ownerAddressPack,
            bytesInPackedBytes * ownerLengthInSignals,
            bytesInPackedBytes
        );
        address newOwner = StringUtils.stringToAddress(messageBytes);

        // Transfer ownership
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     * @dev to reduce gas consumption for trivial case (no value), use a zero-length array to mean zero value
     */
    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        require(
            dest.length == func.length &&
                (value.length == 0 || value.length == func.length),
            "wrong array lengths"
        );
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of EmailAccount must be deployed with the new EntryPoint address, then upgrading
     * the implementation by calling `upgradeTo()`
     */
    function initialize(uint256 anEmailHash) public virtual initializer {
        _initialize(anEmailHash);
    }

    function _initialize(uint256 anEmailHash) internal virtual {
        emailHash = anEmailHash;
        emit EmailAccountInitialized(_entryPoint, anEmailHash);
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner,
            "account: not Owner or EntryPoint"
        );
    }

    /// implement template method of BaseAccount
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
        return 0;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
        _onlyOwner();
    }
}
