// ---------- Data ----------
const TABS = [
  { i:0, num:'1', name:'Τί ἐστί',             translit:'Ti estì',              italian:"Che cos'è?" },
  { i:1, num:'2', name:'Ἔλεγχος',             translit:'Elenchos',             italian:'Messa alla prova' },
  { i:2, num:'3', name:'Ἀναγωγή',             translit:'Anagoghè',             italian:"Condurre verso l'alto" },
  { i:3, num:'4', name:'Μαιευτικὴ τέχνη',     translit:'Maieutikè téchne',     italian:'Arte maieutica' },
  { i:4, num:'5', name:'Ἀπορία καὶ κάθαρσις', translit:'Aporìa kaì kátharsis', italian:'Vicolo cieco e purificazione' },
];

const PW = { 1:'maccu', 2:'mossardi', 3:'la giugola', 4:'la luce traspira' };

const CHALLENGES = [
  { pin:'5835', text:'Dai 5 baci di fila a Maya.' },
  { pin:'9251', text:"Fai andare Maccu al piano -1 o all'ultimo piano (dipende da dove si trova) senza mai toccarlo." },
  { pin:'3180', text:'Scegli qualcosa di fresco al Bar delle Cascate' },
  { pin:'8836', text:'Fai 5 trazioni di fila, b*tch' },
  { pin:'1147', text:'Batti Federico ad UNO 2 volte.' },
];

// image id -> [file, bgPosition, opacity]
const IMAGES = {
  s1: ['images/1.jpg', '68% center', 0.72],
  s2: ['images/2.jpg', 'center 55%', 0.70],
  s3: ['images/3.jpg', 'center 12%', 0.72],
  s4: ['images/4.jpg', 'center 35%', 0.70],
  s5: ['images/5.jpg', 'center 18%', 0.95],
  s6: ['images/6.png', 'center 15%', 0.95],
  s7: ['images/7.jpg', 'center 12%', 0.95],
  s8: ['images/8.png', 'center 12%', 0.95],
};

// ---------- State ----------
const state = {
  active: 0,
  unlocked: [0],
  modal: null,        // index of tab whose password modal is open
  pwInput: '', pwError: false,
  translating: null,  // index of tab whose pin modal is open
  translated: [],      // tabs whose translation has been unlocked
  viewing: [],          // tabs currently showing the italian translation
  pinInput: '', pinError: false,
  imgUrls: {},          // id -> chroma-keyed data URL, once ready
};

try {
  const s = localStorage.getItem('soc_ul');
  if (s) state.unlocked = [...new Set([0, ...JSON.parse(s)])];
} catch(e) {}
try {
  const t = localStorage.getItem('soc_tr');
  if (t) { const arr = JSON.parse(t); state.translated = [...new Set(arr)]; state.viewing = [...new Set(arr)]; }
} catch(e) {}

// ---------- Chroma key (green-screen removal) ----------
function chromaKey(img) {
  try {
    const MAX = 700;
    const sc = Math.min(1, MAX / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const w = Math.max(1, Math.round((img.naturalWidth || MAX) * sc));
    const h = Math.max(1, Math.round((img.naturalHeight || MAX) * sc));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      const green = g - Math.max(r, b);
      if (green > 50) { d[i+3] = Math.max(0, Math.round(255 * (1 - Math.min(1, (green - 50) / 70)))); continue; }
      const dist = Math.sqrt((255-r)**2 + (255-g)**2 + (255-b)**2);
      if (dist < 55) d[i+3] = Math.min(255, Math.round(dist * 4.5));
    }
    ctx.putImageData(id, 0, 0);
    return cv.toDataURL('image/png');
  } catch (e) { return img.src; }
}

function loadImages() {
  Object.entries(IMAGES).forEach(([id, [src]]) => {
    const img = new Image();
    img.onload  = () => { state.imgUrls[id] = chromaKey(img); render(); };
    img.onerror = () => { state.imgUrls[id] = src; render(); };
    img.src = src;
  });
}

// ---------- Helpers ----------
const isViewing = idx => state.viewing.includes(idx);

function statueImgHTML(id) {
  const [, bgPos, op] = IMAGES[id];
  const url = state.imgUrls[id];
  const style = `background-position:${bgPos};--op:${op}` + (url ? `;background-image:url(${url})` : '');
  return `<div class="statue-img${url ? ' loaded' : ''}" style="${style}"></div>`;
}

function verse(lines, opts={}) {
  const cls = 'verse' + (opts.small ? ' small' : '') + (opts.last ? ' last' : '');
  return `<div class="${cls}">${lines.join('<br>')}</div>`;
}

