var _ = require("underscore");
var when = require("when");
var cheerio = require("cheerio");
var nodeUrl = require("url");

var ScrapingFormProvider = function(options) {this.options = options; };

_.extend(ScrapingFormProvider, {
  provideForm: function (formId, url, pRequest) {
    var $;
    var that = this;
    return pRequest.get(url)
      .then(fetchFormDataFromHttpResponse);

    function fetchFormDataFromHttpResponse(response) {
      $ = cheerio.load(response.body);
      var formDom = $(formId);

      if (isFormAbsent(formDom))
        return when.reject(C.ERROR_FORM_IS_ABSENT);

      return when.resolve(fetchFormDataFrom(formDom));
    }

    function fetchFormDataFrom(formDom) {
      var formData = {};
      provideActionData.apply(this, [formDom, formData]);
      provideInputData(formDom, formData);

      return formData;
    }

    function isFormAbsent(formDom) {
      return formDom.length < 1;
    }

    function provideActionData(formDom, formData) {
      formData.action = nodeUrl.resolve(url, formDom.attr('action'));
    }

    function provideInputData(formDom, formData) {
      formData.data = {};

      var addDataToFormData = function(key, value) {
          formData.data[key] = value;
      };

      formDom.find("input").each( function () {
        if($(this).attr("type") === "image") {
          addDataToFormData($(this).attr("name") + '.x', "0");
          addDataToFormData($(this).attr("name") + '.y', "0");

          if ($(this).val()) {
            addDataToFormData($(this).attr("name"), $(this).val());
          }
        } else {
          addDataToFormData($(this).attr("name"), $(this).val());
        }
      });
    }
  }
})

_.extend(ScrapingFormProvider.prototype, {
  updateOptions: function (options) {
    this.options = _.extend({}, this.options, options);
    return this;
  },

  provideForm: function () {
    return ScrapingFormProvider.provideForm(this.options.formId, this.options.url, this.options.pRequest);
  }
});

var FormSubmitter = function (options) { this.options = options ? options : {}; };
_.extend(FormSubmitter, {
  submitForm: function (formValues, formProvider, pRequest) {
    return formProvider.provideForm().then( function (formData) {
      return pRequest.post(formData.action, {form: _.extend(formData.data, formValues) });
    });
  }
});

_.extend(FormSubmitter.prototype, {
  updateOptions: function (options) {
    this.options = _.extend({}, this.options, options);
    return this;
  },

  submitForm: function (formValues) {
    return FormSubmitter.submitForm(formValues, this.options.formProvider, this.options.pRequest);
  }
})
var C = {
  ERROR_FORM_IS_ABSENT: "ERROR_FORM_IS_ABSENT"
}

exports.ScrapingFormProvider = ScrapingFormProvider;
exports.FormSubmitter = FormSubmitter;
exports.fetchForm = ScrapingFormProvider.provideForm;
exports.submitForm = FormSubmitter.submitForm;

exports.provideForm = function (promiseForForm) {
  return {
    provideForm: function () { return promiseForForm }
  }
}

function createScrapingFormProvider (formId, url, pRequest) {
  return new ScrapingFormProvider({
    formId: formId,
    url: url,
    pRequest: pRequest
  });
}

exports.createScrapingFormProvider = createScrapingFormProvider;

exports.createFormSubmitter = function (formId, url, pRequest) {
  return new FormSubmitter({
    pRequest: pRequest,
    formProvider: createScrapingFormProvider(formId, url, pRequest)
  });
}