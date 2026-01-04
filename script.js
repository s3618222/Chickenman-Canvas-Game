let winGame =false; //判斷是否破關
let isTransforming = false;
let transformTimer = 0; //變身時間
let playerHP = 30;
let enemyHP = 20;
let turn = "player"; //控制輪到誰
let battleMsg = ""; //顯示回合結果
let battleOver = false; //防止打完還能繼續按攻擊鍵
const GameState = {
  map: "map", //地圖探索
  battle: "battle", //戰鬥中
  event: "event", //對話 劇情 或過場
  dead: "dead", //被打敗
}
let gameState = GameState.map; //初始化狀態

//開始遊戲按鈕
const startButton = document.getElementById("startButton");
//開始畫面UI
const openingUI =document.getElementById("openingUI")

function startGame() {
  openingUI.style.display = "none";
}

startButton.addEventListener("click", startGame);

//戰鬥中的角色圖片
const playerImg = new Image();
playerImg.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/FriedChickenMan.png";
const enemyImg = new Image();
enemyImg.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/FriedChicken1.png";
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d"); //跟canvas要一支2D畫筆
const speed = 2;
const player = {
  x: 50,
  y: 50,
  size: 20
};

const enemy = {
  x: 350,
  y: 200,
  size: 30
}

//炸雞格位
const chickenSlots = document.querySelectorAll(".chicken-slot");

//玩家一般角色行走圖
const playerIdleImg = new Image();
playerIdleImg.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/InitialPlayer_Center.png";
const playerWalk1Img = new Image();
playerWalk1Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/InitialPlayer_left.png";
const playerWalk2Img = new Image();
playerWalk2Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/InitialPlayer_Right.png";

//變身過程圖片
const transform1Img = new Image();
transform1Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/transform1.png"
const transform2Img = new Image();
transform2Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/transform2.png";
const transform3Img = new Image();
transform3Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/transform3.png";

//玩家變身角色行走圖
const WarriorIdleImg = new Image();
WarriorIdleImg.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/Player_Center.png";
const WarriorWalk1Img = new Image();
WarriorWalk1Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/Player_Left.png";
const WarriorWalk2Img = new Image();
WarriorWalk2Img.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/Player_Right.png";

//嘲笑圖片
const mockingImg = document.getElementById("mocking");

//勝利UI畫面
const winOverlay = document.getElementById('winOverlay');

//變身過程動畫帧數 
const transformFrames = [
  playerIdleImg,
  transform1Img,
  transform2Img,
  transform3Img,
  WarriorIdleImg,
];

//怪物1地圖上顯示外觀
const enemyIdleImg = new Image();
enemyIdleImg.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/Chicken1_Center.png";

//炸雞圖片
const chickenImg = new Image();
chickenImg.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/FriedChicken.png"

let collectedChicken = 0; //玩家已收集炸雞數量
const chickenItems = [ //炸雞分布位置
  { x: 180, y: 20, collected: false},
  { x: 20, y: 250, collected: false},
  { x: 280, y: 130, collected: false},
  { x: 400, y: 25, collected: false},
  { x: 220, y: 280, collected: false},
]


//收集炸雞UI
function chickenCollectUI () {
  const coloredChickenSrc = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/colorChicken.png";
  const index = collectedChicken - 1;
  if (index >= 0) {
    chickenSlots[index].src = coloredChickenSrc;
  }
};

//動畫狀態的變數
let walkFrame = 0;
let frameCounter = 0;

//表示目前鍵盤狀態，反映鍵盤現在不是正被按著
const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
}

//狀態切換函式
function changeGameState(newState) {
  gameState = newState;
  
  switch(newState) {
    case GameState.battle:  //意思是如果輸入的newState參數是GameState.battle的話 就執行下面的內容
      //初始化戰鬥
      turn = "player";
      battleOver = false;
      battleMsg = `Your turn! Press K to Attack.`;
      playerHP = 30;
      enemyHP = 20;
      break;
     
    case GameState.map:
      //回地圖  推開玩家 避免馬上又撞到敵人
      player.x =  Math.max(0, player.x -40);
      player.y = Math.max(0, player.y - 40);
      break;
      
    case GameState.dead:
      //玩家死亡處理  可以加回到原點的邏輯
      break;
      
    case GameState.event:
      // 加過場或對話
      break;
  }
}

