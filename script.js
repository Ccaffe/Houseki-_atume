/* =========================================================
   script.js — ゲームの動き(プログラム)を書くファイル

   このゲームの流れ:
   1. 宝石がすこしずつ湧いて、画面にたまっていく(古いものは点滅して消える)
   2. 宝石をタップすると、効果音と共にキラッと消えて集まる
   3. 「Lv UP」ボタンで、集めた宝石を使って強化ができる(Lv1〜30)
      ・形     … 新しい形の宝石がふえる + 点数アップ
      ・色     … 新しい色の宝石がふえる + 点数アップ
      ・大きさ … 大きい宝石がふえる     + 点数アップ
      ・秒数   … 宝石が湧いてくる間隔が短くなる
      ・範囲   … タップが当たる範囲が広くなる
      前の強化が Lv10 になると、次の強化が解放される
   4. ときどき出る宝箱を開けると「エレガントタイム」!
   5. 「ストーリー」「ストア」「せってい」の画面も下のメニューから
   6. データはブラウザに保存される(次に開いたときも残る)
   ========================================================= */

/* =========================================================
   ★ 宝石デザインさしかえコーナー ★

   宝石の見た目は「10種類(=デザイン段階)」あります。
   形レベルが上がると、下の表の順番に新しい宝石が増えていきます。

   ■ 自分の絵に差し替えたいとき
     絵のファイル(png や svg)をこのフォルダーに入れて、
     下の null を "ファイル名" に書きかえるだけ!
       (例)  1: "gem.png",
     null のままの段階は、index.html の型紙(SVG)で描いた宝石になります。

   ■ SVG の形そのものを描きかえたいとき
     index.html の <template id="gem-template-1"> 〜 -10 を書きかえます。
   ========================================================= */
const gemImages = {
  1:  null, // 五角形   (形Lv1〜)
  2:  null, // 四角形   (形Lv2〜)
  3:  null, // 七角形   (形Lv3〜)
  4:  null, // ハート型 (形Lv4〜)
  5:  null, // 星型     (形Lv5〜)
  6:  null, // 六角形   (形Lv6〜)
  7:  null, // しずく型 (形Lv7〜)
  8:  null, // ひし形   (形Lv8〜)
  9:  null, // 王冠型   (形Lv20〜)
  10: null, // 花型     (形Lv30)
};


/* =========================================================
   ★ ストーリーの絵さしかえコーナー ★

   ストーリー画面(会話の画面)で使う「背景の絵」と「キャラクターの絵」。

   ■ 絵の入れかた(3ステップ)
     1. 絵のファイル(png や jpg)を、このフォルダーに入れる
     2. 下の file: null の null を、"ファイル名" に書きかえる
          (例)  forest: { name: "森", file: "forest.png" },
     3. 保存してページを開きなおすだけ!

   ■ null のままのところは、仮の絵(点線の四角や、CSSで描いた森)が出ます。
     name: は、その仮の絵に表示される名前です(絵を入れると消えます)
   ========================================================= */

// ▼ 背景の絵(お話の「舞台」)
const storyBackgrounds = {
  forest:  { name: "森",         file: null },
  mansion: { name: "森のお屋敷", file: null },
  hall:    { name: "お屋敷の中", file: null },
};

// ▼ キャラクターの絵(画面のまん中に立つ人)
const storyCharacters = {
  ojosama: { name: "おじょうさま", file: null },
};


/* =========================================================
   ★ ストーリー編集コーナー ★

   ストーリーはここに書くだけで、ゲームの一覧に自動で並ぶ!
   お話は「scenes(セリフのリスト)」でできていて、
   1つのかたまり { ... } が、メッセージウィンドウ1回ぶんです。

     { bg: "forest", chara: "ojosama", text: `セリフ` },
       bg    … 背景の名前(上の storyBackgrounds に書いた名前)
       chara … キャラクターの名前(上の storyCharacters に書いた名前)
               null にすると、キャラクターが出ない「地の文」になる
       text  … 表示する文章。バッククォート( ` )で囲むと改行もそのまま出る
       name  … (省略してOK)しゃべる人の名前を、わざと別の名前にしたいとき

   お話をふやしたいときは、{ title: ..., scenes: [ ... ] } のかたまりを
   コピーして、下に足すだけ!
   ========================================================= */

// ストーリー1話を解放するのに必要な宝石(ダイヤ)の数
const STORY_COST = 100;

const stories = [
  {
    title: "森のお屋敷",
    scenes: [
      { bg: "forest", chara: null, text: `深い森の、そのまた奥。
地図にものっていない小道の先に、
そのお屋敷はあるという。` },

      { bg: "forest", chara: null, text: `木々のすきまに、あかりがひとつ。
――だれか、住んでいるのだろうか。` },

      { bg: "mansion", chara: null, text: `たどりついたのは、つたのからまる古いお屋敷。
重たい扉は、なぜか少しだけ開いていた。` },

      { bg: "hall", chara: "ojosama", text: `あら。……お客様だわ。
こんな森の奥まで、よくいらしたこと。` },

      { bg: "hall", chara: "ojosama", text: `わたくし、このお屋敷でひとり、
宝石を集めておりますの。` },

      { bg: "hall", chara: "ojosama", text: `この森はね、夜になると
宝石を落としていくのですわ。
どこから来るのかは、わたくしにも
わからないのだけれど。` },

      { bg: "hall", chara: null, text: `少女の手のひらで、
小さな宝石がきらりと光った。` },

      { bg: "hall", chara: "ojosama", text: `ひとりで集めるには、
少しばかり多すぎて。
……よろしければ、
手伝ってくださらない?` },

      { bg: "hall", chara: "ojosama", text: `ようこそ、宝石のお屋敷へ。
これからよろしくお願いいたしますわ。` },
    ],
  },

  {
    title: "屋敷の少女",
    scenes: [
      { bg: "hall", chara: null, text: `この屋敷には、黒い服の少女がひとりで住んでいる。` },

      { bg: "hall", chara: null, text: `少女は毎晩、集まってきた宝石を
ひとつずつ、ていねいに磨く。` },

      { bg: "hall", chara: "ojosama", text: `きれいになったね。` },

      { bg: "hall", chara: null, text: `宝石はうれしそうに、きらりと光った。

少女がなぜ宝石を集めているのか、
それはまだ、だれも知らない。` },
    ],
  },

  {
    title: "星型の宝石のうわさ",
    scenes: [
      { bg: "forest", chara: null, text: `「星のかたちをした宝石は、願いをかなえるらしい」

そんなうわさを、風が運んできた。` },

      { bg: "hall", chara: "ojosama", text: `星のかたち……。
そんな宝石、見たことがないわ。` },

      { bg: "hall", chara: null, text: `少女は窓の外を見上げる。
夜空の星と、手のひらの宝石が、
同じ色にまたたいた。` },

      { bg: "hall", chara: "ojosama", text: `――もっと、あつめてみましょうか。` },
    ],
  },
];


/* =========================================================
   ★ ストア商品コーナー ★
   商品はここに書くだけで、ストアの一覧に自動で並ぶ!
   { icon, name, description, price } のかたまりをコピーして増やせる。
   price の単位は日本円(¥)。
   ※ 本物のお支払い機能はまだない「仮オープン」なので、
     ボタンを押してもお金はかからない(buyProduct 関数を見てね)
   ========================================================= */
const products = [
  {
    icon: "💝",
    name: "製作者支援",
    description: "ゲームの製作者にお心づけを送って、開発を応援できます。",
    price: 500,
  },
];


/* =========================================================
   ★ 宝物庫(ほうもつこ)コーナー ★
   「お屋敷を継ぐ(プレステージ)」でもらえる “家宝(かほう)” を払って買う、
   ずっと消えない永久アップグレードの一覧。
   品物を増やしたいときは、{ } のかたまりをコピーして増やすだけ!
     id          … プログラムが見分けるための名前(英語。ほかとかぶらないように)
     icon        … 一覧に出る絵文字
     name        … 品物の名前
     cost        … お値段(家宝の数)
     needs       … 先に買っておく品の id(いらないときは null)
     description … 説明の文章
   ※ 効果の中身は script.js の中で hasTreasure("id") を使って分けている。
     効果の強さを変えたいときは、下の「宝物庫の効果の設定」の数字を変える
   ========================================================= */
const treasureItems = [
  { id: "eye",      icon: "👁️", name: "目利き",       cost: 2,  needs: null,
    description: "宝石を見る目が肥えて、獲得数が +25% になる。" },

  { id: "servant",  icon: "🔔", name: "使用人を雇う", cost: 3,  needs: null,
    description: "使用人が、消えそうな宝石を自動で拾ってくれる。" },

  { id: "fountain", icon: "⛲", name: "宝石の泉",     cost: 4,  needs: null,
    description: "宝石の湧いてくる間隔が 15% 短くなる。" },

  { id: "box",      icon: "📦", name: "玄関の宝石箱", cost: 5,  needs: null,
    description: "お屋敷を継いだあと、宝石 500個 を持って始められる。" },

  { id: "zukan",    icon: "📖", name: "宝石図鑑",     cost: 5,  needs: null,
    description: "やかたに図鑑が open! 集めた種類1つにつき獲得数 +1%。" },

  { id: "hands",    icon: "🧹", name: "使用人の手際", cost: 6,  needs: "servant",
    description: "使用人が宝石を拾う速さが2倍になる。" },

  { id: "elegant",  icon: "🕯️", name: "優雅な時間",   cost: 7,  needs: null,
    description: "エレガントタイムが 45秒 に延びる(+15秒)。" },

  { id: "merchant", icon: "🗝️", name: "常連の商人",   cost: 8,  needs: null,
    description: "宝箱の出てくる間隔が半分になる。" },

  { id: "haggle",   icon: "💰", name: "値切り上手",   cost: 10, needs: null,
    description: "強化(Lv UP)のお値段が 2割引 になる。" },
];


/* =========================================================
   ★ 実績(トロフィー)コーナー ★
   達成すると宝石がもらえて、さらに1つにつき獲得数が +2% される。
   実績を増やしたいときは、{ } のかたまりをコピーして増やすだけ!
     id     … 見分けるための名前(英語)
     icon   … 絵文字
     name   … 実績の名前
     detail … 達成のじょうけんの説明
     reward … 達成したときにもらえる宝石の数
     check  … 「達成したか?」を調べる小さな関数。
              return のうしろに条件を書くと、true(達成)か false(まだ)になる
   ========================================================= */
const achievements = [
  { id: "first100", icon: "🌱", name: "はじめの一歩", detail: "宝石を100個あつめる", reward: 50,
    check: function () { return totalGems >= 100; } },

  { id: "tap1000", icon: "👆", name: "タップの達人", detail: "宝石を1,000回タップする", reward: 300,
    check: function () { return tapCount >= 1000; } },

  { id: "total10000", icon: "💎", name: "宝石あつめ名人", detail: "宝石を10,000個あつめる", reward: 500,
    check: function () { return totalGems >= 10000; } },

  { id: "star", icon: "⭐", name: "星をつかむ", detail: "「形」を Lv8 まで上げる", reward: 200,
    check: function () { return upgrades.shape.level >= 8; } },

  { id: "blue", icon: "🔵", name: "青の宝石", detail: "「色」を Lv20 まで上げる", reward: 500,
    check: function () { return upgrades.color.level >= 20; } },

  { id: "chest10", icon: "🎁", name: "宝箱あつめ", detail: "宝箱を10回あける", reward: 400,
    check: function () { return chestOpened >= 10; } },

  { id: "cat", icon: "🐈‍⬛", name: "黒猫とのやくそく", detail: "黒猫から宝石を取り返す", reward: 200,
    check: function () { return catCaught >= 1; } },

  { id: "story3", icon: "📚", name: "物語のつづき", detail: "ストーリーを3話まで解放する", reward: 300,
    check: function () { return unlockedStories >= 3; } },

  { id: "prestige1", icon: "🏛️", name: "お屋敷を継ぐ", detail: "はじめてお屋敷を継ぐ", reward: 300,
    check: function () { return generation >= 2; } },

  { id: "gen3", icon: "🏰", name: "名家のあるじ", detail: "3代目になる", reward: 1000,
    check: function () { return generation >= 3; } },

  { id: "hire", icon: "🔔", name: "人を使う", detail: "宝物庫で「使用人を雇う」を買う", reward: 300,
    check: function () { return hasTreasure("servant"); } },

  { id: "zukan50", icon: "📗", name: "図鑑のなかば", detail: "図鑑を50種類うめる", reward: 800,
    check: function () { return zukanFound.length >= 50; } },

  { id: "zukan100", icon: "📕", name: "図鑑コンプリート", detail: "図鑑を100種類ぜんぶうめる", reward: 5000,
    check: function () { return zukanFound.length >= 100; } },

  { id: "total100000", icon: "👑", name: "大富豪", detail: "宝石を100,000個あつめる", reward: 3000,
    check: function () { return totalGems >= 100000; } },
];


/* =========================================================
   ★ セリフ編集コーナー ★
   チュートリアルで出てくる「お屋敷の主(おじょうさま)」のセリフ。
   文章を変えたいときは、ここを書きかえるだけでOK!
   バッククォート( ` )で囲むと、改行もそのまま表示される
   ========================================================= */
