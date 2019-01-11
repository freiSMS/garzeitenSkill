'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

//import
var stringSimilarity = require('string-similarity');

var garzeitenObjekte = require("./data.json");
const TARGET_NOT_SURE_STATE= require('./states/TargetNotSure.js');



//Config
var targetFoundTreshold = 0.7;
var targetNotSureTreshold = 0.4;

//var targetFoundTreshold = 1;
//var targetNotSureTreshold = 0;





app.setHandler({
    LAUNCH() {
        let prompt = "Hallo. Ich kann dir Garzeiten nennen. Wovon möchtest du die Garzeit wissen?";
        let reprompt = "Nenne mir eine Gemüsesorte zu der du die Garzeit benötigst.";
        this.ask(prompt, reprompt);
    },

    HelloWorldIntent() {
        this.tell("Die Garzeit von Bohnen ist: " + garzeitenObjekte["Rote Bohnen"] + " Minuten.");
    },

    CookingTimeRequestIntent () {
        let skillgemuesename = this.$inputs.Garzeitobjekt.value;

        this.tell("Du hast die Garzeit von folgendem angefordert: " + skillgemuesename);
        
        let prompt;
        let reprompt;

        var bestMatch = stringSimilarity.findBestMatch(skillgemuesename, Object.keys(garzeitenObjekte));
        this.tell("Bestes Ergebnis ist " + bestMatch.bestMatch.target);

        //Speichere Session Attribut, falls Ergebnis gut genug
        if(bestMatch.bestMatch.rating> targetNotSureTreshold)  {
            this.$session.$data.bestMatch = bestMatch;
        }


        console.log(bestMatch);

        //Gebe Garzeit zurück falls in Datenbank
        if(bestMatch.bestMatch.rating >targetFoundTreshold)    {
            prompt = `Die Garzeit von ${bestMatch.bestMatch.target} ist ${garzeitenObjekte[bestMatch.bestMatch.target]} Minuten.`;
            this.tell(prompt);

        }
        else if(bestMatch.bestMatch.rating >targetNotSureTreshold){

            prompt = `Meintest du ${bestMatch.bestMatch.target}?`;
            reprompt = `Ich habe ${bestMatch.bestMatch.target} verstanden. Ist das richtig?`;
            this.followUpState('TargetNotSure').ask(prompt, reprompt);
        }
        else{
            prompt = `Ich kenne die Garzeit von ${skillgemuesename} nicht.`;
            reprompt = `Ich kenne die Garzeit von ${skillgemuesename} nicht.`;
            this.tell(prompt);
        }

    },

    TargetNotSure:
        TARGET_NOT_SURE_STATE,


    

    Unhandled() {
        this.tell("Die Anfrage konnte auch keinen Intent angewandt werden.");
    },


});

console.log(app.config.handlers);

module.exports.app = app;
