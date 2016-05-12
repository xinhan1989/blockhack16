/*globals asset_owners_to_entries asset_to_entries sort_reversed detailAssetSellBuyValInput detailAssetSellBuyQtyInput detailAssetSellBuyButton createRow*/
/*eslint-env browser */
/* global clear_blocks */
/* global formatMoney */
/* global in_array */
/* global new_block */
/* global formatDate */
/* global nDig */
/* global randStr */
/* global bag */
/* global $ */
var ws = {};
var user = {
    username: bag.session.username,
    name: bag.session.name,
    role: bag.session.role
};
var panels = [
    {
        name: "trade",
        formID: "tradeFilter",
        tableID: "#tradesBody",
        filterPrefix: "trade_"
    },
    {
        name: "audit",
        formID: "auditFilter",
        tableID: "#auditBody",
        filterPrefix: "audit_"
    }
];

//EY <-----------------
var asset_panels = [
    {
        name: "wallet",
        formID: "walletFilter",
        tableID: "#walletsBody",
        filterPrefix: "wallet_"
    },
    {
        name: "buy",
        formID: "buyFilter",
        tableID: "#buysBody",
        filterPrefix: "buy_"
    }
];
var asset_detail_panels = [
    {
        name: "walletAsset",
        formID: "walletAssetFilter",
        tableID: "#walletAssetBody",
        filterPrefix: "walletAsset_"
    },
    {
        name: "buyAsset",
        formID: "buyFilter",
        tableID: "#buyAssetBody",
        filterPrefix: "buyAsset_"
    }
];
//EY ------------------>

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function () {
    connect_to_server();
    if (user.name) $("#userField").html(user.name.toUpperCase() + ' ');

    // Customize which panels show up for which user
    $(".nav").hide();
    console.log("user role", bag.session.user_role);

    // Only show tabs if a user is logged in
    if (user.username) {

        // Display tabs based on user's role
        if (user.role && user.role.toUpperCase() === "auditor".toUpperCase()) {
            //$("#auditLink").show();
        } else if (user.username) {
            //$("#createLink").show();
            //$("#tradeLink").show();
            $("#createassetLink").show(); 	//EY
			$("#walletLink").show();			//EY
			$("#buyLink").show();			//EY
        }
    } else {

        // Display the login and user registration links
        $("#loginLink").show();
        $("#registerLink").show();
    }

    // =================================================================================
    // jQuery UI Events
    // =================================================================================
    $("#submit").click(function () {
        if (user.username) {
            var obj = {
                type: "create",
                paper: {
                    ticker: escapeHtml($("input[name='ticker']").val()),
                    par: Number($("select[name='par']").val()),
                    qty: Number($("select[name='qty']").val()),
                    discount: Number($("select[name='discount']").val()),
                    maturity: Number($("select[name='maturity']").val()),
                    owner: [],
                    issuer: user.name,
                    issueDate: Date.now().toString()
                },
                user: user.username
            };
            if (obj.paper && obj.paper.ticker) {
                obj.paper.ticker = obj.paper.ticker.toUpperCase();
                console.log('creating paper, sending', obj);
                ws.send(JSON.stringify(obj));
                $(".panel").hide();
                $("#tradePanel").show();
            }
        }
        return false;
    });
    
    //EY <--------------------------------------------------------------------------
    //Create new property
    $("#submitasset").click(function () {
    	
        if (user.username) {
        	
        	var sId  		= user.name + Date.now().toString() + randStr(10);
        	var nQty 		= Number($("input[name='qty']").val());
        	var fMktValue	= Number($("input[name='mktValue']").val());
        	var sName 		= escapeHtml($("input[name='name']").val()).trim();
        	
        	//Quantity/Value validations
        	if (fMktValue <= 0) {
        		showErrorMessage("Market Value must be greater than zero");
        		return;
        	}
        	if (nQty <= 0) {
        		showErrorMessage("Quantity must be greater than zero");
        		return;
        	}
        	//Dont allow quantity to be greater than value to avoid small amount fractions
        	if (nQty > fMktValue) {
        		showErrorMessage("Quantity cannot be greater than Market Value");
        		return;
        	}
        	//Property name is mandatory
        	if (!sName || sName === "") {
        		showErrorMessage("Name is a mandatory parameter");
        		return;
        	}
        	
        	//PRepare asset object
            var obj = {
                type: "createasset",
                asset: {
                	cusip:		 sId.toUpperCase(),
					name:		 sName,
				    adrStreet:   escapeHtml($("input[name='adrStreet']").val()),
				    adrCity:     escapeHtml($("input[name='adrCity']").val()),
				    adrPostcode: escapeHtml($("input[name='adrPostcode']").val()),
				    adrState:    escapeHtml($("select[name='adrState']").val()),
				    quantity:    nQty, 
				    mktval:      fMktValue,
				    buyval:      fMktValue,
				    owner:       [], //The owner is being added on chaincode side
				    forsale:     [],
				    issuer:      user.name,
                    issueDate:   Date.now().toString()
                },
                user: user.username
            };
            //Submit a new asset object to blockchain
            if (obj.asset && obj.asset.name) {
                obj.asset.name = obj.asset.name.toUpperCase();
                console.log('creating asset, sending', obj);
                ws.send(JSON.stringify(obj));
                $(".panel").hide();
                $("#walletPanel").show();
            }
        }
        return false;
    });
    
    //Update Market Value
    $("#submitMktValue").click(function () {
    	
        if (user.username) {
        	
        	var sCusip = $(this).attr('data_cusip');
        	if (!sCusip) {
        		showErrorMessage("Asset ID cannot be identified. Try to refresh");
        		return;
        	}
        	var nMktValOld = Number($(this).attr('data_mktval'));
        	var nMktValNew = Number($("input[name='walletAsset-mktValueUpd']").val());
        	//Validations
        	if (nMktValOld === nMktValNew) {
        		showErrorMessage("The market value is not changed. Nothing to update");
        		return;
        	}
        	if (nMktValNew <= 0) {
        		showErrorMessage("The market value cannot be zero or negative");
        		return;
        	}
			//Prepare the object
            var obj = {
                type: "update_mktval",
                update: {
					cusip:		 sCusip,
				    mktval:      nMktValNew
                },
                user: user.username
            };
            //Send the object
            if (obj.update.cusip && obj.update.mktval) {
                console.log('update market value, sending', obj);
                ws.send(JSON.stringify(obj));
                $(".panel").hide();
                $("#walletPanel").show();
            }
        }
        return false;
    });
    
    //walletAssetSell
    $(document).on("click", ".walletAssetSell", function () {
    	
        if (user.username) {
        	
        	//Get related data from button params
        	var sCusip = $(this).attr('data_cusip');
        	var sInvId = $(this).attr('data_invid');
        	var nQuantity = $(this).attr('data_quantity');
        	var sInputName = "input[name='" + $(this).attr('input_name') + "']";
        	var nQtyForSale = Number($(sInputName).val());
        	if (!nQtyForSale || nQtyForSale <= 0 || nQtyForSale > nQuantity) {
        		showErrorMessage("Quantity to sell must be integer number beetween 1 and " + nQuantity + " inclusive");
        		return;
        	}
        	var nRemainder = nQtyForSale % 1;
        	if (nRemainder !== 0) {
        		showErrorMessage("Quantity to sell must be integer number. Fractional quantity is not supported");
        		return;
        	}
        	if (user.name !== sInvId) {
        		showErrorMessage("You can't sell property not belonging to you");
        		return;
        	}

            var obj = {
                type: "set_asset_forsale",
                forsale: {
					cusip:		 sCusip,
					fromCompany: sInvId,
				    quantity:    nQtyForSale
                },
                user: user.username
            };
            if (obj.forsale && obj.forsale.cusip) {
                console.log('set asset for sale, sending', obj);
                ws.send(JSON.stringify(obj));
                $(".panel").hide();
                $("#walletPanel").show();
            }
        }
        //return false;
    });
    
    //forsaleAssetBuy
    $(document).on("click", ".forsaleAssetBuy", function () {
    	
        if (user.username) {
        	
        	//Get related data from button params
        	var sCusip = $(this).attr('data_cusip');
        	var sInvId = $(this).attr('data_invid');
        	var nQuantity = $(this).attr('data_quantity');
        	var sInputName = "input[name='" + $(this).attr('input_name') + "']";
        	var nQtyToBuy = Number($(sInputName).val());
        	if (!nQtyToBuy || nQtyToBuy <= 0 || nQtyToBuy > nQuantity) {
        		showErrorMessage("Quantity to buy must be integer number beetween 1 and " + nQuantity + " inclusive");
        		return;
        	}
        	var nRemainder = nQtyToBuy % 1;
        	if (nRemainder !== 0) {
        		showErrorMessage("Quantity to buy must be integer number. Fractional quantity is not supported");
        		return;
        	}
        	if (user.name === sInvId) {
        		showErrorMessage("You can't buy property owned by you");
        		return;
        	}

            var obj = {
                type: "transfer_asset",
                transfer: {
					cusip:		 sCusip,
					fromCompany: sInvId,
					toCompany:	 user.name,
				    quantity:    nQtyToBuy
                },
                user: user.username
            };
            if (obj.transfer && obj.transfer.cusip) {
                console.log('transfer asset, sending', obj);
                ws.send(JSON.stringify(obj));
                $(".panel").hide();
                $("#walletPanel").show();
            }
        }
       // return false;
    });
    
    //Process change event of Qty Sell/Buy input controller
    $(document).on("keyup", ".detailAssetSellBuyQtyInput", function () {
    	
        if (user.username) {
        	
        	//Get related data from input params
        	var valInputName =  "input[name='" + $(this).attr('val_input_name') + "']";
        	var qtyTotal = $(this).attr('data_quantity');
        	var valTotal = Number($(this).attr('data_mktval'));
        	
        	//Get entered quantity
			var qtyEntered = Number($(this).val()); 
        	if (!qtyEntered || isNaN(qtyEntered) || qtyEntered < 0) {
        		qtyEntered = 0;
        	}
        	
        	//Get value input control
        	var oValInput = $(valInputName);
        	//Set calculated value
        	var nCalcVal = 0.00;
        	if (oValInput) {
        		nCalcVal = ( valTotal / qtyTotal ) * qtyEntered;
        		oValInput.val(formatMoney(nCalcVal));
        	}
        }
        //return false;
    });    
    
    //
     //forsaleAssetRevoke
    $(document).on("click", ".forsaleAssetRevoke", function () {
    	
        if (user.username) {
        	
        	//Get related data from button params
        	var sCusip = $(this).attr('data_cusip');
        	var sInvId = $(this).attr('data_invid');
        	var nQuantity = $(this).attr('data_quantity');
        	var sInputName = "input[name='" + $(this).attr('input_name') + "']";
        	var nQtyToBuy = Number($(sInputName).val());
        	if (!nQtyToBuy || nQtyToBuy <= 0 || nQtyToBuy > nQuantity) {
        		showErrorMessage("Quantity to revoke must be integer number beetween 1 and " + nQuantity + " inclusive");
        		return;
        	}
        	var nRemainder = nQtyToBuy % 1;
        	if (nRemainder !== 0) {
        		showErrorMessage("Quantity to revoke must be integer number. Fractional quantity is not supported");
        		return;
        	}
        	if (user.name !== sInvId) {
        		showErrorMessage("You can't revoke property owned by others");
        		return;
        	}

            var obj = {
                type: "transfer_asset",
                transfer: {
					cusip:		 sCusip,
					fromCompany: sInvId,
					toCompany:	 user.name,
				    quantity:    nQtyToBuy
                },
                user: user.username
            };
            if (obj.transfer && obj.transfer.cusip) {
                console.log('transfer asset, sending', obj);
                ws.send(JSON.stringify(obj));
                $(".panel").hide();
                $("#walletPanel").show();
            }
        }
        //return false;
    });  
    
    //EY -------------------------------------------------------------------------->
    
    $("#createLink").click(function () {
        $("input[name='name']").val('r' + randStr(6));
    });

    $("#tradeLink").click(function () {
        ws.send(JSON.stringify({type: "get_open_trades", v: 2, user: user.username}));
    });

    //login events
    $("#whoAmI").click(function () {													//drop down for login
        if ($("#loginWrap").is(":visible")) {
            $("#loginWrap").fadeOut();
        }
        else {
            $("#loginWrap").fadeIn();
        }
    });

    // Filter the trades whenever the filter modal changes
    $(".trade-filter").keyup(function () {
        "use strict";
        console.log("Change in trade filter detected.");
        processFilterForm(panels[0]);
    });
    $(".audit-filter").keyup(function () {
        "use strict";
        console.log("Change in audit filter detected.");
        processFilterForm(panels[1]);
    });
    //EY <-
    $(".wallet-filter").keyup(function () {
        "use strict";
        console.log("Change in wallet filter detected.");
        processFilterForm(asset_panels[0]);
    });
    //EY ->

    // Click events for the columns of the table
    $('.sort-selector').click(function () {
        "use strict";
        var sort = $(this).attr('sort');

        // Clear any sort direction arrows
        $('span').remove('.sort-indicator');

        // Clicking the column again should reverse the sort
        if(sort_papers[sort] === sort_selected) {
            console.log("Reversing the table");
            sort_reversed = !sort_reversed;
        }
        else sort_reversed = false;

        // Add the appropriate arrow to the current selector
        var arrow_icon = (sort_reversed ? 'fa-arrow-up' : 'fa-arrow-down');
        var span = document.createElement('span');
        span.classList.add('fa');
        span.classList.add(arrow_icon);
        span.classList.add('sort-indicator');
        $(this).append(span);

        // Change to the sort corresponding to that column
        sort_selected = sort_papers[sort];
        console.log("Sorting by:", sort);
        for (var i in panels) {
            build_trades(bag.papers, panels[i]);
        }
        //EY <-
        for (var i in asset_panels) {
            build_assets(bag.assets, asset_panels[i]);
        }
        //EY ->
    });

    //trade events
    $(document).on("click", ".buyPaper", function () {
        if (user.username) {
            console.log('trading...');
            var i = $(this).attr('trade_pos');
            var cusip = $(this).attr('data_cusip');
            var issuer = $(this).attr('data_issuer');

            // TODO Map the trade_pos to the correct button
            var msg = {
                type: 'transfer_paper',
                transfer: {
                    //CUSIP: bag.papers[i].cusip,
                    //fromCompany: bag.papers[i].issuer,
                    CUSIP: cusip,
                    fromCompany: issuer,
                    toCompany: user.name,
                    quantity: 1
                },
                user: user.username
            };
            console.log('sending', msg);
            ws.send(JSON.stringify(msg));
            $("#notificationPanel").animate({width: 'toggle'});
        }
    });
    
     //EY <------------------------------------------------ 
     //View Wallet Asset Details
    $(document).on("click", ".detailWalletAsset", function () {
        if (user.username) {
            console.log('wallet asset details...');
			showDetailPanel("walletasset");
			//Build data
			var sCusip = $(this).attr('data_cusip');
			if (sCusip) {
				for (var i in bag.assets) {
				
					if (bag.assets[i].cusip === sCusip) {
						build_asset_details(bag.assets[i], asset_detail_panels[0]);	
						return;
					}

				}
			}
        }
    });
    //View For Sale Asset Details
    $(document).on("click", ".detailForSaleAsset", function () {
        if (user.username) {
            console.log('for sale asset details...');
			showDetailPanel("buyasset");
			//Build data
			var sCusip = $(this).attr('data_cusip');
			if (sCusip) {
				for (var i in bag.assets) {
				
					if (bag.assets[i].cusip === sCusip) {
						build_asset_details(bag.assets[i], asset_detail_panels[1]);	
						return;
					}

				}
			}
        }
    });
    //EY -------------------------------------------->
});

