/* =========================================================
   script.js — ゲームの動き(プログラム)を書くファイル

   このゲームの流れ:
   1. 画面に宝石が2〜3個、ランダムな場所に出現する
   2. 宝石をクリック(タップ)すると、効果音と共にキラッと消える
   3. 宝石の数(gemCount)が 1 増えて、画面の数字が新しくなる
   4. 少し待つと、また新しい宝石が出現する
   5. 数はブラウザに保存される(次に開いたときも残る)
   ========================================================= */

/* ---------- ゲームのデータ(変数) ---------- */

// 集めた宝石の数。「let」は「あとで中身が変わる変数」を作る書き方
let gemCount = 0;

// ユーザーのレベル(今はまだ 1 のまま。レベルアップ機能はこれから作る)
let userLevel = 1;

// 画面に同時に出る宝石の最大数。「const」は「変わらない値」を作る書き方
const MAX_GEMS = 3;


/* ---------- 画面の部品を取ってくる ---------- */
// document.getElementById("名前") で、HTML の id="名前" の部品を取れる

const gemCountDisplay = document.getElementById("gem-count"); // 宝石の数の表示
const userLevelDisplay = document.getElementById("user-level"); // レベルの表示
const mainArea = document.getElementById("main-area");         // 宝石が出るエリア
const gemTemplate = document.getElementById("gem-template");   // 宝石の型紙


/* ---------- 画面の表示を新しくする関数 ---------- */
// 「関数」= よく使う処理に名前をつけてまとめたもの

function updateDisplay() {
  // toLocaleString() を使うと 1000 → 「1,000」のようにカンマ付きになる
  gemCountDisplay.textContent = gemCount.toLocaleString();
  userLevelDisplay.textContent = userLevel;
}


/* ---------- 宝石の数を保存する・読み込む ---------- */
// localStorage = ブラウザにデータを覚えさせておける場所。
// これのおかげで、ページを閉じても宝石の数が消えない!
// ブラウザの設定によっては使えないこともあるので、
// try/catch で「失敗してもゲームは止めない」ようにしている

function saveGame() {
  try {
    localStorage.setItem("gemCount", gemCount);
  } catch (e) {
    // 保存できない環境では何もしない(ゲームはそのまま遊べる)
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem("gemCount");
    if (saved !== null) {
      // localStorage は文字として保存するので、Number() で数字に戻す
      gemCount = Number(saved);
    }
  } catch (e) {
    // 読み込めない環境では 0 からスタート
  }
}


/* ---------- キラーン♪ という効果音 ---------- */
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

  // 鳴らして、0.4秒後に止める
  osc.start(startTime);
  osc.stop(startTime + 0.4);
}

// 「キラーン♪」= 高い音を2つ、少しずらして重ねている
function playCollectSound() {
  try {
    if (audioContext === null) {
      audioContext = new AudioContext();
    }
    const now = audioContext.currentTime; // 今の時刻
    playNote(1319, now);        // ミの音(高い)
    playNote(1760, now + 0.08); // ラの音(もっと高い)を少し遅れて
  } catch (e) {
    // 音が出せない環境でも、ゲームは止めずに続ける
  }
}


/* ---------- 「+1」がふわっと飛ぶ演出 ---------- */
// x, y は表示する場所の座標(メインエリアの左上からの距離)

function showPlusOne(x, y) {
  // <span> という部品を新しく作って、「+1」と書く
  const plusOne = document.createElement("span");
  plusOne.textContent = "+1";
  plusOne.className = "plus-one"; // style.css のアニメーションが付く

  plusOne.style.left = (x - 15) + "px";
  plusOne.style.top = (y - 30) + "px";

  // メインエリアの中に追加すると画面に現れる
  mainArea.appendChild(plusOne);

  // アニメーションが終わったころ(0.8秒後)に消す。ゴミを残さないため
  setTimeout(function () {
    plusOne.remove();
  }, 800);
}


