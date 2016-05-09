/**
 * Created by davery on 3/29/2016.
 */
"use strict";

function createRow(data) {
    var tr = document.createElement('tr');

    for (var index in data) {
        var td = document.createElement('td');
        tr.appendChild(td);

        var text = document.createTextNode(data[index]);
        td.appendChild(text);
    }

    return tr;
}

/**
 * Generates a buy button cell that users can click to purchase commercial paper.
 * @param disabled True if the button should be disabled, false otherwise.
 * @param cusip The cusip for the paper that this button is assigned to.
 * @param issuer The issuer of the paper that this button is assigned to.
 * @returns {Element} A table cell with a configured buy button.
 */
function buyButton(disabled, cusip, issuer) {
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data_cusip', cusip);
    button.setAttribute('data_issuer', issuer);
    if(disabled) button.disabled = true;
    button.classList.add('buyPaper');
    button.classList.add('altButton');

    var span = document.createElement('span');
    span.classList.add('fa');
    span.classList.add('fa-exchange');
    span.innerHTML = ' &nbsp;&nbsp;BUY 1';
    button.appendChild(span);

    // Wrap the buy button in a td like the other items in the row.
    var td = document.createElement('td');
    td.appendChild(button);

    return td;
}

function paper_to_entries(paper) {
    var entries = [];
    for (var owner in paper.owner) {
        // Create a row for each valid trade
        var entry = {
            issueDate: paper.issueDate,
            cusip: paper.cusip,
            ticker: paper.ticker,
            par: paper.par,
            quantity: paper.owner[owner].quantity,
            discount: paper.discount,
            maturity: paper.maturity,
            issuer: paper.issuer,
            owner: paper.owner[owner].company
        };

        // Save which paper this is associated with
        entry.paper = paper;
        
        entries.push(entry);
    }
    return entries;
}

//EY <-
function walletAssetButton(disabled, cusip, issuer) {
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data_cusip', cusip);
    button.setAttribute('data_issuer', issuer);
    if(disabled) button.disabled = true;
    button.classList.add('walletAssetDetails');
    button.classList.add('altButton');

    var span = document.createElement('span');
    span.classList.add('fa');
    span.classList.add('fa-eye');
    span.innerHTML = ' &nbsp;&nbsp;DETAILS';
    button.appendChild(span);

    // Wrap the buy button in a td like the other items in the row.
    var td = document.createElement('td');
    td.appendChild(button);

    return td;
}

function wallet_asset_to_entries(asset, oUser) {
	
    var entries = [];
    var qtyOwned = 0;
    var qty4Sale = 0;
 	//Quantity owned by the user
    for(var i=0; i < asset.owner.length; i++ ) {
      if ( asset.owner[i].invid === oUser.name ) {
      	qtyOwned = qtyOwned + asset.owner[i].quantity;
      }
    }
    //Quantity selected for sale by the user
    for(var i=0; i < asset.forsale.length; i++ ) {
      if ( asset.forsale[i].invid === oUser.name ) {
      	qty4Sale = qty4Sale + asset.forsale[i].quantity;
      }
    }
    // Create a row for each valid asset
    if ( qtyOwned > 0 || qty4Sale > 0) {
        var entry = {
            issueDate: asset.issueDate,
            cusip: asset.cusip,
            name: asset.name,
            adrStreet: asset.adrStreet,
            adrCity: asset.adrCity,
            adrPostcode: asset.adrPostcode,
            adrState: asset.adrState,
            mktval: asset.mktval,
            buyval: asset.buyval,
            qtyOwned: qtyOwned,
            qty4Sale: qty4Sale,
            issuer: asset.issuer,
            owner: oUser.name
        };

        // Save which asset this is associated with
        entry.asset = asset;
        entries.push(entry);
    }

    return entries;
}

function buy_asset_to_entries(asset, oUser) {
	
    var entries = [];
    var qtyOwned = 0;
    var qty4Sale = 0;
 	//Quantity owned by the user
    for(var i=0; i < asset.owner.length; i++ ) {
      if ( asset.owner[i].invid === oUser.name ) {
      	qtyOwned = qtyOwned + asset.owner[i].quantity;
      }
    }
    //Quantity selected for sale by the user
    for(var i=0; i < asset.forsale.length; i++ ) {
      if ( asset.forsale[i].invid === oUser.name ) {
      	qty4Sale = qty4Sale + asset.forsale[i].quantity;
      }
    }
    // Create a row for each valid asset
    if ( qtyOwned > 0 || qty4Sale > 0) {
        var entry = {
            issueDate: asset.issueDate,
            cusip: asset.cusip,
            name: asset.name,
            adrStreet: asset.adrStreet,
            adrCity: asset.adrCity,
            adrPostcode: asset.adrCity,
            adrState: asset.adrState,
            mktval: asset.mktval,
            buyval: asset.buyval,
            qtyOwned: qtyOwned,
            qty4Sale: qty4Sale,
            issuer: asset.issuer,
            owner: oUser.name
        };

        // Save which asset this is associated with
        entry.asset = asset;
        entries.push(entry);
    }

    return entries;
}
//EY ->
