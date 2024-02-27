pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
include "circomlib/circuits/poseidon.circom";
include "./components/change_owner.circom";
include "./utils/constants.circom";

// Here, n and k are the biginteger parameters for RSA
// This is because the number is chunked into k pack_size of n bits each
// Max header bytes shouldn't need to be changed much per email,
// but the max mody bytes may need to be changed to be larger if the email has a lot of i.e. HTML formatting
// TODO: split into header and body
template ChangeOwnerVerifier(max_header_bytes, max_body_bytes, n, k, pack_size) {
    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input pubkey[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length
    signal output pubkey_hash;

    // const
    var email_max_bytes = email_max_bytes_const();
    var wallet_address_bytes = 40;

    // Email Verifier
    component EV = EmailVerifier(max_header_bytes, max_body_bytes, n, k, 1);
    EV.in_padded <== in_padded;
    EV.pubkey <== pubkey;
    EV.signature <== signature;
    EV.in_len_padded_bytes <== in_len_padded_bytes;
    pubkey_hash <== EV.pubkey_hash;

    // FROM HEADER REGEX, pack and output hash
    signal input sender_email_idx; // Index of the from email address (= sender email address) in the email header
    signal from_regex_out, from_regex_reveal[max_header_bytes];
    (from_regex_out, from_regex_reveal) <== FromAddrRegex(max_header_bytes)(in_padded);
    from_regex_out === 1;
    var max_sender_email_packed_bytes = count_packed(email_max_bytes, pack_size);
    signal reveal_email_packed[max_sender_email_packed_bytes];
    reveal_email_packed <== ShiftAndPackMaskedStr(max_header_bytes, email_max_bytes, pack_size)(from_regex_reveal, sender_email_idx);

    // Poseidon hash of reveal_email_packed
    component pos = Poseidon(max_sender_email_packed_bytes);
    signal output reveal_email_hash;
    for (var i=0; i<max_sender_email_packed_bytes; i++) {
        pos.inputs[i] <== reveal_email_packed[i];
    }
    reveal_email_hash <== pos.out;

    // SUBJECT HEADER REGEX
    signal input owner_address_idx; // Index of the subject in the header
    signal owner_address_regex_out, owner_address_regex_reveal[max_header_bytes];
    (owner_address_regex_out, owner_address_regex_reveal) <== ChangeOwnerRegex(max_header_bytes)(in_padded);
    owner_address_regex_out === 1;
    var max_address_packed_bytes = count_packed(wallet_address_bytes, pack_size); // should be 2
    signal output reveal_owner_addr_packed[max_address_packed_bytes];
    reveal_owner_addr_packed <== ShiftAndPackMaskedStr(max_header_bytes, wallet_address_bytes, pack_size)(owner_address_regex_reveal, owner_address_idx);
}

// In circom, all output signals of the main component are public (and cannot be made private), the input signals of the main component are private if not stated otherwise using the keyword public as above. The rest of signals are all private and cannot be made public.
// This makes pubkey_hash and reveal_address_packed public. hash(signature) can optionally be made public, but is not recommended since it allows the mailserver to trace who the offender is.

// Args:
// * max_header_bytes = 768 is the max number of bytes in the header
// * max_body_bytes = 1024 is the max number of bytes in the body after precomputed slice (not used)
// * n = 121 is the number of bits in each chunk of the pubkey (RSA parameter)
// * k = 17 is the number of chunks in the pubkey (RSA parameter). Note 121 * 17 > 2048.
// * pack_size = 31 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = ChangeOwnerVerifier(768, 1024, 121, 17, 31);
