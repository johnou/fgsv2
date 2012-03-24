FGS.database.createTable = function()
{
	var arr = [
		
		{query: 'CREATE TABLE IF NOT EXISTS options (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, option LONGTEXT)'},
		{query: FGS.squel.insert({ignore: true}).into('options').set('id', 1).set('option', '{}')},
		{query: 'CREATE TABLE IF NOT EXISTS ' + 
			  'bonuses (id TEXT PRIMARY KEY ASC, gameID INTEGER, status INTEGER, error TEXT, title TEXT, text TEXT, image TEXT, url TEXT, time INTEGER, feedback TEXT, link_data TEXT, like_bonus INTEGER, comment_bonus INTEGER, resend_gift TEXT, error_text TEXT)'},
		{query: 'CREATE TABLE IF NOT EXISTS ' + 
			  'neighborStats (userID INTEGER, gameID INTEGER, lastBonus INTEGER,  lastGift INTEGER, totalBonuses INTEGER, totalGifts INTEGER, lastGiftSent INTEGER, totalGiftsSent INTEGER, PRIMARY KEY(userID, gameID))'},
		{query: 'ALTER TABLE neighborStats ADD COLUMN lastGiftSent INTEGER', log: false},
		{query: 'ALTER TABLE neighborStats ADD COLUMN totalGiftsSent INTEGER', log: false},
		{query: 'ALTER TABLE bonuses ADD COLUMN comment_bonus INTEGER', log: false},
		{query: 'ALTER TABLE bonuses ADD COLUMN resend_gift TEXT', log: false},
		{query: 'ALTER TABLE bonuses ADD COLUMN error_text TEXT', log: false},
		{query: FGS.squel.update().table('neighborStats').set('lastGiftSent', 0).where('lastGiftSent', null)},
		{query: FGS.squel.update().table('neighborStats').set('totalGiftsSent', 0).where('totalGiftsSent', null)},
		{query: 'CREATE TABLE IF NOT EXISTS ' + 
			'requests(id TEXT PRIMARY KEY ASC, gameID INTEGER, status INTEGER, error TEXT, title TEXT, text TEXT, image TEXT, post TEXT, time INTEGER, resend_gift TEXT, error_text TEXT)'},
		{query: 'ALTER TABLE requests ADD COLUMN resend_gift TEXT', log: false},
		{query: 'ALTER TABLE requests ADD COLUMN error_text TEXT', log: false},
		{query: 'CREATE TABLE IF NOT EXISTS ' + 
			  'freegifts(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, gameID INTEGER, friend TEXT, gift TEXT, time INTEGER, is_thank_you INTEGER)'},
		{query: 'ALTER TABLE freegifts ADD COLUMN is_thank_you INTEGER', log: false}
	];
	
	FGS.database.query(arr, function() {
		
		FGS.databaseAlreadyOpen = true;
		
		if(FGS.optionsLoaded == false)
		{
			FGS.loadOptions(FGS.userID);
		}
	});
};

FGS.database.query = function(queriesArr, callback, callbackOpt)
{
	if(typeof(queriesArr)=='string') {
		queriesArr = [{query: queriesArr}];
	} else if(typeof(queriesArr)=='object'&& !(queriesArr instanceof Array)) {
		queriesArr = [queriesArr];
	}
	
	if(FGS.browser == 'chrome') {
		this.db.transaction(function(tx)
		{
			tx.results = [];
			
			function nextQuery(trans) {
				if(queriesArr.length == 0) {
					if(typeof callback != 'undefined')
						callback(trans.results, callbackOpt);
					return;
				}
				
				var i = 0;
				var query,arr;
				
				query = queriesArr[i].query;
				
				if(typeof query === 'object') {
					arr = query.getParams();
					query = query.toString();
				}
				else {
					arr = queriesArr[i].params || [];	
				}
				
				var qCallback = queriesArr[i].callback || false;
				var qLogError = (typeof queriesArr[i].log === 'undefined' || queriesArr[i].log === true ? true : false);
				var qCallbackOpt = queriesArr[i].callbackOpt || [];
				
				queriesArr = queriesArr.slice(1);
				
				console.log(query, arr);
				
				trans.executeSql(query, arr, function(tx, res)	{
					var result = {success: true, params: qCallbackOpt, query: query, query_params: arr};
					
					var res2 = [];
					
					try {
						if(res.insertId) {
							result['newId'] = res.insertId;
						}
					} catch(e) {}
					
					for(var i=0;i<res.rows.length;i++)
						res2.push(res.rows.item(i));
					
					result['result'] = res2;
					
					if(typeof callback != 'undefined') {
						tx.results.push(result);
					}
					
					if(qCallback) {
						qCallback(result);
					}
					
					nextQuery(tx);
				},
				function(tx,e) 
				{
					var result = {success: false, error: e.message, result: [], params: qCallbackOpt, query: query, query_params: arr};
					
					if(typeof callback != 'undefined')
						tx.results.push(result);

					if(qCallback)
						qCallback(result);

					if(qLogError)
						FGS.dump(e.message);
					
					nextQuery(tx);
				});
			}
			
			nextQuery(tx);
		});
	} else {
			var results = [];
			
			function nextQuery() {
				if(queriesArr.length == 0) {
					if(typeof callback != 'undefined')
						callback(results, callbackOpt);
					return;
				}
				
				var i = 0;
				var query,arr;
				
				query = queriesArr[i].query;
				
				if(typeof query === 'object') {
					arr = query.getParams();
					query = query.toString();
				}
				else {
					arr = queriesArr[i].params || [];	
				}

				var qCallback = queriesArr[i].callback || false;
				var qLogError = (typeof queriesArr[i].dontLog === 'undefined' || queriesArr[i].dontLog === false ? true : false);
				var qCallbackOpt = queriesArr[i].callbackOpt;
				
				queriesArr = queriesArr.slice(1);
				

				try 
				{
					var stmt = FGS.database.db.createStatement(query);
					


					for(var j=0;j<arr.length;j++) {
						stmt.bindStringParameter(j, arr[j]);
					}
					

					stmt.executeAsync({
						results: [],
						handleResult: function(aResultSet) 
						{
							for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow())
							{
								var res = {};
								



								for(var i = 0;i<stmt.columnCount; i++) {
									res[stmt.getColumnName(i)] = row.getResultByIndex(i);
								}

								this.results.push(res);
							}
						},



						handleCompletion: function(aReason) 
						{
							var result = {success: true, params: qCallbackOpt, query: query, query_params: arr};
							
							result['result'] = this.results;
							
							if(typeof callback != 'undefined') {
								results.push(result);
							}
							
							if(qCallback) {
								qCallback(result);
							}
							
							nextQuery();



						}
					});
					
					
				} catch(e) {
					var result = {success: false, error: e.message, result: [], params: qCallbackOpt, query: query, query_params: arr};
					
					if(typeof callback != 'undefined')
						results.push(result);

					if(qCallback)
						qCallback(result);

					if(qLogError)
						FGS.dump(e);
					
					nextQuery();

				}
			}

			nextQuery();
	}
};