'use strict';

const { createHash } = require('crypto');


const NAMESPACE = '5f4d76';
const PREFIXES = {
  COLLECTION: '00',
  MOJI: '01',
  SIRE_LISTING: '02',
  OFFER: '03'
};

const hash = (message, length) => createHash('sha512').update(message).digest('hex').slice(0, length);

/**
 * A function that takes a public key and returns the corresponding collection
 * address.
 *
 * This is simpler than the client version, as the public key is not optional.
 * Processor addressing methods always return a full address.
 *
 * Example:
 *   const address = getCollectionAddress(publicKey);
 *   console.log(address);
 *   // '5f4d7600ecd7ef459ec82a01211983551c3ed82169ca5fa0703ec98e17f9b534ffb797'
 */
// sha256=64bits sha512=128bit while the expected address is 70
const getCollectionAddress = publicKey => {
  // Enter your solution here
  return NAMESPACE + PREFIXES.COLLECTION + hash(publicKey, 62)

};
/**
 * A function that takes a public key and a moji dna string, returning the
 * corresponding moji address.
 */
const getMojiAddress = (ownerKey, dna) => {
  // Your code here
  return NAMESPACE + PREFIXES.MOJI + hash(ownerKey, 8) + hash(dna, 54);

};

/**
 * A function that takes a public key, and returns the corresponding sire
 * listing address.
 */
const getSireAddress = ownerKey => {

  return NAMESPACE + PREFIXES.SIRE_LISTING + hash(ownerKey, 62);
};

/**
 * EXTRA CREDIT
 * Only needed if you add trading cryptomoji to your transaction processor.
 * Remove the `.skip` from line 184 of tests/01-Services.js to test.
 *
 * A function that takes a public key and one or more moji addresses,
 * returning the corresponding offer address.
 *
 * Unlike the client version, moji may only be identified by addresses, not
 * dna strings.
 */
const getOfferAddress = (ownerKey, addresses) => {
  // Your code here
  // Declare variables
  // Determine if addresses is an array
  if (!Array.isArray(addresses))addresses = [addresses];
  const addressHash = hash(addresses.sort().join('')).slice(0, 54);
  const ownerHash  = hash(ownerKey, 8);
  return NAMESPACE + PREFIXES.OFFER + ownerHash + addressHash;
};

/**
 * A function that takes an address and returns true or false depending on
 * whether or not it is a valid Cryptomoji address. It should reject an
 * address if:
 *   - it is not a string
 *   - it is not 70 hex characters
 *   - it does not start with the correct namespace
 *
 * Example:
 *   const isValid = isValidAddress('00000000');
 *   console.log(isValid);  // false
 */
const isValidAddress = address => {
  // Your code here
  // return false if not typeof string
  let re = /^[0-9A-Fa-f]+$/;
  if (typeof address !== 'string') return false;
  // return false if length is not 70
  if (address.length !== 70) return false;
  // return false if the namespace does not matchup
  if (address.substring(0, NAMESPACE.length) !== NAMESPACE)return false;
  // Otherwise return true
  if (!re.test(address)) return false;
  return true;

};

module.exports = {
  getCollectionAddress,
  getMojiAddress,
  getSireAddress,
  getOfferAddress,
  isValidAddress
};