// =================================================================================
// Helper Fun
// =================================================================================
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// =================================================================================
// Socket Stuff
// =================================================================================
function connect_to_server() {
    var connected = false;
    connect();

    function connect() {
        var wsUri = '';
        console.log('protocol', window.location.protocol);
        if (window.location.protocol === 'https:') {
            wsUri = "wss://" + bag.setup.SERVER.EXTURI;
        }
        else {
            wsUri = "ws://" + bag.setup.SERVER.EXTURI;
        }

        ws = new WebSocket(wsUri);
        ws.onopen = function (evt) {
            onOpen(evt);
        };
        ws.onclose = function (evt) {
            onClose(evt);
        };
        ws.onmessage = function (evt) {
            onMessage(evt);
        };
        ws.onerror = function (evt) {
            onError(evt);
        };
    }

    function onOpen(evt) {
        console.log("WS CONNECTED");
        connected = true;
        clear_blocks();
        $("#errorNotificationPanel").fadeOut();
        ws.send(JSON.stringify({type: "chainstats", v: 2, user: user.username}));
        //ws.send(JSON.stringify({type: "get_papers", v: 2, user: user.username}));
        
        //EY <-
        $("#customErrorNotificationPanel").fadeOut();
        ws.send(JSON.stringify({type: "get_assets", v: 2, user: user.username}));
        //EY ->
        
        if (user.name && user.role !== "auditor") {
            ws.send(JSON.stringify({type: 'get_company', company: user.name, user: user.username}));
        }
    }

    function onClose(evt) {
        console.log("WS DISCONNECTED", evt);
        connected = false;
        setTimeout(function () {
            connect();
        }, 5000);					//try again one more time, server restarts are quick
    }

	function onMessage(msg) {
		try {
			var data = JSON.parse(msg.data);
			console.log('rec', data);
			if (data.msg === 'papers') {
				try{
					var papers = JSON.parse(data.papers);
					//console.log('!', papers);
					if ($('#auditPanel').is){
						for (var i in panels) {
							build_trades(papers, panels[i]);
						}
					}
				}
				catch(e){
					console.log('cannot parse papers', e);
				}
			}
			//EY <-
			else if (data.msg === 'assets') {
				try{
					bag.assets = extendAssets(JSON.parse(data.assets));
					for (var i in asset_panels) {
						build_assets(bag.assets, asset_panels[i]);
					}
				}
				catch(e){
					console.log('cannot parse assets', e);
				}
			}
			//EY ->
			else if (data.msg === 'chainstats') {
				//console.log(JSON.stringify(data));
				var e = formatDate(data.blockstats.transactions[0].timestamp.seconds * 1000, '%M/%d/%Y &nbsp;%I:%m%P');
				$("#blockdate").html('<span style="color:#fff">TIME</span>&nbsp;&nbsp;' + e + ' UTC');
				var temp = {
					id: data.blockstats.height,
					blockstats: data.blockstats
				};
				new_block(temp);									//send to blockchain.js
			}
			else if (data.msg === 'company') {
				console.log("woo i'm here, lets set some account balances");
				try{
					var company = JSON.parse(data.company);
					console.log("Account balance is: ", company.cashBalance);
					$("#accountBalance1").html(formatMoney(company.cashBalance));
					$("#accountBalance2").html(formatMoney(company.cashBalance));
					$("#accountBalance").html(formatMoney(company.cashBalance));
					console.log("Set account balance");
				}
				catch(e){
					console.log('cannot parse company', e);
				}
			}
			else if (data.msg === 'reset') {
				// Ask for all available trades and information for the current company
				//ws.send(JSON.stringify({type: "get_papers", v: 2, user: user.username}));
				ws.send(JSON.stringify({type: "get_assets", v: 2, user: user.username})); //EY
				if (user.role !== "auditor") {
					ws.send(JSON.stringify({type: 'get_company', company: user.name, user: user.username}));
				}
			}
			else if (data.type === 'error') {
				console.log("Error:", data.error);
			}
		}
		catch (e) {
			console.log('ERROR', e);
			//ws.close();
		}
	}

    function onError(evt) {
        console.log('ERROR ', evt);
        if (!connected && bag.e == null) {											//don't overwrite an error message
            $("#errorName").html("Warning");
            $("#errorNoticeText").html("Waiting on the node server to open up so we can talk to the blockchain. ");
            $("#errorNoticeText").append("This app is likely still starting up. ");
            $("#errorNoticeText").append("Check the server logs if this message does not go away in 1 minute. ");
            $("#errorNotificationPanel").fadeIn();
        }
    }

    function sendMessage(message) {
        console.log("SENT: " + message);
        ws.send(message);
    }
}


