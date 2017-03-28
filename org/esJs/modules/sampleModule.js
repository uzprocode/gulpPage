import $ from 'jquery';
let sampleModule = () => {
  // body...
  this.doSomethins = () => {
    const $body = $('body');
    $body.append('<div>sampleModule.js</div>');
  };
  return this;
}
module.exports = sampleModule;
