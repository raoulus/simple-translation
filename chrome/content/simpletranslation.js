/*
 * ### SimpleTranslation ###
 * global preferences:
 * further information about the preferences, see: https://developer.mozilla.org/en/Code_snippets/Preferences
 * use one of the six methods for getting/setting prefs, getBoolPref(), setBoolPref(), getCharPref(), 
 * setCharPref(), getIntPref() and setIntPref()
 * 
 * Google-API-Key: only used in combination with v2 (TODO: AIzaSyDti97Tc28fEgFrUtR5qcbFuWuIoxFTt9I)
 * 
 * @author Raoul Jaeckel
 * @version 0.1
 * @see Google Translation API V1: http://code.google.com/intl/de-DE/apis/language/translate/v1/using_rest_translate.html#using_json
 * @see Google Translation API V2: http://code.google.com/intl/de-DE/apis/language/translate/v2/using_rest.html
 */

// jQuery init
jQuery.noConflict();
var $ = function(selector,context){ 
	return new jQuery.fn.init(selector,context || window._content.document); 
}; 
$.fn = $.prototype = jQuery.fn;

// preferences-object
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
/*
 * A SimpleTranslation-Object
 */
var simpletranslation = {
	
	googleAPIKey: '',
	googleAPIUrl: '',
	sourceLanguage: "en",
	targetLanguage: "de",
	langPair: "en|de",
	
	/*
	 * this function is called when page is loaded.
	 * init properties will be set
	 */
	init: function() {
		
		// set languages
		this.sourceLanguage = prefManager.getCharPref("extensions.simpletranslation.sourceLanguage");
		this.targetLanguage = prefManager.getCharPref("extensions.simpletranslation.targetLanguage");
		simpletranslation.loadLibraries();
	},
	
	loadLibraries: function(){
		//load jQuery script and make jQuery globally available
		//scriptLoader.loadSubScript("chrome://simpletranslation/content/jquery-1.6.2.min.js",simpletranslation);
	},
	
	/*
	 * set google specific properties to use their
	 * translation API.
	 * @see preferences
	 * @return Boolean (true if settings are successfully loaded)
	 */
	loadGoogleProperties: function(){
		this.googleAPIKey = prefManager.getCharPref("extensions.simpletranslation.googleAPIKey");
		this.googleAPIUrl = prefManager.getCharPref("extensions.simpletranslation.googleAPIUrl");
		this.sourceLanguage = prefManager.getCharPref("extensions.simpletranslation.sourceLanguage");
		this.targetLanguage = prefManager.getCharPref("extensions.simpletranslation.targetLanguage");
		this.langPair = "&langpair=" + this.sourceLanguage + "|" + this.targetLanguage;
		this.googleAPIUrl += "?key=" + this.googleAPIKey;
		this.googleAPIUrl += "&source=" + this.sourceLanguage + "&target=" + this.targetLanguage;
		this.googleAPIUrl += "&q="
		
		// Validation
		/*if(this.googleAPIKey == '') {
			alert('Google API-Key ist not defined');
			return false;
		} */
		if(prefManager.getCharPref("extensions.simpletranslation.googleAPIUrl") == '') {
			alert('Google API-URL ist not defined');
			return false;
		}
		if(this.sourceLanguage == ''){
			alert('Translation source-language is not defined');
			return false;
		}
		if(this.targetLanguage == ''){
			alert('Translation target-language is not defined');
			return false;
		}
		return true;
	},
	
	/*
	 * Wrap a span-Element around the selected text
	 * and set the translation as title-Attribute
	 * @param String translatedText
	 */
	setTranslationText: function (translation) {
		var selection = window._content.getSelection().getRangeAt(0);
	    var selectedText = selection.extractContents();
	    var span = window._content.document.createElement("span");
	    span.style.backgroundColor = "yellow";
	    span.setAttribute('title', translation);
	    span.appendChild(selectedText);
	    selection.insertNode(span);
	},

	/*
	 * Get the selected text as String
	 * @return String selectedText
	 */
	getSelectedText: function () {
		var selectionObject = window._content.document.getSelection().toString();
		// replace quotes
		selectionObject = selectionObject.replace(/\"/g, '').replace(/\'/g, '');
		return selectionObject;
	},

	/*
	 * Main-function when a text should be translated.
	 * In future we can switch between different translation-options,
	 * e.g. translate a word via a Dictionary or sentences via Google...
	 */
	translate: function(e) {
		// currently there's only google-translate supported
		simpletranslation.googleTranslate(); 
	},
	
	googleTranslate: function() {

		// set properties for Google-Translate
		simpletranslation.loadGoogleProperties();
		
		var searchTerm = this.getSelectedText();
		
		Firebug.Console.log("Search term: " + searchTerm);
		
		// used in google-api v2
		var apiURL = this.googleAPIUrl + searchTerm
		
		Firebug.Console.log("Google URL: " + apiURL);
		
		jQuery.getJSON( apiURL, function() {
   			
			Firebug.Console.log('Text successfull translated with Google-Translate');
			
		}).success(function(data){
			
			// extract JSON
			var translatedText = '';
			
        	// code for api-v2
			jQuery.each(data, function(key, val) {
        		translatedText += val.translations[0].translatedText;
			});
        	
			Firebug.Console.log("Translation: " + translatedText);
			
            // add translation to the selected text
        	simpletranslation.setTranslationText(translatedText);
        	
		}).error( function() {
           
			Firebug.Console.log("Could not translate text with Google-Translate.");
			
	    });
	},
}; 


// call init-function when window is loaded
window.addEventListener("load", simpletranslation.init, false);


