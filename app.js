$(document).ready(function() {
    // 取得環境變數
    if (!window.ENV) {
        console.error("Environment variables not loaded (window.ENV is missing). Check your env.js or deployment configuration.");
        alert("CRITICAL ERROR: Environment config (env.js) is missing. If you're on GitHub Pages, make sure secrets are set and the Action triggered.");
        return;
    }

    const GAS_URL = window.ENV.GOOGLE_APP_SCRIPT_URL;
    const PASS_THRESHOLD = parseInt(window.ENV.PASS_THRESHOLD) || 3;
    const QUESTION_COUNT = parseInt(window.ENV.QUESTION_COUNT) || 5;

    let playerId = '';
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = []; // [ { id: '題號', answer: 'A' } ]
    let bosses = []; // 預先載入的關主圖片

    // 1. 預先載入 100 張關主圖片 (DiceBear)
    function preloadBosses() {
        for (let i = 0; i < 100; i++) {
            let seed = 'boss_' + Math.random().toString(36).substring(7);
            let url = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
            bosses.push(url);
            
            // 背景非同步載入圖片
            let img = new Image();
            img.src = url;
        }
    }

    preloadBosses();

    // 2. 開始遊戲按鈕
    $('#btn-start').click(function() {
        playerId = $('#player-id').val().trim();
        if (!playerId) {
            alert('PLEASE ENTER ID!');
            return;
        }

        $('#btn-start').hide();
        $('#loading-msg').removeClass('hidden').text('LOADING CLOUD DATA...');

        // 向 GAS 取得題目 (使用 GET)
        $.ajax({
            url: GAS_URL,
            type: 'GET',
            data: { count: QUESTION_COUNT },
            dataType: 'json',
            success: function(res) {
                if (res && res.length > 0) {
                    questions = res;
                    currentQuestionIndex = 0;
                    userAnswers = [];
                    showScreen('screen-game');
                    renderQuestion();
                } else {
                    alert('NO QUESTIONS FOUND!');
                    resetLogin();
                }
            },
            error: function(err) {
                console.error(err);
                alert('ERROR FETCHING QUESTIONS. CHECK GAS URL.');
                resetLogin();
            }
        });
    });

    // 3. 關卡選項按鈕
    $('.option-btn').click(function() {
        const selectedOpt = $(this).data('opt');
        const qId = questions[currentQuestionIndex].id;
        
        userAnswers.push({
            id: qId,
            answer: selectedOpt
        });

        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            renderQuestion();
        } else {
            submitAnswers();
        }
    });

    // 重新開始
    $('#btn-restart').click(function() {
        resetLogin();
        showScreen('screen-login');
    });

    // 渲染遊戲題目畫面
    function renderQuestion() {
        const q = questions[currentQuestionIndex];
        
        // 更新標頭
        $('#player-disp').text(`P1: ${playerId}`);
        $('#progress-disp').text(`STAGE ${currentQuestionIndex + 1}/${questions.length}`);
        
        // 更新關主圖片 (隨機取一張預載的)
        const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
        $('#boss-image').attr('src', randomBoss);

        // 更新題目與選項
        $('#question-text').text(q.question);
        
        const opts = ['A', 'B', 'C', 'D'];
        opts.forEach((opt) => {
            const btn = $(`.option-btn[data-opt="${opt}"]`);
            btn.text(`${opt}: ${q.options[opt]}`);
        });
    }

    // 4. 送出答案計算成績
    function submitAnswers() {
        showScreen('screen-login'); // 借用 login 畫面的 loading
        $('#player-id').hide();
        $('#btn-start').hide();
        $('#loading-msg').text('CALCULATING SCORE...').removeClass('hidden');

        const payload = {
            id: playerId,
            passThreshold: PASS_THRESHOLD,
            answers: userAnswers
        };

        // GAS 的 doPost 以 text/plain 發送，避免 CORS 複雜度
        $.ajax({
            url: GAS_URL,
            type: 'POST',
            contentType: 'text/plain;charset=utf-8',
            data: JSON.stringify(payload),
            dataType: 'json',
            success: function(res) {
                showResult(res.score, res.total, res.passed);
            },
            error: function(err) {
                console.error(err);
                alert('ERROR SUBMITTING ANSWERS');
                resetLogin();
                showScreen('screen-login');
            }
        });
    }

    // 顯示結果
    function showResult(score, total, passed) {
        showScreen('screen-result');
        $('#score-text').text(`SCORE: ${score} / ${total}`);
        if (passed) {
            $('#pass-text').text('MISSION CLEAR!').css('color', 'var(--text-color)');
            $('#result-boss-container').html('<img src="https://api.dicebear.com/9.x/pixel-art/svg?seed=win" style="width:100%; height:100%; image-rendering: pixelated;">');
        } else {
            $('#pass-text').text('GAME OVER').css('color', '#ff3333');
            $('#result-boss-container').html('<img src="https://api.dicebear.com/9.x/pixel-art/svg?seed=lose" style="width:100%; height:100%; image-rendering: pixelated;">');
        }
    }

    // 重設首頁
    function resetLogin() {
        $('#btn-start').show();
        $('#loading-msg').addClass('hidden');
        $('#player-id').show().val('');
    }

    function showScreen(screenId) {
        $('.screen').removeClass('active').addClass('hidden');
        $(`#${screenId}`).removeClass('hidden').addClass('active');
    }
});
