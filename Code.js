/*jslint browser, devel, maxlen: 80, single, this, white*/
/*global PropertiesService, SpreadsheetApp, UrlFetchApp*/

/**
 * @todo Write the documentation.
 */
function getGameIdArr(curVal) {
  "use strict";
  return curVal[0] === "game_id";
}

/**
 * @todo Write the documentation.
 */
function fileOneDraw(curVal) {
  "use strict";
  var drawingsSheet = this;
  var startRow = Math.max(drawingsSheet.getLastRow(), 2);
  var startColumn = 1;
  var numRows = 1;
  var numColumns = 1;
  var lastDate = drawingsSheet.getSheetValues(
    startRow,
    startColumn,
    numRows,
    numColumns)[0][0];
  var drawDate = new Date(curVal.draw_date);
  var rowContents = [];
  if (drawDate > lastDate) {
    rowContents = [
      curVal.draw_date,
      curVal.winning_num,
      curVal.jackpot,
      curVal.ball || "",
      curVal.bonus || "",
      curVal.next_draw_date || "",
      curVal.estimated_jackpot || ""
    ];
    drawingsSheet.appendRow(rowContents);
  }
}

/**
 * @todo Write the documentation.
 */
function getAndFileResults(sheetObj) {
  "use strict";
  var gameRulesSs = this.gameRulesSs;
  var drawingsSs = this.drawingsSs;
  var lotteryUrl = this.lotteryUrl;
  var gameRulesSheet = gameRulesSs.getSheetByName(sheetObj.getName());
  var gameRulesDataArr = gameRulesSheet.getDataRange().getValues();
  var gameIdArr = gameRulesDataArr.find(getGameIdArr);
  var gameId = gameIdArr[1];
  /*
  new format
  
  https://masslottery.com/api/v1/draw-results/mega_millions?draw_date_min=2020-06-01&draw_date_max=2020-07-06&cmsPreview=false

  {"winningNumbers":[{"gameIdentifier":"mega_millions","drawDate":"2020-06-02","drawNumber":2404,"drawSequence":1,"winningNumbers":[9,20,23,26,29],"winners":0,"location":"None","extras":{"megaball":8,"megaplier":3},"videoLink":"https://youtu.be/u-YaAS7Px-M","jackpot":356000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-05","drawNumber":2405,"drawSequence":1,"winningNumbers":[32,35,37,47,55],"winners":0,"location":"None","extras":{"megaball":22,"megaplier":3},"videoLink":"https://youtu.be/zQYGax1o9pk","jackpot":378000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-09","drawNumber":2406,"drawSequence":1,"winningNumbers":[1,5,9,10,23],"winners":1,"location":"Arizona","extras":{"megaball":22,"megaplier":2},"videoLink":"https://youtu.be/wY2Smaw9n4s","jackpot":410000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-12","drawNumber":2407,"drawSequence":1,"winningNumbers":[9,14,57,67,70],"winners":0,"location":"None","extras":{"megaball":2,"megaplier":3},"videoLink":"https://youtu.be/eBT3cQuWm3A","jackpot":20000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-16","drawNumber":2408,"drawSequence":1,"winningNumbers":[21,23,33,35,42],"winners":0,"location":"None","extras":{"megaball":6,"megaplier":3},"videoLink":"https://youtu.be/FxxAPdkZW1A","jackpot":22000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-19","drawNumber":2409,"drawSequence":1,"winningNumbers":[11,34,36,52,66],"winners":0,"location":"None","extras":{"megaball":7,"megaplier":2},"videoLink":"https://youtu.be/QkuRHum2VI4","jackpot":26000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-23","drawNumber":2410,"drawSequence":1,"winningNumbers":[6,20,37,40,48],"winners":0,"location":"None","extras":{"megaball":15,"megaplier":3},"videoLink":"https://youtu.be/jLz9OFQx9kk","jackpot":35000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-26","drawNumber":2411,"drawSequence":1,"winningNumbers":[19,33,37,56,57],"winners":0,"location":"None","extras":{"megaball":6,"megaplier":2},"videoLink":"https://youtu.be/pfJT9ahb478","jackpot":44000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-06-30","drawNumber":2412,"drawSequence":1,"winningNumbers":[9,16,29,37,53],"winners":0,"location":"None","extras":{"megaball":11,"megaplier":2},"videoLink":"https://youtu.be/aJUd9TlKnUA","jackpot":53000000,"status":"COMPLETE"},{"gameIdentifier":"mega_millions","drawDate":"2020-07-03","drawNumber":2413,"drawSequence":1,"winningNumbers":[20,40,44,45,50],"winners":0,"location":"None","extras":{"megaball":24,"megaplier":2},"videoLink":"https://youtu.be/Cx3EPSBPMm4","jackpot":62000000,"status":"COMPLETE"}]}
  
  */
  var response = UrlFetchApp.fetch(
    lotteryUrl
    + "/data/json/games/lottery/"
    + gameId + ".json"
  );
  var lotteryJson = JSON.parse(response.getContentText());
  //var gameName = lotteryJson.title;
  var gameName = lotteryJson.game_name;
  var drawingsSheet = drawingsSs.getSheetByName(gameName);
  lotteryJson.draws.reverse().forEach(fileOneDraw, drawingsSheet);
}

/**
 * @todo Write the documentation.
 */
// eslint-disable-next-line no-unused-vars
function main() {
  "use strict";
  var gameRulesSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties()
    .getProperty("gameRulesSsId")
  );
  var drawingsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties()
    .getProperty("drawingsSsId")
  );
  var lotteryUrl = PropertiesService.getScriptProperties()
    .getProperty("massLotteryUrl");
  // start update drawing results sheets
  gameRulesSs.getSheets()
    .forEach(
      getAndFileResults, {
        gameRulesSs: gameRulesSs,
        drawingsSs: drawingsSs,
        lotteryUrl: lotteryUrl
      }
    );
  // end update drawing results sheets
}