// =================================================================================
//	UI Building
// =================================================================================
/**
 * Process the list of trades from the server and displays them in the trade list.
 * This function builds the tables for multiple panels, so an object is needed to
 * identify which table it should be drawing to.
 * @param papers The list of trades to display.
 * @param panelDesc An object describing what panel the trades are being shown in.
 */
function build_trades(papers, panelDesc) {

    if(!user.name)
    bag.papers = papers;						//store the trades for posterity
    //console.log('papers:', bag.papers);

    if(papers && papers.length > 0) {

        // Break the papers down into entries
        console.log('breaking papers into individual entries');
        var entries = [];
        for (var paper in papers) {
            var broken_up = paper_to_entries(papers[paper]);
            entries = entries.concat(broken_up);
        }
        console.log("Displaying", papers.length, "papers as", entries.length, "entries");

        // If no panel is given, assume this is the trade panel
        if (!panelDesc) {
            panelDesc = panels[0];
        }

        entries.sort(sort_selected);
        if (sort_reversed) entries.reverse();

        // Display each entry as a row in the table
        var rows = [];
        for (var i in entries) {
            console.log('!', entries[i]);

            if (entries[i].quantity > 0) {													//cannot buy when there are none

                if (excluded(entries[i], filter)) {
                    var style;
                    if (user.name.toLowerCase() === entries[i].owner.toLowerCase()) {
                        //cannot buy my own stuff
                        style = 'invalid';
                    }
                    else if (entries[i].issuer.toLowerCase() !== entries[i].owner.toLowerCase()) {
                        //cannot buy stuff already bought
                        style = 'invalid';
                    } else {
                        style = null;
                    }
                    
                    // Create a row for each valid trade
                    var data = [
                        formatDate(Number(entries[i].issueDate), '%M/%d %I:%m%P'),
                        entries[i].cusip,
                        escapeHtml(entries[i].ticker.toUpperCase()),
                        formatMoney(entries[i].par),
                        entries[i].quantity,
                        entries[i].discount,
                        entries[i].maturity,
                        entries[i].issuer,
                        entries[i].owner
                    ];

                    var row = createRow(data);
                    style && row.classList.add(style);

                    // Only the trade panel should allow you to interact with trades
                    if (panelDesc.name === "trade") {
                        var disabled = false
                        if (user.name.toLowerCase() === entries[i].owner.toLowerCase()) disabled = true;			//cannot buy my own stuff
                        if (entries[i].issuer.toLowerCase() !== entries[i].owner.toLowerCase()) disabled = true;
                        var button = buyButton(disabled, entries[i].cusip, entries[i].issuer);
                        row.appendChild(button);
                    }
                    rows.push(row);
                }
            }

        }

        // Placeholder for an empty table
        var html = '';
        if (rows.length == 0) {
            if (panelDesc.name === 'trade')
                html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
            else if (panelDesc.name === 'audit')
                html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'; // No action column
            $(panelDesc.tableID).html(html);
        } else {
            // Remove the existing table data
            console.log("clearing existing table data");
            var tableBody = $(panelDesc.tableID);
            tableBody.empty();


            // Add the new rows to the table
            console.log("populating new table data");
            var row;
            while (rows.length > 0) {
                row = rows.shift();
                tableBody.append(row);
            }
        }
    } else {
        if (panelDesc.name === 'trade')
            html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        else if (panelDesc.name === 'audit')
            html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'; // No action column
        $(panelDesc.tableID).html(html);
    }
}