const tutorialLines = {
  // --- ゲームを開いた直後 ---
  welcome: `宝石のお屋敷へようこそ。`,

  // OKを押すか、宝石を3個タップすると次へ進む
  tap: `タップすると
宝石が集められるわ。`,

  enjoy: `このお屋敷には
いろんな宝石があるのだけれど……
まずは遊んでみて頂戴。
ではごきげんよう。`,

  // --- 50個あつめたあと(Lv UPボタンを指す吹き出し) ---
  lvupIntro: `宝石を集めたのね。
なら、「Lv UP」で
レベルを上げられるわ。`,

  // 形のレベルを実際に上げると次へ進む(このセリフにOKボタンは出ない)
  shapeTry: `まずはこの、形の
レベルを上げてみて頂戴。
最初とはいえ、指示ばかりで
ごめんあそばせ。`,

  praise: `素晴らしいですわ。`,

  // --- ユーザーLv5ではじめての宝箱が出たとき ---
  chestFound: `あら、わたくしの
落とし物ですわ。
拾っていただけるかしら?`,

  chestThanks: `感謝いたしますわ。
お礼にエレガントタイム!
ですわ。`,

  // --- 5つの強化がぜんぶ Lv10 になったとき(1回だけ) ---
  prestigeReady: `見事に育てましたわね。
そろそろ、このお屋敷を
あなたにお譲りしましょう。
下の「継ぐ」を押してみて。`,

  // --- お屋敷を継いだ直後 ---
  prestigeDone: `おめでとう、新しい当主さま。
家宝は「やかた」の宝物庫で
使えますわ。`,

  // --- 6巡クリアして、おまけのストーリーが解放されたとき ---
  storyUnlocked: `6巡、ようやりましたわね。
おまけに、このお屋敷の
のんびりしたお話を
お見せしましょう。`,
};


/* ---------- ゲームのデータ(変数) ---------- */

// 「let」は「あとで中身が変わる変数」を作る書き方
let gemCount = 0;     // いま持っている宝石(強化に使うと減る)
let totalGems = 0;    // これまでに集めた宝石の総数(統計用。減らない)
let tapCount = 0;     // 宝石をタップした回数(統計用)
let spentGems = 0;    // 強化につかった宝石の数(統計用)
let unlockedStories = 1; // 読めるストーリーの数(最初は1話目だけ読める)
let tutorialSeen = false;    // チュートリアル(セリフの案内)をぜんぶ見終わったか
let firstChestDone = false;  // はじめての特典の宝箱をもう開けたか
let tutorialStep = null;     // いま表示中のセリフの名前(何も出ていなければ null)
let tutorialTapCount = 0;    // 「タップすると〜」のセリフ中に宝石を取った数

// ---- お屋敷を継ぐ(プレステージ)まわりのデータ ----
// これらは「お屋敷を継いで」もリセットされず、ずっと引き継がれる
let heirlooms = 0;            // いま持っている家宝の数(宝物庫で使う通貨)
let ownedTreasures = [];      // 宝物庫で買った品の id を入れておく配列
let generation = 1;           // いま何代目か(継ぐたびに1ずつ増える)
let prestigeAsked = false;    // 「継げるようになった」案内をもう出したか
let zukanFound = [];          // 図鑑で見つけた組み合わせ("形の段階-色の段階")の配列
let unlockedAchievements = []; // 達成ずみの実績の id の配列
let claimedAchievements = [];  // ごほうびをもう受け取った実績の id の配列
let chestOpened = 0;          // 宝箱をあけた回数(実績用)
let catCaught = 0;            // 黒猫から宝石を取り返した回数(実績用)

// 「const」は「変わらない値」を作る書き方
const MAX_LEVEL = 30;    // 強化レベルの上限(ここまで上げられる)
const UNLOCK_LEVEL = 10; // 前の強化がこのレベルになると、次の強化が解放される

// ---- 見た目が変わるレベル(デザイン段階) ----
// レベルが1上がるたびに見た目が変わると、すぐネタ切れになってしまう。
// そこで「この表のレベルに届いたときだけ見た目が変わる」ようにしている。
// 最初の8レベルはどんどん変わって、そのあとは Lv20 と Lv30 が節目!
// ※ 表を増やせば段階も増える(index.html の型紙も同じ数だけ用意してね)
const DESIGN_STAGE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 20, 30];
const DESIGN_STAGE_COUNT = DESIGN_STAGE_LEVELS.length; // 段階の数(10種類)

// レベルから「いま何段階目の見た目か」を調べる関数。1〜10 が返ってくる。
// 例) Lv8→8段階目、Lv15→まだ8段階目、Lv20→9段階目、Lv30→10段階目
function getDesignStage(level) {
  let stage = 1;
  for (let i = 0; i < DESIGN_STAGE_LEVELS.length; i++) {
    if (level >= DESIGN_STAGE_LEVELS[i]) {
      stage = i + 1;
    }
  }
  return stage;
}

// ---- 宝石の湧き方(増え方・消え方)の設定 ----
// 宝石は一定の間隔でどんどん湧いてたまっていき、
// 古いものから順に、点滅してから消えていく。
// 「気持ちよく一気に集められる」+「消えるまえに拾いたくなる」バランス!
const GEM_CAP = 100;           // 画面に出る宝石の上限(画面いっぱい)
const GEM_RESUME = 80;         // 上限に達したあと、この数まで減ると湧きが再開する
const SPAWN_INTERVAL = 2500;   // 何ミリ秒ごとに1個湧くか(ふだん)
const SPAWN_SPEED_BONUS = 70;  // 「秒数」レベル1つごとに、湧きが何ミリ秒早くなるか
const SPAWN_INTERVAL_MIN = 400; // どんなに強化しても、これより早くはならない
const RUSH_INTERVAL = 150;     // はじめてボーナス/エレガントタイム中の湧き間隔
const RUSH_BURST = 12;         // ボーナスなどが始まった瞬間に一気に出す数
const DECAY_INTERVAL = 8000;   // 何ミリ秒ごとに、いちばん古い宝石が消え始めるか
const DECAY_MIN = 6;           // 画面がこの数以下なら消えない(集めている人の邪魔をしない)
const DECAY_FADE_TIME = 1500;  // 消えるまでの点滅時間(この間にタップすれば救出できる!)
let spawnPaused = false;       // 上限に達して湧きがお休み中かどうか

// ---- 宝箱とフィーバータイムの設定 ----
const FEVER_SECONDS = 30;    // フィーバータイムの長さ(秒)
const CHEST_WAIT_MIN = 120;  // 次の宝箱が出るまでの最短(秒)= 2分
const CHEST_WAIT_MAX = 300;  // 最長(秒)= 5分
const CHEST_LIFETIME = 20;   // 宝箱を開けないと消えるまでの時間(秒)
const CHEST_UNLOCK_LEVEL = 5; // 宝箱が解禁されるユーザーレベル

// ---- 「範囲」強化の設定 ----
// タップした宝石のまわりにある宝石も、まとめて集められる!
// 範囲Lv1 は半径0(タップした1個だけ)。1レベルごとに半径が広がる
const RANGE_RADIUS_PER_LEVEL = 6; // 範囲レベル1つごとに、半径が何ピクセル広がるか
const GEM_HIT_PADDING = 6;        // 宝石まわりの、押しやすくするための小さな余白

// ---- お屋敷を継ぐ(プレステージ)の設定 ----
// ストーリーは「ぜんぶ遊びきった人へのおまけ」なので、
// 6巡クリア(=6回お屋敷を継いで7代目になる)まで、メニューに出てこない。
// ここの数字を変えると、解放のタイミングを早くしたり遅くしたりできる
const STORY_UNLOCK_GENERATION = 7;
const PRESTIGE_NEED_LEVEL = 10;     // 5つの強化がこのレベル以上になると継げる
const HEIRLOOM_PER_USER_LEVEL = 10; // User Lv 何ごとに家宝を1つもらえるか

// ---- 宝物庫の効果の設定(ここの数字を変えると効果の強さが変わる) ----
const EYE_BONUS = 0.25;             // 目利き:獲得数が何倍ふえるか(0.25 = +25%)
const FOUNTAIN_FASTER = 0.85;       // 宝石の泉:湧く間隔を何倍にするか(0.85 = 15%短縮)
const BOX_START_GEMS = 500;         // 玄関の宝石箱:継いだあとの持ちものの宝石
const ELEGANT_EXTRA_SECONDS = 15;   // 優雅な時間:エレガントタイムを何秒のばすか
const MERCHANT_CHEST_FASTER = 0.5;  // 常連の商人:宝箱の待ち時間を何倍にするか
const HAGGLE_DISCOUNT = 0.8;        // 値切り上手:強化のお値段を何倍にするか(2割引)
const ZUKAN_BONUS_PER_CELL = 0.01;  // 図鑑:1種類あつめるごとに獲得数 +1%
const ACHIEVEMENT_BONUS = 0.02;     // 実績:1つ達成するごとに獲得数 +2%
const SERVANT_INTERVAL = 6000;      // 使用人が宝石を拾う間隔(ミリ秒)
const SERVANT_FAST_INTERVAL = 3000; // 「使用人の手際」を買ったあとの間隔

// ---- ランダムイベント(黒猫・行商人)の設定 ----
const EVENT_UNLOCK_LEVEL = 5; // このユーザーレベルからイベントが起こり始める
const EVENT_WAIT_MIN = 90;    // 次のイベントまでの最短(秒)
const EVENT_WAIT_MAX = 180;   // 最長(秒)
const CAT_STEAL = 5;          // 黒猫が1回にくわえていく宝石の数(画面の宝石)
const CAT_LIFETIME = 8;       // 黒猫が闇にとけて消えるまでの時間(秒)
const PEDDLER_LIFETIME = 12;  // 行商人が帰ってしまうまでの時間(秒)
const PEDDLER_GEMS_PER_LEVEL = 30; // 行商人がくれる宝石(User Lv 1つあたり)

let feverSecondsLeft = 0;    // フィーバーの残り秒数(0なら通常モード)
let feverCountTimer = null;  // 残り時間をカウントダウンするタイマー
let chestTimer = null;       // 次の宝箱の出現予約(いつも1本だけ)

// ---- はじめてボーナスの設定 ----
// はじめて遊ぶときは、宝石が画面いっぱいに出続けて、
// この数(50個)をあつめるまで止まらない!楽しいスタート用
const WELCOME_GOAL = 50;
let welcomeRushActive = false;  // はじめてボーナス中かどうか

// 保存データのバージョン。ゲームのルールを大きく変えたときに
// この数字を上げると、みんなの古い保存データが1回だけ自動リセットされる
const SAVE_VERSION = 3;

// 4種類の強化のデータをひとまとめにしたもの。
// upgrades.shape.level のように「.」でつないで中身を取り出せる
const upgrades = {
  shape: { name: "形",     level: 1 }, // 宝石の形が変わる+獲得数アップ
  color: { name: "色",     level: 1 }, // 宝石の色が増える+獲得数アップ
  size:  { name: "大きさ", level: 1 }, // 宝石が大きくなる+獲得数アップ
  speed: { name: "秒数",   level: 1 }, // 宝石が湧いてくる間隔が短くなる
  range: { name: "範囲",   level: 1 }, // タップが当たる範囲が広くなる
};

// 強化が解放される順番。
// 前の強化を UNLOCK_LEVEL(Lv10)まで上げると、次の強化が解放される!
// ※ MAX(Lv30)まで上げなくてよいので、次の強化がすぐ楽しめる
const UPGRADE_ORDER = ["shape", "color", "size", "speed", "range"];

// その強化がもう解放されているかどうかを調べる関数。
// true(はい)か false(いいえ)が返ってくる
function isUpgradeUnlocked(type) {
  const place = UPGRADE_ORDER.indexOf(type); // 順番の何番目か(0から)
  if (place === 0) {
    return true; // 最初の「形」はいつでも解放されている
  }
  // ひとつ前の強化が Lv10 まで育っていれば解放!
  const previousType = UPGRADE_ORDER[place - 1];
  return upgrades[previousType].level >= UNLOCK_LEVEL;
}

// 次のレベルに上げるのに必要な宝石の数。
// レベル1→2 は 10個、2→3 は 20個…と、レベル×10 で増えていく。
// 宝物庫で「値切り上手」を買っていると、2割引きになる!
function upgradeCost(level) {
  let cost = level * 10;
  if (hasTreasure("haggle")) {
    cost = Math.ceil(cost * HAGGLE_DISCOUNT); // Math.ceil = 小数点以下を切り上げ
  }
  return cost;
}


/* ---------- 家宝・宝物庫まわりの小さな関数 ---------- */

// 宝物庫でその品を買っているか調べる。true(買った)か false(まだ)が返る。
// indexOf は「配列の何番目にあるか」を返し、なければ -1 になる
function hasTreasure(id) {
  return ownedTreasures.indexOf(id) !== -1;
}

// もうお屋敷を継げるか?(5つの強化がぜんぶ Lv10 以上になったら継げる)
function canPrestige() {
  for (let i = 0; i < UPGRADE_ORDER.length; i++) {
    if (upgrades[UPGRADE_ORDER[i]].level < PRESTIGE_NEED_LEVEL) {
      return false; // 1つでも足りなければ、まだ継げない
    }
  }
  return true;
}

// いま継ぐと、家宝を何個もらえるか。User Lv 10 ごとに1つ
function getHeirloomReward() {
  return Math.floor(getUserLevel() / HEIRLOOM_PER_USER_LEVEL);
}

// 宝石の獲得数が「何倍」になるかをまとめて計算する。
// 目利き(+25%)・図鑑(1種類 +1%)・実績(1つ +2%)を全部たし算する
function getGemMultiplier() {
  let multiplier = 1;
  if (hasTreasure("eye")) {
    multiplier += EYE_BONUS;
  }
  if (hasTreasure("zukan")) {
    multiplier += zukanFound.length * ZUKAN_BONUS_PER_CELL;
  }
  // 実績はごほうびを「受け取った」ぶんだけボーナスになる
  multiplier += claimedAchievements.length * ACHIEVEMENT_BONUS;
  return multiplier;
}

// エレガントタイムの長さ(秒)。「優雅な時間」を買っていると長くなる
function getFeverSeconds() {
  if (hasTreasure("elegant")) {
    return FEVER_SECONDS + ELEGANT_EXTRA_SECONDS;
  }
  return FEVER_SECONDS;
}


/* ---------- 画面の部品を取ってくる ---------- */
// document.getElementById("名前") で、HTML の id="名前" の部品を取れる

