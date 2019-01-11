var garzeitenObjekte = require("../../data.json");

module.exports = {
    YesIntent() {
        var askedCorrectionResult = this.$session.$data.askedCorrectionResult;
        let prompt = `Die Garzeit von ${askedCorrectionResult} ist ${garzeitenObjekte[askedCorrectionResult]} Minuten`;
        this.tell(prompt);
    },


    NoIntent() {
        let prompt = "Ok. Von was möchtest du die Garzeit wissen?";
        let repromt = "Nenne mir das Objekt zu dem du die Garzeit wissen möchtest.";
        this.removeState();
        this.ask(prompt, repromt);
    },
}