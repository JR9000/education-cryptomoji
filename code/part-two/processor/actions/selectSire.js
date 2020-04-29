'use strict';

const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');

const {
  getCollectionAddress,
  getSireAddress,
  isValidAddress
} = require('../services/addressing');

const { decode, encode } = require('../services/encoding')
// Helpers

const reject = (...m) => { throw new InvalidTransaction(m.join(' ')); };

// Select a moji as the sire for a particular colection
const selectSire = (publicKey, context, { sire }) => {
  // Check that sire actually exists
  if (!sire) {
    // reject if not
    reject('No fucking sire was supplied from key:', publicKey);
  }
  // Check that the address of sire is valid
  if (!isValidAddress(sire)) {
    // reject if not
    reject('Invalid Sire Address Motherfucker:', sire);
  }

  // Define variable for owner
  const owner = getCollectionAddress(publicKey);

  // We need to return a Promise so use context.getState again like in createCollection
  return context.getState([owner, sire])
  .then(state => {
    // Check that the owner has a collection
    if (state[owner].length === 0) {
      // reject if not
      reject('PublicKey Does not have a collection:', publicKey);
    }
    // Check that the sire exists
    if (state[sire].length === 0) {
      // reject if not
      reject('Sire does not exist!', sire);
    }

    // Check that the decoded sire owner is the publicKey
    if (decode(state[sire]).owner !== publicKey) {
      // reject if not
      reject('Mismatched sire owner:', state[sire].owner);
    }

    // Define the update variable
    const updates = {};
    // set the update[sireaddress of publickey] to {sire, owner: publicKey}
    updates[getSireAddress(publicKey)] =  encode({sire, owner: publicKey});

    // Return the setState Promise with new updates
    return context.setState(updates);

  });
}

module.exports = selectSire;
