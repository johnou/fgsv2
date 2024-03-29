FGS.poker.Freegifts = 
{
	Click: function(params, retry)
	{
		var $ = FGS.jQuery;
		var retryThis 	= arguments.callee;
		var addAntiBot = (typeof(retry) == 'undefined' ? '' : '');

		$.ajax({
			type: "GET",
			url: 'https://apps.facebook.com/texas_holdem/'+addAntiBot,
			dataType: 'text',
			success: function(dataStr)
			{
				try
				{
					var pos1 = dataStr.indexOf('app_2389801228.context');
					var pos2 = dataStr.indexOf('\\\\\\"', pos1);
					var pos3 = dataStr.indexOf('\\\\\\"', pos2+3);
					
					var fb_mock_hash = dataStr.slice(pos2+4,pos3);
					
					var pos1 = dataStr.indexOf('app_2389801228.contextd', pos1);
					var pos2 = dataStr.indexOf('\\\\\\"', pos1);
					var pos3 = dataStr.indexOf('}\\\\\\"', pos2+3);
					
					var fb_mock = dataStr.slice(pos2+4,pos3+1).replace(/\\/g, '').replace(/\\/g, '');
					
					params.postData =
					{
						url: 'https://facebook2.poker.zynga.com/poker/inc/ajax/todo_send_chip.php?box=0',
						type:1,
						require_login:true,
						fb_mockajax_context: fb_mock,
						fb_mockajax_context_hash: fb_mock_hash,
						appid: '2389801228',
						fb_dtsg: FGS.fb_dtsg,
						post_form_id: FGS.post_form_id,
						lsd:'',
						post_form_id_source: 'AsyncRequest'
					}
					
					FGS.poker.Freegifts.Click2(params);
				}
				catch(err)
				{
					FGS.dump(err);
					FGS.dump(err.message);
					if(typeof(retry) == 'undefined')
					{
						retryThis(params, true);
					}
					else
					{
						if(typeof(params.sendTo) == 'undefined')
						{
							FGS.sendView('updateNeighbors', false, params.gameID);
						}
						else
						{
							FGS.sendView('errorWithSend', params.gameID, (typeof(params.thankYou) != 'undefined' ? params.bonusID : '') );
						}
					}
				}
			},
			error: function()
			{
				if(typeof(retry) == 'undefined')
				{
					retryThis(params, true);
				}
				else
				{
					if(typeof(params.sendTo) == 'undefined')
					{
						FGS.sendView('updateNeighbors', false, params.gameID);
					}
					else
					{
						FGS.sendView('errorWithSend', params.gameID, (typeof(params.thankYou) != 'undefined' ? params.bonusID : '') );
					}
				}
			}
		});
	},
	
	Click2: function(params, retry, isCallback)
	{
		var $ = FGS.jQuery;
		var retryThis 	= arguments.callee;

		if(typeof isCallback != 'undefined')
		{
			var obj = isCallback;
			var dataStr = obj.data;
			
			if(obj.success)
			{
				try
				{
					var str = dataStr.substring(9);
					
					var str2 = JSON.parse(str).error;			
					
					if(typeof(str2) != 'undefined')
					{
						FGS.sendView('errorWithSend', params.gameID, (typeof(params.thankYou) != 'undefined' ? params.bonusID : '') );
						return;
					}
					
					var x = JSON.parse(str);
					
					var data = x.payload.data.fbml_form0;

					var arr = [];
					
					var dataHTML = FGS.HTMLParser(data);
					
					$('.unselected_list', dataHTML).children('label').each(function()
					{
						var itm = {}
						itm[$(this).children('input').val()] = {name: $(this).children('span').text()};
						arr.push(itm);
					});
					
					if(typeof(params.sendTo) == 'undefined')
					{
						FGS.dump(FGS.getCurrentTime()+'[Z] Updating neighbours');
						FGS.sendView('updateNeighbors', arr, params.gameID);
						return;
					}
								

					var reqData =
					{
						prefill: true,
						message: '',
						preview: false,
						donot_send: false,
						__d: 1,
						post_form_id: FGS.post_form_id,
						fb_dtsg: FGS.fb_dtsg,
						post_form_id_source: 'AsyncRequest',
						lsd: ''
					}
				
					var tst = new RegExp(/PlatformInvite.sendInvitation.*(\&#123.*.?125;)[(\(;)]/g).exec(data);
					if(tst == null) throw {message:'no api_key tag'}
					var reqData2 = JSON.parse(tst[1].replace(/&quot;/g,'"').replace(/&#123;/g,'{').replace(/&#125;/g,'}'));
					
					$.extend(reqData, reqData2);
					reqData.form_id = reqData2.request_form;
					delete(reqData.request_form);
					
					var tst = new RegExp(/<form[^>].*content=\s*["]([^"]+)[^>]*>/gm).exec(data);
					if(tst == null) throw {message:'no content'}
					
					reqData.content = tst[1];
					reqData.prefill = true;

					params.items = arr;
					
					var sendGiftParams = $('form[type]', dataHTML).serialize();
					
					$(params.sendTo).each(function(k,v)
					{
						reqData['to_ids['+k+']'] = v;
						
						if(params.gameID == '120563477996213')
							sendGiftParams += 'ids[]='+v+'&';
						else
							sendGiftParams += '&ids%5B%5D='+v;
					});
					
					params.promptParams = reqData;
					params.sendGiftUrl = 'https://apps.facebook.com/texas_holdem/requests/chipgift/chipgift_post.php';
					params.sendGiftParams = sendGiftParams;
					
					FGS.sendGift(params);
				}
				catch(err)
				{
					FGS.dump(err);
					FGS.dump(err.message);
					if(typeof(retry) == 'undefined')
					{
						retryThis(params, true);
					}
					else
					{
						if(typeof(params.sendTo) == 'undefined')
						{
							FGS.sendView('updateNeighbors', false, params.gameID);
						}
						else
						{
							FGS.sendView('errorWithSend', params.gameID, (typeof(params.thankYou) != 'undefined' ? params.bonusID : '') );
						}
					}
				}
			}
			else
			{
				if(typeof(retry) == 'undefined')
				{
					retryThis(params, true);
				}
				else
				{
					if(typeof(params.sendTo) == 'undefined')
					{
						FGS.sendView('updateNeighbors', false, params.gameID);
					}
					else
					{
						FGS.sendView('errorWithSend', params.gameID, (typeof(params.thankYou) != 'undefined' ? params.bonusID : '') );
					}
				}
			}
		}
		else
		{
			var obj = {
				arguments:
				{
					'type': 'POST',
					'url': 'https://www.facebook.com/fbml/fbjs_ajax_proxy.php?__a=1', //apps
					'data': params.postData
				},
				params: [params, retry],
				callback: 'FGS.poker.Freegifts.Click2'
			};
			
			FGSoperator.postMessage(obj);
		}
	}
};


FGS.poker.Requests = 
{	
	Click: function(currentType, id, currentURL, retry)
	{
		var $ = FGS.jQuery;
		var retryThis 	= arguments.callee;
		var info = {}
		
		$.ajax({
			type: "GET",
			url: currentURL,
			dataType: 'text',
			success: function(dataStr)
			{
				var redirectUrl = FGS.checkForLocationReload(dataStr);
				
				if(typeof(retry) == 'undefined')
				{
					retry = 0;
				}
				
				if(redirectUrl != false)
				{
					if(typeof(retry) == 'undefined' || retry < 4)
					{
						var redirectUrl = redirectUrl.replace(/%21/g, '!').replace(/%2A/g, '*');
						retryThis(currentType, id, redirectUrl, retry++);
					}
					else
					{
						FGS.endWithError('receiving', currentType, id);
					}
					return;
				}
				
				var dataStr = FGS.processPageletOnFacebook(dataStr);
				var dataHTML = FGS.HTMLParser(dataStr);
				
				try
				{
					var redirectUrl2 = FGS.checkForGoURI(dataStr);
					if(redirectUrl2 != false)
					{
						retryThis(currentType, id, redirectUrl2, true);
						return;
					}
					
					if(dataStr.indexOf('This gift is old and expired! Make sure to accept your gifts as soon as possible next time') != -1 || dataStr.indexOf('This gift has expired! Make sure to accept your gifts as soon as possible next time') != -1)
					{
						var error_text = 'This gift is old and expired! Make sure to accept your gifts as soon as possible next time.';
						FGS.endWithError('limit', currentType, id, error_text);
						return;						
					}

					var el = $('.acceptedGift', dataHTML);
					
					
					if($(el).length > 0)
					{
						info.title = $('.acceptedGift', dataHTML).find('h1:first').children('span:first').text();
						info.image = $('.acceptGiftIcon', dataHTML).children('img').attr("longdesc");
						info.text  = $('.acceptGiftFrom', dataHTML).find('img:first').attr('title');
						info.time = Math.round(new Date().getTime() / 1000);
					
						var sendInfo = {
							gift: 'chips'
							};
						info.thanks = sendInfo;
						
						FGS.endWithSuccess(currentType, id, info);				
					}
					else
					{
						throw {message: dataStr}
					}
				}
				catch(err)
				{
					FGS.dump(err);
					FGS.dump(err.message);
					if(typeof(retry) == 'undefined')
					{
						retryThis(currentType, id, currentURL, true);
					}
					else
					{
						FGS.endWithError('receiving', currentType, id);
					}
				}
			},
			error: function()
			{
				if(typeof(retry) == 'undefined')
				{
					retryThis(currentType, id, currentURL, true);
				}
				else
				{
					FGS.endWithError('connection', currentType, id);
				}
			}
		});
	}
};