 Polymer('graph-thing', {
     //list of currend languages
     langs: {
         "de": "de",
         "en": "en"
     },

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

     created: function() {
         var langCode = navigator.language || navigator.systemLanguage;
         var lang = langCode.toLowerCase();
         lang = lang.substr(0, 2);
         if (this.langs[lang]) {
             this.lang = lang;
         } else {
             this.lang = "en";
         }
     },

     ready: function() {
         // this.$.la.trackView();
         limited_ecautchy = new growth('["k","log_g","s","end"]', "<res> + <k> * (<log_g>-<res>)", true);
         limited_rkutta = new growth('["k","log_g","s","end"]', "<log_g> - (<log_g> - <s>) * Math.pow(Math.E, ((-<k>) * <i>))", false);
         log_ecautchy = new growth('["k","log_g","s","end"]', "<res> + <k> * <res> * (<log_g>-<res>)", true);
         log_rkutta = new growth('["k","log_g","s","end"]', "<log_g> * (1 / (1 + Math.pow(Math.E, ((-<k>) * <log_g> * <i>)) * (<log_g> / <s> - 1)))", false);
         exp_ecautchy = new growth('["k","s","end"]', "<res> + <k> * <res>", true);
         exp_rkutta = new growth('["k","s","end"]', "<s> * Math.pow((1 + <k>), <i>)", false);
     },

     kChanged: function() {
         this.lastfunction();
     },

     log_gChanged: function() {
         this.lastfunction();
     },

     sChanged: function() {
         this.lastfunction();
     },

     endChanged: function() {
         this.lastfunction();
     },

     lastfunction: function() {
         if (this.lastfkt in this) {
             this[this.lastfkt]();
         }
     },

     lastfkt: undefined,

     log: function() {
         this.lastfkt = "log"

             if (this.verfahren == "Euler Cautchy") {
                 log_ecautchy.run();
             } else {
                 log_rkutta.run();
             }
     },

     exp: function() {
         this.lastfkt = "exp"


             if (this.verfahren == "Euler Cautchy") {
                 exp_ecautchy.run()
             } else {
                 exp_rkutta.run()
             }
     },

     limited: function() {
         this.lastfkt = "limited"
         if (this.verfahren == "Euler Cautchy") {
             limited_ecautchy.run();
         } else {
             limited_rkutta.run();
         }
     },

     toggle_verfahren: function() {
         if (this.verfahren == "Runge Kutta") {
             this.verfahren = "Euler Cautchy";
         } else {
             this.verfahren = "Runge Kutta";
         }

         this.lastfunction();
     },

     verfahren: "Runge Kutta",

     aas: function() {
         this.asd = eval("Math.pow(" + this.asd + ",2)");
     }
 });



 growth = function(vars, fkt, startatone) {
     this.fkt = fkt;
     this.vars = vars;
     this.startatone = startatone ? true : false;
     this.run = function() {
         console.log("Start generating")
         var data = "[";

         var app = document.getElementById("app");

         var vars = JSON.parse(this.vars)

         var fkt = this.fkt;

         for (v in vars) {
             v = vars[v];
             regex = new RegExp("<" + v + ">", "g");

             if (app[v] == (undefined || "")) {
                 return (false);
             }
             fkt = fkt.replace(regex, app[v])
         }


         if (this.startatone) {
             data += "[" + 0 + "," + app["s"] + "],";
         }

         var res = app["s"];

         for (var i = (this.startatone ? 1 : 0); i <= app.end; i = i + 1) {

             fktn = fkt.replace(/<i>/gi, i);
             fktn = fktn.replace(/<res>/gi, res);
             var res = eval(fktn);

             data += "[" + i + "," + res.toFixed(2) + "],";
         }

         data = data.slice(0, -1) + "]";

         app.data = JSON.parse(data);
         console.log(data);
         return true;
     }
 };
