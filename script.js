/* =========================================================
   script.js — ゲームの動き(プログラム)を書くファイル

   このゲームの流れ:
   1. 画面に宝石が2〜3個、ランダムな場所に出現する
   2. 宝石をタップすると、効果音と共にキラッと消えて集まる
   3. 「Lv UP」ボタンで、集めた宝石を使って強化ができる
      ・大きさ … 宝石が大きくなってタップしやすくなる
      ・形   … 1個で集まる宝石の数が増える
      ・色   … 虹色のレア宝石(5倍)が出やすくなる
   4. 「せってい」から、これまでの統計が見られる
   5. データはブラウザに保存される(次に開いたときも残る)
   ========================================================= */

/* =========================================================
   ★ 画像さしかえコーナー ★
   宝石を自分の画像にしたいときは、画像ファイルをこのフォルダーに
   入れて、下の null を "ファイル名" に書きかえるだけ!
   (例)  1: "gem.png",
   null のままの形は、HTML の型紙(SVG)で描いた宝石になる
   ========================================================= */
const gemImages = {
  1: null, // 形Lv1: 五角形の宝石のかわりに使う画像(例: "gem.png")
  2: null, // 形Lv2: 四角形
  3: null, // 形Lv3: 七角形
  4: null, // 形Lv4: ハート型
  5: null, // 形Lv5〜: 星型
};


/* =========================================================
   ★ ストーリー編集コーナー ★
   ストーリーはここに書くだけで、ゲームの一覧に自動で並ぶ!
   { title: "タイトル", text: `本文` } のかたまりを増やせば話も増える。
   本文はバッククォート( ` )で囲むと、改行もそのまま使えて書きやすい
   ========================================================= */

// ストーリー1話を解放するのに必要な宝石(ダイヤ)の数
const STORY_COST = 100;

