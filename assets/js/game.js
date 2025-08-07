const WALL = 'tileW';
const EMPTY = '';
const ENEMY = 'tileE';
const HEAL = 'tileHP';
const SWORD = 'tileSW';

class Game {
    constructor() {
        this.map = [];
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
        this.render()
    }

    render(){
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
            let found;
            let randX, randY;
            while(!found){
                randX = this.getRandomInt(1, this.width - 1);
                randY = this.getRandomInt(1, this.height - 1);
                if(this.map[randY][randX] == EMPTY){
                    found = true
                    break
                }
            }
            this.map[randY][randX] = item;
        }

        for (let i = 0; i < heatlhCount; i++){
            generateItem(HEAL)
        }
        for (let i = 0; i < swordCount; i++){
            generateItem(SWORD)
        }
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
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