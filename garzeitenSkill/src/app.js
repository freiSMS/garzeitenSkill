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

//Config
//var targetFoundTreshold = 0.6;
//var targetNotSureTreshold = 0.4;
var maxDifferenceForOtherGoodResults = 0.6;

var targetFoundTreshold = 1;
var targetNotSureTreshold = 0;





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

    TargetNotSure: {
        YesIntent() {
            let bestMatch = this.$session.$data.bestMatch;
            let prompt;
            prompt = `Die Garzeit von ${bestMatch.bestMatch.target} ist ${garzeitenObjekte[bestMatch.bestMatch.target]} Minuten`;
            this.tell(prompt);
        },
        NoIntent()  {
            let bestMatch = this.$session.$data.bestMatch;
            console.log("****Ausgabe bestMatch: ");
            console.log(bestMatch);

            //Prüfe ob es ähnlich gute Ergebnisse gab und schlage sie vor

            var secondBest = [];

            bestMatch.ratings.sort(function(a,b)    {
                if(a.rating <=b.rating)  {
                    return -1;
                }
                else    {
                    return 1;
                }
            })
            console.log("****Ausgabe SORTIERTES bestMatch: ");
            console.log(bestMatch);
            var i = bestMatch.ratings.length-2;
            while (bestMatch.bestMatch.rating - bestMatch.ratings[i].rating < maxDifferenceForOtherGoodResults && i>0)   {
                console.log("****Füge 2ndBestMatch hinzu " + bestMatch.ratings[i]);
                secondBest.push(bestMatch.ratings[i]);
                //console.log(`Add `);
                i--;
            }

            for(var i=0; i<secondBest.length-1; i++)    {
                console.log(`Second best ${i}:  ${secondBest[i].target}`);
            }

            if(secondBest.length>0) {
                let prompt = `Meintest du ${secondBest[0].target}?`;
                let repromt = `Ist ${secondBest[0].target} korrekt?`;
                this.$session.$data.askedCorrectionResult = secondBest[0].target; 
                this.followUpState(this.getState()+'.WantToChangeTarget').ask(prompt, repromt); //von hier muss Ja/Nein abgehen + wechsel zu ..ich meinte...
            }
            else {
                let prompt = "Ok. Von was möchtest du die Garzeit wissen?";
                let repromt="Nenne mir das Objekt zu dem du die Garzeit wissen möchtest.";
                this.ask(prompt, repromt);
            }



            /*bestMatch.ratings.forEach(function()   {
                if(bestMatch.)
            })*/

            //if()



        },

        WantToChangeTarget: { ///******hier weiter!!! */
            YesIntent() {
                var askedCorrectionResult = this.$session.$data.askedCorrectionResult;
                let prompt = `Die Garzeit von ${askedCorrectionResult} ist ${garzeitenObjekte[askedCorrectionResult]} Minuten`;
                this.tell(prompt);
            },


            NoIntent()  {
                let prompt = "Ok. Von was möchtest du die Garzeit wissen?";
                let repromt="Nenne mir das Objekt zu dem du die Garzeit wissen möchtest.";
                this.removeState();
                this.ask(prompt, repromt);
            }
        },



        Unhandled ()    {
            let prompt = "In State Target not Sure. Kein Intent Treffer.";
            this.tell(prompt);
        }
    },

    Unhandled() {
        this.tell("Die Anfrage konnte auch keinen Intent angewandt werden.")
    }


});

module.exports.app = app;
