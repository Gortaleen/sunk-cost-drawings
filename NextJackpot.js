/*jslint browser:true, white:true*/

// eslint-disable-next-line no-unused-vars
const NextJackpot = (function () {
  "use strict";

  // eslint-disable-next-line max-statements
  function main(
    game_identifier,
    drawingsSheet,
    gameRulesOBJ,
    nextDrawDatesOBJ,
    estJackpotsOBJ
  ) {
    let gameIndex = 0;
    const gameRule = gameRulesOBJ.some(function (rule, index) {
      gameIndex = index;
      return rule.identifier === game_identifier;
    });
    let gameRuleOBJ = {};
    let jackpot = 0;
    let jackpotIndex = 0;
    const estJackpot = estJackpotsOBJ.estimatedJackpot
      .some(function (jackpotOBJ, index) {
        jackpotIndex = index;
        return jackpotOBJ.gameIdentifier === game_identifier;
      });
    let jackpotDateStr = "";
    let nextDrawDate = nextDrawDatesOBJ.some(function (nextDrawDateOBJ) {
      jackpotDateStr = nextDrawDateOBJ.nextDrawTime;
      return nextDrawDateOBJ.gameIdentifier === game_identifier;
    });
    let lastRow = 0;
    let range = {};
    const column = 6;
    const numRows = 1;
    const numColumns = 2;

    if (gameRule !== true) {
      throw "Game Rule JSON not found";
    }

    if (nextDrawDate !== true) {
      throw "Game Draw Date not found";
    }

    gameRuleOBJ = gameRulesOBJ[gameIndex];

    if (gameRuleOBJ.hasProgressiveJackpot === true) {
      if (estJackpot === true) {
        jackpot = estJackpotsOBJ.estimatedJackpot[jackpotIndex]
          .estimatedJackpotUSD;
        jackpotDateStr = estJackpotsOBJ.estimatedJackpot[jackpotIndex]
          .drawDateFor;
      } else {
        throw "Game Jackpot not found";
      }
    } else {
      jackpot = gameRuleOBJ.topPrize;
    }
    lastRow = drawingsSheet.getLastRow();
    range = drawingsSheet.getRange(lastRow, column, numRows, numColumns);
    range.setValues([
            [jackpotDateStr, jackpot]
        ]);
  }

  return Object.freeze({
    "main": main
  });
}());
