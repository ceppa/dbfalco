function MsgOkCancel(messaggio,pagina)
{
	var fRet;
	fRet=confirm(messaggio);
	if(fRet)
		window.location=pagina;
}

function FormOkCancel(messaggio,form)
{
	var fRet;
	fRet=confirm(messaggio);
	if(fRet)
		form.submit();
}

function redirect(pagina)
{
	window.location=pagina;
}

function trim(stringa)
{
    while (stringa.substring(0,1) === ' ')
        stringa = stringa.substring(1, stringa.length);
    while (stringa.substring(stringa.length-1, stringa.length) === ' ')
        stringa = stringa.substring(0,stringa.length-1);
    return stringa;
}

function formatFloat(number)
{
	var out="";
	var stringa=String(number);

	if(stringa.length===1)
		return "0,0"+stringa;
	else if(number.length===2)
		return "0,"+stringa;
	else
	{
		out=stringa.substring((stringa.length-5)>=0 ? stringa.length-5 : 0,stringa.length-2)+","+stringa.substring(stringa.length-2,stringa.length);

		for(var i=0;i<stringa.length -5;i+=3)
			out=stringa.substring(((stringa.length-8-i)>=0 ? stringa.length-8-i : 0),(stringa.length-5-i))+"."+out;
		return out;
	}
}

function onlyNumbers(e)
{
	var keynum;
	var keychar;
	var numcheck;

	if(window.event) // IE
	{
		keynum = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which;
	}
	if((keynum===8)
			||(keynum===9)
			||(keynum===13)
			||(keynum===116)
			||(keynum===37)
			||(keynum===39)
			||(keynum===46)
			||(keynum===190))
		return true;
	keychar = String.fromCharCode(keynum);
	numcheck = /\d/;
	return numcheck.test(keychar);
}

function onlyTime(e,sender)
{
	var keynum;
	var keychar;
	var numcheck;

	if(window.event) // IE
	{
		keynum = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which;
	}

	if((keynum===8)
			||(keynum===9)
			||(keynum===13)
			||(keynum===17)
			||(keynum===37)
			||(keynum===39)
			||(keynum===46)
  			||(keynum===116))
  		return true;
	if((keynum===59)||(keynum===190))
	{
		if(sender.value.length
				&&(sender.value.indexOf(":")===-1)
				&&(sender.value.indexOf(".")===-1))
			sender.value=sender.value+":";
		return false;
  	}
  	else
		keychar = String.fromCharCode(keynum);
/*	if(((sender.value.length>1)
			&&(sender.value.indexOf(":")==-1))
		||((sender.value.indexOf(":")!=-1)
			&&(sender.value.length-sender.value.indexOf(":")>2)))
		return false;*/
	numcheck = /\d/;
	return numcheck.test(keychar);
}

function onlyNumbersFloat(e,sender)
{
	var keynum;
	var keychar;
	var numcheck;

	if(window.event) // IE
	{
		keynum = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which;
	}
	if((keynum===8)
			||(keynum===9)
			||(keynum===13)
			||(keynum===17)
			||(keynum===37)
			||(keynum===39)
			||(keynum===46)
  			||(keynum===116))
  		return true;
	if((keynum===188)||(keynum===190))
	{
		if(sender.value.length
				&&(sender.value.indexOf(",")===-1)
				&&(sender.value.indexOf(".")===-1))
			sender.value=sender.value+",";
		return false;
  	}
  	else
		keychar = String.fromCharCode(keynum);
	numcheck = /\d/;
	return numcheck.test(keychar);
}



function showMessage(testo)
{
	var element=document.getElementById("message");
	element.innerHTML=testo;
	element.style.display="";
	var tim = setTimeout('document.getElementById("message").style.display="none"', 3000);
}

function setSelection(txt, idx, length)
{
	if (txt.createTextRange)
	{
		var range = txt.createTextRange();

		range.collapse(true);
		range.moveStart('character', idx);
		range.moveEnd('character', idx + length);
		range.select();
	}
	else if (txt.selectionEnd)
	{
		txt.selectionStart = idx;
		txt.selectionEnd = idx + length;
	}
}

function check_all(sender,name)
{
	var obj = document.getElementsByTagName('input');
	if (obj)
	{
		for (var i = 0; i < obj.length; i++)
		{
			nome=obj[i].getAttribute("name");
			if(nome && nome.indexOf(name)!==-1)
				obj[i].checked=sender.checked;
		}
	}
}

function prepareExportTableToCSV($table)
{
	var $rows = $table.find('tr:has(td)'),

	// Temporary delimiter characters unlikely to be typed by keyboard
	// This is to avoid accidentally splitting the actual contents
	tmpColDelim = String.fromCharCode(11), // vertical tab character
	tmpRowDelim = String.fromCharCode(0), // null character

	// actual delimiter characters for CSV format
	colDelim = '","',
	rowDelim = '"\r\n"',

	// Grab text from table into CSV formatted string
	csv = '"' + $rows.map(function (i, row) {
		var $row = $(row),
			$cols = $row.find('td');

		return $cols.map(function (j, col) {
			var $col = $(col),
				text = $col.text();

			return text.replace(/"/g, '""'); // escape double quotes

		}).get().join(tmpColDelim);

	}).get().join(tmpRowDelim)
		.split(tmpRowDelim).join(rowDelim)
		.split(tmpColDelim).join(colDelim) + '"';

	return csv;
}

function exportCSV(sender,csv,filename)
{
	var csvData;
	if (navigator.appName === "Microsoft Internet Explorer")
	{
		var iframe = $('<iframe></iframe>');
		iframe.appendTo($("body"));
		iframe = iframe[0].contentWindow || iframe[0].contentDocument;

		csv = 'sep=,\r\n' + csv;

		iframe.document.open("text/html", "replace");
		iframe.document.write(csv);
		iframe.document.close();
		iframe.focus();
		iframe.document.execCommand('SaveAs', true, filename);
	}
	else
	{
		csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
		sender
			.attr({
			'download': filename,
				'href': csvData,
				'target': '_blank'
		});
	}
}

function exportTableToCSV($table,filename,skipRows)
{
	skipRows = typeof skipRows !== 'undefined' ? skipRows : 0;
	var csv=prepareExportTableToCSV($table);
	if(skipRows>0)
		csv=csv.split("\n").splice(0,skipRows).join("\n");
	exportCSV($(this),csv,filename);
}
