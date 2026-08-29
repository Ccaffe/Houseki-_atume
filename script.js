/* =========================================================
   script.js — ゲームの動き(プログラム)を書くファイル

   このゲームの流れ:
   1. 大きな宝石をクリックする
   2. 宝石の数(gemCount)が 1 増える
   3. 画面の数字を新しくして、「+1」の文字を飛ばす
   4. 数をブラウザに保存する(次に開いたときも残る)
   ========================================================= */

/* ---------- ゲームのデータ(変数) ---------- */

// 集めた宝石の数。「let」は「あとで中身が変わる変数」を作る書き方
let gemCount = 0;

// ユーザーのレベル(今はまだ 1 のまま。レベルアップ機能はこれから作る)
let userLevel = 1;


/* ---------- 画面の部品を取ってくる ---------- */
// document.getElementById("名前") で、HTML の id="名前" の部品を取れる

const gemCountDisplay = document.getElementById("gem-count"); // 宝石の数の表示
const userLevelDisplay = document.getElementById("user-level"); // レベルの表示
const bigGem = document.getElementById("big-gem");             // 大きな宝石
const mainArea = document.getElementById("main-area");         // 宝石のあるエリア


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

function saveGame() {
  localStorage.setItem("gemCount", gemCount);
}

function loadGame() {
  // 保存されたデータを取り出す(まだ何もなければ null が返ってくる)
  const saved = localStorage.getItem("gemCount");
  if (saved !== null) {
    // localStorage は文字として保存するので、Number() で数字に戻す
    gemCount = Number(saved);
  }
}


/* ---------- 「+1」がふわっと飛ぶ演出 ---------- */
// x, y はクリックした場所の座標(画面の左上からの距離)

function showPlusOne(x, y) {
  // <span> という部品を新しく作って、「+1」と書く
  const plusOne = document.createElement("span");
  plusOne.textContent = "+1";
  plusOne.className = "plus-one"; // style.css のアニメーションが付く

  // クリックした場所に置く(少しずらして文字の真ん中が来るようにする)
  plusOne.style.left = (x - 15) + "px";
  plusOne.style.top = (y - 30) + "px";

  // メインエリアの中に追加すると画面に現れる
  mainArea.appendChild(plusOne);

  // アニメーションが終わったころ(0.8秒後)に消す。ゴミを残さないため
  setTimeout(function () {
    plusOne.remove();
  }, 800);
}


/* ---------- 宝石をクリックしたときの処理 ---------- */
// addEventListener("click", 関数) = 「クリックされたらこの関数を動かして」というお願い

bigGem.addEventListener("click", function (event) {
  // 1. 宝石を 1 個増やす(gemCount = gemCount + 1 と同じ意味)
  gemCount += 1;

  // 2. 画面の数字を新しくする
  updateDisplay();

  // 3. クリックした場所に「+1」を飛ばす
  //    event.clientX/Y は画面全体での座標なので、
  //    メインエリアの左上からの座標に計算し直す
  const areaPosition = mainArea.getBoundingClientRect();
  const x = event.clientX - areaPosition.left;
  const y = event.clientY - areaPosition.top;
  showPlusOne(x, y);

  // 4. 忘れないうちに保存する
  saveGame();
});


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
// ページを開いたら、まず保存データを読み込んで画面に表示する

loadGame();
updateDisplay();
