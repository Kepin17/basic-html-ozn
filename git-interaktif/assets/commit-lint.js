// Penilai pesan komit (Conventional Commits) dan latihan menulis ulang pesan buruk
(function () {
    const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
    const LAZY = /^(wip|update|updates|fix|fixes|changes?|test|tes|asdf|commit|coba|perbaikan|revisi|ok|oke|done|misc|stuff|.|\.+)$/i;
    const PAST = /^(added|fixed|updated|changed|removed|created|deleted|menambahkan|memperbaiki|mengubah|menghapus)\b/i;
    const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    // mengembalikan {rules:[{ok:bool|'warn', text}], score}
    window.lintCommit = function (msg) {
        const lines = msg.replace(/\r/g, '').split('\n'), subject = lines[0] || '';
        const m = subject.match(/^(\w+)(\(([^)]+)\))?(!)?: (.+)$/);
        const rules = [];
        const add = (ok, text, w) => rules.push({ ok, text, w: w || 1 });
        add(subject.trim().length > 0, 'Baris pertama (subjek) tidak kosong', 2);
        add(!!m, 'Format <code>tipe(lingkup): deskripsi</code>, contoh <code>feat(login): tambah validasi email</code>', 3);
        add(!!m && TYPES.includes(m[1]), 'Tipe valid: ' + TYPES.map(t => '<code>' + t + '</code>').join(' '), 2);
        add(subject.length > 0 && subject.length <= 50 ? true : subject.length <= 72 ? 'warn' : false, 'Subjek ≤ 50 karakter (maksimal 72). Sekarang: <b>' + subject.length + '</b>', 2);
        add(!!m && !/[.。]$/.test(subject), 'Subjek tidak diakhiri titik', 1);
        const desc = m ? m[5] : subject;
        add(!!m && /^[a-z0-9]/.test(desc) ? true : (m ? 'warn' : false), 'Deskripsi diawali huruf kecil', 1);
        add(!PAST.test(desc) && !LAZY.test(subject.trim()) ? true : false, 'Imperatif ("tambah", "perbaiki"), bukan lampau ("added") dan bukan pesan malas ("wip", "update", "fix")', 2);
        if (lines.length > 1) {
            add(lines[1] === '', 'Ada baris kosong antara subjek dan isi (body)', 2);
            add(lines.slice(2).every(l => l.length <= 72), 'Setiap baris body ≤ 72 karakter', 1);
        }
        let got = 0, tot = 0;
        rules.forEach(r => { tot += r.w; got += r.ok === true ? r.w : r.ok === 'warn' ? r.w / 2 : 0; });
        return { rules, score: Math.round(got / tot * 100), valid: !!m && TYPES.includes(m[1]) && subject.length <= 72 && !/[.。]$/.test(subject) && !PAST.test(desc) && !LAZY.test(subject.trim()) };
    };

    window.initLint = function (cfg) {
        const root = document.getElementById(cfg.root || 'lint');
        root.innerHTML = `<div class="lint"><div><textarea id="msg" spellcheck="false" aria-label="Pesan komit">${esc(cfg.start || '')}</textarea><div class="status">Tips: baris 1 = subjek, baris 2 kosong, lalu isi (opsional) untuk menjelaskan <b>mengapa</b>.</div></div>
        <div><div class="score" id="score">0<small> / 100</small></div><ul class="rules" id="rules"></ul></div></div>`;
        const msg = root.querySelector('#msg');
        function draw() {
            const r = lintCommit(msg.value);
            root.querySelector('#score').innerHTML = r.score + '<small> / 100 · ' + (r.score >= 90 ? 'profesional 👏' : r.score >= 70 ? 'cukup baik' : 'perlu diperbaiki') + '</small>';
            root.querySelector('#score').style.color = r.score >= 90 ? '#16a34a' : r.score >= 70 ? '#d97706' : '#dc2626';
            root.querySelector('#rules').innerHTML = r.rules.map(x => `<li class="${x.ok === true ? 'ok' : x.ok === 'warn' ? 'warn' : ''}">${x.text}</li>`).join('');
        }
        msg.addEventListener('input', draw); draw();
    };

    window.initRewrite = function (cfg) {
        const root = document.getElementById(cfg.root || 'rewrite');
        root.innerHTML = cfg.items.map((it, i) => `<div class="rewrite"><div>Pesan buruk: <span class="bad">${esc(it.bad)}</span></div><div class="status">${it.hint}</div><input data-i="${i}" placeholder="tulis ulang dengan format yang benar…"><div class="res" id="res${i}"></div></div>`).join('');
        root.addEventListener('input', e => {
            const inp = e.target.closest('input'); if (!inp) return;
            const it = cfg.items[+inp.dataset.i], r = lintCommit(inp.value), out = root.querySelector('#res' + inp.dataset.i);
            const topik = it.kw.every(k => inp.value.toLowerCase().includes(k));
            if (!inp.value.trim()) { out.textContent = ''; return; }
            out.textContent = r.score >= 90 && r.valid && topik ? '✅ Bagus! Skor ' + r.score + '.' : (r.score >= 90 && r.valid ? '⚠ Format benar, tapi pesan harus menyebut: ' + it.kw.join(', ') : '❌ Skor ' + r.score + '. ' + (r.rules.find(x => x.ok !== true && x.ok !== 'warn') ? 'Perbaiki: ' + r.rules.find(x => x.ok !== true && x.ok !== 'warn').text.replace(/<[^>]+>/g, '') : ''));
            out.style.color = r.score >= 90 && r.valid && topik ? '#16a34a' : '#b45309';
        });
    };
})();
