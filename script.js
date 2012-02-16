/*jshint smarttabs:true */




/**
 * DOM ready function
 */
document.addEventListener('DOMContentLoaded',function(){

    
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
    /**
     * Delete a call by ID from local instance
     * 
     */
    function deleteLocalCall(id)
    {
	try{
	    for( i in calls ){
		var call = calls[i];
		if( call.id == id ){
		    calls.splice( i, 1 );
		    return true;
		}
	    }
	    return false;
	}catch(e){}
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
                };
            
            
	    while( l-- ){
		var call = calls[l],
		    li = document.createElement('li'),
		    del = document.createElement('span'),
		    id = call.id;
		    
		    
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
	    
	    
	    
        
        
	setLoading();
        el_button.setAttribute( 'disabled', 'disabled' );
	
	req.open( 'POST', apiUrl + '?format=json', false );
	req.setRequestHeader( 'Content-type', 'application/json' );
	req.setRequestHeader( 'Accept', 'text/plain' );
	req.onreadystatechange  = function () {
	    unSetLoading();
	    el_button.removeAttribute( 'disabled' );
	    updateMessagesRemote();
	}
	req.send( jsondata );
	
	event.preventDefault();
	
    }, true );
    
	
	
	


    // Init Code _______________________________________________________________

    // Check server status
    
    function updateMessagesRemote(){
	var req = new XMLHttpRequest();
	req.open( 'GET', apiUrl + '?format=json', true );
	req.onload = function () {
	                
            var res,
		meta;
            
	    if ( req.readyState == 4 && req.status == 200 ) {
		res = JSON.parse( req.responseText );
	    }
	    
	    try{
		meta = res.meta;
	    }catch( e ){
		meta = false;
	    }


	    if( res.meta.total_count > 0 && !document.getElementById('status') ){
		var span = document.createElement( 'span' );
		span.id = 'status';
		document.getElementById('title').appendChild( span );
	    }

	    if( res.meta.total_count > 0 ){
		calls = res.objects;
		updateMessages();
	    }
	    
	};
	req.send();
    };
    updateMessagesRemote();
    


}, false ); // End Dom ready

