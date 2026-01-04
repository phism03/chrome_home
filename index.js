setTimeout(() => {
    $('#c_search').focus();
}, 10);

$(function () {
    let timerInterval;
    let totalSeconds = 0;
    let isRunning = false;
    let isFinished = false;
    let previousValues = { min: "01", sec: "00" };
    let originValues = { min: "01", sec: "00" };

    const $inputs = $('.r_t_main_input input');
    const $minInput = $inputs.eq(0);
    const $secInput = $inputs.eq(1);
    const $startBtn = $('#r_t_start');
    const $resetBtn = $('#r_t_reset');

    let alarmSound = new Audio('img/timer.mp3');
    alarmSound.loop = true;

    $('.r_t_pause, .r_t_stop').hide();

    function validateInput() {
        let m = parseInt($minInput.val()) || 0;
        let s = parseInt($secInput.val()) || 0;

        if (m > 99) m = 99;
        if (s > 59) s = 59;
        if (m < 0) m = 0;
        if (s < 0) s = 0;

        $minInput.val(String(m).padStart(2, '0'));
        $secInput.val(String(s).padStart(2, '0'));
    }

    $inputs.on('focus', function () {
        previousValues.min = $minInput.val();
        previousValues.sec = $secInput.val();
    }).on('blur', function () {
        if ($minInput.val() === "" || $secInput.val() === "") {
            $minInput.val(previousValues.min);
            $secInput.val(previousValues.sec);
        } else {
            validateInput();
        }
    }).on('wheel', function (e) {
        if (isRunning || isFinished) return;

        e.preventDefault();
        let delta = e.originalEvent.deltaY;
        let $this = $(this);
        let currentVal = parseInt($this.val()) || 0;
        let isMinInput = $this.is($minInput);

        if (delta < 0) {
            currentVal = isMinInput ? Math.min(currentVal + 1, 99) : Math.min(currentVal + 1, 59);
        } else {
            currentVal = Math.max(currentVal - 1, 0);
        }
        $this.val(String(currentVal).padStart(2, '0'));
    });

    function updateDisplay(total) {
        let m = Math.floor(total / 60);
        let s = total % 60;
        $minInput.val(String(m).padStart(2, '0'));
        $secInput.val(String(s).padStart(2, '0'));
    }

    $startBtn.on('click', function () {
        alarmSound.play().then(() => { alarmSound.pause(); }).catch(() => { });

        if (!isRunning) {
            validateInput();
            let m = parseInt($minInput.val()) || 0;
            let s = parseInt($secInput.val()) || 0;

            if (m === 0 && s === 0) {
                s = 1;
                $secInput.val('01');
            }

            originValues.min = $minInput.val();
            originValues.sec = $secInput.val();

            totalSeconds = m * 60 + s;
            isRunning = true;

            $inputs.prop('disabled', true).css('border-color', 'transparent');
            $('.r_t_play').hide();
            $('.r_t_pause').show();

            timerInterval = setInterval(function () {
                totalSeconds--;
                updateDisplay(totalSeconds);

                if (totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    isFinished = true;
                    alarmSound.play();
                    $startBtn.css({ 'width': '0', 'padding': '0', 'margin': '0', 'overflow': 'hidden', 'border': 'none' });
                    $('.r_t_reset').hide();
                    $('.r_t_stop').show();
                }
            }, 1000);
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            $inputs.prop('disabled', false).css('border-color', '');
            $('.r_t_play').show();
            $('.r_t_pause').hide();
        }
    });

    $resetBtn.on('click', function () {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        clearInterval(timerInterval);

        isRunning = false;
        isFinished = false;

        $inputs.prop('disabled', false).css('border-color', '');
        $startBtn.css({ 'width': '', 'padding': '', 'margin': '', 'overflow': '', 'border': '' });
        $('.r_t_play').show();
        $('.r_t_pause').hide();
        $('.r_t_reset').show();
        $('.r_t_stop').hide();

        $minInput.val(originValues.min);
        $secInput.val(originValues.sec);
    });
});

(function () {
    function pad(n) { return String(n).padStart(2, '0'); }
    function updateClock() {
        var now = new Date();
        var hh = pad(now.getHours());
        var mm = pad(now.getMinutes());
        var ss = pad(now.getSeconds());
        var timeEl = document.querySelector('.c_clock_time');
        if (timeEl) timeEl.textContent = hh + ':' + mm + ':' + ss;
    }
    function updateDate() {
        var now = new Date();
        var month = now.getMonth() + 1;
        var date = now.getDate();
        var dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        var day = dayNames[now.getDay()];

        var monthEl = document.getElementById('c_clock_date_month');
        var dateEl = document.getElementById('c_clock_date_date');
        var dayEl = document.getElementById('c_clock_date_day');

        if (monthEl) monthEl.textContent = month;
        if (dateEl) dateEl.textContent = date;
        if (dayEl) dayEl.textContent = day;
    }
    updateClock();
    updateDate();
    setInterval(updateClock, 50);
    setInterval(updateDate, 1000);
})();

async function fetchBestIcon(url) {
    const res = await fetch(url)
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const icons = [...doc.querySelectorAll('link[rel*="icon"]')]

    if (icons.length) {
        icons.sort((a, b) => {
            const sa = a.getAttribute('sizes') || ''
            const sb = b.getAttribute('sizes') || ''
            return sb.localeCompare(sa)
        })

        const href = icons[0].getAttribute('href')
        return new URL(href, url).href
    }

    return null
}

$('.c_dock a').each(async function () {
    const url = $(this).attr('href')
    if (!url) return

    let icon = null

    try {
        icon = await fetchBestIcon(url)
    } catch { }

    if (!icon) {
        const domain = new URL(url).hostname
        icon = 'https://www.google.com/s2/favicons?sz=128&domain=' + domain
    }

    $(this).find('img').attr('src', icon)
})

