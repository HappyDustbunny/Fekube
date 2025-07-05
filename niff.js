// Thanks to Atle Aamodt for the chime sound. Obtained from https://samplefocus.com/samples/chime-hall-reverb-soft-2 


const pi = Math.PI;
const kv3h = Math.sqrt(3)/2;

const timer = ms => new Promise(res => setTimeout(res, ms));

const winWidth = window.screen.width;
const sizeFactor = 0.64;
const zoomFactor = sizeFactor * winWidth / 300;
const winHeight = winWidth;  // These two variables are currently used together to make square displays

// Manacosts
const manaPrice = 50;
const boosterPrice = 100;
const wrongPatternPrice = 10;
const showPatternAgainCost = 20;
const attackedCost = 1;


// Initialize QR-code reader
const html5Qrcode = new Html5Qrcode("reader");
const config = {fps: 10, qrbox: {width: sizeFactor * winWidth, height: sizeFactor * winHeight}};

const messageDiv = document.getElementById('messageDiv');
const showTextDiv = document.getElementById('showTextDiv');
const canvasQrShow = document.getElementById('canvasQrShow');
const infoButton = document.getElementById('infoButton');


let gameTime = 2 * 60000;  // 2 minutes of game time
let attackTimer = '';
let whileAttackedTimer = '';                
let amulet = false;
let attackProbability = 0.001;
let booster = 1.0;  // 100% 
let coordinator = false;
let solo = false;
let currentUser = '';
let endRoundAt = 0;
let endGameAt = 0;
let chordList = [];
let gameMode = '';
let gameState = 'chooseCoordinator';
let participantList = [];
let gameHasHealer = false;
let gameHasHunter = false;
let id = 0;
let globalMana = 500;  // Start with some mana to heal attacked players
let isVictim = 0;  // Change to 5 if player is attacked and needs healing. Is healed fully by Healer, but need a few scans of '0' to heal alone
let localMana = 0;
let isRoundOverTimer;
let isGameOverTimer;
let soloEndScans = Math.floor((Math.random() * 6) + 3);

let healMsgs = [
    '',  // No message when healing has occured
    'Og ... sidste gang',
    'Lidt mere',
    'Det hjælper',
    'Det var bedre!',
]

let lastScan = 0;     // Used for M3T1G1
let clockFaceCoor = { // Used for M3T1G1
    0: [130 * 0.0 + 150, -130 * 0.0 + 150],
    1: [130 * 0.5 + 150, -130 * kv3h + 150],
    2: [130 * kv3h + 150, -130 * 0.5 + 150],
    3: [130 * 1.0 + 150, -130 * 0.0 + 150],
    4: [130 * kv3h + 150,  -130 *-0.5 + 150],
    5: [130 * 0.5 + 150, -130 * -kv3h + 150],
    6: [130 * 0.0 + 150, -130 * -1.0 + 150],
    7: [130 * -0.5 + 150, -130 * -kv3h + 150],
    8: [130 * -kv3h + 150, -130 * -0.5 + 150],
    9: [130 * -1.0 + 150, -130 * 0.0 + 150],
    10: [130 * -kv3h + 150, -130 * 0.5 + 150],
    11: [130 * -0.5 + 150, -130 * kv3h + 150],
    12: [130 * 0.0 + 150, -130 * 1.0 + 150]
} ;

