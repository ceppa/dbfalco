function form_validate(notnull,magzero,formname)
{
	var formok=true;
	formname = formname || "editform";
	var fields = $("#"+formname).serializeArray();
	jQuery.each(fields, function(i, field)
	{
		var i=jQuery.inArray(field.name, notnull);
		var j=jQuery.inArray(field.name, magzero);
		var value=jQuery.trim(field.value);
		if((i!=-1)||(j!=-1))
		{
			if(((i!=-1)&&(value.length==0))||
				((j!=-1)&&(value==0)))
			{
				$('#'+field.name).addClass("error");
	//			$('#'+field.name.replace("[", "\\[").replace("]", "\\]")).addClass("error");
				formok=false;
			}
			else
				$('#'+field.name).removeClass("error");
	//			$('#'+field.name.replace("[", "\\[").replace("]", "\\]")).removeClass("error");

		}
    });
    return formok;
}

function form_post(table,formname,target)
{
	formname = formname || "editform";
	target = target || "include/forms.php";
	var insert_id=false;

	$("#"+formname+" :checkbox").each(function() 
		{
			$(this).val($(this).is(':checked'));
			$(this).attr('checked', true);
		});
	
	var postdata="op=form_posted&form_table="+table+"&";
	postdata+=$("#"+formname).serialize();
	showWait();
	$.ajax({
		type:'POST',
		url:target, 
		data: postdata,
		cache: false,
		async: false
	}).done(function(data) 
		{
			data=getData(data);
			if(data.length==0)
				return;
			var status=parseInt(data.status);
			var message=data.message;
			insert_id=data.id;
			notify(status,message);
		});
	return insert_id;
}