$('#c_d_add').on('click', function (e) {
    e.preventDefault();
    $('#dock_popup_input').val(''); $('#dock_popup').addClass('active');
    setTimeout(() => $('#dock_popup_input').focus(), 100);
});

const saveDockLink = () => {
    let url = $('#dock_popup_input').val().trim();
    if (url) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${url}`;

        const newLink = `<a href="${url}"><img src="${iconUrl}" alt=""></a>`;

        $('.c_dock span').before(newLink);

        $('#dock_popup').removeClass('active');
    }
};

$('#dock_popup_save').on('click', saveDockLink);
$('#dock_popup_input').on('keypress', (e) => { if (e.which === 13) saveDockLink(); });

$('#dock_popup_cancel').on('click', () => $('#dock_popup').removeClass('active'));
$('#dock_popup').on('mousedown', function (e) {
    if (e.target === this) $(this).removeClass('active');
});

$(function () {
    var url = "https://pixabay.com/api/?key=29847654-5ae9ac91bdbfbccb569d8e919&q=nature&image_type=photo&orientation=horizontal&per_page=50";

    $.getJSON(url, function (data) {
        if (data.hits && data.hits.length > 0) {
            var pick = data.hits[Math.floor(Math.random() * data.hits.length)];
            $("#bodybackground").attr("src", pick.largeImageURL);
            $("#pixabay_source").attr("href", pick.pageURL);
        }
    });
});

$('#c_search_clear').on('click', function () {
    $('#c_search').val('').focus();
    updateSuggests('');
});

$(function () {
    const $input = $('#c_search');
    const $suggestContainer = $('#c_search_suggests');

    const MAX_ITEMS = 20;

    let selectedIndex = -1;

    function extractSearchQuery(url) {
        try {
            const u = new URL(url);
            if (u.hostname.includes('google') && u.pathname === '/search') return u.searchParams.get('q');
            if (u.hostname.includes('search.yahoo') && u.pathname.includes('/search')) return u.searchParams.get('p');
            if (u.hostname.includes('bing.com') && u.pathname === '/search') return u.searchParams.get('q');
        } catch (e) {
            return null;
        }
        return null;
    }

    function searchBrowserHistory(query) {
        return new Promise((resolve) => {
            const searchText = query.trim();

            chrome.history.search({
                text: searchText,
                maxResults: 200,
                startTime: 0
            }, (results) => {
                const searchHistory = [];
                const seenQueries = new Set();

                for (const item of results) {
                    if (searchHistory.length >= MAX_ITEMS) break;

                    const extractedQuery = extractSearchQuery(item.url);

                    if (extractedQuery && !seenQueries.has(extractedQuery)) {
                        if (searchText === '' || extractedQuery.toLowerCase().includes(searchText.toLowerCase())) {
                            seenQueries.add(extractedQuery);
                            searchHistory.push({
                                text: extractedQuery,
                                url: item.url,
                                type: 'history'
                            });
                        }
                    }
                }
                resolve(searchHistory);
            });
        });
    }

    function deleteBrowserHistory(url, e) {
        e.stopPropagation();
        chrome.history.deleteUrl({ url: url }, function () {
            updateSuggests($input.val());
        });
    }

    function doSearch(query, directUrl = null) {
        if (!query) return;

        if (directUrl) {
            window.location.href = directUrl;
            return;
        }

        let url = query.trim();
        if (url.startsWith('"') && url.endsWith('"')) {
            url = url.slice(1, -1);
        }
        url = url.replace(/\\/g, '/');

        const isProtocol = /^(https?|ftp|file):\/\//i.test(url);
        const isLocalDrivePath = /^[a-zA-Z]:\//i.test(url);
        const isDomain = /\.[a-z]{2,}(\/|$)/i.test(url) || /^localhost/i.test(url);

        if (isProtocol && !url.toLowerCase().startsWith('file://')) {
            window.location.href = url;
            return;
        }
        if (isDomain && !isLocalDrivePath) {
            window.location.href = "http://" + url;
            return;
        }

        window.location.href = `https://www.google.co.jp/search?q=${encodeURIComponent(query)}`;
    }

    async function updateSuggests(query) {
        let list = [];

        try {
            const historyList = await searchBrowserHistory(query);
            list = list.concat(historyList);
        } catch (e) {
            console.error("History API Error", e);
        }

        if (query.trim() !== "" && list.length < MAX_ITEMS) {
            try {
                const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    const googleHits = data[1];
                    for (const hit of googleHits) {
                        if (list.length >= MAX_ITEMS) break;

                        if (!list.find(item => item.text === hit)) {
                            list.push({ text: hit, type: 'google' });
                        }
                    }
                }
            } catch (e) {
                console.error("Suggest API Error", e);
            }
        }

        renderSuggests(list);
    }

    function renderSuggests(list) {
        $suggestContainer.empty();
        selectedIndex = -1;

        list.forEach((item, index) => {
            const icon = item.type === 'history'
                ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"></path></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>';

            const deleteBtn = item.type === 'history'
                ? `<div class="c_s_suggest_delete c_s_suggest_icon" title="履歴から削除">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                   </div>`
                : '';

            const $el = $(`
                <div class="c_s_suggest" data-index="${index}" data-url="${item.url || ''}">
                    <div class="c_s_suggest_icon">${icon}</div>
                    <p title="${item.text}">${item.text}</p>
                    ${deleteBtn}
                </div>
            `);

            $el.on('click', function (e) {
                if ($(e.target).closest('.c_s_suggest_delete').length) return;
                const url = $(this).data('url');
                const text = $(this).find('p').text();
                doSearch(text, url);
            });

            $el.find('.c_s_suggest_delete').on('click', (e) => deleteBrowserHistory(item.url, e));

            $el.on('mouseenter', function () {
                $('.c_s_suggest').removeClass('selected');
                selectedIndex = $(this).data('index');
            });

            $suggestContainer.append($el);
        });

        let totalHeight = list.length * 48;
        const maxDvhHeight = window.innerHeight * 0.6; const finalHeight = Math.min(totalHeight, maxDvhHeight);
        $suggestContainer.css('--suggest-total-height', finalHeight + 'px');
    }

    $input.on('input focus', function () {
        updateSuggests($(this).val());
    });

    $input.on('keydown', function (e) {
        const $items = $('.c_s_suggest');
        const listLength = $items.length;
        const $selectedItem = $items.filter('.selected');

        if (e.key === 'Enter') {
            if (e.originalEvent.isComposing) return;
            e.preventDefault();

            if ($selectedItem.length > 0) {
                const selectedText = $selectedItem.find('p').text();
                const selectedUrl = $selectedItem.data('url');
                doSearch(selectedText, selectedUrl);
            } else {
                doSearch($input.val());
            }
        }

        if (listLength === 0) return;

        if (e.key === 'Tab' || e.key === 'ArrowDown') {
            e.preventDefault();
            let currentIdx = $selectedItem.length > 0 ? $selectedItem.index() : -1;
            let nextIdx = (currentIdx >= listLength - 1) ? (e.key === 'Tab' && e.shiftKey ? listLength - 1 : 0) : currentIdx + 1;

            if (e.key === 'Tab' && e.shiftKey) {
                nextIdx = (currentIdx <= 0) ? listLength - 1 : currentIdx - 1;
            }

            $items.removeClass('selected');
            const $next = $items.eq(nextIdx);
            $next.addClass('selected');
            $input.val($next.find('p').text());

        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            let currentIdx = $selectedItem.length > 0 ? $selectedItem.index() : -1;
            let nextIdx = (currentIdx <= 0) ? listLength - 1 : currentIdx - 1;
            $items.removeClass('selected');
            const $next = $items.eq(nextIdx);
            $next.addClass('selected');
            $input.val($next.find('p').text());
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.c_search').length) {
            $('.c_s_suggest').removeClass('selected');
            selectedIndex = -1;
        }
    });
});

