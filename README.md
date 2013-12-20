Form Scraper - Scrape & Submit forms Easily...
==============================================

The easiest way to fill forms from Node.JS

## What's in Form Scraper for me?

### The Problem

Sometimes you need to automate your form filling. However, the website that hosts the form, seeds some security tokens
in the form. The security tokens are random and attached to your current session.

### The Solution

You need to scrape the form first, including all the default values. Afterwards, you'll need to fill the details and
submit the form.

`form-scraper` automates all the process.

## Installation

    $ npm install form-scraper

or add `form-scraper` to your `package.json` dependencies.

## Usage

You can use `form-scraper` both in functional and object oriented way.

### Functional usage

#### .fetchForm(formId, url, promisifiedRequest)

Fetches a form with `formId` from the specified url.

##### - arguments

* `formId` - the `id` property of a form in a given html. Should be prefixed with "#".
* `url` - The url that hosts the form.
* `promisifiedRequest` - The `request` object (which returns promise) that performs the request.

##### - return value

The return value is a `Promise` which eventually should resolve to a JSON object with the following properties:

* `action` - The url where the form should be submitted to.
* `data` - A JSON hash object where the `keys` are the `name` properties of the form elemnts and the `value`
 is the default value.

#### .provideForm(promiseForForm)

Creates an object that implements the `provideForm` method.

##### - arguments

* `promiseForForm` - a JSON object that represents the form.

##### - return value

The return value is an object that implements the `provideForm` method.

#### .submitForm(formValues, formProvider, promisifiedRequest)

Submits the form...

##### - arguments

* `formValues` - a JSON hash object where the `keys` represent the property names and the `values` is the data to post.
* `formProvider` - An object that implements the `provideForm()` method and returns a Promise for form.
* `promisifiedRequest` - The `request` object (which returns promise) that performs the request.

##### - return value

The return value is a `Promise` which eventually should resolve to the `response` of the submission of the form.

#### example

```javascript
var pRequest = require("promisified-request").create();
var fScraper = require("form-scraper");

var formStructure = fScraper.fetchForm("#login", "http://www.someurl.com", pRequest);
var loginDetails = { user: "my user", password: "my password" };

fScraper.submitForm(loginDetails, fScraper.provideForm(formStructure), pRequest).then( function (response) {
    console.log(response.body);
};
```

### Object Oriented usage

As of today, the module consists of two classes:

* `form-scraper.ScrapingFormProvider` - Scrapes the form.
* `form-scraper.FormSubmitter` - Submits the form.

#### ScrapingFormProvider

##### .updateOptions(options)

Extends the current options. The default value is undefined, so it's important to inject the dependencies using this
method.

Returns itself.

The `options` argument, should have the following values:

* `formId` - The `id` of the Dom element that represents the form to scrape.
* `url` - The url that hosts the form.
* `promisifiedRequest` - The `request` object that will perform the scraping.

##### .provideForm()

Returns a promise that eventually will be resolved to the form structure.

#### FormSubmitter

##### .updateOptions(options)

Extends the current options. The default value is undefined, so it's important to inject the dependencies using this
method.

Returns itself.

The `options` argument, should have the following values:

* `formProvider` - An object that implements `provideForm()` and returns a promise for a form.
* `promisifiedRequest` - The `request` object that will perform the submission.

##### .submitForm(formValues)

Submits the form with `formValues`.

`formValues` is a hash JSON object with values to post.

It returns a promise that eventually will be resolved to the `response` object that comes out of the `request` object.

#### example

```javascript
var pRequest = require("promisified-request").create();
var fScraper = require("form-scraper");

var loginDetails = { user: "my user", password: "my password" };

var formProvider = new fScraper.ScrapingFormProvider();
var formSubmitter = new fScraper.FormSubmitter();

formProvider.updateOptions({
    formId: "#login",
    url: "http://www.somedomain.com",
    promisifiedRequest: pRequest
});

formSubmitter
    .updateOptions({
        formProvider: formProvider,
        promisifiedRequest: pRequest
    })
    .submitForm(loginDetails)
        .then(function(response) {
            console.log(response.body);
        });
```