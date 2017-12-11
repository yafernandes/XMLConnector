/*
MicroStrategy generic data connector SDK JavaScript library v1.0.
Used for MicroStrategy 10.7
Created date: 2016-12-20
Last update: 2017-03-02
*/

( function( global, factory ) {

  "use strict";

  if ( typeof module === "object" && typeof module.exports === "object" ) {

    // For environments where `window` is present, execute the factory and get mstr.
    // For environments that do not have a `window` with a `document`, (such as Node.js), expose a factory as module.exports.
    module.exports = global.document ? factory( global, true ) : function( env ) {
        if ( !env.document ) {
          throw new Error( "MicroStrategy Data Connector requires a window with a document" );
        }
        return factory( env );
      };
  } else {
    factory( global );
  }

} )( typeof window !== "undefined" ? window : this, function( container, noGlobal ) {

  /** This file lists all of the enums which should available for the GDC */
  var allEnums = {
    authTypeEnum : {
      anonymous: "ANONYMOUS",
      basic: "BASIC",
      OAuth: "OAUTH"
    },

    dataTypeEnum : {
      bool: "BOOL",
      date: "DATE",
      time: "TIME",
      datetime: "DATETIME",
      double: "DOUBLE",
      int: "INTEGER",
      string: "STRING",
      bigDecimal: "BIGDECIMAL",
      bigInteger: "BIGINTEGER"
    },

    tableTypeEnum : {
      tableWithSchema: "TABLE_WITH_SCHEMA",
      rawTable: "RAW_TABLE"
    },

    phaseEnum : {
      init: "INIT",
      fetch: "FETCH_TABLE"
    }
  };


  //global variables
  var simulator = 0;

  //detect env functions. With new Function(""), variables in the current scope (if not global) do not apply to the newly constructed function.
  //MSTR web
  var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
  
  //node js
  var isNode = new Function("try {return this===global;}catch(e){return false;}");
  

  //simulator. When simulator launch connector, a parameter 'simulator=1' will be added to connector url.
  var isSimulator = function(){
    return isBrowser() && (simulator == 1)
  }

  //TODO: add detection for one tier
  var isMstrDesktop = new Function("");



  // copy the enums as properties of the dest object
  function copyElement(dest, src) {
    for(var key in src) {
      dest[key] = src[key];
    }
  };


  //Cookies
  function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }


  /*

  */
  function MstrAPI(mstrObj, container){
    //container represents a 'window' in browser like env or 'global' in node js env
    this.mstrObj = mstrObj;
    this.container = container;

  };


  MstrAPI.prototype._createDataConnector = function() {
    var connector = {
      init: function(callback) { callback(); },
      close: function(callback) { callback(); },
    };

    return connector;
  };


  MstrAPI.prototype._parseURL = function(){
    /*Current version, mstr front-end will use url to pass information to connector. 
    And connector will also use url redirect to send back connection data to mstr web.
    */
    var queryString = this.container.location.search.substring(1);

    queryString = decodeURIComponent(queryString.replace(/\+/g, " "));
    this._callbackURL = this._getParamByName("callback", queryString);
    //set cookies for callback
    if(this._callbackURL !== ""){
      console.log("set callback url to cookies ", this._callbackURL);
      setCookie("callback", this._callbackURL, 1);  
    }
    
    var uid = this._getParamByName("userId", queryString);
    if(uid !== ""){
      if(isNode()){
        this.mstrObj.userId = decodeURI(new Buffer(uid, 'base64').toString());
      }
      else{
        this.mstrObj.userId = decodeURI(this.container.atob(uid));
      }
    }
    
    var p = this._getParamByName("parameter", queryString);
    
    if(p !== ""){
      if(isNode()){
        this.mstrObj.parameter = JSON.parse(decodeURI(new Buffer(p, 'base64').toString()));
      }
      else{
        this.mstrObj.parameter = JSON.parse(decodeURI(this.container.atob(p)));
      }
    }
    
    
    //simulator flag
    simulator = this._getParamByName('simulator', queryString);
  }

  MstrAPI.prototype._getParamByName = function(pname, params){
    var sval = "";
    params = params.split("&");
    // split param and value into individual pieces
    for (var i=0; i<params.length; i++)
     {
       var temp = params[i].split("=");
       if ( [temp[0]] == pname ) { 
        sval = temp[1];
        //In case multiple '=' in params, put back other '=' to sval
        for(var ii = 2; ii < temp.length; ii++){
        sval = sval + "=" + temp[ii];
      }
      }
     }
    return sval;
  }

  MstrAPI.prototype._validateDataConnector = function (gdc) {
    // check if connector has all the required functions
    var requireFunctions = ["init", "close", "fetchTable"];
    for (var i = 0; i < requireFunctions.length; i++) {
      if (typeof(gdc[requireFunctions[i]]) !== "function") {
        throw "Function \"" + requireFunctions[i] + "\" must be defined in the Data Connector!";
      }
    };

    console.log("Data connector validation succeed!");
    
    //save connector to container
    this.container._gdc = gdc;
    this._parseURL();

  };

  MstrAPI.prototype._submit = function(){
    //payload will be sent to MSTR/simulator
    var payload = {};
    payload.versionNo = "1.0"; //SDK version. MSTR web can check this version number to find if SDK can work on current MSTR env.
    payload.connectionName = this.mstrObj.connectionName;
    payload.connectionData = this.mstrObj.connectionData;
    payload.authenticationInfo = this.mstrObj.authenticationInfo;
    payload.tableList = this.mstrObj.tableList;
    payload.fileType = this.mstrObj.fileType;
    payload.fetchURL = this.mstrObj.fetchURL; //MSTR will detect the existence and validation of fetchURL

    // Different run env need different data communication way.
    if (isSimulator() || this.mstrObj.simulator == 1){
      console.log("Run environment is simulator");
      container.opener.postMessage(JSON.stringify(payload), '*');
      this.container.close();
    } else if(isNode()){
      console.log("Run environment is node js");
      //Add handler here
    } else if(isBrowser()){
      console.log("Run environment is MSTR web");
      var parameters = "&code=" + this.container.btoa(encodeURI(JSON.stringify(payload)));
      
      //redirect to callback url
      if(this._callbackURL === ""){
        this._callbackURL = getCookie("callback");
      }
      console.log("callback url is ", this._callbackURL);
      this.container.location.href = this._callbackURL + parameters;
    }
  };

  MstrAPI.prototype.init = function(){
    this.mstrObj.createDataConnector = this._createDataConnector.bind(this);
    this.mstrObj.validateDataConnector = this._validateDataConnector.bind(this);
    this.mstrObj.submit = this._submit.bind(this);

    copyElement(this.mstrObj, allEnums);
    //set phase to init
    this.mstrObj.phase = this.mstrObj.phaseEnum.init;

    console.log("MSTR object initialization succeed!");
  };

  //init function
  function init(){
    container.mstr = {};
    var mstrObj = new MstrAPI(container.mstr, container);
    mstrObj.init();
  };



  //Call init() to initialize mstr object.
  init();

});
