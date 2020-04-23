'use strict';

const { createHash } = require('crypto');
const signing = require('./signing');
const { Block, Blockchain } = require('./blockchain');


/**
 * A slightly modified version of a transaction. It should work mostly the
 * the same as the non-mineable version, but now recipient is optional,
 * allowing the creation of transactions that will reward miners by creating
 * new funds for their balances.
 */
class MineableTransaction {
  /**
   * If recipient is omitted, this is a reward transaction. The _source_ should
   * then be set to `null`, while the _recipient_ becomes the public key of the
   * signer.
   */
  constructor(privateKey, recipient = null, amount) {

    // If the recipient is null
    if (recipient === null) {
      // Set the recipient to the sources/signers publickey
      this.recipient = signing.getPublicKey(privateKey);
      // Set the source to null
      this.source = null;
      // Else the recipient is not null
    } else {
      // Set source to the publickey of the privatekey
      this.source = signing.getPublicKey(privateKey);
      // Set recipient to the recipient publicKey provided
      this.recipient = recipient;
    }
    // At the end
    // Set the amount to the amount
    this.amount = amount;
    // Create unique message
    const message = `${this.source}${recipient}${amount}`;
    // Set signature aka Sign the unique message with the private key
    this.signature = signing.sign(privateKey, message);
  }
}

/**
 * Almost identical to the non-mineable block. In fact, we'll extend it
 * so we can reuse the calculateHash method.
 */
class MineableBlock extends Block {
  /**
   * Unlike the non-mineable block, when this one is initialized, we want the
   * hash and nonce to not be set. This Block starts invalid, and will
   * become valid after it is mined.
   */
  constructor(transactions, previousHash) {
    // Set the transactions
    // Set the previousHash from the headblock hash
    // Must call parent constructor since this extends Block
    super(transactions, previousHash);
    this.hash = undefined;
    // Enjoy

    // Consider that the original Block may need to be refactored for when there is no nonce?

  }
}

/**
 * The new mineable chain is a major update to our old Blockchain. We'll
 * extend it so we can use some of its methods, but it's going to look
 * very different when we're done.
 */
class MineableChain extends Blockchain {
  /**
   * In addition to initializing a blocks array with a genesis block, this will
   * create hard-coded difficulty and reward properties. These are settings
   * which will be used by the mining method.
   *
   * Properties:
   *   - blocks: an array of mineable blocks
   *   - difficulty: a number, how many hex digits must be zeroed out for a
   *     hash to be valid, this will increase mining time exponentially, so
   *     probably best to set it pretty low (like 2 or 3)
   *   - reward: a number, how much to award the miner of each new block
   *
   * Hint:
   *   You'll also need some sort of property to store pending transactions.
   *   This will only be used internally.
   */
  constructor() {
    // Generate the genesis block
    super();
    //this.blocks = [new MineableBlock([], null)]
    //this.blocks[0].calculateHash(0);
    // Set the difficulty to 2 though im curious how a decimal would react
    this.difficulty = 3;
    // Set the reward to a reasonable amount Perhaps research the reward for other blockchains and halve or double that
    this.reward = 10;
    // Define variable for pending transactions
    this.pending = [];
  }

  /* No more adding blocks directly.
  */
  addBlock() {
    throw new Error('Must mine to add blocks to this blockchain! (ノಠ益ಠ)ノ彡┻━┻');
  }

  /**
   * Instead of blocks, we add pending transactions. This method should take a
   * mineable transaction and simply store it until it can be mined.
   */
  addTransaction(transaction) {

    // Add transaction to the pending transaction array
    this.pending.push(transaction);
    // Consider having to check its validity first?
  }