$(function () {
    var STORAGE_KEY = 'todos';

    function getTodos() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch (e) { return []; }
    }

    function saveTodos(todos) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); } catch (e) { }
    }

    function findTodoIndexById(id) {
        var todos = getTodos();
        return todos.findIndex(function (t) { return String(t.id) === String(id); });
    }

    function renderTodos() {
        var todos = getTodos();
        var $wrap = $('.l_t_todos').first();
        if (!$wrap.length) return;
        $wrap.empty();

        todos.forEach(function (item) {
            var $el = $('<div class="l_t_todo" data-id="' + item.id + '"></div>');
            var $done = $('<div class="l_t_todos_done"></div>');
            var $p = $('<p></p>').text(item.text);
            if (item.done) $el.addClass('done');
            $el.append($done).append($p);
            $wrap.append($el);
        });
        updateTodoCount();
    }

    function updateTodoCount() {
        var todos = getTodos();
        var $ttl = $('.l_t_ttl p').first();
        if (!$ttl.length) return;
        $ttl.text('To-Do (' + todos.length + ')');
    }

    renderTodos();

    $(document).on('todo:edited', '.l_t_todo', function (e, newText) {
        var $todo = $(this);
        var id = $todo.data('id');
        var todos = getTodos();

        if (id) {
            var idx = todos.findIndex(function (t) { return String(t.id) === String(id); });
            if (idx !== -1) {
                todos[idx].text = newText;
                saveTodos(todos);
                return;
            }
        }

        var newId = Date.now() + Math.floor(Math.random() * 1000);
        $todo.attr('data-id', newId);
        $todo.removeData('isNew');
        todos.push({ id: newId, text: newText, done: false });
        saveTodos(todos);
        updateTodoCount();
    });

    $(document).on('click', '.l_t_todos_done', function () {
        var $btn = $(this);
        var $todo = $btn.parent('.l_t_todo');
        var id = $todo.data('id');

        $todo.toggleClass('done');

        var existing = $todo.data('removeTimeout');
        if (existing) { clearTimeout(existing); $todo.removeData('removeTimeout'); }

        var todos = getTodos();
        var idx = findTodoIndexById(id);
        if (idx !== -1) { todos[idx].done = $todo.hasClass('done'); saveTodos(todos); }

        if ($todo.hasClass('done')) {
            var t = setTimeout(function () {
                var id2 = $todo.data('id');
                $todo.fadeOut(400, function () {
                    $(this).remove();
                    var arr = getTodos();
                    var i2 = arr.findIndex(function (t) { return String(t.id) === String(id2); });
                    if (i2 !== -1) { arr.splice(i2, 1); saveTodos(arr); updateTodoCount(); }
                });
            }, 3000);
            $todo.data('removeTimeout', t);
        } else {
            $todo.stop(true, true).show();
        }
    });
});

