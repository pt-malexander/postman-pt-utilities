const states = [
    "AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY",
    "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY",
    "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

function getRandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomDOB() {
    var moment = require("moment");
    var maxEpoch = moment().valueOf() - 568080000000; // subtract 18 years in milliseconds
    var dobEpoch = getRandomInRange(0, maxEpoch);
    return moment(dobEpoch).format('YYYY-MM-DD');
}

function cleanEnvironment() {
    const protectNamespaces = [
        "api",
        "webhook",
        "mike"
    ];

    var allVars = pm.environment.toObject();

    for ([key, value] of Object.entries(allVars)) {
        if ((key.indexOf(":") == -1) || protectNamespaces.includes(key.substr(0, key.indexOf(":")))) {
            console.log(`skipping ${key}: ${value}`);
        } else {
            console.log(`removing ${key}: ${value}`);
            pm.environment.unset(key);
        }
    }

}

function clearContactInfo(contactNumber = 0) {
    if (contactNumber == 0) {
        for (let idx = 0; idx < 10; idx++) {
            createContactInfo(idx, true, true, true);
        }
    } else {
        createContactInfo(contactNumber, true, true, true);
    }
}

function skipCurrentRequest(stopRunner = false) {
    pm.request.url = 'https://www.postman-echo.com/delay/0';
    pm.request.method = 'GET';

    if (stopRunner) {
        postman.setNextRequest(null);
    }
}

function createAccountInfo() {
}

function createCompanyInfo(international = false) {
    var name = pm.variables.replaceIn('{{$randomCompanyName}}');
    var email = name.replace(/\s|,|\'\./g, "") + "@mailinator.com";

    pm.environment.set("company:name", name);
    pm.environment.set("company:email", email);

    pm.environment.set("company:tax:id-number", "111" + getRandomInRange(100000, 999999));
    pm.environment.set("company:tax:country", 'US');

    pm.environment.set("company:region-of-formation", states[getRandomInRange(0, states.length - 1)]);

    pm.environment.set("company:phone:country", international ? pm.variables.replaceIn('{{$randomCountryCode}}'):'US');
    pm.environment.set("company:phone:number", international ? pm.variables.replaceIn('{{$randomPhoneNumberExt}}'):pm.variables.replaceIn('{{$randomPhoneNumber}}'));

    pm.environment.set("company:address:street-1", pm.variables.replaceIn('{{$randomStreetAddress}}'));
    pm.environment.set("company:address:street-2", "");
    pm.environment.set("company:address:postal-code", getRandomInRange(10001, 99999));
    pm.environment.set("company:address:city", pm.variables.replaceIn('{{$randomCity}}'));
    pm.environment.set("company:address:region", states[getRandomInRange(0, states.length - 1)]);
    pm.environment.set("company:address:country", 'US');
}

var Contact = Object.freeze ({
    random: 0,
    JohnJones: 1, // happy path
    Thor: 2, // Canadian DL
    JohnStearne: 3 // Canadian PP
});

var International = Object.freeze({
    NO: false,
    YES: true
});

var UpdateAddress = Object.freeze({
    NO: false,
    YES: true
});

var UpdatePhoneNumber = Object.freeze({
    NO: false,
    YES: true
});

function createDomesticContactInfo(contactNumber) { createContactInfo( contactNumber);}
function createHappyPathDomesticContactInfo(contactNumber) { createContactInfo(contactNumber,Contact.JohnJones);}
function createIntlContactInfo(contactNumber) { createContactInfo(contactNumber,Contact.random,International.YES);}
function createHappyPathIntlContactInfo(contactNumber) { createContactInfo(contactNumber,Contact.JohnJones,International.YES);}
function createThorContactInfo(contactNumber) { createContactInfo(contactNumber,Contact.Thor);}
function createStearneContactInfo(contactNumber) { createContactInfo(contactNumber,Contact.JohnStearne);}


function createContactInfo(contactNumber, contact = Contact.random, international = International.NO, updateAddress = UpdateAddress.NO, updatePhoneNumber = UpdatePhoneNumber.NO) {
    var firstName = contact == Contact.JohnJones   ? 'John' :
                    contact == Contact.Thor        ? 'Thor' :
                    contact == Contact.JohnStearne ? 'John':
                                                     pm.variables.replaceIn('{{$randomFirstName}}');
    var middleName = contact == Contact.JohnJones   ? '' :
                     contact == Contact.Thor        ? 'Hammer' :
                     contact == Contact.JohnStearne ? '' :
                                                      (Math.random() < 0.25) ? pm.variables.replaceIn('{{$randomFirstName}}') : "";
    var lastName = contact == Contact.JohnJones   ? 'Jones' :
                   contact == Contact.Thor        ? 'Odinson' :
                   contact == Contact.JohnStearne ? 'Stearne' :
                                                    pm.variables.replaceIn('{{$randomLastName}}');

    var fullName = `${firstName}`;
    if (middleName != "") {
        fullName += ` ${middleName}`;
    }
    fullName += ` ${lastName}`;

    var email = contact == Contact.JohnJones ? 'John@example.com':fullName.replace(/\s|,|\'|\./g, "") + "@mailinator.com";

    pm.environment.set(`contact:${contactNumber}:name`, fullName);
    pm.environment.set(`contact:${contactNumber}:firstname`, firstName);
    pm.environment.set(`contact:${contactNumber}:middlename`, middleName);
    pm.environment.set(`contact:${contactNumber}:lastname`, lastName);
    pm.environment.set(`contact:${contactNumber}:email`, email);
    pm.environment.set(`contact:${contactNumber}:dob`,
        contact == Contact.JohnJones   ? "1990-01-01" :
        contact == Contact.Thor        ? "1997-10-10" :
        contact == Contact.JohnStearne ? "1958-07-02" :
                                         getRandomDOB());

    var countryCode = (contact == Contact.Thor || contact == Contact.JohnStearne || international) ? "CA" : 'US';
    pm.environment.set(`contact:${contactNumber}:tax:country`, countryCode);
    pm.environment.set(`contact:${contactNumber}:tax:id-number`, "111" + getRandomInRange(100000, 999999));

    pm.environment.set(`contact:${contactNumber}:ipaddress`, pm.variables.replaceIn('{{$randomIP}}'));

    if (updateAddress) {
        createContactAddressInfo(contactNumber, countryCode, contact);
    }

    if (updatePhoneNumber) {
        createContactPhoneNumberInfo(contactNumber, countryCode);
    }
}

function createContactPhoneNumberInfo(contactNumber, countryCode = 'US') {
    pm.environment.set(`contact:${contactNumber}:phone:country`, countryCode);
    pm.environment.set(`contact:${contactNumber}:phone:number`, ( countryCode == 'US' || countryCode == 'CA') ? pm.variables.replaceIn('{{$randomPhoneNumber}}'):pm.variables.replaceIn('{{$randomPhoneNumberExt}}'));
}

function createContactAddressInfo(contactNumber, countryCode = 'US', contact = Contact.random) {
    pm.environment.set(`contact:${contactNumber}:address:street-1`,
        contact == Contact.Thor || contact == Contact.JohnStearne ? '69 Big Hammer Lane' :
        contact == Contact.JohnJones ? '123 Main St' :
        pm.variables.replaceIn('{{$randomStreetAddress}}'));
    pm.environment.set(`contact:${contactNumber}:address:street-2`, '');
    pm.environment.set(`contact:${contactNumber}:address:postal-code`,
        contact == Contact.JohnJones && countryCode == 'US' ? '12345' :
        countryCode != 'US' ? 'K1R 7Y5' :
        getRandomInRange(10001, 99999));
    pm.environment.set(`contact:${contactNumber}:address:city`,
        contact == Contact.Thor || contact == Contact.JohnStearne ? 'Ottawa' :
        contact == Contact.JohnJones && countryCode == 'US' ? 'Las Vegas' :
        pm.variables.replaceIn('{{$randomCity}}'));
    pm.environment.set(`contact:${contactNumber}:address:region`,
        contact == Contact.JohnJones && countryCode == 'US' ? 'NV' :
        countryCode != 'US' ? 'ON' :
        states[getRandomInRange(0, states.length - 1)]);
    pm.environment.set(`contact:${contactNumber}:address:country`, countryCode);
}

function createSocureInfo(contactNumber, contact = Contact.random) {
    pm.environment.set(`contact:${contactNumber}:socure:document-id`,
        contact == Contact.JohnJones   ? 'f8a0f9d6-474b-4d70-9666-f14dea8f32a0' :
        contact == Contact.Thor        ? 'f8a0f9d6-474b-4d70-9666-f14dea8f32a0' :
        contact == Contact.JohnStearne ? '7d4e9775-abe0-4fdd-8a69-203867e580ed' :
                                         pm.variables.replaceIn('{{$guid}}'));
    pm.environment.set(`contact:${contactNumber}:socure:device-id`, pm.variables.replaceIn('{{$guid}}'));
}

function createRandomUserInfo(randomizePassword = false) {
    var name = pm.variables.replaceIn('{{$randomFullName}}');
    var email = name.replace(/\s|,|\'|\./g, "") + "@mailinator.com";

    pm.environment.set("api:randomuser:name", name);
    pm.environment.set("api:randomuser:email", email);
    pm.environment.set("api:randomuser:password", randomizePassword ? pm.variables.replaceIn('{{$randomPassword}}') : 'Passw@rd1234');
}

function createQuoteInfo() {
    var assetId = pm.environment.get("quote:asset-id");
    if (assetId == null || assetId == "") {
        pm.environment.set("quote:asset-id", pm.globals.get("asset:BTC"));
    }
    var baseAmount = pm.environment.get("quote:base-amount");
    if (baseAmount == null || baseAmount == "") {
        pm.environment.set("quote:base-amount", 10000);
    }
}

function extractDataFromResponse(responseBody, relatedId = undefined, startContactIdx = 1) {
    var jsonData = JSON.parse(responseBody);
    var objectIndexes = { contactIdx: startContactIdx - 1 };

    if (jsonData.data.length == undefined) {
        extractData(jsonData.data, objectIndexes, relatedId);
    } else {
        for (let idx = 0; idx < jsonData.data.length; idx++) {
            extractData(jsonData.data[idx], objectIndexes, relatedId);
        }
    }

    for (let idx = 0; idx < jsonData.included.length; idx++) {
        extractData(jsonData.included[idx], objectIndexes, relatedId);
    }

    function extractData(data, objectIndexes, relatedId) {
        switch (data.type) {
            case "users":
                pm.environment.set("user:id", data.id);
                pm.environment.set("user:name", data.attributes.name);
                pm.environment.set("user:email", data.attributes.email);
                break;
            case "accounts":
                pm.environment.set("account:id", data.id);
                pm.environment.set("account:name", data.attributes.name);
                pm.environment.set("account:number", data.attributes.number);
                url = data.relationships["account-sub-type"].links.related
                pm.environment.set("account:sub-type-id", url.substr(url.lastIndexOf("/") + 1));
                break;
            case "organizations":
                pm.environment.set("organization:id", data.id);
                pm.environment.set("organization:name", data.attributes.label);
                break;
            case "agreement-previews":
                pm.environment.set("agreement-preview:id", data.id);
                break;
            case "contacts":
                if (data.attributes["contact-type"] == "company") {
                    pm.environment.set("company:id", data.id);
                    pm.environment.set("company:name", data.attributes.name);
                    pm.environment.set("company:email", data.attributes.email);
                    pm.environment.set("company:region-of-formation", data.attributes["region-of-formation"]);
                    pm.environment.set("company:tax:country", data.attributes["tax-country"]);
                    pm.environment.set("company:tax:id-number", data.attributes["tax-id-number"]);
                    pm.environment.set("company:tax:state", data.attributes["tax-state"]);
                } else if (data.attributes["contact-type"] == "natural_person") {
                    ++objectIndexes.contactIdx;
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:id`, data.id);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:name`, data.attributes.name);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:firstname`, data.attributes["first-name"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:middlename`, data.attributes["middle-name"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:lastname`, data.attributes["last-name"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:email`, data.attributes.email);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:dob`, data.attributes["date-of-birth"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:ipaddress`, data.attributes["ip-address"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:tax:country`, data.attributes["tax-country"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:tax:id-number`, data.attributes["tax-id-number"]);
                    pm.environment.set(`contact:${objectIndexes.contactIdx}:tax:state`, data.attributes["tax-state"]);

                    pm.environment.unset(`contact:${objectIndexes.contactIdx}:socure:document-id`)
                    pm.environment.unset(`contact:${objectIndexes.contactIdx}:socure:device-id`)

                    if (data.attributes['socure-document-id'] != undefined) {
                        pm.environment.set(`contact:${objectIndexes.contactIdx}:socure:document-id`, data.attributes['socure-document-id'])
                    }

                    if (data.attributes['socure-device-id'] != undefined) {
                        pm.environment.set(`contact:${objectIndexes.contactIdx}:socure:device-id`, data.attributes['socure-device-id'])
                    }
                } else {
                    console.warn(`unrecognized contact type: ${data.attributes["contact-type"]}`);
                }
                break;
            case "addresses":
                if (relatedId == undefined) {
                    console.warn("parsing addresses requires relatedId");
                } else {
                    let prefix = "";
                    let found = false;

                    if (pm.environment.get("company:id") == relatedId) {
                        prefix = "company:address";
                        found = true;
                    } else {
                        for (let idx = 1; idx <= 10; idx++) {
                            if (pm.environment.get(`contact:${idx}:id`) == relatedId) {
                                prefix = `contact:${idx}:address`;
                                found = true;
                                break;
                            }
                        }
                    }

                    if (found) {
                        pm.environment.set(`${prefix}:id`, data.id);
                        pm.environment.set(`${prefix}:street-1`, data.attributes["street-1"]);
                        pm.environment.set(`${prefix}:street-2`, data.attributes["street-2"]);
                        pm.environment.set(`${prefix}:city`, data.attributes.city);
                        pm.environment.set(`${prefix}:region`, data.attributes.region);
                        pm.environment.set(`${prefix}:country`, data.attributes.country);
                        pm.environment.set(`${prefix}:postal-code`, data.attributes["postal-code"]);
                    } else {
                        console.warn(`unable to find object with relatedId: ${relatedId}`);
                    }
                }
                break;
            case "phone-numbers":
                if (relatedId == undefined) {
                    console.warn("parsing phone-numbers requires relatedId");
                } else {
                    let prefix = "";
                    let found = false;

                    if (pm.environment.get("company:id") == relatedId) {
                        prefix = "company:phone";
                        found = true;
                    } else {
                        for (let idx = 1; idx <= 10; idx++) {
                            if (pm.environment.get(`contact:${idx}:id`) == relatedId) {
                                prefix = `contact:${idx}:phone`;
                                found = true;
                                break;
                            }
                        }
                    }

                    if (found) {
                        pm.environment.set(`${prefix}:id`, data.id);
                        pm.environment.set(`${prefix}:number`, data.attributes.number);
                    } else {
                        console.warn(`unable to find object with relatedId: ${relatedId}`);
                    }
                }
                break;
            case "uploaded-documents":
                if (relatedId == undefined) {
                    console.warn("parsing uploaded documents requires relatedId");
                } else {
                    let prefix = "";
                    let found = false;

                    let side = "";
                    if (data.attributes.label.includes("Back")) {
                        side = "back";
                    } else {
                        side = "front";
                    }

                    for (let idx = 1; idx <= 10; idx++) {
                        if (pm.environment.get(`contact:${idx}:id`) == relatedId) {
                            prefix = `contact:${idx}:document:${side}`;
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        pm.environment.set(`${prefix}:id`, data.id);
                    } else {
                        console.warn(`unable to find object with relatedId: ${relatedId}`);
                    }
                }
                break;
            case "kyc-document-checks":
                if (relatedId == undefined) {
                    console.warn("parsing kyc document checks requires relatedId");
                } else {
                    let prefix = "";
                    let found = false;

                    for (let idx = 1; idx <= 10; idx++) {
                        if (pm.environment.get(`contact:${idx}:id`) == relatedId) {
                            prefix = `contact:${idx}:document`;
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        pm.environment.set(`${prefix}:check:id`, data.id);
                    } else {
                        console.warn(`unable to find object with relatedId: ${relatedId}`);
                    }
                }
                break;
            case "cip-checks":
                if (relatedId == undefined) {
                    console.warn("parsing cip checks requires relatedId");
                } else {
                    let prefix = "";
                    let found = false;

                    for (let idx = 1; idx <= 10; idx++) {
                        if (pm.environment.get(`contact:${idx}:id`) == relatedId) {
                            prefix = `contact:${idx}:cip`;
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        pm.environment.set(`${prefix}:check:id`, data.id);
                    } else {
                        console.warn(`unable to find object with relatedId: ${relatedId}`);
                    }
                }
                break;
            case "aml-checks":
                if (relatedId == undefined) {
                    console.warn("parsing aml checks requires relatedId");
                } else {
                    let prefix = "";
                    let found = false;

                    for (let idx = 1; idx <= 10; idx++) {
                        if (pm.environment.get(`contact:${idx}:id`) == relatedId) {
                            prefix = `contact:${idx}:aml`;
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        pm.environment.set(`${prefix}:check:id`, data.id);
                    } else {
                        console.warn(`unable to find object with relatedId: ${relatedId}`);
                    }
                }
                break;
            case "webhook-configs":
                pm.environment.set("webhook:id", data.id);
                pm.environment.set("webhook:email", data.attributes["contact-email"]);
                pm.environment.set("webhook:url", data.attributes.url);
                pm.environment.set("webhook:secret", data.attributes["shared-secret"]);
                break;
            case "agreements":
                pm.environment.set("account:agreement:id", data.id);
                break;
            case "quotes":
                pm.environment.set("quote:id", data.id);
                pm.environment.set("quote:asset-name", data.attributes["asset-name"]);
                pm.environment.set("quote:base-amount", data.attributes["base-amount"]);
                pm.environment.set("quote:fee-amount", data.attributes["fee-amount"]);
                pm.environment.set("quote:price-per-unit", data.attributes["price-per-unit"]);
                pm.environment.set("quote:total-amount", data.attributes["total-amount"]);
                pm.environment.set("quote:unit-count", data.attributes["unit-count"]);
                break;
            case "apto-corporations":
                pm.environment.set("card:apto:id", data.id);
                pm.environment.set("card:apto:card-program-id", data.attributes["card-program-id"]);
                break;
            case "card-images":
                pm.environment.set("card:apto:card-images:id", data.id);
                break;
            case "card-designs":
                pm.environment.set("card:apto:card-designs:id", data.id);
                break;
            case "card-holders":
                pm.environment.set("card:card-holders:id", data.id);
                pm.environment.set("card:card-holders:email", data.attributes.email);
                pm.environment.set("card:card-holders:phone-number", data.attributes["phone-number"]);
                pm.environment.set("card:card-holders:verification:id", data.relationships["card-holder-verification"].links.related.slice(-36));
                break;
            case "card-holder-verifications":
                pm.environment.set("card:card-holders:verification:id", data.id);
                pm.environment.set("card:card-holders:verification:email:otp", data.attributes["email-otp"]);
                pm.environment.set("card:card-holders:verification:phone-number:otp", data.attributes["phone-number-otp"]);
                break;
            case "cash-transactions":
            case "account-statements":
            case "asset-contributions":
                break;
            case "sub-asset-transfers":
                pm.environment.set("sub-asset-transfer:id", data.id);
                pm.environment.set("sub-asset-transfer:asset:id", data.attributes["asset-id"]);
                break;
            case "asset-transfer-methods":
                pm.environment.set("asset-transfer-method:id", data.id);
                pm.environment.set("asset-transfer-method:asset-transfer-type", data.attributes["asset-transfer-type"]);
                pm.environment.set("asset-transfer-method:transfer-direction", data.attributes["transfer-direction"]);
                pm.environment.set("asset-transfer-method:wallet-address", data.attributes["wallet-address"]);
                break;
            case "asset-transfers":
                pm.environment.set("asset-transfer:id", data.id);
                break;
            case "contributions":
                pm.environment.set("contribution:id", data.id);
                pm.environment.set("contribution:amount", data.attributes.amount);
                break;
            case "funds-transfer-methods":
                pm.environment.set("funds-transfer-method:id", data.id);
                pm.environment.set("funds-transfer-method:funds-transfer-type", data.attributes["funds-transfer-type"]);
                break;
            case "funds-transfers":
                pm.environment.set("funds-transfer:id", data.id);
                break;
            case "account-cash-transfers":
                pm.environment.set("account-cash-transfer:id", data.id);
                break;
            case "push-transfer-methods":
                pm.environment.set("push-transfer-method:id", data.id);
                break;
            case "contact-funds-transfer-references":
                pm.environment.set("contact-funds-transfer-reference:id", data.id);
                pm.environment.set("contact-funds-transfer-reference:reference", data.attributes.reference);
                break;
            case "contact-denylist-entries":
                pm.environment.set(`contact-denylist-entry:${data.attributes.type}:${data.attributes.data}:id`, data.id);
                pm.environment.set(`contact-denylist-entry:${data.attributes.type}:${data.attributes.data}:type`, data.attributes.type);
                pm.environment.set(`contact-denylist-entry:${data.attributes.type}:${data.attributes.data}:data`, data.attributes.data);
                break;
            default:
                console.warn(`unhandled response data type: ${data.type}`);
                break;
        }
    }
}