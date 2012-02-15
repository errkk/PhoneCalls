




/**
* DOM ready function
*/
document.addEventListener('DOMContentLoaded',function(){
	
    var serverHost  = 'localhost'
	serverPort  = 8000
	apiUrl	    = 'http://' + serverHost + ':' + serverPort + '/phone-call/api/message/',
	calls	    = [],
	list	    = document.getElementById('list'),
	messageForm  = document.forms['new_message'];
	
	
    /**
	* Update current count of allowed skips
	*/
    function update_nexts( nexts )
    {
	quota = nexts;
	if( quota > 0 ){
	    chrome.browserAction.setBadgeText( {
		'text' : quota.toString()
		} );
	    chrome.browserAction.setBadgeBackgroundColor( {
		'color': [0,150,0,255]
		} );
	}else{
	    chrome.browserAction.setBadgeText( {
		'text' : 'x'
	    } );
	    chrome.browserAction.setBadgeBackgroundColor( {
		'color': [150,0,0,255]
		} );
	}

    }

    /**
	* Get some data from the spotify server
	*/
    function talkToServer( action, callback, data )
    {
	var req = new XMLHttpRequest(),
	    responded = false;


	req.open( 'GET', apiUrl + '?format=json', true );
	req.onload = function () {
	    if( responded ){
		return;
	    }
	    if ( req.readyState == 4 && req.status == 200 ) {
		var the_object = JSON.parse( req.responseText );
	    }
	    if( 'function' == typeof( callback ) ){
		callback( the_object );
	    }
	    responded = true;
	};

	req.send( null );
    }
    
    function updateMessages()
    {
	if( calls.length ){
	    list.innerHTML = '';
	    var l = calls.length;
	    while( l-- ){
		var call = calls[l],
		    li = document.createElement('li'),
		    del = document.createElement('span'),
		    id = call.id,
		    delete_function = function(){
			console.log( 'Delete: ' + this.message_id );
		    };
		    
		li.id = 'message_' + id;
		
		li.innerHTML = 'To: ' + call.call_to + ', From: ' + call.call_from;
		    
		// delete button
		del.innerHTML = '&times;';
		del.message_id = id;
		del.addEventListener('click', delete_function, true );
		    
		li.appendChild( del );
		list.appendChild( li );
		
	    }
	}
    }
    
    
    messageForm.addEventListener( 'submit', function(event){
	console.log(this);
	event.preventDefault();
	
    }, true );
    
	
	
	


    // Check server status
    talkToServer( 'check', function( res ){
	try{
	    var meta = res.meta;
	}catch( e ){
	    var meta = false;
	}


	if( res.meta.total_count > 0 ){
	    var span = document.createElement( 'span' );
	    span.id = 'status';
	    document.getElementById('title').appendChild( span );
	}

	if( res.meta.total_count > 0 ){
	    calls = res.objects;
	    updateMessages();
	}

    }, '' );
	


}, false ); // End Dom ready

