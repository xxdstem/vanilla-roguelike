const WALL = 'tileW';
const EMPTY = '';
const ENEMY = 'tileE';
const HEAL = 'tileHP';
const SWORD = 'tileSW';
class Game {
    constructor() {
        this.map = [];
        this.enemies = [];
        this.width = 40;
        this.height = 24;
        this.numRooms = this.getRandomInt(5, 10);
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
        //TODO: сделать чтоб комнаты генерировались на полях
        const maxAttempts = 100;
        for(let i = 0; i < this.numRooms; i++){
            let roomSize = this.getRandomInt(3, 8)
            // ищем свободное место куда можно поместить комнату 
            let found;
            let randX, randY;
            let attempts = 0;
            while(!found && attempts < maxAttempts){
                found = true;
                attempts++;
                randX = this.getRandomInt(1, this.width - roomSize - 1);
                randY = this.getRandomInt(1, this.height - roomSize - 1);
                
                for (let y = -1; y <= roomSize; y++) {
                    for (let x = -1; x <= roomSize; x++) {
                        if (this.map[randY + y][randX + x] !== WALL) {
                            found = false;
                            break;
                        }
                    }
                    if (!found) break;
                }
            }
            if(found){
                for (let y = 0; y < roomSize; y++) {
                    for (let x = 0; x < roomSize; x++) {
                        this.map[randY + y][randX + x] = EMPTY
                    }
                }
            }
        }
    }

    generateWays(){
        let xWays = this.getRandomInt(3, 5);
        let yWays = this.getRandomInt(3, 5);
        
        for(let i = 0; i < xWays; i++){
            let randX = this.getRandomInt(1, this.width - 1);
            for (let y = 0; y < this.height; y++) {
                this.map[y][randX] = EMPTY;
            }
        }
        for(let i = 0; i < yWays; i++){
            let randY = this.getRandomInt(1, this.height - 1);
            for (let x = 0; x < this.width; x++) {
                this.map[randY][x] = EMPTY;
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
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}