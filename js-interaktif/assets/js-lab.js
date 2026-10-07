// Mesin lab bersama (HTML + CSS + JavaScript): editor -> jalankan di iframe ber-sandbox -> console, variabel, pohon DOM, pemeriksa tantangan
(function () {
    const LESSONS = window.LAB_LESSONS || [
        ['index.html', '🏠 Beranda'], ['01-pengenalan.html', '1 · Pengenalan'], ['02-variabel-tipe.html', '2 · Variabel & Tipe Data'],
        ['03-operator-kondisi.html', '3 · Operator & Kondisi'], ['04-perulangan.html', '4 · Perulangan'], ['05-fungsi.html', '5 · Fungsi'],
        ['06-array-object.html', '6 · Array & Object'], ['07-dom-pilih.html', '7 · DOM: Memilih & Mengubah'],
        ['08-dom-buat.html', '8 · DOM: Membuat & Menghapus'], ['09-event.html', '9 · Event'], ['10-proyek.html', '10 · Proyek To-do']
    ];
    const EXTRA = window.LAB_NAV_EXTRA || [['../index.html', '🗺 Semua materi']];
    window.LESSONS = LESSONS;
    const cur = location.pathname.split('/').pop() || 'index.html';
    const nav = document.getElementById('nav');
    if (nav) nav.innerHTML = LESSONS.map(([h, t]) => `<a href="${h}" class="${h === cur ? 'on' : ''}">${t}</a>`).join('') + EXTRA.map(([h, t], i) => `<a href="${h}" class="extra${i === 0 ? ' first' : ''}">${t}</a>`).join('');
    const pager = document.getElementById('pager');
    if (pager) {
        const i = LESSONS.findIndex(l => l[0] === cur), p = LESSONS[i - 1], n = LESSONS[i + 1];
        pager.innerHTML = (p ? `<a href="${p[0]}">← ${p[1]}</a>` : '<span></span>') + (n ? `<a href="${n[0]}">${n[1]} →</a>` : '<span></span>');
    }
    const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    // ---------- kode yang berjalan DI DALAM iframe (jembatan console/variabel/DOM/tes)
    function bridge() {
        var MODE = window.__MODE, TESTS = window.__TESTS || [], NAMES = [];
        function P(m) { m.src = 'jslab'; m.id = window.__ID; parent.postMessage(m, '*'); }
        function typeOf(v) { return v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v; }
        function fmt(v, d) {
            d = d || 0;
            if (typeof v === 'string') return d ? JSON.stringify(v) : v;
            if (v === undefined) return 'undefined';
            if (v === null) return 'null';
            if (typeof v === 'function') return '[Function ' + (v.name || 'anonim') + ']';
            if (typeof v === 'symbol') return v.toString();
            if (typeof v === 'bigint') return v + 'n';
            if (v instanceof Error) return v.name + ': ' + v.message;
            if (v instanceof Element) return '<' + v.tagName.toLowerCase() + (v.id ? '#' + v.id : '') + (typeof v.className === 'string' && v.className.trim() ? '.' + v.className.trim().split(/\s+/).join('.') : '') + '>';
            if (v instanceof NodeList || v instanceof HTMLCollection) return (v instanceof NodeList ? 'NodeList(' : 'HTMLCollection(') + v.length + ') [' + Array.prototype.map.call(v, function (x) { return fmt(x, d + 1); }).join(', ') + ']';
            if (Array.isArray(v)) return d > 2 ? '[…]' : '[' + v.map(function (x) { return fmt(x, d + 1); }).join(', ') + ']';
            if (v instanceof Date) return v.toISOString();
            if (v instanceof Map) return 'Map(' + v.size + ')';
            if (v instanceof Set) return 'Set(' + v.size + ')';
            if (typeof v === 'object') {
                if (d > 2) return '{…}';
                try { return '{ ' + Object.keys(v).map(function (k) { return k + ': ' + fmt(v[k], d + 1); }).join(', ') + ' }'; } catch (e) { return String(v); }
            }
            return String(v);
        }
        window.__logs = [];
        ['log', 'info', 'warn', 'error', 'debug', 'table'].forEach(function (k) {
            console[k] = function () {
                var s = [].map.call(arguments, function (a) { return fmt(a, 0); }).join(' ');
                window.__logs.push(s);
                if (MODE === 'view') P({ t: 'log', k: k === 'debug' || k === 'table' ? 'log' : k, s: s });
            };
        });
        console.clear = function () { window.__logs.length = 0; if (MODE === 'view') P({ t: 'clear' }); };
        window.alert = function (m) { console.log('[alert] ' + m); };
        window.confirm = function (m) { console.log('[confirm] ' + m); return true; };
        window.prompt = function (m, d) { console.log('[prompt] ' + m); return d || 'Tamu'; };
        window.onerror = function (msg, src, line) { P({ t: 'err', s: String(msg), line: line }); return true; };
        window.addEventListener('unhandledrejection', function (e) { P({ t: 'err', s: 'Promise ditolak: ' + (e.reason && e.reason.message || e.reason) }); });

        function tree(el, d) {
            var s = '', pad = new Array(d + 1).join('  ');
            for (var i = 0; i < el.childNodes.length; i++) {
                var n = el.childNodes[i];
                if (n.nodeType === 1) {
                    if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') continue;
                    var a = '';
                    if (n.id) a += ' id="' + n.id + '"';
                    if (typeof n.className === 'string' && n.className.trim()) a += ' class="' + n.className.trim() + '"';
                    ['href', 'src', 'type', 'name', 'charset', 'alt', 'for', 'lang'].forEach(function (k) { if (n.getAttribute && n.hasAttribute(k)) a += ' ' + k + '="' + n.getAttribute(k) + '"'; });
                    s += pad + '<' + n.tagName.toLowerCase() + a + '>\n' + tree(n, d + 1);
                } else if (n.nodeType === 3) {
                    var t = n.textContent.trim();
                    if (t) s += pad + '"' + (t.length > 40 ? t.slice(0, 40) + '…' : t) + '"\n';
                }
            }
            return s;
        }
        function snapshot() {
            var out = [];
            NAMES.forEach(function (n) {
                try {
                    var r = new Function('try{return [true,' + n + ']}catch(e){return [false]}')();
                    if (r[0]) out.push([n, typeOf(r[1]), fmt(r[1], 0)]);
                } catch (e) { }
            });
            P({ t: 'vars', v: out });
            if (window.__DOM) P({ t: 'dom', s: window.__FULL ? '<html>\n' + tree(document.documentElement, 1) : '<body>\n' + tree(document.body, 1) });
        }
        window.__done = function (names) {
            NAMES = names || [];
            if (MODE === 'view') {
                snapshot(); P({ t: 'done' });
                var tm; new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(snapshot, 40); }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
                ['click', 'input', 'change', 'submit', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { setTimeout(snapshot, 30); }, true); });
            } else {
                setTimeout(function () {
                    var res = TESTS.map(function (t) { try { return !!(new Function('return (' + t + ')')()); } catch (e) { return false; } });
                    P({ t: 'checks', r: res });
                }, 70);
            }
        };
        var st = document.createElement('style');
        st.textContent = '.__hl{outline:3px solid #f59e0b!important;outline-offset:2px;background-image:linear-gradient(rgba(245,158,11,.2),rgba(245,158,11,.2))!important}';
        (document.head || document.documentElement).appendChild(st);
        window.addEventListener('message', function (e) {
            var d = e.data; if (!d || d.src !== 'jslab-cmd' || d.t !== 'sel') return;
            Array.prototype.forEach.call(document.querySelectorAll('.__hl'), function (x) { x.classList.remove('__hl'); });
            var n = 0, err = '';
            try { var l = document.querySelectorAll(d.s); n = l.length; Array.prototype.forEach.call(l, function (x) { x.classList.add('__hl'); }); } catch (x) { err = 'selector tidak valid'; }
            P({ t: 'sel', n: n, err: err });
        });
    }
    const BRIDGE = '(' + bridge.toString() + ')()';

    // pagar pengaman: hentikan perulangan for/while tanpa ujung
    function guard(src) {
        return 'var __lg=0;' + src.replace(/\b(for|while)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\{/g,
            '$&if(++__lg>300000)throw new Error("Perulangan terlalu lama (mungkin tak berujung), dihentikan");');
    }
    function varNames(src) {
        const s = new Set(); let m;
        const r1 = /\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)/g, r2 = /\bfunction\s+([A-Za-z_$][\w$]*)/g;
        while ((m = r1.exec(src))) s.add(m[1]);
        while ((m = r2.exec(src))) s.add(m[1]);
        return [...s];
    }

    let nextId = 1;
    const handlers = {};
    addEventListener('message', e => {
        const m = e.data; if (!m || m.src !== 'jslab') return;
        const h = handlers[m.id]; if (h) h(m);
    });

    // ---------- lab
    // cfg: root, html, css, code (masing-masing opsional), preview, dom, vars, explorer, auto, checks, solution (string JS atau {html,css,js}), fullDoc
    window.initJS = function (cfg) {
        const root = document.getElementById(cfg.root || 'lab');
        const hasJs = cfg.code != null, hasHtml = cfg.html != null, hasCss = cfg.css != null;
        const keys = [];
        if (hasJs && !cfg.htmlFirst) keys.push('js');
        if (hasHtml) keys.push('html');
        if (hasCss) keys.push('css');
        if (hasJs && cfg.htmlFirst) keys.push('js');
        const LBL = { js: 'JavaScript', html: 'HTML', css: 'CSS' };
        const auto = cfg.auto != null ? cfg.auto : !!cfg.preview;
        const sol = cfg.solution == null ? null : (typeof cfg.solution === 'string' ? { js: cfg.solution } : cfg.solution);
        const solText = sol ? keys.filter(k => sol[k] != null).map(k => (keys.length > 1 ? (k === 'html' ? '<!-- HTML -->\n' : k === 'css' ? '/* CSS */\n' : '// JavaScript\n') : '') + sol[k]).join('\n\n') : '';
        const rowsPx = (cfg.rows ? cfg.rows * 21 : 240);

        root.innerHTML = `
        <div class="lab-grid">
            <div class="lab-col">
                <div class="panel">
                    <div class="ph">
                        <div class="tabs">${keys.map((k, i) => `<button class="${i === 0 ? 'on' : ''}" data-t="${k}">${LBL[k]}</button>`).join('')}</div>
                        <div><button class="mini run" id="run">▶ Jalankan</button> <button class="mini" id="reset">↺ Reset</button> <button class="mini" id="copy">📋 Salin</button></div>
                    </div>
                    ${keys.map((k, i) => `<textarea id="${k}" spellcheck="false" aria-label="Kode ${LBL[k]}" ${i ? 'hidden' : ''} style="min-height:${rowsPx}px"></textarea>`).join('')}
                    <div class="status"><label><input type="checkbox" id="auto" ${auto ? 'checked' : ''}> Jalankan otomatis saat mengetik</label> · <kbd>Ctrl</kbd>+<kbd>Enter</kbd> = jalankan</div>
                </div>
                ${sol ? '<div class="panel"><details><summary><b>💡 Lihat solusi</b></summary><pre><code id="sol"></code></pre><button class="mini" id="loadsol">Muat solusi ke editor</button></details></div>' : ''}
            </div>
            <div class="lab-col">
                <div class="panel">
                    <div class="ph"><h3>📤 Hasil</h3>${cfg.noConsole ? '' : '<button class="mini" id="clr">Bersihkan console</button>'}</div>
                    <div class="stage" id="stagebox" ${cfg.preview ? '' : 'hidden'}><iframe id="pv" sandbox="allow-scripts" title="Pratinjau" style="height:${cfg.height || 220}px"></iframe></div>
                    ${cfg.preview ? '' : '<iframe id="pv" sandbox="allow-scripts" title="Runner" style="display:none"></iframe>'}
                    ${cfg.explorer ? '<div class="explorer"><label>🔎 Coba selector: <input id="sel" placeholder="mis. .teks  atau  ul li:first-child" value="p"></label> <span id="seln"></span></div>' : ''}
                    ${cfg.noConsole ? '<div id="con" hidden></div>' : '<div class="small">Console</div><div class="console" id="con"><div class="empty">Tekan ▶ Jalankan…</div></div>'}
                    ${cfg.vars ? '<div class="small">Inspektur variabel</div><div id="vars" class="vars"></div>' : ''}
                    ${cfg.dom ? '<div class="small">Pohon DOM (live)</div><pre class="domtree" id="dom"></pre>' : ''}
                    ${cfg.checks ? '<div id="checkbox"><div class="progress"><i id="bar"></i></div><ul class="checks" id="checks"></ul></div>' : ''}
                </div>
            </div>
        </div>`;
        const $ = s => root.querySelector(s);
        const B = {}; keys.forEach(k => B[k] = $('#' + k));
        const frame = $('#pv'), con = $('#con');
        const init = { js: cfg.code, html: cfg.html, css: cfg.css };
        keys.forEach(k => B[k].value = init[k]);
        if (sol) $('#sol').textContent = solText;
        let cur = 0, tcur = 0, lineOff = 0, timer = 0, testFrame = null;

        function line(k, s) {
            if (cfg.noConsole) return;
            if (con.firstChild && con.firstChild.className === 'empty') con.innerHTML = '';
            const d = document.createElement('div'); d.className = 'ln ' + k; d.textContent = s; con.appendChild(d); con.scrollTop = con.scrollHeight;
        }
        function varsTable(list) {
            if (!cfg.vars) return;
            $('#vars').innerHTML = list.length ? '<table><thead><tr><th>Nama</th><th>Tipe</th><th>Nilai</th></tr></thead><tbody>' +
                list.map(([n, t, v]) => `<tr><td><code>${esc(n)}</code></td><td><span class="tp ${t}">${t}</span></td><td><code>${esc(v)}</code></td></tr>`).join('') + '</tbody></table>' : '<div class="empty">Belum ada variabel.</div>';
        }
        function buildDoc(mode, id, tests) {
            const html = B.html ? B.html.value : '', code = B.js ? B.js.value : '', css = B.css ? B.css.value : '';
            const conf = '<script>window.__MODE=' + JSON.stringify(mode) + ';window.__ID=' + id + ';window.__DOM=' + (!!cfg.dom) + ';window.__FULL=' + (!!cfg.fullDoc) + ';window.__TESTS=' + JSON.stringify(tests || (cfg.checks || []).map(c => c.test)).replace(/</g, '\\u003c') + ';<\/script>' +
                '<script>' + BRIDGE + '<\/script>';
            const tail = '\n<\/script><script>__done(' + JSON.stringify(varNames(code)) + ')<\/script>';
            if (cfg.fullDoc) {   // pengguna menulis seluruh dokumen (doctype, head, body)
                let h = html;
                if (/<head[^>]*>/i.test(h)) h = h.replace(/<head[^>]*>/i, m => m + conf);
                else if (/^\s*<!doctype[^>]*>/i.test(h)) h = h.replace(/^(\s*<!doctype[^>]*>)/i, '$1' + conf);
                else h = conf + h;
                return h + '<script>\n' + guard(code) + tail;
            }
            const head = '<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:12px;line-height:1.5}' + (cfg.base || '') + '</style>' +
                (B.css ? '<style>' + css + '</style>' : '') + conf + '<body>' + html + '<script>\n';
            lineOff = (head.match(/\n/g) || []).length;
            return head + guard(code) + tail;
        }
        function run() {
            clearTimeout(timer);
            cur = nextId++;
            if (!cfg.noConsole) con.innerHTML = '<div class="empty">(belum ada output)</div>';
            if (cfg.vars) varsTable([]);
            if (cfg.explorer) $('#seln').textContent = '';
            const id = cur;
            handlers[id] = m => {
                if (id !== cur) return;
                if (m.t === 'log') line(m.k, m.s);
                else if (m.t === 'clear') { if (!cfg.noConsole) con.innerHTML = ''; }
                else if (m.t === 'err') line('error', '⛔ ' + m.s + (m.line && !cfg.fullDoc ? ` (baris ${Math.max(1, m.line - lineOff)})` : ''));
                else if (m.t === 'vars') varsTable(m.v);
                else if (m.t === 'dom') $('#dom').textContent = m.s;
                else if (m.t === 'sel') $('#seln').textContent = m.err ? '⚠ ' + m.err : `→ ${m.n} elemen cocok`;
                else if (m.t === 'done') { if (cfg.explorer) sendSel(); }
            };
            frame.srcdoc = buildDoc('view', id);
            if (cfg.checks) runChecks();
        }
        let testFrames = [], checkGen = 0;
        function runChecks() {
            testFrames.forEach(f => f.remove()); testFrames = [];
            const gen = ++checkGen, groups = {};
            cfg.checks.forEach((c, i) => { const w = c.width || 800; (groups[w] = groups[w] || []).push(i); });
            const results = cfg.checks.map(() => false); let pending = Object.keys(groups).length;
            Object.keys(groups).forEach(w => {
                const idx = groups[w], id = nextId++, f = document.createElement('iframe');
                f.sandbox = 'allow-scripts'; f.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + w + 'px;height:700px;visibility:hidden;border:0';
                handlers[id] = m => {
                    if (gen !== checkGen || m.t !== 'checks') return;
                    idx.forEach((ci, j) => { results[ci] = m.r[j]; }); f.remove();
                    if (--pending === 0) paintChecks(results);
                };
                f.srcdoc = buildDoc('test', id, idx.map(i => cfg.checks[i].test));
                root.appendChild(f); testFrames.push(f);
            });
        }
        function paintChecks(r) {
            let ok = 0;
            $('#checks').innerHTML = cfg.checks.map((c, i) => { if (r[i]) ok++; return `<li class="${r[i] ? 'ok' : ''}">${c.text}</li>`; }).join('');
            $('#bar').style.width = ok / cfg.checks.length * 100 + '%';
            if (ok === cfg.checks.length) $('#checks').insertAdjacentHTML('beforeend', '<li class="ok">🎉 Semua tantangan selesai!</li>');
        }
        function sendSel() { if (frame.contentWindow) frame.contentWindow.postMessage({ src: 'jslab-cmd', t: 'sel', s: $('#sel').value }, '*'); }

        $('#run').addEventListener('click', run);
        $('#reset').addEventListener('click', () => { keys.forEach(k => B[k].value = init[k]); run(); });
        if ($('#clr')) $('#clr').addEventListener('click', () => { con.innerHTML = '<div class="empty">(console dibersihkan)</div>'; });
        $('#copy').addEventListener('click', () => {
            const t = keys.map(k => B[k]).find(x => !x.hidden), b = $('#copy');
            (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).catch(() => { t.select(); document.execCommand('copy'); });
            b.textContent = '✓ Tersalin'; setTimeout(() => b.textContent = '📋 Salin', 1200);
        });
        if (sol) $('#loadsol').addEventListener('click', () => { keys.forEach(k => { if (sol[k] != null) B[k].value = sol[k]; }); run(); });
        if (cfg.explorer) $('#sel').addEventListener('input', sendSel);
        const changed = () => { if ($('#auto').checked) { clearTimeout(timer); timer = setTimeout(run, 700); } };
        keys.forEach(k => {
            const t = B[k];
            t.addEventListener('input', changed);
            t.addEventListener('keydown', e => {
                if (e.key === 'Tab') { e.preventDefault(); t.setRangeText('  ', t.selectionStart, t.selectionEnd, 'end'); changed(); }
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
            });
        });
        root.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
            root.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
            keys.forEach(k => B[k].hidden = k !== b.dataset.t);
        }));
        if (cfg.checks) $('#checks').innerHTML = cfg.checks.map(c => `<li>${c.text}</li>`).join('');
        if (cfg.runOnLoad !== false) run();
        return { run };
    };
})();
