// ==UserScript==
// @name         PTIT LMS Study Assistant Pro
// @namespace    http://tampermonkey.net/
// @version      5.1.0
// @description  Công cụ hỗ trợ học tập, đồng bộ tiến độ video và tự động đánh giá năng lực trắc nghiệm trên PTIT LMS.
// @author       hoanggxyuuki (Original) / Salyyy (Mod)
// @match        https://lms.ptit.edu.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. CORE LOGIC: YOUTUBE BYPASS
    // ==========================================
    if (window !== window.top) return; 
    var patchedBind = false;
    var originalSeekTo = null;

    function patchYTPlayer() {
        if (!(window.YT && YT.Player && YT.Player.prototype)) return false;
        var proto = YT.Player.prototype;
        if (!proto.__ptit_seek_block__) {
            originalSeekTo = proto.seekTo;
            proto.seekTo = function() {};
            proto.__ptit_seek_block__ = true;
        }
        return true;
    }

    function hookBind() {
        if (patchedBind) return;
        var orig = Function.prototype.bind;
        Function.prototype.bind = function (thisArg) {
            try {
                if (!patchedBind && thisArg && typeof this.name === "string" && this.name.indexOf("_onPlayerStateChange") !== -1) {
                    if (typeof thisArg._checkCurrentTime === "function") {
                        thisArg._checkCurrentTime = function() { return 1; };
                    }
                    var proto = Object.getPrototypeOf(thisArg);
                    if (proto && typeof proto._checkCurrentTime === "function") {
                        proto._checkCurrentTime = function() { return 1; };
                    }
                    patchedBind = true;
                    Function.prototype.bind = orig;
                }
            } catch (e) {}
            var args = Array.prototype.slice.call(arguments, 1);
            return orig.apply(this, [thisArg].concat(args));
        };
    }

    function unlockSeekEngine() {
        hookBind();
        if (!patchYTPlayer()) {
            try {
                var oldReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = function() {
                    try { patchYTPlayer(); } catch (e) {}
                    if (typeof oldReady === "function") oldReady();
                };
            } catch (e) {}
        }
        var tries = 0;
        var timer = setInterval(function() {
            tries++;
            if (patchYTPlayer() || tries > 40) clearInterval(timer);
        }, 250);
    }
    unlockSeekEngine();

    // ==========================================
    // 2. MAIN ACTIONS: VIDEO SYNC
    // ==========================================
    function logMsg(msg, isErr) {
        var consoleLog = isErr ? console.error : console.log;
        consoleLog('[LMS Assistant] ' + msg);
        alert('[LMS Assistant] ' + msg);
    }

    function autoFinishVideos() {
        var iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
        var internalVideos = document.querySelectorAll('video');
        if (iframes.length === 0 && internalVideos.length === 0) {
            logMsg("Trợ lý không tìm thấy video bài giảng nào trên trang!", true);
            return;
        }
        var completed = 0;
        for (var i = 0; i < iframes.length; i++) {
            var iframe = iframes[i];
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [9999, true] }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
            completed++;
        }
        for (var j = 0; j < internalVideos.length; j++) {
            var vid = internalVideos[j];
            try {
                if (vid.duration && !isNaN(vid.duration)) {
                    var targetTime = vid.duration - 0.5;
                    var timeSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
                    if (timeSetter && timeSetter.set) {
                        timeSetter.set.call(vid, targetTime);
                    } else { vid.currentTime = targetTime; }
                    vid.play();
                    setTimeout(function(v) { v.dispatchEvent(new Event('ended', { bubbles: true })); }, 500, vid);
                    completed++;
                }
            } catch (e) { console.error("Lỗi đồng bộ video nội bộ: ", e); }
        }
        logMsg('Đã xác nhận hoàn thành cho ' + completed + ' video bài giảng.');
    }

    // ==========================================
    // 3. V5.1 - UNIVERSAL HEURISTIC REVIEWER
    // ==========================================
    
    // Hàm dò tìm linh hoạt trong DOM
    function findButtonByText(keywords) {
        var all = document.querySelectorAll('button, a, input, div, span, [role="button"]');
        for (var i = all.length - 1; i >= 0; i--) {
            var el = all[i];
            if (el.children.length > 2) continue;
            var text = (el.innerText || el.value || el.textContent || '').trim().toLowerCase();
            if (!text) continue;
            for (var k = 0; k < keywords.length; k++) {
                if (text === keywords[k] || text.indexOf(keywords[k]) !== -1) {
                    var clickable = el.closest('button, a, [role="button"]') || el;
                    if (clickable.offsetWidth > 0 || clickable.offsetHeight > 0) return clickable;
                }
            }
        }
        return null;
    }

    function startBruteforce() {
        var inputs = document.querySelectorAll('input[type="radio"]');
        if (inputs.length === 0) {
            logMsg("Xin vui lòng mở trang có câu hỏi trắc nghiệm để bắt đầu ôn tập!", true);
            return;
        }

        var groupsMap = {};
        for (var i = 0; i < inputs.length; i++) {
            var n = inputs[i].name;
            if (!groupsMap[n]) groupsMap[n] = [];
            groupsMap[n].push(inputs[i]);
        }
        
        var numOptions = [];
        var orderedNames = Object.keys(groupsMap);
        for (var g = 0; g < orderedNames.length; g++) {
            numOptions.push(groupsMap[orderedNames[g]].length);
        }
        
        var zeros = [];
        for (var z = 0; z < numOptions.length; z++) zeros.push(0);

        var initState = {
            running: true,
            phase: 'wait_quiz',
            combo: zeros.slice(),
            bestCombo: zeros.slice(),
            bestScore: -1,
            totalQ: numOptions.length,
            testingIndex: 0,
            testingOption: 1,
            testNumOptions: numOptions,
            finalRun: false
        };
        localStorage.setItem('ptit_bf_state', JSON.stringify(initState));
        alert("✨ TRỢ LÝ ĐÃ KHỞI TẠO! Bạn có thể nghỉ ngơi, hệ thống sẽ rà soát các phương án.");
        bruteForceLoop();
    }

    function stopBruteforce() {
        localStorage.removeItem('ptit_bf_state');
        logMsg("Đã ngưng Trợ Lý Ôn Tập.");
        location.reload();
    }

    function bruteForceLoop() {
        var stateStr = localStorage.getItem('ptit_bf_state');
        if (!stateStr) return;
        var state = JSON.parse(stateStr);
        if (!state.running) return;

        // Báo hiệu UI đang phân tích
        var domScore = document.getElementById('ptit-lms-pro-max-dashboard');
        if (domScore) {
            domScore.style.backgroundColor = 'rgba(23, 37, 84, 0.95)'; // Màu xanh học thuật sang trọng
            domScore.innerHTML = '<h3 style="color:#60a5fa; text-align:center; font-size:14px;">🤖 KHẢO SÁT CHỦ ĐỘNG</h3><p style="color:#d1d5db; font-size:11px; text-align:center;">Trợ lý đang phân tích hệ thống đáp án</p><p style="color:#fcd34d; font-size:12px; text-align:center; font-weight:bold;">Điểm đánh giá tốt nhất: ' + (state.bestScore !== -1 ? state.bestScore : '?') + '/' + state.totalQ + '</p><button onclick="localStorage.removeItem(\'ptit_bf_state\');location.reload();" style="width:100%;background:#374151;color:#fff;border:none;padding:5px;cursor:pointer;margin-top:5px;border-radius:4px;">⏹️ Dừng Phân Tích</button>';
        }

        if (state.phase === 'wait_quiz') {
            var inputs = document.querySelectorAll('input[type="radio"]');
            if (inputs.length === 0) {
                // Heuristic Recovery
                var retryBtn = findButtonByText(['làm lại', 'retake', 'làm lại bài kiểm tra']);
                if (retryBtn) {
                    console.log("[LMS Assistant] Khôi phục phiên giao dịch: Gửi lại yêu cầu Khảo sát...");
                    retryBtn.click();
                }
                setTimeout(bruteForceLoop, 200);
                return;
            }

            var groupsMap = {};
            var orderedNames = [];
            for (var i = 0; i < inputs.length; i++) {
                var n = inputs[i].name;
                if (!groupsMap[n]) { groupsMap[n] = []; orderedNames.push(n); }
                groupsMap[n].push(inputs[i]);
            }
            
            // Render Options
            for (var g = 0; g < orderedNames.length; g++) {
                var gName = orderedNames[g];
                var radios = groupsMap[gName];
                var optionIdx = state.combo[g];
                if (optionIdx !== undefined && radios[optionIdx]) {
                    radios[optionIdx].click();
                    if (!radios[optionIdx].checked) {
                        radios[optionIdx].checked = true;
                        radios[optionIdx].dispatchEvent(new Event('change', {bubbles: true}));
                    }
                }
            }
            
            // Submit Sync
            state.phase = 'wait_result';
            localStorage.setItem('ptit_bf_state', JSON.stringify(state));
            
            setTimeout(function() {
                var submitBtn = findButtonByText(['nộp bài', 'submit', 'hoàn thành']);
                if (submitBtn) {
                    console.log("[LMS Assistant] Gửi Báo cáo cho Server:", submitBtn);
                    submitBtn.click();
                }
                setTimeout(bruteForceLoop, 200); 
            }, 50);

        } else if (state.phase === 'wait_result') {
            
            var bodyText = document.body.innerText;
            var match = bodyText.match(/Kết quả:\s*(\d+)\s*\/\s*(\d+)/i) || bodyText.match(/Trạng thái:.*?Kết quả:\s*(\d+)\s*\/\s*(\d+)/is);
            
            if (!match) {
                var retrySubmit = findButtonByText(['nộp bài', 'submit', 'hoàn thành']);
                var inputsStill = document.querySelectorAll('input[type="radio"]');
                if (retrySubmit && inputsStill.length > 0) {
                    console.log("[LMS Assistant] React Event bị cản - Phục hồi nhấn Nộp Bài...");
                    retrySubmit.click();
                }
                setTimeout(bruteForceLoop, 200);
                return;
            }
            
            var score = parseInt(match[1]);
            var total = parseInt(match[2]);
            console.log("[LMS Assistant] Thống kê: " + score + "/" + total + " | Matrix: " + state.combo);

            if (state.finalRun && score === total) {
               logMsg("🎉 CHÚC MỪNG! Trợ lý đã giúp bạn rà soát thành công 100% đáp án bài học.");
               localStorage.removeItem('ptit_bf_state');
               location.reload();
               return;
            }

            // Heuristic Analysis
            if (state.bestScore === -1) {
                state.bestScore = score;
                state.testingIndex = 0;
                state.testingOption = 1; 
            } else {
                if (score > state.bestScore) {
                    state.bestScore = score;
                    state.bestCombo[state.testingIndex] = state.testingOption;
                    state.testingIndex++;
                    if (state.testingIndex < state.bestCombo.length) {
                        state.testingOption = (state.bestCombo[state.testingIndex] + 1) % state.testNumOptions[state.testingIndex];
                    }
                } else if (score < state.bestScore) {
                    state.testingIndex++;
                    if (state.testingIndex < state.bestCombo.length) {
                        state.testingOption = (state.bestCombo[state.testingIndex] + 1) % state.testNumOptions[state.testingIndex];
                    }
                } else {
                    state.testingOption++;
                    if (state.testingOption === state.bestCombo[state.testingIndex]) state.testingOption++;
                    if (state.testingOption >= state.testNumOptions[state.testingIndex]) {
                        state.testingIndex++;
                        if (state.testingIndex < state.bestCombo.length) {
                            state.testingOption = (state.bestCombo[state.testingIndex] + 1) % state.testNumOptions[state.testingIndex];
                        }
                    }
                }
            }

            if (state.bestScore === total || state.testingIndex >= state.bestCombo.length) {
                if (score === total) {
                    logMsg("🎉 PHÂN TÍCH HOÀN TẤT. Vui lòng ghi lại đáp án 10/10!");
                    localStorage.removeItem('ptit_bf_state');
                    location.reload();
                    return;
                } else {
                    state.combo = state.bestCombo.slice();
                    state.finalRun = true;
                }
            } else {
                state.combo = state.bestCombo.slice();
                state.combo[state.testingIndex] = state.testingOption;
            }

            state.phase = 'wait_quiz';
            localStorage.setItem('ptit_bf_state', JSON.stringify(state));

            setTimeout(function() {
                var rBtn = findButtonByText(['làm lại', 'retake', 'làm lại bài kiểm tra']);
                if (rBtn) {
                    console.log("[LMS Assistant] Tiến hành phiên Khảo Sát mới: ", rBtn);
                    rBtn.click();
                } else {
                    var forms = document.querySelectorAll('form');
                    var hacked = false;
                    for(var f=0;f<forms.length;f++) {
                        if(forms[f].innerHTML.toLowerCase().indexOf('làm lại') !== -1) {
                            forms[f].submit();
                            hacked = true;
                            break;
                        }
                    }
                    if(!hacked) {
                        console.log("LMS Assistant: Khảo sát vòng tiếp bị chậm. Auto-heal ở chu kỳ sau.");
                    }
                }
                setTimeout(bruteForceLoop, 200); 
            }, 100);
        }
    }

    // ==========================================
    // 4. UI: ASSISTANT DASHBOARD
    // ==========================================
    function initUI() {
        if (!document.body) { setTimeout(initUI, 500); return; }
        if (document.getElementById('ptit-lms-pro-max-dashboard')) return;

        var container = document.createElement('div');
        container.id = 'ptit-lms-pro-max-dashboard';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '999999';
        container.style.backgroundColor = 'rgba(15, 23, 42, 0.95)'; // Xanh đậm chuyên nghiệp
        container.style.border = '1px solid #334155';
        container.style.borderRadius = '8px';
        container.style.padding = '15px';
        container.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        container.style.fontFamily = 'Inter, Arial, sans-serif';
        container.style.color = '#fff';
        container.style.width = '240px';

        var title = document.createElement('div');
        title.innerHTML = '🎓 <b>PTIT LMS Assistant V5.1</b>';
        title.style.marginBottom = '12px';
        title.style.fontSize = '14px';
        title.style.textAlign = 'center';
        title.style.color = '#38bdf8'; // Xanh biển nhạt xịn xò
        container.appendChild(title);

        var btnVideo = document.createElement('button');
        btnVideo.innerText = '✅ Đánh dấu Xong Bài Giảng';
        btnVideo.style.width = '100%';
        btnVideo.style.padding = '10px';
        btnVideo.style.marginBottom = '8px';
        btnVideo.style.backgroundColor = '#10b981'; // Xanh lá pass môn
        btnVideo.style.color = 'white';
        btnVideo.style.border = 'none';
        btnVideo.style.borderRadius = '5px';
        btnVideo.style.cursor = 'pointer';
        btnVideo.style.fontWeight = 'bold';
        btnVideo.onclick = autoFinishVideos;
        container.appendChild(btnVideo);

        var btnBf = document.createElement('button');
        btnBf.innerText = '✨ Trợ lý Ôn tập Tự động';
        btnBf.style.width = '100%';
        btnBf.style.padding = '10px';
        btnBf.style.marginBottom = '8px';
        btnBf.style.backgroundColor = '#8b5cf6'; // Tím mộng mơ thông minh
        btnBf.style.color = '#fff';
        btnBf.style.border = 'none';
        btnBf.style.borderRadius = '5px';
        btnBf.style.cursor = 'pointer';
        btnBf.style.fontWeight = 'bold';
        btnBf.onclick = startBruteforce;
        container.appendChild(btnBf);

        var footer = document.createElement('div');
        footer.innerHTML = '<small>Công cụ hỗ trợ rà soát cấu trúc Web</small>';
        footer.style.marginTop = '10px';
        footer.style.fontSize = '10px';
        footer.style.color = '#94a3b8';
        footer.style.textAlign = 'center';
        container.appendChild(footer);

        document.body.appendChild(container);

        if (localStorage.getItem('ptit_bf_state')) {
            console.log("[LMS Assistant] Phục hồi trạng thái máy học...");
            setTimeout(bruteForceLoop, 200);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initUI, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(initUI, 500); });
        window.addEventListener('load', function() { setTimeout(initUI, 1000); });
    }
})();