let anagramArray =[
["butikshylder", ["er","du","ud","de","et","et","te","se","ti","by","is","ur","el","le","ry","bi","sy","det","det","ted","til","ilt","der","red","her","dit","tid","ser","set","tre","ret","ude","ked","bil","del","led","hus","sit","sti","ske","eks","the","tur","luk","let","lys","dyr","ryd","ide","ild","bed","sur","hel","kys","sky","hul","hed","lyt","bud","syd","lyd","hud","bid","ryk","bus","dyb","hit","reb","kur","sue","tyk","bur","lur","hil","hut","lidt","helt","sted","dets","lide","sker","side","sket","slet","slut","held","lyst","husk","skyd","stil","skib","skid","skud","hest","dybt","styr","sluk","lusk","bedt","stik","drik","tryk","kurs","skru","lyde","ledt","delt","hils","heks","byde","duer","slik","ride","blik","brud","uret","rute","skub","tysk","dyrt","klub","byer","huse","beth","ydre","dyre","hule","surt","bidt","sure","heit","bide","kryb","bush","lyse","sild","hyre","burde","huske","skyld","lyder","helst","skide","huset","skyde","skudt","bedst","sikre","krise","lyset","skrid","skidt","styre","ryste","uheld","bryde","byder","biler","luder","liste","tider","skilt","sider","brudt","skibe","kilde","hilse","herud","tyske","butik","bryst","uhyre","tyder","skred","skrub","skrue","dyrke","hyret","kiste","turde","husker","skyder","krydse","hertil","skibet","styrke","skridt","tiders","tilbud","bukser","udstyr","yderst","dertil","sikret","udtryk","kilder","skride","beskyt","skylder","tilbyde","beskidt","skulder","stilhed","diskret","tilbyder",]],
["udklipsbogen", ["du","ud","en","og","de","nu","os","so","se","op","ok","ko","bo","ni","is","el","le","bi","den","ned","end","dig","gid","din","ind","sig","nok","kun","god","dog","gud","gik","kig","sin","ude","ked","bil","del","led","pis","ben","ske","eks","sgu","gus","uge","luk","bog","lod","lig","ung","ide","ild","bed","sko","ens","sne","pik","kop","big","los","sol","ond","nul","bud","leg","bid","bus","glo","sue","gul","ged","pil","lige","igen","enig","geni","sige","dine","inde","uden","lide","pige","gode","kone","side","blod","bold","sine","isen","slog","unge","ugen","slip","spil","seng","send","guds","skib","skid","onde","skud","klog", "klud", "sluk","lusk","guld","glip","kode","sind","king","kold","kilo","plus","puls","kopi","pund","slik","blik","olie","skub","kung","klub","niks","bind","pose","gule","boks","bund","pung","bide","sund","long","knus","klip","sild","nogle","siden","sinde","indse","bilen","skide","onkel","pigen","skole","konge","bogen","solen","blind","kugle","begik","skibe","ligne","kilde","koden","kolde","spion","spild","ilden","knuse","kunde","knibe","kloge","binde","udkig","bingo","nogle", "nudel", "penis","bunke","posen","guide","dusin","ledig","skolen","bolden","sekund","spilde","kilden","boksen","kuglen","blinde","deling","kusine","single","gidsel",]],
["decimalpunkt", ["du","ud","at","en","de","et","et","te","nu","da","ad","ti","al","ni","an","el","le","det","det","ted","til","ilt","med","dem","den","ned","end","kan","men","nem","min","din","ind","lad","tak","kat","man","alt","tal","mit","tim","dit","tid","kun","ude","ked","del","led","mad","nat","luk","let","dum","ide","ild","and","dan","pik","cia","nul","ian","tip","pak","mil","mel","pan","put","pil","lam","mand","lidt","mine","dine","inde","tale","uden","lide","lade","dale","time","land","plan","kamp","dame","made","mund","paul","midt","nemt","ment","dumt","kald","knap","date","klap","ledt","delt","team","amen","pund","dick","kina","tank","tina","lake","cent","mail","tand","male","kane","plet","klip","altid","andet","tiden","kalde","kendt","minut","maden","damen","lande","andel","laden","tanke","minde","kaldt","panik","milde","kilde","ladet","punkt","ilden","timen","kampe","kunde","metal","knald","meldt","latin","landet","kampen","kaldte","kaldet","planet","klient","midten","midnat","kilden","ukendt","udtale","united","knalde","kapitel",]],
["cykelformand", ["er","en","de","af","om","da","ad","ok","ko","ny","al","ro","an","ar","el","le","ry","med","dem","den","ned","end","for","der","red","kan","men","nem","kom","fra","far","lad","nok","man","mor","rom","mod","dom","fyr","ked","nye","fem","del","led","ord","rod","mad","fly","dyr","ryd","lod","nar","ren","mon","ray","fod","and","dan","fed","arm","ram","ond","lyd","nyd","fan","ryk","mel","lam","okay","mand","folk","flok","klar","lade","dale","kone","frem","land","fred","fyre","aner","fald","flad","dame","made","fare","mord","onde","form","kald","rend","nord","ofre","andy","kode","nyde","lyde","kold","arme","rock","amen","lady","drak","race","amok","koma","more","ydre","dyre","mode","lake","kram","flod","larm","male","kane","fyld","andre","orden","ordne","klare","lyder","lader","alder","foran","frank","damer","onkel","fyren","fader","kalde","falde","maden","damen","lande","andel","laden","nyder","myrde","moder","koden","kolde","model","armen","lyden","ankom","karen","narko","krone","koner","rocky","fylde","cykel","knald","faren","enorm","dyrke","foden","randy","kalder","falder","floden","fremad","normal","fordel","fandme","forlad","lander","fylder","flyder","marken","knalde","forlade","normale","formand","anmoder",]],
["plastikborde", ["er","at","de","et","et","te","os","so","se","op","da","ad","to","ok","ko","ti","al","sa","bo","ro","is","ar","el","le","bi","det","det","ted","til","ilt","der","red","lad","tak","kat","alt","tal","dit","tid","ser","set","tre","ret","tro","par","ked","pas","bil","del","led","pis","ord","rod","sit","sti","bad","ske","eks","bor","bro","let","lod","sat","ide","ild","bed","sad","sko","bar","pik","kop","los","sol","sal","las","abe","bid","tab","top","pot","ost","art","reb","tip","pak","per","bak","pil","skal","bare","aber","lidt","sted","dets","klar","tale","lide","sker","skat","stak","kast","stop","post","stor","sort","lort","lade","dale","side","sket","slap","slet","blod","bold","kort","slip","spil","blot","bolt","stod","bord","spor","skai","stil","skib","skid","krop","pris","stol","slot","slot","kald","bedt","stik","drik","date","kors","bort","klap","tabe","kode","drop","pres","ledt","delt","kold","kilo","rask","skar","rose","trak","park","kopi","drak","slik","ride","blik","olie","kaos","boet","skab","salt","last","brad","drab","spar","base","port","pose","boks","bidt","lake","irak","bide","dato","plet","rita","klip","sild","blad","altid","taler","store","sorte","klare","lader","alder","plads","skide","klart","skade","skole","kalde","stole","bedst","sikre","krise","taber","paris","skrid","skidt","skabe","biler","koldt","skabt","liste","trods","tider","taske","kaste","ordet","rodet","skilt","radio","kaldt","sider","derop","borte","skibe","teori","besat","kilde","ladet","kolde","spore","spild","pilot","april","spark","blade","koste","sport","desto","spare","tales","korte","skred","pirat","parti","spred","lorte","laser","kiste","kalder","pistol","oberst","skibet","kaldte","kaldet","stoler","ekstra","kaster","klaret","klatre","soldat","skridt","koster","sektor","bordet","tiders","opkald","skaber","kaldes","blodet","sporet","skader","skabte","skabet","dertil","spilde","sikret","skadet","sparke","kilder","skride","spildt","pastor","spredt","aktier","tilpas","kopier","spilder","beskidt","artikel","pladser","kapitel","diskret","soldater","pistoler",]],
["plantesygdom", ["at","en","og","de","et","et","te","om","os","so","se","op","da","ad","to","ny","al","sa","an","el","le","sy","det","det","ted","med","dem","den","ned","end","men","nem","som","lad","man","alt","tal","dag","gad","god","dog","tag","agt","mod","dom","set","tog","nye","pas","del","led","mad","nat","nyt","tom","sag","gas","let","lys","syg","lod","sat","sad","mon","ens","sne","san","and","dan","gal","lag","lyt","los","sol","ond","syd","lyd","sal","las","leg","syn","nyd","top","pot","gem","glo","ost","pyt","mel","pan","ged","lam","godt","mand","tage","sted","dets","tale","stop","post","gode","lade","dale","galt","lagt","dage","gade","sagt","glad","lang","sent","sten","ondt","mens","slap","mest","slet","glem","land","slog","seng","lyst","plan","stod","dame","made","send","magt","sang","onde","stol","slot","slot","nemt","ment","tegn","tony","glas","slag","salg","date","smed","type","andy","dans","sand","synd","gemt","slem","smag","syge","nyde","lyde","ledt","delt","team","amen","lady","ogsa","stan","gale","saml","salt","last","samt","mode","pose","tynd","sygt","steg","spyt","dato","syng","syne","tand","long","male","dags","lyse","plet","spyd","noget","sagde","dages","mange","megan","nogle","andet","gamle","langt","sandt","stand","plads","sagen","sange","dagen","gaden","agent","sendt","glemt","stole","netop","slemt","lyset","danse","sande","lagde","glade","solen","synge","mands","maden","damen","lange","angel","lande","andel","laden","samle","solgt","ensom","smage","ladet","model","sandy","langs","lyden","snyde","metal","desto","tales","snydt","modet","posen","meldt","stone","plage","synet","godnat","landet","soldat","planet","samlet","solgte","sygdom","dagens","magten","slange","gyldne","onsdag","opdage","slaget","stolen","mangel","posten","opdaget","modtage","pladsen","landets","langsom","langsomt",]],
["nyhedsportal", ["er","at","en","de","et","et","te","os","so","se","op","da","ad","to","ny","ha","ah","al","sa","oh","ro","an","ar","el","le","ry","sy","det","det","ted","har","den","ned","end","der","red","han","her","lad","alt","tal","ser","set","tre","ret","hen","tro","par","hos","nye","pas","del","led","ord","rod","the","nat","nyt","let","lys","dyr","ryd","lod","sat","nar","sad","ren","hel","ray","ens","sne","hop","san","and","dan","hed","lyt","los","sol","ond","syd","lyd","hat","sal","las","syn","nyd","top","pot","ost","art","had","pyt","per","hot","pan","hal","hor","hans","nash","hold","helt","sted","dets","tale","stop","post","stor","sort","lort","lade","dale","sent","sten","ondt","slap","slet","land","held","lyst","plan","aner","stod","yeah","hent","spor","send","rent","onde","stol","slot","slot","tony","hest","styr","rend","date","nord","type","andy","dans","sand","drop","synd","pres","nyde","lyde","ledt","delt","rose","lady","stan","hals","salt","last","hade","spar","dyrt","ydre","dyre","port","pose","tynd","spyt","dato","horn","syne","tand","hale","lyse","plet","spyd","hyre","hore","andre","andet","holde","taler","store","sorte","snart","orden","ordne","sandt","stand","lyder","lader","alder","hader","plads","helst","holdt","sendt","stole","netop","lyset","danse","sande","henry","hotel","solen","styre","ryste","trods","ordet","rodet","lande","andel","laden","nyder","herop","derop","nyhed","ladet","spore","sandy","lyden","snyde","sport","desto","ethan","spare","tales","tyder","spred","snydt","posen","lorte","laser","hyret","troen","stone","randy","synet","holder","person","landet","stoler","planer","soldat","holdet","halsen","planet","danser","andres","ordnet","porten","yderst","sporet","handel","handle","harold","taylor","lander","synder","holdes","pastor","spredt","stolen","haster","posten","handler","anholdt","senator","pladser","pladsen","landets","anholde","soldater",]],
["opkaldsgebyr", ["er","og","de","os","so","se","op","da","ad","ok","ko","al","sa","by","bo","ro","ar","el","le","ry","sy","der","red","lad","ser","dag","gad","god","dog","par","ked","pas","del","led","ord","rod","bag","bad","ske","eks","bor","bro","sag","gas","lys","bog","dyr","ryd","syg","lod","bed","sad","sko","ray","kys","sky","bar","gal","lag","kop","los","sol","syd","lyd","sal","las","abe","ryg","leg","ryk","glo","dyb","reb","pak","per","bak","ged","skal","bare","aber","okay","klar","sker","gode","lade","dale","dage","gade","glad","slap","blod","bold","slog","skyd","bord","spor","krop","kald","klog","glas","slag","salg","kors","klap","kode","drop","pres","ryge","syge","lyde","kold","rask","skar","rose","kage","park","lady","byde","ogsa","drak","grad","sorg","kaos","gale","skab","brad","drab","spar","byer","base","ydre","dyre","gary","pose","boks","greb","lake","kryb","dags","lyse","blad","spyd","sagde","dages","skyld","klare","lyder","lader","alder","plads","skyde","skade","skole","kalde","lagde","glade","skabe","bryde","byder","sager","sprog","drage","gader","derop","kolde","spore","spark","blade","kloge","spare","skred","spred","skreg","kager","dyrke","laser","plage","lager","kalder","skyder","krydse","opkald","skaber","kaldes","skader","opdage","sparke","klager","skylder","opdager","pladser",]],
["chefdiplomat", ["at","de","af","et","et","te","om","op","da","ad","to","ti","ha","ah","al","oh","el","le","det","det","ted","til","ilt","med","dem","ham","lad","alt","tal","mit","tim","dit","tid","mod","dom","fem","del","led","fat","mad","the","tom","let","lod","ide","ild","hel","fod","hop","fed","hed","cia","hat","top","pot","had","hit","tip","hot","mil","mel","hal","pil","lam","hil","fil","lidt","hold","helt","tale","lide","lade","dale","imod","haft","flot","time","fedt","held","chef","film","fald","flad","dame","made","midt","ofte","date","ledt","delt","team","lift","phil","olie","hade","hoid","mode","heit","flod","mail","dato","male","hale","plet","altid","holde","holdt","faldt","falde","hotel","milde","ladet","model","pilot","metal","chloe","modet","meldt","mitch","holdet","faldet",]],
["produktlinje", ["er","du","ud","en","de","et","et","te","nu","op","to","jo","ok","ko","ti","ej","ni","ro","ur","el","le","det","det","ted","til","ilt","den","ned","end","der","red","nej","din","ind","nok","jer","dit","tid","kun","tre","ret","tro","ude","ked","del","led","ord","rod","tur","luk","let","lod","ide","joe","ild","ren","jul","pik","kop","ond","nul","jep","top","pot","tip","per","kur","out","put","pil","lur","lidt","dine","inde","uden","lide","lort","kone","ondt","kort","rent","krop","onde","tjek","klud","jord","rend","drik","nord","kode","drop","ledt","delt","kold","drej","kilo","kopi","pund","duer","joke","ride","uret","rute","olie","lejr","trin","prue","juni","port","utro","juli","jern","plet","klip","under","runde","tiden","orden","ordne","rundt","onkel","netop","kendt","drink","koldt","luder","tider","kjole","ordet","rodet","point","turen","derop","indre","teori","kilde","julie","koden","kolde","punkt","linje","ilden","pilot","kunde","kujon","krone","koner","julen","korte","lorte","troen","turde","jorden","ordnet","porten","dertil","klient","kilden","junior","kunder","drukne","ukendt","pointe","kilder","iorden","united","kopier","kjolen","projekt","lektion",]],
["kunstbiograf", ["at","og","af","nu","os","so","to","ok","ko","ti","sa","bo","ni","ro","an","is","ar","ur","bi","for","kan","fra","far","sig","tak","kat","nok","kun","tag","agt", "tun", "fik","tog","gik","kig","sin","tro","bag","fat","sit","sti","fri","sgu","gus","bor","bro","nat","tur","sag","gas","bog","fru","sat","ung","nar","sur","sko","fin","usa","san","bar","big","rig","fis","tab","fan","bus","ost","art","ian","kur","bak","bur","out","ting","brug","fint","skat","stak","kast","stor","sort","sagt","barn","fast","ring","grin","kort","gift","krig","skai","skib","fart","traf","fars","sang","snak","fisk","bank","stik","kors","bort","kurs","skru","king","fair","skaf","frit","rask","skar","trak","fang","ogsa","stan","kina","bang","sorg","tank","kaos","skub","skab","stig","sigt","grib","trin","kung","niks","stof","gris","nabo","fort","utro","tung","boks","surt","tina","irak","bagi","fans","knus","rita","snart","forbi","foran","frank","brugt","kraft","frisk","skabt","brian","bragt","bring","kunst","knust","straf","skift","natur","butik","grant","narko","bingo","skrig","skrub","frugt","ansigt","gratis","fransk","austin","angrib","norbit","afsnit",]],
["fremtidsplan", ["er","at","en","de","af","et","et","te","se","da","ad","ti","al","sa","ni","an","is","ar","el","le","det","det","ted","til","ilt","med","dem","den","ned","end","der","red","men","nem","min","din","ind","fra","far","lad","man","alt","tal","mit","tim","dit","tid","ser","set","tre","ret","sin","par","fem","pas","del","led","pis","fat","sit","sti","fri","mad","nat","let","sat","ide","nar","ild","sad","ren","fin","ens","sne","san","and","dan","fed","arm","ram","fis","sal","las","fan","art","ian","tip","per","mil","mel","pan","pil","lam","fil","mand","lidt","mine","sted","dets","dine","inde","tale","fint","lide","lade","dale","fire","frie","side","frem","sent","sten","mens","slap","fast","mest","slet","time","sine","isen","land","fred","fedt","slip","spil","find","plan","film","aner","fald","flad","fest","dame","made","send","stil","fare","smid","rent","fart","traf","fars","pris","midt","ramt","nemt","ment","rend","date","smil","smed","dans","sand","sind","slem","pres","fine","ledt","delt","arme","fair","frit","team","amen","lift","stan","ride","saml","salt","last","trin","spar","samt","mars","tina","fase","mail","larm","fans","tand","male","plet","rita","sild","siden","sinde","indse","altid","finde","andre","aften","andet","taler","fandt","snart","tiden","sandt","stand","timer","lader","alder","plads","damer","sendt","fader","faldt","slemt","aftes","paris","miste","times","danse","sande","falde","smart","ramte","smide","liste","tider","mands","maden","damen","lande","andel","laden","firma","samle","minde","prins","smidt","sider","miles","smile","imens","indre","straf","milde","ladet","spild","ilden","april","timen","armen","faret","marie","metal","spare","tales","penis","pirat","parti","spred","faren","meldt","laser","latin","filer","flint","finder","afsted","mindre","minder","findes","landet","falder","mister","mindst","planer","fremad","filmen","planet","tiders","samlet","smider","danser","andres","faldet","listen","prisen","farten","samler","dertil","spilde","midten","midnat","smadre","fandme","lander","merlin","island","smiler","midler","smarte","simpel","spildt","palmer","indser","spredt","stefan","afsnit","tilpas","mindste","fremtid","firmaet","spilder","simpelt","smadret","pladser","pladsen","landets","fandtes","tilfreds",]],
["rockfestival", ["er","at","vi","af","et","et","te","os","so","se","to","ok","ko","ti","al","sa","ro","is","av","ar","el","le","til","ilt","for","vil","liv","var","arv","fra","far","tak","kat","alt","tal","ser","fik","set","tre","ret","vel","lev","tro","fat","sit","sti","fri","ske","eks","lov","vis","let","sat","sko","sov","lav","vor","cia","los","sol","fis","sal","las","via","ost","art","eva","vei","fil","skal","over","vore","ovre","selv","folk","flok","klar","tale","sker","skat","stak","kast","stor","sort","lort","vist","lave","fire","frie","sket","vise","seiv","fast","flot","slet","live","kort","svar","sove","fest","skai","stil","fare","fart","traf","fars","stol","slot","slot","fisk","love","stik","ofte","kors","ofre","vest","vare","carl","kilo","fair","rock","skaf","vort","frit","livs","rask","skar","rose","trak","lift","krav","slik","olie","race","kaos","salt","last","tolv","stof","avis","lavt","fort","lake","rive","irak","fase","flov","vask","rita","kvit","svor","vores","sover","laver","taler","store","sorte","klare","livet","lavet","viser","klart","lover","skole","stole","sikre","krise","skrev","aftes","kraft","viste","svare","virke","frisk","liste","skriv","taske","kaste","skilt","cirka","falsk","sovet","farve","folks","lovet","straf","teori","skift","vaske","trick","vokse","alvor","koste","faret","slave","score","tales","korte","fiske","ofret","lorte","laser","aktiv","kiste","filer","farvel","skrive","stoler","ekstra","kaster","klaret","klatre","svaret","koster","sektor","claire","skifte","folket","victor","flaske","falske","vokser","sikret","slaver","varsel","friske","vokset","livets","afvist","vasker","aviser","travis","aktier","tricks","overalt","skifter","forskel","oversat","artikel","favorit","forestil",]],
["cykelforbund", ["er","du","ud","en","de","nu","ok","ko","ny","by","bo","ro","ur","el","le","ry","den","ned","end","for","der","red","nok","kun","fyr","ude","ked","nye","del","led","ord","rod","ben","bor","bro","luk","fly","fru","dyr","ryd","lod","bed","ren","fod","fed","ond","nul","bud","lyd","nyd","ryk","dyb","reb","kur","bur","lur","folk","flok","uden","kone","byen","blod","bold","fuld","fred","fyre","fuck","bord","frue","onde","rend","nord","ofre","lucy","kode","nyde","lyde","kold","rock","byde","duer","brud","klub","byer","ydre","dyre","bund","flod","kryb","fyld","under","runde","burde","orden","ordne","lyder","onkel","fyren","broen","bryde","byder","luder","fulde","nyder","bruce","koden","kolde","lyden","kunde","krone","koner","rocky","fylde","cykel","bunke","dyrke","foden","floden","bolden","fordel","kunder","drukne","fylder","flyder","bruden","udenfor",]],
["zebramusling", ["er","en","nu","se","al","sa","ni","an","is","ar","ur","el","le","bi","mig","men","nem","min","sig","man","ser","sin","bil","bag","ben","sgu","gus","uge","sag","gas","lig","ung","nar","rum","mur","sur","ren","ens","sne","usa","san","bar","gal","lag","arm","ram","nul","rig","sal","las","abe","leg","gem","bus","reb","ian","mil","mus","sue","gul","bur","mel","liz","lam","lur","bare","aber","lige","igen","enig","geni","mine","sige","brug","lang","barn","mens","ring","grin","glem","sine","isen","unge","ugen","seng","uger","aner","sang","glas","slag","salg","rige","smil","magi","slem","smag","arme","bane","amen","grim","regn","bang","gale","saml","grib","base","gris","gule","mars","greb","sure","bagi","mail","larm","male","siger","mange","megan","bruge","bange","gamle","bilen","ringe","grine","sagen","sange","smule","biler","sager","brian","lange","angel","samle","unger","bring","miles","smile","baren","imens","ligne","smage","muren","numre","basen","armen","langs","marie","mulig","gribe","minus","menig","laser","lager","ligner","nemlig","angreb","bringe","signal","smager","bruges","samler","merlin","slange","mulige","smiler","angrib","single","mangel","genial","mangler","angribe","samling",]],
["opiumshandel", ["du","ud","en","de","om","nu","os","so","se","op","da","ad","ha","ah","al","sa","oh","ni","an","is","el","le","med","dem","den","ned","end","han","men","nem","som","min","ham","hun","din","ind","lad","man","mod","dom","hen","sin","ude","hos","pas","del","led","pis","hus","mad","dum","lod","ide","ild","sad","hel","mon","hul","ens","sne","usa","hop","san","and","dan","hed","los","sol","ond","nul","sal","las","hud","had","ian","mil","mus","sue","mel","pan","hal","pil","lam","hil","hans","nash","mand","hold","mine","dine","inde","uden","lide","lade","dale","side","imod","mens","slap","sine","isen","land","held","slip","spil","plan","hund","dame","made","send","mund","smid","paul","onde","smil","smed","dans","sand","sind","slem","plus","puls","amen","hils","phil","pund","olie","hals","saml","hade","hoid","huse","mode","hule","pose","mail","sund","male","hale","sild","siden","sinde","indse","holde","plads","smule","danse","sande","solen","uheld","smide","pause","mands","hunde","huden","maden","damen","lande","andel","laden","samle","minde","miles","smile","ensom","imens","milde","spion","hilse","spild","ilden","model","penis","minus","house","posen","dusin","himlen","halsen","handel","handle","spilde","udenom","island","sophie","simpel","hilsen","holdes","pladsen","himlens","anholde",]],
["glutaminsyre", ["er","at","en","et","et","te","nu","se","ny","ti","al","sa","ni","an","is","ar","ur","el","le","ry","sy","til","ilt","mig","men","nem","min", "tun", "sig","man","alt","tal","mit","tim","ser","tag","agt","set","tre","ret","sin","nye","sit","sti","sgu","gus","nat","nyt","uge","tur","sag","gas","let","lys","syg","lig","sat","ung","nar","rum","mur","sur","ren","ray","ens","sne","usa","san","gal","lag","lyt","arm","ram","nul","rig","sal","las","ryg","leg","syn","gem","art","ian","mil","mus","sue","gul","mel","lam","lur","lige","igen","enig","geni","mine","tage","sige","ting","tale","galt","lagt","sagt","lang","sent","sten","mens","mest","ring","grin","slet","glem","time","sine","isen","slut","unge","ugen","seng","lyst","uger","aner","stil","rent","magt","sang","ramt","nemt","ment","tegn","styr","glas","slag","salg","rige","smil","magi","smut","gemt","slem","smag","ryge","syge","arme","team","amen","grim","stan","uret","rute","regn","gale","stig","sigt","saml","salt","last","trin","samt","gris","gary","gule","mars","tung","sygt","surt","tina","lugt","steg","sure","mail","larm","syng","syne","male","lyse","rita","siger","tager","agter","mange","megan","taler","snart","gamle","langt","timer","ringe","grine","sagen","sange","agent","smule","glemt","slemt","lyset","miste","times","smart","minut","styre","ryste","ramte","sager","synge","liste","liget","lange","angel","lugte","samle","unger","turen","tunge","miles","smile","imens","ligne","smage","muren","numre","timen","natur","nylig","armen","langs","sigte","stige","grant","yngre","tiger","marie","metal","mulig","rygte","grimt","tales","minus","menig","stuen","laser","lager","latin","synet","glimt","ligner","muligt","ansigt","alting","uanset","nemlig","sulten","sultne","mister","ringet","gratis","lugter","samlet","signal","smager","listen","samler","synger","magten","stiger","merlin","slange","mulige","smiler","slaget","austin","smarte","single","lugten","mangel","genial","mangler","samling","genialt","usynlig","signalet","ansigter","gymnasiet",]],
["flyproducent", ["er","du","ud","en","de","et","et","te","nu","op","to","ny","ro","ur","el","le","ry","det","det","ted","den","ned","end","for","der","red","tre","ret","tro","fyr","ude","nye","del","led","ord","rod","nyt","tur","fly","let","fru","dyr","ryd","lod","ren","fod","fed","lyt","ond","nul","lyd","nyd","top","pot","pyt","per","out","put","lur","uden","lort","ondt","flot","fuld","fred","fedt","fyre","frue","rent","flyt","onde","tony","luft","rend","ofte","nord","ofre","type","lucy","drop","nyde","lyde","ledt","delt","pund","duer","uret","rute","dyrt","prue","ydre","dyre","port","fort","utro","tynd","cent","flod","plet","fyld","under","runde","orden","ordne","rundt","lyder","fyren","netop","flyet","fyldt","fyret","luder","ordet","rodet","fulde","nyder","fuldt","turen","derop","lyden","fylde","tyder","ofret","lorte","troen","foden","turde","fundet","luften","floden","ordnet","porten","fordel","fylder","flyder","dufter","udenfor","procent",]],
["kvartsholdig", ["at","og","vi","os","so","da","ad","to","ok","ko","ti","ha","ah","al","sa","oh","ro","is","av","ar","har","til","ilt","dig","gid","vil","liv","var","arv","lad","sig","tak","kat","alt","tal","dit","tid","dag","gad","god","dog","tag","agt","giv","tog","gik","kig","tro","hos","gav","ord","rod","sit","sti","hva","hav","lov","vis","sag","gas","lod","lig","sat","ild","sad","sko","sov","lav","vor","hov","gal","lag","los","sol","rig","hat","sal","las","via","glo","ost","dav","art","had","hit","hot","hal","hor","hil","hvad","skal","hvor","hvis","godt","lidt","hold","klar","skat","stak","kast","stor","sort","lort","vist","galt","lagt","sagt","glad","kort","slog","valg","krig","svar","stod","vild","skai","stil","halv","skid","stol","slot","slot","kald","hvid","vagt","klog","glas","slag","salg","stik","drik","kors","idag","davs","vidt","kold","kilo","vort","livs","rask","skar","trak","vold","grav","hils","svag","krav","ogsa","drak","slik","hals","grad","sorg","kaos","stig","sigt","salt","last","tolv","hoid","avis","lavt","gris","irak","hvil","dato","vask","dags","rita","sild","kvit","svor","altid","rolig","holdt","klart","vildt","skrid","skidt","right","halvt","koldt","trods","valgt","skriv","vidst","skilt","radio","kaldt","solgt","klogt","alvor","hvidt","skrig","dragt","vodka","davis","aktiv","aldrig","stadig","roligt","gravid","soldat","gratis","skridt","harold","travis","tirsdag","torsdag",]],
["musikbranche", ["er","en","nu","se","ha","ah","sa","ni","an","is","ar","ur","bi","har","han","kan","her","men","nem","min","ham","hun","man","kun","ser","hen","sin","hus","ben","ske","eks","nar","rum","mur","sur","ren","ens","sne","usa","san","bar","arm","ram","cia","abe","bus","reb","ian","kur","mus","sue","bak","bur","bare","aber","hans","nash","mine","sker","barn","mens","sine","isen","smuk","husk","aner","skai","skib","snak","skam","bank","kurs","skru","arme","rask","skar","bane","amen","heks","hank","kina","race","skub","skab","huse","niks","base","mars","sure","irak","kram","cuba","knus","kane","bush","huske","sikre","krise","musik","skabe","maske","brian","cirka","bruce","baren","imens","skibe","banke","muren","numre","basen","armen","knuse","knibe","karen","marie","skrub","bunke","minus","skrue","husker","skaber","bukser","marcus","banker","kusine","knuser","kursen","cirkus","marken","maskine","branche","maskiner",]],
["problematisk", ["er","at","et","et","te","om","os","so","se","op","to","ok","ko","ti","al","sa","bo","ro","is","ar","el","le","bi","til","ilt","som","kom","tak","kat","alt","tal","mit","tim","ser","mor","rom","set","tre","ret","tro","par","pas","bil","pis","sit","sti","ske","eks","bor","bro","tom","let","sat","sko","bar","arm","ram","pik","kop","los","sol","sal","las","abe","tab","top","pot","ost","art","reb","tip","pak","per","mil","bak","mel","pil","lam","skal","bare","aber","klar","tale","sker","skat","stak","kast","stop","post","stor","sort","lort","sket","slap","mest","slet","kort","time","slip","spil","kamp","blot","bolt","spor","skai","stil","skib","krop","pris","skam","stol","slot","slot","ramt","stik","kors","smil","bort","klap","tabe","slem","pres","arme","kilo","rask","skar","rose","trak","park","team","kopi","slik","blik","olie","amok","koma","kaos","more","boet","skab","saml","salt","last","spar","base","port","samt","pose","mars","boks","lake","irak","kram","mail","larm","male","plet","rita","klip","taler","store","sorte","klare","timer","klart","skole","stole","sikre","krise","slemt","taber","paris","miste","times","smart","ramte","skabe","maske","biler","skabt","liste","taske","kaste","skilt","samle","miles","smile","borte","mobil","skibe","teori","besat","spore","pilot","april","storm","spark","kampe","koste","sport","marie","metal","spare","tales","korte","pirat","parti","lorte","laser","kiste","pistol","oberst","mister","skibet","stoler","ekstra","kaster","klaret","klatre","koster","sektor","samlet","skaber","samler","sporet","skabte","skabet","sikret","smiler","sparke","smarte","simpel","palmer","blomst","pastor","aktier","tilpas","kopier","problem","mirakel","simpelt","artikel","komplet","kapitel","blomster","pistoler",]],
["dyrehospital", ["er","at","de","et","et","te","os","so","se","op","da","ad","to","ti","ha","ah","al","sa","oh","ro","is","ar","el","le","ry","sy","det","det","ted","har","til","ilt","der","red","her","lad","alt","tal","dit","tid","ser","set","tre","ret","tro","par","hos","pas","del","led","pis","ord","rod","sit","sti","the","let","lys","dyr","ryd","lod","sat","ide","ild","sad","hel","ray","hop","hed","lyt","los","sol","syd","lyd","hat","sal","las","top","pot","ost","art","had","hit","tip","pyt","per","hot","hal","pil","hor","hil","lidt","hold","helt","sted","dets","tale","lide","stop","post","stor","sort","lort","lade","dale","side","slap","slet","held","slip","spil","lyst","stod","yeah","spor","stil","pris","stol","slot","slot","hest","styr","date","type","drop","pres","lyde","ledt","delt","rose","hils","lady","phil","ride","olie","hals","salt","last","hade","hoid","spar","dyrt","ydre","dyre","port","pose","heit","spyt","dato","hale","lyse","plet","rita","sild","spyd","hyre","hore","altid","holde","taler","store","sorte","lyder","lader","alder","hader","plads","helst","holdt","stole","lyset","paris","hotel","styre","ryste","liste","trods","tider","ordet","rodet","radio","sider","herop","derop","teori","ladet","spore","hilse","spild","pilot","april","sport","desto","spare","tales","tyder","pirat","parti","spred","lorte","laser","hyret","holder","pistol","hertil","stoler","soldat","holdet","tiders","yderst","sporet","dertil","spilde","harold","taylor","sophie","spildt","holdes","pastor","spredt","haster","tilpas","spilder","pladser","stilhed","soldater","hospital","pistoler",]],
["svarmulighed", ["er","du","ud","vi","de","se","da","ad","ha","ah","al","sa","is","av","ar","ur","el","le","har","mig","med","dem","der","red","dig","gid","vil","liv","var","arv","her","ved","ham","lad","sig","ser","dag","gad","gud","giv","vel","lev","ude","gav","del","led","hus","hva","hav","mad","sgu","gus","uge","vis","sag","gas","dum","lig","ide","ild","rum","mur","sur","sad","hel","lav","hul","usa","gal","lag","hed","arm","ram","rig","sal","las","leg","hud","gem","via","dav","had","eva","mil","mus","sue","gul","vei","ulv","mel","ged","hal","lam","lur","hil","hvad","hvis","have","lige","hvem","selv","sige","lide","vide","give","evig","hver","lave","lade","dale","dage","gade","side","glad","vise","seiv","glem","live","held","valg","svar","uger","vild","dame","made","guds","halv","smid","gave","vred","hvid","glas","slag","salg","varm","rige","guld","smil","smed","magi","idag","davs","slem","smag","arme","vare","livs","grav","hils","grim","svag","mave","duer","ride","hals","grad","gale","saml","hade","huse","avis","gris","hule","gule","mars","rive","sure","hvil","mail","larm","male","hale","dags","sild","havde","sagde","dages","siger","laver","giver","gamle","lader","alder","hader","viser","damer","hvide","gider","smule","lagde","glade","uheld","svare","luder","sager","varme","smide","vilde","hvile","vegas","svage","samle","drage","gader","sider","miles","smile","guder","milde","smage","gaver","grave","hilse","herud","drive","halve","virus","marie","slave","mulig","davis","guide","laser","ledig","lager","aldrig","heldig","gravid","smider","smager","samler","smadre","slaver","varsel","mulige","smiler","hviler","midler","gidsel","aviser","svaghed","mulighed",]],
["uformindsket", ["er","du","ud","en","de","et","et","te","om","nu","os","so","se","to","ok","ko","ti","ni","ro","is","ur","det","det","ted","med","dem","den","ned","end","for","der","red","men","nem","som","min","kom","din","ind","nok","mit","tim","dit","tid","kun","ser","mor","rom","fik","mod","dom","set","tre","ret","sin","tro","ude","ked","fem","ord","rod","sit","sti","fri","ske","eks","tur","tom","dum","fru","ide","rum","mur","sur","ren","sko","mon","fin","ens","sne","fod","fed","ond","fis","ost","kur","mus","sue","out","mine","sted","dets","dine","inde","uden","fint","sker","stor","sort","kone","fire","frie","side","imod","frem","sket","sent","sten","ondt","mens","mest","kort","time","sine","isen","fred","smuk","fedt","find","stod","fest","frue","send","mund","mord","smid","rent","skid","midt","onde","skud","form","nemt","ment","fisk","dumt","rend","stik","ofte","drik","kors","nord","smed","ofre","smut","kurs","skru","kode","sind","fine","frit","rose","duer","ride","uret","rute","more","trin","niks","stof","mode","fort","utro","surt","sure","sund","knus","fordi","siden","sinde","indse","finde","under","runde","store","sorte","tiden","orden","ordne","rundt","timer","skide","skudt","sendt","smukt","kendt","drink","sikre","krise","musik","miste","times","skrid","skidt","minut","frisk","smide","trods","tider","ordet","rodet","minde","smidt","sider","turen","kunst","knust","moder","ensom","imens","indre","teori","koden","muren","numre","skift","timen","storm","knuse","koste","kunde","krone","koner","desto","korte","skred","minus","modet","fiske","skrue","ofret","enorm","stuen","troen","dusin","foden","stone","kiste","turde","finder","fundet","mindre","minder","findes","mister","tusind","mindst","skridt","koster","sektor","tiders","smider","skifte","sekund","ordnet","fortid","mordet","midten","udenom","kunder","drukne","formue","ukendt","sikret","drinks","friske","skride","kusine","indser","knuser","kursen","iorden","enormt","dufter","knuste","united","udenfor","mindste","fremtid","skifter","stinker","kristen","monster","stormen","tusinde","uniform","omsider","diskret","fortiden","forsiden","tusinder","forsinket",]],
["nioghalvfems", ["en","og","vi","af","om","os","so","se","ha","ah","al","sa","oh","ni","an","is","av","el","le","mig","han","vil","liv","men","nem","som","min","ham","sig","man","giv","vel","lev","hen","ven","sin","hos","gav","fem","hva","hav","lov","vis","sag","gas","lig","hel","sov","mon","fin","lav","ens","sne","hov","san","gal","lag","los","sol","vin","fis","sal","las","leg","gem","via","fan","glo","eva","ian","mil","vei","mel","hal","lam","hil","fil","hvis","have","lige","hvem","hans","nash","selv","igen","enig","geni","mine","sige","give","evig","lave","lang","vise","seiv","mens","glem","live","sine","isen","slog","valg","seng","svin","film","sove","halv","gave","sang","love","glas","slag","salg","smil","magi","slem","smag","fine","vogn","livs","amen","hils","svag","mave","fang","ogsa","olie","hals","oven","gale","saml","avis","golf","flag","fase","hvil","mail","flov","hang","fans","hong","long","male","hale","vane","mange","megan","nogle","gamle","sagen","sange","fange","solen","loven","hvile","lange","angel","vegas","svage","samle","savne","miles","smile","ensom","maven","imens","ligne","smage","hilse","langs","halve","sving","slave","nogie","haven","menig","venlig","nemlig","selvom","himlen","filmen","halsen","signal","avisen","slange","sofaen","hilsen","single","mangel","genial","ligesom","samling","himlens","langsom",]],
["privatskolen", ["er","at","en","vi","et","et","te","os","so","se","op","to","ok","ko","ti","al","sa","ni","ro","an","is","av","ar","el","le","til","ilt","kan","vil","liv","var","arv","tak","kat","nok","alt","tal","ser","set","tre","ret","vel","lev","ven","sin","tro","par","pas","pis","sit","sti","ske","eks","nat","lov","vis","let","sat","nar","ren","sko","sov","lav","vor","ens","sne","san","pik","kop","los","sol","vin","sal","las","top","pot","via","ost","art","eva","ian","tip","pak","per","vei","pan","pil","skal","over","vore","ovre","selv","vent","klar","tale","sker","skat","stak","kast","stop","post","stor","sort","lort","vist","lave","kone","sket","sent","sten","vise","seiv","slap","slet","live","kort","sine","isen","slip","spil","svin","svar","plan","aner","sove","spor","skai","stil","rent","krop","pris","snak","stol","slot","slot","love","knap","stik","kors","klap","kniv","pres","vest","vare","kilo","vort","livs","rask","skar","rose","trak","park","kopi","krav","stan","slik","vant","olie","kina","oven","tank","kaos","salt","last","tolv","trin","spar","niks","avis","lavt","port","pose","tina","lake","rive","irak","vask","kane","plet","rita","klip","kvit","vane","svor","vores","sover","laver","taler","store","sorte","snart","klare","livet","lavet","viser","klart","lover","onkel","skole","stole","netop","sikre","krise","skrev","paris","viste","solen","svare","virke","loven","liste","skriv","taske","kaste","skilt","kevin","point","tanke","savne","prins","panik","sovet","lovet","teori","spion","spore","vaske","pilot","april","spark","vokse","alvor","koste","karen","sport","narko","krone","koner","slave","spare","tales","korte","penis","pirat","parti","klovn","posen","lorte","laser","aktiv","troen","stone","kiste","latin","pistol","skrive","person","skolen","savner","stoler","ekstra","kaster","tanker","klaret","klatre","planer","svaret","koster","sektor","savnet","skoven","voksen","voksne","planet","listen","privat","prisen","porten","sporet","avisen","klient","vokser","tasken","sikret","svinet","slaver","varsel","parken","pointe","sparke","vokset","livets","pastor","vasker","aviser","travis","aktier","stolen","vinkel","vinter","tilpas","posten","kopier","overalt","senator","stinker","kristen","oversat","private","artikel","kapitel","version","lektion","pistolen","pistoler","reaktion",]],
["patruljevogn", ["er","at","en","og","et","et","te","nu","ja","op","to","jo","al","ej","ro","an","av","ar","ur","el","le","jeg","var","arv","nej","alt","tal","jer","tag","agt","vej","tre", "tun", "ret","tog","vel","lev","ven","tro","par","gav","nat","uge","tur","lov","let","tja","ung","nar","joe","ren","lav","vor","jul","gal","lag","nul","jep","leg","top","pot","glo","art","eva","per","jag","gul","ulv","pan","out","put","lur","over","vore","ovre","tage","vent","tale","lort","lave","galt","lagt","lang","unge","ugen","valg","plan","uger","aner","rent","gave","paul","tegn","love","vagt","jane","vogn","vare","vort","grav","jagt","vant","uret","rute","regn","jage","oven","lejr","gale","tolv","vejr","prue","pjat","lavt","port","utro","gule","tung","lugt","pung","jern","long","plet","vane","noget","tager","agter","laver","nogle","gjort","taler","langt","lavet","agent","lover","javel","netop","loven","valgt","lange","angel","lugte","unger","turen","tunge","lovet","gaver","grave","natur","tvang","alvor","grant","jager","julen","lorte","troen","plage","lager","opgave","gulvet","planer","valgte","valget","lugter","planet","porten","vagter","europa","vagten","graven","jagter","lugten","orange","overalt","opgaven","opgaver","optager",]],
["blomsterpind", ["er","en","de","et","et","te","om","os","so","se","op","to","ti","bo","ni","ro","is","el","le","bi","det","det","ted","til","ilt","med","dem","den","ned","end","der","red","men","nem","som","min","din","ind","mit","tim","dit","tid","ser","mor","rom","mod","dom","set","tre","ret","sin","tro","bil","del","led","pis","ord","rod","ben","sit","sti","bor","bro","tom","let","lod","ide","ild","bed","ren","mon","ens","sne","los","sol","ond","bid","top","pot","ost","reb","tip","per","mil","mel","pil","lidt","mine","sted","dets","dine","inde","lide","stop","post","stor","sort","lort","side","imod","sent","sten","ondt","mens","mest","slet","blod","bold","time","sine","isen","slip","spil","blot","bolt","stod","bord","spor","send","stil","mord","smid","rent","pris","midt","onde","stol","slot","slot","nemt","ment","rend","bedt","smil","nord","smed","bort","sind","drop","slem","pres","ledt","delt","rose","ride","olie","more","boet","trin","bind","port","mode","pose","bidt","bide","plet","sild","siden","sinde","indse","store","sorte","tiden","orden","ordne","bilen","timer","sendt","stole","netop","bedst","slemt","miste","times","solen","broen","biler","smide","liste","trods","tider","ordet","rodet","point","minde","blind","prins","smidt","sider","derop","miles","smile","borte","moder","ensom","imens","indre","mobil","teori","milde","spion","spore","spild","ilden","model","pilot","timen","storm","sport","desto","binde","penis","spred","modet","enorm","posen","lorte","meldt","troen","stone","mindre","minder","pistol","person","oberst","mister","stoler","mindst","bordet","tiders","bolden","smider","listen","prisen","ordnet","porten","blodet","sporet","dertil","mordet","spilde","midten","merlin","blinde","pointe","smiler","midler","simpel","spildt","blomst","indser","iorden","enormt","spredt","norbit","stolen","posten","problem","mindste","monster","stormen","spilder","simpelt","omsider","pistolen","blomster","pistoler"]],
["computersalg", ["er","at","og","et","et","te","om","os","so","se","op","to","al","sa","ro","ar","ur","el","le","som","alt","tal","ser","mor","rom","tag","agt","set","tre","ret","tog","tro","par","pas","sgu","gus","uge","tur","tom","sag","gas","let","sat","rum","mur","sur","usa","gal","lag","arm","ram","los","sol","sal","las","leg","top","pot","gem","glo","ost","art","per","mus","sue","gul","mel","out","put","lam","lur","tage","tale","stop","post","stor","sort","lort","galt","lagt","sagt","slap","mest","slet","glem","slut","slog","uger","spor","paul","magt","stol","slot","slot","ramt","glas","slag","salg","smut","gemt","slem","smag","pres","arme","carl","plus","puls","rose","team","ogsa","uret","rute","race","sorg","gale","more","saml","salt","last","spar","prue","port","samt","utro","pose","gule","mars","surt","lugt","steg","sure","larm","male","plet","tager","agter","taler","store","sorte","gamle","smule","glemt","stole","slemt","smart","ramte","sager","pause","super","sprog","lugte","samle","solgt","smage","spore","storm","sport","score","metal","spare","tales","sprut","lorte","lucas","laser","plage","lager","stoler","morges","lugter","samlet","smager","samler","spurgt","sporet","marcus","solgte","europa","slaget","smarte","palmer","pastor","spurgte","optager","computer",]],
["fysikopgaver", ["er","og","vi","af","os","so","se","op","ok","ko","sa","ro","is","av","ar","ry","sy","for","var","arv","fra","far","sig","ser","fik","giv","gik","kig","fyr","par","gav","pas","pis","fri","ske","eks","vis","sag","gas","syv","syg","sko","sov","ray","kys","sky","vor","pik","kop","rig","fis","ryg","via","ryk","eva","pak","per","vei","okay","over","vore","ovre","sige","sker","give","evig","pige","fire","frie","vise","seiv","fyre","krig","svar","sove","spor","skai","fare","gave","fars","krop","pris","fisk","rige","kors","ofre","pres","ryge","syge","vare","fair","skaf","rask","skar","rose","kage","park","grav","kopi","svag","krav","ogsa","sorg","kaos","spar","avis","gris","gary","pose","rive","irak","fase","vask","svor","vores","sover","siger","giver","piger","viser","sikre","krise","skrev","paris","svare","virke","frisk","sager","skriv","sprog","vegas","svage","farve","spore","gaver","grave","vaske","paige","spark","vokse","spare","skrig","fiske","skreg","kager","skrive","opgave","vokser","sparke","opgive","friske","skrige","vasker","aviser","kopier","opgaver",]],
["lighedspunkt", ["du","ud","en","de","et","et","te","nu","se","ti","ni","is","el","le","det","det","ted","til","ilt","den","ned","end","dig","gid","hun","din","ind","sig","dit","tid","kun","gud","set","hen","gik","kig","sin","ude","ked","del","led","pis","hus","sit","sti","ske","eks", "tun","sgu","gus","the","uge","luk","let","lig","ung","ide","ild","hel","hul","ens","sne","hed","pik","nul","leg","hud","hit","tip","sue","gul","ged","put","pil","hil","hut","lige","lidt","igen","enig","geni","sige","helt","sted","dets","dine","inde","ting","uden","lide","pige","side","sket","sent","sten","slet","sine","isen","slut","held","unge","ugen","slip","spil","seng","husk","hund","hent","send","stil","guds","skid","skud","tegn","hest","sluk","lusk","guld","stik","glip","sind","king","ledt","delt","plus","puls","hils","heks","phil","pund","slik","stig","sigt","kung","huse","niks","hule","gule","tung","lugt","steg","heit","pung","sund","knus","plet","klip","sild","siden","sinde","indse","tiden","huske","helst","skide","huset","skudt","sendt","pigen","kendt","skidt","uheld","liste","hunde","huden","liget","skilt","lugte","kugle","tunge","pligt","kunst","knust","ligne","kilde","hilse","punkt","spild","ilden","sigte","stige","knuse","kunde","udkig","penis","guide","stuen","dusin","ledig","kiste","sulten","sultne","heldig","tusind","listen","sekund","klient","spilde","kilden","ukendt","kuglen","deling","udsigt","guldet","spildt","kusine","hilsen","single","gidsel","lugten","knuste","united","tusinde","heldigt","stilhed",]],
["cykelforbund", ["er","du","ud","en","de","nu","ok","ko","ny","by","bo","ro","ur","el","le","ry","den","ned","end","for","der","red","nok","kun","fyr","ude","ked","nye","del","led","ord","rod","ben","bor","bro","luk","fly","fru","dyr","ryd","lod","bed","ren","fod","fed","ond","nul","bud","lyd","nyd","ryk","dyb","reb","kur","bur","lur","folk","flok","uden","kone","byen","blod","bold","fuld","fred","fyre","fuck","bord","frue","onde","rend","nord","ofre","lucy","kode","nyde","lyde","kold","rock","byde","duer","brud","klub","byer","ydre","dyre","bund","flod","kryb","fyld","under","runde","burde","orden","ordne","lyder","onkel","fyren","broen","bryde","byder","luder","fulde","nyder","bruce","koden","kolde","lyden","kunde","krone","koner","rocky","fylde","cykel","bunke","dyrke","foden","floden","bolden","fordel","kunder","drukne","fylder","flyder","bruden","udenfor",]],
["bilproducent", ["er","du","ud","en","de","et","et","te","nu","op","to","ti","bo","ni","ro","ur","el","le","bi","det","det","ted","til","ilt","den","ned","end","der","red","din","ind","dit","tid","tre","ret","tro","ude","bil","del","led","ord","rod","ben","bor","bro","tur","let","lod","ide","ild","bed","ren","ond","nul","bud","bid","top","pot","reb","tip","per","bur","out","put","pil","lur","lidt","dine","inde","uden","lide","lort","ondt","blod","bold","blot","bolt","bord","rent","onde","rend","bedt","nord","bort","drop","ledt","delt","pund","duer","ride","brud","uret","rute","olie","boet","trin","prue","bind","port","utro","bund","bidt","cent","bide","plet","under","runde","burde","tiden","orden","ordne","rundt","bilen","netop","broen","biler","luder","tider","ordet","rodet","point","blind","bruce","turen","derop","brudt","borte","indre","teori","ilden","pilot","binde","lorte","troen","turde","bordet","bolden","tilbud","ordnet","porten","blodet","dertil","bundet","blinde","pointe","iorden","norbit","bruden","nicole","united","procent",]],
["butikshandel", ["du","ud","at","en","de","et","et","te","nu","se","da","ad","ti","ha","ah","al","sa","ni","an","is","el","le","bi","det","det","ted","til","ilt","den","ned","end","han","kan","hun","din","ind","lad","tak","kat","alt","tal","dit","tid","kun","set","hen","sin","ude","ked","bil","del","led","hus","ben","sit","sti","bad","ske","eks","the","nat","luk","let","sat","ide","ild","bed","sad","hel","hul","ens","sne","usa","san","and","dan","hed","nul","bud","hat","sal","las","abe","hud","bid","tab","bus","had","hit","ian","sue","bak","hal","hil","hut","skal","hans","nash","lidt","helt","sted","dets","dine","inde","tale","uden","lide","skat","stak","kast","lade","dale","side","sket","sent","sten","slet","sine","isen","land","slut","held","husk","hund","hent","skai","send","stil","skib","skid","snak","skud","hest","kald","sluk","lusk","bank","bedt","stik","date","dans","sand","tabe","sind","ledt","delt","bane","hils","heks","stan","slik","blik","hals","hank","kina","tank","skub","skab","salt","last","hade","klub","huse","band","niks","beth","bind","base","hule","bund","tina","bidt","lake","heit","bide","sund","tand","hale","knus","kane","bush","sild","blad","siden","sinde","indse","altid","andet","tiden","huske","bilen","sandt","stand","helst","skide","huset","skudt","sendt","skade","kalde","kendt","bedst","danse","sande","skidt","skabe","uheld","skabt","liste","hunde","huden","taske","kaste","skilt","lande","andel","laden","tanke","blind","kaldt","bande","kunst","knust","skibe","banke","besat","kilde","ladet","hilse","ilden","basen","blade","butik","knuse","dansk","kunde","knibe","udsat","binde","ethan","bland","tales","knald","bunke","stuen","dusin","kiste","latin","landet","uanset","sulten","sultne","skibet","tusind","kaldte","kaldet","blandt","halsen","kaldes","tilbud","listen","sekund","skabte","skabet","handel","handle","uskadt","klient","bundet","kilden","ukendt","tasken","blande","island","skadet","blinde","austin","danske","kusine","hilsen","knuste","udtale","united","knalde","tusinde","beskidt","landets","stilhed","blandet",]],
["forbudstavle", ["er","du","ud","at","de","af","et","et","te","os","so","se","da","ad","to","al","sa","bo","ro","av","ar","ur","el","le","det","det","ted","for","der","red","var","arv","ved","fra","far","lad","alt","tal","ser","set","tre","ret","vel","lev","tro","ude","del","led","ord","rod","fat","bad","bor","bro","tur","lov","let","fru","lod","sat","bed","sur","sad","sov","lav","vor","usa","fod","fed","bar","los","sol","bud","sal","las","abe","tab","bus","ost","dav","art","eva","reb","sue","ulv","bur","out","lur","bare","aber","over","vore","ovre","selv","blev","sted","dets","tale","stor","sort","lort","lave","lade","dale","fast","flot","slet","blod","bold","fuld","slut","fred","fedt","svar","blot","bolt","fald","flad","sove","stod","bord","fest","frue","fare","fart","traf","fars","vred","stol","slot","slot","love","luft","brev","bedt","ofte","date","ofre","bort","davs","tabe","vest","ledt","delt","vare","vort","rose","vold","duer","brud","uret","rute","boet","salt","last","tolv","brad","drab","stof","base","lavt","fort","utro","surt","sure","fase","flod","flov","dato","blad","svor","vores","sover","laver","burde","taler","store","sorte","lader","alder","lavet","lover","fader","stole","faldt","bedst","aftes","taber","falde","svare","luder","trods","ordet","rodet","fulde","fuldt","sovet","bravo","farve","brudt","borte","lovet","straf","besat","ladet","blade","alvor","faret","slave","udsat","desto","tales","ofret","lorte","laser","turde","farvel","afsted","falder","oberst","stoler","soldat","svaret","bordet","faldet","blodet","fordel","udover","forlad","slaver","varsel","dufter","udtale","forlade","overalt","absolut","forladt","forbudt","oversat","afbrudt","soldater",]],
["kahytsjomfru", ["at","af","om","ja","os","so","to","jo","ok","ko","ha","ah","sa","oh","ro","ar","ur","ry","sy","har","for","som","ham","kom","fra","far","tak","kat","mor","rom","tro","fyr","hos","hus","fat","tur","tom","tja","fru","sat","rum","mur","sur","sko","ray","kys","sky","usa","arm","ram","jah","haj","hat","ryk","ost","art","hot","kur","maj","mus","tyk","out","hor","hut","okay","skat","stak","kast","stor","sort","haft","fast","kort","smuk","husk","fart","traf","fars","skam","form","ramt","styr","kors","smut","tryk","kurs","skru","skaf","rask","skar","trak","amok","koma","kaos","tysk","stof","samt","fort","utro","mars","surt","kram","smukt","kraft","smart","major","straf","storm","humor","south","jomfru","faktum",]],
["pendultrafik", ["er","du","ud","at","en","de","af","et","et","te","nu","da","ad","ti","al","ni","an","ar","ur","el","le","det","det","ted","til","ilt","den","ned","end","der","red","kan","din","ind","fra","far","lad","tak","kat","alt","tal","dit","tid","kun","fik","tre","ret","ude","par","ked","del","led","fat","fri","nat","tur","luk","let","fru","ide","nar","ild","ren","fin","and","dan","fed","pik","nul","fan","art","ian","tip","pak","per","kur","pan","put","pil","lur","fil","lidt","dine","inde","klar","tale","uden","fint","lide","lade","dale","fire","frie","fuld","land","fred","fedt","find","plan","aner","fald","flad","frue","fare","rent","fart","traf","paul","kald","luft","knap","rend","drik","date","klap","fine","ledt","delt","fair","frit","trak","park","lift","pund","duer","drak","ride","uret","rute","kina","tank","trin","prue","tina","lake","irak","tand","kane","plet","rita","klip","altid","finde","andre","aften","andet","under","runde","taler","fandt","tiden","klare","rundt","lader","alder","frank","klart","fader","kalde","faldt","kendt","drink","kraft","falde","luder","tider","fulde","lande","andel","laden","tanke","kaldt","fuldt","panik","turen","indre","kilde","ladet","flink","punkt","ilden","april","natur","kunde","karen","faret","knald","pirat","parti","faren","latin","filer","turde","flint","finder","fundet","kalder","landet","luften","falder","kaldte","kaldet","tanker","klaret","klatre","planer","planet","faldet","farten","dertil","klient","kilden","kunder","drukne","lander","ukendt","parken","kilder","dufter","aktier","udtale","united","knalde","kraften","artikel","kapitel",]],
["kostpyramide", ["er","at","de","et","et","te","om","os","so","se","op","da","ad","to","ok","ko","ti","sa","ro","is","ar","ry","sy","det","det","ted","med","dem","der","red","som","kom","tak","kat","mit","tim","dit","tid","ser","mor","rom","mod","dom","set","tre","ret","tro","par","ked","pas","pis","ord","rod","sit","sti","mad","ske","eks","tom","dyr","ryd","sat","ide","sad","sko","ray","kys","sky","arm","ram","pik","kop","syd","top","pot","ryk","ost","art","tip","pak","pyt","per","tyk","okay","sted","dets","sker","skat","stak","kast","stop","post","stor","sort","side","imod","sket","mest","kort","time","kamp","skyd","stod","dame","made","spor","skai","mord","smid","skid","krop","pris","midt","skam","ramt","styr","stik","drik","date","kors","smed","type","tryk","kode","drop","pres","arme","rask","skar","rose","trak","park","team","kopi","drak","ride","amok","koma","kaos","more","tysk","spar","dyrt","ydre","dyre","port","samt","mode","pose","mars","irak","spyt","kram","dato","rita","spyd","store","sorte","timer","skide","skyde","damer","skade","sikre","krise","paris","miste","times","skrid","skidt","smart","styre","ryste","ramte","maske","smide","trods","tider","taske","kaste","ordet","rodet","radio","smidt","sider","derop","myrde","moder","teori","spore","tyske","storm","spark","kampe","koste","sport","marie","desto","spare","korte","tyder","skred","pirat","parti","spred","modet","dyrke","kiste","skyder","krydse","mister","styrke","ekstra","kaster","myrdet","skridt","koster","sektor","tiders","smider","yderst","sporet","skader","mordet","smadre","typisk","sikret","skadet","sparke","smarte","skride","pastor","spredt","aktier","kopier","smadret","omsider","diskret","psykiater",]],
["forbudslinje", ["er","du","ud","en","de","nu","os","so","se","jo","ej","bo","ni","ro","is","ur","el","le","bi","den","ned","end","for","der","red","nej","din","ind","jer","ser","sin","ude","bil","del","led","ord","rod","ben","job","fri","bor","bro","fru","lod","ide","joe","ild","bed","sur","ren","fin","jul","ens","sne","fod","fed","los","sol","ond","nul","bud","fis","bid","sej","bus","reb","sue","bur","lur","fil","dine","inde","uden","lide","fire","frie","side","fejl","blod","bold","sine","isen","fuld","fred","find","bord","frue","send","onde","rejs","sejr","jord","rend","nord","ofre","sind","fine","drej","rose","duer","ride","brud","olie","lejr","bind","juni","bund","juli","sure","flod","bide","jern","sund","sejl","sild","fordi","siden","sinde","indse","finde","under","runde","burde","orden","ordne","bilen","forbi","fjols","solen","fjern","broen","biler","luder","fulde","blind","sider","indre","julie","linje","ilden","befri","julen","binde","dusin","foden","filer","finder","jorden","findes","floden","bolden","fordel","junior","blinde","indser","iorden","bruden","udenfor","jordens","fjolser","forsiden",]],
["godsterminal", ["er","at","en","og","de","et","et","te","om","os","so","se","da","ad","to","ti","al","sa","ni","ro","an","is","ar","el","le","det","det","ted","til","ilt","mig","med","dem","den","ned","end","der","red","dig","gid","men","nem","som","min","din","ind","lad","sig","man","alt","tal","mit","tim","dit","tid","ser","dag","gad","mor","rom","god","dog","tag","agt","mod","dom","set","tre","ret","tog","sin","tro","del","led","ord","rod","sit","sti","mad","nat","tom","sag","gas","let","lod","lig","sat","ide","nar","ild","sad","ren","mon","ens","sne","san","and","dan","gal","lag","arm","ram","los","sol","ond","rig","sal","las","leg","gem","glo","ost","art","ian","mil","mel","ged","lam","godt","lige","mand","lidt","igen","enig","geni","mine","tage","sige","sted","dets","dine","inde","ting","tale","lide","stor","sort","lort","gode","lade","dale","galt","lagt","dage","gade","sagt","side","imod","glad","lang","sent","sten","ondt","mens","mest","ring","grin","slet","glem","time","sine","isen","land","slog","seng","aner","stod","dame","made","send","stil","mord","smid","rent","magt","sang","midt","onde","stol","slot","slot","ramt","nemt","ment","tegn","glas","slag","salg","rige","rend","date","smil","nord","smed","magi","idag","dans","sand","sind","gemt","slem","smag","ledt","delt","arme","rose","team","amen","grim","ogsa","stan","ride","olie","grad","regn","sorg","gale","more","stig","sigt","saml","salt","last","trin","samt","mode","gris","mars","tina","steg","mail","larm","dato","tand","long","male","dags","rita","sild","noget","sagde","dages","siger","tager","agter","mange","megan","nogle","siden","sinde","indse","altid","andre","andet","taler","store","sorte","snart","gamle","tiden","orden","ordne","rolig","dreng","langt","sandt","stand","timer","lader","alder","ringe","grine","sagen","sange","dagen","gaden","agent","damer","gider","sendt","glemt","stole","slemt","miste","times","danse","sande","smart","lagde","glade","solen","ramte","sager","smide","liste","trods","tider","mands","maden","damen","ordet","rodet","liget","lange","angel",
    "lande","andel","laden","samle","minde","radio","drage","gader","smidt","sider","solgt","miles","smile","modig","moder","ensom","imens","indre","teori","ligne","milde","smage","ladet","ilden","model","timen","storm","armen","langs","sigte","stige","grant","tiger","marie","metal","desto","nogie","grimt","tales","dragt","menig","modet","enorm","lorte","meldt","laser","troen","ledig","stone","lager","latin","glimt","aldrig","stadig","morgen","ligner","mindre","minder","roligt","ansigt","godnat","landet","alting","nemlig","mister","stoler","ringet","mindst","morges","soldat","gratis","tiders","samlet","signal","smider","danser","andres","smager","listen","ordnet","normal","samler","solgte","dertil","dagens","mordet","midten","midnat","magten","stiger","smadre","lander","merlin","slange","island","onsdag","deling","smiler","slaget","midler","smarte","indser","single","gidsel","iorden","enormt","orange","stolen","mangel","genial","modige","ligesom","mindste","mangler","normalt","senator","radioen","monster","stormen","tirsdag","torsdag","imorgen","normale","smadret","samling","modtage","anmoder","genialt","landets","langsom","omsider","soldater","langsomt","modtager","signalet","sandelig","ansigter","omringet","nordlige","ordentlig"]],
["vandpistoler", ["er","at","en","vi","de","et","et","te","os","so","se","op","da","ad","to","ti","al","sa","ni","ro","an","is","av","ar","el","le","det","det","ted","til","ilt","den","ned","end","der","red","vil","liv","var","arv","ved","din","ind","lad","alt","tal","dit","tid","ser","set","tre","ret","vel","lev","ven","sin","tro","par","pas","del","led","pis","ord","rod","sit","sti","nat","lov","vis","let","lod","sat","ide","nar","ild","sad","ren","sov","lav","vor","ens","sne","san","and","dan","los","sol","ond","vin","sal","las","top","pot","via","ost","dav","art","eva","ian","tip","per","vei","pan","pil","over","vore","ovre","selv","lidt","sted","dets","dine","inde","vent","tale","lide","vide","stop","post","stor","sort","lort","vist","lave","lade","dale","side","sent","sten","ondt","vise","seiv","slap","slet","live","vand","sine","isen","land","slip","spil","svin","svar","plan","aner","sove","stod","vild","spor","send","stil","rent","pris","vred","onde","stol","slot","slot","vend","love","rend","date","nord","davs","vidt","dans","sand","sind","drop","pres","vest","ledt","delt","vare","vort","livs","rose","vold","stan","ride","vant","olie","oven","vind","salt","last","tolv","trin","spar","avis","lavt","port","pose","tina","rive","dato","tand","plet","rita","sild","vane","svor","vores","sover","laver","siden","sinde","indse","altid","andre","andet","taler","store","sorte","snart","tiden","orden","ordne","livet","sandt","stand","lader","alder","lavet","plads","viser","lover","sendt","vinde","vidne","viden","stole","netop","paris","vildt","danse","sande","viste","vandt","solen","svare","loven","liste","trods","vilde","tider","vidst","ordet","rodet","lande","andel","laden","point","radio","savne","prins","vendt","sider","sovet","derop","lovet","indre","teori","ladet","spion","spore","spild","video","ilden","drive","pilot","april","alvor","sport","slave","desto","spare","tales","penis","pirat","parti","spred","davis","posen","lorte","laser","troen","stone","latin","vidste","pistol","vinder","vidner","person","landet","vandet","savner",
    "stoler","planer","soldat","svaret","savnet","planet","tiders","danser","andres","listen","privat","prisen","ordnet","porten","sporet","avisen","dertil","spilde","lander","svinet","slaver","varsel","island","pointe","livets","spildt","indser","pastor","iorden","aviser","spredt","travis","stolen","vinter","tilpas","vidnet","posten","overalt","senator","radioen","oversat","spilder","private","pladser","pladsen","landets","version","pistolen","soldater","pistoler",]],
["realindkomst", ["er","at","en","de","et","et","te","om","os","so","se","da","ad","to","ok","ko","ti","al","sa","ni","ro","an","is","ar","el","le","det","det","ted","til","ilt","med","dem","den","ned","end","der","red","kan","men","nem","som","min","kom","din","ind","lad","tak","kat","nok","man","alt","tal","mit","tim","dit","tid","ser","mor","rom","mod","dom","set","tre","ret","sin","tro","ked","del","led","ord","rod","sit","sti","mad","ske","eks","nat","tom","let","lod","sat","ide","nar","ild","sad","ren","sko","mon","ens","sne","san","and","dan","arm","ram","los","sol","ond","sal","las","ost","art","ian","mil","mel","lam","skal","mand","lidt","mine","sted","dets","dine","inde","klar","tale","lide","sker","skat","stak","kast","stor","sort","lort","lade","dale","kone","side","imod","sket","sent","sten","ondt","mens","mest","slet","kort","time","sine","isen","land","aner","stod","dame","made", "send","stil","mord","smid","rent","skid","midt","onde","snak","skam","stol","slot","slot","ramt","nemt","ment","kald","rend","stik","drik","date","kors","smil","nord","smed","dans","sand","kode","sind","slem","ledt","delt","kold","arme","kilo","rask","skar","rose","trak","team","amen","stan","drak","slik","ride","olie","kina","amok","koma","tank","kaos","more","saml","salt","last","trin","niks","samt","mode","mars","tina","lake","irak","kram","mail","larm","dato","tand","male","kane","sild","siden","sinde","indse","altid","andre","andet","taler","store","sorte","snart","tiden","orden","ordne","klare","sandt","stand","timer","lader","alder","skide","damer","klart","sendt","onkel","skade","skole","kalde","stole","kendt","drink","sikre","krise","slemt","miste","times","danse","sande","skrid","skidt","smart","solen","ramte","maske","koldt","smide","liste","trods","tider","mands","maden","damen","taske","kaste","ordet","rodet","skilt","lande","andel","laden","tanke","samle","minde","radio","kaldt","smidt","sider","miles","smile","moder","ensom","imens","indre","teori","milde","kilde","ladet","koden","kolde","ilden","model","timen","storm","armen",
    "ankom","dansk","koste","karen","narko","krone","koner","marie","metal","desto","tales","korte","knald","skred","modet","enorm","lorte","meldt","laser","troen","stone","kiste","latin","kalder","mindre","minder","landet","skolen","mister","kaldte","kaldet","stoler","ekstra","kaster","tanker","klaret","klatre","mindst","soldat","skridt","koster","sektor","tiders","samlet","smider","danser","andres","kaldes","listen","ordnet","normal","samler","skader","dertil","mordet","klient","midten","midnat","kilden","smadre","lander","merlin","tasken","sikret","island","skadet","drinks","smiler","kilder","midler","smarte","skride","danske","indser","iorden","enormt","aktier","stolen","marken","knalde","mindste","normalt","senator","stinker","kristen","radioen","maskine","monster","stormen","mirakel","normale","smadret","artikel","anmoder","landets","omsider","ankomst","diskret","lektion","soldater","reaktion","maskiner","mistanke","romantisk"]],
]

