'use strict';
const langs=['zh','en','ja','ko'];
let lang='zh',filter='all',trigger=null;
try{if(langs.includes(localStorage.getItem('joho-lang')))lang=localStorage.getItem('joho-lang')}catch{}
const $=id=>document.getElementById(id);
const idx=()=>langs.indexOf(lang);
const t=key=>translations[idx()][keys.indexOf(key)]??dict[lang][key]??'';
const dietText=type=>labels[idx()][['all','veg','egg','meat'].indexOf(type)];
function renderMenu(){
 $('filters').replaceChildren();
 for(const type of ['all','veg','egg','meat']){const b=document.createElement('button');b.textContent=dietText(type);b.setAttribute('aria-pressed',String(filter===type));b.onclick=()=>{filter=type;renderMenu();$('filters').children[['all','veg','egg','meat'].indexOf(type)].focus()};$('filters').append(b)}
 $('foodgrid').innerHTML='';
 for(let cat=1;cat<=5;cat++){const items=dishes.map((d,i)=>({d,i})).filter(({d,i})=>d.cat===cat&&(filter==='all'||dietary[i]===filter));if(!items.length)continue;const section=document.createElement('section');section.className='group';section.innerHTML=`<h2>${dict[lang].categories[cat]}</h2><div class="grid"></div>`;for(const {d,i} of items){const b=document.createElement('button');b.className='food';b.innerHTML=`<img src="assets/food-${i}.webp" alt="" loading="lazy"><strong>${d.names[idx()]}</strong><span class="tag">${dietText(dietary[i])}</span>`;b.onclick=()=>openFood(i,b);section.lastElementChild.append(b)}$('foodgrid').append(section)}
}
function render(){document.documentElement.lang=({zh:'zh-Hant',en:'en',ja:'ja',ko:'ko'})[lang];document.querySelectorAll('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));$('chapters').innerHTML=chapters[idx()].map((c,i)=>`<article class="chapter">${i<3?`<img src="assets/${['history','harbor','memory'][i]}.webp" alt="" loading="lazy">`:''}<h2>${c[0]}</h2>${c.slice(1).map(p=>`<p>${p}</p>`).join('')}</article>`).join('');renderMenu()}
function openFood(i,b){trigger=b;const d=dishes[i];$('dishTitle').textContent=d.names[idx()];$('dishArt').src=`assets/food-${i}.webp`;$('dishTags').textContent=dietText(dietary[i]);$('dishDesc').textContent=d.desc[idx()];$('dishMemory').textContent=[ '這是台灣家常餐桌與清粥小菜中熟悉的一味。','A familiar part of Taiwan’s everyday table and late-night congee meals.','台湾の家庭や夜のお粥の食卓で親しまれる味です。','대만의 가정식과 늦은 밤 죽 식탁에서 친숙한 맛입니다.'][idx()];$('dishAllergens').textContent=risks[i].map(r=>labels[idx()][4+['egg','soy','wheat','shell','milk','sulfite','sesame'].indexOf(r)]).join(' · ')||labels[idx()][11];$('detail').showModal();document.body.style.overflow='hidden';$('close').focus()}
$('detail').addEventListener('close',()=>{document.body.style.overflow='';trigger?.focus()});$('close').onclick=$('done').onclick=()=>$('detail').close();$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
function route(){const id=location.hash.slice(1);const page=['home','story','menu','wish'].includes(id)?id:'home';if($('detail').open)$('detail').close();document.querySelectorAll('.page').forEach(e=>e.hidden=e.id!==page);window.scrollTo(0,0)}
window.addEventListener('hashchange',route);document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{const y=scrollY;lang=b.dataset.lang;try{localStorage.setItem('joho-lang',lang)}catch{}render();window.scrollTo(0,y)});render();route();
