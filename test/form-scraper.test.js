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

var when = require("when");

describe("Form Scraper", function () {
  var form = require(moduleToTest);
  describe("ScrapingFormProvider", function () {
    var ScrapingFormProvider = form.ScrapingFormProvider;
    var provider;
    beforeEach( function () {
      provider = new form.ScrapingFormProvider();
    })
    it("can be instantiated", function () {
      var provider = new form.ScrapingFormProvider();
    })
    describe("#.provideForm()", function () {
      var dummyUrl = "url";
      var dummyFormId = "#test";
      var dummyPromisifiedRequest;
      beforeEach( function () {
        dummyPromisifiedRequest = {get: when.resolve };
      })

      it("gets the `url`", function () {
        var spy = sinon.spy(dummyPromisifiedRequest, "get");
        ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest);
        spy.should.have.been.calledWith(dummyUrl);
      })
      it("and returns a promise", function () {
        ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest).should.have.property("then");
      })
      describe("Given an error happened during the request", function () {
        it("then it returns a rejected promise with the `error` as reason", function (done) {
          dummyPromisifiedRequest.get = sinon.stub().returns(when.reject("ERROR"));
          ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
            .should.be.rejectedWith("ERROR").and.notify(done);
        })
      })
      describe("Given the URL resolved", function () {
        describe("And the requested form is not present", function () {
          var formIsNotPresent = "<html></html>";
          it("Then reject the promise with ERROR_FORM_IS_ABSENT", function (done) {
            dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({body: formIsNotPresent}));
            ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest).
              should.be.rejectedWith("ERROR_FORM_IS_ABSENT").and.notify(done);
          })
        })
        describe("And the requested form is present", function () {
          var formIsPresent = "<html><form action=\"url\" id=\"test\">bla bla</form></html>";

          beforeEach( function () {
            dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({ body: formIsPresent }));
          })
          it("Then resolve the promise with object", function (done) {
            ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
              .should.eventually.be.instanceOf(Object).and.notify(done);
          })
          it("that has `action`, `data`", function (done) {
            ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
              .should.eventually.have.property("action").and.notify(done);
          })
          it("and `action` should be the action url", function (done) {
            ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
              .should.eventually.have.property("action", dummyUrl).and.notify(done);
          })
          describe("Given the form have no inputs", function () {
            it("`data` should be empty object", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  form.data.should.be.instanceOf(Object);
                })
                .should.notify(done);
            })
          })
          describe("Given the form has one input", function () {
            var formWithInputs = "<html><form action=\"url\" id=\"test\"><input name=\"input1\" value=\"val\" /></form></html>";
            beforeEach( function () {
              dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({ body: formWithInputs }));
            })
            it("Then `data` should have the inputs", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  Object.keys(form.data).length.should.be.greaterThan(0);
                })
                .should.notify(done);
            })
            it("where inputs name is the key", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  form.data.should.have.property("input1");
                })
                .should.notify(done);
            })
            it("and the input's value is the value", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  form.data.should.have.property("input1", "val");
                })
                .should.notify(done);
            })
          })
          describe("Given the form has several inputs", function () {
            var formWithInputs = "<html><form action=\"url\" id=\"test\"><input name=\"input1\" value=\"val\" /><input name=\"input2\" value=\"val2\" /></form></html>";
            beforeEach( function () {
              dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({ body: formWithInputs }));
            })
            it("Then it should have several inputs", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  Object.keys(form.data).length.should.be.greaterThan(1);
                })
                .should.notify(done);
            })
            it("where `keys` are the names", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  form.data.should.have.property("input1");
                  form.data.should.have.property("input2");
                })
                .should.notify(done);
            })
            it("and values are the values", function (done) {
              ScrapingFormProvider.provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
                .then( function (form) {
                  form.data.should.have.property("input1", "val");
                  form.data.should.have.property("input2", "val2");
                })
                .should.notify(done);
            })
          })
        })
      })
    })
    describe.skip(".updateOptions()", function () {
      it("returns itself", function () {
        provider.updateOptions({}).should.be.equal(provider);
      })
    })
  })
})