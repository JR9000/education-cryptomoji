'use strict';

/**
 * A function that takes an object and returns it encoded as JSON Buffer.
 * Should work identically to the client version. Feel free to copy and paste
 * any work you did there.
 *
 * Example:
 *   const encoded = encode({ hello: 'world', foo: 'bar' })
 *   console.log(encoded)  // <Buffer 7b 22 66 6f 6f 22 3a 22 62 61 72 22 ... >
 *   console.log(encoded.toString())  // '{"foo":"bar","hello":"world"}'
 *
 * Hint:
 *   Remember that all transactions and blocks must be generated
 *   deterministically! JSON is convenient, but you will need to sort
 *   your object's keys or random transactions may fail.
 */
const encode = object => {

  // Declare an output object
  // Define sorted list of keys from object
  // Iterate through sorted keys
  // Assign key value pairs to output object
  // return Buffer.from strigified JSON output object
  let output = {};
  let sorted = Object.keys(object).sort();
  for (let key of sorted) {
    output[key] = object[key];
  }
  return Buffer.from(JSON.stringify(output));

};

/**
 * A function that takes a JSON Buffer and decodes it into an object. Unlike
 * the client version, there is no need to handle base64 strings.
 */
const decode = buffer => {

  // return parsed JSON object from the Buffer.toString
  // Enjoy being Awesome
  return JSON.parse(buffer.toString());

};

// const encoded = encode({ hello: 'world', foo: 'bar' })
// console.log(encoded)  // <Buffer 7b 22 66 6f 6f 22 3a 22 62 61 72 22 ... >
// console.log(encoded.toString())  // '{"foo":"bar","hello":"world"}'
// console.log(decode(encoded))

module.exports = {
  encode,
  decode
};