const stories = [
  {
    title: "各地の宝石たち",
    text: `世界のあちこちには、ふしぎな宝石が眠っているという。

赤い宝石は、燃える山のふもとで。
青い宝石は、深い湖の底で。
だれかに見つけてもらうのを、静かに待っている。

今日もこの屋敷には、どこからか宝石が集まってくる。
――さあ、あつめよう。`,
  },
  {
    title: "屋敷の少女",
    text: `この屋敷には、黒い服の少女がひとりで住んでいる。

少女は毎晩、集まってきた宝石をひとつずつ磨く。
「きれいになったね」
宝石はうれしそうに、きらりと光った。

少女がなぜ宝石を集めているのか、それはまだ、だれも知らない。`,
  },
  {
    title: "星型の宝石のうわさ",
    text: `「星のかたちをした宝石は、願いをかなえるらしい」

そんなうわさを、風が運んできた。
少女は窓の外を見上げる。
夜空の星と、手のひらの宝石が、同じ色にまたたいた。

――もっと、あつめてみようか。`,
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

// 「const」は「変わらない値」を作る書き方
const MAX_LEVEL = 10; // 強化レベルの上限

// ---- 宝石の湧き方(増え方・消え方)の設定 ----
// 宝石は一定の間隔でどんどん湧いてたまっていき、
// 古いものから順に、点滅してから消えていく。
// 「気持ちよく一気に集められる」+「消えるまえに拾いたくなる」バランス!
const GEM_CAP = 100;           // 画面に出る宝石の上限(画面いっぱい)
const GEM_RESUME = 80;         // 上限に達したあと、この数まで減ると湧きが再開する
const SPAWN_INTERVAL = 900;    // 何ミリ秒ごとに1個湧くか(ふだん)
const SPAWN_SPEED_BONUS = 60;  // 「秒数」レベル1つごとに、湧きが何ミリ秒早くなるか
const RUSH_INTERVAL = 150;     // はじめてボーナス/エレガントタイム中の湧き間隔
const RUSH_BURST = 12;         // ボーナスなどが始まった瞬間に一気に出す数
const DECAY_INTERVAL = 3500;   // 何ミリ秒ごとに、いちばん古い宝石が消え始めるか
const DECAY_MIN = 6;           // 画面がこの数以下なら消えない(集めている人の邪魔をしない)
const DECAY_FADE_TIME = 1500;  // 消えるまでの点滅時間(この間にタップすれば救出できる!)
let spawnPaused = false;       // 上限に達して湧きがお休み中かどうか

// ---- 宝箱とフィーバータイムの設定 ----
const FEVER_SECONDS = 30;    // フィーバータイムの長さ(秒)
const CHEST_WAIT_MIN = 120;  // 次の宝箱が出るまでの最短(秒)= 2分
const CHEST_WAIT_MAX = 300;  // 最長(秒)= 5分
const CHEST_LIFETIME = 20;   // 宝箱を開けないと消えるまでの時間(秒)
const CHEST_UNLOCK_LEVEL = 5; // 宝箱が解禁されるユーザーレベル

let feverSecondsLeft = 0;    // フィーバーの残り秒数(0なら通常モード)
let feverCountTimer = null;  // 残り時間をカウントダウンするタイマー

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
// 前の強化を Lv MAX まで上げると、次の強化が解放される!
const UPGRADE_ORDER = ["shape", "color", "size", "speed", "range"];

// その強化がもう解放されているかどうかを調べる関数。
// true(はい)か false(いいえ)が返ってくる
function isUpgradeUnlocked(type) {
  const place = UPGRADE_ORDER.indexOf(type); // 順番の何番目か(0から)
  if (place === 0) {
    return true; // 最初の「形」はいつでも解放されている
  }
  // ひとつ前の強化が MAX なら解放!
  const previousType = UPGRADE_ORDER[place - 1];
  return upgrades[previousType].level >= MAX_LEVEL;
}

// 次のレベルに上げるのに必要な宝石の数。
// レベル1→2 は 10個、2→3 は 20個…と、レベル×10 で増えていく
function upgradeCost(level) {
  return level * 10;
}


/* ---------- 画面の部品を取ってくる ---------- */
// document.getElementById("名前") で、HTML の id="名前" の部品を取れる

const gemCountDisplay = document.getElementById("gem-count"); // 宝石の数の表示
const userLevelDisplay = document.getElementById("user-level"); // レベルの表示
const mainArea = document.getElementById("main-area");         // 宝石が出るエリア
const statusPanel = document.getElementById("status-panel");   // 強化パネル
const storyScreen = document.getElementById("story-screen");   // ストーリー画面
const storyList = document.getElementById("story-list");       // ストーリーの一覧
const storyOverlay = document.getElementById("story-overlay"); // ストーリーを読む画面
const storeScreen = document.getElementById("store-screen");   // ストア画面
const storeList = document.getElementById("store-list");       // 商品の一覧
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
    };
    localStorage.setItem("housekiSave", JSON.stringify(data));
  } catch (e) {
    // 保存できない環境では何もしない(ゲームはそのまま遊べる)
  }
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

  // 形レベルに合った型紙(template)を選んで、コピーして宝石ボタンを作る。
  // 形は5種類なので、Lv5以上はずっと星型。
  // Math.min(a, b) は「a と b の小さいほう」を返す
  const shapeNumber = Math.min(gemShapeLevel, 5);
  const gemTemplate = document.getElementById("gem-template-" + shapeNumber);
  const gem = gemTemplate.content.firstElementChild.cloneNode(true);

  // 抽選したレベルを、宝石自身にメモしておく(dataset = 部品に付けられるメモ)。
  // タップされたときの点数計算は、このメモを見て行う
  gem.dataset.shapeLevel = gemShapeLevel;
  gem.dataset.sizeLevel = gemSizeLevel;
  gem.dataset.colorLevel = gemColorLevel;

  // ★ 画像さしかえコーナーに画像が設定されていたら、
  //    SVG のかわりにその画像を表示する
  const imageFile = gemImages[shapeNumber];
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
  // さらに、この宝石の「大きさレベル」1つにつき +5ピクセルずつ大きくなる。
  // ただし大きくなりすぎると画面いっぱいになってしまうので、
  // 見た目の成長は Lv7(+30ピクセル)で打ち止め(ポイントは増え続ける!)
  // Math.random() は「0以上1未満のランダムな数」を出してくれる
  const growLevel = Math.min(gemSizeLevel - 1, 6);
  const size = 60 + Math.random() * 50 + growLevel * 5;

  // 「範囲」レベルで、タップが当たる見えない余白(padding)を広げる。
  // 1レベルごとに、まわり +3ピクセルずつ当たりやすくなる
  const hitPadding = (upgrades.range.level - 1) * 3;
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

  // 色を決める。基本の色は「赤」で、色レベルが高い宝石ほど
  // 色相環(赤→オレンジ→黄→緑→青)を進んだ色になる。
  // 赤(0度)から青(240度)までを9歩で進むので、1歩 = 240 ÷ 9 ≒ 26.7度。
  // 例: 色Lv1 = 0度(赤)、色Lv5 ≒ 107度(緑)、色Lv10 = 240度(青)
  const hueStep = 240 / (MAX_LEVEL - 1);
  const hue = (gemColorLevel - 1) * hueStep;
  gem.style.setProperty("--hue", hue + "deg"); // style.css の hue-rotate で使われる

  // この宝石がタップされたら collectGem を動かす。
  // 「click」ではなく「pointerdown」を使うのがポイント!
  // click はスマホで2本指同時にタップしても1つしか発生しないけど、
  // pointerdown は指1本ごとに発生するので、複数同時タップで複数集められる
  gem.addEventListener("pointerdown", function () {
    collectGem(gem);
  });

  // メインエリアに追加すると、ぽんっと画面に現れる
  mainArea.appendChild(gem);
}


