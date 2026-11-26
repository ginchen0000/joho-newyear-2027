'use strict';
const langs = ['zh', 'en', 'ja', 'ko'];
let lang = 'zh', scene = 0, trigger = null, started = 0, duration = 0, touchX = null, suppressClick = false;
try { if (langs.includes(localStorage.getItem('joho-lang'))) lang = localStorage.getItem('joho-lang'); } catch {}
const $ = id => document.getElementById(id);
const idx = () => langs.indexOf(lang);
const t = key => translations[idx()][keys.indexOf(key)] ?? dict[lang][key] ?? '';
const stage = document.querySelector('.stage');
const dietText = i => dietNames[idx()][['vegan','allium','egg','meat','mixed'].indexOf(dietCodes[i])];
const riskText = r => riskNames[idx()][['egg','soy','wheat','unknown','none'].indexOf(r)];
function tag(text) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = text;
    return span;
}
function renderScene(animate = false) {
    const n = idx();
    const lines = scenes[n][scene].split('\n');
    $('sceneArt').src = `assets/story-${scene + 1}.webp?v=7.2`;
    $('sceneCaption').replaceChildren(...lines.map(line => {
        const span = document.createElement('span');
        span.className = 'caption-line';
        span.textContent = line;
        return span;
    }));
    $('sceneHint').textContent = scene === 7 ? t('taste') : ['點擊下一頁','Tap for next scene','タップして次へ','탭하여 다음 장면'][n];
    $('skipScene').textContent = ['跳過劇情 ›','Skip story ›','物語をスキップ ›','이야기 건너뛰기 ›'][n];
    $('sceneDots').replaceChildren();
    for (let i = 0; i < 8; i++) {
        const b = document.createElement('button');
        b.className = 'dot';
        b.type = 'button';
        b.setAttribute('aria-label', `${i + 1} / 8`);
        b.setAttribute('aria-current', String(i === scene));
        b.onclick = () => { scene = i; renderScene(true); $('sceneDots').children[i].focus(); };
        $('sceneDots').append(b);
    }
    stage.classList.remove('play','complete');
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        void stage.offsetWidth;
        stage.classList.add('play');
        started = performance.now();
        duration = 1350;
    } else { duration = 0; }
    if (scene < 7) { const next = new Image(); next.src = `assets/story-${scene + 2}.webp?v=7.2`; }
}
function advance() {
    if (duration && performance.now() - started < duration) {
        stage.classList.add('complete'); duration = 0; return;
    }
    if (scene === 7) { location.hash = 'menu'; return; }
    scene++; renderScene(true);
}
$('sceneTap').onclick = () => { if (!suppressClick) advance(); };
stage.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; suppressClick = false; }, {passive:true});
stage.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) < 65) return;
    suppressClick = true;
    if (dx > 0 && scene > 0) { scene--; renderScene(true); }
    else if (dx < 0) { duration = 0; advance(); }
    setTimeout(() => { suppressClick = false; }, 350);
}, {passive:true});
function renderMenu() {
    $('foodgrid').replaceChildren();
    for (let cat = 1; cat <= 5; cat++) {
        const section = document.createElement('section'); section.className = 'group';
        const h = document.createElement('h2'); h.textContent = dict[lang].categories[cat];
        const grid = document.createElement('div'); grid.className = 'grid';
        dishes.forEach((d,i) => {
            if (d.cat !== cat) return;
            const b = document.createElement('button'); b.className = 'food';
            const img = document.createElement('img'); img.src = `assets/food-${i}.webp?v=7.2`; img.alt = ''; img.loading = 'lazy';
            const name = document.createElement('strong'); name.textContent = d.names[idx()];
            b.append(img,name,tag(dietText(i))); b.onclick = () => openFood(i,b); grid.append(b);
        });
        section.append(h,grid); $('foodgrid').append(section);
    }
}
function render() {
    document.documentElement.lang = ({zh:'zh-Hant',en:'en',ja:'ja',ko:'ko'})[lang];
    document.querySelectorAll('[data-t]').forEach(e => e.textContent = t(e.dataset.t));
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.lang === lang)));
    renderScene(); renderMenu();
}
function openFood(i,b) {
    trigger = b; const d = dishes[i];
    $('dishTitle').textContent = d.names[idx()]; $('dishArt').src = `assets/food-${i}.webp?v=7.2`;
    $('dishTags').replaceChildren(tag(dietText(i)), ...riskCodes[i].map(r => tag(riskText(r))));
    $('dishDesc').textContent = d.desc[idx()];
    $('dishMemory').textContent = memories[i][idx()];
    $('detail').showModal(); document.body.classList.add('modal-open'); $('detail').scrollTop = 0; $('close').focus();
}
$('detail').addEventListener('close', () => { document.body.classList.remove('modal-open'); trigger?.focus({preventScroll:true}); });
$('close').onclick = () => $('detail').close();
$('detail').addEventListener('click', e => { if (e.target === $('detail')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
function route() {
    const id = location.hash.slice(1); const page = ['home','story','menu','wish'].includes(id) ? id : 'home';
    if ($('detail').open) $('detail').close();
    document.querySelectorAll('.page').forEach(e => e.hidden = e.id !== page);
    if (page === 'story') renderScene(true);
    if (page === 'home') { const hero = $('home'); hero.classList.remove('hero'); void hero.offsetWidth; hero.classList.add('hero'); }
    window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { const y = scrollY; lang = b.dataset.lang; try { localStorage.setItem('joho-lang',lang); } catch {} render(); window.scrollTo(0,y); });
render(); route();
// 導覽列實際高度決定滿版圖片可用空間。
const header = document.querySelector('header');
function syncHeaderHeight() {
    document.documentElement.style.setProperty('--nav-height', `${header.offsetHeight}px`);
}
syncHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
window.addEventListener('resize', syncHeaderHeight);