(function ($) {
    $(function () {
        var EDIT_INPUT_CLASS = 'todo-edit-input';

        function findTextEl($todo) {
            var $el = $todo.find('.l_t_todo_text');
            if (!$el.length) $el = $todo.find('p');
            if (!$el.length) $el = $todo.find('span');
            if (!$el.length) $el = $todo.find('label');
            if (!$el.length) $el = $todo.contents().filter(function () { return this.nodeType === 3 && $.trim(this.nodeValue); }).first().parent();
            return $el.length ? $el : null;
        }

        function startEdit($todo) {
            if ($todo.hasClass('editing')) return;

            var existing = $todo.data('removeTimeout');
            if (existing) {
                clearTimeout(existing);
                $todo.removeData('removeTimeout');
            }

            var $textEl = findTextEl($todo);
            if (!$textEl) return;

            var orig = $.trim($textEl.text());
            $todo.data('origText', orig);

            var $doneBtn = $todo.find('.l_t_todos_done').first();
            if ($doneBtn.length) {
                $todo.data('doneHtml', $doneBtn.prop('outerHTML'));
                $doneBtn.hide();
            }

            $todo.addClass('editing');
            $textEl.hide();

            var $input = $('<input type="text">').addClass(EDIT_INPUT_CLASS).val(orig);
            $textEl.after($input);
            $input.focus().select();

            function restoreDone() {
                var doneHtml = $todo.data('doneHtml');
                if (doneHtml) {
                    if ($todo.find('.l_t_todos_done').length === 0) {
                        $todo.prepend($(doneHtml));
                    } else {
                        $todo.find('.l_t_todos_done').show();
                    }
                    $todo.removeData('doneHtml');
                }
            }

            function cleanup() {
                $input.off();
                $input.remove();
                $todo.removeClass('editing');
                $todo.removeData('origText');
            }

            function save() {
                var v = $.trim($input.val());
                if (v === '') {
                    if ($todo.data('isNew')) {
                        $todo.remove();
                        return;
                    }
                    v = $todo.data('origText') || '';
                }
                $textEl.text(v).show();
                cleanup();
                restoreDone();
                $todo.trigger('todo:edited', [v]);
            }

            function cancel() {
                if ($todo.data('isNew')) {
                    $todo.remove();
                    return;
                }
                $textEl.show();
                cleanup();
                restoreDone();
            }

            $input.on('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    save();
                } else if (e.key === 'Escape' || e.key === 'Esc') {
                    e.preventDefault();
                    cancel();
                }
            });

            $input.on('blur', function () {
                save();
            });
        }

        $(document).on('click', '.l_t_todo', function (e) {
            if ($(e.target).closest('.l_t_todos_done, .l_t_todo_delete, button, a, input, textarea, select').length) return;
            if ($(e.target).closest('.' + EDIT_INPUT_CLASS).length) return;
            startEdit($(this));
        });

        $(document).on('click', '.l_todo', function (e) {
            if ($(e.target).closest('.l_t_todo').length) return;
            if ($(e.target).closest('.l_t_todos_done, .l_t_todo_delete, button, a, input, textarea, select').length) return;

            var $todosWrap = $(this).find('.l_t_todos').first();
            if (!$todosWrap.length) return;

            var $new = $('<div class="l_t_todo"><div class="l_t_todos_done"></div><p></p></div>');
            $todosWrap.append($new);
            $new.data('isNew', true);

            startEdit($new);
        });

        $(document).on('todo:edited', '.l_t_todo', function (e, newText) {
            var $todo = $(this);
        });
    });
})(jQuery);

$(function () {
    var ALERT_KEY = 'alert_data'; var CAL_KEY = 'calEvents';
    function getHolidaysForYear(year) {
        const holidays = {};
        const add = (m, d, name) => {
            const key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            holidays[key] = name;
        };
        add(1, 1, "元日"); add(2, 11, "建国記念の日"); add(2, 23, "天皇誕生日");
        add(4, 29, "昭和の日"); add(5, 3, "憲法記念日"); add(5, 4, "みどりの日");
        add(5, 5, "こどもの日"); add(8, 11, "山の日"); add(11, 3, "文化の日"); add(11, 23, "勤労感謝の日");
        add(3, Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)), "春分の日");
        add(9, Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)), "秋分の日");
        const addHM = (m, n, name) => {
            let first = new Date(year, m - 1, 1).getDay();
            let d = ((8 - first) % 7 + 1) + (n - 1) * 7;
            add(m, d, name);
        };
        addHM(1, 2, "成人の日"); addHM(7, 3, "海の日"); addHM(9, 3, "敬老の日"); addHM(10, 2, "スポーツの日");

        Object.keys(holidays).sort().forEach(k => {
            let d = new Date(k);
            if (d.getDay() === 0) {
                let s = new Date(d); s.setDate(s.getDate() + 1);
                let sk = s.toISOString().split('T')[0];
                if (!holidays[sk]) holidays[sk] = "振替休日";
            }
        });
        return holidays;
    }

    function getAutoTarget() {
        var now = new Date();
        var currentYear = now.getFullYear();

        var calEvents = {};
        try {
            calEvents = JSON.parse(localStorage.getItem(CAL_KEY)) || {};
        } catch (e) { }

        var holidays = { ...getHolidaysForYear(currentYear), ...getHolidaysForYear(currentYear + 1) };

        var sortedCalKeys = Object.keys(calEvents).sort();
        for (var i = 0; i < sortedCalKeys.length; i++) {
            var dateStr = sortedCalKeys[i];
            var targetDate = new Date(dateStr);
            var todayStr = now.toISOString().split('T')[0];

            if (dateStr >= todayStr) {
                return {
                    title: calEvents[dateStr],
                    datetime: targetDate.toISOString(),
                    type: 'calendar'
                };
            }
        }

        var sortedHolKeys = Object.keys(holidays).sort();
        for (var i = 0; i < sortedHolKeys.length; i++) {
            var dateStr = sortedHolKeys[i];
            var todayStr = now.toISOString().split('T')[0];

            if (dateStr >= todayStr) {
                var targetDate = new Date(dateStr);
                return {
                    title: "祝日: " + holidays[dateStr], datetime: targetDate.toISOString(),
                    type: 'holiday'
                };
            }
        }

        return { title: '予定なし', datetime: '' };
    }
    function getAlert() {
        try {
            var raw = localStorage.getItem(ALERT_KEY);
            if (!raw) {
                var auto = getAutoTarget();
                saveAlert(auto);
                return auto;
            }
            var data = JSON.parse(raw);
            if (!data.datetime || data.title === '未設定') {
                var auto = getAutoTarget();
                if (auto.datetime) {
                    saveAlert(auto);
                    return auto;
                }
            }
            return data;
        } catch (e) {
            return getAutoTarget();
        }
    }

    function saveAlert(data) {
        try {
            localStorage.setItem(ALERT_KEY, JSON.stringify(data));
            localStorage.setItem('alertData', JSON.stringify(data));
        } catch (e) { }
    }

    function updateAlertDisplay() {
        var alertData = getAlert();
        var $title = $('.l_a_main_title');
        var $days = $('.l_a_main_days');
        var $time = $('.l_a_main_time');

        if ($title.length) $title.text(alertData.title);

        if (!alertData.datetime) {
            if ($days.length) $days.text('-');
            if ($time.length) $time.text('予定なし');
            return;
        }

        var now = new Date();
        var target = new Date(alertData.datetime);
        var diff = target - now;

        if (diff <= 0) {
            var isToday = now.toDateString() === target.toDateString();

            if (diff < -86400000) {
                if ($days.length) $days.text('-');
                if ($time.length) $time.text('Finished');
            } else {
                if ($days.length) $days.text('0');
                if ($time.length) $time.text('00:00:00');
            }
            return;
        }

        var totalSeconds = Math.floor(diff / 1000);
        var days = Math.floor(totalSeconds / (24 * 3600));
        var hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        if ($days.length) $days.text(days);
        if ($time.length) $time.text(String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0'));
    }

    updateAlertDisplay();
    setInterval(updateAlertDisplay, 1000);
    $('.l_a_settings').hide();

    $(document).on('click', '.l_a_main', function () {
        var current = getAlert();
        $('#l_a_settings_title').val(current.title);
        if (current.datetime) {
            var d = new Date(current.datetime);
            var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            $('#l_a_settings_datetime').val(iso);
        }
        $('.l_a_main').fadeOut(200, function () {
            $('.l_a_settings').fadeIn(200);
        });
    });

    $('#l_a_settings_cancel').on('click', function () {
        $('.l_a_settings').fadeOut(200, function () {
            $('.l_a_main').fadeIn(200);
        });
    });

    $('#l_a_settings_submit').on('click', function () {
        var newTitle = $('#l_a_settings_title').val().trim();
        var newDatetime = $('#l_a_settings_datetime').val();

        if (newTitle && newDatetime) {
            saveAlert({
                title: newTitle,
                datetime: new Date(newDatetime).toISOString()
            });
        }
        updateAlertDisplay();
        $('.l_a_settings').fadeOut(300, function () {
            $('.l_a_main').fadeIn(300);
        });
    });

    $(document).on('click', '#l_a_settings_clear', function (e) {
        e.preventDefault();

        var next = getAutoTarget();
        saveAlert(next);

        $('#l_a_settings_title').val(next.title);

        updateAlertDisplay();
        $('.l_a_settings').fadeOut(200, function () {
            $('.l_a_main').fadeIn(200);
        });
    });
});