//按鍵盤時的動作
window.addEventListener("keydown", (e)=> {
  //戰鬥中的按鍵
  if (gameState === GameState.battle) {
    const key = e.key.toLowerCase();
    
    //R 重置戰鬥並回地圖
    if (key === "r") {
      if (winGame) {
        winOverlay.classList.add("active");
        winOverlay.innerHTML = `
        <img id="winGameImg" src="https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/Victory.png">
        <button id="resetButton">Replay</button>
        `;
        document.getElementById("resetButton").addEventListener("click", resetGame);
        
      } else
      {changeGameState(GameState.map);
      battleOver = false;
      return;};
    }
    
    // 戰鬥結束後 不能再按攻擊鍵
    if (battleOver) return;
    
    // 設定攻擊按鈕K
    if (key === "k" && turn === "player") {
      playerAttack();
      
      //檢查敵人血量
      if (enemyHP <= 0) {
        enemyHP = 0;
        battleMsg = `You win! Press R to return`;
        battleOver = true;
        winGame = true;
        return;
      }
      
      // 換敵人的攻擊回合 延遲攻擊
      turn = "enemy";
      battleMsg = "Enemy is preparing to attack...";
      setTimeout(() => {
        enemyAttack();
        //敵人攻擊後 檢查玩家是否被打倒
        if (playerHP <=0) {
          playerHP = 0;
          battleMsg = `You lose... Press R to return.`;
          battleOver = true;
          return;
        }
        //如果玩家沒倒  接著回到玩家回合
        turn = "player";
        battleMsg = `Your turn! Press K to Attack.`
       
      }, 800);
    }
    
    return; // 戰鬥時不處理移動鍵
  }
  
  //方向鍵
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  
  //WASD小寫
  const key = e.key.toLowerCase();
  if (key === "w") keys.up = true;
  if (key === "s") keys.down = true;
  if (key === "a") keys.left = true;
  if (key === "d") keys.right = true;   
}); 

//放開鍵盤
window.addEventListener("keyup", (e) =>{
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;

  const key = e.key.toLowerCase();
  if (key === "w") keys.up = false;
  if (key === "s") keys.down = false;
  if (key === "a") keys.left = false;
  if (key === "d") keys.right = false;
})
  
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === GameState.map) {
  //畫地圖
  chickenCollectUI();
  let currentImg;
  if (isTransforming) {
      // 變身動畫中
      const frameIndex = Math.floor(transformTimer /15);
      currentImg = transformFrames[frameIndex] || WarriorIdleImg;
    } else if (hasTransformed) {
      // 變身完成後，走路用炸雞戰士圖片
      if (walkFrame === 1) {
        currentImg = WarriorWalk2Img;
      } else if (frameCounter > 0) {
        currentImg = WarriorWalk1Img;
      } else {
        currentImg = WarriorIdleImg;
      }
    } else {
      // 變身前，初始玩家圖片
      if (walkFrame === 1) {
        currentImg = playerWalk2Img;
      } else if (frameCounter > 0) {
        currentImg = playerWalk1Img;
      } else {
        currentImg = playerIdleImg;
      }
    };

    // 最後統一畫出玩家圖片
    ctx.drawImage(currentImg, player.x, player.y, 64, 64);
    
  // 炸雞圖片
  chickenItems.forEach((item) => {
    if (!item.collected) {
      ctx.drawImage(chickenImg, item.x, item.y, 48, 48)
    }
  });
  
  // 沒變身 提醒文字
  if (showNoFightMsg) {
    mockingImg.style.display = "block";
    
    //訊息顯示時間
    noFightTimer--;
    if (noFightTimer <= 0) {
      showNoFightMsg = false;
      mockingImg.style.display = "none";
    }
  }
    
  //怪物1圖片
  ctx.drawImage(enemyIdleImg, enemy.x, enemy.y, 64, 64);
  } else { 
    //畫戰鬥畫面
    //背景
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //戰鬥文字顯示
    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Battle Start!", canvas.width / 2, 30);
    
    //顯示血量
    ctx.font = "18px Arial";
    ctx.fillText(`Player HP: ${playerHP}`, 80, 250);
    ctx.fillText(`Enemy HP: ${enemyHP}`, 380, 250);
    
    //畫玩家腳色圖
    ctx.drawImage(playerImg, 10, 20, 150, 225);
    
    //畫敵人圖
    ctx.drawImage(enemyImg, 300, 20, 170, 225);
    
    //顯示戰鬥訊息與提示
    ctx.textAlign = "center";
    ctx.font = "14px Arial";
    // 空集合""的布林值會被判斷為false 所以如果是空集合時 就會自動補上後面的文字
    ctx.fillText(battleMsg || `Your turn! Press K to Attack.`, canvas.width / 2, 280);
    if (battleOver === false) {
      ctx.fillText("K = Attack", canvas.width / 2, 300);
    } else {
      ctx.fillText("R = Return to map (reset)", canvas.width / 2, 300);
    }
  }
}

