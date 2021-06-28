/*jslint browser:true, devel:true, this:true, white:true*/
/*global NextJackpot, PropertiesService, SpreadsheetApp, UrlFetchApp*/

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
  var drawDate = new Date(curVal.drawDate);
  var rowContents = [];

  // need offset due to curVal.drawDate in YYYY-MM-DD (i.e., UTC) format
  drawDate.setMinutes(drawDate.getMinutes() + drawDate.getTimezoneOffset());

  if (drawDate > lastDate) {
    // stDouble can be 0 which is less than ""
    curVal.extras = curVal.extras || {};
    curVal.extras.stDoubler = (
      (curVal.extras?.stDoubler === 0)
      ? "0"
      : "");
    rowContents = [
            drawDate.toLocaleDateString(
        "en-US", {
          "year": "numeric",
          "month": "2-digit",
          "day": "2-digit"
        }
      ),
            curVal.winningNumbers.map(
        (num) => num.toString().padStart(2, 0)
      ).join("-"),
            curVal.jackpot?.toLocaleString(
        "en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }
      ),
      curVal.extras?.megaball
      || curVal.extras?.powerball
      || curVal.extras?.luckyball
      || "",
      curVal.extras?.megaplier
      || curVal.extras?.powerplay
      || curVal.extras?.stDoubler
      || ""
        ];
    drawingsSheet.appendRow(rowContents);
  }
}

function getDateString(dateTemp) {
  var year = dateTemp.getFullYear();
  var monthNum = dateTemp.getMonth() + 1;
  var monthStr = monthNum.toString().padStart(2, "0");
  var dayStr = dateTemp.getDate().toString().padStart(2, "0");
  return year + "-" + monthStr + "-" + dayStr;
}

/**
 * @todo Write the documentation.
 */
function getAndFileResults(sheetObj) {
  "use strict";
  var drawingsSs = this.drawingsSs;
  var lotteryUrl = this.lotteryUrl;
  var gameRulesOBJ = this.gameRulesOBJ;
  var nextDrawDatesOBJ = this.nextDrawDatesOBJ;
  var estJackpotsOBJ = this.estJackpotsOBJ;
  var gameName = sheetObj.getName();
  var response = "";
  var dateNew = new Date();
  var dateOld = new Date();
  var lotteryJson = {};
  var drawingsSheet = {};
  var game_identifier = gameName.toLowerCase().replace(/\s/g, "_");

  dateOld.setMonth(dateOld.getMonth() - 1);
  response = UrlFetchApp.fetch(
    lotteryUrl
    + "/api/v1/draw-results/"
    + game_identifier
    + "?draw_date_min="
    + getDateString(dateOld)
    + "&draw_date_max="
    + getDateString(dateNew)
  );
  lotteryJson = JSON.parse(response.getContentText());
  drawingsSheet = drawingsSs.getSheetByName(gameName);
  lotteryJson.winningNumbers.forEach(fileOneDraw, drawingsSheet);
  NextJackpot.main(
    game_identifier,
    drawingsSheet,
    gameRulesOBJ,
    nextDrawDatesOBJ,
    estJackpotsOBJ
  );
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
  var gameRulesOBJ = JSON.parse(
    UrlFetchApp.fetch(lotteryUrl + "/api/v1/games"));
  var nextDrawDatesOBJ = JSON.parse(
    UrlFetchApp.fetch(lotteryUrl + "/api/v1/games/next-draw-dates"));
  var estJackpotsOBJ = JSON.parse(
    UrlFetchApp.fetch(lotteryUrl + "/api/v1/draw-results"));

  // start update drawing results sheets
  gameRulesSs.getSheets()
    .forEach(
      getAndFileResults, {
        "gameRulesSs": gameRulesSs,
        "drawingsSs": drawingsSs,
        "lotteryUrl": lotteryUrl,
        "gameRulesOBJ": gameRulesOBJ,
        "nextDrawDatesOBJ": nextDrawDatesOBJ,
        "estJackpotsOBJ": estJackpotsOBJ
      }
    );
  // end update drawing results sheets
}
