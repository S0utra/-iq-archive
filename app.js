const D=window.IQ_ARCHIVE_DATA||[],M=window.IQ_ARCHIVE_META||{};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const E={query:$('#query'),game:$('#game'),category:$('#category'),size:$('#size'),number:$('#number'),trnMin:$('#trnMin'),trnMax:$('#trnMax'),pattern:$('#pattern'),solution:$('#solution'),sort:$('#sort'),cards:$('#cards'),count:$('#resultCount'),page:$('#pageInfo')};
let page=1,per=30,F=[],listMode=storeSafe('iq-list-mode',false);
function storeSafe(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}}
const gameOrder=['Intelligent Qube / Kurushi','I.Q. Remix+','I.Q. Final / Kurushi Final','I.Q. Mania'];
const gameInfo={'Intelligent Qube / Kurushi':'L’original PlayStation et ses solutions d’exemple.','I.Q. Remix+':'Nouvelles grilles, mazes et variantes.','I.Q. Final / Kurushi Final':'La vaste collection de la version Final.','I.Q. Mania':'La compilation portable de la série.'};
const store={get(k,d=[]){try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let favorites=store.get('iq-favorites'),history=store.get('iq-history');
function fmt(n){return Number(n||0).toLocaleString('fr-FR')}
function options(el,values,first){el.innerHTML=`<option value="">${first}</option>`+values.map(x=>`<option>${x}</option>`).join('')}
options(E.game,gameOrder.filter(g=>D.some(x=>x.game===g)),'Tous les jeux');
options(E.size,[...new Set(D.map(x=>x.size).filter(Boolean))].sort(sizeSort),'Toutes les tailles');
function sizeSort(a,b){const pa=a.split('×').map(Number),pb=b.split('×').map(Number);return pa[0]-pb[0]||pa[1]-pb[1]}
function gameCount(g){return D.filter(x=>x.game===g).length}
$('#heroStats').innerHTML=`<div class="heroStat"><b>${fmt(M.records||D.length)}</b><small>éléments</small></div><div class="heroStat"><b>${gameOrder.filter(g=>gameCount(g)).length}</b><small>jeux</small></div><div class="heroStat"><b>${fmt(D.filter(x=>x.solution).length)}</b><small>solutions</small></div>`;
$('#gameCards').innerHTML=gameOrder.filter(g=>gameCount(g)).map((g,i)=>`<button class="gameCard" data-game="${g}"><span class="index">ARCHIVE 0${i+1}</span><h3>${g}</h3><p>${gameInfo[g]||''}</p><span class="count">${fmt(gameCount(g))} éléments →</span></button>`).join('');
function switchView(view){$$('.view').forEach(v=>v.classList.remove('active'));$(view).classList.add('active');$$('[data-nav-main]').forEach(b=>b.classList.toggle('active',(view==='#homeView'&&b.dataset.navMain==='home')||(view==='#exploreView'&&b.dataset.navMain==='explore')));scrollTo({top:0,behavior:'smooth'})}
function openExplorer(game='',title='Tous les puzzles',subtitle='Parcours l’ensemble des données actuellement importées.'){E.game.value=game;$('#exploreTitle').textContent=title;$('#exploreSubtitle').textContent=subtitle;page=1;apply();switchView('#exploreView')}
$$('.gameCard').forEach(b=>b.onclick=()=>openExplorer(b.dataset.game,b.dataset.game,gameInfo[b.dataset.game]));
$$('.quickCard').forEach(b=>b.onclick=()=>quick(b.dataset.quick));
function quick(q){reset(false);if(q==='solutions'){E.game.value='Intelligent Qube / Kurushi';E.solution.value='yes';openExplorer(E.game.value,'Solutions disponibles','Les puzzles pour lesquels la source fournit une solution d’exemple.')}else if(q==='hard'){E.trnMin.value=15;openExplorer('','Puzzles difficiles','Une sélection dont le TRN est supérieur ou égal à 15.')}else if(q==='mazes'){E.game.value='I.Q. Remix+';E.category.value='maze';openExplorer(E.game.value,'Forbidden Mazes','Les labyrinthes spéciaux actuellement disponibles.')}else if(q==='random'){const pool=D.filter(x=>x.category==='puzzle'),x=pool[Math.floor(Math.random()*pool.length)];show(x.id)}else if(q==='favorites'){openSpecial(favorites,'Mes favoris','Les puzzles enregistrés sur cet appareil.')}else if(q==='history'){openSpecial(history,'Historique récent','Les dernières fiches consultées sur cet appareil.')}}
function openSpecial(ids,title,subtitle){$('#exploreTitle').textContent=title;$('#exploreSubtitle').textContent=subtitle;F=ids.map(id=>D.find(x=>x.id===id)).filter(Boolean);page=1;render();switchView('#exploreView')}
$('#homeBtn').onclick=()=>switchView('#homeView');$('#backBtn').onclick=()=>switchView('#homeView');$('#searchBtn').onclick=()=>openExplorer();$('#infoBtn').onclick=()=>$('#about').showModal();$('.closeAbout').onclick=()=>$('#about').close();
$('#statsBtn').onclick=()=>showStats();$('.closeStats').onclick=()=>$('#stats').close();
function vals(){return{q:E.query.value.trim().toLowerCase(),g:E.game.value,c:E.category.value,s:E.size.value,n:+E.number.value||null,a:E.trnMin.value===''?null:+E.trnMin.value,b:E.trnMax.value===''?null:+E.trnMax.value,p:E.pattern.value.trim().split(/\s+/).filter(Boolean).map(Number).filter(Number.isFinite),sol:E.solution.value,sort:E.sort.value}}
function has(matrix,p){if(!p.length)return true;const flat=(matrix||[]).flat();return flat.some((_,i)=>p.every((v,j)=>flat[i+j]===v))}
function apply(){const v=vals();F=D.filter(x=>{const hay=`${x.game} ${x.size||''} ${x.number||''} ${x.category||''} ${x.source_file||''}`.toLowerCase();return(!v.q||hay.includes(v.q))&&(!v.g||x.game===v.g)&&(!v.c||x.category===v.c)&&(!v.s||x.size===v.s)&&(!v.n||x.number===v.n)&&(v.a===null||Number(x.trn)>=v.a)&&(v.b===null||Number(x.trn)<=v.b)&&(!v.sol||(v.sol==='yes'?!!x.solution:!x.solution))&&has(x.matrix,v.p)});if(v.sort==='trn-desc')F.sort((a,b)=>(+b.trn||-1)-(+a.trn||-1));if(v.sort==='trn-asc')F.sort((a,b)=>(+a.trn||999)-(+b.trn||999));if(v.sort==='size')F.sort((a,b)=>sizeSort(a.size||'99×99',b.size||'99×99')||a.number-b.number);page=Math.min(page,Math.max(1,Math.ceil(F.length/per)));renderActiveFilters(v);render()}
function grid(x,detail=false){const cols=x.matrix?.[0]?.length||1;return `<div class="${detail?'detailGrid':'grid'}" style="grid-template-columns:repeat(${cols},1fr)">${(x.matrix||[]).flat().map(v=>`<i class="cube cube${v}"></i>`).join('')}</div>`}
function renderActiveFilters(v){const chips=[];if(v.q)chips.push(['Recherche',E.query.value]);if(v.g)chips.push(['Jeu',v.g]);if(v.c)chips.push(['Type',v.c]);if(v.s)chips.push(['Taille',v.s]);if(v.n)chips.push(['N°',v.n]);if(v.a!==null)chips.push(['TRN min',v.a]);if(v.b!==null)chips.push(['TRN max',v.b]);if(v.sol)chips.push(['Solution',v.sol==='yes'?'Oui':'Non']);$('#activeFilters').innerHTML=chips.map(([a,b])=>`<span><b>${a}</b> ${b}</span>`).join('')}
function render(){const max=Math.max(1,Math.ceil(F.length/per)),start=(page-1)*per;E.count.textContent=fmt(F.length);E.page.textContent=`${page} / ${max}`;E.cards.classList.toggle('listMode',listMode);$('#viewToggle').textContent=listMode?'☰ Liste':'▦ Cartes';E.cards.innerHTML=F.slice(start,start+per).map(x=>`<button class="card" data-id="${x.id}"><div class="cardTop"><div><b class="cardTitle">${x.category==='maze'?'Maze':'Puzzle'} ${x.number}${x.flipped_for_solution?' F':''}</b><div class="muted">${x.game}</div></div><span class="tag">${x.size||'—'}</span></div><div class="metaLine">${x.category==='puzzle'?`TRN ${x.trn}`:`${x.normal_cubes||0} cubes normaux`}${x.solution?' · Solution':''}${favorites.includes(x.id)?' · ★':''}</div>${grid(x)}</button>`).join('')||'<div class="empty">Aucun résultat pour cette sélection.</div>';$$('.card').forEach(c=>c.onclick=()=>show(+c.dataset.id));}
function cubeStats(x){const f=(x.matrix||[]).flat();return [0,1,2].map(v=>f.filter(n=>n===v).length)}
function difficulty(trn){trn=+trn||0;return trn<=8?'Accessible':trn<=12?'Intermédiaire':trn<=15?'Difficile':'Extrême'}
function show(id){
  const x=D.find(y=>y.id===id);if(!x)return;
  history=[id,...history.filter(v=>v!==id)].slice(0,30);store.set('iq-history',history);
  const [n,a,f]=cubeStats(x),total=n+a+f||1,fav=favorites.includes(id);
  const visible=F.length?F:D,idx=visible.findIndex(y=>y.id===id),prev=idx>0?visible[idx-1]:null,next=idx>=0&&idx<visible.length-1?visible[idx+1]:null;
  const title=`${x.game} — ${x.category==='maze'?'Maze':'Puzzle'} ${x.number} (${x.size})`;
  $('#detailBody').innerHTML=`<div class="detailHead"><p class="kicker">${x.game}</p><h2>${x.category==='maze'?'Maze':'Puzzle'} ${x.number}${x.flipped_for_solution?' F':''}</h2><p class="muted">${x.size} · Source : ${x.source_file}</p><div class="detailActions"><button class="favoriteBtn ${fav?'active':''}" data-fav="${id}">${fav?'★ Retirer des favoris':'☆ Ajouter aux favoris'}</button><button class="shareBtn" data-share="${id}">↗ Partager</button></div></div><div class="detailMeta"><span class="pill">${x.category==='puzzle'?`TRN ${x.trn}`:'Maze'}</span><span class="pill">${x.category==='puzzle'?difficulty(x.trn):'Spécial'}</span><span class="pill">${n} normaux</span><span class="pill">${a} advantage</span><span class="pill">${f} forbidden</span></div>${grid(x,true)}<div class="legend"><span><i class="cube cube0"></i> Normal ${(n/total*100).toFixed(1)} %</span><span><i class="cube cube1"></i> Advantage ${(a/total*100).toFixed(1)} %</span><span><i class="cube cube2"></i> Forbidden ${(f/total*100).toFixed(1)} %</span></div>${x.solution?`<h3>Solution d’exemple</h3>${x.solution_turns&&x.solution_turns!==x.trn?`<p class="warning">Solution en ${x.solution_turns} tours — TRN indiqué : ${x.trn}.</p>`:''}<div class="solution">${x.solution}</div>`:'<p class="muted">Aucune solution fournie dans la source pour ce puzzle.</p>'}<div class="detailNav"><button ${prev?'':'disabled'} data-nav="${prev?.id||''}">‹ Précédent</button><button ${next?'':'disabled'} data-nav="${next?.id||''}">Suivant ›</button></div>`;
  history.replaceState(null,'',`#puzzle=${id}`);document.title=title;
  $('#detail').showModal();$('[data-fav]').onclick=toggleFavorite;
  $('[data-share]').onclick=async()=>{const url=location.href,text=`${title} · TRN ${x.trn??'—'}`;try{if(navigator.share)await navigator.share({title,text,url});else{await navigator.clipboard.writeText(url);alert('Lien copié.')}}catch{}};
  $$('[data-nav]').forEach(b=>b.onclick=()=>b.dataset.nav&&show(+b.dataset.nav));
}
function toggleFavorite(e){const id=+e.currentTarget.dataset.fav;favorites=favorites.includes(id)?favorites.filter(v=>v!==id):[id,...favorites];store.set('iq-favorites',favorites);e.currentTarget.classList.toggle('active');e.currentTarget.textContent=favorites.includes(id)?'★ Retirer des favoris':'☆ Ajouter aux favoris';render()}
function showStats(){
  const puzzles=D.filter(x=>x.category==='puzzle');
  const trns=puzzles.map(x=>+x.trn).filter(Number.isFinite);
  const avg=trns.reduce((a,b)=>a+b,0)/(trns.length||1);
  const maxTrn=Math.max(...trns,0);
  const solved=puzzles.filter(x=>x.solution).length;
  const tiers=[
    ['Accessible',x=>(+x.trn||0)<=8],
    ['Intermédiaire',x=>(+x.trn||0)>=9&&(+x.trn||0)<=12],
    ['Difficile',x=>(+x.trn||0)>=13&&(+x.trn||0)<=15],
    ['Extrême',x=>(+x.trn||0)>=16]
  ];
  const rows=gameOrder.filter(g=>gameCount(g)).map(g=>{
    const a=D.filter(x=>x.game===g),t=a.map(x=>+x.trn).filter(Number.isFinite);
    const sizes=new Set(a.map(x=>x.size).filter(Boolean)).size;
    const peak=Math.max(...t,0);
    return `<button class="statRow statLink" data-stat-game="${g}"><div><b>${g}</b><small>${fmt(a.length)} éléments · ${sizes} formats</small></div><span>TRN moy. ${(t.reduce((p,c)=>p+c,0)/(t.length||1)).toFixed(2)} · max ${peak}</span></button>`
  }).join('');
  const sizeCounts=[...new Set(puzzles.map(x=>x.size).filter(Boolean))].sort(sizeSort).map(size=>({size,count:puzzles.filter(x=>x.size===size).length,avg:(()=>{const t=puzzles.filter(x=>x.size===size).map(x=>+x.trn).filter(Number.isFinite);return t.reduce((a,b)=>a+b,0)/(t.length||1)})()}));
  const biggest=Math.max(...sizeCounts.map(x=>x.count),1);
  const sizeBars=sizeCounts.map(x=>`<button class="barRow" data-stat-size="${x.size}"><span>${x.size}</span><i><em style="width:${Math.max(3,x.count/biggest*100)}%"></em></i><b>${fmt(x.count)}</b><small>TRN ${x.avg.toFixed(1)}</small></button>`).join('');
  const tierTotal=puzzles.length||1;
  const tierBars=tiers.map(([name,test])=>{const count=puzzles.filter(test).length;return `<div class="tierRow"><div><b>${name}</b><small>${fmt(count)} puzzles</small></div><i><em style="width:${count/tierTotal*100}%"></em></i><span>${(count/tierTotal*100).toFixed(1)} %</span></div>`}).join('');
  const hardest=[...puzzles].sort((a,b)=>(+b.trn||0)-(+a.trn||0)).slice(0,8).map(x=>`<button class="recordRow" data-record="${x.id}"><div><b>${x.game}</b><small>Puzzle ${x.number} · ${x.size}</small></div><span>TRN ${x.trn}</span></button>`).join('');
  $('#statsBody').innerHTML=`
    <div class="statsGrid">
      <div class="bigStat"><b>${fmt(D.length)}</b><span>éléments importés</span></div>
      <div class="bigStat"><b>${avg.toFixed(2)}</b><span>TRN moyen global</span></div>
      <div class="bigStat"><b>${maxTrn}</b><span>TRN maximal</span></div>
      <div class="bigStat"><b>${fmt(solved)}</b><span>solutions disponibles</span></div>
    </div>
    <h3>Par jeu</h3><div class="statRows">${rows}</div>
    <h3>Répartition par difficulté</h3><div class="tierRows">${tierBars}</div>
    <h3>Formats présents</h3><div class="barRows">${sizeBars}</div>
    <h3>Records de TRN</h3><div class="recordRows">${hardest}</div>`;
  $('#stats').showModal();
  $$('[data-stat-game]').forEach(b=>b.onclick=()=>{ $('#stats').close(); openExplorer(b.dataset.statGame,b.dataset.statGame,gameInfo[b.dataset.statGame]); });
  $$('[data-stat-size]').forEach(b=>b.onclick=()=>{ $('#stats').close(); reset(false); E.size.value=b.dataset.statSize; openExplorer('','Format '+b.dataset.statSize,'Tous les puzzles de ce format.'); });
  $$('[data-record]').forEach(b=>b.onclick=()=>show(+b.dataset.record));
}
function reset(run=true){$$('#filters input').forEach(x=>x.value='');$$('#filters select').forEach(x=>x.selectedIndex=0);page=1;if(run)apply()}
let inputTimer;$$('#filters input,#filters select').forEach(e=>e.addEventListener('input',()=>{clearTimeout(inputTimer);inputTimer=setTimeout(()=>{page=1;apply()},e.tagName==='INPUT'?140:0)}));$('#reset').onclick=()=>reset();$('#prev').onclick=()=>{if(page>1){page--;render();scrollTo({top:$('#filters').offsetTop-80,behavior:'smooth'})}};$('#next').onclick=()=>{if(page<Math.ceil(F.length/per)){page++;render();scrollTo({top:$('#filters').offsetTop-80,behavior:'smooth'})}};$('#detail .close').onclick=()=>$('#detail').close();
apply();

addEventListener('hashchange',()=>{const m=location.hash.match(/puzzle=(\d+)/);if(m)show(+m[1]);});
addEventListener('load',()=>{const m=location.hash.match(/puzzle=(\d+)/);if(m)show(+m[1]);});

$('#toggleFilters').onclick=()=>{const collapsed=$('#filters').classList.toggle('collapsed');$('#toggleFilters').textContent=collapsed?'☷ Afficher les filtres':'☷ Masquer les filtres'};
$('#viewToggle').onclick=()=>{listMode=!listMode;store.set('iq-list-mode',listMode);render()};
$$('[data-nav-main]').forEach(b=>b.onclick=()=>{const q=b.dataset.navMain;if(q==='home')switchView('#homeView');else if(q==='explore')openExplorer();else if(q==='random')quick('random');else if(q==='favorites')quick('favorites');else if(q==='stats')showStats()});
let deferredPrompt=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});