let logicArray = [
    [['lejemorder', 'hun', 'han', 'de'], [['mæt', 'sulten'], ['fed', 'tynd'], ['rask', 'syg'], ['langhåret', 'skaldet'], ['fuld', 'ædru']]],
    [['astronaut', 'hun', 'han', 'de'], [['fjollet', 'alvorlig'], ['lang', 'kort'], ['ung', 'gammel'], ['glad', 'trist'], ['høflig', 'uhøflig']]],
    [['sø', 'den', 'den', 'den'], [['forurenet', 'ren'], ['klar', 'uklar'], ['højtliggende', 'lavtliggende'], ['kold', 'varm'], ['nær', 'fjern']]],
    [['vandpyt', 'den', 'den', 'den'], [['stor', 'lille'], ['rund', 'firkantet'], ['lavvandet', 'dyb'], ['frosset', 'tøet'], ['snavset', 'ren']]],
    [['præst', 'hun', 'han', 'de'], [['fed', 'mager'], ['ædru', 'fuld'], ['ophidset', 'rolig'], ['grusom', 'rar'], ['løgnagtig', 'sanddru']]],
    [['vase', 'den', 'den', 'den'], [['dyr', 'billig'], ['lav', 'høj'], ['solid', 'skrøbelig'], ['gammel', 'ny'], ['sjælden', 'almindelig']]],
    // [['', 'hun', 'han', 'de'], [['', ''], ['', ''], ['', ''], ['', ''], ['', '']]],
    [['politiker', 'hun', 'han', 'de'], [['ærlig', 'uærlig'], ['modig', 'fej'],  ['korthåret', 'langhåret'],['ekstrem', 'moderat'], ['skyldig', 'uskyldig']]]
]


