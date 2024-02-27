pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
include "circomlib/circuits/poseidon.circom";
include "./components/change_owner.circom";
include "./utils/constants.circom";

template ShiftAndPackTest() {
    var max_header_bytes = 768;
    var wallet_address_bytes = 40;
    var pack_size = 31;

    signal input in_padded[max_header_bytes];
    signal input owner_address_idx;

    signal owner_address_regex_out, owner_address_regex_reveal[max_header_bytes];
    (owner_address_regex_out, owner_address_regex_reveal) <== ChangeOwnerRegex(max_header_bytes)(in_padded);
    owner_address_regex_out === 1;
    var max_address_packed_bytes = count_packed(wallet_address_bytes, pack_size); // should be 2
    signal output reveal_owner_addr_packed[max_address_packed_bytes];
    reveal_owner_addr_packed <== ShiftAndPackMaskedStr(max_header_bytes, wallet_address_bytes, pack_size)(owner_address_regex_reveal, owner_address_idx);
}

component main = ShiftAndPackTest();