const gemCountDisplay = document.getElementById("gem-count"); // 宝石の数の表示
const userLevelDisplay = document.getElementById("user-level"); // レベルの表示
const mainArea = document.getElementById("main-area");         // 宝石が出るエリア
const statusPanel = document.getElementById("status-panel");   // 強化パネル
const storyScreen = document.getElementById("story-screen");   // ストーリー画面
const storyList = document.getElementById("story-list");       // ストーリーの一覧
// ストーリーの会話画面(ADV画面)の部品たち
const storyScene = document.getElementById("story-scene");             // 会話画面ぜんたい
const storyBg = document.getElementById("story-bg");                   // 背景の絵
const storyBgLabel = document.getElementById("story-bg-label");        // 仮の背景の名前
const storyChara = document.getElementById("story-chara");             // キャラクターの入れ物
const storyCharaImage = document.getElementById("story-chara-image");  // キャラクターの絵
const storyCharaDummy = document.getElementById("story-chara-dummy");  // 仮のキャラクター
const storySpeaker = document.getElementById("story-speaker");         // 名前の札
const storyLine = document.getElementById("story-line");               // セリフの文章
const storyNext = document.getElementById("story-next");               // 「次へ」の▼
const fadeScreen = document.getElementById("fade-screen");             // 暗転の黒い幕
const storeScreen = document.getElementById("store-screen");   // ストア画面
const storeList = document.getElementById("store-list");       // 商品の一覧
// やかた画面(宝物庫・図鑑・実績)の部品たち
const mansionScreen = document.getElementById("mansion-screen"); // やかた画面ぜんたい
const treasureList = document.getElementById("treasure-list");   // 宝物庫の品の一覧
const zukanGrid = document.getElementById("zukan-grid");         // 図鑑のマス目
const achieveList = document.getElementById("achieve-list");     // 実績の一覧
const prestigeOverlay = document.getElementById("prestige-overlay"); // 継承の確認画面
const settingsOverlay = document.getElementById("settings-overlay"); // せってい画面
const confirmOverlay = document.getElementById("confirm-overlay");   // リセット確認画面
const gameFrame = document.querySelector(".game"); // ゲーム全体の枠(トースト表示に使う)


/* ---------- 画面の表示を新しくする関数 ---------- */

// 強化1種類ぶんの表示(レベル・ボタンのお値段・解放状態)を新しくする。
// type には "shape"・"color"・"size"・"speed" のどれかが入る
function updateOneUpgrade(type) {
  const up = upgrades[type]; // upgrades["shape"] は upgrades.shape と同じ意味

  // 右端のレベル表示
  document.getElementById(type + "-level").textContent = up.level;

  const button = document.getElementById("lvup-" + type);
  const costDisplay = document.getElementById(type + "-cost");
  const row = button.closest(".status-row"); // ボタンが入っている行

  if (!isUpgradeUnlocked(type)) {
    // まだ解放されていない強化:行を薄くして、🔒マークで押せなくする
    row.classList.add("locked");
    costDisplay.textContent = "🔒";
    button.disabled = true;
    return;
  }

  row.classList.remove("locked"); // 解放済みなら薄い表示をやめる

  if (up.level >= MAX_LEVEL) {
    // もう上限なら「MAX」にして押せなくする
    costDisplay.textContent = "MAX";
    button.disabled = true;
  } else {
    const cost = upgradeCost(up.level);
    costDisplay.textContent = cost;
    // 宝石が足りないときも押せなくする
    button.disabled = gemCount < cost;
  }
}

// ユーザーレベル = 強化した回数ぶんだけ上がる(最初は全部Lv1なので1)
function getUserLevel() {
  return (
    upgrades.shape.level + upgrades.color.level + upgrades.size.level +
    upgrades.speed.level + upgrades.range.level - 4
  );
}

function updateDisplay() {
  // toLocaleString() を使うと 1000 → 「1,000」のようにカンマ付きになる
  gemCountDisplay.textContent = gemCount.toLocaleString();
  userLevelDisplay.textContent = getUserLevel();

  // 宝石が増減すると「Lv UP ボタンを押せるかどうか」も変わるので、
  // ステータスパネルの表示もここでまとめて新しくする
  updateOneUpgrade("shape");
  updateOneUpgrade("color");
  updateOneUpgrade("size");
  updateOneUpgrade("speed");
  updateOneUpgrade("range");

  updatePrestigeRow();   // パネルいちばん下の「お屋敷を継ぐ」の行
  updateMenuButtons();   // 下のメニュー(ストーリーの出しわけ・「!」のしるし)
}

// 下のメニューの出しわけ。
//  ・ストーリー … 6巡クリアするまで隠しておく(最初はボタンが4つ)
//  ・やかた     … 受け取っていないごほうびがあると「!」が付く
function updateMenuButtons() {
  document.getElementById("menu-story").hidden = generation < STORY_UNLOCK_GENERATION;

  const waiting = countClaimable();
  document.getElementById("mansion-badge").hidden = waiting === 0;
  document.getElementById("achieve-badge").hidden = waiting === 0;
}

// 「お屋敷を継ぐ」の行の見た目を新しくする。
// 条件を満たしていなければ 🔒 で押せない。満たしたら金色に光って押せる!
function updatePrestigeRow() {
  const row = document.getElementById("prestige-row");
  const button = document.getElementById("prestige-button");
  const reward = getHeirloomReward();

  document.getElementById("prestige-reward-small").textContent = reward;

  if (canPrestige()) {
    row.classList.remove("locked");
    row.classList.add("ready");
    button.disabled = false;
    document.getElementById("prestige-state").textContent = "家宝 +" + reward;

    // はじめて条件を満たした瞬間だけ、おじょうさまが声をかけてくれる
    if (!prestigeAsked) {
      prestigeAsked = true;
      saveGame();
      if (tutorialStep === null) {
        showTutorialStep("prestigeReady");
      }
    }
  } else {
    row.classList.add("locked");
    row.classList.remove("ready");
    button.disabled = true;
    document.getElementById("prestige-state").textContent = "🔒 Lv" + PRESTIGE_NEED_LEVEL;
  }
}


/* ---------- データを保存する・読み込む ---------- */
// localStorage = ブラウザにデータを覚えさせておける場所。
// たくさんの数字をまとめて保存するために、
// JSON.stringify(データ→文字)と JSON.parse(文字→データ)を使う。
// ブラウザの設定によっては使えないこともあるので、
// try/catch で「失敗してもゲームは止めない」ようにしている

function saveGame() {
  try {
    const data = {
      version: SAVE_VERSION, // どのバージョンで保存したかのメモ
      gemCount: gemCount,
      totalGems: totalGems,
      tapCount: tapCount,
      spentGems: spentGems,
      unlockedStories: unlockedStories,
      tutorialSeen: tutorialSeen,
      firstChestDone: firstChestDone,
      sizeLevel: upgrades.size.level,
      shapeLevel: upgrades.shape.level,
      colorLevel: upgrades.color.level,
      speedLevel: upgrades.speed.level,
      rangeLevel: upgrades.range.level,
      // ここから下は「お屋敷を継いでも引き継がれる」データ
      heirlooms: heirlooms,
      ownedTreasures: ownedTreasures,
      generation: generation,
      prestigeAsked: prestigeAsked,
      zukanFound: zukanFound,
      unlockedAchievements: unlockedAchievements,
      claimedAchievements: claimedAchievements,
      chestOpened: chestOpened,
      catCaught: catCaught,
    };
    localStorage.setItem("housekiSave", JSON.stringify(data));
  } catch (e) {
    // 保存できない環境では何もしない(ゲームはそのまま遊べる)
  }
}

// 配列の中の古い id を、新しい id に置きかえる小さな関数。
// (実績「ネズミ」を「黒猫」に変えたときのように、名前を変えたときに使う)
function renameOldId(list, oldId, newId) {
  const place = list.indexOf(oldId);
  if (place !== -1) {
    list[place] = newId;
  }
  return list;
}

function loadGame() {
  try {
    const savedText = localStorage.getItem("housekiSave");
    if (savedText === null) {
      return; // 保存データがなければ、最初からスタート
    }
    const data = JSON.parse(savedText);

    // 保存データのバージョンが今のゲームと違ったら、読み込まない。
    // ルールが大きく変わったときに、みんな最初からやり直しになる仕組み
    if (data.version !== SAVE_VERSION) {
      return;
    }

    // 「data.gemCount || 0」は「データがなければ 0 にする」という保険
    gemCount = data.gemCount || 0;
    totalGems = data.totalGems || 0;
    tapCount = data.tapCount || 0;
    spentGems = data.spentGems || 0;
    unlockedStories = data.unlockedStories || 1;
    tutorialSeen = data.tutorialSeen || false;
    firstChestDone = data.firstChestDone || false;
    upgrades.size.level = data.sizeLevel || 1;
    upgrades.shape.level = data.shapeLevel || 1;
    upgrades.color.level = data.colorLevel || 1;
    upgrades.speed.level = data.speedLevel || 1;
    upgrades.range.level = data.rangeLevel || 1;
    // 古い保存データには下の項目がないので、「なければ 0 や空っぽの配列」にする
    heirlooms = data.heirlooms || 0;
    ownedTreasures = data.ownedTreasures || [];
    generation = data.generation || 1;
    prestigeAsked = data.prestigeAsked || false;
    zukanFound = data.zukanFound || [];
    unlockedAchievements = data.unlockedAchievements || [];
    // 前のバージョンでは達成すると自動でごほうびが出ていたので、
    // 受け取りずみの記録がない古いデータは「もう受け取った」ことにする
    claimedAchievements = data.claimedAchievements || data.unlockedAchievements || [];
    chestOpened = data.chestOpened || 0;
    // 前のバージョンでは「ネズミ」だったので、古い記録も引きついで読む
    catCaught = data.catCaught || data.ratCaught || 0;
    // 実績の id も "rat" から "cat" に変わったので、古い記録を置きかえる
    unlockedAchievements = renameOldId(unlockedAchievements, "rat", "cat");
    claimedAchievements = renameOldId(claimedAchievements, "rat", "cat");
  } catch (e) {
    // 読み込めない環境では最初からスタート
  }
}


/* ---------- 効果音 ---------- */
// 音声ファイルを使わずに、Web Audio API という仕組みで
// ブラウザに直接音を作らせている

// 音を作る道具箱。最初に音を鳴らすときに1回だけ用意する
let audioContext = null;

// 高さ(frequency)と開始時刻(startTime)を決めて音を1つ鳴らす関数
function playNote(frequency, startTime) {
  const osc = audioContext.createOscillator(); // 音の波を作る装置
  const volume = audioContext.createGain();    // 音量をコントロールする装置

  osc.type = "triangle";           // 波の形(triangle は澄んだ優しい音)
  osc.frequency.value = frequency; // 音の高さ(数字が大きいほど高い音)

  // 音量を 0.25 から始めて、0.4秒かけてスッと小さくする(余韻を作る)
  volume.gain.setValueAtTime(0.25, startTime);
  volume.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

  // 装置をつなぐ: 音の波 → 音量 → スピーカー
  osc.connect(volume);
  volume.connect(audioContext.destination);

  osc.start(startTime);
  osc.stop(startTime + 0.4);
}

// 道具箱の準備。まだなければ作る
function prepareAudio() {
  if (audioContext === null) {
    audioContext = new AudioContext();
  }
}

// 宝石を集めたとき:「キラーン♪」(高い音を2つ重ねる)
function playCollectSound() {
  try {
    prepareAudio();
    const now = audioContext.currentTime;
    playNote(1319, now);        // ミの音(高い)
    playNote(1760, now + 0.08); // ラの音(もっと高い)を少し遅れて
  } catch (e) {
    // 音が出せない環境でも、ゲームは止めずに続ける
  }
}

// 強化したとき:「ドミソ〜♪」(和音をだんだん重ねる)
function playUpgradeSound() {
  try {
    prepareAudio();
    const now = audioContext.currentTime;
    playNote(523, now);         // ド
    playNote(659, now + 0.07);  // ミ
    playNote(784, now + 0.14);  // ソ
  } catch (e) {
    // 音が出せない環境でも続ける
  }
}


/* ---------- 「+○」がふわっと飛ぶ演出 ---------- */
// x, y は表示する場所、amount は増えた数

function showPlusOne(x, y, amount) {
  const plusOne = document.createElement("span");
  plusOne.textContent = "+" + amount;
  plusOne.className = "plus-one"; // style.css のアニメーションが付く

  plusOne.style.left = (x - 15) + "px";
  plusOne.style.top = (y - 30) + "px";

  mainArea.appendChild(plusOne);

  // アニメーションが終わったころ(0.8秒後)に消す。ゴミを残さないため
  setTimeout(function () {
    plusOne.remove();
  }, 800);
}


/* ---------- 宝石の湧きと消滅のループ ---------- */

// 宝石をずっと湧かせ続けるループ。
// 一定の間隔(SPAWN_INTERVAL)で spawnGem を呼び、自分で次の予約をする
function spawnLoop() {
  // 湧く間隔を計算する。「秒数」レベル1つごとに少し早くなり、
  // はじめてボーナス中とエレガントタイム中はいつでも爆速!
  let interval = SPAWN_INTERVAL - (upgrades.speed.level - 1) * SPAWN_SPEED_BONUS;
  if (hasTreasure("fountain")) {
    interval = interval * FOUNTAIN_FASTER; // 宝物庫の「宝石の泉」で15%短縮!
  }
  interval = Math.max(SPAWN_INTERVAL_MIN, interval); // 早くなりすぎないように
  if (feverSecondsLeft > 0 || welcomeRushActive) {
    interval = RUSH_INTERVAL;
  }
  setTimeout(spawnLoop, interval); // 次の湧きを予約してから…
  spawnGem();                      // …今回の1個を湧かせる
}

// いちばん古い宝石が、ときどき点滅して消えていくループ。
// 「消えるまえに拾わなきゃ、もったいない!」のドキドキを作る
function decayLoop() {
  setTimeout(decayLoop, DECAY_INTERVAL); // 次の消滅も予約しておく

  // 画面が隠れているときと、お楽しみタイム中は消えない
  if (mainArea.hidden || feverSecondsLeft > 0 || welcomeRushActive) {
    return;
  }

  // 消えかけ・収集済みをのぞいた宝石たち。先頭がいちばん古い
  const gems = mainArea.querySelectorAll(".gem:not(.collected):not(.expiring)");
  if (gems.length <= DECAY_MIN) {
    return; // 少ないときは消さない(集めている人の邪魔をしない)
  }

  // いちばん古い宝石を点滅させる。点滅中もタップすれば救出できる!
  const oldest = gems[0];
  oldest.classList.add("expiring");
  setTimeout(function () {
    // 点滅が終わってもまだ拾われていなかったら、静かに消える
    if (oldest.isConnected && !oldest.classList.contains("collected")) {
      oldest.remove();
    }
  }, DECAY_FADE_TIME);
}