// Gamemodes below

class NiffDataPacket {
    constructor(packetType) {
        this.pt = packetType;  // (p)articipants (s)core (f)inalMana
        // this.era = new Date().valueOf();  // EndRoundAt
        // this.he = false;  // Healer
        // this.hu = false;  // Hunter
    }
}


class NiffGame {
    constructor(){
        this.globalMana = 500;
        this.localMana = 0;
        this.playerList = [];
        // this.healerParticipates = false;
        this.amulet = false;
        this.booster = 1.0;
        this.coordinator = false;
        this.id = 0;
        this.goalArray = ['dummyGoal'];
        this.currentGoalNumber = 0; 
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        this.gameHasHealer = false;
        this.gameHasHunter = false;
        }
        
        updateGoal () {
            if (this.currentGoalNumber < this.goalArray.length - 1) {
                this.currentGoalNumber += 1;
                this.currentGoal = this.goalArray[this.currentGoalNumber];
            }
        }
}


class LogicEngine extends NiffGame {  // Logic framework
    constructor() {
        super();
        this.answer = 0; // 1:Ja  2:Nej  3:Sludder
    }

    choseRiddle(activityLevel, difficult) {  // acitvityLevel 1 or 3, difficult false or true
        showTextDiv.hidden = false;
        let targetGroup = 'begyndere';
        if (difficult) {targetGroup = 'viderekommende'}
        showTextDiv.innerHTML = '<h2> Logik for ' + targetGroup + ' </h2>';

        if (activityLevel === 3) {
            showTextDiv.innerHTML += ' <span> Skan QR-koden<br>3 for ' 
            + 'JA<br>7 for NEJ og<br>11 for SLUDDER </span><br><br>';
        }
        let cat = rand(logicArray.length, logicArray.length);
        let pronoun = rand(3, 0);  // Not 0
        this.answer = rand(3, 0);  // 1:Ja  2:Nej  3:Sludder
        let antonym1, antonym2, antonym3, antonym4, antonymSet1, antonymSet2, antonymSet3, antonymSet4;
        switch (this.answer) {
            case 1:
                [antonymSet1, antonymSet2, antonymSet3, antonymSet4] = returnMOutOf5(4);
                [antonym1, antonym2, antonym3, antonym4] = [coinFlip(), coinFlip(), coinFlip(), coinFlip()];
                console.log('Ja');
                break
            case 2:
                if (difficult) {
                    if (coinFlip()) {
                        [antonymSet1, antonymSet2, antonymSet4] = returnMOutOf5(3);
                        antonymSet3 = antonymSet2;
                        [antonym1, antonym2, antonym4] = [coinFlip(), coinFlip(), coinFlip()];
                        antonym3 = 1 - antonym2;
                    } else {
                        [antonymSet1, antonymSet2, antonymSet4] = returnMOutOf5(3);
                        antonymSet3 = antonymSet1;
                        [antonym1, antonym2, antonym4] = [coinFlip(), coinFlip(), coinFlip()];
                        antonym3 = 1 - antonym1;
                    }
                } else {
                    [antonymSet1, antonymSet3] = returnMOutOf5(2);
                    antonymSet2 = antonymSet1;
                    [antonym1, antonym2, antonym3] = [coinFlip(), coinFlip(), coinFlip()];
                    antonym2 = 1 - antonym1;
                }
                console.log('Nej');
                break
            case 3:
                if (difficult) {
                    if (coinFlip()) {
                        [antonymSet1, antonymSet2, antonymSet3] = returnMOutOf5(3);
                        antonymSet4 = antonymSet1;
                        [antonym1, antonym2, antonym3] = [coinFlip(), coinFlip(), coinFlip()];
                        antonym4 = 1 - antonym1;
                    } else {
                        [antonymSet1, antonymSet2, antonymSet3] = returnMOutOf5(3);
                        antonymSet4 = antonymSet2;
                        [antonym1, antonym2, antonym3] = [coinFlip(), coinFlip(), coinFlip()];
                        antonym4 = 1 - antonym2;
                    }
                } else {
                    [antonymSet1, antonymSet2] = returnMOutOf5(2);
                    antonymSet3 = antonymSet1;
                    [antonym1, antonym2, antonym3] = [coinFlip(), coinFlip(), coinFlip()];
                    antonym3 = 1 - antonym1;
                }
                console.log('Sludder');
                break
        }
        let riddle = '';
        if (!difficult) {  // Basic logic
            riddle = '<h4 id="riddle">Kan en ' + logicArray[cat][1][antonymSet1][antonym1] + ' ' 
            + logicArray[cat][0][0]
            + ', være ' + logicArray[cat][1][antonymSet2][antonym2] + ', hvis ' 
            + logicArray[cat][0][pronoun] + ' er ' + logicArray[cat][1][antonymSet3][antonym3] + '?</h4>';
        } else if (difficult) {  // Advanced logic
            riddle = '<h4 id="riddle">Kan en '+ logicArray[cat][1][antonymSet1][antonym1] + ' ' 
            + logicArray[cat][0][0] + ', der er ' + logicArray[cat][1][antonymSet2][antonym2]
            + ', være ' + logicArray[cat][1][antonymSet3][antonym3] + ', hvis ' 
            + logicArray[cat][0][pronoun] + ' er ' + logicArray[cat][1][antonymSet4][antonym4] + '?</h4>';
        }
        showTextDiv.innerHTML += riddle;
    }
}

// TODO: Make scanning 0 possible for low activity logic gamemodes in case of attack - or disable attacks

class LogicControlsLow extends LogicEngine {  // Controls for low activity Logic gamemodes
    constructor() {
        super();

        setButton('M1Button1', 'Ja', 'active', 'green');
        setButton('M1Button2', 'Sludder', 'active', 'yellow');
        setButton('M1Button3', 'Nej', 'active', 'red');
    }

    async useAnswer(event) {
        let answer = event.target.id;
        let newMana = 200;
        let allText = document.getElementById('showTextDiv');
        let riddle = document.getElementById('riddle');
        if (answer == 'M1Button1' && this.answer == 1) {
            this.addMana(newMana);
        } else if (answer == 'M1Button3' && this.answer == 2) {
            this.addMana(newMana);
        } else if (answer == 'M1Button2' && this.answer == 3) {
            this.addMana(newMana);
        } else {
            riddle.style.color = 'darkorange';
            showMessage(allText.innerHTML + 'Forkert svar. <br>Prøv et nyt spørgsmål :-) <br>', 3000);
            await timer(3000);
            riddle.style.color = 'darkblue';
            this.choseARiddle();  // choseARiddle, not choseRiddle
        }
    }
    
    async addMana(newMana) {
        let riddle = document.getElementById('riddle');
        this.localMana += newMana;
        riddle.style.color = 'cornflowerblue';
        
        updateManaCounters(newMana);
        await timer(2000);
        riddle.style.color = 'darkblue';
        riddle.hidden = true;
        this.choseARiddle();  // choseARiddle, not choseRiddle
    }
}


class M1T1G1 extends NiffGame {  // Healer
    constructor() {
        super();
        this.gameMode = 'M1T1G1';

        generateQRcode("Thy shalst be healed!").append(canvasQrShow);
        canvasQrShow.style.display = 'none';
        // ToDo: Add explaning text?
        setButton('actionButton', 'Skan', 'active', 'green');
        setButton('action1Button', 'Heal', 'active', 'green');

        clearInterval(attackTimer);  // Makes sure the Healer is not attacked

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Heal dem der er blevet skadet</h2> <span> Tryk på Heal-knappen, ' +
        'når spillere <br>kommer med en rød skærm. <br> (Det koster mana at heale, så gør det kort) <br><br>' + 
        'Tryk på Skan-knappen og skan 0 en gang imellem for at samle mana </span>';

    }

