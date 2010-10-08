(function($){

$('.item-set-field.sortable ul').livequery(
	function(){ $(this).sortable({
		axis: 'y'
	})}
);

var dialog_for = function(el) {
	// If we're in a dialog already, just return that.
	var existing = el.parents('.item-set-dialog');

	if (existing.length) {
		return existing;
	}

	// Otherwise spawn one off the item set field.
	var field  = el.parents('.item-set-field').eq(0);
	var dialog = field.data('item-set-dialog');

	if (!dialog) {
		var dialog = $('<div class="item-set-dialog"></div>')
			.appendTo('body')
			.dialog({
				autoOpen: false,
				modal: true,
				width: 400,
				height: 600,
				draggable: false,
				resizable: false
			})

		field.data('item-set-dialog', dialog);
	}

	return dialog;
}

var request = function(eventel, ajax){
	
	var button = eventel; 
	var origText = eventel.val();
	// it the event element is not a button, it should be a form
	// so try to input
	if(button.val() == '') {
		button = button.find('input.action');
	}
	// set processing/loading mode
	button.val('Processing...');
	button.attr('disabled', 'true');
	
	$.ajax($.extend({}, ajax, {
		dataType: 'html',
		success: function(data){
			var holder = $('<div></div>'); holder.html(data); var el = holder.children();
			
			// If we get an item-set-field back
			if (el.length == 1 && el.is('.item-set-field')) {
				// Find that particular field
				var field = $('#'+el.attr('id'));
				
				// Close any associated dialog (but not all dialogs - this item-set-field might live in a dialog)
				var dialog = field.data('item-set-dialog');
				if (dialog) dialog.dialog('close');
				
				// And replace that item-set-field with the new contents.
				field.replaceWith(el);
			}
			
			else {
				dialog_for(eventel).empty().append(el).dialog('open');
			}
		},
		complete: function() {
			// reset processing/loading mode
			button.removeAttr('disabled'); 
			button.val(origText);
		},
		error: function(){
			statusMessage('Couldnt execute action', 'bad');
		}
	}));
}

$('.item-set-field .item-set-field-action, .item-set-dialog .item-set-field-action').live('click', function(e){
	e.preventDefault();
	
	var action = $(this);
	request(action, { url: action.attr('href') || action.attr('rel') });
})

$('.item-set-field form, .item-set-dialog form').livequery('submit', function(e){
	e.preventDefault();
	
	var form = $(this);
	request(form, {
		data: form.serialize(),
		url: form.attr('action'),
		type: form.attr('method') || 'get'
	});
});

// Native reset button doesn't work since form is reloaded previous search values 
// in the fields that are treated as defaults
$('.item-set-dialog form').livequery('reset', function(e) {
	e.preventDefault();
	
	form = $(this);
	// Reset all field, except action buttons and hidden fields
	form.find('input, select').not('.action, :hidden')
		.val('')
		.removeAttr('checked')
		.removeAttr('selected');
});

})(jQuery);
