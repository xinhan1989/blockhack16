// ==================================
// Part 2 - incoming messages, look for type
// ==================================
"use strict";
var ibc = {};
var chaincode = {};
var async = require('async');

module.exports.setup = function (sdk, cc) {
    ibc = sdk;
    chaincode = cc;
};

module.exports.process_msg = function (ws, data) {

    // Must have a user to invoke chaincode
    if (!data.user || data.user === '') {
        sendMsg({type: "error", error: "user not provided in message"});
        return;
    }

    // Process the message
    console.log('message type:', data.type);
    console.log('message user:', data.user);
    if (data.type == 'create') {
        if (data.paper && data.paper.ticker) {
            console.log('!', data.paper);
            chaincode.invoke.issueCommercialPaper([JSON.stringify(data.paper)], data.user, cb_invoked);	//create a new paper (args, enrollID, callback)
        }
    }
    else if (data.type == 'get_papers') {
        chaincode.query.query(['GetAllCPs', data.user], cb_got_papers);									//(args, enrollID, callback)
    }
    else if (data.type == 'transfer_paper') {
        console.log('transfering msg', data.transfer);
        chaincode.invoke.transferPaper([JSON.stringify(data.transfer)], data.user);						//(args, enrollID, callback)
    } 
    else if (data.type == 'chainstats') {
        ibc.chain_stats(cb_chainstats);
    }
    else if (data.type == 'get_company') {
        chaincode.query.query(['GetCompany', data.company], data.user, cb_got_company);					//(args, enrollID, callback)
    }
    //EY <-------------------------------------------------------------------------
    else if (data.type == 'createasset') {
        if (data.asset && data.asset.name) {
            console.log('!', data.asset);
            chaincode.invoke.issuePropertyToken([JSON.stringify(data.asset)], data.user, cb_invoked);	//create a new asset (args, enrollID, callback)
        }
    }
    else if (data.type == 'transfer_asset') {
        console.log('transfering msg', data.transfer);
        chaincode.invoke.transferPaper([JSON.stringify(data.transfer)], data.user);						//(args, enrollID, callback)
    }
    else if (data.type == 'update_mktval') {
        console.log('updating market value msg', data.update);
        chaincode.invoke.updateMktVal([JSON.stringify(data.update)], data.user);						//(args, enrollID, callback)
    }
    else if (data.type == 'set_asset_forsale') {
        console.log('set asset for sale', data.forsale);
        chaincode.invoke.setForSale([JSON.stringify(data.forsale)], data.user);						//(args, enrollID, callback)
    }
    else if (data.type == 'get_assets') {
        chaincode.query.query(['GetAllPTYs', data.user], cb_got_assets);									//(args, enrollID, callback)
    }
    
    //Callback func returning all wallet assets
    function cb_got_assets(e, assets) {
    	
    	var bMock = false;
    	//MOCK <-
    	if (bMock) {
    		
    		var dIssueDate = Date.now().toString();
    		var sAssets = '[{'  
					+ '"cusip":			"QWERTY1234567890",' 
					+ '"name":		 	"PROPERTY_1",'
				    + '"adrStreet":   	"1/1 Street",'
				    + '"adrCity":     	"Sydney",'
				    + '"adrPostcode": 	"2000",'
				    + '"adrState":    	"NSW",'
				    + '"quantity":    	100,'
				    + '"mktval":      	800000,'
				    + '"buyval":      	0,'
				    + '"owner":       	[{'
				    + '	           			"invid":  "' + data.user + '",'
				    + '            			"quantity": 65'
				    + '             	}, {'
				    + '	           			"invid":    "user2",'
				    + '            			"quantity": 5'
				    + '             	}, {'
				    + '	           			"invid":    "user3",'
				    + '            			"quantity": 10'
				    + '             	}],'
				    + '"forsale":     	[{'
				    + '	           			"invid":  "' + data.user + '",'
                    + '             		"quantity":    5'
				    + '             	}, {'
				    + '	           			"invid":  "user2",'
                    + '             		"quantity":    12'
				    + '             	}, {'
				    + '	           			"invid":  "user3",'
                    + '             		"quantity":    3'
				    + '             	}],'
				    + '"issuer":      "' + data.user + '",'
                    + '"issueDate":   "' + dIssueDate
                + '"}]';
	    	console.log('assets', sAssets);
	    	
	        sendMsg({msg: 'assets', assets: sAssets});
	    //MOCK ->
    	
    	} else {
	    	
	        if (e != null) {
	            console.log('assets error', e);
	        }
	        else {
	            console.log('assets', assets);
	            sendMsg({msg: 'assets', assets: assets});
	        }
    	}

    }
    //EY -------------------------------------------------------------------------------------->

    function cb_got_papers(e, papers) {
        if (e != null) {
            console.log('papers error', e);
        }
        else {
            console.log('papers', papers);
            sendMsg({msg: 'papers', papers: papers});
        }
    }

    function cb_got_company(e, company) {
        if (e != null) {
            console.log('company error', e);
        }
        else {
            console.log('company', company);
            sendMsg({msg: 'company', company: company});
        }
    }

    function cb_invoked(e, a) {
        console.log('response: ', e, a);
    }

    //call back for getting the blockchain stats, lets get the block height now
    var chain_stats = {};

    function cb_chainstats(e, stats) {
        chain_stats = stats;
        if (stats && stats.height) {
            var list = [];
            for (var i = stats.height - 1; i >= 1; i--) {										//create a list of heights we need
                list.push(i);
                if (list.length >= 8) break;
            }
            list.reverse();																//flip it so order is correct in UI
            console.log(list);
            async.eachLimit(list, 1, function (key, cb) {								//iter through each one, and send it
                ibc.block_stats(key, function (e, stats) {
                    if (e == null) {
                        stats.height = key;
                        sendMsg({msg: 'chainstats', e: e, chainstats: chain_stats, blockstats: stats});
                    } else {
                        console.log("Web_Socket_Server: Chainstats failure", JSON.stringify(e));
                    }
                    cb(null);
                });
            }, function () {
            });
        }
    }

    //call back for getting a block's stats, lets send the chain/block stats
    function cb_blockstats(e, stats) {
        if (chain_stats.height) stats.height = chain_stats.height - 1;
        sendMsg({msg: 'chainstats', e: e, chainstats: chain_stats, blockstats: stats});
    }

    //call back for getting open trades, lets send the trades
    function cb_got_trades(e, trades) {
        if (e != null) console.log('error:', e);
        else {
            if (trades && trades.open_trades) {
                sendMsg({msg: 'open_trades', open_trades: trades.open_trades});
            }
        }
    }

    //send a message, socket might be closed...
    function sendMsg(json) {
        if (ws) {
            try {
                ws.send(JSON.stringify(json));
            }
            catch (e) {
                console.log('error ws', e);
            }
        }
    }
};