let animTimeout = null;

function renderCalendar(year, month, direction) {
    if (isAnimating) {
        clearTimeout(animTimeout);
        $('#cal_slider .anim-leave').remove();
        $('.r_c_reminder .anim-leave').remove();
        $('.anim-enter').removeClass('anim-enter').css({ opacity: 1, position: 'relative' });
        isAnimating = false;
    }

    const $calSlider = $('#cal_slider');
    const $remSlider = $('.r_c_reminder');
    const events = getEvents();
    const holidays = { ...getFullHolidays(year - 1), ...getFullHolidays(year), ...getFullHolidays(year + 1) };

    $('#cal_label').text(`${year}年 ${String(month + 1).padStart(2, '0')}月`);

    $('#cal_label').on('click', function () {
        if (typeof current !== 'undefined') {
            current = new Date();
            renderCalendar(current.getFullYear(), current.getMonth());
        }
    });

    const getDayHtml = (y, m, d, isOther) => {
        const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hol = holidays[key], ev = events[key];
        let cls = ['day'];
        if (isOther) cls.push('other-month');
        if (y === new Date().getFullYear() && m === new Date().getMonth() && d === new Date().getDate()) cls.push('today');
        const dayIdx = new Date(y, m, d).getDay();
        if (dayIdx === 0) cls.push('sun');
        if (dayIdx === 6) cls.push('sat');
        if (hol) cls.push('holiday');
        if (ev) cls.push('has-event');
        return `<div class="${cls.join(' ')}" data-date="${key}" title="${hol || ''}">${d}</div>`;
    };

    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    let calHtml = '';
    for (let i = 0; i < first; i++) calHtml += getDayHtml(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, prevLast - first + 1 + i, true);
    for (let i = 1; i <= last; i++) calHtml += getDayHtml(year, month, i, false);
    for (let i = 1; i <= (42 - (first + last)); i++) calHtml += getDayHtml(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i, true);
    const $newGrid = $('<div class="r_c_days"></div>').html(calHtml);

    let remHtml = '<div class="r_c_r_list">';
    const monthlyKeys = Object.keys(events).filter(k => {
        const [y, m] = k.split('-').map(Number);
        return y === year && m === (month + 1);
    }).sort();
    monthlyKeys.forEach(k => {
        remHtml += `<div class="r_c_r_contain" data-date="${k}"><p class="r_c_r_when">${k.split('-')[2]}</p><p class="r_c_r_what">${events[k]}</p></div>`;
    });
    const $newList = $(remHtml + '</div>');


    if (!direction) {
        $calSlider.empty().append($newGrid);
        $remSlider.empty().append($newList);
    } else {
        isAnimating = true;
        const dir = direction === 'next' ? ['anim-next-enter', 'anim-next-leave'] : ['anim-prev-enter', 'anim-prev-leave'];

        const $oldGrid = $calSlider.children('.r_c_days');
        const $oldList = $remSlider.children('.r_c_r_list');

        const absoluteStyle = { position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 0, transition: 'all 0.35s ease' };

        $oldGrid.addClass(dir[1] + ' anim-leave').css(absoluteStyle);
        $oldList.addClass('anim-leave').css({ ...absoluteStyle, opacity: 0 });

        $newGrid.addClass(dir[0] + ' anim-enter');
        $newList.addClass('anim-enter').css({ opacity: 0, transition: 'opacity 0.35s ease' });

        $calSlider.append($newGrid);
        $remSlider.append($newList);

        requestAnimationFrame(() => {
            $newList.css('opacity', 1);
        });

        animTimeout = setTimeout(() => {
            $oldGrid.remove();
            $oldList.remove();
            $newGrid.removeClass(dir[0] + ' anim-enter');
            $newList.removeClass('anim-enter').css({ transition: '', opacity: '' });
            isAnimating = false;
        }, 350);
    }
}

