// Arena Kode: game latihan JavaScript. Kode pemain dijalankan di Web Worker (timeout 2 dtk) lalu dinilai dengan test case.
const DUNIA = [
    { judul: 'Dunia 1 · Variabel & Operator', ikon: '🌱', tantangan: [
        { id: 'kali-dua', judul: 'Kali Dua', fungsi: 'kaliDua', args: 'n',
          cerita: 'Mesin penggandaan butuh fungsi yang mengembalikan angka dikali 2.',
          tests: [[[3], 6], [[0], 0], [[-4], -8], [[2.5], 5]],
          petunjuk: ['Gunakan operator * dan kata kunci return.'],
          solusi: 'function kaliDua(n) {\n  return n * 2;\n}' },
        { id: 'luas', judul: 'Luas Persegi Panjang', fungsi: 'luas', args: 'p, l',
          cerita: 'Hitung luas persegi panjang dari panjang (p) dan lebar (l).',
          tests: [[[3, 4], 12], [[10, 0], 0], [[2.5, 2], 5]],
          petunjuk: ['Luas = panjang × lebar.'],
          solusi: 'function luas(p, l) {\n  return p * l;\n}' },
        { id: 'sapa', judul: 'Sapa Pemain', fungsi: 'sapa', args: 'nama',
          cerita: 'Kembalikan teks sapaan persis seperti: Halo, Budi!',
          tests: [[['Budi'], 'Halo, Budi!'], [['Ani'], 'Halo, Ani!'], [[''], 'Halo, !']],
          petunjuk: ['Gabungkan teks dengan + atau template literal `Halo, ${nama}!`.'],
          solusi: 'function sapa(nama) {\n  return `Halo, ${nama}!`;\n}' },
        { id: 'rata', judul: 'Rata-rata Tiga Nilai', fungsi: 'rataRata', args: 'a, b, c',
          cerita: 'Hitung rata-rata dari tiga angka.',
          tests: [[[2, 4, 6], 4], [[10, 10, 10], 10], [[0, 0, 3], 1], [[1, 2, 3], 2]],
          petunjuk: ['Jumlahkan dulu, lalu bagi 3. Jangan lupa tanda kurung.'],
          solusi: 'function rataRata(a, b, c) {\n  return (a + b + c) / 3;\n}' }
    ] },
    { judul: 'Dunia 2 · Kondisi', ikon: '🔀', tantangan: [
        { id: 'genap', judul: 'Genap atau Ganjil', fungsi: 'genapGanjil', args: 'n',
          cerita: 'Kembalikan "genap" atau "ganjil" untuk bilangan bulat n.',
          tests: [[[4], 'genap'], [[7], 'ganjil'], [[0], 'genap'], [[-3], 'ganjil']],
          petunjuk: ['Operator % memberi sisa bagi. Hati-hati: -3 % 2 adalah -1.'],
          solusi: 'function genapGanjil(n) {\n  return n % 2 === 0 ? "genap" : "ganjil";\n}' },
        { id: 'terbesar', judul: 'Angka Terbesar', fungsi: 'terbesar', args: 'a, b, c',
          cerita: 'Kembalikan yang terbesar dari tiga angka, tanpa memakai Math.max.',
          tests: [[[1, 2, 3], 3], [[9, 2, 3], 9], [[4, 8, 5], 8], [[-1, -5, -3], -1]],
          petunjuk: ['Simpan kandidat terbesar di variabel, bandingkan satu per satu dengan if.'],
          solusi: 'function terbesar(a, b, c) {\n  let m = a;\n  if (b > m) m = b;\n  if (c > m) m = c;\n  return m;\n}' },
        { id: 'nilai', judul: 'Nilai Huruf', fungsi: 'nilaiHuruf', args: 'n',
          cerita: 'Skor ≥ 80 = "A", ≥ 70 = "B", ≥ 60 = "C", selain itu "D".',
          tests: [[[95], 'A'], [[80], 'A'], [[79], 'B'], [[70], 'B'], [[65], 'C'], [[59], 'D']],
          petunjuk: ['Periksa dari batas tertinggi: if ... else if ... else.'],
          solusi: 'function nilaiHuruf(n) {\n  if (n >= 80) return "A";\n  if (n >= 70) return "B";\n  if (n >= 60) return "C";\n  return "D";\n}' },
        { id: 'kabisat', judul: 'Tahun Kabisat', fungsi: 'kabisat', args: 't',
          cerita: 'Kabisat jika habis dibagi 4, kecuali habis dibagi 100, tetapi habis dibagi 400 tetap kabisat. Kembalikan true/false.',
          tests: [[[2024], true], [[2023], false], [[1900], false], [[2000], true], [[2100], false]],
          petunjuk: ['Gabungkan syarat dengan && dan ||: (t%4===0 && t%100!==0) || t%400===0'],
          solusi: 'function kabisat(t) {\n  return (t % 4 === 0 && t % 100 !== 0) || t % 400 === 0;\n}' }
    ] },
    { judul: 'Dunia 3 · Perulangan', ikon: '🔁', tantangan: [
        { id: 'jumlah', judul: 'Jumlah 1 sampai n', fungsi: 'jumlahSampai', args: 'n',
          cerita: 'Jumlahkan semua bilangan dari 1 sampai n (n ≥ 0).',
          tests: [[[5], 15], [[1], 1], [[0], 0], [[100], 5050]],
          petunjuk: ['Pakai for dengan variabel penampung total = 0.'],
          solusi: 'function jumlahSampai(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) total += i;\n  return total;\n}' },
        { id: 'faktorial', judul: 'Faktorial', fungsi: 'faktorial', args: 'n',
          cerita: 'n! = 1 × 2 × … × n, dan 0! = 1.',
          tests: [[[5], 120], [[0], 1], [[1], 1], [[10], 3628800]],
          petunjuk: ['Mulai hasil dari 1, bukan 0.'],
          solusi: 'function faktorial(n) {\n  let h = 1;\n  for (let i = 2; i <= n; i++) h *= i;\n  return h;\n}' },
        { id: 'vokal', judul: 'Hitung Vokal', fungsi: 'hitungVokal', args: 'teks',
          cerita: 'Hitung jumlah huruf vokal (a, i, u, e, o), besar atau kecil.',
          tests: [[['halo'], 2], [['XYZ'], 0], [['AIUEO'], 5], [['Belajar JavaScript'], 6]],
          petunjuk: ['Ubah ke huruf kecil dulu, lalu loop dengan for...of dan cek "aiueo".includes(huruf).'],
          solusi: 'function hitungVokal(teks) {\n  let n = 0;\n  for (const h of teks.toLowerCase()) {\n    if ("aiueo".includes(h)) n++;\n  }\n  return n;\n}' },
        { id: 'fizz', judul: 'FizzBuzz', fungsi: 'fizzBuzz', args: 'n',
          cerita: 'Kembalikan array dari 1..n: kelipatan 3 = "Fizz", kelipatan 5 = "Buzz", keduanya = "FizzBuzz", selain itu angkanya.',
          tests: [[[5], [1, 2, 'Fizz', 4, 'Buzz']], [[15], [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']], [[0], []]],
          petunjuk: ['Cek kelipatan 15 lebih dulu, sebelum 3 dan 5.'],
          solusi: 'function fizzBuzz(n) {\n  const h = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) h.push("FizzBuzz");\n    else if (i % 3 === 0) h.push("Fizz");\n    else if (i % 5 === 0) h.push("Buzz");\n    else h.push(i);\n  }\n  return h;\n}' }
    ] },
    { judul: 'Dunia 4 · Fungsi & Teks', ikon: '🧩', tantangan: [
        { id: 'balik', judul: 'Balik Kata', fungsi: 'balikKata', args: 'teks',
          cerita: 'Balikkan urutan huruf: "kode" menjadi "edok".',
          tests: [[['kode'], 'edok'], [[''], ''], [['a'], 'a'], [['Halo Dunia'], 'ainuD olaH']],
          petunjuk: ['split("") → reverse() → join("").'],
          solusi: 'function balikKata(teks) {\n  return teks.split("").reverse().join("");\n}' },
        { id: 'palindrom', judul: 'Palindrom', fungsi: 'palindrom', args: 'teks',
          cerita: 'True jika teks terbaca sama dari depan dan belakang, tidak peduli huruf besar/kecil (spasi dihitung).',
          tests: [[['katak'], true], [['Kasur'], false], [['Level'], true], [[''], true]],
          petunjuk: ['Ubah ke huruf kecil, lalu bandingkan dengan versi terbaliknya.'],
          solusi: 'function palindrom(teks) {\n  const t = teks.toLowerCase();\n  return t === t.split("").reverse().join("");\n}' },
        { id: 'kata', judul: 'Hitung Kata', fungsi: 'hitungKata', args: 'kalimat',
          cerita: 'Hitung jumlah kata dalam kalimat. Spasi ganda atau di tepi tidak menambah kata.',
          tests: [[['aku suka kode'], 3], [['  halo   dunia '], 2], [[''], 0], [['satu'], 1]],
          petunjuk: ['trim() lalu split(/\\s+/). Awas: "".split() menghasilkan [""] (panjang 1).'],
          solusi: 'function hitungKata(kalimat) {\n  const t = kalimat.trim();\n  return t === "" ? 0 : t.split(/\\s+/).length;\n}' },
        { id: 'fibo', judul: 'Fibonacci', fungsi: 'fibonacci', args: 'n',
          cerita: 'Suku ke-n deret 0, 1, 1, 2, 3, 5, 8 … (indeks mulai 0). fibonacci(6) = 8.',
          tests: [[[0], 0], [[1], 1], [[6], 8], [[10], 55], [[20], 6765]],
          petunjuk: ['Simpan dua nilai sebelumnya (a, b) dan geser sebanyak n kali.'],
          solusi: 'function fibonacci(n) {\n  let a = 0, b = 1;\n  for (let i = 0; i < n; i++) [a, b] = [b, a + b];\n  return a;\n}' }
    ] },
    { judul: 'Dunia 5 · Array & Object', ikon: '📦', tantangan: [
        { id: 'kuadrat', judul: 'Kuadratkan Semua', fungsi: 'kuadratSemua', args: 'arr',
          cerita: 'Kembalikan array baru berisi kuadrat tiap elemen.',
          tests: [[[[1, 2, 3]], [1, 4, 9]], [[[]], []], [[[-2, 0]], [4, 0]]],
          petunjuk: ['arr.map(x => ...) membuat array baru.'],
          solusi: 'function kuadratSemua(arr) {\n  return arr.map(x => x * x);\n}' },
        { id: 'genaparr', judul: 'Saring Genap', fungsi: 'hanyaGenap', args: 'arr',
          cerita: 'Kembalikan hanya elemen genap, urutan tetap.',
          tests: [[[[1, 2, 3, 4]], [2, 4]], [[[1, 3]], []], [[[]], []], [[[0, 6, 7]], [0, 6]]],
          petunjuk: ['arr.filter(x => kondisi).'],
          solusi: 'function hanyaGenap(arr) {\n  return arr.filter(x => x % 2 === 0);\n}' },
        { id: 'total', judul: 'Total Belanja', fungsi: 'totalHarga', args: 'items',
          cerita: 'items berupa array {nama, harga, jumlah}. Hitung total harga × jumlah.',
          tests: [[[[{ nama: 'a', harga: 1000, jumlah: 2 }, { nama: 'b', harga: 500, jumlah: 3 }]], 3500], [[[]], 0], [[[{ nama: 'x', harga: 99, jumlah: 1 }]], 99]],
          petunjuk: ['reduce((total, item) => total + ..., 0) — jangan lupa nilai awal 0.'],
          solusi: 'function totalHarga(items) {\n  return items.reduce((t, i) => t + i.harga * i.jumlah, 0);\n}' },
        { id: 'huruf', judul: 'Frekuensi Huruf', fungsi: 'hitungHuruf', args: 'teks',
          cerita: 'Kembalikan object yang menghitung kemunculan tiap huruf: "aab" → { a: 2, b: 1 }.',
          tests: [[['aab'], { a: 2, b: 1 }], [[''], {}], [['halo'], { h: 1, a: 1, l: 1, o: 1 }], [['aaaa'], { a: 4 }]],
          petunjuk: ['Loop tiap huruf: h[x] = (h[x] || 0) + 1.'],
          solusi: 'function hitungHuruf(teks) {\n  const h = {};\n  for (const x of teks) h[x] = (h[x] || 0) + 1;\n  return h;\n}' }
    ] }
];

// ---------- Worker: jalankan kode pemain terhadap test, aman dari loop tak berujung (di-terminate)
const WORKER_SRC = `
function sama(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return Number.isNaN(a) && Number.isNaN(b);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every(k => k in b && sama(a[k], b[k]));
}
function teks(v) { try { return v === undefined ? 'undefined' : typeof v === 'string' ? JSON.stringify(v) : typeof v === 'function' ? '[Function]' : JSON.stringify(v); } catch (e) { return String(v); } }
onmessage = e => {
  const { kode, fungsi, tests } = e.data;
  let f;
  try { f = new Function(kode + '\\nreturn typeof ' + fungsi + ' === "function" ? ' + fungsi + ' : undefined;')(); }
  catch (err) { postMessage({ galat: err.name + ': ' + err.message }); return; }
  if (!f) { postMessage({ galat: 'Fungsi ' + fungsi + ' belum ditulis.' }); return; }
  const hasil = tests.map(([args, harap]) => {
    const label = fungsi + '(' + args.map(teks).join(', ') + ')';
    try {
      const nyata = f(...JSON.parse(JSON.stringify(args)));
      return { label, harap: teks(harap), nyata: teks(nyata), ok: sama(nyata, harap) };
    } catch (err) { return { label, harap: teks(harap), nyata: err.name + ': ' + err.message, ok: false }; }
  });
  postMessage({ hasil });
};`;

function jalankanKode(kode, fungsi, tests) {
    return new Promise(res => {
        const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
        const w = new Worker(url);
        const selesai = v => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); res(v); };
        const t = setTimeout(() => selesai({ galat: 'Waktu habis (2 detik): kodemu mungkin berulang tanpa henti.' }), 2000);
        w.onmessage = e => selesai(e.data);
        w.onerror = e => selesai({ galat: e.message || 'Terjadi kesalahan.' });
        w.postMessage({ kode, fungsi, tests });
    });
}

// ---------- state & penyimpanan
const KEY = 'arena-kode-v1', NYAWA_MAKS = 3;
const SEMUA = DUNIA.flatMap((d, di) => d.tantangan.map(t => ({ ...t, dunia: d, di })));
let simpan = { selesai: {} };
try { simpan = JSON.parse(localStorage.getItem(KEY)) || simpan; } catch (e) { /* localStorage diblokir */ }
const tulis = () => { try { localStorage.setItem(KEY, JSON.stringify(simpan)); } catch (e) { /* abaikan */ } };

let idx = 0, nyawa = NYAWA_MAKS, hintPakai = 0, solusiDilihat = false, sudahLulus = false;
const $ = id => document.getElementById(id);
const terbuka = i => i === 0 || !!simpan.selesai[SEMUA[i - 1].id];
const totalXP = () => Object.values(simpan.selesai).reduce((s, x) => s + x.xp, 0);
const starter = t => `function ${t.fungsi}(${t.args}) {\n  // tulis kodemu di sini\n}\n`;

function gambarStatus() {
    const xp = totalXP(), lv = Math.floor(xp / 50) + 1;
    $('lv').textContent = 'Lv ' + lv;
    $('xptxt').textContent = xp + ' XP';
    $('xpbar').style.width = (xp % 50) * 2 + '%';
}

function gambarPeta() {
    let h = '', dunia = null;
    SEMUA.forEach((t, i) => {
        if (t.dunia !== dunia) { dunia = t.dunia; h += `<h3>${dunia.ikon} ${dunia.judul}</h3>`; }
        const s = simpan.selesai[t.id], buka = terbuka(i);
        h += `<button data-i="${i}" class="${i === idx ? 'on' : ''}${s ? ' done' : ''}" ${buka ? '' : 'disabled'}><span>${buka ? '' : '🔒 '}${t.judul}</span><span class="st">${s ? '★'.repeat(s.stars) + '☆'.repeat(3 - s.stars) : ''}</span></button>`;
    });
    $('peta').innerHTML = h;
}

function gambarNyawa() { $('nyawa').textContent = '❤️'.repeat(nyawa) + '🖤'.repeat(NYAWA_MAKS - nyawa); }

function muat(i) {
    idx = i; nyawa = NYAWA_MAKS; hintPakai = 0; solusiDilihat = false; sudahLulus = false;
    const t = SEMUA[i];
    $('dunia').textContent = `${t.dunia.ikon} ${t.dunia.judul} · ${i + 1}/${SEMUA.length}`;
    $('judul').textContent = t.judul;
    $('cerita').textContent = t.cerita;
    $('sig').textContent = `${t.fungsi}(${t.args})`;
    $('kode').value = starter(t);
    $('hint').hidden = true; $('hasil').innerHTML = ''; $('pesan').hidden = true; $('lanjut').hidden = true;
    $('solusi').disabled = true; $('petunjuk').disabled = false; $('jalankan').disabled = false;
    gambarNyawa(); gambarPeta();
}

function pesan(teks, ok) { const p = $('pesan'); p.textContent = teks; p.className = 'pesan ' + (ok ? 'ok' : 'bad'); p.hidden = false; }

async function jalankan() {
    if (nyawa <= 0 || sudahLulus) return;
    const t = SEMUA[idx];
    $('jalankan').disabled = true;
    const r = await jalankanKode($('kode').value, t.fungsi, t.tests);
    $('jalankan').disabled = false;
    const ul = $('hasil'); ul.innerHTML = '';
    if (r.galat) {
        const li = document.createElement('li'); li.className = 'bad'; li.textContent = '❌ ' + r.galat; ul.appendChild(li);
    } else r.hasil.forEach(x => {
        const li = document.createElement('li');
        li.className = x.ok ? 'ok' : 'bad';
        li.textContent = x.ok ? `✅ ${x.label} → ${x.nyata}` : `❌ ${x.label} → ${x.nyata} (seharusnya ${x.harap})`;
        ul.appendChild(li);
    });
    if (!r.galat && r.hasil.every(x => x.ok)) return menang();
    nyawa--; gambarNyawa();
    if (nyawa <= 0) {
        pesan('💀 Nyawa habis! Kamu boleh membuka solusi untuk belajar, atau ulangi tantangan ini.', false);
        $('solusi').disabled = false; $('jalankan').disabled = true;
    } else {
        pesan(`Belum tepat. Sisa nyawa: ${nyawa}. Baca hasil tes di atas, lalu coba lagi.`, false);
        if (nyawa === 1) $('solusi').disabled = false;
    }
}

function menang() {
    sudahLulus = true;
    const t = SEMUA[idx];
    const stars = solusiDilihat ? 1 : nyawa;
    const xp = solusiDilihat ? 0 : Math.max(5, stars * 10 - hintPakai * 5);
    const lama = simpan.selesai[t.id];
    if (!lama || xp > lama.xp || stars > lama.stars) simpan.selesai[t.id] = { stars: Math.max(stars, lama ? lama.stars : 0), xp: Math.max(xp, lama ? lama.xp : 0) };
    tulis(); gambarStatus(); gambarPeta();
    pesan(`🎉 Lulus! ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} +${xp} XP`, true);
    $('jalankan').disabled = true;
    $('lanjut').hidden = false;
    $('lanjut').textContent = idx + 1 < SEMUA.length ? 'Tantangan berikutnya →' : '🏆 Semua selesai! Main lagi dari awal';
}

$('jalankan').onclick = jalankan;
$('ulang').onclick = () => muat(idx);
$('lanjut').onclick = () => muat(idx + 1 < SEMUA.length ? idx + 1 : 0);
$('petunjuk').onclick = () => {
    const t = SEMUA[idx];
    hintPakai = Math.min(hintPakai + 1, 1);
    $('hint').hidden = false; $('hint').textContent = '💡 ' + t.petunjuk[0];
    $('petunjuk').disabled = true;
};
$('solusi').onclick = () => {
    if (!confirm('Lihat solusi? Tantangan ini hanya memberi 1 bintang dan 0 XP.')) return;
    solusiDilihat = true; $('kode').value = SEMUA[idx].solusi;
    $('jalankan').disabled = false; if (nyawa <= 0) { nyawa = 1; gambarNyawa(); }
};
$('reset').onclick = () => {
    if (!confirm('Hapus semua progres?')) return;
    simpan = { selesai: {} }; tulis(); gambarStatus(); muat(0);
};
$('peta').onclick = e => { const b = e.target.closest('button[data-i]'); if (b && !b.disabled) muat(+b.dataset.i); };
$('kode').addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); const k = e.target, s = k.selectionStart; k.setRangeText('  ', s, k.selectionEnd, 'end'); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); jalankan(); }
});

gambarStatus();
const pertama = SEMUA.findIndex(t => !simpan.selesai[t.id]);
muat(pertama === -1 ? 0 : pertama);
