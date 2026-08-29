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


/* ---------- ゲームのデータ(変数) ---------- */

// 「let」は「あとで中身が変わる変数」を作る書き方
let gemCount = 0;     // いま持っている宝石(強化に使うと減る)
let totalGems = 0;    // これまでに集めた宝石の総数(統計用。減らない)
let tapCount = 0;     // 宝石をタップした回数(統計用)
let spentGems = 0;    // 強化につかった宝石の数(統計用)
let unlockedStories = 1; // 読めるストーリーの数(最初は1話目だけ読める)

// 「const」は「変わらない値」を作る書き方
const MAX_GEMS = 3;   // 画面に同時に出る宝石の最大数
const MAX_LEVEL = 10; // 強化レベルの上限

// 保存データのバージョン。ゲームのルールを大きく変えたときに
// この数字を上げると、みんなの古い保存データが1回だけ自動リセットされる
const SAVE_VERSION = 2;

// 3種類の強化のデータをひとまとめにしたもの。
// upgrades.size.level のように「.」でつないで中身を取り出せる
const upgrades = {
  size:  { name: "大きさ", level: 1 },
  shape: { name: "形",     level: 1 },
  color: { name: "色",     level: 1 },
};

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
const settingsOverlay = document.getElementById("settings-overlay"); // せってい画面
const confirmOverlay = document.getElementById("confirm-overlay");   // リセット確認画面
const gameFrame = document.querySelector(".game"); // ゲーム全体の枠(トースト表示に使う)


/* ---------- 画面の表示を新しくする関数 ---------- */

// 強化1種類ぶんの表示(レベル・ボタンのお値段)を新しくする。
// type には "size"(大きさ)・"shape"(形)・"color"(色)のどれかが入る
function updateOneUpgrade(type) {
  const up = upgrades[type]; // upgrades["size"] は upgrades.size と同じ意味

  // 右端のレベル表示
  document.getElementById(type + "-level").textContent = up.level;

  // Lv UP ボタンのお値段と、押せるかどうか
  const button = document.getElementById("lvup-" + type);
  const costDisplay = document.getElementById(type + "-cost");
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

function updateDisplay() {
  // toLocaleString() を使うと 1000 → 「1,000」のようにカンマ付きになる
  gemCountDisplay.textContent = gemCount.toLocaleString();

  // ユーザーレベル = 強化した回数ぶんだけ上がる(最初は全部Lv1なので1)
  const level = upgrades.size.level + upgrades.shape.level + upgrades.color.level - 2;
  userLevelDisplay.textContent = level;

  // 宝石が増減すると「Lv UP ボタンを押せるかどうか」も変わるので、
  // ステータスパネルの表示もここでまとめて新しくする
  updateOneUpgrade("size");
  updateOneUpgrade("shape");
  updateOneUpgrade("color");
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
      sizeLevel: upgrades.size.level,
      shapeLevel: upgrades.shape.level,
      colorLevel: upgrades.color.level,
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
    upgrades.size.level = data.sizeLevel || 1;
    upgrades.shape.level = data.shapeLevel || 1;
    upgrades.color.level = data.colorLevel || 1;
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


/* ---------- 宝石を1個、ランダムな場所に出現させる ---------- */

function spawnGem() {
  // ストーリー画面などを見ていて宝石エリアが隠れているときは、
  // 少し待ってからもう一度チャレンジする
  if (mainArea.hidden) {
    setTimeout(spawnGem, 1000);
    return;
  }

  // すでに画面に MAX_GEMS 個あったら、これ以上は出さない
  const gemsOnScreen = mainArea.querySelectorAll(".gem").length;
  if (gemsOnScreen >= MAX_GEMS) {
    return; // 「return」= ここで関数を終わりにする
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
  gem.style.width = size + "px";

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

  // この宝石がクリックされたら collectGem を動かす
  gem.addEventListener("click", function () {
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

  // 8. 少し待ってから(0.5〜1.5秒後)、新しい宝石を出現させる
  const waitTime = 500 + Math.random() * 1000;
  setTimeout(spawnGem, waitTime);
}


/* ---------- 強化(Lv UP)の処理 ---------- */
// type には "size"・"shape"・"color" のどれかが入る

function buyUpgrade(type) {
  const up = upgrades[type];

  // 上限チェック(ボタンは押せないはずだけど、念のため)
  if (up.level >= MAX_LEVEL) {
    return;
  }

  // 宝石が足りるかチェック
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
  showToast(up.name + " が Lv." + up.level + " になった!");
}


/* ---------- 画面の切り替え(あつめる ⇄ ストーリー) ---------- */
// name には "atsumeru" か "story" が入る

function showScreen(name) {
  const isStory = name === "story";

  // hidden を付けたり外したりして、見える画面を切り替える
  mainArea.hidden = isStory;
  statusPanel.hidden = isStory;
  storyScreen.hidden = !isStory;

  // ストーリー画面を開くときは、一覧を最新の状態で作り直す
  if (isStory) {
    buildStoryList();
  }

  // いま開いている画面のメニューボタンを光らせる
  document.getElementById("menu-atsumeru").classList.toggle("active", !isStory);
  document.getElementById("menu-story").classList.toggle("active", isStory);
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
  upgrades.size.level = 1;
  upgrades.shape.level = 1;
  upgrades.color.level = 1;
  unlockedStories = 1;

  // 3. 画面に残っている宝石をぜんぶ消す
  const gems = mainArea.querySelectorAll(".gem");
  gems.forEach(function (gem) {
    gem.remove();
  });

  // 4. 表示を新しくして、開いていた画面を閉じる
  updateDisplay();
  confirmOverlay.hidden = true;
  settingsOverlay.hidden = true;

  // 5. あつめる画面に戻して、最初の宝石たちをまた出現させて、お知らせを出す
  showScreen("atsumeru");
  setTimeout(spawnGem, 300);
  setTimeout(spawnGem, 600);
  setTimeout(spawnGem, 900);
  showToast("データをリセットしました");
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

// メニューの画面切り替え(あつめる ⇄ ストーリー)
document.getElementById("menu-atsumeru").addEventListener("click", function () {
  showScreen("atsumeru");
});
document.getElementById("menu-story").addEventListener("click", function () {
  showScreen("story");
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

// まだ作っていないボタン(押すと「準備中」のメッセージを出すだけ)
function comingSoon() {
  showToast("この機能はまだ準備中です!おたのしみに");
}

document.getElementById("menu-store").addEventListener("click", comingSoon);


/* ---------- ゲーム開始! ---------- */

// まず保存データを読み込んで、画面に表示する
loadGame();
updateDisplay();
showScreen("atsumeru"); // 最初は「あつめる」画面から

// 最初の宝石たちを、0.3秒ずつずらして3個出現させる
setTimeout(spawnGem, 300);
setTimeout(spawnGem, 600);
setTimeout(spawnGem, 900);
