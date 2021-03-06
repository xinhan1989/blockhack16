/**
 * Created by davery on 3/29/2016.
 */
/*eslint-env browser */
"use strict";

var mAssetStatus = {
	PENDING:	"Pending",
	APPROVED: 	"Approved",
	LOCKED:		"Locked"
};

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

//EY <-----------------------------------------------------
function detailAssetButton(disabled, oEntry, sPanelName) {
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data_cusip', oEntry.cusip);
    button.setAttribute('data_issuer', oEntry.issuer);
    button.disabled = disabled;
    button.classList.add('altButton');
    
    if (sPanelName === "wallet") {
    	button.classList.add('detailWalletAsset');
    } else if (sPanelName === "buy") {
    	button.classList.add('detailForSaleAsset');
    } else if (sPanelName === "approve") {
    	button.classList.add('detailApproveAsset');
    	//button.classList.add('detailWalletAsset');
    }

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

function detailAssetSellBuyButton(disabled, cusip, status, invid, quantity, sInputName, sPanelName, bRevoke) {
	
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data_cusip', cusip);
    button.setAttribute('data_status', status);
    button.setAttribute('data_invid', invid);
    button.setAttribute('data_quantity', quantity);
    button.setAttribute('input_name', sInputName);
    button.disabled = disabled;
    button.classList.add('altButton');

    var span = document.createElement('span');
    span.classList.add('fa');
    
    if (sPanelName === "walletAsset") {
    	
		button.classList.add('walletAssetSell');    	
		span.innerHTML = ' &nbsp;&nbsp;SELL';
		span.classList.add('fa-sign-out');
		
    } else if (sPanelName === "buyAsset") {
    	
    	if (!bRevoke) {
			button.classList.add('forsaleAssetBuy');    	
			span.innerHTML = ' &nbsp;&nbsp;BUY';
			span.classList.add('fa-sign-in');
		} else {
			button.classList.add('forsaleAssetRevoke');    	
			span.innerHTML = ' &nbsp;&nbsp;REVOKE';
			span.classList.add('fa-undo');
		}
    }
    
    button.appendChild(span);

    // Wrap the buy button in a td like the other items in the row.
    var td = document.createElement('td');
    td.appendChild(button);

    return td;
}

function detailAssetSellBuyQtyInput(disabled, cusip, invid, quantity, mktval, sPanelName, sValInputName) {
	
    var input = document.createElement('input');
    var sName = "detailAssetSellBuyQtyInput" + sPanelName + cusip + invid;
    input.setAttribute('type', 'number');
    input.setAttribute('name', sName);
    input.setAttribute('min', 1);
    input.setAttribute('max', quantity);
    input.setAttribute('val_input_name', sValInputName);
    input.setAttribute('data_quantity', quantity);
    input.setAttribute('data_mktval', mktval);
    input.disabled = disabled;
    
    input.classList.add('detailAssetSellBuyQtyInput');   

    // Wrap the control in a td like the other items in the row.
    var td = document.createElement('td');
    td.appendChild(input);

    return td;
}

function detailAssetSellBuyValInput(disabled, cusip, invid, sPanelName) {
	
    var input = document.createElement('input');
    var sName = "detailAssetSellBuyValInput" + sPanelName + cusip + invid;
    input.setAttribute('name', sName);
    input.disabled = disabled;
    
    //Make it editable for wallet asset, to let owner set his sale price
    if (sPanelName !== "walletAsset") {
    	input.setAttribute('readonly', 'true');
    	input.setAttribute('type', 'text');
	} else {
		input.setAttribute('type', 'number');
	}

    // Wrap the control in a td like the other items in the row.
    var td = document.createElement('td');
    td.appendChild(input);

    return td;
}

function asset_owners_to_entries(asset, oUser) {
	
    var entries = [];
 	//Quantity owned by the user
    for(var i=0; i < asset.owner.length; i++ ) {
    	
          // Create a row for each valid asset
	    if ( asset.owner[i].quantity > 0) {
	        var entry = {
	            invid: 			asset.owner[i].invid,
	            quantity: 		asset.owner[i].quantity,
	            mktval:			asset.owner[i].mktval
	        };
	
	        entries.push(entry);
	    }
	}
    return entries;
}

function asset_forsale_to_entries(asset, oUser) {
	
    var entries = [];
 	//Quantity owned by the user
    for(var i=0; i < asset.forsale.length; i++ ) {
    	
          // Create a row for each valid asset
	    if ( asset.forsale[i].quantity > 0) {
	        var entry = {
	            invid: 			asset.forsale[i].invid,
	            quantity: 		asset.forsale[i].quantity,
	            mktval:			asset.forsale[i].quantity * asset.forsale[i].sellval //asset.forsale[i].mktval
	        };
	
	        entries.push(entry);
	    }
	}
    return entries;
}

function asset_to_entries(asset, oUser, sPanelName) {
	
    var entries = [];
    var qtyOwned = 0;
    var qty4Sale = 0;
    var valOwned = 0.0;
    var val4Sale = 0.0;
    var bValid = false;
 	//Quantity owned by the user
    for(var i=0; i < asset.owner.length; i++ ) {
      if ( asset.owner[i].invid === oUser.name ) {
      	qtyOwned += asset.owner[i].quantity;
      	valOwned += asset.owner[i].mktval;
      }
    }
    //Quantity selected for sale by the user
    for(var i=0; i < asset.forsale.length; i++ ) {
        if (sPanelName === "wallet") {
    		if ( asset.forsale[i].invid === oUser.name ) {
    			qty4Sale += asset.forsale[i].quantity;
    			val4Sale += asset.forsale[i].quantity * asset.forsale[i].sellval;
			}	
    	} else if (sPanelName === "buy" || sPanelName === "approve") {
    		qty4Sale += asset.forsale[i].quantity;
    		val4Sale += asset.forsale[i].quantity * asset.forsale[i].sellval;
		}
    }
    bValid = (sPanelName === "wallet" && (qtyOwned > 0 || qty4Sale > 0)) || 
    		 (sPanelName === "buy" && qty4Sale > 0) ||
    		 (sPanelName === "approve" && asset.status !== mAssetStatus.APPROVED);
    // Create a row for each valid asset
    if (bValid) {
        var entry = {
            issueDate: 		asset.issueDate,
            cusip: 			asset.cusip,
            name: 			asset.name,
            adrStreet: 		asset.adrStreet,
            adrCity: 		asset.adrCity,
            adrPostcode: 	asset.adrPostcode,
            adrState: 		asset.adrState,
            mktval: 		asset.mktval,
            buyval: 		asset.buyval,
            quantity:		asset.quantity,
            mktvalPerToken:	asset.mktvalPerToken,
            qtyOwned: 		qtyOwned,
            valOwned:		valOwned,
            qty4Sale: 		qty4Sale,
            val4Sale:		val4Sale,
            issuer: 		asset.issuer
        };

        entries.push(entry);
    }

    return entries;
}
//EY -------------------------------------------------->