// ---------- Pane content builders ----------
function pane1Greek() {
  return `
  <p class="body-text">Εἰ ἀκριβῶς ἐξετάζοιμεν τὰς τῶν παλαιῶν πηγάς, ἀναφαίνεται ἡμῖν ὁ Σωκράτης οὐχ οἷος ὑπὸ τῶν ἐν ταῖς διατριβαῖς δοξάζεται σεμνός τις ὤν, ἀλλὰ μᾶλλον ἀνὴρ θαυμαστῆς τε καὶ γελοίας ἀτοπίας πλέως. Ὁ γὰρ Πλάτων ἐν τῷ Συμποσίῳ (215a-b) διὰ τοῦ Ἀλκιβιάδου, μάλα νή Δία μεθύοντος, χαλεπήν μέν, ἡδεῖαν δὲ τὴν τοῦ σώματος μορφὴν παραδίδωσιν· αἴσχιστος γὰρ ὢν ἐφαίνετο, τούς τε ὀφθαλμοὺς ἐξωφθάλμους ἔχων καὶ τὴν ῥῖνα σιμήν, ὥστε εἰκάζεσθαι μὲν τοῖς ἀτοπωτάτοις Σιληνοῖς, ὁμοιοῦσθαι δὲ τῇ θαλαττίᾳ νάρκῃ, ἥτις τῷ ὄντι ναρκᾶν ποιεῖ τε καὶ παραλύει τὸ στόμα παντὸς τοῦ ἐλέγχειν αὐτὸν πειρωμένου (ταύτην δὲ τὴν εἰκόνα καὶ ἐν τῷ Μένωνι εὑρίσκομεν, 80a).</p>
  ${statueImgHTML('s3')}
  <p class="body-text">Ταύτῃ δὲ τῇ ἀτοπίᾳ τοῦ εἴδους ἀντετάττετο ἡ τῆς ψυχῆς καρτερία, σχεδὸν γελοία οὖσα διὰ τὴν ὑπερβολήν. Ὁ γὰρ αὐτὸς Ἀλκιβιάδης διηγεῖται αὐτοῦ θαυμαστήν τινα μέριμναν ἐν τῇ στρατείᾳ τῇ ἐν Ποτιδαίᾳ (432 π.Χ.)· ὁ γὰρ Σωκράτης ἕωθεν φροντίζων τι τῶν λογικῶν προβλημάτων εἱστήκει ἀκίνητος ὥσπερ ἀνδριάς, μίαν ἡμέραν καὶ νύκτα διατελῶν. Τὸ δὲ πρᾶγμα οὕτω παράδοξον ἦν ὥστε οἱ Ἰωνικοὶ στρατιῶται, ἐκπλαγέντες, τὰ χαμεύνια ἐξεκόμιζον ἵνα ἐν ὑπαίθρῳ καθεύδοντες φυλάττοιέν τε αὐτὸν καὶ στοχάζοιεν πότε κινηθήσεται· ὁ δὲ φιλόσοφος τῇ ὑστεραίᾳ ἅμα τῷ ἡλίῳ ἀνίσχοντι ἀπηλλάττετο, προσευξάμενος τῷ Ἡλίῳ ὥσπερ οὐδὲν δεινὸν παθών (Συμπόσιον, 220a-d).</p>
  ${statueImgHTML('s1')}
  <p class="body-text">Ὀλιγωρῶν δὲ τῆς τῶν ἄλλων δόξης, ὁ Σωκράτης ἀνυπόδητος ἀεὶ ἐν ταῖς Ἀθήναις περιεπάτει – καὶ διὰ τοῦ χειμῶνος τοῦ ἐν Θρᾴκη ἐπὶ τοῦ κρυστάλλου – καὶ τὸν αὐτὸν τρίβωνα δι' ἔτους ἐφόρει. Διογένης δὲ ὁ Λαέρτιος (Περὶ βίων καὶ δογμάτων τῶν ἐν φιλοσοφίᾳ εὐδοκιμησάντων, ΙΙ, 25) λέγει αὐτὸν χαίρειν φοιτῶντα εἰς τὴν ἀγοράν, οὐκ ἐπὶ τῷ πρίασθαί τι, ἀλλ' ἵνα τὰ ὤνια θεώμενος μάλα γεγηθὼς λέγοι· «Πόσα μοι οὐκ ἀναγκαῖά ἐστιν».</p>
  <p class="body-text">Οὐδὲ ὁ οἴκοι βίος ἧττον γελοῖος ἦν διὰ τὴν πρὸς τὴν γυναῖκα Ξανθίππην χαλεπὴν κοινωνίαν. Ὁ γὰρ αὐτὸς Λαέρτιος (ΙΙ, 36) παραδίδωσιν ἡμῖν ἐκείνην τὴν θρυλουμένην στάσιν· ἡ γὰρ Ξανθίππη, ἐπειδὴ λοιδοροῦσα αὐτὸν οὐδὲν τῆς ἡσυχίας ἐκίνησε, τέλος ἐκχέασα ὅλον ὕδωρ ἀκάθαρτον κατὰ τῆς κεφαλῆς αὐτοῦ κατεσκέδασεν. Ὁ δὲ Σωκράτης, διάβροχος γενόμενος ἐναντίον τῶν παριόντων, ἔσκωψεν εἰπών· «Οὐκ ἔλεγον ὅτι Ξανθίππη βροντῶσα καὶ ὕδωρ ποιήσει;» Καὶ μὴν καὶ Ξενοφῶν ἐν τῷ Συμποσίῳ (ΙΙ, 10) γράφει τὸν φιλόσοφον ὁμολογοῦντα ὅτι ταύτην ἔγημεν ἄσκησιν ποιούμενος· εἰ γὰρ δύναιτο ἐκείνην ὑπομένειν, ῥᾳδίως ἂν παντί τῳ τρόπῳ ἐν Ἀθήναις χρῷτο.</p>
  ${statueImgHTML('s4')}
  <p class="body-text">Ἐν δὲ τῷ τοῦ Ξενοφῶντος Συμποσίῳ (V) μανθάνομεν ὅπως ὁ Σωκράτης ἔχαιρεν παίζων. Εἰ γὰρ καὶ οὐδέποτε ἔπαιζε τὰ τῶν παίδων γυμνάσια, οἷον τὴν ὀστρακίνδαν, ἐν τοῖς δείπνοις ὅμως βασιλεὺς ἦν τῶν ζητήσεων καὶ τῶν γρίφων. Ἐν γὰρ ἐκείνῃ τῇ ἡδείᾳ σκηνῇ ὁρῶμεν αὐτὸν ἀγῶνα κάλλους ποιούμενον πρὸς τὸν Κριτίαν, νέον τε καὶ κάλλιστον ὄντα· ὁ δὲ Σωκράτης, τῇ εἰωθυίᾳ ἀναιδείᾳ χρώμενος, ἀποφαίνει ἑαυτὸν καλλίω εἶναι ὅτι οἱ μὲν ἐξώφθαλμοι ὀφθαλμοὶ παρέχουσιν αὐτῷ τὸ πλάγιον βλέπειν (ὥσπερ οἱ χαμαιλέοντες), οἱ δὲ μυκτῆρες ἀναπεπταμένοι ὀσφραίνεσθαι ἀμείνονες εἰσίν. Πᾶς οὖν ὁ τοῦ Σωκράτους βίος οὐδὲν ἄλλο ἦν ἢ ἀκριβής τις καὶ ἡδίστη ζήτησις τῆς Ἀληθείας, οὐ διὰ γεωγραφικῶν πινάκων γιγνομένη, ἀλλὰ τῷ λογικῷ κοχλίᾳ τῆς συλήσεως καὶ τῆς ἐλεγκτικῆς τὰς τῶν πολιτῶν δόξας ἀνατρέπουσα.</p>
  ${statueImgHTML('s2')}
  <p class="body-text" style="margin-bottom:10px">Ἡμέρᾳ δέ τινι ὁ Σωκράτης περιπατῶν ἐνεπνεύσθη καὶ τάδε τὰ ἔπη τῷ κόσμῳ κατέλιπε γεγραμμένα·</p>
  ${verse(['Γελοῖος, γελοῖος ὁ βαδισμὸς αὐτοῦ,','','οὐ μέλει αὐτῷ τῆς εἱμαρμένης ἑαυτοῦ.','','Ἄνω κάτω, ἐντεῦθεν κἀκεῖσε βαδίζει,','','ἀλλ\' οὐδέποτε ἵσταται οὗ ἔδει.','','Σχεδὸν οὐδέποτε ἡσύχιον αὐτὸν εὑρήσεις,','','ἀλλ\' ἡ φωνὴ αὐτοῦ γλυκεῖά ἐστι καὶ κρύφιος.','','Ὁ τυφὼν πολέμιός ἐστιν αὐτῷ μέγιστος,','','ὑπὸ δὲ τῇ καθέδρᾳ τὸ παλαιὸν κρυπτήριον αὐτοῦ.'], {last:true})}`;
}

