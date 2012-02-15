




/**
* DOM ready function
*/
document.addEventListener('DOMContentLoaded',function(){
	
    var serverHost  = 'localhost'
	serverPort  = 8000
	apiUrl	    = 'http://' + serverHost + ':' + serverPort + '/phone-call/api/message/',
	calls	    = [],
	list	    = document.getElementById('list'),
	messageForm  = document.forms['new_message'],
        el_loading  = document.getElementById('loading'),
        loading     = false;
	
	
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
    function talkToServer( method, callback, data, id )
    {
	var req = new XMLHttpRequest(),
	    responded = false;

	if( id ){
	    apiUrl =+ '/' + id;
	}
	
	req.open( method, apiUrl + '?format=json', true );
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
	if( data ){
	    req.send(data);
	}else{
	    req.send();
	}
    }
    
    function setLoading()
    {
        loading = true;
        el_loading.setAttribute( 'class','loading' );
    }
    
    function unSetLoading()
    {
        loading = false;
        el_loading.setAttribute( 'class', null );
    }
    
    
    calls = [
        {call_to : 'Test', call_from : 'Test', id : 1, priority : 1},
        {call_to : 'Test', call_from : 'Test', id : 2, priority : 2},
        {call_to : 'Test', call_from : 'Test', id : 3, priority : 3},
        {call_to : 'Test', call_from : 'Test', id : 4, priority : 1},
        {call_to : 'Test', call_from : 'Test', id : 5, priority : 2},
        {call_to : 'Test', call_from : 'Test', id : 6, priority : 3},
    ]
    
    updateMessages();
    
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
			
			talkToServer( 'DELETE', function(){
			    console.log('delete callback');
			}, null, this.id );
		    };
		    
		li.id = 'message_' + id;
                li.setAttribute( 'class', 'priority_' + call.priority );
		
		li.innerHTML = 'To: <strong>' + call.call_to + '</strong>, From: <strong>' + call.call_from + '</strong>';
		    
		// delete button
		del.innerHTML = '&times;';
		del.message_id = id;
		del.addEventListener('click', delete_function, true );
		    
		li.appendChild( del );
		list.appendChild( li );
		
	    }
	}
    }
    
    /**
     * Handle form submission
     */
    messageForm.addEventListener( 'submit', function(event){
	var input_from	= document.getElementById('f_from'),
	    input_to	= document.getElementById('f_to'),
	    values = {
		call_from : input_from.value,
		call_to : input_to.value
	    },
            el_button = document.getElementsByTagName('button')[0];
        setLoading();
        
        el_button.setAttribute( 'disabled', 'disabled' );
	
	talkToServer( 'POST', function( res ){
	    
            

	    console.log(res);
            unSetLoading();
            el_button.removeAttribute( 'disabled' );

	}, values );
	
	event.preventDefault();
	
    }, true );
    
	
	
	


    // Check server status
    talkToServer( 'GET', function( res ){
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

