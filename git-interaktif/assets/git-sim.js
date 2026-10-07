// Simulator Git di browser: terminal + tiga area + grafik komit + misi, tanpa server.
(function () {
    const LESSONS = window.LAB_LESSONS || [];
    const EXTRA = window.LAB_NAV_EXTRA || [];
    const cur = location.pathname.split('/').pop() || 'index.html';
    const nav = document.getElementById('nav');
    if (nav) nav.innerHTML = LESSONS.map(([h, t]) => `<a href="${h}" class="${h === cur ? 'on' : ''}">${t}</a>`).join('') + EXTRA.map(([h, t], i) => `<a href="${h}" class="extra${i === 0 ? ' first' : ''}">${t}</a>`).join('');
    const pager = document.getElementById('pager');
    if (pager) {
        const i = LESSONS.findIndex(l => l[0] === cur), p = LESSONS[i - 1], n = LESSONS[i + 1];
        pager.innerHTML = (p ? `<a href="${p[0]}">← ${p[1]}</a>` : '<span></span>') + (n ? `<a href="${n[0]}">${n[1]} →</a>` : '<span></span>');
    }
    const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const clone = o => JSON.parse(JSON.stringify(o));
    const PALET = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0891b2'];
    const tokens = s => { const t = []; s.replace(/"([^"]*)"|'([^']*)'|(\S+)/g, (m, a, b, c) => { t.push(a !== undefined ? a : b !== undefined ? b : c); return m; }); return t; };

    // ---------- kuis kecil
    window.initQuiz = function (cfg) {
        const root = document.getElementById(cfg.root || 'quiz');
        root.innerHTML = cfg.items.map((it, i) => `<div class="quiz"><p><b>${i + 1}.</b> ${it.q}</p>${it.o.map((o, j) => `<button class="opt" data-i="${i}" data-j="${j}">${o}</button>`).join('')}<div class="fb" id="fb${i}"></div></div>`).join('');
        root.addEventListener('click', e => {
            const b = e.target.closest('.opt'); if (!b) return;
            const it = cfg.items[+b.dataset.i], ok = +b.dataset.j === it.a, fb = root.querySelector('#fb' + b.dataset.i);
            b.parentElement.querySelectorAll('.opt').forEach(x => x.classList.remove('benar', 'salah'));
            b.classList.add(ok ? 'benar' : 'salah');
            fb.textContent = ok ? '✅ Benar! ' + (it.e || '') : '❌ Belum tepat, coba lagi.';
        });
    };

    // ---------- simulator
    window.initGit = function (cfg) {
        const root = document.getElementById(cfg.root || 'lab');
        let S, hist = [], hi = 0;
        const newId = () => { let h; do { h = Math.random().toString(16).slice(2, 9).padEnd(7, '0'); } while (S.commits[h]); return h; };

        function fresh() {
            S = { init: false, files: clone(cfg.files || { 'index.html': '<h1>Halo</h1>', 'style.css': 'body { margin: 0; }' }), staged: {}, commits: {}, order: [], branches: {}, head: 'main', detached: null, remote: null, remoteBranches: {}, tracking: {}, merging: null, stash: [], cmds: [] };
        }
        root.innerHTML = `
        <div class="lab-grid">
            <div class="lab-col">
                <div class="panel">
                    <div class="ph"><h3>💻 Terminal</h3><div><button class="mini" id="bantu">? Bantuan</button> <button class="mini" id="ulang">↺ Mulai ulang</button></div></div>
                    <div class="term" id="term"></div>
                    <div class="prompt"><span id="ps1"></span><input id="cmd" autocomplete="off" spellcheck="false" placeholder="ketik perintah lalu Enter…"></div>
                    <div class="quick" id="quick"></div>
                </div>
                <div class="panel"><div class="ph"><h3>🎯 Misi</h3></div><div class="progress"><i id="bar"></i></div><ul class="checks" id="tasks"></ul></div>
            </div>
            <div class="lab-col">
                <div class="panel">
                    <div class="ph"><h3>📁 Berkas proyek</h3><div><input id="nf" class="nf" placeholder="nama-file.txt"> <button class="mini" id="addf">+ file</button>${cfg.remote ? ' <button class="mini" id="teman">👥 Teman push</button>' : ''}</div></div>
                    <div id="filesui"></div>
                </div>
                <div class="panel"><div class="ph"><h3>🗂 Tiga area Git</h3></div><div class="areas" id="areas"></div></div>
                <div class="panel"><div class="ph"><h3>🌳 Grafik komit</h3></div><div class="graph" id="graph"></div></div>
            </div>
        </div>`;
        const $ = s => root.querySelector(s);
        const term = $('#term'), cmdIn = $('#cmd');

        function out(t, cls) {
            const d = document.createElement('div'); d.className = 'to ' + (cls || ''); d.textContent = t; term.appendChild(d); term.scrollTop = term.scrollHeight;
        }
        const err = t => out(t, 'er'), ok = t => out(t, 'ok'), dim = t => out(t, 'dm');

        // ---- helper model
        const headId = () => S.detached || S.branches[S.head] || null;
        const treeOf = id => (id && S.commits[id]) ? S.commits[id].tree : {};
        const baseTree = () => treeOf(headId());
        function anc(id) { const s = new Set(), st = [id]; while (st.length) { const x = st.pop(); if (!x || s.has(x)) continue; s.add(x); S.commits[x].parents.forEach(p => st.push(p)); } return s; }
        function lca(a, b) { const A = anc(a), B = anc(b); let best = null; A.forEach(x => { if (B.has(x) && (!best || S.commits[x].n > S.commits[best].n)) best = x; }); return best; }
        function status() {
            const base = baseTree(), staged = [], modified = [], untracked = [], deleted = [];
            for (const f in S.staged) if (base[f] !== S.staged[f]) staged.push(f);
            for (const f in S.files) {
                const idx = f in S.staged ? S.staged[f] : base[f];
                if (idx === undefined) untracked.push(f); else if (idx !== S.files[f]) modified.push(f);
            }
            for (const f in base) if (!(f in S.files)) deleted.push(f);
            return { staged, modified, untracked, deleted, dirty: staged.length + modified.length + deleted.length > 0 };
        }
        function refsAt(id) {
            const r = [];
            if (!S.detached && S.branches[S.head] === id) r.push('HEAD -> ' + S.head); else if (S.detached === id) r.push('HEAD');
            for (const b in S.branches) if (S.branches[b] === id && !(b === S.head && !S.detached)) r.push(b);
            for (const b in S.tracking) if (S.tracking[b] === id) r.push('origin/' + b);
            return r;
        }
        function reachable() {
            const set = new Set();
            [headId(), ...Object.values(S.branches), ...Object.values(S.tracking)].forEach(id => anc(id).forEach(x => set.add(x)));
            return set;
        }

        // ---- perintah
        function commit(msg) {
            const st = status();
            if (!S.merging && !st.staged.length && !st.deleted.length) {
                if (st.modified.length || st.untracked.length) return err('Tidak ada yang di-stage untuk dikomit. Gunakan "git add" dulu.\n(Perubahan ada, tapi belum masuk staging area.)'), null;
                return err('Tidak ada perubahan untuk dikomit (working tree bersih).'), null;
            }
            let tree, parents;
            if (S.merging) {
                tree = Object.assign({}, S.merging.result, S.staged);
                if (Object.values(tree).some(c => String(c).includes('<<<<<<<'))) return err('Masih ada penanda konflik (<<<<<<<). Selesaikan lalu "git add".'), null;
                parents = [headId(), S.merging.theirs];
            } else {
                tree = Object.assign({}, baseTree(), S.staged);
                st.deleted.forEach(f => delete tree[f]);
                parents = headId() ? [headId()] : [];
            }
            const id = newId();
            S.commits[id] = { id, msg, parents, tree: clone(tree), lane: S.detached ? '(detached)' : S.head, n: S.order.length };
            S.order.push(id);
            if (S.detached) S.detached = id; else S.branches[S.head] = id;
            S.staged = {}; S.merging = null;
            return id;
        }
        function doMerge(name, tid, label) {
            const h = headId();
            if (!h) return err('Belum ada komit di branch ini.');
            if (anc(h).has(tid)) return out('Already up to date. (Sudah terbaru)');
            if (anc(tid).has(h)) {   // fast-forward
                if (S.detached) S.detached = tid; else S.branches[S.head] = tid;
                S.files = clone(treeOf(tid)); S.staged = {};
                ok('Updating ' + h + '..' + tid + '\nFast-forward');
                return;
            }
            const base = treeOf(lca(h, tid)), ours = treeOf(h), theirs = treeOf(tid), result = {}, conflicts = [];
            new Set([...Object.keys(ours), ...Object.keys(theirs), ...Object.keys(base)]).forEach(f => {
                const o = ours[f], t = theirs[f], b = base[f]; let r;
                if (o === t) r = o; else if (o === b) r = t; else if (t === b) r = o;
                else { conflicts.push(f); r = '<<<<<<< HEAD\n' + o + '\n=======\n' + t + '\n>>>>>>> ' + label; }
                if (r !== undefined) result[f] = r;
            });
            S.files = clone(result); S.staged = {};
            if (conflicts.length) {
                S.merging = { theirs: tid, label, result: clone(result), conflicts };
                conflicts.forEach(f => out('Auto-merging ' + f + '\nCONFLICT (content): Merge conflict in ' + f, 'er'));
                out('Automatic merge failed; fix conflicts and then commit the result.\n→ Buka berkas, hapus penanda <<<<<<< ======= >>>>>>>, simpan, lalu: git add <berkas> dan git commit', 'er');
                return;
            }
            const id = newId();
            S.commits[id] = { id, msg: "Merge branch '" + label + "'", parents: [h, tid], tree: clone(result), lane: S.detached ? '(detached)' : S.head, n: S.order.length };
            S.order.push(id); if (S.detached) S.detached = id; else S.branches[S.head] = id;
            ok("Merge made by the 'ort' strategy.");
        }
        function switchTo(name, create) {
            if (create) {
                if (S.branches[name]) return err('fatal: branch "' + name + '" sudah ada.');
                if (!headId()) return err('fatal: belum ada komit; buat komit pertama dulu.');
                S.branches[name] = headId(); S.head = name; S.detached = null; return ok("Switched to a new branch '" + name + "'");
            }
            if (!(name in S.branches)) return err("error: branch '" + name + "' tidak ditemukan. (git branch untuk melihat daftar)");
            const st = status();
            if (st.dirty && S.branches[name] !== headId()) return err('error: perubahan lokal akan tertimpa saat pindah branch.\nCommit atau stash dulu (git stash).');
            S.head = name; S.detached = null; S.files = Object.assign({}, clone(treeOf(S.branches[name])), pickUntracked()); S.staged = {};
            ok("Switched to branch '" + name + "'");
        }
        function pickUntracked() { const st = status(), r = {}; st.untracked.forEach(f => r[f] = S.files[f]); return r; }
        function fetch(silent) {
            if (!S.remote) return err("fatal: belum ada remote. Jalankan: git remote add origin <url>");
            let n = 0; for (const b in S.remoteBranches) if (S.tracking[b] !== S.remoteBranches[b]) { S.tracking[b] = S.remoteBranches[b]; n++; }
            if (!silent) out(n ? 'From ' + S.remote + '\n * branch ' + Object.keys(S.remoteBranches).join(', ') + ' -> origin/' + Object.keys(S.remoteBranches)[0] : 'Tidak ada yang baru dari remote.');
            return true;
        }
        function logLines(args) {
            const h = headId(); if (!h) return err("fatal: branch '" + S.head + "' belum punya komit.");
            const ids = [...anc(h)].sort((a, b) => S.commits[b].n - S.commits[a].n);
            const one = args.includes('--oneline'), graph = args.includes('--graph');
            ids.forEach(id => {
                const c = S.commits[id], r = refsAt(id), ref = r.length ? ' (' + r.join(', ') + ')' : '';
                if (one) out((graph ? (c.parents.length > 1 ? '*   ' : '* ') : '') + id + ref + ' ' + c.msg, 'lg');
                else out('commit ' + id + ref + '\nAuthor: Kamu <kamu@contoh.com>\nDate:   (baru saja)\n\n    ' + c.msg.replace(/\n/g, '\n    ') + '\n', 'lg');
            });
        }
        function diff(args) {
            const base = baseTree(), staged = args.includes('--staged') || args.includes('--cached'); let any = false;
            const files = staged ? Object.keys(S.staged) : Object.keys(S.files);
            files.forEach(f => {
                const a = staged ? base[f] : (f in S.staged ? S.staged[f] : base[f]), b = staged ? S.staged[f] : S.files[f];
                if (a === undefined || a === b) return; any = true;
                out('diff --git a/' + f + ' b/' + f + '\n--- a/' + f + '\n+++ b/' + f, 'dm');
                a.split('\n').forEach(l => out('-' + l, 'er')); b.split('\n').forEach(l => out('+' + l, 'ok'));
            });
            if (!any) dim(staged ? '(tidak ada perubahan di staging)' : '(tidak ada perubahan yang belum di-stage)');
        }
        function statusOut() {
            const st = status();
            out('On branch ' + (S.detached ? '(detached HEAD ' + S.detached + ')' : S.head));
            if (S.remote && S.tracking[S.head] !== undefined && !S.detached) {
                const a = anc(headId() || ''), t = S.tracking[S.head];
                const ahead = [...a].filter(x => !anc(t).has(x)).length, behind = [...anc(t)].filter(x => !a.has(x)).length;
                out(ahead || behind ? ('Branch kamu ' + (ahead ? 'unggul ' + ahead + ' komit' : '') + (ahead && behind ? ' dan ' : '') + (behind ? 'tertinggal ' + behind + ' komit' : '') + " dari 'origin/" + S.head + "'.") : "Branch kamu sudah sama dengan 'origin/" + S.head + "'.");
            }
            if (S.merging) out('Kamu sedang dalam proses merge (belum selesai).', 'er');
            if (!headId()) out('\nNo commits yet');
            if (st.staged.length) out('\nChanges to be committed (siap dikomit):\n' + st.staged.map(f => '        ' + ((f in baseTree()) ? 'modified:   ' : 'new file:   ') + f).join('\n'), 'ok');
            if (st.modified.length || st.deleted.length) out('\nChanges not staged for commit (diubah, belum di-stage):\n' + st.modified.map(f => '        modified:   ' + f).concat(st.deleted.map(f => '        deleted:    ' + f)).join('\n'), 'er');
            if (st.untracked.length) out('\nUntracked files (belum dilacak):\n' + st.untracked.map(f => '        ' + f).join('\n'), 'er');
            if (!st.dirty && !st.untracked.length) out('\nnothing to commit, working tree clean');
        }
        const HELP = `Perintah yang didukung simulator:
  git init | status | add <file|.> | commit -m "pesan" | commit -am "pesan"
  git log [--oneline] [--graph] | diff [--staged]
  git branch [nama] | branch -d nama | switch [-c] nama | checkout [-b] nama
  git merge <branch> | stash | stash pop
  git restore <file> | restore --staged <file> | reset --soft HEAD~1 | reset --hard HEAD~1 | revert HEAD
  git remote add origin <url> | remote -v | fetch | push [-u origin <branch>] | pull
  ls | cat <file> | touch <file> | rm <file> | echo "teks" > <file> | echo "teks" >> <file> | clear`;

        function run(line, silent) {
            line = line.trim(); if (!line) return;
            if (!silent) { out('$ ' + line, 'cm'); S.cmds.push(line); }
            const t = tokens(line), c = t[0];
            if (!silent && c !== 'clear') { /* log tersimpan */ }
            const O = silent ? { out: out } : null;
            if (silent) { var _o = term.innerHTML; }
            try { dispatch(t, line); } catch (e) { err('Kesalahan simulator: ' + e.message); }
            if (silent) { term.innerHTML = _o; }
            refresh();
        }
        function dispatch(t, line) {
            const c = t[0];
            if (c === 'clear') { term.innerHTML = ''; return; }
            if (c === 'help' || line === 'git help') return out(HELP, 'dm');
            if (c === 'ls') return out(Object.keys(S.files).join('   ') || '(kosong)');
            if (c === 'cat') { const f = t[1]; return f in S.files ? out(S.files[f]) : err('cat: ' + f + ': tidak ada berkas'); }
            if (c === 'touch') { t.slice(1).forEach(f => { if (!(f in S.files)) S.files[f] = ''; }); return; }
            if (c === 'rm') { t.slice(1).forEach(f => { if (f in S.files) delete S.files[f]; else err('rm: ' + f + ': tidak ada berkas'); }); return; }
            if (c === 'echo') {
                const gt = t.indexOf('>>') > -1 ? '>>' : t.indexOf('>') > -1 ? '>' : null;
                if (!gt) return out(t.slice(1).join(' '));
                const i = t.indexOf(gt), text = t.slice(1, i).join(' '), f = t[i + 1]; if (!f) return err('echo: nama berkas kosong');
                S.files[f] = gt === '>>' && f in S.files && S.files[f] !== '' ? S.files[f] + '\n' + text : text; return;
            }
            if (c !== 'git') return err(c + ': perintah tidak dikenal. Ketik "help".');
            const sub = t[1], a = t.slice(2);
            if (sub === 'config') return;
            if (sub === 'init') { if (S.init) return out('Reinitialized existing Git repository'); S.init = true; return ok('Initialized empty Git repository in ~/proyek/.git/  (branch: main)'); }
            if (!S.init) return err('fatal: bukan repositori git (atau induknya). Jalankan dulu: git init');
            switch (sub) {
                case 'status': return statusOut();
                case 'add': {
                    if (!a.length) return err('Tidak ada yang ditambahkan. Contoh: git add . atau git add index.html');
                    const base = baseTree(); let n = 0;
                    const targets = (a[0] === '.' || a[0] === '-A') ? Object.keys(S.files).concat(Object.keys(base).filter(f => !(f in S.files))) : a;
                    for (const f of targets) {
                        if (f in S.files) { S.staged[f] = S.files[f]; n++; }
                        else if (f in base) { S.staged[f] = S.staged[f]; delete S.staged[f]; n++; }
                        else return err("fatal: pathspec '" + f + "' tidak cocok dengan berkas apa pun");
                    }
                    return;
                }
                case 'commit': {
                    let msg = null, all = a.includes('-a') || a.includes('-am');
                    const mi = a.findIndex(x => x === '-m' || x === '-am'); if (mi > -1) msg = a[mi + 1];
                    if (all) { const b = baseTree(); Object.keys(S.files).forEach(f => { if (f in b || f in S.staged) S.staged[f] = S.files[f]; }); }
                    if (!msg) { if (S.merging) msg = "Merge branch '" + S.merging.label + "'"; else return err('Aborting commit karena pesan kosong. Pakai: git commit -m "pesan"'); }
                    const id = commit(msg);
                    if (id) ok('[' + (S.detached ? 'detached HEAD' : S.head) + ' ' + id + '] ' + msg.split('\n')[0]);
                    return;
                }
                case 'log': return logLines(a);
                case 'diff': return diff(a);
                case 'branch': {
                    if (a[0] === '-d' || a[0] === '-D') { const n = a[1]; if (!(n in S.branches)) return err("error: branch '" + n + "' tidak ada."); if (n === S.head) return err('error: tidak bisa menghapus branch yang sedang dipakai.'); delete S.branches[n]; return ok('Deleted branch ' + n); }
                    if (a[0]) { if (S.branches[a[0]]) return err("fatal: branch '" + a[0] + "' sudah ada."); if (!headId()) return err('fatal: belum ada komit.'); S.branches[a[0]] = headId(); return; }
                    return out(Object.keys(S.branches).map(b => (b === S.head && !S.detached ? '* ' : '  ') + b).join('\n') || '(belum ada branch: buat komit pertama dulu)');
                }
                case 'switch': case 'checkout': {
                    if (a[0] === '-c' || a[0] === '-b') return switchTo(a[1], true);
                    if (!a[0]) return err('Sebutkan nama branch.');
                    if (/^[0-9a-f]{7}$/.test(a[0]) && S.commits[a[0]]) { S.detached = a[0]; S.files = clone(treeOf(a[0])); return out("HEAD is now at " + a[0] + " (detached HEAD)", 'dm'); }
                    return switchTo(a[0], false);
                }
                case 'merge': {
                    const n = a[0]; if (!n) return err('Sebutkan branch yang digabung.');
                    const tid = n.startsWith('origin/') ? S.tracking[n.slice(7)] : S.branches[n];
                    if (!tid) return err("merge: '" + n + "' bukan sesuatu yang bisa digabung.");
                    if (status().dirty) return err('error: ada perubahan lokal. Commit atau stash dulu.');
                    return doMerge(n, tid, n);
                }
                case 'stash': {
                    if (a[0] === 'pop') { const s = S.stash.pop(); if (!s) return err('Tidak ada stash.'); Object.assign(S.files, s); return ok('Perubahan dari stash dikembalikan.'); }
                    const st = status(), saved = {}; st.modified.forEach(f => saved[f] = S.files[f]);
                    if (!st.modified.length && !st.staged.length) return out('Tidak ada perubahan lokal untuk disimpan.');
                    st.staged.forEach(f => saved[f] = S.staged[f]);
                    S.stash.push(saved); const b = baseTree(); Object.keys(saved).forEach(f => { if (f in b) S.files[f] = b[f]; else delete S.files[f]; }); S.staged = {};
                    return ok('Saved working directory and index state (git stash). Berkas kembali bersih.');
                }
                case 'restore': {
                    const staged = a.includes('--staged'), f = a.filter(x => !x.startsWith('-'))[0], b = baseTree();
                    if (!f) return err('Sebutkan berkas. Contoh: git restore index.html');
                    if (staged) { if (!(f in S.staged)) return err('Berkas tidak ada di staging.'); delete S.staged[f]; return; }
                    const src = f in S.staged ? S.staged[f] : b[f]; if (src === undefined) return err("error: pathspec '" + f + "' tidak ada di riwayat.");
                    S.files[f] = src; return;
                }
                case 'reset': {
                    const mode = a.includes('--hard') ? 'hard' : a.includes('--soft') ? 'soft' : 'mixed', h = headId();
                    if (!h) return err('Belum ada komit.');
                    const p = S.commits[h].parents[0];
                    if (!p && mode !== 'soft') return err('Tidak ada komit sebelumnya untuk dituju.');
                    const old = S.commits[h].tree;
                    if (S.detached) S.detached = p; else S.branches[S.head] = p || null;
                    if (mode === 'hard') { S.files = clone(treeOf(p)); S.staged = {}; return ok('HEAD is now at ' + p); }
                    if (mode === 'soft') { S.staged = {}; const pt = treeOf(p); Object.keys(old).forEach(f => { if (old[f] !== pt[f]) S.staged[f] = old[f]; }); return ok('Komit dibatalkan, perubahannya tetap di staging (soft).'); }
                    S.staged = {}; return ok('Komit dibatalkan, perubahannya kembali ke working directory (mixed).');
                }
                case 'revert': {
                    const h = headId(); if (!h) return err('Belum ada komit.');
                    if (status().dirty) return err('error: ada perubahan lokal. Commit atau stash dulu.');
                    const c = S.commits[h]; if (!c.parents.length) return err('Tidak bisa me-revert komit pertama pada simulator ini.');
                    const id = newId(), tree = clone(treeOf(c.parents[0]));
                    S.commits[id] = { id, msg: 'Revert "' + c.msg + '"', parents: [h], tree, lane: S.head, n: S.order.length }; S.order.push(id);
                    if (S.detached) S.detached = id; else S.branches[S.head] = id; S.files = clone(tree);
                    return ok('[' + S.head + ' ' + id + '] Revert "' + c.msg + '"');
                }
                case 'remote': {
                    if (a[0] === 'add') { if (!a[2]) return err('Pakai: git remote add origin <url>'); S.remote = a[2]; return; }
                    if (a[0] === '-v') return S.remote ? out('origin\t' + S.remote + ' (fetch)\norigin\t' + S.remote + ' (push)') : undefined;
                    return out(S.remote ? 'origin' : '');
                }
                case 'fetch': return fetch(false);
                case 'push': {
                    if (!S.remote) return err("fatal: belum ada remote. Jalankan: git remote add origin <url>");
                    const b = a.filter(x => !x.startsWith('-') && x !== 'origin')[0] || S.head;
                    if (!(b in S.branches)) return err("error: branch '" + b + "' tidak ada.");
                    const rt = S.remoteBranches[b], lt = S.branches[b];
                    if (rt && !anc(lt).has(rt)) return err(' ! [rejected]  ' + b + ' -> ' + b + ' (fetch first)\nerror: remote punya komit yang belum kamu miliki. Jalankan: git pull');
                    if (rt === lt) return out('Everything up-to-date');
                    S.remoteBranches[b] = lt; S.tracking[b] = lt;
                    return ok('To ' + S.remote + '\n ' + (rt ? rt + '..' + lt : '* [new branch]') + '  ' + b + ' -> ' + b + (a.includes('-u') ? "\nbranch '" + b + "' set up to track 'origin/" + b + "'." : ''));
                }
                case 'pull': {
                    if (!fetch(true)) return;
                    const t = S.tracking[S.head]; if (!t) return err('Remote belum punya branch ' + S.head + '.');
                    if (status().dirty) return err('error: ada perubahan lokal. Commit atau stash dulu.');
                    return doMerge('origin/' + S.head, t, 'origin/' + S.head);
                }
                default: return err("git: '" + sub + "' tidak didukung simulator ini. Ketik help.");
            }
        }

        // ---- tampilan
        function chip(t, kind) { return `<span class="chip ${kind || ''}">${esc(t)}</span>`; }
        function refresh() {
            // prompt
            $('#ps1').textContent = '~/proyek ' + (S.init ? '(' + (S.detached ? 'detached' : S.head) + ')' : '') + ' $';
            // berkas
            const st = status(), base = baseTree();
            $('#filesui').innerHTML = Object.keys(S.files).map(f => {
                const b = st.untracked.includes(f) ? ['untracked', 'baru'] : st.staged.includes(f) && !st.modified.includes(f) ? ['staged', 'staged'] : st.modified.includes(f) ? ['mod', 'diubah'] : ['clean', 'bersih'];
                const rows = Math.min(5, Math.max(1, S.files[f].split('\n').length));
                return `<div class="frow"><div class="fh"><b>${esc(f)}</b> <span class="bd ${b[0]}">${b[1]}</span></div><textarea data-f="${esc(f)}" rows="${rows}" spellcheck="false">${esc(S.files[f])}</textarea></div>`;
            }).join('') || '<div class="empty">Belum ada berkas. Buat dengan tombol + file.</div>';
            root.querySelectorAll('#filesui textarea').forEach(ta => ta.addEventListener('input', () => { S.files[ta.dataset.f] = ta.value; refreshAreas(); checkTasks(); }));
            refreshAreas(); drawGraph(); checkTasks();
        }
        function refreshAreas() {
            const st = status(), base = baseTree();
            const w = [...st.modified.map(f => chip(f, 'mod')), ...st.untracked.map(f => chip(f, 'untracked')), ...st.deleted.map(f => chip(f + ' (hapus)', 'mod'))].join('') || '<span class="empty">bersih</span>';
            const s = st.staged.map(f => chip(f, 'staged')).join('') || '<span class="empty">kosong</span>';
            const r = Object.keys(base).map(f => chip(f, 'clean')).join('') || '<span class="empty">belum ada komit</span>';
            $('#areas').innerHTML = `<div class="area"><h4>1 · Working Directory</h4><div>${w}</div></div><div class="arrow">git add →</div><div class="area"><h4>2 · Staging Area</h4><div>${s}</div></div><div class="arrow">git commit →</div><div class="area"><h4>3 · Repository (HEAD)</h4><div>${r}</div></div>`;
        }
        function drawGraph() {
            const vis = reachable(), ids = S.order.filter(id => vis.has(id));
            if (!ids.length) { $('#graph').innerHTML = '<div class="empty">Belum ada komit. Jalankan git init, git add, git commit.</div>'; return; }
            const lanes = []; ids.forEach(id => { const l = S.commits[id].lane; if (!lanes.includes(l)) lanes.push(l); });
            const W = 70 + ids.length * 66, H = 70 + lanes.length * 56, pos = {};
            ids.forEach((id, i) => { pos[id] = [44 + i * 66, 52 + lanes.indexOf(S.commits[id].lane) * 56]; });
            let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
            ids.forEach(id => S.commits[id].parents.forEach(p => {
                if (!pos[p]) return; const [x1, y1] = pos[p], [x2, y2] = pos[id], col = PALET[lanes.indexOf(S.commits[id].lane) % PALET.length];
                svg += y1 === y2 ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="3"/>` : `<path d="M${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}" stroke="${col}" stroke-width="3" fill="none"/>`;
            }));
            ids.forEach(id => {
                const [x, y] = pos[id], c = S.commits[id], col = PALET[lanes.indexOf(c.lane) % PALET.length], refs = refsAt(id);
                svg += `<g><title>${esc(c.id + ': ' + c.msg)}</title><circle cx="${x}" cy="${y}" r="9" fill="${c.parents.length > 1 ? '#fff' : col}" stroke="${col}" stroke-width="3"/><text x="${x}" y="${y + 24}" text-anchor="middle" class="gid">${c.id.slice(0, 5)}</text></g>`;
                refs.forEach((r, k) => {
                    const w = r.length * 6.4 + 12, yy = y - 24 - k * 18, cls = r.startsWith('HEAD') ? 'head' : r.startsWith('origin/') ? 'rem' : 'br';
                    svg += `<g><rect x="${x - w / 2}" y="${yy - 11}" width="${w}" height="16" rx="8" class="rf ${cls}"/><text x="${x}" y="${yy + 1}" text-anchor="middle" class="rt">${esc(r)}</text></g>`;
                });
            });
            $('#graph').innerHTML = svg + '</svg>';
            $('#graph').scrollLeft = 99999;
        }
        function checkTasks() {
            if (!cfg.tasks) return; let n = 0;
            $('#tasks').innerHTML = cfg.tasks.map(t => { let p = false; try { p = !!t.test(S, st => status()); } catch (e) { } if (p) n++; return `<li class="${p ? 'ok' : ''}">${t.text}</li>`; }).join('') + (n === cfg.tasks.length ? '<li class="ok">🎉 Semua misi selesai!</li>' : '');
            $('#bar').style.width = n / cfg.tasks.length * 100 + '%';
        }

        // ---- interaksi
        cmdIn.addEventListener('keydown', e => {
            if (e.key === 'Enter') { const v = cmdIn.value; if (v.trim()) { hist.push(v); hi = hist.length; } run(v); cmdIn.value = ''; }
            else if (e.key === 'ArrowUp') { if (hi > 0) cmdIn.value = hist[--hi] || ''; e.preventDefault(); }
            else if (e.key === 'ArrowDown') { cmdIn.value = hist[++hi] || ''; if (hi > hist.length) hi = hist.length; e.preventDefault(); }
        });
        $('#bantu').addEventListener('click', () => out(HELP, 'dm'));
        $('#ulang').addEventListener('click', start);
        $('#addf').addEventListener('click', () => { const n = $('#nf').value.trim(); if (n && !(n in S.files)) { S.files[n] = ''; $('#nf').value = ''; refresh(); } });
        if (cfg.remote) $('#teman').addEventListener('click', () => {
            if (!S.remote) return err('Hubungkan remote dulu (git remote add origin <url>).');
            const b = 'main', base = S.remoteBranches[b] || (S.branches[b] || null);
            if (!base) return err('Remote masih kosong. Push dulu komit pertamamu.');
            const id = newId(), tree = Object.assign({}, clone(treeOf(base)), { 'teman.txt': 'Halo dari teman tim!' });
            S.commits[id] = { id, msg: 'docs: tambah catatan dari teman', parents: [base], tree, lane: 'origin', n: S.order.length }; S.order.push(id);
            S.remoteBranches[b] = id; out('👥 Temanmu mem-push 1 komit ke origin/main (kamu belum tahu: jalankan git fetch atau git pull).', 'dm'); refresh();
        });
        const q = $('#quick');
        (cfg.quick || []).forEach(c => { const b = document.createElement('button'); b.className = 'mini'; b.textContent = c; b.addEventListener('click', () => { cmdIn.value = c; cmdIn.focus(); }); q.appendChild(b); });
        function start() {
            fresh(); term.innerHTML = ''; hist = []; hi = 0;
            out('Simulator Git — ketik perintah di bawah. Ketik "help" untuk daftar perintah.', 'dm');
            (cfg.pre || []).forEach(c => run(c, true)); S.cmds = [];
            if (cfg.after) cfg.after(S);
            refresh();
        }
        start();
        return { run, state: () => S };
    };
})();