/* ---------- 宝石を1個、ランダムな場所に出現させる ---------- */

function spawnGem() {
  // ストーリー画面などを見ていて宝石エリアが隠れているときは湧かない
  // (ループは動き続けているので、戻ってくればまた湧き始める)
  if (mainArea.hidden) {
    return; // 「return」= ここで関数を終わりにする
  }

  // 画面の宝石の数をかぞえる(収集アニメーション中のものはのぞく)
  const gemsOnScreen = mainArea.querySelectorAll(".gem:not(.collected)").length;

  // 上限(GEM_CAP)まで埋まったら湧きをお休みして、
  // GEM_RESUME まで減ったらまた湧き始める
  if (spawnPaused) {
    if (gemsOnScreen <= GEM_RESUME) {
      spawnPaused = false; // 減ってきたので湧き再開!
    } else {
      return;
    }
  } else if (gemsOnScreen >= GEM_CAP) {
    spawnPaused = true; // 画面いっぱい!しばらくお休み
    return;
  }

  // ★ この宝石のレベルを抽選する ★
  // 強化すると新しいレベルの宝石が「追加」されるイメージで、
  // いままでのレベルの宝石もぜんぶ出てくる!
  // 例: 形Lv3 なら、形Lv1・Lv2・Lv3 の宝石が同じ確率でランダムに出る。
  // Math.floor(Math.random() * 3) は 0・1・2 のどれかなので、+1 して 1〜3 にする
  const gemShapeLevel = Math.floor(Math.random() * upgrades.shape.level) + 1;
  const gemSizeLevel = Math.floor(Math.random() * upgrades.size.level) + 1;
  const gemColorLevel = Math.floor(Math.random() * upgrades.color.level) + 1;

  // この宝石の「見た目の段階」を調べる(1〜10)。
  // レベルが上がるたびではなく、Lv1〜8・Lv20・Lv30 の節目で変わる
  const shapeStage = getDesignStage(gemShapeLevel);
  const sizeStage = getDesignStage(gemSizeLevel);
  const colorStage = getDesignStage(gemColorLevel);

  // 段階に合った型紙(template)を選んで、コピーして宝石ボタンを作る
  const gemTemplate = document.getElementById("gem-template-" + shapeStage);
  const gem = gemTemplate.content.firstElementChild.cloneNode(true);

  // 抽選したレベルを、宝石自身にメモしておく(dataset = 部品に付けられるメモ)。
  // タップされたときの点数計算は、このメモを見て行う
  gem.dataset.shapeLevel = gemShapeLevel;
  gem.dataset.sizeLevel = gemSizeLevel;
  gem.dataset.colorLevel = gemColorLevel;

  // ★ 画像さしかえコーナーに画像が設定されていたら、
  //    SVG のかわりにその画像を表示する
  const imageFile = gemImages[shapeStage];
  if (imageFile !== null) {
    const img = document.createElement("img");
    img.src = imageFile;
    img.alt = "宝石";
    img.className = "gem-svg"; // SVG と同じ大きさの設定を使い回す
    gem.innerHTML = "";        // 中の SVG を消して…
    gem.appendChild(img);      // …画像に入れかえる
    gem.classList.add("has-image"); // 画像の色が変わらないようにする印
  }

  // 大きさをランダムに決める(60〜110ピクセル)。
  // さらに、大きさの「段階」が1つ上がるごとに +4ピクセルずつ大きくなる。
  // 段階なので、Lv1〜8・Lv20・Lv30 の節目でだけ大きくなる
  // (画面いっぱいにならないよう、10段階目でも +36ピクセルまで。
  //  見た目が止まっても、ポイントはレベルぶんずっと増え続ける!)
  // Math.random() は「0以上1未満のランダムな数」を出してくれる
  const size = 60 + Math.random() * 50 + (sizeStage - 1) * 4;

  // 宝石のまわりに小さな余白をつけて、少し押しやすくする
  // (「範囲」強化の"まとめ取り"は collectAround 関数のほうで行う)
  const hitPadding = GEM_HIT_PADDING;
  gem.style.padding = hitPadding + "px";
  // 幅は「宝石の絵+左右の余白」ぶん(絵の大きさは変わらない)
  gem.style.width = (size + hitPadding * 2) + "px";

  // 出現する場所をランダムに決める。
  // 宝石はエリアの端から「半分まで」はみ出してもOKというルール。
  // 位置は宝石の左上の角なので、いちばん左は -size/2(左半分がはみ出す)、
  // いちばん右は エリアの幅 - size/2(右半分がはみ出す)まで許す
  const areaWidth = mainArea.clientWidth;
  const areaHeight = mainArea.clientHeight;
  const minX = -size / 2;
  const maxX = areaWidth - size / 2;
  const minY = -size / 2;
  const maxY = areaHeight - size / 2;
  const x = minX + Math.random() * (maxX - minX);
  const y = minY + Math.random() * (maxY - minY);
  gem.style.left = x + "px";
  gem.style.top = y + "px";

  // 色を決める。基本の色は「赤」で、色の段階が進むほど
  // 色相環(赤→オレンジ→黄→緑→青)を進んだ色になる。
  // 赤(0度)から青(240度)までを9歩で進むので、1歩 = 240 ÷ 9 ≒ 26.7度。
  // 例: 1段階目 = 0度(赤)、5段階目 ≒ 107度(緑)、10段階目 = 240度(青)
  const hueStep = 240 / (DESIGN_STAGE_COUNT - 1);
  const hue = (colorStage - 1) * hueStep;
  gem.style.setProperty("--hue", hue + "deg"); // style.css の hue-rotate で使われる

  // この宝石がタップされたら collectGem を動かす。
  // 「click」ではなく「pointerdown」を使うのがポイント!
  // click はスマホで2本指同時にタップしても1つしか発生しないけど、
  // pointerdown は指1本ごとに発生するので、複数同時タップで複数集められる
  gem.addEventListener("pointerdown", function () {
    collectAround(gem);
  });

  // メインエリアに追加すると、ぽんっと画面に現れる
  mainArea.appendChild(gem);
}


/* ---------- 宝石をタップして集めたときの処理 ---------- */

// 宝石の「まんなかの座標」を調べる小さな関数
function getGemCenter(gem) {
  return {
    x: gem.offsetLeft + gem.offsetWidth / 2,
    y: gem.offsetTop + gem.offsetHeight / 2,
  };
}

// 「範囲」レベルから、まとめて取れる半径(ピクセル)を計算する。
// Lv1 は 0 なのでタップした1個だけ。Lv30 なら半径174ピクセル!
function getCollectRadius() {
  return (upgrades.range.level - 1) * RANGE_RADIUS_PER_LEVEL;
}

// タップされたときの入り口。
// タップした宝石と、その半径内にあるまわりの宝石をまとめて集める
function collectAround(gem) {
  if (gem.classList.contains("collected")) {
    return; // もう集め終わっている宝石なら何もしない
  }

  const radius = getCollectRadius();
  const center = getGemCenter(gem);

  // まずタップした宝石を集める(音はここで1回だけ鳴らす)
  collectGem(gem, true);

  if (radius <= 0) {
    return; // 範囲Lv1 のうちは1個だけ
  }

  // まわりの宝石も、半径の中に入っていればまとめて集める。
  // Math.hypot(よこの差, たての差) で2点のあいだの距離が出せる
  const others = mainArea.querySelectorAll(".gem:not(.collected)");
  others.forEach(function (other) {
    const c = getGemCenter(other);
    const distance = Math.hypot(c.x - center.x, c.y - center.y);
    if (distance <= radius) {
      collectGem(other, false); // 2個目からは音を鳴らさない
    }
  });

  // 集めた範囲がひと目でわかるように、円の波紋を出す
  showRipple(center.x, center.y, radius);
}

// まとめ取りの波紋(広がって消える円)を表示する
function showRipple(x, y, radius) {
  const ripple = document.createElement("div");
  ripple.className = "tap-ripple";
  ripple.style.left = (x - radius) + "px";
  ripple.style.top = (y - radius) + "px";
  ripple.style.width = (radius * 2) + "px";
  ripple.style.height = (radius * 2) + "px";
  mainArea.appendChild(ripple);
  setTimeout(function () {
    ripple.remove();
  }, 500);
}


// gem = 集める宝石、withSound = 音を鳴らすか(まとめ取りの2個目以降は false)
function collectGem(gem, withSound) {
  // 消えている途中の宝石をもう一度クリックしても、二重に数えない
  if (gem.classList.contains("collected")) {
    return;
  }

  // 1. 何個ぶん集まるか計算する。
  //    宝石には出現したときに自分のレベルがメモしてある(dataset)ので、
  //    それを読み出して使う。メモは文字なので Number() で数字に戻す。
  //    獲得数 = 形Lv + (大きさLv − 1) + (色Lv − 1)
  //    ぜんぶ「その宝石自身」のレベル。くわしくは README.md の点数表を見てね
  const gemShapeLevel = Number(gem.dataset.shapeLevel);
  const gemSizeLevel = Number(gem.dataset.sizeLevel);
  const gemColorLevel = Number(gem.dataset.colorLevel);
  const baseAmount = gemShapeLevel + (gemSizeLevel - 1) + (gemColorLevel - 1);

  // 目利き・図鑑・実績のボーナスをかけ算する(なにも無いときは1倍のまま)。
  // Math.round = 小数点以下を四捨五入
  const amount = Math.round(baseAmount * getGemMultiplier());

  // この宝石の「形と色の組み合わせ」を図鑑に記録する
  recordZukan(getDesignStage(gemShapeLevel), getDesignStage(gemColorLevel));

  // 2. 宝石を増やして、統計も数える
  gemCount += amount;
  totalGems += amount;
  tapCount += 1;

  // 3. 画面の数字を新しくして、保存する
  updateDisplay();
  saveGame();

  // 4. キラーン♪ と鳴らす(まとめ取りのときは1回だけ鳴らす)
  if (withSound !== false) {
    playCollectSound();
  }

  // 5. 宝石のあった場所(真ん中)に「+○」を飛ばす
  const centerX = gem.offsetLeft + gem.clientWidth / 2;
  const centerY = gem.offsetTop + gem.clientHeight / 2;
  showPlusOne(centerX, centerY, amount);

  // 6. 「collected」クラスを付けると、キラッと消えるアニメーションが始まる
  gem.classList.add("collected");

  // 7. アニメーションが終わったころ(0.4秒後)に、宝石を画面から取り除く
  setTimeout(function () {
    gem.remove();
  }, 400);

  // ※ 新しい宝石はここでは出さない。
  //    spawnLoop が一定の間隔でずっと湧かせ続けてくれている

  // 8. はじめてボーナス中なら、進み具合を更新して、目標に届いたら終わり
  if (welcomeRushActive) {
    updateWelcomeBanner();
    if (totalGems >= WELCOME_GOAL) {
      endWelcomeRush();
    }
  }

  // 9. 実績を達成していないか調べる(達成していたらごほうびが出る)
  checkAchievements();

  // 10. 「タップすると宝石が集められるわ。」のセリフ中に
  //    宝石を3個タップしたら、次のセリフへ進む
  if (tutorialStep === "tap") {
    tutorialTapCount += 1;
    if (tutorialTapCount >= 3) {
      showTutorialStep("enjoy");
    }
  }
}


/* ---------- チュートリアル(おじょうさまのセリフ) ---------- */
// セリフの中身は、いちばん上の「セリフ編集コーナー」にあるよ

const tutorialBubble = document.getElementById("tutorial-bubble");
const tutorialText = document.getElementById("tutorial-text");
const tutorialBlocker = document.getElementById("tutorial-blocker");
const tutorialOkButton = document.getElementById("tutorial-ok");

// セリフ中でも「触っていいもの」に印を付ける(null なら全部禁止)
function setTutorialAllow(element) {
  // まず前回の印をぜんぶ外す
  document.querySelectorAll(".tutorial-allow").forEach(function (old) {
    old.classList.remove("tutorial-allow");
  });
  if (element !== null) {
    element.classList.add("tutorial-allow");
  }
}

// 吹き出しを「的(まと)」のそばに置く。side は "right"(的の右)か "left"(的の左)
function placeBubbleNear(target, side) {
  tutorialBubble.classList.add("small");
  tutorialBubble.classList.remove("arrow-left", "arrow-right");

  // 的とゲーム画面の位置から、吹き出しを置く場所を計算する
  const gameRect = gameFrame.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const bubbleWidth = tutorialBubble.offsetWidth; // 吹き出しの実際の横幅

  let left;
  if (side === "right") {
    // 的の右に出して、左向きの矢印で的を指す
    tutorialBubble.classList.add("arrow-left");
    left = targetRect.right - gameRect.left + 16;
  } else {
    // 的の左に出して、右向きの矢印で的を指す
    tutorialBubble.classList.add("arrow-right");
    left = targetRect.left - gameRect.left - bubbleWidth - 16;
  }
  // 画面の左右からはみ出さないように、行き過ぎを止める
  left = Math.min(left, gameRect.width - bubbleWidth - 8);
  left = Math.max(8, left);
  tutorialBubble.style.left = left + "px";
  // 高さは的に合わせる。ただし画面の上や下にはみ出さないように、
  // Math.max(上の限界)と Math.min(下の限界)で行き過ぎを止める
  let top = targetRect.top - gameRect.top - 14;
  const lowestTop = gameRect.height - tutorialBubble.offsetHeight - 8;
  top = Math.min(top, lowestTop);
  top = Math.max(8, top);
  tutorialBubble.style.top = top + "px";
}

