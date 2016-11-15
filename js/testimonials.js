$().ready(function() {

	$(".title").click(function() {
		openDiv($(this));
	});
	
	showContents(request("p"));
});

function showContents(pNumber) {

	var numberReg = /^[1-20]$/;
	if(numberReg.test(pNumber)) {
		openDiv($(".title").eq(parseInt(pNumber)-1));
		window.location.href = "#t" + pNumber;
	}
	
}

function openDiv(obj) {

		if(obj.children("span").eq(0).html() == "+") {

			$(".title").each(function(index) {
				if($(this).children("span").eq(0).html() == "-") {
					$(this).children("span").eq(0).html("+");
					$(this).next().hide();
				}
			});	

			obj.next().show();
			obj.children("span").eq(0).html("-");
			
		} else {

			obj.next().hide();
			obj.children("span").eq(0).html("+");
		}

}

function request(paras){ 
	var url = location.href;  
	var paraString = url.substring(url.indexOf("?")+1,url.length).split("&");  
	var paraObj = {}  
	for (i=0; j=paraString[i]; i++){  
		paraObj[j.substring(0,j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=")+1,j.length);  
	}  
	var returnValue = paraObj[paras.toLowerCase()];  
	if(typeof(returnValue)=="undefined"){  
		return "";  
	}else{  
		return returnValue; 
	}
}