function pane1Italian() {
  return `
  <p class="body-text">Se esaminiamo da vicino le fonti primarie della classicità, emerge il ritratto di un Socrate lontano dalle austere idealizzazioni accademiche, dipinto piuttosto come un uomo di straordinaria, divertente stravaganza. Il celebre dialogo platonico del Simposio (215a-b) ci consegna, per bocca di un Alcibiade decisamente brillo, una descrizione spietata ma spassosa delle sue fattezze: un uomo decisamente brutto, con gli occhi sporgenti e il naso schiacciato all'insù, paragonato a un grottesco sileno (una sorta di satiro mitologico) o a una torpedine marina (nárke), capace di dare una vera e propria scossa elettrica e «paralizzare» la bocca di chiunque tentasse di sfidarlo (immagine che ritroveremo anche nel Menone, 80a).</p>
  ${statueImgHTML('s3')}
  <p class="body-text">A questo aspetto bizzarro faceva riscontro una tempra fisica quasi comica nella sua assurdità. Lo stesso Alcibiade descrive una sua leggendaria trance meditativa durante la spedizione militare a Potidea (432 a.C.): Socrate si bloccò all'alba a riflettere su un problema logico e rimase lì, immobile come una statua, per un giorno e una notte intera. La scena doveva essere surreale, tanto che i soldati ionici, sbalorditi, portarono i loro giacigli all'aperto solo per accamparsi a guardarlo e scommettere su quando si sarebbe mosso; il filosofo si riscosse solo all'alba successiva, salutò il sole con una preghiera e se ne andò come se nulla fosse (Simposio, 220a-d).</p>
  ${statueImgHTML('s1')}
  <p class="body-text">Incurante del giudizio altrui, Socrate girava per Atene sempre a piedi scalzi – persino sul ghiaccio dell'inverno in Tracia – e con lo stesso mantello logoro tutto l'anno. Diogene Laerzio (Vite e dottrine dei filosofi illustri, II, 25) ci racconta che amasse frequentare il mercato non per comprare, ma per guardare le bancarelle ed esclamare tutto soddisfatto: «Quante cose ci sono di cui non ho bisogno!».</p>
  <p class="body-text">La sua vita domestica non era da meno in quanto a picchi di comicità, a causa del rapporto burrascoso con la moglie Santippe. Lo stesso Laerzio (II, 36) ci tramanda l'iconico aneddoto di una loro furente lite: dopo averlo bersagliato di insulti senza scalfirne la calma, Santippe perse la testa e gli svuotò un intero catino d'acqua sporca daccapo. Socrate, bagnato fradicio davanti ai passanti, si limitò a ironizzare: «Sapevo che dopo tanto tuonare sarebbe arrivata la pioggia!». D'altronde, come registrato anche da Senofonte nel suo Simposio (II, 10), il filosofo confessava di averla sposata per puro addestramento: se riusciva a sopportare lei, avrebbe potuto gestire qualsiasi caratteraccio ad Atene.</p>
  ${statueImgHTML('s4')}
  <p class="body-text">Ed è proprio nel Simposio di Senofonte (V) che scopriamo come Socrate amasse divertirsi. Sebbene non si sia mai cimentato in giochi fisici da bambini come l'inseguimento con i cocci (ostrakinda), nei banchetti era il re indiscusso delle «cacce al tesoro» intellettuali e dei griphi (gli indovinelli dell'epoca). In una scena esilarante, lo vediamo lanciare una finta sfida di bellezza contro il giovane e bellissimo Crizia: Socrate, con la sua tipica faccia tosta, argomenta di essere più bello perché i suoi occhi sporgenti gli garantiscono una visione laterale migliore (come i camaleonti) e le sue narici larghe captano meglio i profumi. Tutta la sua esistenza, in fondo, si configurò come una rigorosa e divertentissima caccia al tesoro della Verità, condotta non con mappe materiali, ma svitando le certezze dei suoi concittadini con il cacciavite logico della confutazione.</p>
  ${statueImgHTML('s2')}
  <p class="body-text" style="margin-bottom:10px">Socrate voleva trovare la parola magica per procedere avanti. Così un giorno passeggiando venne ispirato e lasciò scritto al mondo la seguente strofa nella pietra:</p>
  ${verse(['Buffo, buffo è il suo cammino,','','non gli importa il suo destino.','','Va su e giù, di qua e di là,','','ma mai si ferma dove dovrà.','','Quasi mai lo trovi quieto,','','ma il suo suono è un dolce segreto.','','Il tornado è il suo gran nemico,','','sotto la sedia il suo nascondiglio antico.'], {last:true})}`;
}