// 吹き出しを宝石エリアの上のほう(中央)に置く
function placeBubbleCenter() {
  tutorialBubble.classList.remove("small", "arrow-left", "arrow-right");
  tutorialBubble.style.left = "";
  tutorialBubble.style.top = "";
}

// セリフを1つ表示する。場所や「触っていいもの」もセリフごとにここで決める
function showTutorialStep(step) {
  tutorialStep = step;
  tutorialText.textContent = tutorialLines[step];
  tutorialBubble.hidden = false;
  tutorialOkButton.hidden = false;
  tutorialBlocker.hidden = true;
  setTutorialAllow(null);

  if (step === "lvupIntro" || step === "shapeTry" || step === "praise") {
    // 「形」の行がスクロールで隠れていたら、まず見える位置まで動かす
    const targetButton = document.getElementById("lvup-shape");
    targetButton.scrollIntoView({ block: "nearest" });

    // Lv UPボタンの右に出して、ボタンを指す。セリフ中は他の場所は触れない。
    // ただし強化パネルの中はさわれる(スクロールできるし、形のボタンも押せる。
    // ほかの強化のボタンは🔒や宝石不足で押せないので安全)
    placeBubbleNear(targetButton, "right");
    tutorialBlocker.hidden = false;
    setTutorialAllow(document.querySelector(".status-rows"));

    if (step === "shapeTry") {
      // 実際にレベルを上げるまで進めない(OKボタンは出さない)
      tutorialOkButton.hidden = true;
    }
  } else if (step === "chestFound") {
    // 宝箱の左に出して、宝箱を指す。宝箱をタップするまで進めない(OKも出さない)
    placeBubbleNear(document.querySelector(".chest"), "left");
    tutorialBlocker.hidden = false;
    setTutorialAllow(document.querySelector(".chest"));
    tutorialOkButton.hidden = true;
  } else {
    // それ以外(welcome・tap・enjoy・chestThanks)は中央。うしろの宝石も触れる
    placeBubbleCenter();
  }

  if (step === "tap") {
    tutorialTapCount = 0; // 「3個タップしたら次へ」の数えなおし
  }
}

// 吹き出しを閉じる
function hideTutorial() {
  tutorialStep = null;
  tutorialBubble.hidden = true;
  tutorialBlocker.hidden = true;
  setTutorialAllow(null);
}

// チュートリアルをぜんぶ見終わった(もう出さないように保存する)
function finishTutorial() {
  tutorialSeen = true;
  saveGame();
  hideTutorial();
}

// 強化パネルの中がスクロールされたら、吹き出しもボタンについていく
document.querySelector(".status-rows").addEventListener("scroll", function () {
  if (tutorialStep === "lvupIntro" || tutorialStep === "shapeTry" || tutorialStep === "praise") {
    placeBubbleNear(document.getElementById("lvup-shape"), "right");
  }
});

// OKボタンを押したら、次のセリフへ進む
tutorialOkButton.addEventListener("click", function () {
  if (tutorialStep === "welcome") {
    showTutorialStep("tap");
  } else if (tutorialStep === "tap") {
    showTutorialStep("enjoy");
  } else if (tutorialStep === "enjoy") {
    hideTutorial(); // 50個あつめたら、また声をかけてくれる
  } else if (tutorialStep === "lvupIntro") {
    showTutorialStep("shapeTry");
    // ※ shapeTry にOKボタンはない。形のLv UPボタンを押すと進む
  } else if (tutorialStep === "praise") {
    finishTutorial(); // これでチュートリアルはおしまい!
  } else if (tutorialStep === "chestThanks") {
    hideTutorial();
  } else if (tutorialStep === "prestigeReady" || tutorialStep === "prestigeDone" ||
             tutorialStep === "storyUnlocked") {
    hideTutorial(); // 継承の案内・お祝いは、OKを押すと閉じるだけ
  }
});


/* ---------- はじめてボーナス ---------- */
// はじめて遊ぶ人へのお楽しみ。宝石が画面いっぱいに出続けて、
// 50個(WELCOME_GOAL)あつめるまで止まらない!

function startWelcomeRush() {
  if (welcomeRushActive) {
    return; // もう始まっていたら何もしない
  }
  welcomeRushActive = true;
  mainArea.classList.add("fever"); // フィーバーと同じ金色の光を使い回す

  // 進み具合のバナーを画面の上に出す
  const banner = document.createElement("div");
  banner.className = "fever-banner";
  banner.id = "welcome-banner";
  mainArea.appendChild(banner);
  updateWelcomeBanner();

  // まず勢いよく宝石を出す!(0.08秒ずつずらして12個)。
  // その後は spawnLoop が RUSH_INTERVAL の爆速で湧かせ続けてくれる
  for (let i = 0; i < RUSH_BURST; i++) {
    setTimeout(spawnGem, i * 80);
  }
}

// バナーの「いま何個/50個」の表示を新しくする
function updateWelcomeBanner() {
  const banner = document.getElementById("welcome-banner");
  if (banner) {
    banner.textContent = "✨ はじめてボーナス " + totalGems + " / " + WELCOME_GOAL + " 個 ✨";
  }
}

// 50個あつめたら、はじめてボーナス終了
function endWelcomeRush() {
  welcomeRushActive = false; // spawnLoop の湧きもふつうの速さに戻る
  if (feverSecondsLeft <= 0) {
    mainArea.classList.remove("fever"); // フィーバー中でなければ光を消す
  }
  const banner = document.getElementById("welcome-banner");
  if (banner) {
    banner.remove();
  }
  playFeverSound(); // おめでとうのファンファーレ

  // チュートリアルの途中なら、おじょうさまが「Lv UP」を教えてくれる
  if (!tutorialSeen) {
    showTutorialStep("lvupIntro");
  } else {
    showToast(WELCOME_GOAL + "個たっせい! ここからが本番!");
  }
}


/* ---------- 宝箱とフィーバータイム ---------- */

// 次の宝箱の出現を予約する(2〜5分後のどこかでランダムに出る)。
// ※ 予約は「いつも1本だけ」。前の予約を消してから新しく取るので、
//   予約がたまって宝箱がいくつも出てしまうことがない
function scheduleChest() {
  clearTimeout(chestTimer); // 前の予約があれば取り消す
  let waitSeconds = CHEST_WAIT_MIN + Math.random() * (CHEST_WAIT_MAX - CHEST_WAIT_MIN);
  if (hasTreasure("merchant")) {
    waitSeconds = waitSeconds * MERCHANT_CHEST_FASTER; // 「常連の商人」で待ち時間が半分!
  }
  chestTimer = setTimeout(spawnChest, waitSeconds * 1000); // ×1000 で秒→ミリ秒にする
}

// 宝箱を1個、ランダムな場所に出現させる
function spawnChest() {
  // つぎのときは、少し待ってからもう一度チャレンジする:
  //  ・ストーリー画面などで宝石エリアが隠れている
  //  ・エレガントタイム中/はじめてボーナス中
  //  ・すでに宝箱が画面に出ている(2個出さないため!)
  if (mainArea.hidden || feverSecondsLeft > 0 || welcomeRushActive ||
      mainArea.querySelector(".chest")) {
    clearTimeout(chestTimer);
    chestTimer = setTimeout(spawnChest, 5000);
    return;
  }

  const chest = document.createElement("button");
  chest.className = "chest";
  chest.textContent = "🎁"; // 宝箱の絵。好きな絵文字に変えてもOK
  chest.setAttribute("aria-label", "宝箱をひらく");

  // 出現する場所をランダムに決める(はみ出さない範囲で)
  const x = 10 + Math.random() * Math.max(0, mainArea.clientWidth - 80);
  const y = 10 + Math.random() * Math.max(0, mainArea.clientHeight - 80);
  chest.style.left = x + "px";
  chest.style.top = y + "px";

  // 開けたかどうかのメモ(2回開けないように)
  let opened = false;

  // 宝箱も pointerdown で、タップした瞬間にすぐ開くようにする
  chest.addEventListener("pointerdown", function () {
    if (opened) {
      return;
    }
    opened = true;
    chest.remove();
    chestOpened += 1; // 実績「宝箱あつめ」のための数え上げ
    checkAchievements();
    startFever(); // 宝箱を開けるとフィーバータイム!
  });

  mainArea.appendChild(chest);

  // 20秒たっても開けられなかったら、宝箱は消えて、また今度
  setTimeout(function () {
    if (!opened) {
      opened = true; // もう開けられないようにする
      chest.remove();
      scheduleChest();
    }
  }, CHEST_LIFETIME * 1000);
}

// ユーザーレベル5になったときの、はじめての特典の宝箱。
// ふつうの宝箱とちがって、右端の決まった場所に出て、消えたりしない
function spawnFirstChest() {
  // すでに宝箱が出ているなら、もう出さない(2個出さないため)
  if (mainArea.querySelector(".chest")) {
    return;
  }

  const chest = document.createElement("button");
  chest.className = "chest";
  chest.textContent = "🎁";
  chest.setAttribute("aria-label", "はじめての宝箱をひらく");

  // 吹き出しとかぶらないように、右端の決まった位置に置く
  chest.style.left = (mainArea.clientWidth - 90) + "px";
  chest.style.top = Math.floor(mainArea.clientHeight * 0.35) + "px";

  let opened = false;
  chest.addEventListener("pointerdown", function () {
    if (opened) {
      return;
    }
    opened = true;
    chest.remove();

    // もう特典はもらった、と保存しておく(次からはふつうの宝箱が出る)
    firstChestDone = true;
    chestOpened += 1;
    saveGame();

    startFever();                     // お礼のエレガントタイム!
    showTutorialStep("chestThanks");  // おじょうさまのお礼のセリフ
    scheduleChest();                  // ここから宝箱制度が本格スタート
  });

  mainArea.appendChild(chest);

  // おじょうさまが宝箱を指して声をかけてくる(開けるまで他は触れない)
  showTutorialStep("chestFound");
}

// フィーバータイム(エレガントタイム)開始!
function startFever() {
  // すでにエレガントタイム中なら、二重に始めずに「時間を延長」する。
  // (※ 二重に始めるとカウントダウンのタイマーが2本になってしまい、
  //     終了のお知らせが何度も出てしまう)
  if (feverSecondsLeft > 0) {
    feverSecondsLeft += getFeverSeconds();
    updateFeverBanner();
    playFeverSound();
    showToast("エレガントタイム 延長! 残り " + feverSecondsLeft + "秒!");
    return;
  }

  feverSecondsLeft = getFeverSeconds();
  mainArea.classList.add("fever"); // 画面が金色に光る(style.css)
  playFeverSound();
  showToast("エレガントタイム! " + feverSecondsLeft + "秒間、宝石ざくざく!");

  // 残り時間のバナーを画面の上に出す
  const banner = document.createElement("div");
  banner.className = "fever-banner";
  banner.id = "fever-banner";
  mainArea.appendChild(banner);
  updateFeverBanner();

  // まず勢いよく宝石を出す!(0.08秒ずつずらして12個)。
  // その後は spawnLoop が RUSH_INTERVAL の爆速で湧かせ続けてくれる
  for (let i = 0; i < RUSH_BURST; i++) {
    setTimeout(spawnGem, i * 80);
  }

  // 1秒ごとに残り時間を1減らして、0になったら終了
  clearInterval(feverCountTimer); // 念のため、前のタイマーが残っていたら止める
  feverCountTimer = setInterval(function () {
    feverSecondsLeft -= 1;
    updateFeverBanner();
    if (feverSecondsLeft <= 0) {
      endFever();
    }
  }, 1000);
}

// バナーの残り秒数の表示を新しくする
function updateFeverBanner() {
  const banner = document.getElementById("fever-banner");
  if (banner) {
    banner.textContent = "✦ エレガントタイム 残り " + feverSecondsLeft + " 秒 ✦";
  }
}

// フィーバータイム終了
function endFever() {
  // もう終わっているのに、もう一度呼ばれたときは何もしない
  // (これがないと「おしまい!」のお知らせが何度も出てしまう)
  if (feverCountTimer === null) {
    return;
  }

  feverSecondsLeft = 0; // spawnLoop の湧きもふつうの速さに戻る
  clearInterval(feverCountTimer); // カウントダウンをやめる
  feverCountTimer = null;
  if (!welcomeRushActive) {
    mainArea.classList.remove("fever"); // はじめてボーナス中でなければ光を消す
  }
  const banner = document.getElementById("fever-banner");
  if (banner) {
    banner.remove();
  }
  showToast("エレガントタイム、おしまい!");
  scheduleChest(); // また数分後に宝箱が出る
}

// フィーバー開始の「テッテレー♪」(音をだんだん高く重ねる)
function playFeverSound() {
  try {
    prepareAudio();
    const now = audioContext.currentTime;
    playNote(523, now);         // ド
    playNote(659, now + 0.09);  // ミ
    playNote(784, now + 0.18);  // ソ
    playNote(1047, now + 0.27); // 高いド
  } catch (e) {
    // 音が出せない環境でも続ける
  }
}


/* ---------- 強化(Lv UP)の処理 ---------- */
// type には "size"・"shape"・"color" のどれかが入る