/* ---------- 宝石を1個、ランダムな場所に出現させる ---------- */

function spawnGem() {
  // すでに画面に MAX_GEMS 個あったら、これ以上は出さない
  const gemsOnScreen = mainArea.querySelectorAll(".gem").length;
  if (gemsOnScreen >= MAX_GEMS) {
    return; // 「return」= ここで関数を終わりにする
  }

  // 型紙(template)をコピーして、新しい宝石ボタンを作る
  const gem = gemTemplate.content.firstElementChild.cloneNode(true);

  // 大きさをランダムに決める(60〜110ピクセル)
  // Math.random() は「0以上1未満のランダムな数」を出してくれる
  const size = 60 + Math.random() * 50;
  gem.style.width = size + "px";

  // 出現する場所をランダムに決める(エリアからはみ出さない範囲で)
  const areaWidth = mainArea.clientWidth;   // エリアの横幅
  const areaHeight = mainArea.clientHeight; // エリアの縦幅
  const x = 10 + Math.random() * (areaWidth - size - 20);
  const y = 10 + Math.random() * (areaHeight - size - 20);
  gem.style.left = x + "px";
  gem.style.top = y + "px";

  // 色をランダムに変える(色相を0〜360度回す。style.css の --hue で使われる)
  gem.style.setProperty("--hue", Math.floor(Math.random() * 360) + "deg");

  // この宝石がクリックされたら collectGem を動かす
  gem.addEventListener("click", function () {
    collectGem(gem);
  });

  // メインエリアに追加すると、ぽんっと画面に現れる
  mainArea.appendChild(gem);
}


/* ---------- 宝石をクリックして集めたときの処理 ---------- */

function collectGem(gem) {
  // 消えている途中の宝石をもう一度クリックしても、二重に数えない
  if (gem.classList.contains("collected")) {
    return;
  }

  // 1. 宝石を 1 個増やす(gemCount = gemCount + 1 と同じ意味)
  gemCount += 1;

  // 2. 画面の数字を新しくして、保存する
  updateDisplay();
  saveGame();

  // 3. キラーン♪ と鳴らす
  playCollectSound();

  // 4. 宝石のあった場所(真ん中)に「+1」を飛ばす
  //    offsetLeft/offsetTop = メインエリアの左上から宝石までの距離
  const centerX = gem.offsetLeft + gem.clientWidth / 2;
  const centerY = gem.offsetTop + gem.clientHeight / 2;
  showPlusOne(centerX, centerY);

  // 5. 「collected」クラスを付けると、キラッと消えるアニメーションが始まる
  gem.classList.add("collected");

  // 6. アニメーションが終わったころ(0.4秒後)に、宝石を画面から取り除く
  setTimeout(function () {
    gem.remove();
  }, 400);

  // 7. 少し待ってから(0.5〜1.5秒後)、新しい宝石を出現させる
  const waitTime = 500 + Math.random() * 1000;
  setTimeout(spawnGem, waitTime);
}


/* ---------- まだ作っていないボタンたち ---------- */
// 押すと「準備中」のメッセージを出すだけ。中身はこれから作っていく!

function comingSoon() {
  alert("この機能はまだ準備中です!おたのしみに");
}

document.getElementById("lvup-button").addEventListener("click", comingSoon);
document.getElementById("menu-atsumeru").addEventListener("click", comingSoon);
document.getElementById("menu-store").addEventListener("click", comingSoon);
document.getElementById("menu-story").addEventListener("click", comingSoon);
document.getElementById("menu-settings").addEventListener("click", comingSoon);


/* ---------- ゲーム開始! ---------- */

// まず保存データを読み込んで、画面に表示する
loadGame();
updateDisplay();

// 最初の宝石たちを、0.3秒ずつずらして3個出現させる
setTimeout(spawnGem, 300);
setTimeout(spawnGem, 600);
setTimeout(spawnGem, 900);