    async applyQrCode(QrNumber) {
        if (QrNumber === 'center') {
            let newDelta = Math.floor(10 * booster);  // booster is a percentage boost. 10% boost makes booster = 1.1
            this.localMana += Number(newDelta);
            await updateManaCounters(newDelta); // Todo: Remove the Healers scan-button for 10 seconds after each scan?
            setButton('actionButton', 'Skan', 'inactive', 'green');
            await timer(5000);
            setButton('actionButton', 'Skan', 'active', 'green');
        }
    }
}


class M1T2G1 extends LogicControlsLow {  // Logik for begyndere, M1  T2
    constructor() {
        super();
        this.gameMode = 'M1T2G1';

        this.choseRiddle(1, 0);
    }

    choseARiddle() {
        this. choseRiddle(1,0)
    }
}

class M1T3G1 extends LogicControlsLow {  // Logik for viderekommende, M1
    constructor() {
        super();
        this.gameMode = 'M1T3G1';

        this.choseRiddle(1, 1);
    }

    choseARiddle() {
        this. choseRiddle(1,1)
    }
}


class M2T1G1 extends NiffGame {  // Skan i rækkefølge
    constructor() {
        super();
        this.gameMode = 'M3T1G1';
        this.lastScan = 0;

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Skan i rækkefølge </h2> <span> Skan QR-koderne i ' +
        'rækkefølge <br> med eller mod uret<br>(Man kan godt skifte retning) </span>';

        setButton('actionButton', 'Skan', 'active', 'green');
    }

    applyQrCode(QrNumber) {
        let newDelta = 0;
        if (Math.abs(this.lastScan - QrNumber) === 1) {
            newDelta = Math.floor(45 * booster);
        } else {
            newDelta = 1;
        }
        this.localMana += Number(newDelta);
        updateManaCounters(newDelta);
        this.lastScan = QrNumber;
    }
}


class M2T2G1 extends NiffGame {  // Indstil visere efter digitalur
    constructor() {
        super();
        this.gameMode = 'M2T2G1';
        this.firstGuess = true;

        let arrayLen = 20;
        this.goalArray = [];
        for (var i = 0; i < arrayLen; i++) {
            let hour = Math.floor(Math.random() * 24);
            let min = Math.floor(Math.random() * 12) * 5;
            this.goalArray.push([hour, min]);
        }
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showTextDiv.hidden = false;
        let colon = ':';
        if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
            colon = ':0';
        }
        showTextDiv.innerHTML = '<h2> Flyt viserne så de viser </h2><h3>' + this.currentGoal[0] + colon +
        this.currentGoal[1] + '</h3> <span> (Skan først det tal den lille viser skal pege på. <br> For 14:50 skan 2 og så 10) </span>';

        document.getElementById('canvasStack').style.display = 'block';

        drawClockHandOnOverlay(6, false, 12, false);  // Draw hands pointing to 6 and 12, not filled, as a placeholder/reminder

        setButton('actionButton', 'Skan', 'active', 'green');
    }

    applyQrCode(QrNumber) {
        let num = Number(QrNumber);
        var curGo = this.currentGoal;
        if (this.firstGuess && (num === curGo[0] || num + 12 === curGo[0] || (num === 12 && curGo[0] === 0))) {
            this.firstGuess = false;
            this.smallHandNum = QrNumber;
            drawClockHandOnOverlay(QrNumber, true, 12, false);
        } else if (!this.firstGuess && (num * 5 === curGo[1] || (curGo[1] === 0 && num === 12))) {
            drawClockHandOnOverlay(this.smallHandNum, true, QrNumber, true);
            let newDelta = Math.floor(100 * booster);
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            document.getElementsByTagName('h3')[0].style.color = 'rgb(53, 219, 53)';
            setButton('actionButton', 'Skan', 'inactive');  // Scanning the last digit multiple times shouldn't be possible
            
            setTimeout(() => {drawClockHandOnOverlay(6, false, 12, false)
                this.updateGoal();
                
                let colon = ':';
                var curGo = this.currentGoal;
                if (curGo[1] === 0 || curGo[1] === 5) {
                    colon = ':0';
                }
                showTextDiv.innerHTML = '<h2> Flyt viserne så de viser </h2><h3>' + curGo[0] + colon 
                + curGo[1] + '</h3> <span> (Skan først det tal den lille viser skal pege på. <br> For 14:50 skan 2 og så 10) </span>';

                this.firstGuess = true;
                document.getElementsByTagName('h3')[0].style.color = 'black';
                setButton('actionButton', 'Skan', 'active', 'green');
            }, 3000);
        } else {
            let oldText = showTextDiv.innerHTML;
            showTextDiv.innerHTML = '<h1> Prøv igen &#x1F642; </h1>';  // Smiley :-)
            setTimeout(() => showTextDiv.innerHTML = oldText, 3000);
        }
    }
}


class M2T2G2 extends NiffGame {  // Hunter
    constructor() {
            super();
            this.gameMode = 'M2T2G2';
            // this.acc;
            // this.rot;
            this.xCoor = 0;
            this.vxCoor = 0;
            this.damping = 0.96;
            this.animationID;

            // this.getMotion = this.getMotion.bind(this);

            setButton('M1Button1', 'Start jagt', 'active', 'green');
    }
        
    useAnswer(event) {
        let answer = event.target.id;
        if (answer == 'M1Button1') {  // Start hunt
            setButton('M1Button1', 'Start jagt', 'hidden', 'green');
            setButton('M1Button2', 'Skyd!', 'active', 'green');
            setButton('M1Button3', 'Stop jagt', 'active', 'red');

            window.addEventListener('devicemotion', function(event) {currentUser.getMotion(event)});
            scanQRcode();
            this.animationID = requestAnimationFrame(monsterMovement);
            
        } else if (answer == 'M1Button2') {  // Shoot
            this.localMana += 100;
            updateManaCounters(100);
            // TODO: Implement action based on current position
        } else if (answer == 'M1Button3') {  // Stop hunt
            setButton('M1Button1', 'Start jagt', 'active', 'green');
            setButton('M1Button2', 'Skyd!', 'hidden', 'green');
            setButton('M1Button3', 'Stop jagt', 'hidden', 'red');

            cancelAnimationFrame(this.animationID);
            stopScan();
            window.removeEventListener('devicemotion', function(event) {this.getMotion(event)})
        }
    }

    getMotion = (event) => {
        let acc = event.acceleration;
        let rot = event.rotationRate;
        let dt = 1/60;
        // let dt = event.interval;
        this.vxCoor += acc.x * dt;
        this.vxCoor *= this.damping;
        if (Math.abs(this.vxCoor) < 0.001) { this.vxCoor = 0; }
        this.xCoor += this.vxCoor * dt;

// 
        document.getElementById('gameName').innerHTML = this.xCoor;
        // document.getElementById('gameName').innerHTML = xCoor.toFixed(3);
        // document.getElementById('gameName').innerHTML = acc.x + ' ' + rot.alpha;
        // TODO: Implement updating position in (game)space
    }
    
    // For test purposes
    shakeItBaby(ax = 0, ay = 0, az = 0, alpha = 0, beta = 0, gamma = 0) {
        this.getMotion({
            acceleration: { x: ax, y: ay, z: az },
            accelerationIncludingGravity: null,
            rotationRate: { alpha: alpha, beta: beta, gamma: gamma },
            interval: 16,
        });
    }
}


class M2T3G1 extends NiffGame {  // Indstil visere efter beskrivelse
    constructor() {
        super();
        this.gameMode = 'M2T3G1';
        this.firstGuess = true;
        
        let arrayLen = 20;
        this.goalArray = [];
        for (var i = 0; i < arrayLen; i++) {
            let hour = Math.floor(Math.random() * 24);
            let min = Math.floor(Math.random() * 12) * 5;
            this.goalArray.push([hour, min]);
        }
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showTextDiv.hidden = false;
        let colon = ':';
        if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
            colon = ':0';
        }
        showTextDiv.innerHTML = '<h2> Flyt viserne så de viser </h2><h3>' + 
        timeParser(this.currentGoal[0], this.currentGoal[1]) + '</h3> <span> (Skan først det tal den ' + 
        'lille viser skal pege på. <br> For KVART I SYV skan 6 og så 9) </span>';

        document.getElementById('canvasStack').style.display = 'block';
        
        drawClockHandOnOverlay(6, false, 12, false);  // Draw hands pointing to 6 and 12, not filled, as a placeholder/reminder
        
        setButton('actionButton', 'Skan', 'active', 'green');
    }

    applyQrCode(QrNumber) {
        let num = Number(QrNumber);
        var curGo = this.currentGoal;
        if (this.firstGuess && (num === curGo[0] || num + 12 === curGo[0] || (num === 12 && curGo[0] === 0))) {
            this.firstGuess = false;
            this.smallHandNum = QrNumber;
            drawClockHandOnOverlay(QrNumber, true, 12, false);
        } else if (!this.firstGuess && (num * 5 === curGo[1] || (curGo[1] === 0 && num === 12))) {
            drawClockHandOnOverlay(this.smallHandNum, true, QrNumber, true);
            let newDelta = Math.floor(100 * booster);
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            document.getElementsByTagName('h3')[0].style.color = 'rgb(53, 219, 53)';
            setButton('actionButton', 'Skan', 'inactive');  // Scanning the last digit multiple times shouldn't be possible
            
            setTimeout(() => {drawClockHandOnOverlay(6, false, 12, false)
                this.updateGoal();
                
                let colon = ':';
                var curGo = this.currentGoal;
                if (curGo[1] === 0 || curGo[1] === 5) {
                    colon = ':0';
                }
                showTextDiv.innerHTML = '<h2> Flyt viserne så de viser </h2><h3>' + timeParser(curGo[0], curGo[1])  + 
                '</h3> <span> (Skan først det tal den lille viser skal pege på. <br> For 14:50 skan 2 og så 10) </span>';
                
                this.firstGuess = true;
                document.getElementsByTagName('h3')[0].style.color = 'black';
                setButton('actionButton', 'Skan', 'active', 'green');
            }, 3000);
        } else {
            let oldText = showTextDiv.innerHTML;
            showTextDiv.innerHTML = '<h1> Prøv igen &#x1F642; </h1>';  // Smiley :-)
            setTimeout(() => showTextDiv.innerHTML = oldText, 3000);
        }
    }
}


function timeParser(hour, min) {  // hour 0-12, min 0, 5, 10, ... , 55
    // let hour = Math.floor(Math.random() * 12);
    // let min = Math.floor(Math.random() * 12) * 5;
    // console.log(hour + ':' + min)
    hour %= 12;  // Bring 24 hour time back to Donald Duck time
    
    minStringList = [ '', 'fem minutter over ', 'ti minutter over ', 'kvart over ', 'tyve minutter over ',
        'fem minutter i halv ', 'halv ', 'fem minutter over halv ', 'tyve minutter i ', 'kvart i ',
        'ti minutter i ', 'fem minutter i ', '' ];

    min = min / 5;

    minString = minStringList[min];

    nextHourList = [false, false, false, false, false, true, true, true, true, true, true, true, true, ];
    if (nextHourList[min]) {
        hour += 1;
    }

    hourStringList = ['tolv', 'et', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'otte', 'ni', 'ti', 'elleve', 'tolv'];
    hourString = hourStringList[hour];

    let text = String(minString + hourString).charAt(0).toUpperCase() + String(minString + hourString).slice(1);

    console.log(text);
    return text;
}


class M2T3G2 extends NiffGame {    // Find ord 
    constructor() {
        super();
        this.gameMode = 'M2T3G2';
        this.wordCanHaveMoreCharacters = true;

        this.wordIndexes = shuffleArray(Array.from({length: 43}, (e, i) =>  i));  // Length of anagramArray is 42
        this.wordIndex = this.wordIndexes.pop();
        this.currentMainWord = anagramArray[this.wordIndex][0];
        this.currentWord = '';
        this.wordList = [];
        this.usedNumbers = [];
        this.resetWord = false;

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Find ord ud fra bogstaverne i </h2><h3>' + this.currentMainWord + '</h3>'
        + '<span>Skan QR-koden for hvert bogstav du vil bruge og afslut ordet ved at skanne \'0\' </span>';
        document.getElementsByTagName('h3')[0].style.color = 'blue';

        document.getElementById('QrContainer').innerHTML = 'Fundne ord:\n';

        showWord(this.currentMainWord);
        
        setButton('actionButton', 'Skan', 'active', 'green');
        console.log(this. currentMainWord);
    }
    
    applyQrCode(QrNumber) {
        if (QrNumber === 'center') {
            if (!anagramArray[this.wordIndex][1].includes(this.currentWord)) {  // Not!
                // this.currentWord.slice(0, this.currentWord.length - 1);
                if (this.resetWord) {
                    this.currentWord = '';
                    this.usedNumbers = [];
                    this.resetWord = false;
                    drawClockfaceOverlay();
                } else if (!this.currentWord) {
                    showMessage('Der skal være et ord markeret, før det kan afsluttes :-)')
                } else {
                    showMessage('Ordet er ikke i Niffs liste. Skan 0 igen for at afslutte ordet', 3000);
                    this.resetWord = true;
                    // drawClockfaceOverlay(QrNumber, [255, 0, 0]);
                }
            } else {
                document.getElementById('QrContainer').innerHTML += this.currentWord + ', ';
                this.wordList.push(this.currentWord);
                this.currentWord = '';
                this.usedNumbers = [];
                this.localMana += 50 * this.currentWord.length;
                updateManaCounters(this.localMana);
                drawClockfaceOverlay();
                this.resetWord = false;
                // this.wordIndex = this.wordIndexes.pop();
                // this.currentMainWord = anagramArray[this.wordIndex][0];
                // showWord(this.currentMainWord);
            }
        } else {
            this.currentWord += anagramArray[this.wordIndex][0][QrNumber - 1];
            this.usedNumbers.push(QrNumber);
            drawClockfaceOverlay(this.usedNumbers, [0, 255, 0]);
            this.resetWord = false;
        }
    }
}


class M3T1G1 extends NiffGame {  // Scan løs
    constructor() {
        super();
        this.gameMode = 'M3T1G1';
        this.lastScan = 0;

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Skan løs! </h2> <span> Skan så mange QR-koder som muligt<br> '
        + ' (Jo længere QR-koderne ligger langt fra <br> hinanden, jo mere mana giver de) </span>';


        setButton('actionButton', 'Skan', 'active', 'green');
    }

    applyQrCode(QrNumber) {
        let newDelta = 0;
        if (this.lastScan === 0) {
            newDelta = QrNumber;
        } else {
            newDelta = Math.round(5/10000 * ((clockFaceCoor[QrNumber][0] - clockFaceCoor[this.lastScan][0]) * (clockFaceCoor[QrNumber][0] - clockFaceCoor[this.lastScan][0]) + (clockFaceCoor[QrNumber][1] - clockFaceCoor[this.lastScan][1]) * (clockFaceCoor[QrNumber][1] - clockFaceCoor[this.lastScan][1])) + 1);
        }
        newDelta = Math.floor(newDelta * booster);
        this.localMana += Number(newDelta);
        updateManaCounters(newDelta);
        this.lastScan = QrNumber;
    }
}


class M3T1G2 extends NiffGame {  // Følg det viste mønster
    constructor() {
        super();
        this.gameMode = 'M3T1G2';
        
        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];

        document.getElementById('canvasStack').style.display = 'block';
        drawClockface();
        drawClockfaceOverlay([this.currentGoal], [0, 255, 0]);

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Skan QR-koden med det grønne tal </h2> <span>' +
        '(Når den rigtige QR-kode er skannet, <br>vises den næste der skal skannes) </span>';

        setButton('actionButton', 'Skan', 'active', 'green');
    }

    async applyQrCode(QrNumber) {
        if (Number(QrNumber) === this.currentGoal) {
            let newDelta = Math.floor(50 * booster);
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            this.updateGoal();
            drawClockface();
            drawClockfaceOverlay([this.currentGoal], [0, 255, 0]);
        } else {
            showError(QrNumber);
            await timer(1600);
            currentUser.localMana -= wrongPatternPrice;
            updateManaCounters(-wrongPatternPrice);
            await timer(300);
            drawClockface();
            drawClockfaceOverlay([this.currentGoal], [0, 255, 0]);
        }
    }
}


class M3T1G3 extends NiffGame {  // Følg mønster efter tal
    constructor() {
        super();
        this.gameMode = 'M3T1G3';
        
        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Scan ' + this.currentGoal + '</h2>';

        setButton('actionButton', 'Skan', 'active', 'green');
    }
    
    async applyQrCode(QrNumber) {
        if (Number(QrNumber) === this.currentGoal) {
            let newDelta = Math.floor(50 * booster);
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            this.updateGoal();
            showTextDiv.innerHTML = '<h2> Skan ' + this.currentGoal + '</h2>';
        } else {
            showTextDiv.innerHTML = '<h2> Det var ikke ' + this.currentGoal + '<br>  &#x1FAE4;</h2>';  // Smiley :-/
            await timer(1000);
            showTextDiv.innerHTML = '<h2> Skan ' + this.currentGoal + '</h2>';
        }
    }
}


class M3T2G1 extends NiffGame {  //  Gentag mønster
    constructor() {
        super();
        this.gameMode = 'M3T2G1';
        this.showedPattern = false;

        let arrayLen = 20;
        let startNum = 0;
        // TODO: Fix randomness not being random - IF it is really a problem??
        // myArray = new Uint32Array(10); 
        // myArray = crypto.getRandomValues(myArray)
        // let random = () => Math.abs(Math.sin(Date.now()));  // JS randomgenerator Math.random cannot be seeded...
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random() * 6) + 2);  // Avoids the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h3> Scan i samme rækkefølge </h3> <span> (Tryk på <em>Vis mønster</em> knappen for at se mønsteret) </span>';
        
        this.currentPatternPosition = 0;
        this.patternLenght = 2;

        setButton('actionButton', 'Skan', 'inactive');
        setButton('infoButton', 'Vis Mønster', 'active', 'green');
    }


    
    async applyQrCode(QrNumber) {
        let num = Number(QrNumber);
        if (num === this.goalArray[this.currentGoalNumber]) {
            drawClockface();
            drawClockfaceOverlay([currentUser.goalArray[this.currentPatternPosition]], [255, 255, 0]);
            await timer(1000);
            document.getElementById('canvasClockfaceOverlay1').hidden = true;
            if (this.currentPatternPosition < this.patternLenght - 1) {
                this.updateGoal();
                this.currentPatternPosition += 1;
            } else {
                let newDelta = Math.floor(50 * this.patternLenght * booster);
                this.localMana += Number(newDelta);
                updateManaCounters(newDelta);
                
                this.currentPatternPosition = 0;
                this.currentGoalNumber = 0;
                this.patternLenght += 1;
                this.showedPattern = false;
                setButton('infoButton', 'Vis Mønster', 'active', 'green');
                // document.getElementById('infoButton').hidden = false;
                setButton('actionButton', 'Skan', 'hidden');
            }
        } else {
            let oldText = showTextDiv.innerHTML;
            showTextDiv.innerHTML = '<h1> Ups! Start forfra &#x1FAE4; </h1>'; // Smiley :-/
            setTimeout(() => showTextDiv.innerHTML = oldText, 3000);
            await showError(num);  // Show scanned number in red for 2 seconds
            
            this.currentPatternPosition = 0;
            this.currentGoalNumber = 0;
            showPattern(this.patternLenght);
        }
    }
}


class LogicControlsHigh extends LogicEngine {   // Controls for high activity Logic gamemodes
    constructor() {
        super();
        
        setButton('actionButton', 'Skan', 'active', 'green');
    }

    async applyQrCode(QrNumber) {
        let newMana = 200;
        let allText = document.getElementById('showTextDiv');
        let riddle = document.getElementById('riddle');
        if (Number(QrNumber) == 3 && this.answer == 1) {
            this.addMana(newMana);
        } else if (Number(QrNumber) == 7 && this.answer == 2) {
            this.addMana(newMana);
        } else if (Number(QrNumber) == 11 && this.answer == 3) {
            this.addMana(newMana);
        } else if ([3, 7, 11].includes(Number(QrNumber)) && this.answer == '')  {
            showMessage('Skan 0 for næste spørgsmål', 2000)
        } else if (QrNumber === 'center') {
            this.choseARiddle();
        } else if ([1, 2, 4, 5, 6, 8, 9, 10, 12].includes(Number(QrNumber))) {
            showMessage('Kun QR-koderne 3, 7 og 11 kan bruges her', 3000)
        } else {
            riddle.style.color = 'darkorange';
            showMessage(allText.innerHTML + 'Forkert svar. <br>Prøv et nyt spørgsmål :-) <br>', 3000);
            await timer(3000);
            this.choseARiddle();  // choseARiddle, not choseRiddle
        }
    }
    
