var moduleToTest  = "../form-scraper";
var proxyquire  = require("proxyquire")
var chai        = require("chai")
var sinon       = require("sinon")
var sinonChai   = require("sinon-chai")

chai.use(sinonChai)
var should = chai.should()
var expect = chai.expect

var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Form Scraper", function () {
  var form = require(moduleToTest);
  describe("ScrapingFormProvider", function () {
    it("should pass the first test", function () {

    })
  })
})