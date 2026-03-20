function doGet(e) {
  var count = (e.parameter && e.parameter.count) ? parseInt(e.parameter.count) : 5;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
  if (!sheet) return ContentService.createTextOutput("Sheet not found");

  var data = sheet.getDataRange().getValues();
  var questions = [];
  
  // Skip header (Assumes: 題號, 題目, A, B, C, D, 解答)
  for (var i = 1; i < data.length; i++) {
    questions.push({
      id: data[i][0],
      question: data[i][1],
      options: {
        A: data[i][2],
        B: data[i][3],
        C: data[i][4],
        D: data[i][5]
      }
      // 不返回解答
    });
  }
  
  // 隨機打亂並取 N 題
  questions.sort(function() { return 0.5 - Math.random(); });
  var selected = questions.slice(0, count);
  
  return ContentService.createTextOutput(JSON.stringify(selected))
    .setMimeType(ContentService.MimeType.JSON);
}


function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var userId = params.id;
    var answers = params.answers; // array of {id, answer}
    var passThreshold = params.passThreshold || 3;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var qSheet = ss.getSheetByName("題目");
    var aSheet = ss.getSheetByName("回答");
    
    // 建立解答對照表
    var qData = qSheet.getDataRange().getValues();
    var answerMap = {};
    for (var i = 1; i < qData.length; i++) {
      answerMap[qData[i][0]] = qData[i][6]; // 題號 -> 解答
    }
    
    // 計算分數
    var correctCount = 0;
    var totalQuestions = answers.length;
    for (var j = 0; j < answers.length; j++) {
      if (answerMap[answers[j].id] == answers[j].answer) {
        correctCount++;
      }
    }
    
    var score = correctCount; 
    var aData = aSheet.getDataRange().getValues();
    var userRowFound = -1;
    
    for (var k = 1; k < aData.length; k++) {
      if (aData[k][0] == userId) {
        userRowFound = k + 1; // 1-based index
        break;
      }
    }
    
    var now = new Date();
    
    if (userRowFound > -1) {
      // 已存在的 ID
      var playCount = (aData[userRowFound - 1][1] || 0) + 1;
      var totalScore = (aData[userRowFound - 1][2] || 0) + score;
      var highestScore = Math.max((aData[userRowFound - 1][3] || 0), score);
      var firstClearScore = aData[userRowFound - 1][4];
      var attemptsToClear = aData[userRowFound - 1][5];
      
      // 若尚未通關過且本次達標
      if (score >= passThreshold && (firstClearScore === "" || firstClearScore === undefined)) {
        firstClearScore = score;
        attemptsToClear = playCount;
      }
      
      aSheet.getRange(userRowFound, 2).setValue(playCount); // 闖關次數
      aSheet.getRange(userRowFound, 3).setValue(totalScore); // 總分
      aSheet.getRange(userRowFound, 4).setValue(highestScore); // 最高分
      if (firstClearScore !== undefined && firstClearScore !== "") {
        aSheet.getRange(userRowFound, 5).setValue(firstClearScore); // 第一次通關分數
      }
      if (attemptsToClear !== undefined && attemptsToClear !== "") {
        aSheet.getRange(userRowFound, 6).setValue(attemptsToClear); // 花了幾次通關
      }
      aSheet.getRange(userRowFound, 7).setValue(now); // 最近遊玩時間
      
    } else {
      // 新 ID
      var playCount = 1;
      var totalScore = score;
      var highestScore = score;
      var firstClearScore = score >= passThreshold ? score : "";
      var attemptsToClear = score >= passThreshold ? 1 : "";
      
      aSheet.appendRow([
        userId, 
        playCount, 
        totalScore, 
        highestScore, 
        firstClearScore, 
        attemptsToClear, 
        now
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      score: score,
      total: totalQuestions,
      passed: score >= passThreshold
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