//EY <----------------------------------------------------------------------------

/**
 * Extend Asset objects with additional data (like market value per owner)
 */
function extendAssets(aAssets) {
	
	var aAssetExt = aAssets;
	var fValRemainder = 0.00;
	var nQtyRemainder = 0;
	//Process assets received from blockchain
	for (var i=0; i < aAssetExt.length; i++) {
		
		//New attr: market value per token
		aAssetExt[i].mktvalPerToken = aAssetExt[i].mktval / aAssetExt[i].quantity;
		
		//Remainders: used to avoid any discrepancy during rounding
		fValRemainder = aAssetExt[i].mktval;
		nQtyRemainder = aAssetExt[i].quantity;
		
		//Process subsets per owner
		for (var j=0; j < aAssetExt[i].owner.length; j++) {
			//New attr: total market value per owner
			aAssetExt[i].owner[j].mktval = aAssetExt[i].mktvalPerToken * aAssetExt[i].owner[j].quantity;
			//last division subset
			if (nQtyRemainder === aAssetExt[i].owner[j].quantity) {
				aAssetExt[i].owner[j].mktval = fValRemainder;
			}
			nQtyRemainder -= aAssetExt[i].owner[j].quantity;
			fValRemainder -= aAssetExt[i].owner[j].mktval;			
		}
		
		//Process subsets for sale
		for (var k=0; k < aAssetExt[i].forsale.length; k++) {
			//New attr: total market value per sale
			aAssetExt[i].forsale[k].mktval = aAssetExt[i].mktvalPerToken * aAssetExt[i].forsale[k].quantity;
			//last division subset
			if (nQtyRemainder === aAssetExt[i].forsale[k].quantity) {
				aAssetExt[i].forsale[k].mktval = fValRemainder;
			}
			nQtyRemainder -= aAssetExt[i].forsale[k].quantity;
			fValRemainder -= aAssetExt[i].forsale[k].mktval;	
		}
	}
	return aAssetExt;
}

