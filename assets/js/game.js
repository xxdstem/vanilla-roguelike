const WALL = 'tileW';
const EMPTY = '';
const ENEMY = 'tileE';
const HEAL = 'tileHP';
const SWORD = 'tileSW';
const HERO = 'tileP'

class Game {
    constructor() {
        this.map = [];
        this.hero = null;
        this.rooms = [];
        this.enemies = [];
        this.width = 40;
        this.height = 24;
    }

    init() {
        this.generateMap();
        this.generateRooms();
        this.generateWays();
        this.generateItems();
        this.spawnEnemies();
        this.spawnHero();
        this.render();
        this.bindKeys();
    }

    render(){
        $(".field").empty();
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.map[y][x];
                let top = y * 50;
                let left = x * 50; 
                $(".field").append(`<div
                    style="top: ${top}px; left: ${left}px;"
                    class="tile ${cell}"></div>`);
            }
        }
        let renderHero = ()=>{
            let top = this.hero.y * 50;
            let left = this.hero.x * 50;
            let hp = this.hero.hp;
            let direction = this.hero.direction;
            $(".field").append(`<div
                style="top: ${top}px; left: ${left}px; ${direction == 'left' ? 'transform: rotateY(190deg);' : ''}"
                class="tile ${HERO}">
                    <div style="width: ${hp}%" class="health">
                </div>
            </div>`);
        }
        let renderEnemies = ()=>{
            this.enemies.forEach((enemy)=>{
                let top = enemy.y * 50;
                let left = enemy.x * 50;
                let hp = enemy.hp;
                $(".field").append(`<div
                        style="top: ${top}px; left: ${left}px;"
                        class="tile ${ENEMY}"><div style="width: ${hp}%" class="health"></div></div>`);
            })
        }
        renderHero();
        renderEnemies();
    }

    generateMap() {
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = WALL;
            }
        }
    }

    generateRooms(){
        const numRooms = this.getRandomInt(5, 10);
        const maxAttempts = 100;
        for(let i = 0; i < numRooms; i++){
            let roomSize = this.getRandomInt(3, 8)
            // ищем свободное место куда можно поместить комнату 
            let found;
            let randX, randY;
            let attempts = 0;
            while(!found && attempts < maxAttempts){
                found = true;
                attempts++;
                randX = this.getRandomInt(1, this.width - roomSize - 2);
                randY = this.getRandomInt(1, this.height - roomSize - 2);
                
                for (let y = -1; y <= roomSize + 1; y++) {
                    for (let x = -1; x <= roomSize + 1; x++) {
                        if (this.map[randY + y][randX + x] !== WALL) {
                            found = false;
                            break;
                        }
                    }
                    if (!found) break;
                }
            }
            if(found){
                this.rooms.push(new Room(randX, randY, roomSize))
                for (let y = 0; y < roomSize; y++) {
                    for (let x = 0; x < roomSize; x++) {
                        this.map[randY + y][randX + x] = EMPTY
                    }
                }
            }
        }
    }

    generateWays(){
        // проходов не может быть меньше комнат
        let xWays = this.getRandomInt(this.rooms.length / 2, 5);
        let yWays = this.getRandomInt(this.rooms.length / 2, 5);
        
        let generateWaysThroughRooms = ()=>{
            for (let z = 0; z < this.rooms.length; z++) {
                let room = this.rooms[z];
    
                if(room.available) continue

                if ((this.getRandomInt(0, 1) == 1 || yWays == 0) && xWays > 0){
                    // заполняем по вертикали
                    xWays--;
                    let x = this.getRandomInt(room.x + 1, room.x+room.size - 1);
                    for (let c = 0; c < this.rooms.length; c++) {
                        let curRoom = this.rooms[c]
                        if (!curRoom.available && x >= curRoom.x - 1 && x <= curRoom.x+curRoom.size){
                            curRoom.available = true;
                        }
                    }
                    for (let y = 0; y < this.height; y++) {
                        this.map[y][x] = EMPTY;
                    }
                }else if (yWays > 0){
                    // и по горизонтали
                    yWays--;
                    let y = this.getRandomInt(room.y + 1, room.y+room.size -1);
                    for (let c = 0; c < this.rooms.length; c++) {
                        let curRoom = this.rooms[c]
                        if (!curRoom.available && y >= curRoom.y - 1 && y <= curRoom.y+curRoom.size){
                            curRoom.available = true;
                        }
                    }
                    for (let x = 0; x < this.width; x++) {
                        this.map[y][x] = EMPTY;
                    }
                }
                room.available = true;
            }
        }
        generateWaysThroughRooms()
        // дорисовываем оставшиеся
        for (let i = 0; i < xWays; i++) {
            let isValid = false
            let x;
            while (!isValid){
                isValid = true

                x = this.getRandomInt(1, this.width-2);
                for (let offset = -1; offset <= 1; offset++){
                    let hasWall = false;
                    for (let y = 0; y < this.height; y++) {
                        if (this.map[y][x+offset] === WALL){
                            hasWall = true;
                            break
                        }
                    }
                    if(!hasWall){
                        isValid = false;
                        break
                    }
                }
            }

            for (let y = 0; y < this.height; y++) {
                if (this.map[y][x] === WALL) this.map[y][x] = EMPTY;
            }
        }
        
        for (let i = 0; i < yWays; i++) {
            let isValid = false;
            let y;
            while (!isValid){
                isValid = true;
                y = this.getRandomInt(1, this.height-2);
                for (let offset = -1; offset <= 1; offset++){
                    let hasWall = false;
                    for (let x = 0; x < this.width; x++) {
                        if (this.map[y+offset][x] === WALL){
                            hasWall = true;
                            break
                        }
                    }
                    if(!hasWall){
                        isValid = false;
                        break
                    }
                }
            }

            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === WALL) this.map[y][x] = EMPTY;
            }
        }

    }

    generateItems(){
        const heatlhCount = 10;
        const swordCount = 2;
        
        let generateItem = (item) =>{
            let [y, x] = this.getRandomFreeSpot(2)
            this.map[y][x] = item;
        }

        for (let i = 0; i < heatlhCount; i++){
            generateItem(HEAL)
        }
        for (let i = 0; i < swordCount; i++){
            generateItem(SWORD)
        }
    }

    spawnEnemies(){
        const enemiesCount = 10;
        for(let e = 0; e < enemiesCount; e++){
            let [y, x] = this.getRandomFreeSpot(2);
            this.enemies.push(new Enemy(y, x))
        }
        
    }

    spawnHero(){
        let [y, x] = this.getRandomFreeSpot(2);
        this.hero = new Hero(y, x);
    }

    getRandomFreeSpot(padding = 0) {
        let freeSpots = [];
        for (let y = padding; y < this.height - padding; y++) {
            for (let x = padding; x < this.width - padding; x++) {
                let isFree = true;
                for (let offsetY = -padding; offsetY <= padding; offsetY++) {
                    for (let offsetX = -padding; offsetX <= padding; offsetX++) {
                        let ny = y + offsetY;
                        let nx = x + offsetX;
                        if (
                            ny < 0 || ny >= this.height ||
                            nx < 0 || nx >= this.width ||
                            (this.enemies.some((enemy)=>enemy.y == ny && enemy.x == nx) || this.map[ny][nx] !== EMPTY && this.map[ny][nx] !== WALL)
                        ) {
                            isFree = false;
                        }
                    }
                }
                if (isFree && this.map[y][x] === EMPTY) {
                    freeSpots.push([y, x]);
                }
            }
        }
        if (freeSpots.length === 0) {
            throw new Error("Нет свободных мест на карте");
        }
        return freeSpots[this.getRandomInt(0, freeSpots.length - 1)];
    }

    bindKeys(){
        window.addEventListener("keyup", (event)=>{
            let dx = 0, dy = 0;
            let moved = false;
            switch (event.code.toLowerCase()) {
                case 'keyw': dy = -1; moved = true; break;
                case 'keya': dx = -1; this.hero.direction = 'left'; moved = true; break;
                case 'keys': dy = 1; moved = true; break;
                case 'keyd': dx = 1; this.hero.direction = 'right'; moved = true; break;
                case 'space': this.handleAttack(); break;
            }
            if (moved) {
                let newX = this.hero.x + dx;
                let newY = this.hero.y + dy;
                let cell = this.map[newY][newX]
                if (newX >= 0 && newX < this.width &&
                    newY >= 0 && newY < this.height &&
                    this.handleItemPickup(newY, newX, cell)
                ) {
                    this.hero.x = newX;
                    this.hero.y = newY;
                    this.render();
                }
            }
        });
    }

    handleItemPickup(y, x, item){
        // если враг на клетке
        if(this.enemies.some((enemy)=>enemy.y == y && enemy.x == x)){
            return false;
        }
        switch (item) {
            case EMPTY:
                return true;
            case HEAL:
                if(this.hero.hp < 100){
                    this.map[y][x] = EMPTY;
                    this.hero.hp = 100;
                }
                return true
            case SWORD:
                this.hero.damage += 20
                this.map[y][x] = EMPTY;
                return true;
            default:
                break;
        }
    }

    handleAttack(){
        let heroX = this.hero.x;
        let heroY = this.hero.y;
        this.enemies.forEach(enemy => {
            if (Math.abs(enemy.x - heroX) <= 1 && Math.abs(enemy.y - heroY) <= 1
                && !(enemy.x === heroX && enemy.y === heroY))
            {
                enemy.hp -= this.hero.damage;
            }
        });
        // удаляем убитых врагов
        this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
        this.render();
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
class Enemy {
    constructor(y, x) {
        this.x = x;
        this.y = y;
        this.hp = 100;
    }
}
class Hero {
    constructor(y, x){
        this.x = x;
        this.y = y;
        this.direction = 'left';
        this.hp = 50;
        this.damage = 10;
        this.inventory = [];

    }
}
class Room {
    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.available = false
    }
}