import { verifyDKIMSignature } from "@/helpers/dkim";
import { generateCircuitInputs } from "@/helpers/input-helpers";

export const MAX_HEADER_PADDED_BYTES = 768; // NOTE: this must be the same as the first arg in the email in main args circom
export const MAX_BODY_PADDED_BYTES = 1024; // NOTE: this must be the same as the arg to sha the remainder number of bytes in the email in main args circom

type ChangeOwnerCircuitInput = {
  in_padded: string[];
  pubkey: string[];
  signature: string[];
  in_len_padded_bytes: string;
  sender_email_idx: string;
  owner_address_idx: string;
};

export async function generateInputs(rawEmail: string) {
  const dkimResult = await verifyDKIMSignature(rawEmail);
  const emailVerifierInputs = generateCircuitInputs({
    rsaSignature: dkimResult.signature, // The RSA signature of the email
    rsaPublicKey: dkimResult.publicKey, // The RSA public key used for verification
    body: dkimResult.body, // body of the email
    bodyHash: dkimResult.bodyHash, // hash of the email body
    message: dkimResult.message, // the message that was signed (header + bodyHash)
    maxMessageLength: MAX_HEADER_PADDED_BYTES, // Maximum allowed length of the message in circuit
    maxBodyLength: MAX_BODY_PADDED_BYTES, // Maximum allowed length of the body in circuit
    ignoreBodyHashCheck: false, // To be used when ignore_body_hash_check is true in circuit
  });

  const in_padded_buf = emailVerifierInputs.in_padded.map((c) => Number(c));
  const in_padded_str = in_padded_buf
    .map((c) => String.fromCharCode(c))
    .join("");

  // get sender email index
  const re_from =
    /(?:(?:\r\n)|^)from:(?:[^\r\n]+<)?([A-Za-z0-9!#$%&'\\*\\+-/=\\?^_`{\\|}~\\.]+@[A-Za-z0-9\\.-]+)/gm;
  const match_from = Array.from(in_padded_str.matchAll(re_from))[0];
  const sender_email = match_from[1];
  const sender_email_idx =
    match_from.index! +
    in_padded_str.substring(match_from.index!).indexOf(sender_email);

  const re_subject = /\r\nsubject:Change owner to 0x([a-fA-F0-9]+)/gm;
  const match_subject = Array.from(in_padded_str.matchAll(re_subject))[0];
  const owner_address = match_subject[1];
  const owner_address_idx =
    match_subject.index! +
    in_padded_str.substring(match_subject.index!).indexOf(owner_address);

  // not using body hash here
  const circuitInputs: ChangeOwnerCircuitInput = {
    in_padded: emailVerifierInputs.in_padded,
    pubkey: emailVerifierInputs.pubkey,
    signature: emailVerifierInputs.signature,
    in_len_padded_bytes: emailVerifierInputs.in_len_padded_bytes,
    sender_email_idx: sender_email_idx.toString(),
    owner_address_idx: owner_address_idx.toString(),
  };
  return { circuitInputs, sender_email };
}
