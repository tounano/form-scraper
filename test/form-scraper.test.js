var moduleToTest  = "../form-scraper";
var chai        = require("chai");
var sinon       = require("sinon");
var sinonChai   = require("sinon-chai");

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
      var provideForm = ScrapingFormProvider.provideForm;
      var spyRequestGet;

      beforeEach( function () {
        dummyPromisifiedRequest = {get: sinon.spy(when.resolve) };
      })

      it("gets the `url`", function () {

        provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest);
        dummyPromisifiedRequest.get.should.have.been.calledWith(dummyUrl);
      })
      it("and returns a promise", function () {
        provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest).should.have.property("then");
      })
      describe("Given an error happened during the request", function () {
        it("then it returns a rejected promise with the `error` as reason", function (done) {
          dummyPromisifiedRequest.get = sinon.stub().returns(when.reject("ERROR"));
          provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest)
            .should.be.rejectedWith("ERROR").and.notify(done);
        })
      })
      describe("Given the URL resolved", function () {
        describe("And the requested form is not present", function () {
          var formIsNotPresent = "<html></html>";
          it("Then reject the promise with ERROR_FORM_IS_ABSENT", function (done) {
            dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({body: formIsNotPresent}));
            provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest).
              should.be.rejectedWith("ERROR_FORM_IS_ABSENT").and.notify(done);
          })
        })
        describe("And the requested form is present", function () {
          var formIsPresent = "<html><form action=\"url\" id=\"test\">bla bla</form></html>";
          var promisedForm;
          beforeEach( function () {
            dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({ body: formIsPresent }));
            promisedForm = provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest);
          })
          it("Then resolve the promise with object", function (done) {
            promisedForm.should.eventually.be.instanceOf(Object).and.notify(done);
          })
          it("that has `action`, `data`", function (done) {
            promisedForm.should.eventually.have.property("action").and.notify(done);
          })
          it("and `action` should be the action url", function (done) {
            promisedForm.should.eventually.have.property("action", dummyUrl).and.notify(done);
          })
          describe("Given the form have no inputs", function () {
            var promisedForm;
            beforeEach( function () {
              promisedForm = provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest);
            })
            it("`data` should be empty object", function (done) {
              promisedForm.then( function (form) {
                  form.data.should.be.instanceOf(Object);
              }).should.notify(done);
            })
          })
          describe("Given the form has one input", function () {
            var formWithInputs = "<html><form action=\"url\" id=\"test\"><input name=\"input1\" value=\"val\" /></form></html>";
            var promisedForm;
            beforeEach( function () {
              dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({ body: formWithInputs }));
              promisedForm = provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest);
            })
            it("Then `data` should have the inputs", function (done) {
              promisedForm.then( function (form) {
                Object.keys(form.data).length.should.be.greaterThan(0);
              }).should.notify(done);
            })
            it("where inputs name is the key", function (done) {
              promisedForm.then( function (form) {
                form.data.should.have.property("input1");
              }).should.notify(done);
            })
            it("and the input's value is the value", function (done) {
              promisedForm.then( function (form) {
                form.data.should.have.property("input1", "val");
              }).should.notify(done);
            })
          })
          describe("Given the form has several inputs", function () {
            var formWithInputs = "<html><form action=\"url\" id=\"test\"><input name=\"input1\" value=\"val\" /><input name=\"input2\" value=\"val2\" /></form></html>";
            var promisedForm;
            beforeEach( function () {
              dummyPromisifiedRequest.get = sinon.stub().returns(when.resolve({ body: formWithInputs }));
              promisedForm = provideForm(dummyFormId, dummyUrl, dummyPromisifiedRequest);
            })
            it("Then it should have several inputs", function (done) {
              promisedForm.then( function (form) {
                Object.keys(form.data).length.should.be.greaterThan(1);
              }).should.notify(done);
            })
            it("where `keys` are the names", function (done) {
              promisedForm.then( function (form) {
                form.data.should.have.property("input1");
                form.data.should.have.property("input2");
              }).should.notify(done);
            })
            it("and values are the values", function (done) {
              promisedForm.then( function (form) {
                form.data.should.have.property("input1", "val");
                form.data.should.have.property("input2", "val2");
              }).should.notify(done);
            })
          })
        })
      })
    })
    describe("Given an instance ScrapingFormProvider", function () {
      var provider;
      var options = { formId: "#test", url: "url", promisifiedRequest: {}}
      beforeEach( function () {
        provider = new ScrapingFormProvider();
      })
      describe("#.updateOptions()", function () {
        it("should return itself", function () {
          provider.updateOptions().should.be.equal(provider);
        })
      })
      describe("Given promisified request", function () {
        beforeEach( function () {
          options.promisifiedRequest.get = when.resolve;
          sinon.spy(options.promisifiedRequest, "get");
          provider.updateOptions(options);
        })
        describe("#.provideForm()", function () {
          var form;
          beforeEach( function () {
            form = provider.provideForm();
          })
          it("returns a promise", function () {
            form.should.have.property("then");
          })
          it("and calls `get` on promisified Request", function () {
            options.promisifiedRequest.get.should.be.called;
          })
        })
      })
    })
  })
  describe("FormSubmitter", function () {
    var submitter = form.FormSubmitter;
    var options = {};

    beforeEach( function () {
      options.formProvider = { provideForm: when.resolve };
      options.promisifiedRequest = { post: when.resolve };
      options.formValues = {name: "val"};
    })

    describe("functional", function () {
      describe("#.submitForm()", function () {
        var submitForm = submitter.submitForm;
        it("returns a promise", function () {
          submitForm(options.formValues, options.formProvider, options.promisifiedRequest).should.have.property("then");
        })
        describe("Given FormProvider And Promisified Request", function () {
          var postResponse;
          beforeEach( function () {
            options.formProvider.provideForm = function() {return when.resolve({action: "url", data: {name:""}})};
            sinon.spy(options.formProvider, "provideForm");
            sinon.spy(options.promisifiedRequest, "post");
            postResponse = submitForm(options.formValues, options.formProvider, options.promisifiedRequest);
          })
          it("should call it's .provideForm()", function () {
            options.formProvider.provideForm.should.be.called;
          })
          it("and then it should post the form", function (done) {
            postResponse.then( function () {
              options.promisifiedRequest.post.should.be.called;
            }).should.notify(done);
          })
          it("to the url that is returned from FormProvider", function (done) {
            postResponse.then( function () {
              options.promisifiedRequest.post.should.be.calledWith("url");
            }).should.notify(done);
          })
          it("with the form data from FormProvider", function (done) {
            postResponse.then( function () {
              options.promisifiedRequest.post.getCall(0).args[1].form.should.have.property("name");
            }).should.notify(done);
          })
          describe("Given formValues", function () {
            it("Then it should combine it with `data` from FormProvider", function (done) {
              postResponse.then( function () {
                options.promisifiedRequest.post.getCall(0).args[1].form.should.have.property("name", "val");
              }).should.notify(done);
            })
          })
        })
      })
    })
    describe("new instance", function () {
      var submitter;
      var options;
      beforeEach( function () {
        submitter = new form.FormSubmitter();
        options = {
          formProvider: {provideForm: function () {return when.resolve( {action: "", data: {}})} },
          promisifiedRequest: {post: when.resolve }
        };
      })
      describe("#.updateOptions()", function () {
        it("returns itself", function () {
          submitter.updateOptions().should.be.equal(submitter);
        })
      })
      describe("#.submitForm()", function () {
        beforeEach( function () {
          submitter.updateOptions(options);
        })
        it("should return a Promise", function () {
          submitter.submitForm().should.have.property("then");
        })
        describe("Given a FormProvider and a PromisedRequest", function () {
          it("a form should be requested", function (done) {
            sinon.spy(options.formProvider, "provideForm");
            submitter.submitForm().then( function () {
              options.formProvider.provideForm.should.be.called;
            }).should.notify(done);
          })
          it("and posted", function (done) {
            sinon.spy(options.promisifiedRequest, "post");
            submitter.submitForm().then( function () {
              options.promisifiedRequest.post.should.be.called;
            }).should.notify(done);
          })
        })
      })
    })
  })
})