function pane2Greek() {
  return [
    verse(['Οὐ σừ σήμερον τὴν ὁδὸν αἱρήσῃ,','','ἄλλος δέ σε μετὰ τέχνης ἡγήσεται·','','κάθησο καὶ πίστευε, ἄλλης οὐ δεῖ ἐπιστήμης,','','ἔασον αὐτὸν ἄγειν σε πρὸς τὸ ἑξῆς ἔργον.']),
    verse(['Ζήτει πρᾶγμά τι μικρὸν καὶ κοῦφον,','','ὃ τὴν καρδίαν ὀχήματός τινος ζωοποιεῖ·','','ἄνευ αὐτοῦ ὁ τροχὸς μένει ἀκίνητος,','','λαβὲ αὐτὸ μετὰ σεαυτοῦ· τοῦτο ἔσται σοι βεβαίωσις.']),
    verse(['Πρὶν ἀπιέναι, μὴ ἐπιλάθῃ ποτὲ','','οὗ σε μένει, πλησίον τῆς θύρας·','','δεῖ σε ὤμων ἰσχυρῶν, τοῦτο ἤδη οἶσθα,','','ἀλλὰ μὴ βλέπε τί εὑρήσεις.']),
    verse(['Μὴ νόμιζε τὸ παίγνιον ἤδη τετελέσθαι·','','μία ἐσχάτη πεῖρα μένει, ὥσπερ πρόσκλησις·','','δεήσει τοῦ σώματος, οὐ μόνον τοῦ νοῦ,','','μόνος ὁ τὸν πόνον νικήσας νικητὴς ἔσται.']),
    verse(['Μόνον ὅταν ὁ ἀγὼν νικηθῇ,','','φωνή τις κρυπτὴ σοι ἀποκαλυφθήσεται·','','οὐκ ἔστι πρᾶγμα ἅπτεσθαι ἢ φέρειν,','','ἀλλ᾽ ἦχος ὃν σκέψασθαι δυνήσῃ.'], {last:true}),
  ].join('');
}

