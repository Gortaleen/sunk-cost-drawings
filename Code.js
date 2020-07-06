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
  //var drawDate = new Date(curVal.draw_date_display);
  var drawDate = new Date(curVal.draw_date);
  var rowContents = [];
  if (drawDate > lastDate) {
    rowContents = [
      //curVal.draw_date_display,
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
  var response = UrlFetchApp.fetch(
    lotteryUrl
    + "/data/json/games/lottery/"
    + gameId
    + ".json"
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