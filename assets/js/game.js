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
    }

    render(){
        // 
    }

    generateMap() {
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = 'tileW';
            }
        }
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}