 /*
  * @name            graph-thing
  * @description     a tool that can generate graphs and display them in a google-chart
  * @author          Malte 'Lergin' Laukötter
  * @license         none
  */

 Polymer('graph-thing', {
     //list of currend languages
     langs: {
         "de": "de",
         "en": "en"
     },

     cols: [{
         "label": "x",
         "type": "number"
     }, {
         "label": "y",
         "type": "number"
     }],

     //just a bit of random data (x^2) so we have a graph at start
     data: [
         [0, 0],
         [1, 1],
         [2, 4],
         [3, 9],
         [4, 16],
         [5, 25],
         [6, 36],
         [7, 49],
         [8, 64],
         [9, 81]
     ],

     /**
      * created - get the language and load the language file
      *
      * @return {string}  languagecode
      */
     created: function() {
         var langCode = navigator.language || navigator.systemLanguage;
         var lang = langCode.toLowerCase();
         lang = lang.substr(0, 2);
         if (this.langs[lang]) {
             this.lang = lang;
         } else {
             this.lang = "en";
         }
         return this.lang;
     },


     ready: function() {
         //track the view with lergin-analytics
         this.$.la.trackView();
         //set up the growth functions
         limited_ecautchy = new growth('["k","G","s"]', "<res> + <k> * (<G>-<res>)", true);
         limited_rkutta = new growth('["k","G","s"]', "<G> - (<G> - <s>) * Math.pow(Math.E, ((-<k>) * <i>))", false);
         log_ecautchy = new growth('["k","G","s"]', "<res> + <k> * <res> * (<G>-<res>)", true);
         log_rkutta = new growth('["k","G","s"]', "<G> * (1 / (1 + Math.pow(Math.E, ((-<k>) * <G> * <i>)) * (<G> / <s> - 1)))", false);
         exp_ecautchy = new growth('["k","s"]', "<res> + <k> * <res>", true);
         exp_rkutta = new growth('["k","s"]', "<s> * Math.pow((1 + <k>), <i>)", false);
     },


     //COMMENTS!!!
     custom: function() {
         //setting up some vars we need later
         var app = document.getElementById("app");
         var data = "[";
         var vars = app.vars.split(/\n/);
         var fkts = app.fkts.split(/\n/);
         var cols = '[{"label": "x","type": "number"},';

         //Test if an end is given else stop it
         if(!app.end){
             app.error = "no length";
             app.$.error.show();
             return false;
         }

         //put the vars into an object
         var varsNew = [];
         for (varid in vars) {
             varsNew[vars[varid].split(/=/)[0]] = vars[varid].split(/=/)[1]
         }
         vars = varsNew;

         //put the functions into an array
         var fktsnew = []
         for (fktid in fkts) {
             fktsnew.push(fkts[fktid].split(/=/));
             cols += '{"label": "' + fktsnew[fktid][1].replace(/[<>]*/g, '') + fktid + '","type": "number"},'
         }
         fkts = fktsnew;

         cols = cols.slice(0, -1) + "]";

         app.cols = JSON.parse(cols);

         //add "end" to the list of vars becouse we need it everytime
         vars["end"] = app.end;

         try {
             for (var i = 1; i <= app.end; i++) {

                 vars["i"] = i;

                 data += "[" + i + ",";

                 for (var j = 0; j < fkts.length; j++) {
                     fkt = fkts[j][0];
                     for (v in vars) {
                         regex = new RegExp("<" + v + ">", "g");

                         if (vars[v] == (undefined || "") && vars[v] !== 0) {
                             var error = "Missing Variable: " + v;

                             console.log(error);
                             app.error = error;
                             app.$.error.show();
                             return false;
                         }
                         fkt = fkt.replace(regex, vars[v]);
                     }

                     resvar = fkts[j][1].replace(/[<>]*/g, '');

                     //and get the result
                     var res = eval(fkt);

                     vars[resvar] = res;

                     data += res + ",";
                 }


                 data = data.slice(0, -1) + "],"

             }
         } catch (e) {
             app.error = e;
             app.$.error.show();
         }
         //delet the last , and add a closing ]
         data = data.slice(0, -1) + "]";

         //clear the error field
         app.error = "";

         //parse the data to a object and give it back
         app.data = JSON.parse(data);

     },


     /*
     refreshs the data
     */
     lastfunction: function() {
         if (this.lastfkt in this) {
             this[this.lastfkt]();
         }
     },

     /*
      * logistic growth:
      *      1. set the lastfkt so we can refresh the data
      *      2. select the right verfahren
      *      3. call the method of the right object
      */
     log: function() {
         this.lastfkt = "log";

         if (this.verfahren == "Euler Cautchy") {
             this.data = log_ecautchy.run();
         } else {
             this.data = log_rkutta.run();
         }
     },


     /**
      * exp - exponential growth
      *      1. set the lastfkt so we can refresh the data
      *      2. select the right verfahren (even if the result is the same :D)
      *      3. call the method of the right object
      */
     exp: function() {
         this.lastfkt = "exp";

         if (this.verfahren == "Euler Cautchy") {
             this.data = exp_ecautchy.run()
         } else {
             this.data = exp_rkutta.run()
         }
     },

     /**
      * limited - limited growth
      *      1. set the lastfkt so we can refresh the data
      *      2. select the right verfahren
      *      3. call the method of the right object
      */
     limited: function() {
         this.lastfkt = "limited";

         if (this.verfahren == "Euler Cautchy") {
             this.data = limited_ecautchy.run();
         } else {
             this.data = limited_rkutta.run();
         }
     },


     /*
      * change the verfahren that is used for the growth function
      *      Euler Cautchy -> one by one
      *      Runge Kutta -> small steps (eg. math solution)
      * and refresh the data after that
      */
     toggle_verfahren: function() {
         if (this.verfahren == "Runge Kutta") {
             this.verfahren = "Euler Cautchy";
         } else {
             this.verfahren = "Runge Kutta";
         }

         this.lastfunction();
     },

     //set a verfahren for the begining so the button isn't clear
     verfahren: "Runge Kutta",


     /**
      * toFixed - round to a given amount of after dot numbers
      *
      * @param  {floor} value     the number that shoud be shorten
      * @param  {int}   precision the count of chars after the dot
      * @return {floor}           the shorten number
      */
     toFixed: function(value, precision) {
         if (value) {
             return Number(value).toFixed(precision);
         }
     }
 });


 /**
  * The object for the growth functions
  *
  * @param vars   {array of strings}    a array of needed vars
  * @param fkt    {string}              the function as a string that can be used in eval()  vars in <> (i = position, res = old value)
  * @param useRes {boolean}             if the function use the res value
  */
 growth = function(vars, fkt, useRes) {

     //save the variabels in the object
     this.fkt = fkt;
     this.vars = vars;
     this.useRes = useRes ? true : false;

     /*
      * runs the function and paste the data into the data object of the app
      */
     this.run = function() {
         //setting up some vars we need later
         var data = "[";
         var app = document.getElementById("app");
         var vars = JSON.parse(this.vars);
         var fkt = this.fkt

         //add "end" to the list of vars becouse we need it everytime
         vars.push("end");;

         //test if all the vars are avaibel and replace them in the function
         for (v in vars) {
             v = vars[v];
             regex = new RegExp("<" + v + ">", "g");

             if (app[v] == (undefined || "")) {
                 var error = "Missing Variable: " + v;

                 console.log(error);
                 app.error = error;
                 app.$.error.show();
                 return false;
             }
             fkt = fkt.replace(regex, app[v])
         }

         //set up the 0 value if the function needs the result because we woun't get it outherwise
         if (this.useRes) {
             data += "[" + 0 + "," + app["s"] + "],";
         }

         //set the res to the start value so we can use it in functions that need a result to work
         var res = app["s"];

         try {
             //run the function the given amount of times
             for (var i = (this.useRes ? 1 : 0); i <= app.end; i = i + 1) {

                 //replace the variables i and res with the data
                 fktn = fkt.replace(/<i>/gi, i);
                 fktn = fktn.replace(/<res>/gi, res);

                 //and get the result
                 var res = eval(fktn);

                 data += "[" + i + "," + res + "],";
             }
         } catch (e) {
             app.error = e;
             app.$.error.show();
         }
         //delet the last , and add a closing ]
         data = data.slice(0, -1) + "]";

         //clear the error field
         app.error = "";

         //parse the data to a object and give it back
         return JSON.parse(data);
     }
 };
