var _ = require("underscore");
var when = require("when");
var cheerio = require("cheerio");

var ScrapingFormProvider = function() {};

_.extend(ScrapingFormProvider, {
  provideForm: function (formId, url, promisifiedRequest) {
    var $;
    return promisifiedRequest.get(url)
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
      provideActionData(formDom, formData);
      provideInputData(formDom, formData);

      return formData;
    }

    function isFormAbsent(formDom) {
      return formDom.length < 1;
    }

    function provideActionData(formDom, formData) {
      formData.action = formDom.attr('action');
    }

    function provideInputData(formDom, formData) {
      formData.data = {};
      formDom.find("input").each( function () {
        formData.data[$(this).attr("name")] = $(this).val();
      });
    }
  }
})

_.extend(ScrapingFormProvider.prototype, {
  updateOptions: function (options) {
    this.options = _.extend({}, this.options, options);
    return this;
  }
});

var testOptions = {
  promisifiedRequest: "",
  formUrl: "",
  formId: ""
}

var C = {
  ERROR_FORM_IS_ABSENT: "ERROR_FORM_IS_ABSENT"
}

exports.ScrapingFormProvider = ScrapingFormProvider;