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

/*
  https://masslottery.com/api/v1/games?cmsPreview=false
  
  [{
    "name": "The Numbers Game",
    "identifier": "the_numbers_game",
    "icon": {
        "type": "IMAGE",
        "title": "The Numbers Game",
        "url": "//images.ctfassets.net/45roy5e8ztfd/U9Duv6BENkehfFXrOURVt/4c68e63c73aaeed57756c9dfa8f30a00/Numbers_Game_game_art.png"
    },
    "hasProgressiveJackpot": false,
    "hasRapidDrawings": false,
    "hasTwoDrawings": true,
    "gameType": "Draw",
    "topPrizeDisplay": "Prizes Vary",
    "price": 0.25,
    "tags": ["Draws Twice a Day"]
}, {
    "name": "Mass Cash",
    "identifier": "mass_cash",
    "icon": {
        "type": "IMAGE",
        "title": "Mass Cash",
        "url": "//images.ctfassets.net/45roy5e8ztfd/AaSOlsaDbibekKKj5xPEx/2daf53feff8d08bc603fe5bc4d602d42/Mass_Cash_game_art.png"
    },
    "hasProgressiveJackpot": false,
    "hasRapidDrawings": false,
    "hasTwoDrawings": false,
    "gameType": "Draw",
    "topPrize": 100000,
    "price": 1,
    "tags": []
}, {
    "name": "Powerball",
    "identifier": "powerball",
    "icon": {
        "type": "IMAGE",
        "title": "Powerball",
        "url": "//images.ctfassets.net/45roy5e8ztfd/16LEzQfGdLBrBncPx4MRr6/b659f6dee18f358e1014d5d03d29bac0/Powerball_game_artwork.png"
    },
    "hasProgressiveJackpot": true,
    "hasRapidDrawings": false,
    "hasTwoDrawings": false,
    "gameType": "Draw",
    "price": 2,
    "tags": ["ProgressiveJackpot"]
},
...]
  
  https://masslottery.com/api/v1/games/next-draw-dates?cmsPreview=false
  
  [{
    "gameIdentifier": "lucky_for_life",
    "drawSequence": 1,
    "nextDrawTime": "2020-07-09T22:00:00.000-04:00",
    "breakTimeForDraw": "2020-07-09T21:30:00.000-04:00"
}, {
    "gameIdentifier": "the_numbers_game",
    "drawSequence": 0,
    "nextDrawTime": "2020-07-07T19:47:00.000-04:00",
    "breakTimeForDraw": "2020-07-07T19:45:00.000-04:00"
}, {
    "gameIdentifier": "the_numbers_game",
    "drawSequence": 1,
    "nextDrawTime": "2020-07-07T12:47:00.000-04:00",
    "breakTimeForDraw": "2020-07-07T12:45:00.000-04:00"
}, {
    "gameIdentifier": "mega_millions",
    "drawSequence": 1,
    "nextDrawTime": "2020-07-07T23:00:00.000-04:00",
    "breakTimeForDraw": "2020-07-07T22:45:00.000-04:00"
}, {
    "gameIdentifier": "mass_cash",
    "drawSequence": 1,
    "nextDrawTime": "2020-07-07T21:47:00.000-04:00",
    "breakTimeForDraw": "2020-07-07T21:45:00.000-04:00"
}, {
    "gameIdentifier": "megabucks_doubler",
    "drawSequence": 1,
    "nextDrawTime": "2020-07-08T23:00:00.000-04:00",
    "breakTimeForDraw": "2020-07-08T22:45:00.000-04:00"
}, {
    "gameIdentifier": "powerball",
    "drawSequence": 1,
    "nextDrawTime": "2020-07-08T23:00:00.000-04:00",
    "breakTimeForDraw": "2020-07-08T21:50:00.000-04:00"
}]

https://masslottery.com/api/v1/draw-results?cmsPreview=false

{
    "estimatedJackpot": [{
        "gameIdentifier": "powerball",
        "drawDateFrom": "2020-07-04",
        "drawNumberFrom": 1088,
        "drawDateFor": "2020-07-08",
        "drawNumberFor": 1089,
        "estimatedJackpotUSD": 69000000,
        "estimatedCashOptionUSD": 55000000,
        "status": "COMPLETE"
    }, {
        "gameIdentifier": "megabucks_doubler",
        "drawDateFrom": "2020-07-04",
        "drawNumberFrom": 3840,
        "drawDateFor": "2020-07-08",
        "drawNumberFor": 3841,
        "estimatedJackpotUSD": 2600000,
        "estimatedCashOptionUSD": 2380000,
        "status": "COMPLETE"
    }, {
        "gameIdentifier": "mega_millions",
        "drawDateFrom": "2020-07-03",
        "drawNumberFrom": 2413,
        "drawDateFor": "2020-07-07",
        "drawNumberFor": 2414,
        "estimatedJackpotUSD": 73000000,
        "estimatedCashOptionUSD": 57200000,
        "status": "COMPLETE"
    }]
}
  
  */