$(function () {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let isAnimating = false;
    let editingDockLink = null;
    let selectedDateKey = null;

    const getEvents = () => JSON.parse(localStorage.getItem('calEvents')) || {};
    const saveEvents = (data) => localStorage.setItem('calEvents', JSON.stringify(data));

    const getDockLinks = () => {
        const raw = JSON.parse(localStorage.getItem('dockLinks'));

        if (!raw || raw.length === 0) {
            const defaults = [
                { url: 'https://youtube.com' },
                { url: 'https://chatgpt.com' },
                { url: 'https://amazon.co.jp' }
            ];
            localStorage.setItem('dockLinks', JSON.stringify(defaults));
            return defaults;
        }

        return raw.filter(link => link && link.url && link.url.length > 5);
    };

    const saveDockLinks = () => {
        const links = [];
        $('.c_dock a').each(function () {
            const url = $(this).attr('data-url');
            if (url && url !== "undefined") {
                links.push({ url: url });
            }
        });
        localStorage.setItem('dockLinks', JSON.stringify(links));
    };

    function getFullHolidays(year) {
        const holidays = {};
        const add = (m, d, name) => holidays[`${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`] = name;
        add(1, 1, "元日"); add(2, 11, "建国記念の日"); add(2, 23, "天皇誕生日");
        add(4, 29, "昭和の日"); add(5, 3, "憲法記念日"); add(5, 4, "みどりの日");
        add(5, 5, "こどもの日"); add(8, 11, "山の日"); add(11, 3, "文化の日"); add(11, 23, "勤労感謝の日");
        add(3, Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)), "春分の日");
        add(9, Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)), "秋分の日");
        const addHM = (m, n, name) => {
            let first = new Date(year, m - 1, 1).getDay();
            let d = ((8 - first) % 7 + 1) + (n - 1) * 7;
            add(m, d, name);
        };
        addHM(1, 2, "成人の日"); addHM(7, 3, "海の日"); addHM(9, 3, "敬老の日"); addHM(10, 2, "スポーツの日");
        Object.keys(holidays).forEach(k => {
            let d = new Date(k);
            if (d.getDay() === 0) {
                let s = new Date(d); let sk;
                do { s.setDate(s.getDate() + 1); sk = s.toISOString().split('T')[0]; } while (holidays[sk]);
                holidays[sk] = "振替休日";
            }
        });
        return holidays;
    }

    function renderCalendar(year, month, direction) {
        if (isAnimating) return;

        const $calSlider = $('#cal_slider');
        const $remSlider = $('.r_c_reminder');
        const events = getEvents();
        const holidays = { ...getFullHolidays(year - 1), ...getFullHolidays(year), ...getFullHolidays(year + 1) };

        $('#cal_label').text(`${year}年 ${String(month + 1).padStart(2, '0')}月`);

        const first = new Date(year, month, 1).getDay();
        const last = new Date(year, month + 1, 0).getDate();
        const prevLast = new Date(year, month, 0).getDate();
        let calHtml = '';

        const getDayHtml = (y, m, d, isOther) => {
            const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let cls = ['day'];
            if (isOther) cls.push('other-month');
            if (y === new Date().getFullYear() && m === new Date().getMonth() && d === new Date().getDate()) cls.push('today');
            if (new Date(y, m, d).getDay() === 0 || holidays[key]) cls.push('sun');
            if (new Date(y, m, d).getDay() === 6) cls.push('sat');
            if (events[key]) cls.push('has-event');
            let title = [];
            if (holidays[key]) title.push(holidays[key]);
            if (events[key]) title.push(events[key]);
            return `<div class="${cls.join(' ')}" data-date="${key}" title="${title.join(' / ')}">${d}</div>`;
        };

        for (let i = 0; i < first; i++) calHtml += getDayHtml(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, prevLast - first + 1 + i, true);
        for (let i = 1; i <= last; i++) calHtml += getDayHtml(year, month, i, false);
        const currentDaysCount = first + last;
        const nextDaysCount = (currentDaysCount <= 35) ? 35 - currentDaysCount : 42 - currentDaysCount;
        for (let i = 1; i <= nextDaysCount; i++) calHtml += getDayHtml(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i, true);

        const $newGrid = $('<div class="r_c_days"></div>').html(calHtml);

        let remHtml = '<div class="r_c_r_list">';
        Object.keys(events).filter(k => {
            const [y, m] = k.split('-').map(Number);
            return y === year && m === (month + 1);
        }).sort().forEach(k => {
            remHtml += `<div class="r_c_r_contain" data-date="${k}"><p class="r_c_r_when">${k.split('-')[2]}</p><p class="r_c_what">${events[k]}</p></div>`;
        });
        const $newList = $(remHtml + '</div>');

        if (!direction) {
            $calSlider.empty().append($newGrid);
            $remSlider.empty().append($newList);
        } else {
            isAnimating = true;
            const dirClass = direction === 'next' ? ['anim-next-enter', 'anim-next-leave'] : ['anim-prev-enter', 'anim-prev-leave'];

            $calSlider.css('height', $calSlider.height() + 'px');

            const $oldGrid = $calSlider.children('.r_c_days');
            const $oldList = $remSlider.children('.r_c_r_list');

            $oldGrid.addClass(dirClass[1] + ' anim-leave');
            $oldList.addClass('anim-fade-out'); $newGrid.addClass(dirClass[0] + ' anim-enter');
            $newList.addClass('anim-fade-in-start');

            $calSlider.append($newGrid);
            $remSlider.append($newList);

            requestAnimationFrame(() => {
                $newList.removeClass('anim-fade-in-start').addClass('anim-fade-in-end');
            });

            setTimeout(() => {
                $oldGrid.remove();
                $oldList.remove();
                $newGrid.removeClass(dirClass[0] + ' anim-enter');
                $newList.removeClass('anim-fade-in-end');
                $calSlider.css('height', ''); isAnimating = false;
            }, 300);
        }
    }

    const dockEl = document.querySelector('.c_dock');
    Sortable.create(dockEl, {
        draggable: "a",
        filter: "span",
        preventOnFilter: true,
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => saveDockLinks()
    });

    const initDock = () => {
        $('.c_dock a').remove();
        const links = getDockLinks();
        links.forEach(link => {
            const icon = `https://www.google.com/s2/favicons?sz=64&domain=${link.url}`;
            $('.c_dock span').before(`<a href="${link.url}" target="_blank" data-url="${link.url}"><img src="${icon}"></a>`);
        });
    };

    const handleDockSave = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        let url = $('#dock_popup_input').val().trim();

        if (!url || url.length < 3) {
            $('#dock_popup').removeClass('active');
            return;
        }

        if (!editingDockLink && $('.c_dock a').length >= 10) {
            alert('リンクは最大10個までです。');
            $('#dock_popup').removeClass('active');
            return;
        }

        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        const icon = `https://www.google.com/s2/favicons?sz=64&domain=${url}`;

        if (editingDockLink) {
            editingDockLink.attr('href', url).attr('data-url', url).find('img').attr('src', icon);
        } else {
            $('.c_dock span').before(`<a href="${url}" target="_blank" data-url="${url}"><img src="${icon}"></a>`);
        }
        $('#dock_popup').removeClass('active');
        editingDockLink = null;
        saveDockLinks();
    };


    $('#cal_prev').on('click', () => { if (!isAnimating) { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(currentYear, currentMonth, 'prev'); } });
    $('#cal_next').on('click', () => { if (!isAnimating) { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(currentYear, currentMonth, 'next'); } });

    $(document).on('click', '.day:not(.other-month), .r_c_r_contain', function () {
        selectedDateKey = $(this).data('date');
        $('#r_c_popup_modal_date').text(selectedDateKey.replace(/-/g, '/'));
        $('#r_c_popup_modal_input').val(getEvents()[selectedDateKey] || "");
        $('#r_c_popup').addClass('active');
        setTimeout(() => $('#r_c_popup_modal_input').focus(), 150);
    });
    $('#r_c_popup_modal_btns_save').on('click', () => {
        const ev = getEvents(); const val = $('#r_c_popup_modal_input').val().trim();
        if (val) ev[selectedDateKey] = val; else delete ev[selectedDateKey];
        saveEvents(ev); $('#r_c_popup').removeClass('active'); renderCalendar(currentYear, currentMonth);
    });
    $('#r_c_popup_modal_btns_cancel').on('click', () => $('#r_c_popup').removeClass('active'));
    $('#r_c_popup_modal_delete').on('click', () => { $('#r_c_popup_modal_input').val(''); $('#r_c_popup_modal_btns_save').click(); });

    $('#c_d_add').on('click', () => {
        if ($('.c_dock a').length >= 10) {
            alert('リンクは最大10個までです。');
            return;
        }
        editingDockLink = null; $('#dock_popup_input').val('');
        $('#dock_popup').addClass('active');
        setTimeout(() => $('#dock_popup_input').focus(), 150);
    });

    $('#dock_popup_save').off('click').on('click', handleDockSave);
    $('#dock_popup_cancel').on('click', () => $('#dock_popup').removeClass('active'));
    $('#dock_popup_input').on('keydown', (e) => { if (e.which === 13) handleDockSave(e); });


    document.addEventListener('contextmenu', function (e) {
        const a = e.target.closest('.c_dock a');
        if (!a) return;

        e.preventDefault();
        editingDockLink = $(a);

        const menu = $('#dock_context_menu');
        menu.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px',
            display: 'block'
        });
    }, true);

    $(document).on('click', function () {
        $('#dock_context_menu').hide();
    });

    $(document).on('click', () => $('#dock_context_menu').hide());

    $('#dock_edit_btn').on('click', () => {
        $('#dock_popup_input').val(editingDockLink.attr('data-url'));
        $('#dock_popup').addClass('active');
        setTimeout(() => $('#dock_popup_input').focus(), 150);
    });

    $('#dock_delete_btn').on('click', () => { if (editingDockLink) { editingDockLink.remove(); saveDockLinks(); } });

    initDock();
    renderCalendar(currentYear, currentMonth);
});