/**
 * Process the list of assets from the server and displays them in the wallet list..
 * This function builds the tables for multiple panels, so an object is needed to
 * identify which table it should be drawing to.
 * @param papers The list of trades to display.
 * @param panelDesc An object describing what panel the assets are being shown in.
 */
function build_assets(assets, panelDesc) {

    var totalAssetValue = 0.00;
    if(assets && assets.length > 0) {
    	
        // If no panel is given, assume this is the wallet panel
        if (!panelDesc) {
            panelDesc = asset_panels[0];
        }    	

        // Break the assets down into entries
        console.log('breaking assets into individual entries');
        var entries = [];
        for (var asset in assets) {
        	var broken_up = [];
            broken_up = asset_to_entries(assets[asset], user, panelDesc.name);
            entries = entries.concat(broken_up);
        }
        console.log("Displaying", assets.length, "assets as", entries.length, "entries");
      
        entries.sort(sort_selected);
        if (sort_reversed) entries.reverse();

        // Display each entry as a row in the table
        var rows = [];
        for (var i in entries) {
        	
            console.log('!', entries[i]);	
            
			// Add together total amount monetary value of assets (includes ForSale value as well, as it still belongs to the owner)
            totalAssetValue = totalAssetValue + entries[i].valOwned + entries[i].val4Sale; 

            if (excluded(entries[i], filter)) {

                // Create a row for each valid asset
                var data = [
                    formatDate(Number(entries[i].issueDate), '%d/%M/%Y %I:%m%P'),
                    escapeHtml(entries[i].name.toUpperCase()),
                    escapeHtml(entries[i].adrStreet),
                    escapeHtml(entries[i].adrCity),
                    escapeHtml(entries[i].adrPostcode),
                    escapeHtml(entries[i].adrState),
                    entries[i].qtyOwned,
                    formatMoney(entries[i].valOwned),
                    entries[i].qty4Sale,
                    formatMoney(entries[i].val4Sale),
                    formatMoney(entries[i].mktval),
                    entries[i].issuer];

                var row = createRow(data);
                var style = null;
                style && row.classList.add(style);

                // Only the trade panel should allow you to interact with trades
                var disabled = false;
                var button = detailAssetButton(disabled, entries[i], panelDesc.name);
                button && row.appendChild(button);
                rows.push(row);
            }
        }

        // Placeholder for an empty table
        var html = '';
        if (rows.length == 0) {
            html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
            $(panelDesc.tableID).html(html);
        } else {
            // Remove the existing table data
            console.log("clearing existing table data");
            var tableBody = $(panelDesc.tableID);
            tableBody.empty();


            // Add the new rows to the table
            console.log("populating new table data");
            var row;
            while (rows.length > 0) {
                row = rows.shift();
                tableBody.append(row);
            }
        }
    } else {
        html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        $(panelDesc.tableID).html(html);
    }
	//Display total owned value in the header line
	if (panelDesc.name === "wallet") $("#assetValue").html(formatMoney(totalAssetValue));
}


