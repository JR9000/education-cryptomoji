'use strict';

const { createHash } = require('crypto');
const signing = require('./signing');

/**
 * A simple validation function for transactions. Accepts a transaction
 * and returns true or false. It should reject transactions that:
 *   - have negative amounts
 *   - were improperly signed
 *   - have been modified since signing
 */
const isValidTransaction = transaction => {
  // Check that the properties are of the correct length and that the amount is greater than zero
 if (transaction.amount <= 0 || transaction.signature.length != 128 || transaction.recipient.length != 66 || transaction.source.length != 66)return false;
 // After the initial check verify that the signature is authentic
return signing.verify(transaction.source, `${transaction.source}${transaction.recipient}${transaction.amount}`, transaction.signature);


};

/**
 * Validation function for blocks. Accepts a block and returns true or false.
 * It should reject blocks if:
 *   - their hash or any other properties were altered
 *   - they contain any invalid transactions
 */
const isValidBlock = block => {
  // Your code here
  // if (block.hash !== block.calculateHash(block.nonce)) return false;
  if (block.transactions.length) {
    for (let i = 0; i < block.transactions.length; i += 1) {
      if (!isValidTransaction(block.transactions[i])) {
        return false;
      }
    }
  }
  return true;
};

/**
 * One more validation function. Accepts a blockchain, and returns true
 * or false. It should reject any blockchain that:
 *   - is a missing genesis block
 *   - has any block besides genesis with a null hash
 *   - has any block besides genesis with a previousHash that does not match
 *     the previous hash
 *   - contains any invalid blocks
 *   - contains any invalid transactions
 */
const isValidChain = blockchain => {
  // Your code here

};

/**
 * This last one is just for fun. Become a hacker and tamper with the passed in
 * blockchain, mutating it for your own nefarious purposes. This should
 * (in theory) make the blockchain fail later validation checks;
 */
const breakChain = blockchain => {
  // Your code here

};

module.exports = {
  isValidTransaction,
  isValidBlock,
  isValidChain,
  breakChain
};
