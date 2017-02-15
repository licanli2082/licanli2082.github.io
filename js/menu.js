function show(i)
{
var m = document.getElementById("submenu_"+i);
m.style.display="block"
document.getElementById("menu_"+i).className="menuOn"
};
function dis(i)
{
var m = document.getElementById("submenu_"+i);
m.style.display="none"
document.getElementById("menu_"+i).className=""
};

function shcon(n)
{
if (document.getElementById("con_" + n).style.display== "none")
{
document.getElementById("con_" + n).style.display = '';
document.getElementById("title_"+n).className="less"
}
else
{
document.getElementById("con_" + n).style.display= 'none';
document.getElementById("title_"+n).className=""
}
}
