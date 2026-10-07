// Mesin "lab" bersama: kontrol -> kode CSS -> hasil langsung (iframe)
(function () {
    const LESSONS = [
        ['index.html', '🏠 Beranda'], ['01-box-model.html', '1 · Box Model'], ['02-flexbox.html', '2 · Flexbox'],
        ['03-warna-teks.html', '3 · Warna & Teks'], ['04-grid.html', '4 · Grid'], ['05-animasi.html', '5 · Animasi'],
        ['06-posisi.html', '6 · Posisi & Z-index'], ['07-responsif.html', '7 · Responsif'], ['08-transform.html', '8 · Transform'], ['09-selector.html', '9 · Selector & Spesifisitas'], ['10-efek-visual.html', '10 · Bayangan & Filter'], ['11-satuan-variabel.html', '11 · Satuan & Variabel'], ['12-pseudo.html', '12 · Pseudo-class & element'], ['13-playground.html', '13 · Playground']
    ];
    window.LESSONS = LESSONS;

    // ---------- navigasi atas + tombol sebelumnya/berikutnya
    const cur = location.pathname.split('/').pop() || 'index.html';
    const nav = document.getElementById('nav');
    if (nav) nav.innerHTML = LESSONS.map(([h, t]) => `<a href="${h}" class="${h === cur ? 'on' : ''}">${t}</a>`).join('') + '<a href="../index.html" class="extra first">🗺 Semua materi</a>';
    const pager = document.getElementById('pager');
    if (pager) {
        const i = LESSONS.findIndex(l => l[0] === cur), p = LESSONS[i - 1], n = LESSONS[i + 1];
        pager.innerHTML = (p ? `<a href="${p[0]}">← ${p[1]}</a>` : '<span></span>') + (n ? `<a href="${n[0]}">${n[1]} →</a>` : '<span></span>');
    }

    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    window.esc = esc;

    // ---------- lab
    window.initLab = function (cfg) {
        cfg.controls = cfg.controls || [];
        const defaults = {}, v = {};
        cfg.controls.forEach(c => { defaults[c.id] = c.value; v[c.id] = c.value; });
        const root = document.getElementById(cfg.root || 'lab');
        root.innerHTML = `
        <div class="lab-grid">
            <div class="lab-col">
                <div class="panel" id="ctlpanel"><div class="ph"><h3>🎛 Kontrol</h3><button class="mini" id="reset">↺ Reset</button></div><div id="ctl"></div></div>
                <div class="panel">
                    <div class="ph">
                        <div class="tabs"><button class="on" data-t="css">CSS</button><button data-t="html">HTML</button></div>
                        <div><button class="mini" id="sync" title="Buat ulang kode dari posisi kontrol">⟳ Dari kontrol</button> <button class="mini" id="copy">📋 Salin</button></div>
                    </div>
                    <textarea id="css" spellcheck="false" aria-label="Kode CSS"></textarea>
                    <textarea id="html" spellcheck="false" aria-label="Kode HTML" hidden></textarea>
                    <div class="status" id="status"></div>
                </div>
            </div>
            <div class="lab-col">
                <div class="panel">
                    <div class="ph"><h3>👁 Hasil langsung</h3><div id="actions"></div></div>
                    <div class="stage"><iframe id="pv" title="Hasil" style="height:${cfg.height || 360}px"></iframe></div>
                    <div class="info" id="info"></div>
                    <div id="checkbox" hidden><div class="progress"><i id="bar"></i></div><ul class="checks" id="checks"></ul></div>
                </div>
            </div>
        </div>`;
        const $ = s => root.querySelector(s);
        const cssBox = $('#css'), htmlBox = $('#html'), frame = $('#pv'), status = $('#status'), info = $('#info');
        let ready = false, lastHtml = null, last = '', manual = false;

        if (!cfg.controls.length) $('#ctlpanel').hidden = true;
        const setters = {};
        const fmt = c => (c.type === 'check' ? (v[c.id] ? 'ya' : 'tidak') : v[c.id] + (c.unit || ''));

        // ---------- kontrol
        const ctl = $('#ctl');
        cfg.controls.forEach(c => {
            const row = document.createElement('div'); row.className = 'row' + (c.type === 'check' || c.type === 'color' ? ' inline' : '');
            const id = (cfg.root || 'lab') + '_c_' + c.id;
            let input;
            if (c.type === 'select') {
                input = document.createElement('select');
                c.options.forEach(o => { const op = document.createElement('option'); op.value = op.textContent = o; input.appendChild(op); });
            } else {
                input = document.createElement('input');
                input.type = c.type === 'check' ? 'checkbox' : c.type;
                if (c.type === 'range') { input.min = c.min; input.max = c.max; input.step = c.step || 1; }
            }
            input.id = id;
            const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = c.label;
            const out = document.createElement('output'); out.textContent = fmt(c);
            if (c.type === 'check' || c.type === 'color') row.append(lab, input, out); else row.append(lab, out, input);
            ctl.appendChild(row);

            const apply = () => { if (c.type === 'check') input.checked = v[c.id]; else input.value = v[c.id]; out.textContent = fmt(c); if (c.frame) frame.style.width = v[c.id] + 'px'; };
            setters[c.id] = apply; apply();
            input.addEventListener('input', () => {
                const old = fmt(c);
                v[c.id] = c.type === 'check' ? input.checked : c.type === 'range' ? +input.value : input.value;
                out.textContent = fmt(c);
                if (c.frame) frame.style.width = v[c.id] + 'px';
                last = `<b>${c.label}</b>: ${old} → ${fmt(c)}`;
                fromControls();
            });
        });

        // ---------- kode <-> hasil
        function fromControls() {
            if (!cfg.codeOnlyManual) cssBox.value = cfg.css ? cfg.css(v) : cssBox.value;
            if (typeof cfg.html === 'function') htmlBox.value = cfg.html(v);
            manual = false; paintStatus(); render();
        }
        function paintStatus() {
            status.innerHTML = manual ? '<span class="man">✍ Mode manual: kamu mengedit kode langsung. Menggeser kontrol akan menimpa kode.</span>'
                : (last ? 'Perubahan terakhir → ' + last : 'Geser kontrol atau ketik langsung di kode untuk melihat perubahannya.');
        }
        function doc() {
            return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                + '<style>body{font-family:system-ui,sans-serif;margin:12px;line-height:1.5}' + (cfg.base || '') + '</style><style id="u"></style>' + htmlBox.value;
        }
        function render() {
            const html = htmlBox.value;
            if (!ready || html !== lastHtml) { ready = false; lastHtml = html; frame.srcdoc = doc(); return; }
            frame.contentDocument.getElementById('u').textContent = cssBox.value; after();
        }
        frame.addEventListener('load', () => {
            ready = true; const u = frame.contentDocument.getElementById('u'); if (u) u.textContent = cssBox.value; after();
        });
        function after() {
            const d = frame.contentDocument; if (!d) return;
            if (cfg.info) { try { info.innerHTML = cfg.info(d, v, frame) || ''; } catch (e) { info.textContent = ''; } }
            if (cfg.checks) runChecks(d);
        }
        function runChecks(d) {
            $('#checkbox').hidden = false;
            let ok = 0;
            $('#checks').innerHTML = cfg.checks.map(c => {
                let pass = false; try { pass = !!c.test(d, d.defaultView.getComputedStyle.bind(d.defaultView)); } catch (e) { }
                if (pass) ok++; return `<li class="${pass ? 'ok' : ''}">${c.text}</li>`;
            }).join('');
            $('#bar').style.width = ok / cfg.checks.length * 100 + '%';
            if (ok === cfg.checks.length) $('#checks').insertAdjacentHTML('beforeend', '<li class="ok">🎉 Semua tantangan selesai!</li>');
        }

        cssBox.addEventListener('input', () => { manual = true; paintStatus(); render(); });
        htmlBox.addEventListener('input', () => { manual = true; paintStatus(); render(); });
        [cssBox, htmlBox].forEach(t => t.addEventListener('keydown', e => {   // Tab = indentasi
            if (e.key === 'Tab') { e.preventDefault(); const s = t.selectionStart; t.setRangeText('  ', s, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input')); }
        }));
        root.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
            root.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
            cssBox.hidden = b.dataset.t !== 'css'; htmlBox.hidden = b.dataset.t !== 'html';
        }));
        $('#sync').addEventListener('click', () => { last = ''; fromControls(); });
        $('#reset').addEventListener('click', () => { Object.assign(v, defaults); Object.values(setters).forEach(f => f()); last = 'semua kontrol dikembalikan'; fromControls(); });
        $('#copy').addEventListener('click', () => {
            const t = cssBox.hidden ? htmlBox : cssBox, btn = $('#copy');
            (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).catch(() => { t.select(); document.execCommand('copy'); });
            btn.textContent = '✓ Tersalin'; setTimeout(() => btn.textContent = '📋 Salin', 1200);
        });

        const api = { reload() { ready = false; lastHtml = null; render(); }, v };
        (cfg.actions || []).forEach(a => {
            const b = document.createElement('button'); b.className = 'mini'; b.textContent = a.label; b.onclick = () => a.run(api); $('#actions').appendChild(b);
        });

        if (typeof cfg.html === 'string') htmlBox.value = cfg.html;
        if (cfg.initialCss != null) cssBox.value = cfg.initialCss;
        if (cfg.initialHtml != null) htmlBox.value = cfg.initialHtml;
        if (cfg.controls.length || cfg.css) fromControls(); else { paintStatus(); render(); }
        return api;
    };
})();