$(function () {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();


    function setNearestHolidayToAlert() {
        const now = new Date();
        const currentYear = now.getFullYear();

        const allHolidays = {
            ...getFullHolidays(currentYear),
            ...getFullHolidays(currentYear + 1)
        };

        let nearestDate = null;
        let holidayName = "";

        const sortedKeys = Object.keys(allHolidays).sort();
        for (let key of sortedKeys) {
            const hDate = new Date(key);
            const todayEdge = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (hDate >= todayEdge) {
                nearestDate = hDate;
                holidayName = allHolidays[key];
                break;
            }
        }

        if (nearestDate) {
            const currentAlert = JSON.parse(localStorage.getItem('alertData'));

            if (!currentAlert || !currentAlert.title || currentAlert.title === "Alert") {
                const newData = {
                    title: holidayName,
                    datetime: nearestDate.toISOString()
                };
                localStorage.setItem('alertData', JSON.stringify(newData));

                if (typeof updateAlertDisplay === 'function') {
                    updateAlertDisplay();
                }
            }
        }
    }

    renderCalendar(currentYear, currentMonth);
    setNearestHolidayToAlert();
});

$(function () {
    const $slider = $('#cal_slider')
    const $label = $('#cal_label')
    const $popup = $('#r_c_popup')
    const $popupDate = $('#r_c_popup_modal_date')
    const $popupInput = $('#r_c_popup_modal_input')
    const $list = $('#r_c_list')

    let current = new Date()
    let events = JSON.parse(localStorage.getItem('calendar_events') || '{}')
    let animating = false

    function keyOf(date) {
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate()
    }

    function saveEvents() {
        localStorage.setItem('calendar_events', JSON.stringify(events))
    }

    function renderList() {
        $list.empty()
        Object.keys(events).sort().forEach(k => {
            $('<div class="r_c_list_item"></div>')
                .append('<span class="date">' + k + '</span>')
                .append('<span class="text">' + events[k] + '</span>')
                .appendTo($list)
        })
    }

    function renderCalendar(date, dir = 0) {
        if (animating) return
        animating = true

        const year = date.getFullYear()
        const month = date.getMonth()

        $label.text(year + '年 ' + (month + 1) + '月')

        const first = new Date(year, month, 1).getDay()
        const last = new Date(year, month + 1, 0).getDate()

        const $new = $('<div class="cal_page"></div>')

        for (let i = 0; i < first; i++) {
            $new.append('<span class="empty"></span>')
        }

        for (let d = 1; d <= last; d++) {
            const dateObj = new Date(year, month, d)
            const key = keyOf(dateObj)
            const $day = $('<span></span>').text(d).data('date', key)
            if (events[key]) $day.addClass('has')
            $new.append($day)
        }

        $new.css('left', dir > 0 ? '100%' : dir < 0 ? '-100%' : '0')

        $slider.append($new)

        requestAnimationFrame(() => {
            $new.css('left', '0')
            $slider.find('.cal_page').not($new).css('left', dir > 0 ? '-100%' : '100%')
        })

        setTimeout(() => {
            $slider.find('.cal_page').not($new).remove()
            animating = false
        }, 300)
    }

    $('#cal_prev').on('click', function () {
        current.setMonth(current.getMonth() - 1)
        renderCalendar(current, -1)
    })

    $('#cal_next').on('click', function () {
        current.setMonth(current.getMonth() + 1)
        renderCalendar(current, 1)
    })

    $(document).on('click', '#cal_slider span:not(.empty)', function () {
        const key = $(this).data('date')
        $popupDate.text(key)
        $popupInput.val(events[key] || '')
        $popup.data('date', key).addClass('active')
    })

    $('#r_c_popup_modal_btns_cancel').on('click', function () {
        $popup.removeClass('active')
    })

    $('#r_c_popup_modal_btns_save').on('click', function () {
        const key = $popup.data('date')
        const val = $popupInput.val().trim()
        if (val) {
            events[key] = val
        } else {
            delete events[key]
        }
        saveEvents()
        renderCalendar(current, 0)
        renderList()
        $popup.removeClass('active')
    })

    $('#r_c_popup_modal_delete').on('click', function () {
        const key = $popup.data('date')
        delete events[key]
        saveEvents()
        renderCalendar(current, 0)
        renderList()
        $popup.removeClass('active')
    })

    renderCalendar(current)
    renderList()
})

