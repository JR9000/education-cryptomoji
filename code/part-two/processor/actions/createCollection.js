'use strict';
const {InvalidTransaction} = require('sawtooth-sdk/processor/exceptions')
const {
  getCollectionAddress,
  getMojiAddress
 } = require('../services/addressing');
const { encode } = require('../services/encoding');
const getPrng = require('../services/prng');

const NEW_MOJI_COUNT = 3;
const DNA_LENGTH = 9;
const GENE_SIZE = 2 ** (2 * 8);

// helper functions
const reject = (...messages) => {throw new InvalidTransaction(messages.join(' ')); };

const emptyArray = size => Array.apply(null, Array(size));

// Create dna
const createDna = prng => {
  //return 36 hex string
  return emptyArray(DNA_LENGTH).map(()=>{
    const rndmHex = prng(GENE_SIZE).toString(16);
    return ('0000' + rndmHex).slice(-4);
  }).join('');
};



// Create moji
const createMoji = (publicKey, prng) => {
  return emptyArray(NEW_MOJI_COUNT).map(()=> (
    {
      "dna": createDna(prng),
      "owner": publicKey,
      "breeder": null, // "<string, moji address>",
      "sire": null,    // "<string, moji address>",
      "bred": [],      // [ "<strings, moji addresses>" ],
      "sired": [],     // [ "<strings, moji addresses>" ]
    }
  ));
};

const createCollection = (publicKey, context, signature) => {
  const address = getCollectionAddress(publicKey);
  //console.log(JSON.stringify(context));
  const prng = getPrng(signature);
  return context.getState([address])
  .then((state) => {
    //console.log('state: ',state);
    // Check if state has address's
    if (state[address].length > 0) {
      // reject if address already exists
      reject('Duplicate address! key:', publicKey)
    }

    // Define variables for updates, MojiAddresses, and moji
    const updates = {};
    const mojiAddrs = [];
    const mojis = createMoji(publicKey, prng)

    mojis.forEach(moji => {
      const address = getMojiAddress(publicKey, moji.dna);
      updates[address] = encode(moji);
      mojiAddrs.push(address);
    });


    updates[address] = encode({
      key: publicKey,
      moji: mojiAddrs.sort()
    });

    return context.setState(updates);
  })


}

module.exports = createCollection;