function pane2Italian() {
  return [
    verse(['Non sarai tu, oggi, a scegliere la via,','','un altro ti guiderà con maestria:','','siedi e fidati, non serve altro sapere,','','lascialo condurre al prossimo dovere.']),
    verse(['Cerca un oggetto piccino e leggero,','','dà vita al cuore di un corriero','','senza di lui la ruota resta ferma,','','prendilo con te, sarà la tua conferma.']),
    verse(['Prima di partire, non scordare mai','','ciò che ti aspetta, e presto scoprirai:','','ti servon spalle grosse, ormai lo sai,','','ma non guardare cosa troverai.']),
    verse(['Non credere che il gioco sia già finito,','','un\'ultima prova attende, come un invito:','','servirà il corpo, non solo la mente,','','solo chi supera lo sforzo sarà vincente.']),
    verse(['Solo quando la sfida sarà superata,','','una voce segreta ti sarà svelata:','','non è cosa da toccare o portare,','','ma un suono che potrai scrutare.'], {last:true}),
  ].join('');
}

function pane3Greek() {
  return `
  ${verse(['Πρόσεχε, τὸ ἔργον διπλοῦται·','οὐχ ἓν μόνον, ἀλλὰ ζεῦγος.'])}
  ${statueImgHTML('s8')}
  ${verse(['Ζήτει τὸν τόπον οὗ ὁ ὕαλος τὸ πρόσωπόν σοι ἀποδίδωσιν,','μεταξὺ πολλῶν ληκύθων θησαυρός τις κέκρυπται·','μυστήριόν τι ὃ τὸ ὕδωρ οὐδέποτε συνέλαβεν,','κυλινδρικὸν καὶ κοῦφον, ὀσμῆς οὐκ ἐκκείμενον.','','Ὃς κινεῖται ὥσπερ σκιά,','ἐννέα ψυχὰς ἔχειν λέγεται, ὡς φασί,','καὶ κρύπτει ἐν τῷ τριχώματι αὐτοῦ κεκαλυμμένον τι,','μυστήριόν τι ὃ ἡ πορεία αὐτοῦ βαρύνει.'], {last:true})}`;
}