$('#c_d_settings, #info_popup').on('click', function () {
    $('#info_popup').toggleClass('active');
})

$(function () {
    const $bgImage = $('#bodybackground');
    const $bgContainer = $('.bodybackground');
    const $dropping = $('#dropping');
    const $pixabayLink = $('#pixabay_source');
    const $beDefaultBtn = $('.popup_bedefault');

    if ($('#bodybackground_video').length === 0) {
        $bgContainer.append('<video id="bodybackground_video" autoplay loop muted playsinline style="display:none;"></video>');
    }
    const $bgVideo = $('#bodybackground_video');

    const dbName = "backgroundDB";
    const storeName = "files";
    let db;

    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(storeName);
    };
    request.onsuccess = (e) => {
        db = e.target.result;
        loadBackground();
    };

    function resetBackground(e) {
        if (e) e.preventDefault();
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        store.delete("currentBackground").onsuccess = () => {
            location.reload();
        };
    }

    function saveBackground(file) {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        store.put(file, "currentBackground");
    }

    function applyFile(file, isCustom = false) {
        const fileUrl = URL.createObjectURL(file);
        const type = file.type;

        if (isCustom) {
            $beDefaultBtn.addClass('active');

            $pixabayLink.text('背景をデフォルト(Pixabay)に戻す')
                .attr('href', '#')
                .attr('target', '_self')
                .off('click')
                .on('click', resetBackground);

            $beDefaultBtn.off('click').on('click', resetBackground);
        } else {
            $beDefaultBtn.removeClass('active').off('click');
        }

        if (type.startsWith('image/')) {
            $bgVideo.hide().attr('src', '');
            $bgImage.show().attr('src', fileUrl);
        } else if (type.startsWith('video/')) {
            $bgImage.hide().attr('src', '');
            $bgVideo.show().attr('src', fileUrl);
            $bgVideo[0].play();
        }
    }

    function loadBackground() {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const getRequest = store.get("currentBackground");
        getRequest.onsuccess = () => {
            if (getRequest.result) {
                applyFile(getRequest.result, true);
            } else {
                $beDefaultBtn.removeClass('active');
            }
        };
    }

    let dragCounter = 0;

    $(document).on('dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        if (dragCounter === 1) $dropping.addClass('active');
    });

    $(document).on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $(document).on('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter--;
        if (dragCounter === 0) $dropping.removeClass('active');
    });

    $(document).on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        $dropping.removeClass('active');

        const files = e.originalEvent.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            applyFile(file, true);
            saveBackground(file);
        }
    });
});