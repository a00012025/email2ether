include "circomlib/circuits/poseidon.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/helpers/utils.circom";

include "./components/domain_paymaster.circom";

template DomainPaymasterVerifier(max_email_bytes, max_domain_bytes, pack_size) {
  signal input email_padded[max_email_bytes];
  signal input at_index;

  signal output email_hash;
  signal output domain_hash;
  
  // EMAIL REGEX
  signal domain_regex_out, domain_regex_reveal[max_email_bytes];
  (domain_regex_out, domain_regex_reveal) <== DomainPaymasterRegex(max_email_bytes)(email_padded);
  domain_regex_out === 1;
  var max_domain_packed_bytes = count_packed(max_domain_bytes, pack_size);
  signal reveal_domain_packed[max_domain_packed_bytes];
  reveal_domain_packed <== ShiftAndPackMaskedStr(max_email_bytes, max_domain_bytes, pack_size)(domain_regex_reveal, at_index + 1);

  var max_email_packed_bytes = count_packed(max_email_bytes, pack_size);
  signal email_packed[max_email_packed_bytes];
  email_packed <== Bytes2Packed(max_email_bytes, pack_size)(email_padded);

  // Poseidon hash of domain
  component pos = Poseidon(max_domain_packed_bytes);
  for (var i=0; i<max_domain_packed_bytes; i++) {
      pos.inputs[i] <== reveal_domain_packed[i];
  }
  domain_hash <== pos.out;

  // Poseidon hash of email
  component pos2 = Poseidon(max_email_bytes);
  for (var i=0; i<max_email_bytes; i++) {
      pos2.inputs[i] <== email_padded[i];
  }
  email_hash <== pos2.out;
}

// Args:
// * max_email_bytes = 64 is the max number of bytes in an email address
// * max_domain_bytes = 32 is the max number of bytes in a domain name
// * pack_size = 31 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = DomainPaymasterVerifier(31, 20, 31);