  /**
   * This method takes a private key, and uses it to create a new transaction
   * rewarding the owner of the key. This transaction should be combined with
   * the pending transactions and included in a new block on the chain.
   *
   * Note:
   *   Only certain hashes are valid for blocks now! In order for a block to be
   *   valid it must have a hash that starts with as many zeros as the
   *   the blockchain's difficulty. You'll have to keep trying nonces until you
   *   find one that works!
   *
   * Hint:
   *   Don't forget to clear your pending transactions after you're done.
   */
  mine(privateKey) {

    // Define variables (nonce and hash)
    let nonce = 0;
    // mutate nonce variable and generate hash WHILE it does not begin with zeros * difficulty.
    // Consider using String.repeat([count]) and string.substring for comparisons so that there is only a single line of code to alter when an increase in difficulty is desired.
    // Create a reward transaction with the privateKey
    const reward = new MineableTransaction(privateKey);
    reward.amount = this.reward;
    // Add that transaction to the pending transactions
    this.addTransaction(reward);
    let newBlock = new MineableBlock(this.pending, this.getHeadBlock().hash);

    do {
      nonce += 1;
    }
    while (newBlock.calculateHash(nonce).substring(0, this.difficulty) != '0'.repeat(this.difficulty))

    // When the hash meets requirements
    this.blocks.push(newBlock);

    // Reset the pending transactions array
    this.pending = [];

  }
}

// let blockchain = new MineableChain();

// const signer = signing.createPrivateKey();

// const recipient = signing.getPublicKey(signing.createPrivateKey());

// const amount = Math.ceil(Math.random() * 100);

// let transaction = new MineableTransaction(signer, recipient, amount);

// let miner = signing.createPrivateKey();

// blockchain.addTransaction(transaction);
// blockchain.mine(miner);
// console.log('yay')



/**
/**
 * A new validation function for our mineable blockchains. Forget about all the
 * signature and hash validation we did before. Our old validation functions
 * may not work right, but rewriting them would be a very dull experience.
 *
 * Instead, this function will make a few brand new checks. It should reject
 * a blockchain with:
 *   - any hash other than genesis's that doesn't start with the right
 *     number of zeros
 *   - any block that has more than one transaction with a null source
 *   - any transaction with a null source that has an amount different
 *     than the reward
 *   - any public key that ever goes into a negative balance by sending
 *     funds they don't have
 */
const isValidMineableChain = blockchain => {

  // Use an object to store the balances....Which is not space efficient
  const balances = {};
  // Iterate through blockchain blocks starting at Index 1 to skip the genesis block
  for (let i = 1; i < blockchain.blocks.length; i += 1) {
    const block = blockchain.blocks[i];
    // Return false if hash does not match requirements
    // Consider using the String.repeat([count]) and String.substring from above
    if (block.hash.substring(0, blockchain.difficulty) !== '0'.repeat(blockchain.difficulty)) {
      return false;
    }
    // Define variable for count of reward transactions
    let count = 0;
    // Iterate through transactions of current block
    for (let j = 0; j < block.transactions.length; j += 1) {
      const transaction = block.transactions[j];
      const recipient = transaction.recipient;
      const amount = transaction.amount;
      // If count is greater than 1
      if (transaction.source === null) {
        count += 1;
        if (count > 1) {
          // return false
          return false;
        }
        // This transaction is therefore a reward so increment the count of reward transactions for this block

        // Add the recipient to the balance object if it is undefined
        // Mutate/ add the reward amount to the recipient balance key/value

        // transaction.source = a public key of the sender
        // transaction.recipient = a public key of the recipient
        // So if the source is not yet in balance then we can not add/subtract from that key/value pair
        // balance[transaction.source] -= transaction.amount
        // balance[transaction.recipient] += transaction.amount

        // aka balance[source] = (balance[source] === undefined) ? 0 - amount : balance[source] - amount

        //                key: value,
        //        'publickey': balance,

        //  balances = {
        //               'bob':100,
        //               'jon':0,
        //             }
        // balances['bob'] = (balances['bob'] == undefined) ? 0 + amount : balances['bob'] + amount;
        balances[recipient] = (balances[recipient] == undefined) ? 0 + amount : balances[recipient] + amount;

        // If the amount is different than the reward amount
        if (transaction.amount !== blockchain.reward) {
          // return false
          return false;
        }
      } else {
        // This is a normal transaction
        const source = transaction.source;
        // Add the recipient to the balance object if it is undefined
        balances[recipient] = (balances[recipient] == undefined) ? 0 + amount : balances[recipient] + amount;
        balances[source] = (balances[source] == undefined) ? 0 - amount : balances[source] - amount;
        // Check that the source is not negative
        if (balances[source] < 0) {
          // return false if it is negative
          return false;
        }
      }
    }
  }
  // Otherwise after all its a valid chain
  return true
};


module.exports = {
  MineableTransaction,
  MineableBlock,
  MineableChain,
  isValidMineableChain
};