    async addMana(newMana) {  // TODO: Move a class-level up?
        let riddle = document.getElementById('riddle');
        this.localMana += newMana;
        riddle.style.color = 'cornflowerblue';
        
        updateManaCounters(newMana);
        await timer(2000);
        riddle.style.color = 'darkblue';
        riddle.hidden = true;
        this.answer = '';
        showTextDiv.innerHTML = 'Skan 0 for det næste spørgsmål'
    }
}


class M3T2G2 extends LogicControlsHigh {  // Logik for viderekommende M3 T2
    constructor() {
        super();
        this.gameMode = 'M3T2G2';
        
        this.choseRiddle(3, 0);        
    }
    
    choseARiddle() {
        this.choseRiddle(3, 0);
    }
}


class M3T3G1 extends LogicControlsHigh {  // Logik for viderekommende M3 T3
    constructor() {
        super();
        this.gameMode = 'M3T3G1';

        this.choseRiddle(3, 1);        
    }

    choseARiddle() {
        this.choseRiddle(3, 1);
    }
}

// Game modes above


// class M1T1G1 extends NiffGame {  // 
//     constructor() {
    //         super();
    //         this.gameMode = 'M1T1G1';
    
//     }

//     applyQrCode(QrNumber) {
//     }
// }

const gameModes = {
    'M1T1G1': M1T1G1,  // Healer
    'M1T2G1': M1T2G1,  // Logik for begyndere
    'M1T3G1': M1T3G1,  // Logik for viderekommende
    'M2T1G1' : M2T1G1, // Skan i rækkefølge
    'M2T2G1': M2T2G1,  // Indstil visere digital
    'M2T2G2': M2T2G2,  // Jæger
    'M2T3G1': M2T3G1,  // Indstil visere tekst
    'M2T3G2': M2T3G2,  // Find ord
    'M3T1G1': M3T1G1,  // Skan løs
    'M3T1G2': M3T1G2,  // Følg det viste mønster
    'M3T1G3': M3T1G3,  // Følg mønster efter tal
    'M3T2G1': M3T2G1,  // Gentag mønster
    'M3T2G2': M3T2G2,  // Logik for begyndere
    'M3T3G1': M3T3G1,  // Logik for viderekommende
}


// Eventlisteners
const controller = new AbortController();
const signal = controller.signal;
window.addEventListener('beforeunload', function(event) { event.preventDefault(); }, {signal});

document.getElementById('start').addEventListener('click', startButtonHasBeenClicked);

document.getElementById('solo').addEventListener('click', soloChecboxHasBeenChecked);
document.getElementById('coordinator').addEventListener('click', coordinatorChecboxHasBeenChecked);


document.getElementById('selectRoleContainer').addEventListener('click', 
    function(event) { roleHasBeenClicked(event); }, true);

document.getElementById('goBackButton').addEventListener('click', goBackButtonHasBeenClicked);
document.getElementById('actionButton').addEventListener('click', actionButtonHasBeenClicked);
document.getElementById('action1Button').addEventListener('click', action1ButtonHasBeenClicked);

document.getElementById('infoButton').addEventListener('click', infoButtonHasBeenClicked);

document.getElementById('M1Button1').addEventListener('click', function(event) {currentUser.useAnswer(event)});
document.getElementById('M1Button2').addEventListener('click', function(event) {currentUser.useAnswer(event)});
document.getElementById('M1Button3').addEventListener('click', function(event) {currentUser.useAnswer(event)});

document.getElementById('advanceGameStateButton').addEventListener('click', 
    advanceGameStateButtonHasBeenClicked);

// End of eventlisteners

console.clear();


async function actionButtonHasBeenClicked() {
    let actionButton = document.getElementById('actionButton'); 
    if (!actionButton.classList.contains('inactiveButton')) { // ! not
        switch(actionButton.textContent) {
            case 'Skan':
                if (currentUser.coordinator && gameState === 'shareEndInfo') {
                    canvasQrShow.style.display = 'none';
                }
                setButton('actionButton', 'Stop Skan', 'active', 'red');
                if (gameMode === 'M3T2G1' && gameState == 'firstRound') {
                    setButton('infoButton', infoButton.textContent , 'inactive');
                }
                scanQRcode();
                break;
            case 'Stop Skan':
                setButton('actionButton', 'Skan', 'active', 'green');
                if (gameMode === 'M3T2G1' && gameState == 'firstRound') {
                    setButton('infoButton', infoButton.textContent , 'active', 'yellow');
                }
                await timer(500); // Stopping a scan right after initiation confuses the scanner...
                stopScan();
                break;
        }
    }
}


async function action1ButtonHasBeenClicked() {
let actionButton = document.getElementById('action1Button'); 
    if (!actionButton.classList.contains('inactiveButton')) { // ! not
        switch(actionButton.textContent) {
            case 'Heal':
                setButton('action1Button', 'Stop Healing', 'active', 'red');
                heal();
                break;
            case 'Stop Healing':
                stopHealing();
                setButton('action1Button', 'Heal', 'active', 'green');
                break;
        }
    }
}


function infoButtonHasBeenClicked() {
    if (!infoButton.classList.contains('inactiveButton')) {  // ! not
        switch(infoButton.textContent) {
            case 'Vis Mønster':
                setButton('infoButton', 'Vis Mønster', 'inactive');
                setButton('actionButton', 'Skan', 'inactive');
                showPattern(currentUser.patternLenght);
        }
    }
}
   

function advanceGameStateButtonHasBeenClicked(event) {
    // let advanceGameStateButton = document.getElementById('advanceGameStateButton');
    clearQrCanvas();
    if (coordinator && gameState === 'shareRoleInfo') {
        stopScan();
        
        setButton('goBackButton', 'Tilbage', 'active', 'lightgreen');
        setButton('actionButton', 'Skan', 'hidden');
        setButton('advanceGameStateButton', 'Videre', 'active', 'green');

        participantList.push([id, gameMode]); // Add the coordinators id and gameMode
        
        gameHasHealer = participantList.map(val => val[1]).includes('M1T1G1');  // Healer
        gameHasHunter = participantList.map(val => val[1]).includes('M2T2G2');  // Hunter
        
        let packet = new NiffDataPacket('p');
        endRoundAt = (new Date(new Date().valueOf() + gameTime)).valueOf();  // endRoundAt needs to be set here as a global variable
        packet.era = endRoundAt;
        if (gameHasHealer) {packet.he = 1};
        if (gameHasHunter) {packet.hu = 1};
        
        let gameData = JSON.stringify(packet);
        
        generateQRcode(gameData).append(canvasQrShow);
        canvasQrShow.style.display = 'block';

        showTextDiv.innerHTML = '<h2> Lad de andre deltagere skanne denne QR kode </h2> Og tryk så på <em>Videre</em>';

        gameState = 'shareStartInfo';
        
    } else if (!coordinator && gameState === 'shareRoleInfo') {
        clearQrCanvas();

        showTextDiv.innerHTML = '<h2> Skan tovholderens QR kode </h2>';
        
        setButton('actionButton', 'Skan', 'active', 'green');
        setButton('goBackButton', 'Tilbage', 'active', 'lightgreen');
        setButton('advanceGameStateButton', 'Videre', 'hidden');
        gameState = 'shareStartInfo';
        
    } else if (coordinator && gameState === 'shareStartInfo') {
        clearQrCanvas()
        
        showTextDiv.innerHTML = '';
        
        setButton('advanceGameStateButton', 'Videre', 'hidden');
        firstTradeInterval();
        
    } else if (gameState === 'firstTradeInterval') {
        beginRound();
        
    } else if (coordinator && gameState === 'shareEndInfo') {
        gameState = 'towerOfPower';
        let packet = new NiffDataPacket('f');
        packet.fm = currentUser.globalMana.toString();  // Final mana
        // packet.pl = currentUser.playerList.filter(item => item[0] !== currentUser.id); // (p)articipant(l)ist
        packet.cn = 0;  // Set first chord number
        packet.k = 0;  // Set number of scans while boosting mana in the Tower of Power
        packet.n = participantList.length + Math.floor(1 + Math.random() * participantList.length);  // Set the number of scans to ending of game
        let QRcontent = JSON.stringify(packet);

        generateQRcode(QRcontent).append(canvasQrShow);
        canvasQrShow.style.display = 'block';

        // generateQRcode(QRcontent).append(document.getElementById('canvasQrShow'));
        // document.getElementById('canvasQrShow').style.display = 'block';

        showText('<h3> For at sprede den indsamlede mana skal I nu bygge Kraftens Tårn </h3> <br>' + 
            'Din tavle er i bunden af tårnet indtil alle har modtaget manaen første gang <br>' + 
            'Derefter kommer den øverste tavle i bunden, og du trykker Skan ligesom alle andre'
        );

        setButton('goBackButton', 'Tilbage', 'active', 'lightgreen');
        setButton('actionButton', 'Skan', 'active', 'green');
        setButton('advanceGameStateButton', 'Videre', 'hidden');
        setButton('infoButton', infoButton.textContent , 'hidden');
        
    } else if (!coordinator && gameState === 'shareEndInfo') {
        gameState = 'towerOfPower';
        clearQrCanvas();
        clearEndGameInfo();
        
        showText('<h3> For at sprede den indsamlede mana skal I nu bygge Kraftens Tårn </h3> <br>' +
            'Hold jeres tavler over hinanden med koordinatorens nederst og tryk "Skan" <br>' + 
            'Når den øverste tavle har modtaget manaen flyttes den til bunden af tårnet');
            
        setButton('goBackButton', 'Tilbage', 'active', 'lightgreen');
        setButton('actionButton', 'Skan', 'active', 'green');
        setButton('advanceGameStateButton', 'Videre', 'hidden');
        setButton('infoButton', infoButton.textContent , 'hidden');

        // TODO: Implement a QR code being shown after the coordinators finalScore QR has been scanned

        // if (currentUser.coordinator) {
        //     generateQRcode("Thy shalst be healed!").append(document.getElementById('canvasQrShow'));
        //     document.getElementById('canvasQrShow').style.display = 'block';
        // }
        
    } else if (gameState === 'gameEnded') {
        controller.abort();  // Removes the eventlistner on beforeUnload
        window.location.replace('niff.html')

    } else {
        console.log('AdvanceGameStateButton clicked outside gameflow')
    }
}


function showText(innerHtmlMessage, show) {  // String, bool
    showTextDiv.innerHTML = '';
    let paragraph = document.createElement("p");
    paragraph.innerHTML = innerHtmlMessage;
    showTextDiv.appendChild(paragraph);
    showTextDiv.hidden = show;
}


function rand(max, notThisNumber) {  // Returns a random number between 0 and max (incl), but not notThisNumber
    let randomNumber = notThisNumber;
    do {
        randomNumber = Math.floor(Math.random() * max + 1);
    } while(randomNumber === notThisNumber);
    return randomNumber;
}

function returnMOutOf5(m) {
    m -= 1;
    let array = [0, 1, 2, 3, 4];
    let newArray = [];
    do {
        let i = Math.floor(Math.random() * array.length);
        newArray.push(array[i]);
        array.splice(i, 1);
    } while(m--);
    return newArray;
}


function coinFlip() {
    return Math.floor(Math.random() * 2);
}


function firstTradeInterval() {
    gameState = 'firstTradeInterval';
    location.hash = '#firstTradeInterval';

    setButton('goBackButton', 'Tilbage', 'hidden');
    setButton('advanceGameStateButton', 'Videre', 'active', 'green');
    setButton('actionButton', 'Skan', 'hidden');
    textNode = document.getElementById('firstTradeInfo');
    textNode.hidden = false;
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('I de verdener der åbnes portaler til, ' + 
        'kan der være magiske væsener der angriber dig\n');
    paragraph.appendChild(textContent);
    textNode.appendChild(paragraph);

    // if (!participantList.map(val => val[1]).includes('M2T2G2')) {  // Ingen jæger
    if (!gameHasHunter) {  // Ingen jæger
        // if (participantList.map(val => val[1]).includes('M1T1G1')) {  // Healer
        if (gameHasHealer) {  // Healer
            if (gameMode === 'M1T1G1') {  // If you are the healer, skip buying amulets (It is a T1 and not necessary)
                beginRound();
            } else {
                attackProbability *= 10;
                let paragraph = document.createElement("p");
                let textContent = document.createTextNode('Der er en healer på holdet. Find dem og ' +
                    'skan deres tavle, hvis du bliver angrebet\n');
                paragraph.appendChild(textContent);
                textNode.appendChild(paragraph);
            }
                
        } else {
            let paragraph1 = document.createElement("p");
            let textContent1 = document.createTextNode('Hvis du bliver angrebet, kan du blive healet ved at ' +
                'skanne 0 flere gange\n');
            paragraph1.appendChild(textContent1);
            textNode.appendChild(paragraph1);
        
            let paragraph2 = document.createElement("p");
            paragraph2.setAttribute('id', 'buyAmuletElement')
            let textContent2 = document.createTextNode('Hvis du ikke kan lide tanken om at blive angrebet, ' +
                'kan du bruge lidt mana på at købe en amulet \u{1FAAC} der beskytter mod magiske væsener');
            paragraph2.appendChild(textContent2);
            let button1 = document.createElement('button');
            button1.setAttribute('id', 'buyAmuletButton');
            button1.innerText = ' Køb amulet \u{1FAAC} mod monstre for ' + manaPrice + ' mana ';
            paragraph2.appendChild(button1);
            textNode.appendChild(paragraph2);
            // document.getElementById('buyAmuletButton').hidden = false;
            document.getElementById('buyAmuletButton').addEventListener('click', buyAmuletButtonHasBeenClicked);
            
        }

        let breakEl = document.createElement('br');
        textNode.appendChild(breakEl);
        let paragraph3 = document.createElement('p');
        paragraph3.setAttribute('id', 'buyBoosterElement');
        let word = 'også';
        if (gameHasHealer) {
            word = '';
        }
        let textContent3 = document.createTextNode('Du kan ' + word + ' købe en amulet \u2728 så dine ritualer ' + 
            'samler mere mana ');
        paragraph3.appendChild(textContent3);
        let button2 = document.createElement('button');
        button2.setAttribute('id', 'buyBoosterButton');
        button2.innerText = ' Køb en amulet \u2728 der giver større manaudbytte for ' + boosterPrice + ' mana ';
        paragraph3.appendChild(button2);
        textNode.appendChild(paragraph3);
        document.getElementById('buyBoosterButton').addEventListener('click', buyBoosterButtonHasBeenClicked);
    } else {
        amulet = true;
        let hunter1 = 'en jæger';
        let hunter2 = 'en';
        if (1 < participantList.filter(elem => elem === 'M2T2G2').length) {
            hunter1 = 'jægere';
            hunter2 = 'ne';
        }
        let textContent = document.createTextNode(', men da der er ' + hunter1 + ' på holdet, vil de ' +
            'magiske væsener angribe jæger' + hunter2 + ' i stedet for dig. \n');
        paragraph.appendChild(textContent);
        textNode.appendChild(paragraph);

        let paragraph1 = document.createElement("p");
        let textContent1 = document.createTextNode('En amulet er derfor unødvendig');
        paragraph1.appendChild(textContent1);
        textNode.appendChild(paragraph1);
    }
}


function buyAmuletButtonHasBeenClicked() {
    globalMana -= manaPrice;
    amulet = true;
    // document.getElementById('buyAmuletButton').hidden = true;
    
    let textNode = document.getElementById('firstTradeInfo');
    // textNode.removeChild(textNode.lastChild);
    // textNode.removeChild(textNode.children[2]);
    textNode.removeChild(document.getElementById('buyAmuletElement'));
    
    let textNode1 = document.getElementById('firstTradeResult');
    if (booster === 1.0) {  // No booster
        let hr = document.createElement('hr');
        textNode1.appendChild(hr);
    }
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('\u2022 Du har købt en amulet \u{1FAAC} der beskytter mod ' +
        'magiske væsener');
    paragraph.appendChild(textContent);
    textNode1.appendChild(paragraph);
}
    
    
function buyBoosterButtonHasBeenClicked() {
    globalMana -= boosterPrice;
    booster = 1.1;  // From 100% to 110%
    // document.getElementById('buyBoosterButton').hidden = true;
    
    let textNode = document.getElementById('firstTradeInfo');
    // textNode.removeChild(textNode.children[3]);
    textNode.removeChild(document.getElementById('buyBoosterElement'));
    
    let textNode1 = document.getElementById('firstTradeResult');
    if (!amulet) {
        let hr = document.createElement('hr');
        textNode1.appendChild(hr);
    }
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('\u2022 Du har købt en amulet \u2728 der giver ' 
        + Math.floor((booster - 1) * 100) + '% større manaudbytte');
    paragraph.appendChild(textContent);
    textNode1.appendChild(paragraph);
}


function setUpFunction() {
    document.getElementById('page').style.height = window.innerHeight - 30 + 'px';
    document.getElementById('gameMode').style.height = window.innerHeight - 200 + 'px'; 
    document.getElementById('canvasQrShow').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockface').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockfaceOverlay').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockfaceOverlay1').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockfaceOverlay').width = sizeFactor * winWidth;
    document.getElementById('canvasClockfaceOverlay').height = sizeFactor * winHeight;
    document.getElementById('canvasClockfaceOverlay1').width = sizeFactor * winWidth;
    document.getElementById('canvasClockfaceOverlay1').height = sizeFactor * winHeight;
    document.getElementById('navigationContainer').style.display = 'none';

    document.getElementById('solo').checked = false;
    document.getElementById('coordinator').checked = false;

    sessionStorage.finalManaPacket = 'empty';

    location.hash = '#intro';

    let chord;
    for (var i=0; i<10; i++) {
        chord =  new Audio('qr-codes/chord' + i + '.wav');
        chordList.push(chord);
    }
}


