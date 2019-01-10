//const WANT_TO_CHANGE_TARGET_STATE = require('./states/targetNotSure/WantToChangeTarget');
const WANT_TO_CHANGE_TARGET_STATE = require('./states/targetNotSure/WantToChangeTarget.js');


module.exports = {
    YesIntent() {
        let bestMatch = this.$session.$data.bestMatch;
        let prompt;
        prompt = `Die Garzeit von ${bestMatch.bestMatch.target} ist ${garzeitenObjekte[bestMatch.bestMatch.target]} Minuten`;
        this.tell(prompt);
    },
    NoIntent() {
        let bestMatch = this.$session.$data.bestMatch;
        console.log("****Ausgabe bestMatch: ");
        console.log(bestMatch);

        //Prüfe ob es ähnlich gute Ergebnisse gab und schlage sie vor

        var secondBest = [];

        bestMatch.ratings.sort(function (a, b) {
            if (a.rating <= b.rating) {
                return -1;
            }
            else {
                return 1;
            }
        })
        console.log("****Ausgabe SORTIERTES bestMatch: ");
        console.log(bestMatch);
        var i = bestMatch.ratings.length - 2;
        while (bestMatch.bestMatch.rating - bestMatch.ratings[i].rating < maxDifferenceForOtherGoodResults && i > 0) {
            console.log("****Füge 2ndBestMatch hinzu " + bestMatch.ratings[i]);
            secondBest.push(bestMatch.ratings[i]);
            //console.log(`Add `);
            i--;
        }

        for (var i = 0; i < secondBest.length - 1; i++) {
            console.log(`Second best ${i}:  ${secondBest[i].target}`);
        }

        if (secondBest.length > 0) {
            let prompt = `Meintest du ${secondBest[0].target}?`;
            let repromt = `Ist ${secondBest[0].target} korrekt?`;
            this.$session.$data.askedCorrectionResult = secondBest[0].target;
            this.followUpState(this.getState() + '.WantToChangeTarget').ask(prompt, repromt); //von hier muss Ja/Nein abgehen + wechsel zu ..ich meinte...
        }
        else {
            let prompt = "Ok. Von was möchtest du die Garzeit wissen?";
            let repromt = "Nenne mir das Objekt zu dem du die Garzeit wissen möchtest.";
            this.ask(prompt, repromt);
        }



        /*bestMatch.ratings.forEach(function()   {
            if(bestMatch.)
        })*/

        //if()
    },


    Unhandled() {
        let prompt = "In State Target not Sure. Kein Intent Treffer.";
        this.tell(prompt);
    },

    WantToChangeTarget:
        WANT_TO_CHANGE_TARGET_STATE,
}