function pane3Italian() {
  return `
  ${verse(['Attenzione, il compito si sdoppia:','non uno solo, ma una coppia.'])}
  ${statueImgHTML('s8')}
  ${verse(["Cerca il luogo dove il vetro ti rende il volto,","fra tante boccette un tesoro è nascosto:","un segreto che l'acqua non ha mai raccolto,","cilindrico e leggero, dal profumo non esposto.","","Chi si muove come fosse un'ombra,","possiede nove vite, dicono, per certo,","e cela tra il suo manto qualcosa di coperto,","un mistero che la sua andatura ingombra."], {last:true})}`;
}

function pane4Greek() {
  return verse(['Ἥκει ὁ καιρὸς τὴν σὴν ἐπιστήμην πειρᾶσθαι·','','ἴθι εἰς τὴν μαγειρείαν, οὗ σε μένει τὰ ἐρωτήματα','','οἷς δεῖ σε ἀποκρίνασθαι.'], {last:true});
}
function pane4Italian() {
  return verse(['È giunto il momento di saggiare la tua conoscenza:','','recati in cucina, dove ti attendono le domande','','a cui dovrai rispondere.'], {last:true});
}

function pane5Greek() {
  return `
  ${verse(['Ἑκάστη στροφὴ σοι δηλοῖ ὅπου εὑρήσεις τὸ λεῖπον τμῆμα πρὸς τὸ τελέσαι τὴν πεῖραν τῆς Σωκρατικῆς Ἀκαδημίας τῆς Οὐηρώνης.'])}
  ${statueImgHTML('s7')}
  ${verse(['<strong>ΠΡΩΤΟΣ ΚΟΣΜΟΣ:</strong>','','ΕΝ ΤῊ ὉΔῷ ἜΣΤΙΝ ἩΟΜΙΧΛΗ','Ἡ ΓΥΝῊ Ἡ ΠΛΑΝΗΘΕΙΣΑ ΤΗΣ ὉΔΟΥ','ἘΖΗΤΗΣΕ ΤΟΝ ὉΡΙΖΟΝΤΑ ΤΟΝ ἈΠΗΓΟΡΕΥΜΕΝΟΝ','Ἡ ὉΔΟΙΠΟΡΟΣ ἘΠΙΘΥΜΕΙ','ΠΑΝΤΑ ἘΚΒΑΛΕΙΝ','ΚΑΙ ἈΦΕΙΝΑΙ ἈΠΙΕΝΑΙ ΤΟΥΣ ΚΑΚΟΥΣ ΛΟΓΙΣΜΟΥΣ','ΚΑΙ ΣΥΝ Τῷ ἈΟΡΑΤῳ ΜΙΤῳ','ΣΥΝΕΛΑΒΕ ΤΟ ΠΡΟΣΩΠΟΝ ΚΑΙ ἈΠΕΠΕΜΨΕΝ ΑΥΤΟ ΜΑΚΡΑΝ','ΑΦΙΚΕΤΟ ΔΙΑ ΕΙΚΟΝΟΣ ΤΑΧΕΙΑΣ ΚΑΙ ΑΓΓΕΛΙΑΣ','ΔΙΑ ΤΟΥΤΟ ΟΥΚΕΤΙ ΔΥΝΑΝΤΑΙ ΣΥΝΕΛΘΕΙΝ'], {small:true})}
  ${verse(['<strong>ΔΕΥΤΕΡΟΣ ΚΟΣΜΟΣ:</strong>','','ἜΣΤΙ ΠΑΛΜΟΣ ἘΝ Τῇ ΣΙΓῇ','Ἡ ΚΑΡΔΙΑ ἜΠΕΜΨΕ ΤΟΝ ἌΓΓΕΛΟΝ','Ὁ ΦΟΒΟΣ ΟΥΔΕΝ ἌΛΛΟ ἘΠΟΙΗΣΕΝ','Ἢ ΤῊΝ ἈΠΟΚΡΙΣΙΝ ἈΝΕΒΑΛΕΝ','Ἡ ΓΥΝῊ ΤΟΥ ΠΡΩΤΟΥ ΒΗΜΑΤΟΣ ὨΝΕΙΡΕΥΣΑΤΟ','Ὁ ἈΝῊΡ ΤΟΥ ἘΣΧΑΤΟΥ ΒΗΜΑΤΟΣ ὨΝΕΙΡΕΥΣΑΤΟ','ὉΜΟΥ ΝΙΚΩΣΙ ΤΟΝ ΦΟΒΟΝ','Ὃ ΔΕΙ ἘΣΤΙ ΤΟ ΟΝΟΜΑ ΣΟΥ','ΔΙΑ ΤΟΥΤΟ ΟΥΚΕΤΙ ΔΥΝΑΝΤΑΙ ΣΥΝΕΛΘΕΙΝ'], {small:true})}
  ${verse(['<strong>ΤΡΙΤΟΣ ΚΟΣΜΟΣ:</strong>','','ἜΣΤΙ ΠΥΡ ἘΝ Τῇ ΣΠΟΔῷ','Ἡ ΠΛΗΓῊ ἬΔΗ ἸΑΘΕΙΣΑ','ΜΝΗΜΟΝΕΥΕ ΤῊΝ ἩΜΕΡΑΝ ΤῊΝ ΠΑΡΕΛΘΟΥΣΑΝ','ἌΚΟΥΕ ΤῊΝ ΦΩΝῊΝ ΔΩΜΑΤΙΟΥ ἩΜΜΕΝΟΥ','Ὁ ΚΥΚΛΟΣ ὈΡΧΕΙΤΑΙ, ΓΕΛᾷ,','ἌΓΕΙ ΤῊΝ ΝΥΚΤΑ ΠΡΟΣ ΤῊΝ ἨΩ','ΠΑΝΤΑ ῬΕΙ, ΠΑΝΤΑ ῬΕΙ','ΦΩΣ ΝΕΟΝ ἈΦΙΚΝΕΙΤΑΙ','ἌΝΑΨΟΝ ΤῊΝ ΤΗΛΕΟΡΑΣΙΝ ΚΑΙ ΠΡΟΣΜΕΝΕ','ΒΕΒΑΙΩΣ ΣΥΝΕΛΕΥΣΟΝΤΑΙ'], {small:true, last:true})}`;
}