function buyUpgrade(type) {
  const up = upgrades[type];

  // まだ解放されていない・上限・宝石不足のときは何もしない
  // (ボタンは押せないはずだけど、念のためのチェック)
  if (!isUpgradeUnlocked(type) || up.level >= MAX_LEVEL) {
    return;
  }
  const cost = upgradeCost(up.level);
  if (gemCount < cost) {
    return;
  }

  // 宝石を払って、レベルを上げる!
  gemCount -= cost;
  spentGems += cost;
  up.level += 1;

  // 音を鳴らして、画面と保存データを新しくして、お知らせを出す
  playUpgradeSound();
  updateDisplay();
  saveGame();

  // お知らせを出す。うれしい節目のときは特別なメッセージ!
  const place = UPGRADE_ORDER.indexOf(type);
  const nextType = UPGRADE_ORDER[place + 1]; // 次がなければ undefined になる
  const stageChanged = getDesignStage(up.level) > getDesignStage(up.level - 1);
  if (up.level === UNLOCK_LEVEL && nextType !== undefined) {
    // ちょうど Lv10 になった → 次の強化が解放された!
    showToast(up.name + " が Lv." + UNLOCK_LEVEL + "! 「" + upgrades[nextType].name + "」の強化が解放された!");
  } else if (up.level >= MAX_LEVEL) {
    showToast(up.name + " が Lv." + MAX_LEVEL + " でMAX! きわめましたわ!");
  } else if (stageChanged) {
    // 見た目が変わる節目にとどいた
    showToast(up.name + " が Lv." + up.level + "! 新しい宝石があらわれた!");
  } else {
    showToast(up.name + " が Lv." + up.level + " になった!");
  }

  // チュートリアルの「形のレベルを上げてみて頂戴」の最中なら、
  // 実際に上げられたので、ほめてもらえるセリフへ進む
  if (tutorialStep === "shapeTry" && type === "shape") {
    showTutorialStep("praise");
  }

  // 実績(「星をつかむ」など)を達成していないか調べる
  checkAchievements();

  // ユーザーレベルが5になったら、はじめての特典の宝箱が出てくる!
  if (!firstChestDone && getUserLevel() >= CHEST_UNLOCK_LEVEL) {
    spawnFirstChest();
  }
}


/* ---------- 画面の切り替え(あつめる・ストーリー・ストア) ---------- */
// name には "atsumeru"・"story"・"store" のどれかが入る

function showScreen(name) {
  // まず全部の画面を隠して…
  mainArea.hidden = true;
  statusPanel.hidden = true;
  storyScreen.hidden = true;
  storeScreen.hidden = true;
  mansionScreen.hidden = true;

  // …選ばれた画面だけを表示する(開くときに一覧を最新の状態で作り直す)
  if (name === "story") {
    storyScreen.hidden = false;
    buildStoryList();
  } else if (name === "store") {
    storeScreen.hidden = false;
    buildStoreList();
  } else if (name === "mansion") {
    mansionScreen.hidden = false;
    showMansionTab(mansionTab); // 前に開いていたタブをそのまま開く
  } else {
    // "atsumeru"(宝石エリアと強化パネルのセット)
    mainArea.hidden = false;
    statusPanel.hidden = false;
  }

  // いま開いている画面のメニューボタンを光らせる
  document.getElementById("menu-atsumeru").classList.toggle("active", name === "atsumeru");
  document.getElementById("menu-story").classList.toggle("active", name === "story");
  document.getElementById("menu-store").classList.toggle("active", name === "store");
  document.getElementById("menu-mansion").classList.toggle("active", name === "mansion");
}


/* ---------- ストーリー ---------- */

// ストーリーの一覧を作る。カードは3種類:
//  ・解放済み  → タイトルと📖。タップすると読める
//  ・次のお話  → 「💎 100」の解放ボタン付き
//  ・その先    → 灰色の🔒(順番に解放していく)
function buildStoryList() {
  storyList.innerHTML = ""; // まず一覧を空っぽにして、作り直す

  for (let i = 0; i < stories.length; i++) {
    const number = i + 1; // 0番目から始まるので、表示用に +1 する

    if (i < unlockedStories) {
      // --- 解放済み:タップすると読めるボタン ---
      const card = document.createElement("button");
      card.className = "story-card";
      card.innerHTML =
        number + ". " + stories[i].title + '<span class="story-book">📖</span>';
      card.addEventListener("click", function () {
        startStory(i); // 暗転してから、会話画面がはじまる
      });
      storyList.appendChild(card);
    } else if (i === unlockedStories) {
      // --- 次のお話:宝石を払って解放できる ---
      const card = document.createElement("div");
      card.className = "story-card";

      const unlockButton = document.createElement("button");
      unlockButton.className = "story-unlock";
      unlockButton.textContent = "💎 " + STORY_COST;
      unlockButton.disabled = gemCount < STORY_COST; // 足りなければ押せない
      unlockButton.addEventListener("click", function () {
        unlockStory();
      });

      card.appendChild(unlockButton);
      card.appendChild(document.createTextNode(" " + number + "."));
      storyList.appendChild(card);
    } else {
      // --- その先:まだ解放できない ---
      const card = document.createElement("div");
      card.className = "story-card locked";
      card.textContent = number + ". 🔒";
      storyList.appendChild(card);
    }
  }
}

// 宝石を払って、次のストーリーを解放する
function unlockStory() {
  if (gemCount < STORY_COST) {
    return; // 足りなければ何もしない(ボタンも押せないはずだけど念のため)
  }

  gemCount -= STORY_COST;
  unlockedStories += 1;

  playUpgradeSound();
  updateDisplay();
  saveGame();
  buildStoryList(); // 一覧を作り直すと、解放されたお話が読めるようになっている
  showToast("ストーリー" + unlockedStories + "「" + stories[unlockedStories - 1].title + "」を解放した!");
  checkAchievements();
}


/* ---------- 暗転(フェード)で画面を切り替える ---------- */

const FADE_TIME = 400; // 暗転にかかる時間(ミリ秒)。style.css の 0.4s と同じ数字にする

// 画面をふわっと暗くして、まっ暗なあいだに changeFunction() の中身を実行し、
// そのあと、ふわっと明るくもどす。
//   使い方: fadeChange(function () { ここに画面を切り替える処理を書く });
function fadeChange(changeFunction) {
  fadeScreen.hidden = false; // 黒い幕を出す(まだ透明)

  // 少しだけ待ってから dark を付けると、CSS がちゃんと「だんだん黒く」してくれる
  setTimeout(function () {
    fadeScreen.classList.add("dark");
  }, 20);

  // まっ黒になったころに、画面を切り替えて、明るくもどしはじめる
  setTimeout(function () {
    changeFunction();
    fadeScreen.classList.remove("dark");
  }, FADE_TIME + 20);

  // すっかり明るくなったら、黒い幕を片づける
  setTimeout(function () {
    fadeScreen.hidden = true;
  }, FADE_TIME * 2 + 40);
}


/* ---------- ストーリーの会話画面(ADV画面) ---------- */

const TYPE_SPEED = 45; // セリフを1文字ずつ出す速さ(ミリ秒)。小さいほど速い

let playingStory = null; // いま読んでいるお話(読んでいないときは null)
let sceneIndex = 0;      // いま何番目のセリフを表示中か(0から数える)
let typingTimer = null;  // 1文字ずつ出すためのタイマー(出し終わると null)
let typingText = "";     // いま表示中のセリフの、全部の文章
let typingCount = 0;     // そのうち、何文字目まで出したか

// お話をはじめる。index は何番目のお話か(0から)
function startStory(index) {
  playingStory = stories[index];
  sceneIndex = 0;

  // 暗転して、まっ暗なあいだに会話画面へ切り替える
  fadeChange(function () {
    storyScene.hidden = false;
    showScene();
  });
}

// いまの sceneIndex のセリフを、画面に表示する
function showScene() {
  const scene = playingStory.scenes[sceneIndex];

  setStoryBackground(scene.bg);   // 背景の絵をセット
  setStoryCharacter(scene.chara); // キャラクターの絵をセット
  setStorySpeaker(scene);         // 名前の札をセット
  typeLine(scene.text);           // セリフを1文字ずつ出す
}

// 背景の絵を切り替える。key は storyBackgrounds に書いた名前("forest" など)
function setStoryBackground(key) {
  const background = storyBackgrounds[key];

  if (background && background.file) {
    // 絵のファイルが用意されているとき
    storyBg.style.backgroundImage = 'url("' + background.file + '")';
    storyBgLabel.hidden = true; // 仮の名前ラベルは消す
  } else {
    // まだ絵がないとき:style.css で描いた「仮の森」にもどす
    storyBg.style.backgroundImage = "";
    storyBgLabel.hidden = false;
    storyBgLabel.textContent = "仮の背景:" + (background ? background.name : key);
  }
}

// キャラクターの絵を切り替える。key が null のときは、だれも出さない
function setStoryCharacter(key) {
  if (!key) {
    storyChara.hidden = true; // 地の文なので、キャラクターは出さない
    return;
  }

  const character = storyCharacters[key];
  storyChara.hidden = false;

  if (character && character.file) {
    // 絵のファイルが用意されているとき
    storyCharaImage.src = character.file;
    storyCharaImage.hidden = false;
    storyCharaDummy.hidden = true;
  } else {
    // まだ絵がないとき:点線のシルエット(仮のすがた)を出す
    storyCharaImage.hidden = true;
    storyCharaDummy.hidden = false;
    storyCharaDummy.textContent = character ? character.name : key;
  }
}

// メッセージウィンドウの左上に出す「名前の札」を決める。
// scene.name があればそれを、なければキャラクターの名前を使う
function setStorySpeaker(scene) {
  let speakerName = "";

  if (scene.name) {
    speakerName = scene.name;
  } else if (scene.chara && storyCharacters[scene.chara]) {
    speakerName = storyCharacters[scene.chara].name;
  }

  if (speakerName === "") {
    storySpeaker.hidden = true; // 地の文には名前を出さない
  } else {
    storySpeaker.hidden = false;
    storySpeaker.textContent = speakerName;
  }
}

// セリフを1文字ずつ表示する(タイプライターのような演出)
function typeLine(text) {
  typingText = text;
  typingCount = 0;
  storyLine.textContent = "";
  storyNext.hidden = true; // 出し終わるまで▼は隠しておく

  clearInterval(typingTimer); // 前のタイマーが残っていたら止める
  typingTimer = setInterval(function () {
    typingCount = typingCount + 1;
    // slice(0, 3) = 文章の「はじめから3文字目まで」を取り出す
    storyLine.textContent = typingText.slice(0, typingCount);

    if (typingCount >= typingText.length) {
      finishTyping(); // 全部出したら終わり
    }
  }, TYPE_SPEED);
}

// 1文字ずつの表示をやめて、セリフを一気に全部出す
function finishTyping() {
  clearInterval(typingTimer);
  typingTimer = null;
  storyLine.textContent = typingText;
  storyNext.hidden = false; // 「タップで次へ」の▼を出す
}

// 会話画面をタップしたとき
function tapStoryScene() {
  if (playingStory === null) {
    return; // お話を読んでいないときは何もしない
  }

  if (typingTimer !== null) {
    finishTyping(); // まだ文字が出ている途中なら、まず全部出す
    return;
  }

  sceneIndex = sceneIndex + 1; // 次のセリフへ

  if (sceneIndex >= playingStory.scenes.length) {
    endStory(); // 最後まで読んだので終わり
    return;
  }

  showScene();
}

// お話を終わって、ストーリー一覧にもどる(途中でやめたときも同じ)
function endStory() {
  clearInterval(typingTimer);
  typingTimer = null;
  playingStory = null;

  fadeChange(function () {
    storyScene.hidden = true;
    showScreen("story"); // 一覧の画面にもどす
  });
}


/* ---------- ストア ---------- */

// 商品の一覧を作る(ストア商品コーナーの products から)
function buildStoreList() {
  storeList.innerHTML = ""; // まず一覧を空っぽにして、作り直す

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // カードの入れ物
    const card = document.createElement("div");
    card.className = "product-card";

    // 左:商品の絵(絵文字)
    const icon = document.createElement("div");
    icon.className = "product-icon";
    icon.textContent = product.icon;

    // 真ん中:商品名と説明
    const info = document.createElement("div");
    info.className = "product-info";
    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = product.name;
    const description = document.createElement("div");
    description.className = "product-desc";
    description.textContent = product.description;
    info.appendChild(name);
    info.appendChild(description);

    // 右:お値段の購入ボタン
    const buyButton = document.createElement("button");
    buyButton.className = "product-buy";
    buyButton.textContent = "¥" + product.price.toLocaleString();
    buyButton.addEventListener("click", function () {
      buyProduct(product);
    });

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(buyButton);
    storeList.appendChild(card);
  }
}

// 購入ボタンが押されたときの処理。
// 本物のお支払い機能はまだないので、いまはお知らせを出すだけ。
// 将来ここに、決済サービス(お支払いの仕組み)との連携処理を書く
function buyProduct(product) {
  showToast("「" + product.name + "」のお支払い機能は準備中です");
}


/* ---------- せってい画面(統計の表示) ---------- */

function openSettings() {
  // 開くたびに、最新の統計の数字を書き込む
  document.getElementById("stat-total").textContent = totalGems.toLocaleString();
  document.getElementById("stat-taps").textContent = tapCount.toLocaleString();
  document.getElementById("stat-spent").textContent = spentGems.toLocaleString();
  document.getElementById("stat-gen").textContent = generation + "代目";
  document.getElementById("stat-heirlooms").textContent = heirlooms;
  document.getElementById("stat-zukan").textContent = zukanFound.length + " / 100";
  document.getElementById("stat-achieve").textContent =
    unlockedAchievements.length + " / " + achievements.length;
  document.getElementById("stat-claim").textContent = countClaimable() + " こ";

  // hidden を外すと画面に現れる
  settingsOverlay.hidden = false;
}

/* ---------- トースト(画面下にふわっと出る小さなお知らせ) ---------- */
// alert() はこのゲームを公開するページでは使えないことがあるので、
// 自分でメッセージ表示を作っている

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast"; // style.css のふわっと出るアニメーションが付く
  toast.textContent = message;

  // お知らせが同時にいくつも出たときは、上に積み上げて重ならないようにする
  // (実績の達成などで、いちどに2つ3つ出ることがあるため)
  const already = gameFrame.querySelectorAll(".toast").length;
  toast.style.bottom = (130 + already * 46) + "px";

  gameFrame.appendChild(toast);

  // アニメーションが終わったころ(2秒後)に消す。ゴミを残さないため
  setTimeout(function () {
    toast.remove();
  }, 2000);
}


/* ---------- データのリセット ---------- */

// 「データをリセット」ボタン → まず確認画面を出す(いきなり消さない!)
function openResetConfirm() {
  confirmOverlay.hidden = false;
}

