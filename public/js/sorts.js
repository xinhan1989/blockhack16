/**
 * Created by davery on 3/29/2016.
 */
"use strict";

var sort_assets = {
    date: function(a, b) {
        var dateA = a.issueDate;
        var dateB = b.issueDate;
        return compare(dateA, dateB);
    },
    cusip: function(a, b) {
        var textA = a.cusip.toUpperCase();
        var textB = b.cusip.toUpperCase();
        return compare(textA, textB);
    },
    name: function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return compare(textA, textB);
    },
    adrStreet: function(a, b) {
        var textA = a.adrStreet.toUpperCase();
        var textB = b.adrStreet.toUpperCase();
        return compare(textA, textB);
    },
    adrCity: function(a, b) {
        var textA = a.adrCity.toUpperCase();
        var textB = b.adrCity.toUpperCase();
        return compare(textA, textB);
    },
    adrPostcode: function(a, b) {
        return compare(a.adrPostcode, b.adrPostcode);
    },
    adrState: function(a, b) {
        var textA = a.adrState.toUpperCase();
        var textB = b.adrState.toUpperCase();
        return compare(textA, textB);
    },
    quantity: function(a, b) {
        return compare(a.quantity, b.quantity);
    },
    qtyOwned: function(a, b) {
        return compare(a.qtyOwned, b.qtyOwned);
    },
    qty4Sale: function(a, b) {
        return compare(a.qty4Sale, b.qty4Sale);
    },
    issuer: function(a, b) {
        var issuerA = a.issuer.toUpperCase();
        var issuerB = b.issuer.toUpperCase();
        return compare(issuerA, issuerB);
    },
    status: function(a, b) {
        var ownerA = a.status.toUpperCase();
        var ownerB = b.status.toUpperCase();
        return compare(ownerA, ownerB);
    }
};

//var sort_selected = sort_assets.date;
//var sort_reversed = true;

function compare(a, b) {
    return (a < b) ? -1 : (a > b) ? 1 : 0;
}