function pane5Italian() {
  return `
  ${verse(["Ciascuna strofa ti addita ove rinvenire il frammento mancante per condurre a compimento la prova dell'Accademia Socratica di Verona."])}
  ${statueImgHTML('s7')}
  ${verse(['<strong>PRIMO MONDO:</strong>','',"NEL CAMMINO C'È LA NEBBIA",'LA DONNA SMARRITA DALLA STRADA',"CERCÒ L'ORIZZONTE PROIBITO",'LA VIANDANTE DESIDERA','TIRARE FUORI TUTTO','E LASCIAR ANDARE VIA I BRUTTI PENSIERI','E INSIEME AL FILO INVISIBILE','CATTURÒ IL VOLTO E LO MANDÒ LONTANO','ARRIVO SU INSTANT CAMERA TELEGRAM','PER QUESTO LORO NON POSSONO PIÙ INCONTRARSI'], {small:true})}
  ${verse(['<strong>SECONDO MONDO:</strong>','',"C'È UN BATTITO NEL SILENZIO",'IL CUORE MANDÒ IL MESSAGGERO','LA PAURA NON FECE ALTRO','CHE RITARDARE LA RISPOSTA','LA DONNA DEL PRIMO PASSO SOGNÒ',"L'UOMO DELL'ULTIMO PASSO SOGNÒ",'INSIEME VINCONO LA PAURA','CIÒ CHE CONTA È IL TUO NOME','PER QUESTO LORO NON POSSONO PIÙ INCONTRARSI'], {small:true})}
  ${verse(['<strong>TERZO MONDO:</strong>','',"C'È IL FUOCO NELLA CENERE",'LA FERITA ORMAI RIMARGINATA','RICORDA IL GIORNO PASSATO',"ASCOLTA LA VOCE DI UNA STANZA ACCESA",'IL CERCHIO DANZA, RIDE,',"GUIDA LA NOTTE VERSO L'ALBA",'TUTTO SCORRE, TUTTO PANTA REI','UNA NUOVA LUCE ARRIVA',"ACCENDI IL TELEVISORE E ASPETTA",'SICURAMENTE LORO SI INCONTRERANNO'], {small:true, last:true})}`;
}

const PANES = [
  { greek: pane1Greek, italian: pane1Italian, endLabel: '✦ τέλος τῆς πρώτης σχεδίας ✦' },
  { greek: pane2Greek, italian: pane2Italian, endLabel: '✦ τέλος τῆς δευτέρας σχεδίας ✦' },
  { greek: pane3Greek, italian: pane3Italian, endLabel: '✦ τέλος τῆς τρίτης σχεδίας ✦' },
  { greek: pane4Greek, italian: pane4Italian, endLabel: '✦ τέλος τῆς τετάρτης σχεδίας ✦' },
  { greek: pane5Greek, italian: pane5Italian, endLabel: '✦ τέλος τῆς πέμπτης σχεδίας ✦' },
];