// 確認画面で「はい」→ 本当にリセットする
function doReset() {
  // 1. 保存データを消す
  try {
    localStorage.removeItem("housekiSave");
  } catch (e) {
    // 消せなくてもそのまま進む
  }

  // 2. ゲームの変数をぜんぶ最初の状態に戻す
  gemCount = 0;
  totalGems = 0;
  tapCount = 0;
  spentGems = 0;
  upgrades.shape.level = 1;
  upgrades.color.level = 1;
  upgrades.size.level = 1;
  upgrades.speed.level = 1;
  upgrades.range.level = 1;
  unlockedStories = 1;
  spawnPaused = false;    // 湧きのお休み状態も解除する
  tutorialSeen = false;   // チュートリアルもまた見られるようにする
  firstChestDone = false; // はじめての宝箱もまた出るようにする
  // 「データをリセット」はぜんぶ最初から。家宝や図鑑・実績も消える
  heirlooms = 0;
  ownedTreasures = [];
  generation = 1;
  prestigeAsked = false;
  zukanFound = [];
  unlockedAchievements = [];
  claimedAchievements = [];
  chestOpened = 0;
  catCaught = 0;

  // 3. フィーバー中だったら終わらせて、
  //    画面に残っている宝石と宝箱をぜんぶ消す
  if (feverSecondsLeft > 0) {
    endFever();
  }
  mainArea.querySelectorAll(".gem, .chest, .event-guest").forEach(function (item) {
    item.remove();
  });

  // 4. 表示を新しくして、開いていた画面を閉じる
  updateDisplay();
  confirmOverlay.hidden = true;
  settingsOverlay.hidden = true;

  // 5. あつめる画面に戻して、はじめてボーナスからやり直し!
  showScreen("atsumeru");
  showToast("データをリセットしました");
  startWelcomeRush();     // すでにボーナス中なら何も起きない
  updateWelcomeBanner();  // バナーの数字を 0 / 50 に戻す
  showTutorialStep("welcome"); // おじょうさまのあいさつも最初から
}



/* =========================================================
   やかた画面(宝物庫・図鑑・実績)
   3つのタブを切り替えて使う。中身はこの下の関数たちが作る
   ========================================================= */

let mansionTab = "treasure"; // いま開いているタブ("treasure"・"zukan"・"achieve")

// どのタブを見せるかを決める。
//  ・宝物庫 … はじめてお屋敷を継ぐ(2代目になる)まで隠しておく
//  ・図鑑   … 宝物庫で「宝石図鑑」を買うまで隠しておく
// 最初は「実績」のタブだけが、横いっぱいに出ている
function updateMansionTabs() {
  document.getElementById("tab-treasure").hidden = generation < 2;
  document.getElementById("tab-zukan").hidden = !hasTreasure("zukan");
}

// タブを切り替える。name には "treasure"・"zukan"・"achieve" のどれかが入る
function showMansionTab(name) {
  updateMansionTabs(); // まず、いまどのタブが使えるかを決める

  // まだ開いていないタブを開こうとしたときは、実績のタブにもどす
  if (name === "treasure" && document.getElementById("tab-treasure").hidden) {
    name = "achieve";
  }
  if (name === "zukan" && document.getElementById("tab-zukan").hidden) {
    name = "achieve";
  }

  mansionTab = name;

  // 3つの中身を、選ばれたものだけ表示する
  document.getElementById("tab-body-treasure").hidden = name !== "treasure";
  document.getElementById("tab-body-zukan").hidden = name !== "zukan";
  document.getElementById("tab-body-achieve").hidden = name !== "achieve";

  // 選ばれているタブのボタンを光らせる
  document.getElementById("tab-treasure").classList.toggle("active", name === "treasure");
  document.getElementById("tab-zukan").classList.toggle("active", name === "zukan");
  document.getElementById("tab-achieve").classList.toggle("active", name === "achieve");

  // 開いたときに、中身を最新の状態で作り直す
  if (name === "treasure") {
    buildTreasureList();
  } else if (name === "zukan") {
    buildZukan();
  } else {
    buildAchieveList();
  }
}


/* ---------- タブ①:宝物庫(家宝で買う永久アップグレード) ---------- */

// 品物の一覧を作る(いちばん上の「宝物庫コーナー」の treasureItems から)
function buildTreasureList() {
  // 右上に、いま持っている家宝の数を出す
  document.getElementById("treasure-heirlooms").textContent = "🏺 " + heirlooms;

  // 上の説明文
  const note = document.getElementById("treasure-note");
  if (generation <= 1) {
    note.textContent = "お屋敷を継ぐ(プレステージ)と家宝がもらえて、ここで永久に消えない品が買えます。";
  } else {
    note.textContent = "買った品は、お屋敷を継いでも消えません。";
  }

  treasureList.innerHTML = ""; // まず一覧を空っぽにして、作り直す

  for (let i = 0; i < treasureItems.length; i++) {
    const item = treasureItems[i];
    const owned = hasTreasure(item.id);
    // 先に買っておく品(needs)があるなら、それを持っているか調べる
    const needsOk = item.needs === null || hasTreasure(item.needs);

    // カードの入れ物(ストアの商品カードと同じ作り)
    const card = document.createElement("div");
    card.className = "product-card treasure-card";
    if (owned) {
      card.classList.add("owned"); // 買ったものは薄くする
    }

    // 左:品物の絵(絵文字)
    const icon = document.createElement("div");
    icon.className = "product-icon";
    icon.textContent = item.icon;

    // 真ん中:名前と説明
    const info = document.createElement("div");
    info.className = "product-info";
    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = item.name;
    const description = document.createElement("div");
    description.className = "product-desc";
    description.textContent = item.description;
    if (!needsOk) {
      // まだ前の品を買っていないときは、何が必要かを教えてあげる
      description.textContent += "(先に「" + getTreasureName(item.needs) + "」が必要)";
    }
    info.appendChild(name);
    info.appendChild(description);

    // 右:買うボタン
    const buyButton = document.createElement("button");
    buyButton.className = "product-buy";
    if (owned) {
      buyButton.textContent = "所持";
      buyButton.disabled = true;
    } else if (!needsOk) {
      buyButton.textContent = "🔒";
      buyButton.disabled = true;
    } else {
      buyButton.textContent = "🏺 " + item.cost;
      buyButton.disabled = heirlooms < item.cost; // 家宝が足りなければ押せない
      buyButton.addEventListener("click", function () {
        buyTreasure(item);
      });
    }

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(buyButton);
    treasureList.appendChild(card);
  }
}

// id から品物の名前を調べる小さな関数(「先に◯◯が必要」の表示に使う)
function getTreasureName(id) {
  for (let i = 0; i < treasureItems.length; i++) {
    if (treasureItems[i].id === id) {
      return treasureItems[i].name;
    }
  }
  return "?";
}

// 家宝を払って品物を買う
function buyTreasure(item) {
  if (hasTreasure(item.id) || heirlooms < item.cost) {
    return; // もう持っている・家宝が足りないときは何もしない
  }

  heirlooms -= item.cost;
  ownedTreasures.push(item.id); // 買った品の id を覚えておく(ずっと消えない)

  playUpgradeSound();
  updateDisplay();
  saveGame();
  buildTreasureList(); // 一覧を作り直すと「所持」に変わる
  updateMansionTabs(); // 「宝石図鑑」を買ったら、図鑑のタブがその場で出てくる
  showToast("「" + item.name + "」を手に入れた!");
  checkAchievements();
}


/* ---------- タブ②:宝石図鑑(形10 × 色10 = 100種類) ---------- */

// 集めた宝石の「形の段階と色の段階」の組み合わせを図鑑に記録する。
// 例) 形3段階目・色5段階目 なら "3-5" という文字で覚えておく
function recordZukan(shapeStage, colorStage) {
  const key = shapeStage + "-" + colorStage;
  if (zukanFound.indexOf(key) === -1) {
    zukanFound.push(key); // まだ持っていない組み合わせなら図鑑に追加!
  }
}

// 図鑑のマス目(10×10)を作る
function buildZukan() {
  const note = document.getElementById("zukan-note");

  if (!hasTreasure("zukan")) {
    // まだ図鑑を買っていない人には、案内だけ出す
    note.textContent = "宝物庫で「宝石図鑑」を手に入れると、ここが開きます。";
    zukanGrid.innerHTML = "";
    return;
  }

  note.textContent =
    "あつめた種類 " + zukanFound.length + " / 100(獲得数 +" + zukanFound.length + "%)" +
    " ／ たて=形のだんかい・よこ=色のだんかい";

  zukanGrid.innerHTML = "";

  // たて(行)が形の段階、よこ(列)が色の段階
  for (let shapeStage = 1; shapeStage <= DESIGN_STAGE_COUNT; shapeStage++) {
    for (let colorStage = 1; colorStage <= DESIGN_STAGE_COUNT; colorStage++) {
      const cell = document.createElement("div");
      cell.className = "zukan-cell";
      cell.title = "形 " + shapeStage + " ・ 色 " + colorStage;

      if (zukanFound.indexOf(shapeStage + "-" + colorStage) !== -1) {
        // 見つけている組み合わせ → 宝石の絵を小さく表示する。
        // 宝石の型紙(template)から絵(SVG)だけを借りてくる
        const template = document.getElementById("gem-template-" + shapeStage);
        const gemSvg = template.content.firstElementChild.cloneNode(true).querySelector("svg");
        if (gemSvg !== null) {
          gemSvg.classList.add("zukan-gem");
          // 宝石と同じ計算で色を決める(赤→青の色相環)
          const hueStep = 240 / (DESIGN_STAGE_COUNT - 1);
          cell.style.setProperty("--hue", ((colorStage - 1) * hueStep) + "deg");
          cell.classList.add("found");
          cell.appendChild(gemSvg);
        }
      } else {
        cell.textContent = "?"; // まだ見つけていないマス
      }

      zukanGrid.appendChild(cell);
    }
  }
}


/* ---------- タブ③:実績(トロフィー) ---------- */

// まだ受け取っていないごほうびが何こあるか数える
function countClaimable() {
  let count = 0;
  for (let i = 0; i < unlockedAchievements.length; i++) {
    if (claimedAchievements.indexOf(unlockedAchievements[i]) === -1) {
      count += 1;
    }
  }
  return count;
}

// 実績の条件を満たしていないか、ぜんぶ調べる。
// 宝石を集めたとき・強化したとき・継いだときなどに呼ばれる。
// ※ ここでは「達成した」と記録するだけ。ごほうびの宝石は、
//   やかたの実績タブで「うけとる」ボタンを押したときにもらえる
// quiet に true を入れると、1つずつのお知らせを出さずにまとめて数える
// (ゲームを開いた瞬間に、お知らせがたくさん出ないようにするため)
function checkAchievements(quiet) {
  let count = 0; // 今回あたらしく達成した数

  for (let i = 0; i < achievements.length; i++) {
    const achievement = achievements[i];

    // もう達成ずみならとばす
    if (unlockedAchievements.indexOf(achievement.id) !== -1) {
      continue; // continue = この1回ぶんをとばして、次へ進む
    }

    // check() が true になったら達成!
    if (achievement.check()) {
      unlockedAchievements.push(achievement.id);
      count += 1;
      if (quiet !== true) {
        playUpgradeSound();
        showToast("実績「" + achievement.name + "」達成! やかたで受けとれますわ");
      }
    }
  }

  if (count > 0) {
    updateDisplay();
    saveGame();
    if (quiet === true) {
      showToast("実績を " + count + "個 達成! やかたで受けとれますわ");
    }
  }
}

// 「うけとる」ボタンを押したときの処理。ごほうびの宝石をもらう
function claimAchievement(achievement) {
  // 達成していない・もう受け取っているときは何もしない
  if (unlockedAchievements.indexOf(achievement.id) === -1 ||
      claimedAchievements.indexOf(achievement.id) !== -1) {
    return;
  }

  claimedAchievements.push(achievement.id); // 受け取ったと覚えておく
  gemCount += achievement.reward;

  playUpgradeSound();
  updateDisplay();
  saveGame();
  buildAchieveList(); // 一覧を作り直すと「達成」の表示に変わる
  showToast("「" + achievement.name + "」のごほうび 💎+" + achievement.reward + "!");
}

// 実績の一覧を作る
function buildAchieveList() {
  const waiting = countClaimable();
  let note = "達成 " + unlockedAchievements.length + " / " + achievements.length +
    "(ごほうびを受け取ると獲得数 +2%)";
  if (waiting > 0) {
    note += " ／ 受け取り待ち " + waiting + "こ!";
  }
  document.getElementById("achieve-note").textContent = note;

  achieveList.innerHTML = "";

  for (let i = 0; i < achievements.length; i++) {
    const achievement = achievements[i];
    const done = unlockedAchievements.indexOf(achievement.id) !== -1;
    const claimed = claimedAchievements.indexOf(achievement.id) !== -1;

    const card = document.createElement("div");
    card.className = "product-card achieve-card";
    if (!done) {
      card.classList.add("not-yet"); // まだのものは薄くする
    } else if (!claimed) {
      card.classList.add("can-claim"); // 受け取れるものは金色に光らせる
    }

    const icon = document.createElement("div");
    icon.className = "product-icon";
    icon.textContent = done ? achievement.icon : "❔";

    const info = document.createElement("div");
    info.className = "product-info";
    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = achievement.name;
    const description = document.createElement("div");
    description.className = "product-desc";
    description.textContent = achievement.detail + " / ごほうび 💎" + achievement.reward;
    info.appendChild(name);
    info.appendChild(description);

    card.appendChild(icon);
    card.appendChild(info);

    if (done && !claimed) {
      // 達成したけど、まだごほうびを受け取っていない → ボタンを出す
      const claimButton = document.createElement("button");
      claimButton.className = "product-buy achieve-claim";
      claimButton.textContent = "うけとる";
      claimButton.addEventListener("click", function () {
        claimAchievement(achievement);
      });
      card.appendChild(claimButton);
    } else {
      // 受け取りずみ →「達成」/ まだ達成していない →「…」
      const state = document.createElement("div");
      state.className = "achieve-state";
      state.textContent = claimed ? "達成" : "…";
      card.appendChild(state);
    }

    achieveList.appendChild(card);
  }
}