//EY <-------------
function build_asset_details(oAsset, panelDesc) {
	
	$("input[name='" + panelDesc.name + "-name']").val(oAsset.name);
	$("input[name='" + panelDesc.name + "-adrStreet']").val(oAsset.adrStreet);
	$("input[name='" + panelDesc.name + "-adrCity']").val(oAsset.adrCity);
	$("input[name='" + panelDesc.name + "-adrPostcode']").val(oAsset.adrPostcode);
	$("input[name='" + panelDesc.name + "-adrState']").val(oAsset.adrState);
	$("input[name='" + panelDesc.name + "-mktValue']").val(formatMoney(oAsset.mktval));
	$("input[name='" + panelDesc.name + "-issuer']").val(oAsset.issuer);
	$("input[name='" + panelDesc.name + "-issueDate']").val(formatDate(Number(oAsset.issueDate), '%d/%M/%Y %I:%m%P'));
	
	//Set market value for update and attributes for "Update Market Value" button to be used on click event
	if (panelDesc.name === "walletAsset") {
		$("input[name='" + panelDesc.name + "-mktValueUpd']").val(oAsset.mktval);
		var btnMktValue = document.getElementById("submitMktValue");
		if (btnMktValue) {
			btnMktValue.setAttribute('data_cusip', oAsset.cusip); 
			btnMktValue.setAttribute('data_mktval', oAsset.mktval);
		}
	}

	//Build owners/forsale table	
	if(oAsset.owner && oAsset.owner.length > 0) {
		
		// If no panel is given, assume this is the wallet panel
	    if (!panelDesc) {
	     	panelDesc = asset_detail_panels[0];
	    }  
	    
	    // Break the assets down into entries
	    console.log('breaking asset owners into individual entries');
	    var entries = [];
    	if (panelDesc.name === "walletAsset")
          	entries = asset_owners_to_entries(oAsset, user);
        else if (panelDesc.name === "buyAsset") 
			entries = asset_forsale_to_entries(oAsset, user);            	
	        
	    console.log("Displaying", entries.length, "entries");
		
		// Display each entry as a row in the table
        var rows = [];
        for (var i in entries) {
        	
            console.log('!', entries[i]);

            if (entries[i].quantity > 0) {	//cannot buy when there are none for sale

                var style = null;
                var disabled = false;
                var bRevoke = true;
                
                // Create a row for each valid asset
                var data = [
                    entries[i].invid,
                    entries[i].quantity,
                    formatMoney(entries[i].mktval)
                ];

                var row = createRow(data);
                
                //if user is investor 
            	if (user.name.toLowerCase() !== entries[i].invid.toLowerCase()) {
            		
            		if (panelDesc.name === "walletAsset") {
	                    //cannot sell not my own stuff
	                    style = 'invalid';
	                    disabled = true; 
                	} else if (panelDesc.name === "buyAsset") {
	                    //Can revoke my own stuff
	                    bRevoke = false; 
                	}

            	}
            	var valInput  = detailAssetSellBuyValInput(disabled, oAsset.cusip, entries[i].invid, panelDesc.name);
            	var valInputName = valInput.firstElementChild.getAttribute('name');
                var qtyInput  = detailAssetSellBuyQtyInput(disabled, oAsset.cusip, entries[i].invid, entries[i].quantity, entries[i].mktval, panelDesc.name, valInputName);
                var qtyInputName = qtyInput.firstElementChild.getAttribute('name');
                var button = detailAssetSellBuyButton(disabled, oAsset.cusip, entries[i].invid, entries[i].quantity, qtyInputName, panelDesc.name, bRevoke);
  
                row.appendChild(qtyInput);
                row.appendChild(valInput);
                row.appendChild(button);

                style && row.classList.add(style);
                rows.push(row);
            }
        }

        // Placeholder for an empty table
        var html = '';
        if (rows.length == 0) {
            html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';
        	$(panelDesc.tableID).html(html);
        } else {
            // Remove the existing table data
            console.log("clearing existing table data");
            var tableBody = $(panelDesc.tableID);
            tableBody.empty();

            // Add the new rows to the table
            console.log("populating new table data");
            var row;
            while (rows.length > 0) {
                row = rows.shift();
                tableBody.append(row);
            }
        }
        
    } else {
        html = '<tr><td>nothing here...</td><td></td><td></td><td></td><td></td><td></td></tr>';
        $(panelDesc.tableID).html(html);
    }
}

