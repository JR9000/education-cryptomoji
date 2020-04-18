'use strict';

const { createHash } = require('crypto');
const signing = require('./signing');


/**
 * A simple signed Transaction class for sending funds from the signer to
 * another public key.
 */
class Transaction {
  /**
   * The constructor accepts a hex private key for the sender, a hex
   * public key for the recipient, and a number amount. It will use these
   * to set a number of properties, including a Secp256k1 signature.
   *
   * Properties:
   *   - source: the public key derived from the provided private key
   *   - recipient: the provided public key for the recipient
   *   - amount: the provided amount
   *   - signature: a unique signature generated from a combination of the
   *     other properties, signed with the provided private key
   */
  constructor(privateKey, recipient, amount) {
    this.source = signing.getPublicKey(privateKey);
    this.recipient = recipient;
    this.amount = Number(amount);
    // can format the message differently but this way for tests
    const message = `${this.source}${recipient}${amount}`;
    this.signature = signing.sign(privateKey, message);
  }
}

/**
 * A Block class for storing an array of transactions and the hash of a
 * previous block. Includes a method to calculate and set its own hash.
 */
class Block {
  /**
   * Accepts an array of transactions and the hash of a previous block. It
   * saves these and uses them to calculate a hash.
   *
   * Properties:
   *   - transactions: the passed in transactions
   *   - previousHash: the passed in hash
   *   - nonce: just set this to some hard-coded number for now, it will be
   *     used later when we make blocks mineable with our own PoW algorithm
   *   - hash: a unique hash string generated from the other properties
   */
  constructor(transactions, previousHash) {
    // Your code here
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 69000;

    // Added this to create the hash so that the hash is not undefined
    this.calculateHash(this.nonce);
  }

  /**
   * Accepts a nonce, and generates a unique hash for the block. Updates the
   * hash and nonce properties of the block accordingly.
   *
   * Hint:
   *   The format of the hash is up to you. Remember that it needs to be
   *   unique and deterministic, and must become invalid if any of the block's
   *   properties change.
   */
  calculateHash(nonce) {
    // Your code here
    this.nonce = nonce;
    const message = this.transactions + 'Ryan and Jordan Rule this shit!' + this.previousHash + nonce;
    this.hash = createHash('sha256').update(message).digest('hex');

  }
}

/**
 * A Blockchain class for storing an array of blocks, each of which is linked
 * to the previous block by their hashes. Includes methods for adding blocks,
 * fetching the head block, and checking the balances of public keys.
 */
class Blockchain {
  /**
   * Generates a new blockchain with a single "genesis" block. This is the
   * only block which may have no previous hash. It should have an empty
   * transactions array, and `null` for the previous hash.
   *
   * Properties:
   *   - blocks: an array of blocks, starting with one genesis block
   */
  constructor() {
    this.blocks = [new Block([], null)];
  }

  /**
   * Simply returns the last block added to the chain.
   */
  getHeadBlock() {
    return this.blocks[this.blocks.length - 1]
  }

  /**
   * Accepts an array of transactions, creating a new block with them and
   * adding it to the chain.
   */
  addBlock(transactions) {
    // Your code here
    this.blocks.push(new Block(transactions, this.getHeadBlock().hash))
  }

  /**
   * Accepts a public key, calculating its "balance" based on the amounts
   * transferred in all transactions stored in the chain.
   *
   * Note:
   *   There is currently no way to create new funds on the chain, so some
   *   keys will have a negative balance. That's okay, we'll address it when
   *   we make the blockchain mineable later.
   */
  getBalance(publicKey) {
    let balance = 0;
    // we will iterate over all blocks
    this.blocks.forEach(block => {
      // we then iterate over every transaction in the block
      block.transactions.forEach(transaction => {
        // Subtract from balance if publickey is the sender/source
        if (transaction.source == publicKey) {
          balance -= transaction.amount;
          // Add to balance if publickey is recipient
        } else if (transaction.recipient == publicKey) {
          balance += transaction.amount;
        }
      });
    });
    // let recd = 0;
    // let sent = 0;
    // const sentArr = [];
    // this.blocks
    //   .forEach(block => sentArr
    //     .push(block.transactions
    //       .filter(transaction => transaction.source === publicKey)));
    // const recieveArr = [];
    // this.blocks
    //   .forEach(block => sentArr
    //     .push(block.transactions
    //       .filter(transaction => transaction.recipient === publicKey)));
    // if (sentArr.length == 0 && recieveArr.length == 0)return 0
    // if (recieveArr.length)recd = recieveArr.map(transaction => transaction.amount).reduce((a, b) => a + b);
    // if (sentArr.length)sent = sentArr.map(transaction => transaction.amount).reduce((a, b) => a + b);
    return balance;
  }
}

const blockchain = new Blockchain()
let person1 = '08d5364254370208718e91b6e16c511c1b11940ae9f1f3fcdba3c6a910865af7'
let person2 = '102e52e52f6c96940db22093d0fd71f1fb000f4686b811129ca35fa4e79ff062'
const signer = person1;
const recipient = signing.getPublicKey(person2);
for (let i =0; i < 10; i++) {
  const transCnt = Math.round(Math.random() * 10);
  const transactions = [];
  for (let j = 0; j < transCnt; j++) {
    transactions.push(new Transaction(signer, recipient, 100));
    // Add some random transactions that wont be in the balance for person2 listed above
    for (let k = 0; k < transCnt; k++) {
      transactions.push(new Transaction(signing.createPrivateKey(), signing.getPublicKey(person1)));
    }
  }
  blockchain.addBlock(transactions);
}
const transaction = new Transaction(signer, recipient, 100);
  blockchain.addBlock([transaction]);
console.log(blockchain.getBalance(signing.getPublicKey(person2)));
console.log(blockchain.getHeadBlock());

module.exports = {
  Transaction,
  Block,
  Blockchain
};