/* =========================================================
   お屋敷を継ぐ(プレステージ)
   5つの強化をぜんぶ Lv10 以上にすると継げる。
   宝石と強化レベルは0にもどるが、家宝がもらえて、
   宝物庫の品・図鑑・実績・ストーリーはぜんぶ引き継がれる
   ========================================================= */

// 「継ぐ」ボタン → まず確認画面を出す(いきなり実行しない!)
function openPrestigePanel() {
  if (!canPrestige()) {
    return;
  }
  const reward = getHeirloomReward();
  document.getElementById("prestige-reward").textContent = reward;
  document.getElementById("prestige-reward-text").textContent = reward;
  document.getElementById("prestige-next-gen").textContent = generation + 1;
  prestigeOverlay.hidden = false;
}

// 確認画面で「継ぐ」→ 本当に継承する
function doPrestige() {
  if (!canPrestige()) {
    return;
  }

  // 1. 家宝をもらって、代目を1つ進める
  const reward = getHeirloomReward();
  heirlooms += reward;
  generation += 1;

  // 2. リセットされるもの:持っている宝石と、5つの強化レベル
  gemCount = 0;
  upgrades.shape.level = 1;
  upgrades.color.level = 1;
  upgrades.size.level = 1;
  upgrades.speed.level = 1;
  upgrades.range.level = 1;
  spawnPaused = false;
  prestigeAsked = false; // 次にまた継げるようになったら、また声をかけてもらう

  // ※ 統計・ストーリー・図鑑・実績・チュートリアル済みはそのまま引き継がれる

  // 3. エレガントタイム中なら終わらせて、画面のものをかたづける
  if (feverSecondsLeft > 0) {
    endFever();
  }
  mainArea.querySelectorAll(".gem, .chest, .event-guest").forEach(function (item) {
    item.remove();
  });

  // 4. 宝物庫で「玄関の宝石箱」を買っていれば、宝石を持ってスタートできる
  if (hasTreasure("box")) {
    gemCount = BOX_START_GEMS;
  }

  // 5. 画面を新しくして、確認画面を閉じる
  updateDisplay();
  saveGame();
  prestigeOverlay.hidden = true;
  settingsOverlay.hidden = true;
  showScreen("atsumeru");

  // 6. 白いフラッシュの演出と、おじょうさまのお祝い
  showFlash();
  playFeverSound();
  showToast(generation + "代目になった! 家宝 🏺+" + reward);
  checkAchievements();

  // ちょうど6巡クリアしたときは、おまけのストーリーが解放される!
  if (generation === STORY_UNLOCK_GENERATION) {
    showTutorialStep("storyUnlocked");
  } else {
    showTutorialStep("prestigeDone");
  }

  // 7. 宝箱の予約をとりなおす(継ぐ前の予約が残らないように)
  if (firstChestDone) {
    scheduleChest();
  }
}

// 画面全体が一瞬ぱっと白く光る演出
function showFlash() {
  const flash = document.createElement("div");
  flash.className = "flash";
  gameFrame.appendChild(flash);
  setTimeout(function () {
    flash.remove();
  }, 900);
}


/* =========================================================
   使用人(自動収集)
   宝物庫で「使用人を雇う」を買うと、見ていなくても
   消えそうな宝石から順に拾ってくれる
   ========================================================= */

let servantTimer = null;

function servantLoop() {
  // 次のお掃除を予約してから、今回のお仕事をする。
  // 「使用人の手際」を買っていれば、間隔が半分(2倍の速さ)になる
  const wait = hasTreasure("hands") ? SERVANT_FAST_INTERVAL : SERVANT_INTERVAL;
  servantTimer = setTimeout(servantLoop, wait);

  // まだ雇っていない・宝石エリアが隠れているときは何もしない
  if (!hasTreasure("servant") || mainArea.hidden) {
    return;
  }

  // 消えかけ(点滅中)の宝石をいちばんに助ける。なければ、いちばん古い宝石
  let target = mainArea.querySelector(".gem.expiring:not(.collected)");
  if (target === null) {
    target = mainArea.querySelector(".gem:not(.collected)");
  }
  if (target === null) {
    return; // 拾う宝石がなければお休み
  }

  showServantMark(target); // 「🧹」のしるしをその場に出す
  collectGem(target, false); // 音は鳴らさずに、そっと拾う
}

// 使用人が拾った場所に、小さな「🧹」を出す
function showServantMark(gem) {
  const mark = document.createElement("span");
  mark.className = "servant-mark";
  mark.textContent = "🧹";
  mark.style.left = (gem.offsetLeft + gem.offsetWidth / 2 - 12) + "px";
  mark.style.top = (gem.offsetTop - 6) + "px";
  mainArea.appendChild(mark);
  setTimeout(function () {
    mark.remove();
  }, 800);
}


/* =========================================================
   ランダムイベント(黒猫・行商人)
   ユーザーLv5 から、ときどきお客さん(?)がやってくる
   ========================================================= */

let eventTimer = null;

// 次のイベントを予約する(90〜180秒後のどこかで起こる)
function scheduleEvent() {
  clearTimeout(eventTimer); // 予約は いつも1本だけ
  const waitSeconds = EVENT_WAIT_MIN + Math.random() * (EVENT_WAIT_MAX - EVENT_WAIT_MIN);
  eventTimer = setTimeout(startRandomEvent, waitSeconds * 1000);
}

// イベントを始める。出せないときは少し待ってから、もう一度ためす
function startRandomEvent() {
  if (mainArea.hidden || welcomeRushActive || tutorialStep !== null ||
      getUserLevel() < EVENT_UNLOCK_LEVEL || mainArea.querySelector(".event-guest")) {
    clearTimeout(eventTimer);
    eventTimer = setTimeout(startRandomEvent, 10000);
    return;
  }

  // 半分の確率で黒猫、半分の確率で行商人
  if (Math.random() < 0.5) {
    spawnCat();
  } else {
    spawnPeddler();
  }
}

// 🐈‍⬛ 黒猫:お屋敷に住みついた、気まぐれな黒猫。
// 宝石をくわえて、音もなく夜の闇を横切っていく。
// 消えてしまう前にタップして声をかけると、宝石を置いていってくれる
function spawnCat() {
  // まず、画面にある宝石を何個かくわえていく(持っている宝石は減らない)
  const gems = mainArea.querySelectorAll(".gem:not(.collected)");
  let stolen = 0;
  for (let i = 0; i < gems.length && i < CAT_STEAL; i++) {
    const gem = gems[i];
    const amount =
      Number(gem.dataset.shapeLevel) +
      (Number(gem.dataset.sizeLevel) - 1) +
      (Number(gem.dataset.colorLevel) - 1);
    stolen += Math.round(amount * getGemMultiplier());
    gem.remove();
  }
  if (stolen <= 0) {
    stolen = 10; // 画面に宝石がなかったときの、おみやげぶん
  }

  const cat = document.createElement("button");
  cat.className = "event-guest cat";
  cat.textContent = "🐈‍⬛"; // 黒猫。ほかの絵文字に変えてもOK
  cat.setAttribute("aria-label", "黒猫に声をかける");

  // 画面のはしから、反対のはしまで音もなく歩いていく
  const distance = mainArea.clientWidth + 80;
  cat.style.left = "-60px";
  cat.style.top = (20 + Math.random() * Math.max(0, mainArea.clientHeight - 100)) + "px";
  cat.style.setProperty("--run-distance", distance + "px");
  cat.style.animationDuration = CAT_LIFETIME + "s";

  let caught = false;

  cat.addEventListener("pointerdown", function () {
    if (caught) {
      return;
    }
    caught = true;
    catCaught += 1;
    gemCount += stolen;
    totalGems += stolen;
    cat.remove();

    playCollectSound();
    updateDisplay();
    saveGame();
    showToast("黒猫が宝石を置いていった! 💎+" + stolen);
    checkAchievements();
    scheduleEvent();
  });

  mainArea.appendChild(cat);
  showToast("あら、黒猫が宝石をくわえていますわ……");

  // 声をかけそびれると、黒猫は闇にとけて消えてしまう
  setTimeout(function () {
    if (!caught) {
      caught = true;
      cat.remove();
      showToast("黒猫は闇にとけて消えた……");
      scheduleEvent();
    }
  }, CAT_LIFETIME * 1000);
}

// 🧺 行商人:しばらく立ち止まっている。タップすると宝石をゆずってくれる
function spawnPeddler() {
  const peddler = document.createElement("button");
  peddler.className = "event-guest peddler";
  peddler.textContent = "🧺";
  peddler.setAttribute("aria-label", "行商人から宝石をもらう");

  peddler.style.left = (20 + Math.random() * Math.max(0, mainArea.clientWidth - 90)) + "px";
  peddler.style.top = (20 + Math.random() * Math.max(0, mainArea.clientHeight - 100)) + "px";

  // くれる宝石の数は、いまのユーザーレベルに合わせて増えていく
  const gift = Math.round(PEDDLER_GEMS_PER_LEVEL * getUserLevel() * getGemMultiplier());

  let met = false;

  peddler.addEventListener("pointerdown", function () {
    if (met) {
      return;
    }
    met = true;
    gemCount += gift;
    totalGems += gift;
    peddler.remove();

    playFeverSound();
    updateDisplay();
    saveGame();
    showToast("行商人から宝石をゆずってもらった! 💎+" + gift);
    checkAchievements();
    scheduleEvent();
  });

  mainArea.appendChild(peddler);
  showToast("行商人が訪ねてきましたわ。");

  // 話しかけないと、そのまま帰ってしまう
  setTimeout(function () {
    if (!met) {
      met = true;
      peddler.remove();
      scheduleEvent();
    }
  }, PEDDLER_LIFETIME * 1000);
}


/* ---------- ボタンとの関連付け ---------- */
// addEventListener("click", 関数) = 「クリックされたらこの関数を動かして」というお願い

// 各行の「Lv UP」ボタン → 押すとその場でレベルアップ
document.getElementById("lvup-size").addEventListener("click", function () {
  buyUpgrade("size");
});
document.getElementById("lvup-shape").addEventListener("click", function () {
  buyUpgrade("shape");
});
document.getElementById("lvup-color").addEventListener("click", function () {
  buyUpgrade("color");
});
document.getElementById("lvup-speed").addEventListener("click", function () {
  buyUpgrade("speed");
});
document.getElementById("lvup-range").addEventListener("click", function () {
  buyUpgrade("range");
});

// メニューの画面切り替え(あつめる ⇄ ストーリー)
document.getElementById("menu-atsumeru").addEventListener("click", function () {
  showScreen("atsumeru");
});
document.getElementById("menu-story").addEventListener("click", function () {
  showScreen("story");
});
document.getElementById("menu-store").addEventListener("click", function () {
  showScreen("store");
});
document.getElementById("menu-mansion").addEventListener("click", function () {
  showScreen("mansion");
});

// やかた画面の3つのタブ(宝物庫・図鑑・実績)
document.getElementById("tab-treasure").addEventListener("click", function () {
  showMansionTab("treasure");
});
document.getElementById("tab-zukan").addEventListener("click", function () {
  showMansionTab("zukan");
});
document.getElementById("tab-achieve").addEventListener("click", function () {
  showMansionTab("achieve");
});

// お屋敷を継ぐ(ボタン → 確認画面 → 継ぐ/やめておく)
document.getElementById("prestige-button").addEventListener("click", openPrestigePanel);
document.getElementById("prestige-yes").addEventListener("click", doPrestige);
document.getElementById("prestige-no").addEventListener("click", function () {
  prestigeOverlay.hidden = true;
});

// ストーリーの会話画面:どこをタップしても次のセリフに進む
storyScene.addEventListener("click", tapStoryScene);

// 会話画面の右上「✕」:途中でもストーリーをやめられる
document.getElementById("story-quit").addEventListener("click", function (event) {
  // stopPropagation = このクリックを、うしろの「次へ進む」に伝えない
  event.stopPropagation();
  endStory();
});


// せってい関係
document.getElementById("menu-settings").addEventListener("click", openSettings);
document.getElementById("settings-close").addEventListener("click", function () {
  settingsOverlay.hidden = true;
});
// リセット関係(ボタン → 確認画面 → はい/いいえ)
document.getElementById("reset-button").addEventListener("click", openResetConfirm);
document.getElementById("reset-yes").addEventListener("click", doReset);
document.getElementById("reset-no").addEventListener("click", function () {
  confirmOverlay.hidden = true; // 「いいえ」なら確認画面を閉じるだけ
});

/* ---------- ゲーム開始! ---------- */

// まず保存データを読み込んで、画面に表示する
loadGame();
updateDisplay();
showScreen("atsumeru"); // 最初は「あつめる」画面から

// 宝石が湧き続けるループと、古い宝石が消えていくループを動かし始める
spawnLoop();
decayLoop();

// 使用人のお掃除ループ(「使用人を雇う」を買うまでは何もしない)と、
// ときどき起こるランダムイベント(黒猫・行商人)の予約を始める
servantLoop();
scheduleEvent();

// 前に遊んだぶんで、もう達成できている実績があればここでまとめて受けとる
checkAchievements(true);

// まだ50個あつめていない人(=はじめての人)は、はじめてボーナスで開始!
// とちゅうでページを閉じても、開き直せば続きから再開する
if (totalGems < WELCOME_GOAL) {
  startWelcomeRush();
}

// チュートリアルの続きから案内する
if (!tutorialSeen) {
  if (totalGems < WELCOME_GOAL) {
    showTutorialStep("welcome"); // 最初のあいさつから
  } else {
    showTutorialStep("lvupIntro"); // 50個は集めてあるので、Lv UPの案内から
  }
}

// 宝箱について:
// ・特典の宝箱をもう開けた人 → ふつうの宝箱を予約(2〜5分後に出る)
// ・レベル5に届いているのに特典をまだ開けていない人 → もう一度特典を出す
if (firstChestDone) {
  scheduleChest();
} else if (getUserLevel() >= CHEST_UNLOCK_LEVEL) {
  spawnFirstChest();
}