function showErrorMessage(sErrorMessage) {
	$("#customErrorNoticeText").html(sErrorMessage);
	$("#customErrorNotificationPanel").fadeIn();	
}

function showDetailPanel(show){
	console.log('show detail', show);
	if(show == '') show = 'wallet';							

	$(".panel").hide();
	if($("#" + show + "Panel").length == 0){
		//$("#error404").fadeIn();
	}
	else{
		$("#" + show + "Panel").fadeIn(300);
		$(".selectedNav").removeClass("selectedNav");
		$(this).addClass("selectedNav");
	}
}
		
//EY ------------------------------------------------------------------------------>


// =================================================================================
//	Helpers for the filtering of trades
// =================================================================================
var filter = {};

/**
 * Describes all the fields that describe a trade.  Used to create
 * a filter that can be used to control which trades get shown in the
 * table.
 * @type {string[]}
 */
var names = [
    "cusip",
    "ticker",
    "par",
    "qty",
    "discount",
    "maturity",
    "issuer",
    "owner",
    "company"
];

/**
 * Parses the filter forms in the UI into an object for filtering
 * which trades are displayed in the table.
 * @param panelDesc An object describing which panel
 */
function processFilterForm(panelDesc) {
    "use strict";

    var form = document.forms[panelDesc.formID];

    console.log("Processing filter form");

    console.log(form.getElementsByTagName("input"));

    // Reset the filter parameters
    filter = {};

    // Build the filter based on the form inputs
    for (var i in names) {

        // Input ID example: "trade_owner"
        var name = names[i];
        var id = panelDesc.filterPrefix + name;

        if (form[id] && form[id].value !== "") {
            filter[name] = form[id].value;
        }
    }

    console.log("New filter parameters: " + JSON.stringify(filter));
    console.log("Rebuilding paper list");
    build_trades(bag.papers, panelDesc);
}

/**
 * Validates a trade object against a given set of filters.
 * @param entry The object to be validated.
 * @param filter The filter object to validate the trade against.
 * @returns {boolean} True if the trade is valid according to the filter, false otherwise.
 */
function excluded(entry, filter) {
    "use strict";

    if (filter.owner && filter.owner !== "" && entry.owner.company.toUpperCase().indexOf(filter.owner.toUpperCase()) == -1) return false;

    if (filter.issuer && filter.issuer !== "" && entry.issuer.toUpperCase().indexOf(filter.issuer.toUpperCase()) == -1) return false;

    if (filter.ticker && filter.ticker !== "" && entry.ticker.toUpperCase().indexOf(filter.ticker.toUpperCase()) == -1) return false;

    // Must be a valid trade if we reach this point
    return true;
}