// ---------- Render ----------
function render() {
  const { active, unlocked, modal, translating, pinInput, pinError, pwInput, pwError, translated } = state;
  const noModal = modal === null, noPin = translating === null;
  const viewing = isViewing(active);

  document.getElementById('siteTitle').textContent = viewing
    ? 'Le avventure socratiche di Ilarietta'
    : 'Αἱ Σωκρατικαὶ πράξεις Ἱλαρίου';

  // Sidebar
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = TABS.map(t => {
    const isActive = active === t.i, isLocked = !unlocked.includes(t.i);
    const cls = isActive ? 'active' : (isLocked ? 'locked' : '');
    const lockIcon = isLocked ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3a2810" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>` : '';
    return `<div class="tab-btn ${cls}" data-tab="${t.i}"><span class="tab-num">${t.num}</span>${lockIcon}</div>`;
  }).join('');
  sidebar.querySelectorAll('.tab-btn').forEach(el => {
    el.addEventListener('click', () => {
      const i = Number(el.dataset.tab);
      if (i === active) return;
      if (!unlocked.includes(i)) { state.modal = i; state.pwInput = ''; state.pwError = false; render(); }
      else { state.active = i; render(); }
    });
  });

  // Header
  const cur = TABS[active];
  document.getElementById('activeName').textContent = viewing ? cur.italian : cur.name;
  document.getElementById('activeTranslit').textContent = viewing ? '' : cur.translit;

  // Body panes
  const body = document.getElementById('body');
  if (noModal && noPin) {
    body.innerHTML = PANES.map((p, i) => {
      const show = active === i;
      return `<div class="pane${show ? ' show' : ''}">
        ${isViewing(i) ? p.italian() : p.greek()}
        <div class="pane-end"><span>${p.endLabel}</span></div>
      </div>`;
    }).join('');
  } else {
    body.innerHTML = '';
  }

  // Translate button
  document.getElementById('translateBtn').onclick = () => {
    if (translated.includes(active)) {
      if (isViewing(active)) state.viewing = state.viewing.filter(i => i !== active);
      else state.viewing = [...state.viewing, active];
    } else {
      state.translating = active; state.pinInput = ''; state.pinError = false;
    }
    render();
  };

  // PIN modal
  const pinModal = document.getElementById('pinModal');
  pinModal.classList.toggle('show', !noPin);
  if (!noPin) {
    const ch = CHALLENGES[translating];
    document.getElementById('pinChallengeText').textContent = ch ? ch.text : '';
    const pinField = document.getElementById('pinInput');
    pinField.value = pinInput;
    document.getElementById('pinError').style.display = pinError ? 'block' : 'none';
  }

  // Password modal
  const pwModal = document.getElementById('pwModal');
  pwModal.classList.toggle('show', !noModal);
  if (!noModal) {
    const mt = TABS[modal];
    document.getElementById('pwName').textContent = mt.name;
    document.getElementById('pwTranslit').textContent = mt.translit;
    document.getElementById('pwItalian').textContent = mt.italian;
    document.getElementById('pwInput').value = pwInput;
    document.getElementById('pwError').style.display = pwError ? 'block' : 'none';
  }
}

// ---------- Modal logic ----------
function checkPw() {
  const idx = state.modal;
  const val = document.getElementById('pwInput').value.trim().toLowerCase();
  if (val === (PW[idx] || '')) {
    state.unlocked = [...new Set([...state.unlocked, idx])];
    try { localStorage.setItem('soc_ul', JSON.stringify(state.unlocked)); } catch(e) {}
    state.active = idx; state.modal = null; state.pwInput = ''; state.pwError = false;
  } else {
    state.pwError = true;
  }
  render();
}

function checkPin() {
  const idx = state.translating;
  const ch = CHALLENGES[idx];
  const val = document.getElementById('pinInput').value;
  if (ch && val === ch.pin) {
    state.translated = [...new Set([...state.translated, idx])];
    state.viewing = [...new Set([...state.viewing, idx])];
    try { localStorage.setItem('soc_tr', JSON.stringify(state.translated)); } catch(e) {}
    state.translating = null; state.pinInput = ''; state.pinError = false;
  } else {
    state.pinError = true;
  }
  render();
}

document.getElementById('pwSubmit').addEventListener('click', checkPw);
document.getElementById('pwClose').addEventListener('click', () => { state.modal = null; render(); });
document.getElementById('pwInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkPw(); });

document.getElementById('pinSubmit').addEventListener('click', checkPin);
document.getElementById('pinClose').addEventListener('click', () => { state.translating = null; render(); });
document.getElementById('pinInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkPin(); });

// ---------- Init ----------
loadImages();
render();