function shuffleArray(array) {
    let len = array.length;
    let j = 1;
    for (var i = array.length - 1; 0 < i; i--) {
        j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ToDO: Change the non-functioning config parameter or incorporate the following line:
// document.getElementsByTagName('video')[0].style.width = "" + sizeFactor * winWidth + "px";


function scanQRcode() {
    html5Qrcode.start({facingMode: "environment"}, config, (decodedText, decodedResult) => {
        console.log('We have got ' + decodedText);
        stopScan();
        useQRcode(decodedText);
    }, (errorMessage) => {
        console.log('Camera says ' + errorMessage);
        // if (document.getElementsByTagName('video')[0]) {
        //     document.getElementsByTagName('video')[0].style.width = "" + sizeFactor * winWidth + "px";  // Ugly hack!
        //     document.getElementsByTagName('video')[0].style.height = "" + sizeFactor * winHeight + "px";  // Ugly hack!
        // }
    }).catch((err) => {
        console.log('Camera failed to start');
    });
}

function stopScan() {
    if (html5Qrcode.getState() === 2) {  // 1 is not-scanning, 2 is scanning
        html5Qrcode.stop().then((ignore) => {
            if (!gameState == 'gameEnded') {
                setButton('actionButton', 'Skan', 'active', 'green');
            }
            console.log('QR scanning stopped');
        }).catch((err) => {
            console.log('QR scanning did not stop for some reason');
        });

        setButton('actionButton', 'Skan', 'hidden');
    }
}


function setButton(button, text, state, colour) {
    let actionButton = document.getElementById(button);
    if (text != '') {
        actionButton.textContent = text;
    }

    actionButton.removeAttribute('class');

    if (state === 'active') {
        actionButton.hidden = false;
        actionButton.classList.add('activeButton');
        actionButton.removeAttribute('disabled');
        
    } else if (state === 'inactive') {
        actionButton.hidden = false;
        actionButton.classList.add('inactiveButton');
        actionButton.setAttribute('disabled', true);
        
    } else if (state === 'hidden') {
        actionButton.hidden = true;
        
    // } else if (state === 'obs') {
    //     button.hidden = false;
        
    //     button.classList.add('obsButton');  // Change colour to red
    } else {
        console.log('Wrong state statement for toggleButton');
    }

    if (['yellow', 'red', 'green', 'lightgreen'].includes(colour)) {
        actionButton.classList.add(colour);
    }
}



let healingDrainTimer = '';

function heal() {
    if (9 < currentUser.localMana || 9 < currentUser.globalMana) {
        stopStopHealingTimeOut = setTimeout(stopHealing, 5000);
        canvasQrShow.style.display = 'block';
        setButton('action1Button', 'Stop Healing', 'active', 'red');
        healingDrainTimer = setInterval(whileHealing, 1000);
    } else {  // If there is no mana, the QR code should not be shown
        whileHealing();
    }
}


function whileHealing() {
    if (10 < currentUser.localMana) {
        let newDelta = 10;
        currentUser.localMana -= Number(newDelta);
        updateManaCounters(newDelta); 
    } else if (9 < currentUser.globalMana) {
        currentUser.globalMana -= 10;
        updateManaCounters();
    } else {
        stopHealing();
        let oldText = showTextDiv.innerHTML;
        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h1> Beklager, der er ikke mere mana <br><br> Skaf ny mana, før du kan heale andre <br> <br> (Skan QR koden \'0\') &#x1F642; </h1>';  // Smiley :-)
        setTimeout(() => {showTextDiv.innerHTML = oldText; showTextDiv.hidden = true}, 3000);
    }
}

function stopHealing() {
    canvasQrShow.style.display = 'none';
    clearInterval(healingDrainTimer);
    clearInterval(stopStopHealingTimeOut);
    setButton('action1Button', 'Heal', 'active', 'green');
}


async function updateManaCounters(newMana) {
    if (newMana) {   // Show animation only if a number is supplied
        let sign  = '';
        let showAddingManaP = document.getElementById('showAddingMana');
        if (0 <= newMana) {sign = '+';}
        showAddingManaP.innerText = sign + newMana;
        showAddingManaP.classList.add('triggerAnimation');
        await timer(1600);
        showAddingManaP.classList.remove('triggerAnimation');
        showAddingManaP.innerText = '';
    }
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score">' + currentUser.localMana + '</span>';
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score">' + currentUser.globalMana + '</span>';
}


async function updateGlobalManaCounters(newMana) {
    if (newMana) {
        let sign  = '';
        let showAddingManaP = document.getElementById('showAddingMana');
        if (0 <= newMana) {sign = '+';}
        showAddingManaP.innerText = sign + newMana;
        showAddingManaP.classList.add('triggerAnimationGlobal');
        await timer(1600);
        showAddingManaP.classList.remove('triggerAnimationGlobal');
        showAddingManaP.innerText = '';
    }
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score">' + currentUser.localMana + '</span>';
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score">' + currentUser.globalMana + '</span>';
}


async function poolMana() {
    let sign  = '';
    // Local mana
    let showAddingManaP = document.getElementById('showAddingMana');
    if (0 <= currentUser.localMana) {sign = '+';}
    showAddingManaP.innerText = sign + currentUser.localMana;
    showAddingManaP.classList.add('triggerAnimationLocalPool');
    await timer(1600);
    showAddingManaP.classList.remove('triggerAnimationLocalPool');
    showAddingManaP.innerText = '';
    
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score"> 0 </span>';
    
    // Global mana
    if (0 <= currentUser.globalMana) {sign = '+';}
    showAddingManaP.innerText = sign + currentUser.globalMana;
    showAddingManaP.classList.add('triggerAnimationGlobalPool');
    await timer(1600);
    showAddingManaP.classList.remove('triggerAnimationGlobalPool');
    showAddingManaP.innerText = '';
    
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score"> 0 </span>';
}


// async function poolGlobalMana() {
//     let sign  = '+';
//     let showAddingManaP = document.getElementById('showAddingMana');
//     if (0 <= currentUser.globalMana) {sign = '+';}
//     showAddingManaP.innerText = sign + currentUser.globalMana;
//     showAddingManaP.classList.add('triggerAnimationGlobalPool');
//     await timer(1600);
//     showAddingManaP.classList.remove('triggerAnimationGlobalPool');
//     showAddingManaP.innerText = '';
    
//     document.getElementById('globalManaCounter').innerHTML = 
//     '<span>Samlet Mana</span> <span class="score"> 0 </span>';
// }


function attackChance() {
    if (!currentUser.amulet && isVictim === 0 && Math.random() < attackProbability) {
        isVictim = 5;  // Requires 5 healing to be well. A healer can do it in one go. Scanning "0" five times works too
        document.getElementById('page').style.background = 'rgba(255, 0, 0, .36)';
        messageDiv.hidden = false;
        showTextDiv.hidden = true;
        if (currentUser.healerParticipates) {
            messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at finde Healeren </p>'
        } else {
            messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at scanne 0 flere gange </p>'
        }
        whileAttackedTimer = setInterval(whileAttacked, 1000);
    }
}


function whileAttacked() {
    currentUser.localMana -= attackedCost;
    updateManaCounters();  // ToDo: what happens when running out of mana? Should the red background deepen/flash before reaching 0? And the player die if doing nothing?
    
    if (isVictim === 0) {
        clearInterval(whileAttackedTimer);
    }
}

function soloChecboxHasBeenChecked() {
    if (document.getElementById('solo').checked) {
        document.getElementById('coordinator').checked = false;
        document.getElementById('timeChooseDiv').hidden = false;
        document.getElementById('timeChooseDiv')[1].checked = true;
        coordinator = false;
        document.getElementById('coordinator').disabled = true;
        document.getElementById('coordinatorSpan').style.color = 'grey';
    } else {
        document.getElementById('timeChooseDiv').hidden = true;
        document.getElementById('coordinator').disabled = false;
        document.getElementById('coordinatorSpan').style.color = 'black';
    }
}


function coordinatorChecboxHasBeenChecked() {
    if (document.getElementById('coordinator').checked) {
        document.getElementById('timeChooseDiv').hidden = false;
        document.getElementById('timeChooseDiv')[1].checked = true;
        document.getElementById('solo').disabled = true;
        document.getElementById('soloSpan').style.color = 'grey';
    } else {
        document.getElementById('timeChooseDiv').hidden = true;
        document.getElementById('solo').disabled = false;
        document.getElementById('soloSpan').style.color = 'black';
    }
}


async function startButtonHasBeenClicked(event) {
    gameTime = 60000 * Number(document.querySelector('input[name="timeChooser"]:checked').value);
    
    if (document.getElementById('coordinator').checked) {
        coordinator = true;
    } else if (document.getElementById('solo').checked) {
        solo = true;  // TODO: Implement solo-mode
    }

    gameState = 'selectRole';
    location.hash = '#selectRole';
    await timer(600);
    document.getElementById('secondInstruction').style.visibility = 'visible';
}


function roleHasBeenClicked(event) {
    gameMode = event.target.id; // Id in the format M3T1G1 for Movement level 3, Thinking level 1 and Game number 1
    console.log(gameMode);
    document.getElementById('navigationContainer').style.display = 'flex';
    
    if (gameMode !== '' && gameMode !== 'selectRoleContainer') {
        
        if (coordinator) {
            scanOthers();
        } else if (!solo) {
            shareRole();
        } else if (gameMode == 'M2T2G2' && !window.DeviceMotionEvent) {  // If Hunter ...
            alert("Din browser understøtter ikke bevægelsesregistrering. Prøv at bruge Firefox eller Chrome eller vælg en anden rolle");
        } else {
            clearQrCanvas()
        
            showTextDiv.innerHTML = '';
            
            setButton('advanceGameStateButton', 'Videre', 'hidden');

            endRoundAt = (new Date(new Date().valueOf() + gameTime)).valueOf();
            location.hash = '#firstTradeInterval';
            firstTradeInterval();
        }
    }
}


function scanOthers() {
    clearQrCanvas();
    id = 1000000;
    showTextDiv.innerHTML = '<h2> Skan de andre deltageres QR koder </h2> Og tryk så på <em>Videre</em>';
    setButton('goBackButton', 'Tilbage', 'hidden');
    setButton('actionButton', 'Skan', 'active', 'green');
    setButton('infoButton', '', 'hidden');
    if (participantList.length == 0) {
        setButton('advanceGameStateButton', 'Videre', 'inactive');
    } else {
        setButton('advanceGameStateButton', 'Videre', 'active', 'green');
    }

    gameState = 'shareRoleInfo';
    location.hash = '#gameMode';
}


function shareRole() {
    id = Math.floor(Math.random() * 1000000);
    let QRcontent = JSON.stringify([id, gameMode]);
    
    generateQRcode(QRcontent).append(canvasQrShow);
    canvasQrShow.style.display = 'block';
    
    showTextDiv.innerHTML = '<h2> Lad tovholderen skanne din QR kode </h2> Og tryk så på <em>Videre</em>';
    setButton('actionButton', 'Skan', 'hidden');

    gameState = 'shareRoleInfo';
    location.hash = '#gameMode';

    setButton('advanceGameStateButton', 'Videre', 'active', 'green');
    setButton('goBackButton', 'Tilbage', 'hidden');
}


function goBackButtonHasBeenClicked() {
    if (coordinator && gameState == 'shareStartInfo') {
        scanOthers();
    } else if (coordinator && gameState == "towerOfPower") {
        collectFinalMana();
    } else if (!solo && gameState == "towerOfPower") {
        showFinalMana();
    } else if (!solo && gameState == "shareStartInfo") {
        shareRole();
    }
}


function isRoundOver() {
    let now = new Date();
    if (endRoundAt < now) {
        endGame();
    } else {
        let progressValue = (endRoundAt - now) / gameTime * 100;
        document.getElementById('progressBar').setAttribute("value", progressValue);
        if (progressValue < 30) {
            document.getElementById('progressBar').style.setProperty('--progressBarColour', 'gold');
            if (progressValue < 15) {
                document.getElementById('progressBar').style.setProperty('--progressBarColour', 'red');
            }
        }
    }
}


function beginRound() {
    gameState = 'firstRound';
    location.hash = '#gameMode'; // Adjust layout to game mode
    
    document.getElementById('progressBar').style.width = 0.9 * winWidth + 'px';
    document.getElementById('progressBar').setAttribute("max", "100");
    document.getElementById('progressBar').setAttribute("value", "100");
    document.getElementById('progressBar').style.setProperty('--progressBarColour', 'green')
    document.getElementById('progressBarContainer').hidden = false;
    isRoundOverTimer = setInterval(isRoundOver, 1000);

    setButton('advanceGameStateButton', 'Videre', 'hidden');
    document.getElementById('firstTradeInfo').innerHTML = '';
    document.getElementById('firstTradeResult').innerHTML = '';
    document.getElementById('showTextDiv').innerHTML = '';
    document.getElementById('firstTradeInterval').hidden = true;
    
    document.getElementById('globalManaCounter').style.visibility = 'visible';
    document.getElementById('localManaCounter').style.visibility = 'visible';
    document.getElementById('QrContainer').hidden = false;
    
    // If healer --> sligthly more risk of monsters
    let gameModeClass = gameModes[gameMode];
    currentUser = new gameModeClass();
    currentUser.id = id;
    currentUser.globalMana = globalMana;
    currentUser.localMana = localMana;
    // currentUser.playerList = participantList;  // Unnecessary as only the coordinator needs the playerlist
    currentUser.coordinator = coordinator;
    currentUser.gameHasHealer = gameHasHealer;
    currentUser.gameHasHunter = gameHasHunter;
    
    if (amulet) {
        document.getElementById('amulet').hidden = false;
        currentUser.amulet = amulet;
    }
    if (booster != 1.0) {
        document.getElementById('booster').hidden = false;
        currentUser.booster = booster;
    }

    updateManaCounters();


    attackTimer = setInterval(attackChance, 10000);
}


function endGame() {
    clearInterval(isRoundOverTimer);
    clearInterval(attackTimer);
    document.getElementById('progressBarContainer').hidden = true;
    document.getElementById('canvasClockface').hidden = true;
    document.getElementById('canvasClockfaceOverlay').hidden = true;
    document.getElementById('canvasClockfaceOverlay1').hidden = true;
    document.getElementById('booster').hidden = true;
    document.getElementById('amulet').hidden = true;
    document.getElementById('infoButton').hidden = true;
    document.getElementById('action1Button').hidden = true;
    document.getElementById('canvasStack').style.display = 'none';
    
    gameState = 'shareEndInfo';
    location.hash = '#gameMode'; // Needs to use the same display options as gameMode
    
    clearQrCanvas()
    
    if (coordinator) {
        collectFinalMana();
    } else if (!solo) {
        showFinalMana();
    } else {
        textNode = document.getElementById('showTextDiv');
        textNode.innerHTML = '';
        textNode.hidden = false;
        let paragraph = document.createElement("p");
        paragraph.innerHTML = 'Skan 0 flere gange for at forstærke manaen og sende den ud over hele Niff';
        textNode.appendChild(paragraph);
    }
}


function collectFinalMana() {
    clearQrCanvas()
    showTextDiv.innerHTML = '<h2> Skan de andre deltageres QR koder for at samle deres mana </h2> Og tryk så på <em>Videre</em>';
    setButton('goBackButton', 'Tilbage', 'hidden');
    setButton('actionButton', 'Skan', 'active', 'green');
    if (participantList.length == 0) {
        setButton('advanceGameStateButton', 'Videre', 'inactive');
    } else {
        setButton('advanceGameStateButton', 'Videre', 'active', 'green');
    }

    gameState = 'shareEndInfo';
}


function showFinalMana() {
    document.getElementById('showTextDiv').hidden = true;  // Turn off old messages. Something of a hack...
    setButton('goBackButton', 'Tilbage', 'hidden');
    setButton('advanceGameStateButton', 'Videre', 'active', 'green');
    setButton('actionButton', 'Skan', 'hidden');
    if (currentUser.localMana == 0) {
        currentUser.localMana = 10;
    }
    
    let packet = new NiffDataPacket('s');
    if (sessionStorage.finalManaPacket == 'empty') {
        packet.sc = (Number(currentUser.globalMana) + Number(currentUser.localMana)).toString();  // (sc)ore
        sessionStorage.finalManaPacket = JSON.stringify(packet);
    }
    let QRcontent = sessionStorage.finalManaPacket;  // Should be stringified above at creation
    poolMana();
    
    generateQRcode(QRcontent).append(canvasQrShow);
    canvasQrShow.style.display = 'block';
    
    textNode = document.getElementById('endGameInfo');
    textNode.hidden = false;
    let paragraph = document.createElement("p");
    paragraph.innerHTML = 'Lad koordinatoren skanne din tavle for at ' + 
    'samle holdets mana\n - og tryk så <em>Videre</em>';
    textNode.appendChild(paragraph);

    gameState = 'shareEndInfo';
}


function showWord(currentMainWord) {
    drawClockface();

    document.getElementById('canvasStack').style.display = 'block';
    let canvasClockfaceOverlay = document.getElementById('canvasClockfaceOverlay');
    let canvasClockfaceOverlay1 = document.getElementById('canvasClockfaceOverlay1');  // Necessary to set size here
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.hidden = false;
    canvasClockfaceOverlay.width = sizeFactor * winWidth;
    canvasClockfaceOverlay.height = sizeFactor * winHeight;
    canvasClockfaceOverlay1.hidden = false;
    canvasClockfaceOverlay1.width = sizeFactor * winWidth;
    canvasClockfaceOverlay1.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);
    
    let r = 10;
    let shrink = 0.8    ;
    let offset = 0.11 * sizeFactor * winHeight;
    let character = '';
    drawArea.strokeStyle = "blue";
    drawArea.font = '20Px serif';
    drawArea.beginPath();
    for (const [i, coor] of Object.entries(clockFaceCoor)) {
        if (0 < i) {
            let xc = Math.floor(coor[0]);
            let yc = Math.floor(coor[1]);  // Minus 130 to flip coordinate system to programmer style with y-axis downwards
            drawArea.moveTo(xc + r, yc);  // Add radius to avoid drawing a horizontal radius
            drawArea.arc(xc, yc, r, 0, 2*pi);
            drawArea.stroke();
            character = currentMainWord[i - 1];
            // if (i < 12) {
            // } else if (i == 12) {  // i is '12' so == is needed, not ===
            //     character = anagramArray[wordIndex][0][0];
            // }
            drawArea.fillText(character, shrink * xc + offset, shrink * yc + offset + 8);
        }
    }
}


async function showPattern(patternLenght){
    drawClockface();
    await timer(500);
    for (var i = 0; i < patternLenght; i++) {
        drawClockface();
        drawClockfaceOverlay([currentUser.goalArray[i]], [0, 255, 0]);
        await timer(1000);
    }
    document.getElementById('canvasClockfaceOverlay1').hidden = true
    if (currentUser.showedPattern) {
        currentUser.localMana -= showPatternAgainCost;
        updateManaCounters(-showPatternAgainCost);
    } else {
        currentUser.showedPattern = true;
    }
    setButton('infoButton', 'Vis Mønster', 'active', 'yellow');
    setButton('actionButton', 'Skan', 'active', 'green');
}


async function showError(number) {  // Blink number red two times
    drawClockface();
    await timer(300);
    drawClockface();
    drawClockfaceOverlay([number], [255, 0, 0]);
    await timer(300);
    drawClockface();
    drawClockfaceOverlay([number], [255, 255, 255]);
    await timer(300);
    drawClockface();
    drawClockfaceOverlay([number], [255, 0, 0]);
    await timer(300);
    drawClockface();
    drawClockfaceOverlay([number], [255, 255, 255]);
    await timer(300);
    document.getElementById('canvasClockfaceOverlay').hidden = true;
}


function useQRcode(QrNumber) {
    let deStringify = () => {try {return JSON.parse(QrNumber);} catch {return QrNumber; }};
    QrNumber = deStringify();
    if (-1 < QrNumber && QrNumber < 13) {
        currentUser.applyQrCode(QrNumber);
    } else if (isVictim !== 0 && -1 < QrNumber && QrNumber < 13) {
        showTextDiv.hidden = true;
        messageDiv.innerHTML = '<p> Du er skadet og skal heales før du kan andet <br> Find en Healer eller scan 0 flere gange </p>'
    
    } else if (QrNumber === 'center' && ['M1T1G1', 'M2T3G2', 'M3T2G2', 'M3T3G1'].includes(currentUser.gameMode) && isVictim === 0) { // The healer can scan 0 for mana. Logic needs it for new riddle
        currentUser.applyQrCode(QrNumber);

    } else if (isVictim !== 0  && QrNumber === 'center') {  // Non-healers can scan 0 five times to get healed
        isVictim -= 1;  // Heal a little
        if (isVictim < 0.00001) {
            isVictim = 0;
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
            showTextDiv.hidden = false;
        }
        document.getElementById('page').style.background = 'rgba(255, 0, 0, '+ isVictim / 14 + ')';
        messageDiv.innerHTML = '<p> ' + healMsgs[isVictim] + ' <br> Scan 0 igen</p>' 
        
    } else if (isVictim !== 0  && QrNumber === 'Thy shalst be healed!') {
        isVictim = 0;  // Heal fully
        document.getElementById('page').style.background = 'white';
        messageDiv.innerHTML = '';
        messageDiv.hidden = true;
        showTextDiv.hidden = false;
        
    } else if (coordinator && /M\dT\dG\d/.test(QrNumber[1])) {  // If game ID is scanned it implies that you are the coordinator...
        participantList.push(QrNumber);
        setButton('advanceGameStateButton', 'Videre', 'active', 'green');
        
    } else if (QrNumber.pt == 'p') {  // (p)articipants
        endRoundAt = (new Date(QrNumber.era)).valueOf();
        if (QrNumber.he == 1) {gameHasHealer = true};
        if (QrNumber.hu == 1) {gameHasHunter = true};
        firstTradeInterval();

    } else if (coordinator && QrNumber.pt === 's') {  // (s)core
        // TODO: Need a visual clue for adding coordinator mana to pool?
        currentUser.globalMana += currentUser.localMana;  // Add coordinators mana to pool.
        currentUser.localMana = 0;

        updateGlobalManaCounters(QrNumber.sc);   // (sc)ore
        currentUser.globalMana += Number(QrNumber.sc);

        // participantList = participantList.filter(item => item[0] !== QrNumber.id);  // This kills the coordinators participantlist, but it is backed up in currentUser.playerList

        setButton('advanceGameStateButton', 'Videre', 'active', 'green');

    } else if (QrNumber.pt == 'f') {  // (f)inalMana
        // Share the final mana

        playChord(QrNumber.cn);
        QrNumber.cn += 1;
        QrNumber.cn %= 10;

        QrNumber.k += 1;

        console.log(QrNumber.k, QrNumber.n);

        if (QrNumber.k <= QrNumber.n) {
            clearQrCanvas();
            let QRcontent = JSON.stringify(QrNumber);

            generateQRcode(QRcontent).append(canvasQrShow);
            canvasQrShow.style.display = 'block';
        } else {
            showEndScreen(true);
        }

        setButton('actionButton', 'Skan', 'active', 'green');
        
        // if (0 < QrNumber.pl.length) {  // First a round spreading the final score  // (p)articipant(l)ist
        //     currentUser.globalMana = QrNumber.fm;
        //     currentUser.localMana = 0;  // TODO: Move this to when the useres share their mana?
        //     QrNumber.pl = QrNumber.pl.filter(item => item[0] !== currentUser.id); // (p)articipant(l)ist
        //     clearQrCanvas();
            
        //     if ( QrNumber.pl.length === 0) {  // (p)articipant(l)ist
        //         // QrNumber.gameOver = true;
        //         endGameAt = (new Date(new Date().valueOf() + Math.random() * 45000 + 30000)).valueOf();  // endGameAt is a global variable that needs to be set
        //         QrNumber.era = endGameAt;  // The NiffDataPacket's endRoundAt (era) is reused as endGameAt here. Bad practice?
        //     }

        //     let QRcontent = JSON.stringify(QrNumber);

        //     generateQRcode(QRcontent).append(canvasQrShow);
        //     canvasQrShow.style.display = 'block';

        // } else {
        //     clearQrCanvas();
        //     let QRcontent = JSON.stringify(QrNumber);

        //     generateQRcode(QRcontent).append(canvasQrShow);
        //     canvasQrShow.style.display = 'block';

        //     endGameAt = (new Date(QrNumber.era)).valueOf();
        //     isGameOverTimer = setInterval(showEndScreen, 1000);
        // }

    } else if (solo  && QrNumber === 'center') {
        soloEndScans -= 1;
        if (soloEndScans < 1) {
            showEndScreen(true);
        }

    } else if (QrNumber === 'gameOver') {
        showEndScreen(false);
    } else {
        showMessage('<p> Denne QR kode er dårlig magi! <br> Scan en anden </p>', 3000);
    }
}

async function honk() {
    let sound = new Audio('qr-codes/elephant-triumph-sfx-293300.mp3');
    sound.play();
}


function playChord(n) {
    chordList[n].play();
}


function chime() {
    let sound = new Audio('qr-codes/chime-hall-reverb-soft-2_99bpm_G_minor.wav');
    sound.play();
    // navigator.vibrate(200);  // Just to test it. Will not work in Firefox :-/ TODO: Seems to not work in Chrome
}


function showEndScreen(chimeNow) {
    // let now = new Date();
    // if ((endGameAt < now) || solo) {
    // }
    // stopScan();
    clearInterval(isGameOverTimer);
    clearQrCanvas();
    setButton('goBackButton', 'Tilbage', 'hidden');
    setButton('action1Button', 'Skan', 'hidden');
    setButton('actionButton', 'Skan', 'hidden');
    setButton('infoButton', '', 'hidden');
    setButton('advanceGameStateButton', 'Slut', 'active', 'green');
    showText('<h3> Manaen er spredt! </h3> <br> <h3> Game over </h3>', false);  // False --> .hidden = false
    gameState = 'gameEnded';
    if (chimeNow) {chime();}
    
    clearQrCanvas();
    let QRcontent = 'gameOver';
    generateQRcode(QRcontent).append(canvasQrShow);
    canvasQrShow.style.display = 'block';
}


function showMessage(text, time) {
    messageDiv.innerHTML = text;
    messageDiv.hidden = false;
    showTextDiv.hidden = true;
    
    // Then remove message after 'time' seconds
    msgTimeOut = setTimeout(function () {
        messageDiv.innerHTML = '';
        messageDiv.hidden = true;
        showTextDiv.hidden = false;
    }, time);
}


function clearEndGameInfo() {
    let endGameInfo = document.getElementById('endGameInfo');
    if (endGameInfo.firstChild) {
        endGameInfo.innerHTML = '';
    }
}


function clearQrCanvas() {
    if (canvasQrShow.firstChild) {
        canvasQrShow.removeChild(canvasQrShow.firstChild);
    }
    canvasQrShow.style.display = 'none';
}


// DRAWING BELOW

// Draw on cameraOverlay
function drawOnCameraOverlay(xPos, yPos) {  // TODO: Draw on qr-canvas instead? Gets rid of positioning problems. Have to check if camera is active, but whatevs...
    let cameraOverlay = document.getElementById('canvasCameraOverlay');
    cameraOverlay.hidden = false;
    let drawArea = cameraOverlay.getContext('2d');
    let img = new Image;
    img.src = 'qr-codes/foe1.png';
    cameraOverlay.width = sizeFactor * winWidth;
    cameraOverlay.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    img.onload = () => { drawArea.drawImage(img, xPos, yPos); };

    drawArea.beginPath();
    drawArea.rect(0, 0, sizeFactor * winWidth, sizeFactor * winHeight);
    drawArea.stroke();

    // drawArea.moveTo(winWidth / 2 + 50, winHeight / 2);
    // drawArea.arc(winWidth / 2, winHeight / 2, 50, 0, 2*pi);  // Draw disk-monster... Camera position needst to be changed to absolute after camera is started.
    // drawArea.fill();
}

function monsterMovement() {
    drawOnCameraOverlay(xPos = 0, yPos = 0);
}


// Draw clockface    TODO: Make colour gradients instead of arcs
function drawClockface() {
    // Find and show Clockface
    let canvasClockface = document.getElementById('canvasClockface');
    canvasClockface.hidden = false;
    let drawArea = canvasClockface.getContext("2d");
    canvasClockface.width = sizeFactor * winWidth;
    canvasClockface.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    let r = 10;
    let offset = 3;
    drawArea.strokeStyle = "blue";
    drawArea.beginPath();
    for (const [i, coor] of Object.entries(clockFaceCoor)) {
        let xc = Math.floor(coor[0]);
        let yc = Math.floor(coor[1]);  // Minus 130 to flip coordinate system to programmer style with y-axis downwards
        drawArea.moveTo(xc + r, yc);  // Add radius to avoid drawing a horizontal radius
        drawArea.arc(xc, yc, r, 0, 2*pi);
        drawArea.stroke();
        if (9 < Number(i)) {offset = 7}
        drawArea.fillText(i, xc - offset, yc + 3);
    }
}

function drawClockfaceOverlay(numbers, rgb) {  // numbers is an array with the numbers that should be painted
    // drawClockface();  // <--- Moved before function call to make multiple drawings possible

    // Find and show ClockfaceOverlay
    document.getElementById('canvasStack').style.display = 'block';
    let canvasClockfaceOverlay1 = document.getElementById('canvasClockfaceOverlay1');
    canvasClockfaceOverlay1.hidden = false;
    let drawArea = canvasClockfaceOverlay1.getContext("2d");
    canvasClockfaceOverlay1.width = sizeFactor * winWidth;
    canvasClockfaceOverlay1.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    if (numbers) {
        for (number of numbers) {
            let r = 10;
            let offset = 3;
            if (number) {
                let xc = Math.floor(clockFaceCoor[number][0]);
                let yc = Math.floor(clockFaceCoor[number][1]);
                const radgrad3 = drawArea.createRadialGradient(xc - 4, yc - 4, 1, xc, yc, r); // Red sphere
                radgrad3.addColorStop(0, 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ',.3)');
                radgrad3.addColorStop(0.5, 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')');
                radgrad3.addColorStop(0.9, 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')');
                radgrad3.addColorStop(1, 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 0)');
                drawArea.fillStyle = radgrad3;
                drawArea.fillRect(xc-r, yc -r, 2 * r, 2 * r)
        
                // drawArea.moveTo(xc + r, yc);
                // drawArea.arc(xc, yc, r, 0, 2*pi);
                // drawArea.fillStyle = "red";
                // drawArea.fill();
                if (9 < Number(number)) {offset = 7}
                drawArea.fillStyle = "black";
                drawArea.fillText(number, xc - offset, yc + 3);
            }
        }
    }

}


function drawClockHandOnOverlay(smallHandNum, sFill, bigHandNum, bFill) {
    drawClockface();
    // Find and show ClockfaceOverlay
    document.getElementById('canvasStack').style.display = 'block';
    let canvasClockfaceOverlay = document.getElementById('canvasClockfaceOverlay');
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = sizeFactor * winWidth;
    canvasClockfaceOverlay.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    for (let i = 0; i < 2; i++) {
        if (i === 0) {
            handSize = 0.5;
            number = smallHandNum;
        } else {
            handSize = 1;
            number = bigHandNum;
        }

        let xNum = clockFaceCoor[number][0];
        let yNum = clockFaceCoor[number][1];
        let xc = clockFaceCoor[0][0];
        let yc = clockFaceCoor[0][1];
        let handVec = vecAB([xc, yc], [xNum, yNum]);
        let handVecHatNorm = unitVector(hatVector(handVec));
        let xt = handVecHatNorm[0];
        let yt = handVecHatNorm[1];
    
        // Transform coordinates back into the unit circle, resize clock hand and transform back
        let xh = ((xNum  - 150) / 130 * handSize) * 130 + 150; 
        let yh = ((yNum - 150) / 130 * handSize) * 130 + 150;
    
        drawArea.beginPath();
        drawArea.moveTo(xc + 5 * xt, yc + 5 * yt);
        drawArea.lineTo(xh, yh);
        drawArea.lineTo(xc - 5 * xt, yc - 5 * yt);
        if ((i === 0 && sFill) || (i === 1 && bFill)) {
            drawArea.fill();
        } else {
            drawArea.closePath();
            drawArea.stroke();
        }
    }
}


class NiffPuzzle {
    constructor() {
        this.pieces = [];
        this.usedRimAnchors = [1];  // TODO: Oups. Currently anchors is numbers around the clock. Refactor to make them coordinates
        this.potentialAnchors = [];  // Hmm. A lot of debugging needed. Remember: rap = new NiffPuzzle(); drawPuzzle(rap) to test puzzle in browser

        this.generatePieces();
    }
    

    generatePieces() {
        let firstAnchor;
        let nextAnchor;
        for (var n = 1; n < 6; n++) {  // Ouch. Still confusion if clockposition numbers or coordinates are being used...
            const bigPiece = Math.random();
            if (0 < this.potentialAnchors.length && bigPiece < 0.9) {
                firstAnchor = this.potentialAnchors[1];
            } else {
                firstAnchor = this.usedRimAnchors[this.usedRimAnchors.length - 1];
                nextAnchor = firstAnchor + Math.floor(Math.random() * 2 ) + 2;
                this.usedRimAnchors.push(nextAnchor);
            }
            // nextAnchor = firstAnchor + Math.floor(Math.random() * 3) + 1;
            const currentPuzzlePiece = new NiffPuzzlePiece(n, this, clockFaceCoor[firstAnchor], clockFaceCoor[nextAnchor]);
            this.pieces.push(currentPuzzlePiece);

            const centerAndAngles = getCenterAndAngles(clockFaceCoor[firstAnchor][0], clockFaceCoor[firstAnchor][1], 130);
            this.potentialAnchors.push(centerAndAngles.Ma);
            this.potentialAnchors.push(centerAndAngles.MaL);
            this.potentialAnchors.push(centerAndAngles.MaR);
            this.potentialAnchors.push(this.usedRimAnchors[this.usedRimAnchors.length - 1] + 1);
            this.potentialAnchors.push(this.usedRimAnchors[this.usedRimAnchors.length - 1] + 2);
            this.potentialAnchors.push(this.usedRimAnchors[this.usedRimAnchors.length - 1] + 3);
        }
    }
}

class NiffPuzzlePiece {
    constructor(pieceID, puzzle, firstAnchor, nextAnchor) {
        this.pieceID = pieceID;
        this.puzzle = puzzle;
        this.anchors = [firstAnchor, nextAnchor];
        this.possibleNewAnchors = [];
        
        this.puzzle.usedRimAnchors.push(nextAnchor);

        this.anchors.push(nextAnchor, firstAnchor);
    }
}

class NiffArc {
    constructor(cx, cy, R, v1, v2, A, B, Ma, MaL, MaR) {
        this.cx = cx; // Center x coordinate
        this.cy = cy; // Center y coordinate
        this.R = R; // Radius of the arc
        this.v1 = v1; // First angle with x-axis
        this.v2 = v2; // Second angle with x-axis
        this.A = A; // Coordinates for the first endpoint of the arc
        this.B = B; // Coordinates for the second endpoint of the arc
        this.Ma = Ma;  // Coordinates for center of arc
        this.MaL = MaL; // Coordinates for the center of the left part of the arc
        this.MaR = MaR; // Coordinates for the center of the right part of the arc
    }
}

function drawPuzzle(puzzle) {
    drawClockface();
    let canvasClockfaceOverlay = document.getElementById('canvasClockfaceOverlay');
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = sizeFactor * winWidth;
    canvasClockfaceOverlay.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);
    
    
    for (var [index, puzzlePiece] of puzzle.pieces.entries()) {
        drawArea.beginPath();
        drawArea.fillStyle = ['red', 'blue', 'green', 'yellow', 'magenta'][index];
        for (var i = 0; i < puzzlePiece.anchors.length; i += 2) {
            let anch1 = puzzlePiece.anchors[i];
            let anch2 = puzzlePiece.anchors[i + 1];
            let arc = getCenterAndAngles(anch1[0], anch1[1], 130);
            drawArea.moveTo(anch2[0], anch2[1]);
            // drawArea.moveTo(clockFaceCoor[anch2][0], clockFaceCoor[anch2][1]);
            drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
        }
        drawArea.fill();
    }
    
    // drawArea.stroke();

    // let arc = getCenterAndAngles(clockFaceCoor[A], clockFaceCoor[B], 130);
    // drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
    // for (var n = -15; n < 21; n+=5) {
    //     // drawArcOnOverlay(arc.cx, arc.cy, arc.R, arc.v1, arc.v2, drawArea)    
    //     drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
    // }

    // drawArea.fill();
}


function drawArcOnOverlay(cx, cy, R, v1, v2, drawArea) {
    drawClockface();
    // Find and show ClockfaceOverlay
    // let canvasClockfaceOverlay = document.getElementById('canvasClockfaceOverlay');
    // canvasClockfaceOverlay.hidden = false;
    // let drawArea = canvasClockfaceOverlay.getContext("2d");
    // canvasClockfaceOverlay.width = sizeFactor * winWidth;
    // canvasClockfaceOverlay.height = sizeFactor * winHeight;
    // drawArea.scale(zoomFactor, zoomFactor);

    drawArea.beginPath();
    drawArea.arc(cx, cy, R, v1, v2);
    drawArea.stroke();
}


function getCenterAndAngles(A, B, R) {  // Return the center and the two angles necessarty for drawing an arc defined by its endpoints A[xa, ya] and B[xb, yb] and radius R
    // if (typeof(A) === "number") {
    //     A = clockFaceCoor[A];  // Bad practice to allow two input formats, I know, I know, but it saves a lot of lines and makes testing way easier ...
    //     B = clockFaceCoor[B];
    // }
    let distAB = dist(A, B);
    if (R < distAB / 2) {R = distAB / 2 + 1; console.log('Radius too small. R set to ' + R)};
    let distABtoC = Math.sqrt(R * R - (distAB/2) * (distAB/2));
    let AB = vecAB(A, B);
    let hatAB = hatVector(AB);
    let M = midPoint(A, B);  // Also the vector from (0, 0) to M
    let C = subtractVector(M, scalarMult(unitVector(hatAB), distABtoC));
    let CA = vecAB(C, A);
    let CB = vecAB(C, B);
    let i = [1, 0];  // Unit vector along x-axis
    angleACO = Math.acos(dotProd(CA, i)/(vectorLength(CA)*vectorLength(i))); // The angle between the x-axis and the first vector
    angleBCO = Math.acos(dotProd(CB, i)/(vectorLength(CB)*vectorLength(i)));  // The angle between the x-axis and the second vector
    if (A[1] < C[1]) {
        angleACO = 2 * pi - angleACO;
    } 
    if (B[1] < C[1]) {
        angleBCO = 2 * pi - angleBCO;
    }

    let angleSpan = angleACO - angleBCO;
    let Ma = [C[0] + R * Math.cos(angleSpan/2 + angleBCO), C[1] + R * Math.sin(angleSpan/2 + angleBCO)];
    let MaL = [C[0] + R * Math.cos(3 * angleSpan/4 + angleBCO), C[1] + R * Math.sin(3 * angleSpan/4 + angleBCO)];
    let MaR = [C[0] + R * Math.cos(angleSpan/4 + angleBCO), C[1] + R * Math.sin(angleSpan/4 + angleBCO)];

    let arc = new NiffArc(C[0], C[1], R, angleBCO, angleACO, A, B, Ma, MaL, MaR);
    
    return arc;
}


// Functions for vector manipulation
function dist(A, B) {  // Returns the distance between two points A[xa, ya] and B[xb, yb]
    return Math.sqrt((A[0] - B[0])*(A[0] - B[0]) + (A[1] - B[1])*(A[1] - B[1]));
}


function midPoint(A, B) {  // Returns the midpoint between point A[xa, ya] and B[xb, yb]
    return [(A[0] + B[0])/2, (A[1] + B[1])/2];
}


function vecAB(A, B) {  // Returns the vector from point A[xa, ya] to point B[xb, yb]
    return [B[0] - A[0], B[1] - A[1]];
}

function subtractVector(B, A) {  // Return vector A[xa, ya] subtracted from B[xb, yb]
    return [B[0] - A[0], B[1] - A[1]];
}


function hatVector(A) {  // Return a vector orthogonal on vector A[x,y] rotated 90 degrees
    return [-A[1], A[0]];
}


function vectorLength(A) {
    return Math.sqrt(A[0] * A[0] + A[1] * A[1]);
}

function unitVector(A) {  // Return a unitvector in the direction of vector A[x,y]
    lenA = vectorLength(A);
    return [A[0]/lenA, A[1]/lenA];
}


function scalarMult(A, k) { // Returns a vector A[x, y] multiplied with a scalar k
    return [A[0] * k, A[1] * k];
}


function dotProd(A, B) {  // Returns the dot product between vector A[xa, ya] and B[xb, yb]
    return A[0] * B[0] + A[1] * B[1];
}


// DRAWING ABOVE

// QR-code generator
function generateQRcode(text) {
    let responseQRcode = new QRCodeStyling({
        width: sizeFactor * winWidth,
        height: sizeFactor * winHeight,
        type: "svg",
        data: text,
        image: "qr-codes/fairy.png",
        dotsOptions: {
            color: "000",
            type: "squrare"
        },
        imageOptions:{
            crossOrigin: "anonymous",
            margin: 20
        }
    });

    console.log('Generated QR code: ' + text);

    return responseQRcode;
}



// let result = html5Qrcode.start({facingMode: "environment"}, config, qrCodeHasBeenRead);

// // QR-code reader
// function grabQRcode() {
//     const html5Qrcode = new Html5Qrcode("reader");
//     const config = {fps: 10, qrbox: {width: 300, height: 300}};
//     const qrCodeHasBeenRead = (decodedText, decodedResult) => {
//         console.log(`Code matched = ${decodedText}`, decodedResult);
//         let readerDiv = document.getElementById('readerDiv');
//         let content = document.createTextNode(decodedText);
//         readerDiv.appendChild(content);

//         html5Qrcode.stop().then((ignore) => {
//             console.log('QR scanning stopped');
//         }).catch((err) => {
//             console.log('QR scanning did not stop for some reason');
//         })
//     }

//     let result = html5Qrcode.start({facingMode: "environment"}, config, qrCodeHasBeenRead);
    
//     return result;
// }


// function onScanSuccess(decodedText, decodedResult) {
//     // handle the scanned code as you like, for example:
//     console.log(`Code matched = ${decodedText}`, decodedResult);
//     let outputDiv = document.getElementById('output');
//     let content = document.createTextNode(decodedText);
//     outputDiv.appendChild(content);
// }

// function onScanFailure(error) {
//     // handle scan failure, usually better to ignore and keep scanning.
//     // for example:
//     console.warn(`Code scan error = ${error}`);
// }


// document.getElementById('firstButton').addEventListener('click', function() {
//     let html5QrcodeScanner = new Html5QrcodeScanner(
//         "reader", { fps: 10, qrbox: {width: 250, height: 250} }, /* verbose= */ false);
//     html5QrcodeScanner.render(onScanSuccess, onScanFailure);
// });

// For debugging purposes:
function scanCoordinator() {
    let packet = new NiffDataPacket('p');
    // packet.participantList = [[12345, 'M2T2G1'], [56789, 'M3T2G1'], [98765, 'M3T1G2'], [54321, 'M3T1G1']];
    packet.era = (new Date(new Date().valueOf() + gameTime)).valueOf();
    useQRcode(JSON.stringify(packet));
}

function scanSeveralParticipants() {
    useQRcode([10000, 'M1T1G1'])
    useQRcode([12345, 'M2T2G1'])
    useQRcode([56789, 'M3T2G1'])
    useQRcode([98765, 'M3T1G2'])
    useQRcode([54321, 'M3T1G1'])
}

// Rainbow 
// document.getElementsByTagName('body')[0].style.background = 'rgb(' + [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)].join(',') + ')';

function coordinatorScansAllAtTheEnd() {
    let packet = new NiffDataPacket('s');
    // for (var i=0; i<currentUser.playerList.length; i++) {
    //     packet.id = currentUser.playerList[i][0];
    //     packet.score = (Math.floor(1000*Math.random())).toString();
    // }
    packet.sc = 5000;
    useQRcode(JSON.stringify(packet));
}

function reload() {
    window.location.reload();
}

function videre() {
    document.getElementById('advanceGameStateButton').click();
}

function jumpToEndgame() {
    videre(); scanCoordinator(); videre(); endGame();
}

function jumpToEndgameCoordinator() {
    scanSeveralParticipants(); videre(); videre(); videre(); endGame();
}