/* ---------- 宝石をタップして集めたときの処理 ---------- */

function collectGem(gem) {
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
  const amount = gemShapeLevel + (gemSizeLevel - 1) + (gemColorLevel - 1);

  // 2. 宝石を増やして、統計も数える
  gemCount += amount;
  totalGems += amount;
  tapCount += 1;

  // 3. 画面の数字を新しくして、保存する
  updateDisplay();
  saveGame();

  // 4. キラーン♪ と鳴らす
  playCollectSound();

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

  // 9. 「タップすると宝石が集められるわ。」のセリフ中に
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
    // Lv UPボタンの右に出して、ボタンを指す。セリフ中は他の場所は触れない
    placeBubbleNear(document.getElementById("lvup-shape"), "right");
    tutorialBlocker.hidden = false;
    if (step === "shapeTry") {
      // このときだけ、形の Lv UP ボタンは特別に押せる!
      // そして実際にレベルを上げるまで進めない(OKボタンは出さない)
      setTutorialAllow(document.getElementById("lvup-shape"));
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

// 次の宝箱の出現を予約する(2〜5分後のどこかでランダムに出る)
function scheduleChest() {
  const waitSeconds = CHEST_WAIT_MIN + Math.random() * (CHEST_WAIT_MAX - CHEST_WAIT_MIN);
  setTimeout(spawnChest, waitSeconds * 1000); // ×1000 で秒→ミリ秒にする
}

// 宝箱を1個、ランダムな場所に出現させる
function spawnChest() {
  // ストーリー画面などで宝石エリアが隠れているとき、フィーバー中、
  // はじめてボーナス中は、少し待ってからもう一度チャレンジ
  if (mainArea.hidden || feverSecondsLeft > 0 || welcomeRushActive) {
    setTimeout(spawnChest, 5000);
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
  feverSecondsLeft = FEVER_SECONDS;
  mainArea.classList.add("fever"); // 画面が金色に光る(style.css)
  playFeverSound();
  showToast("エレガントタイム! " + FEVER_SECONDS + "秒間、宝石ざくざく!");

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
  feverSecondsLeft = 0; // spawnLoop の湧きもふつうの速さに戻る
  clearInterval(feverCountTimer); // カウントダウンをやめる
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

  // MAXになったら、次の強化が解放されたことをお知らせする
  const place = UPGRADE_ORDER.indexOf(type);
  const nextType = UPGRADE_ORDER[place + 1]; // 次がなければ undefined になる
  if (up.level >= MAX_LEVEL && nextType !== undefined) {
    showToast(up.name + " がMAX! 「" + upgrades[nextType].name + "」の強化が解放された!");
  } else {
    showToast(up.name + " が Lv." + up.level + " になった!");
  }

  // チュートリアルの「形のレベルを上げてみて頂戴」の最中なら、
  // 実際に上げられたので、ほめてもらえるセリフへ進む
  if (tutorialStep === "shapeTry" && type === "shape") {
    showTutorialStep("praise");
  }

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

  // …選ばれた画面だけを表示する(開くときに一覧を最新の状態で作り直す)
  if (name === "story") {
    storyScreen.hidden = false;
    buildStoryList();
  } else if (name === "store") {
    storeScreen.hidden = false;
    buildStoreList();
  } else {
    // "atsumeru"(宝石エリアと強化パネルのセット)
    mainArea.hidden = false;
    statusPanel.hidden = false;
  }

  // いま開いている画面のメニューボタンを光らせる
  document.getElementById("menu-atsumeru").classList.toggle("active", name === "atsumeru");
  document.getElementById("menu-story").classList.toggle("active", name === "story");
  document.getElementById("menu-store").classList.toggle("active", name === "store");
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
        openStoryReader(i);
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
}

// ストーリーを読む画面を開く。index は何番目のお話か(0から)
function openStoryReader(index) {
  document.getElementById("story-read-title").textContent =
    "✦ " + (index + 1) + ". " + stories[index].title + " ✦";
  document.getElementById("story-read-text").textContent = stories[index].text;
  storyOverlay.hidden = false;
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

  // 3. フィーバー中だったら終わらせて、
  //    画面に残っている宝石と宝箱をぜんぶ消す
  if (feverSecondsLeft > 0) {
    endFever();
  }
  mainArea.querySelectorAll(".gem, .chest").forEach(function (item) {
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

// ストーリーを読む画面の「とじる」
document.getElementById("story-close").addEventListener("click", function () {
  storyOverlay.hidden = true;
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
