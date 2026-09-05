window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
window.Script20 = function()
{
  const url = "https://script.google.com/macros/s/AKfycbyCZia7U4g5G4ZjmrV4NJDqDl_9-YaGnPl06_OEDPR7h-EtD7G9uIbOMIKESSWP-fXG/exec";
const player = GetPlayer();


let jmeno= player.GetVar("tJmeno");
let email = player.GetVar("tEmail");


fetch(url,{
  method: 'POST',
  mode: 'no-cors', 
  cache: 'no-cache', 
  headers: {'Content-Type': 'application/json'},
  redirect: 'follow',
  body: JSON.stringify(
  {
  jmeno:jmeno,
  email:email}) 
 
});


}

window.Script21 = function()
{
  // Name of the certificate html file
var certFilename = 'certificate.html';

// HTMLCollection of elements of type iFrame
var iframeElements = document.getElementsByTagName("iframe");

// Iterate over the iFrameElements HTMLCollection
for(var i = 0; i < iframeElements.length; i++){

/* If src of current iFrame element equals the filename set in variable
    ** certFilename call the generatePDF() function.
    */

var src = iframeElements[i].getAttribute('src');

if (src.indexOf(certFilename) !=-1) {

        iframeElements[i].contentWindow.generatePDF();

    }

}
}

};