//遊戲破關重置函式
function resetGame() {
  gameState = GameState.map;
  winGame = false;
  turn = "player";
  battleMsg = "";
  battleOver = false;
  
  //重置腳色素質
  playerHP = 30;
  enemyHP = 20;
  
  //重置變身 炸雞收集
  collectedChicken = 0;
  hasTransformed = false;
  isTransforming = false;
  transformTimer = 0;
  
  //重置地圖物件
  player.x = 50;
  player.y = 50;
  enemy.x = 350;
  enemy.y = 200;
  
  chickenItems.forEach((item) => {
    item.collected = false;
  });
  
  //重置炸雞亮燈的UI
  chickenSlots.forEach((slot) => {
    slot.src = "https://raw.githubusercontent.com/s3618222/Canvas-Game-Assets/refs/heads/main/images/blackFriedChicken.png";
  });
  
  //重置 清除勝利畫面
  winOverlay.classList.remove("active");
  winOverlay.innerHTML = "";
}

//啟動變身的函式
function startTransform() {
  isTransforming = true;
  transformTimer = 0;
  player.canMove = false; //鎖住玩家移動
}

//變身完成
function finishTransform() {
  isTransforming = false;
  hasTransformed = true;
}

let hasTransformed = false; // 紀錄是否已變身狀態
let showNoFightMsg = false; // 沒變身無法進入戰鬥
let noFightTimer = 0; // 文字顯示時間


function update() {
  //變身判斷
  if (collectedChicken >= 5 && !isTransforming && !hasTransformed) { // 加入!isTransfomring 是要避免重複啟動動畫
    startTransform();
  };
  
  //變身過程動畫
  if (isTransforming) {
    transformTimer++;
    if (transformTimer > 60) { //若60fps 則大約1秒左右的變身時間
      finishTransform();
    }
    return; // 變身時 跳出update 讓玩家不能動
  }
  
  //如果已經在戰鬥 就先不處理移動
  if(gameState !== GameState.map) return;  //只有在地圖畫面才可以走動
  
  let moving = false;
  
  //根據keys狀態 更新座標
  if (keys.up) {player.y -= speed; moving = true;}
  if (keys.down) {player.y += speed; moving = true;}
  if (keys.left) {player.x -= speed; moving = true;}
  if (keys.right) {player.x += speed; moving = true;}
  
  //邊界設定  讓玩家移動範圍在畫布內
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
  
  //控制走路動畫
  if (moving) {
    frameCounter++; //每一幀記一次數
    if (frameCounter % 10 === 0) { //每10幀
      walkFrame = (walkFrame + 1) % 2; //換一次走路圖
    } 
  } else {
      //停下來 回到站立
      walkFrame = 0;
      frameCounter = 0;
    }
  
  //檢查是否撞到敵人
  if (isColliding(player, enemy)) {
    if (!hasTransformed) {
      player.x =  player.x - 40;
      player.y =  player.y - 40;
      showNoFightMsg = true;
      noFightTimer = 180; // 60fps 大約顯示1秒
    } else {changeGameState(GameState.battle);};
  }
  
  //檢查是否撿到炸雞
  chickenItems.forEach((item) => {
    if (!item.collected && isColliding(player, {x: item.x, y: item.y, size: 64})) {
      item.collected = true;
      collectedChicken++;
      console.log(`Collected Total: ${collectedChicken}`);
    }
  });
}

function loop() {
    // 先清畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch(gameState) {
    case GameState.map:
      update(); // 玩家+怪物更新
      draw();   // 地圖畫面
      break;

    case GameState.battle:
      draw();   // 戰鬥畫面（update 在按鍵事件中）
      break;

    case GameState.event:
      draw();   // 或其他過場/對話
      break;

    case GameState.dead:
      draw();   // 死亡畫面
      break;
  }
  requestAnimationFrame(loop); //下一幀再跑一次
}


// 啟動循環
requestAnimationFrame(loop);

function isColliding(a, b) {
  return (
    // a.x 玩家左邊 a.x+ a.size 玩家右邊 b.x 敵人左邊 b.x + b.size 敵人右邊 a.y玩家頂端 
    a.x < b.x + b.size && // 玩家左邊在敵人右邊的左側 (尚未超過
    a.x + a.size > b.x && // 玩家右邊在敵人左邊的右側 (已經進入敵人範圍
    a.y < b.y + b.size && // 玩家頂端還沒超過敵人的底端
    a.y + a.size > b.y // 玩家底端已進入敵人頂部範圍
  
  );
}

//戰鬥中攻擊函式
function playerAttack () {
  enemyHP -= 5;
}

function enemyAttack () {
  playerHP -= 4;
}
