/*jshint smarttabs:true */




/**
 * DOM ready function
 */
document.addEventListener('DOMContentLoaded',function(){

    
//    var serverHost  = 'myth.readingroom.local',
    var serverHost  = 'localhost',
	serverPort  = 8000,
	apiUrl	    = 'http://' + serverHost + ':' + serverPort + '/phone-call/api/v1/message/',
	calls	    = [],
	list	    = document.getElementById('list'),
	messageForm  = document.forms.new_message,
        el_loading  = document.getElementById('loading'),
        loading     = false;
	
	
    /**
     * Delete a message from the remove server via DELETE request
     */
    function deleteItem( id, callback )
    {
	var req = new XMLHttpRequest();
	
	req.open( 'DELETE', apiUrl + id + '?format=json', true );
	req.onload = function(){
	    var the_object;
            
	    if ( req.readyState == 4 && req.status == 200 ) {
		the_object = JSON.parse( req.responseText );
	    }
	    // delete from local instance
	    deleteLocalCall(id);
	    // reset list
	    updateMessages();
	    // run the callback
	    if( 'function' == typeof( callback ) ){
		callback( the_object );
	    }
	};
	req.send();
    }
	


    function getLocalCall( id, getindex )
    {
	try{
	    for( i in calls ){
		var call = calls[i];
		if( call.id == id ){
		    if( getindex ){
			return i;
		    }
		    return call;
		}
	    }
	    return false;
	}catch(e){}
    }
    
    
    /**
     * Delete a call by ID from local instance
     * 
     */
    function deleteLocalCall(id)
    {
	var i = getLocalCall( id, true );
	
	if( calls.length === 1 ){
	    // only one item, so remove it
	    calls = [];
	    
	    return true;
	}else if( i !== false ){
	    calls.splice( i, 1 );
	    return true;
	}
	return false;
    }
    
    /**
     * Show Loading Gif
     */
    function setLoading()
    {
        loading = true;
        el_loading.setAttribute( 'class','loading' );
    }
    
    /**
     * Remove Loading Gif
     */
    function unSetLoading()
    {
        loading = false;
        el_loading.setAttribute( 'class', null );
    }
    
    
    /**
     * Display all messages in the list
     * Messages are saved in the global(ish) variable, they are set by the AJAX function
     * Delete actions are bond to items as they are created
     */
    function updateMessages()
    {
	
	if( calls.length ){
	    list.innerHTML = '';
	    var l = calls.length,
                delete_function = function(){
		    setLoading();
                    deleteItem( this.message_id, unSetLoading );
                },
		priority_function = function(){
		    togglePriority( this.message_id );
		};
            
            
	    while( l-- ){
		var call = calls[l],
		    li = document.createElement('li'),
		    del = document.createElement('span'),
		    id = call.id;
		    
		    
		li.id = 'message_' + id;
                li.setAttribute( 'class', 'priority_' + call.priority );
		
		li.innerHTML = 'To: <strong>' + call.call_to + '</strong>, From: <strong>' + call.call_from + '</strong>';
		li.message_id = id;
		li.addEventListener('dblclick', priority_function, true );
		    
		// delete button
		del.innerHTML = '&times;';
		del.message_id = id;
		del.addEventListener('click', delete_function, true );
		    
		li.appendChild( del );
		list.appendChild( li );
		
	    }
	}else{
	    // No calls, so clean up markup
	    list.innerHTML = '';
	}
    }
    
    /**
     * Handle form submission, send a new message to the server via post
     */
    messageForm.addEventListener( 'submit', function(event){
	var input_from	= document.getElementById('f_from'),
	    input_to	= document.getElementById('f_to'),
	    values = {
		'call_from' : input_from.value,
		'call_to' : input_to.value
	    },
            el_button	= document.getElementsByTagName('button')[0],
	    req		= new XMLHttpRequest(),
	    jsondata	= JSON.stringify(values);
	    
	    if( !values.call_from.length || !values.call_to.length ){
		alert('Form');
	    }
	    
        
        
	setLoading();
        el_button.setAttribute( 'disabled', 'disabled' );
	
	req.open( 'POST', apiUrl + '?format=json', false );
	req.setRequestHeader( 'Content-type', 'application/json' );
	req.setRequestHeader( 'Accept', 'text/plain' );
	req.onreadystatechange  = function () {
	    
	    el_button.removeAttribute( 'disabled' );
	    
	    updateMessagesRemote(function(){
		// Erase values from fields once data has been sent
		input_from.value = '';
		input_to.value = '';
		unSetLoading();
	    });
	    
	}
	req.send( jsondata );
	
	event.preventDefault();
	
    }, true );
    
    /**
     * Loop thru priorities upgrading each time the thingy is clicked
     */
    function togglePriority( id )
    {
	var localCall	= getLocalCall( id ),
	    req		= new XMLHttpRequest(),
	    newpriority = 3;
	
	setLoading();
	
	// Toggle new priority
	if( localCall.priority > 0 ){
	    newpriority = localCall.priority - 1;
	}else{
	    newpriority = 3;
	}
	
	// Set new values
	var values = {
		'priority' : newpriority
	    },
	    jsondata	= JSON.stringify(values);
	
	// Send webservice request
	req.open( 'PUT', apiUrl + id + '?format=json', false );
	req.setRequestHeader( 'Content-type', 'application/json' );
	req.setRequestHeader( 'Accept', 'text/plain' );
	req.onreadystatechange  = function () {
	    unSetLoading();
	    updateMessagesRemote();
	}
	req.send( jsondata );
	
    }
    
    /* bind event */
    
    
	
	
	


    // Init Code _______________________________________________________________

    // Check server status
    
    function updateMessagesRemote( callback ){
	var req = new XMLHttpRequest();
	req.open( 'GET', apiUrl + '?format=json', true );
	req.onload = function () {
	                
            var res,
		meta;
            
	    // Process response
	    if ( req.readyState == 4 && req.status == 200 ) {
		res = JSON.parse( req.responseText );
	    }
	    
	    try{
		meta = res.meta;
	    }catch( e ){
		meta = false;
	    }


	    // Put status indicator in place, if not alreay loaded
	    if( res.meta.total_count > 0 && !document.getElementById('status') ){
		var span = document.createElement( 'span' );
		span.id = 'status';
		document.getElementById('title').appendChild( span );
	    }
	    
	    // There are messages, update local strore, and repopulate list
	    if( res.meta.total_count > 0 ){
		calls = res.objects;
		updateMessages();
	    }
	    
	    if( 'function' == typeof(callback) ){
		callback();
	    }
	    
	};
	req.send();
    };
    updateMessagesRemote();
    
      


}, false ); // End Dom ready

