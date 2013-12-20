var _ = require("underscore");
var when = require("when");
var cheerio = require("cheerio");

var ScrapingFormProvider = function() {};

_.extend(ScrapingFormProvider, {
  provideForm: function (formId, url, promisifiedRequest) {
    return promisifiedRequest.get(url)
      .then( function (response) {
        var $ = cheerio.load(response.body);
        var formDom = $(formId);

        if (formDom.length < 1)
          return when.reject("ERROR_FORM_IS_ABSENT");

        var formData = {};
        formData.action = formDom.attr('action');
        formData.data = {};
        formDom.find("input").each( function () {
          formData.data[$(this).attr("name")] = $(this).val();
        });

        return when.resolve(formData);
      });
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

exports.ScrapingFormProvider = ScrapingFormProvider;