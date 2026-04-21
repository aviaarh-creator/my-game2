// ==================== КОНФИГУРАЦИЯ ИГРЫ ====================

const BUILDING_LEVELS = {
    1: { name: 'Постройка', title: 'ПОСТРОЙКА', icon: '🏠', hp: 20, costGold: 0, costWood: 0, defenseDamage: 10, availableUnits: ['infantry'] },
    2: { name: 'Башня', title: 'БАШНЯ', icon: '🗼', hp: 50, costGold: 50, costWood: 30, defenseDamage: 10, availableUnits: ['infantry', 'archer', 'captain'] },
    3: { name: 'Замок', title: 'ЗАМОК', icon: '🏰', hp: 150, costGold: 150, costWood: 100, defenseDamage: 20, availableUnits: ['infantry', 'archer', 'captain', 'cavalry'] },
    4: { name: 'Крепость', title: 'КРЕПОСТЬ', icon: '🏯', hp: 300, costGold: 300, costWood: 150, defenseDamage: 25, availableUnits: ['infantry', 'archer', 'captain', 'cavalry', 'general'] },
    5: { name: 'Цитадель', title: 'ЦИТАДЕЛЬ', icon: '🏰✨', hp: 500, costGold: 500, costWood: 250, defenseDamage: 30, availableUnits: ['infantry', 'archer', 'captain', 'cavalry', 'general', 'catapult'] }
};

const BASE_UNITS = {
    infantry: { name: 'Пехота', icon: '⚔️', hp: 10, damage: 10, range: 1, requiredLevel: 1, salary: 2 },
    archer: { name: 'Лучник', icon: '🏹', hp: 10, damage: 5, range: 2, requiredLevel: 2, salary: 4 },
    captain: { name: 'Капитан', icon: '🎖️', hp: 50, damage: 20, range: 1, requiredLevel: 2, salary: 10 },
    cavalry: { name: 'Кавалерия', icon: '🐎', hp: 80, damage: 40, range: 1, requiredLevel: 3, salary: 18 },
    general: { name: 'Генерал', icon: '⭐', hp: 100, damage: 40, range: 1, requiredLevel: 4, salary: 40 },
    catapult: { name: 'Катапульта', icon: '🏗️', hp: 10, damage: 100, range: 2, requiredLevel: 5, salary: 100 }
};

const UNIT_COSTS = {
    novice: { infantry: { gold: 10, wood: 0 }, archer: { gold: 20, wood: 10 }, captain: { gold: 50, wood: 10 }, cavalry: { gold: 75, wood: 30 }, general: { gold: 100, wood: 20 }, catapult: { gold: 300, wood: 200 } },
    medium: { infantry: { gold: 10, wood: 0 }, archer: { gold: 40, wood: 15 }, captain: { gold: 80, wood: 15 }, cavalry: { gold: 120, wood: 30 }, general: { gold: 150, wood: 50 }, catapult: { gold: 450, wood: 300 } },
    hard: { infantry: { gold: 15, wood: 0 }, archer: { gold: 45, wood: 15 }, captain: { gold: 90, wood: 15 }, cavalry: { gold: 150, wood: 35 }, general: { gold: 200, wood: 60 }, catapult: { gold: 500, wood: 350 } }
};

const MINE_LEVELS = {
    forest: { 1: { production: 1, upgradeCost: 0 }, 2: { production: 2, upgradeCost: 100 }, 3: { production: 3, upgradeCost: 200 }, 4: { production: 4, upgradeCost: 400 }, 5: { production: 5, upgradeCost: 500 } },
    gold: { 1: { production: 10, upgradeCost: 0 }, 2: { production: 15, upgradeCost: 300 }, 3: { production: 20, upgradeCost: 500 }, 4: { production: 25, upgradeCost: 1000 }, 5: { production: 30, upgradeCost: 1500 } }
};

const COLORS = {
    green: { name: 'Зеленый', fill: '#1b5e20', stroke: '#4caf50', border: '#4caf50' },
    red: { name: 'Красный', fill: '#8b0000', stroke: '#f44336', border: '#f44336' },
    purple: { name: 'Фиолетовый', fill: '#4a148c', stroke: '#9c27b0', border: '#9c27b0' },
    orange: { name: 'Оранжевый', fill: '#e65100', stroke: '#ff9800', border: '#ff9800' },
    blue: { name: 'Синий', fill: '#0d47a1', stroke: '#2196f3', border: '#2196f3' },
    cyan: { name: 'Голубой', fill: '#006064', stroke: '#00bcd4', border: '#00bcd4' },
    neutral: { fill: '#666666', stroke: '#999999', border: '#999999' },
    water: { fill: '#0f2a4f', stroke: '#1a4a7a', border: '#1a4a7a' },
    forest: { fill: '#2e7d32', stroke: '#4caf50', border: '#4caf50' },
    goldMine: { fill: '#b8860b', stroke: '#ffd700', border: '#ffd700' },
    fog: { fill: '#1a1a2e', stroke: '#2a2a4e', border: '#2a2a4e' }
};

let UNITS = {};
let currentDifficulty = 'medium';
let fogOfWarEnabled = true;

function applyDifficulty(difficulty) {
    currentDifficulty = difficulty;
    const costs = UNIT_COSTS[difficulty];
    UNITS = JSON.parse(JSON.stringify(BASE_UNITS));
    for (let unit in UNITS) {
        UNITS[unit].costGold = costs[unit].gold;
        UNITS[unit].costWood = costs[unit].wood;
    }
    if (difficulty === 'novice') fogOfWarEnabled = false;
    else if (difficulty === 'medium') { fogOfWarEnabled = true; for (let unit in UNITS) if (unit !== 'infantry') UNITS[unit].salary = Math.ceil(UNITS[unit].salary * 1.1); }
    else if (difficulty === 'hard') { fogOfWarEnabled = true; for (let unit in UNITS) if (unit !== 'infantry') UNITS[unit].salary = Math.ceil(UNITS[unit].salary * 1.2); }
}

function getRomanNumeral(num) { const roman = {1:'I',2:'II',3:'III',4:'IV',5:'V'}; return roman[num] || num; }
function getHpColor(currentHp, maxHp) { let p = (currentHp / maxHp) * 100; if (p >= 60) return '#4caf50'; if (p >= 30) return '#ffc107'; return '#f44336'; }
function calculateBonusHp(hp) { return Math.ceil((hp + Math.floor(hp * 0.3)) / 10) * 10; }

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================

let gameState = {
    grid: [], currentPlayer: null, playersData: {}, selectedUnit: null,
    availableMoves: [], availableAttacks: [], soundEnabled: true, gameActive: true,
    gridRows: 20, gridCols: 30, waterPercent: 15, forestPercent: 10, goldMineCount: 7,
    aiCount: 3, players: ['green', 'red', 'purple'], currentCastleRow: null, currentCastleCol: null,
    usedUnits: new Set(), defendedUnits: new Set(), unitOriginalHp: new Map(),
    exploredCells: new Set(), currentDay: 1, waitingForAITurn: false, currentAIIndex: 0,
    difficulty: 'medium', fogEnabled: true, history: [], undoUsed: false,
    currentMineRow: null, currentMineCol: null
};

let canvas, ctx, cellSize = 35, unitContextMenu = null;

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function calculateSalary(player) { 
    let s = 0; 
    for (let i = 0; i < gameState.gridRows; i++) 
        for (let j = 0; j < gameState.gridCols; j++) 
            if (gameState.grid[i][j].unit && gameState.grid[i][j].owner === player) 
                s += UNITS[gameState.grid[i][j].unit].salary; 
    return s; 
}

function calculateTerritoryCount(player) { 
    let c = 0; 
    for (let i = 0; i < gameState.gridRows; i++) 
        for (let j = 0; j < gameState.gridCols; j++) 
            if (gameState.grid[i][j].owner === player && !gameState.grid[i][j].isWater) 
                c++; 
    return c; 
}

function calculateWoodIncome(player) { 
    let w = 0; 
    for (let i = 0; i < gameState.gridRows; i++) 
        for (let j = 0; j < gameState.gridCols; j++) { 
            let c = gameState.grid[i][j]; 
            if (c.owner === player && c.isForest && c.mineLevel) 
                w += MINE_LEVELS.forest[c.mineLevel].production; 
            else if (c.owner === player && c.isForest && !c.mineLevel) 
                w += 1; 
        } 
    return w; 
}

function calculateGoldMineIncome(player) { 
    let g = 0; 
    for (let i = 0; i < gameState.gridRows; i++) 
        for (let j = 0; j < gameState.gridCols; j++) { 
            let c = gameState.grid[i][j]; 
            if (c.owner === player && c.isGoldMine && c.mineLevel) 
                g += MINE_LEVELS.gold[c.mineLevel].production; 
            else if (c.owner === player && c.isGoldMine && !c.mineLevel) 
                g += 10; 
        } 
    return g; 
}

function paySalary(player) { 
    let salary = calculateSalary(player); 
    if (gameState.playersData[player].gold >= salary) { 
        gameState.playersData[player].gold -= salary; 
        return true; 
    } else { 
        for (let i = 0; i < gameState.gridRows; i++) 
            for (let j = 0; j < gameState.gridCols; j++) 
                if (gameState.grid[i][j].unit && gameState.grid[i][j].owner === player) 
                    gameState.grid[i][j].unit = null, gameState.grid[i][j].unitHp = 0; 
        gameState.defendedUnits.clear(); 
        gameState.unitOriginalHp.clear(); 
        return false; 
    } 
}

function updateFogOfWar() {
    if (!gameState.fogEnabled) { 
        gameState.exploredCells.clear(); 
        for (let i = 0; i < gameState.gridRows; i++) 
            for (let j = 0; j < gameState.gridCols; j++) 
                gameState.exploredCells.add(`${i},${j}`); 
        return; 
    }
    
    gameState.exploredCells.clear();
    
    for (let i = 0; i < gameState.gridRows; i++) {
        for (let j = 0; j < gameState.gridCols; j++) {
            const cell = gameState.grid[i][j];
            if (cell.owner === gameState.currentPlayer) {
                for (let di = -2; di <= 2; di++) {
                    for (let dj = -2; dj <= 2; dj++) {
                        const ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < gameState.gridRows && nj >= 0 && nj < gameState.gridCols) {
                            gameState.exploredCells.add(`${ni},${nj}`);
                        }
                    }
                }
            }
            if (cell.unit && cell.owner === gameState.currentPlayer) {
                const unitRange = (cell.unit === 'archer' || cell.unit === 'catapult') ? 3 : 2;
                for (let di = -unitRange; di <= unitRange; di++) {
                    for (let dj = -unitRange; dj <= unitRange; dj++) {
                        const ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < gameState.gridRows && nj >= 0 && nj < gameState.gridCols) {
                            gameState.exploredCells.add(`${ni},${nj}`);
                        }
                    }
                }
            }
        }
    }
    
    for (let i = 0; i < gameState.gridRows; i++) {
        for (let j = 0; j < gameState.gridCols; j++) {
            if (gameState.grid[i][j].isCastle && gameState.grid[i][j].owner === gameState.currentPlayer) {
                for (let di = -3; di <= 3; di++) {
                    for (let dj = -3; dj <= 3; dj++) {
                        const ni = i + di, nj = j + dj;
                        if (ni >= 0 && ni < gameState.gridRows && nj >= 0 && nj < gameState.gridCols) {
                            gameState.exploredCells.add(`${ni},${nj}`);
                        }
                    }
                }
            }
        }
    }
}

function isCellVisible(row, col) {
    if (!gameState.fogEnabled) return true;
    return gameState.exploredCells.has(`${row},${col}`);
}

function getCellDisplayData(row, col) {
    if (!isCellVisible(row, col)) {
        return { type: 'fog', owner: null, isCastle: false, isForest: false, isGoldMine: false, isWater: false, unit: null };
    }
    return gameState.grid[row][col];
}

function saveGameToLocalStorage() {
    const saveData = {
        gameState: {
            grid: gameState.grid,
            currentPlayer: gameState.currentPlayer,
            playersData: gameState.playersData,
            gridRows: gameState.gridRows,
            gridCols: gameState.gridCols,
            aiCount: gameState.aiCount,
            players: gameState.players,
            currentDay: gameState.currentDay,
            difficulty: gameState.difficulty,
            fogEnabled: gameState.fogEnabled,
            exploredCells: Array.from(gameState.exploredCells)
        },
        version: '1.0.0',
        timestamp: Date.now()
    };
    localStorage.setItem('squareWarsSave', JSON.stringify(saveData));
}

function loadGameFromLocalStorage() {
    const saveData = localStorage.getItem('squareWarsSave');
    if (!saveData) return false;
    
    try {
        const data = JSON.parse(saveData);
        gameState.grid = data.gameState.grid;
        gameState.currentPlayer = data.gameState.currentPlayer;
        gameState.playersData = data.gameState.playersData;
        gameState.gridRows = data.gameState.gridRows;
        gameState.gridCols = data.gameState.gridCols;
        gameState.aiCount = data.gameState.aiCount;
        gameState.players = data.gameState.players;
        gameState.currentDay = data.gameState.currentDay;
        gameState.difficulty = data.gameState.difficulty;
        gameState.fogEnabled = data.gameState.fogEnabled;
        gameState.exploredCells = new Set(data.gameState.exploredCells || []);
        gameState.gameActive = true;
        gameState.waitingForAITurn = false;
        gameState.selectedUnit = null;
        gameState.availableMoves = [];
        gameState.availableAttacks = [];
        
        applyDifficulty(gameState.difficulty);
        gameState.fogEnabled = fogOfWarEnabled;
        
        return true;
    } catch(e) {
        console.error('Failed to load save:', e);
        return false;
    }
}

// ==================== ОТРИСОВКА ====================

function drawCell(row, col, x, y, size) {
    const cell = getCellDisplayData(row, col);
    
    if (cell.type === 'fog') {
        ctx.fillStyle = COLORS.fog.fill;
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = COLORS.fog.stroke;
        ctx.strokeRect(x, y, size, size);
        return;
    }
    
    // Отрисовка типа местности
    if (cell.isWater) {
        ctx.fillStyle = COLORS.water.fill;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#1a6a9a';
        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            ctx.moveTo(x + w * 10, y + size - 5);
            ctx.quadraticCurveTo(x + w * 10 + 5, y + size - 10, x + w * 10 + 10, y + size - 5);
            ctx.stroke();
        }
    } else if (cell.isForest) {
        ctx.fillStyle = COLORS.forest.fill;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#1b5e20';
        for (let t = 0; t < 4; t++) {
            ctx.beginPath();
            ctx.moveTo(x + 5 + t * 8, y + size - 8);
            ctx.lineTo(x + 8 + t * 8, y + 8);
            ctx.lineTo(x + 2 + t * 8, y + 8);
            ctx.fill();
        }
    } else if (cell.isGoldMine) {
        ctx.fillStyle = COLORS.goldMine.fill;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#ffd700';
        ctx.font = `${size * 0.5}px Arial`;
        ctx.fillText('⛏️', x + size * 0.25, y + size * 0.7);
    } else if (cell.owner && COLORS[cell.owner]) {
        ctx.fillStyle = COLORS[cell.owner].fill;
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = COLORS[cell.owner].stroke;
        ctx.strokeRect(x, y, size, size);
    } else {
        ctx.fillStyle = COLORS.neutral.fill;
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = COLORS.neutral.stroke;
        ctx.strokeRect(x, y, size, size);
    }
    
    // Отрисовка уровня шахты
    if ((cell.isForest || cell.isGoldMine) && cell.mineLevel && cell.mineLevel > 1) {
        ctx.font = `${size * 0.25}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.fillText(getRomanNumeral(cell.mineLevel), x + size - 12, y + 12);
    }
    
    // Отрисовка замка
    if (cell.isCastle) {
        const level = cell.castleLevel || 1;
        const castleIcon = BUILDING_LEVELS[level]?.icon || '🏰';
        ctx.font = `${size * 0.6}px Arial`;
        ctx.fillStyle = '#ffd966';
        ctx.fillText(castleIcon, x + size * 0.25, y + size * 0.75);
        
        const hpPercent = cell.castleHp / BUILDING_LEVELS[level].hp;
        const barHeight = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 2, y + size - barHeight - 2, size - 4, barHeight);
        ctx.fillStyle = getHpColor(cell.castleHp, BUILDING_LEVELS[level].hp);
        ctx.fillRect(x + 2, y + size - barHeight - 2, (size - 4) * hpPercent, barHeight);
    }
    
    // Отрисовка юнита
    if (cell.unit && UNITS[cell.unit]) {
        const unit = UNITS[cell.unit];
        ctx.font = `${size * 0.5}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(unit.icon, x + size * 0.25, y + size * 0.7);
        
        if (cell.unitHp) {
            const hpPercent = cell.unitHp / unit.hp;
            const barHeight = 4;
            ctx.fillStyle = '#333';
            ctx.fillRect(x + 2, y + size - barHeight - 2, size - 4, barHeight);
            ctx.fillStyle = getHpColor(cell.unitHp, unit.hp);
            ctx.fillRect(x + 2, y + size - barHeight - 2, (size - 4) * hpPercent, barHeight);
        }
        
        if (gameState.defendedUnits.has(`${row},${col}`)) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Подсветка доступных ходов/атак
    if (gameState.selectedUnit) {
        if (gameState.availableMoves.some(m => m.row === row && m.col === col)) {
            ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
            ctx.fillRect(x, y, size, size);
        }
        if (gameState.availableAttacks.some(a => a.row === row && a.col === col)) {
            ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Подсветка выбранного юнита
    if (gameState.selectedUnit && gameState.selectedUnit.row === row && gameState.selectedUnit.col === col) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
}

function draw() {
    if (!canvas || !ctx) return;
    
    const totalWidth = gameState.gridCols * cellSize;
    const totalHeight = gameState.gridRows * cellSize;
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    
    for (let i = 0; i < gameState.gridRows; i++) {
        for (let j = 0; j < gameState.gridCols; j++) {
            drawCell(i, j, j * cellSize, i * cellSize, cellSize);
        }
    }
}

// ==================== ГЕНЕРАЦИЯ КАРТЫ ====================

function generateMap() {
    const rows = gameState.gridRows;
    const cols = gameState.gridCols;
    const grid = [];
    
    // Инициализация
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
            grid[i][j] = {
                owner: null, isCastle: false, castleLevel: 1, castleHp: 20,
                isForest: false, isGoldMine: false, isWater: false,
                unit: null, unitHp: 0, mineLevel: null
            };
        }
    }
    
    // Вода
    const waterCells = Math.floor(rows * cols * gameState.waterPercent / 100);
    let waterPlaced = 0;
    while (waterPlaced < waterCells) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (!grid[row][col].isCastle && !grid[row][col].isWater) {
            grid[row][col].isWater = true;
            waterPlaced++;
        }
    }
    
    // Леса
    const forestCells = Math.floor(rows * cols * gameState.forestPercent / 100);
    let forestPlaced = 0;
    while (forestPlaced < forestCells) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (!grid[row][col].isWater && !grid[row][col].isCastle && !grid[row][col].isForest) {
            grid[row][col].isForest = true;
            forestPlaced++;
        }
    }
    
    // Золотые шахты
    let goldPlaced = 0;
    while (goldPlaced < gameState.goldMineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (!grid[row][col].isWater && !grid[row][col].isCastle && !grid[row][col].isForest && !grid[row][col].isGoldMine) {
            grid[row][col].isGoldMine = true;
            goldPlaced++;
        }
    }
    
    return grid;
}

function placeCastles(grid, players) {
    const rows = gameState.gridRows;
    const cols = gameState.gridCols;
    const placed = [];
    
    for (let idx = 0; idx < players.length; idx++) {
        const player = players[idx];
        let placed_success = false;
        let attempts = 0;
        
        while (!placed_success && attempts < 100) {
            let row, col;
            if (idx === 0) {
                row = Math.floor(rows * 0.1 + Math.random() * rows * 0.3);
                col = Math.floor(cols * 0.1 + Math.random() * cols * 0.3);
            } else if (idx === 1) {
                row = Math.floor(rows * 0.6 + Math.random() * rows * 0.3);
                col = Math.floor(cols * 0.6 + Math.random() * cols * 0.3);
            } else {
                row = Math.floor(Math.random() * rows);
                col = Math.floor(Math.random() * cols);
            }
            
            row = Math.min(Math.max(row, 0), rows - 1);
            col = Math.min(Math.max(col, 0), cols - 1);
            
            if (!grid[row][col].isWater && !grid[row][col].isCastle && 
                !grid[row][col].isForest && !grid[row][col].isGoldMine) {
                let tooClose = false;
                for (let p of placed) {
                    const dist = Math.abs(p.row - row) + Math.abs(p.col - col);
                    if (dist < 8) tooClose = true;
                }
                if (!tooClose) {
                    grid[row][col].isCastle = true;
                    grid[row][col].owner = player;
                    grid[row][col].castleLevel = 1;
                    grid[row][col].castleHp = BUILDING_LEVELS[1].hp;
                    placed.push({ row, col, player });
                    placed_success = true;
                }
            }
            attempts++;
        }
    }
    return placed;
}

// ==================== ФУНКЦИИ ХОДА ====================

function getValidMoves(row, col, unitType, owner) {
    const moves = [];
    const range = (unitType === 'archer' || unitType === 'catapult') ? 2 : 1;
    
    for (let dr = -range; dr <= range; dr++) {
        for (let dc = -range; dc <= range; dc++) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < gameState.gridRows && newCol >= 0 && newCol < gameState.gridCols) {
                const targetCell = gameState.grid[newRow][newCol];
                if (!targetCell.isWater && !targetCell.unit && targetCell.owner === owner) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
    return moves;
}

function getValidAttacks(row, col, unitType, owner) {
    const attacks = [];
    const range = UNITS[unitType].range;
    
    for (let dr = -range; dr <= range; dr++) {
        for (let dc = -range; dc <= range; dc++) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < gameState.gridRows && newCol >= 0 && newCol < gameState.gridCols) {
                const targetCell = gameState.grid[newRow][newCol];
                if (targetCell.unit && targetCell.owner !== owner) {
                    attacks.push({ row: newRow, col: newCol, type: 'unit' });
                }
                if (targetCell.isCastle && targetCell.owner !== owner) {
                    attacks.push({ row: newRow, col: newCol, type: 'castle' });
                }
            }
        }
    }
    return attacks;
}

function moveUnit(fromRow, fromCol, toRow, toCol) {
    const unit = gameState.grid[fromRow][fromCol].unit;
    const unitHp = gameState.grid[fromRow][fromCol].unitHp;
    
    gameState.grid[toRow][toCol].unit = unit;
    gameState.grid[toRow][toCol].unitHp = unitHp;
    gameState.grid[fromRow][fromCol].unit = null;
    gameState.grid[fromRow][fromCol].unitHp = 0;
    
    if (gameState.defendedUnits.has(`${fromRow},${fromCol}`)) {
        gameState.defendedUnits.delete(`${fromRow},${fromCol}`);
        gameState.defendedUnits.add(`${toRow},${toCol}`);
    }
    if (gameState.unitOriginalHp.has(`${fromRow},${fromCol}`)) {
        const hp = gameState.unitOriginalHp.get(`${fromRow},${fromCol}`);
        gameState.unitOriginalHp.delete(`${fromRow},${fromCol}`);
        gameState.unitOriginalHp.set(`${toRow},${toCol}`, hp);
    }
}

function attack(attackerRow, attackerCol, targetRow, targetCol, type) {
    const attackerUnit = gameState.grid[attackerRow][attackerCol].unit;
    const damage = UNITS[attackerUnit].damage;
    
    if (type === 'unit') {
        const targetUnit = gameState.grid[targetRow][targetCol].unit;
        const newHp = gameState.grid[targetRow][targetCol].unitHp - damage;
        if (newHp <= 0) {
            gameState.grid[targetRow][targetCol].unit = null;
            gameState.grid[targetRow][targetCol].unitHp = 0;
            gameState.defendedUnits.delete(`${targetRow},${targetCol}`);
            gameState.unitOriginalHp.delete(`${targetRow},${targetCol}`);
        } else {
            gameState.grid[targetRow][targetCol].unitHp = newHp;
        }
    } else if (type === 'castle') {
        const newHp = gameState.grid[targetRow][targetCol].castleHp - damage;
        gameState.grid[targetRow][targetCol].castleHp = newHp;
        
        if (newHp <= 0) {
            // Захват замка
            const oldOwner = gameState.grid[targetRow][targetCol].owner;
            gameState.grid[targetRow][targetCol].owner = gameState.currentPlayer;
            gameState.grid[targetRow][targetCol].castleHp = BUILDING_LEVELS[1].hp;
            gameState.grid[targetRow][targetCol].castleLevel = 1;
            
            // Переход юнитов победителю
            for (let i = 0; i < gameState.gridRows; i++) {
                for (let j = 0; j < gameState.gridCols; j++) {
                    if (gameState.grid[i][j].owner === oldOwner && 
                        (gameState.grid[i][j].unit || gameState.grid[i][j].isCastle)) {
                        gameState.grid[i][j].owner = gameState.currentPlayer;
                    }
                }
            }
        }
    }
}

function endTurn() {
    if (gameState.waitingForAITurn) return;
    
    saveGameToLocalStorage();
    
    // Сброс выделения
    gameState.selectedUnit = null;
    gameState.availableMoves = [];
    gameState.availableAttacks = [];
    gameState.usedUnits.clear();
    gameState.defendedUnits.clear();
    gameState.unitOriginalHp.clear();
    gameState.undoUsed = false;
    document.getElementById('undoBtn').classList.add('hidden');
    
    // Смена игрока
    const currentIndex = gameState.players.indexOf(gameState.currentPlayer);
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    gameState.currentPlayer = gameState.players[nextIndex];
    
    // Если вернулись к первому игроку - новый день
    if (nextIndex === 0) {
        gameState.currentDay++;
        
        // Доходы
        for (let player of gameState.players) {
            const territoryCount = calculateTerritoryCount(player);
            const woodIncome = calculateWoodIncome(player);
            const goldIncome = calculateGoldMineIncome(player);
            
            gameState.playersData[player].gold += territoryCount + goldIncome;
            gameState.playersData[player].wood += woodIncome;
            
            paySalary(player);
        }
    }
    
    updateUI();
    updateFogOfWar();
    draw();
    
    // Ход ИИ
    if (gameState.players.indexOf(gameState.currentPlayer) >= gameState.aiCount) {
        // Игрок
        document.getElementById('undoBtn').classList.remove('hidden');
    } else {
        // ИИ
        gameState.waitingForAITurn = true;
        setTimeout(() => makeAITurn(), 500);
    }
}

function updateUI() {
    const player = gameState.playersData[gameState.currentPlayer];
    const playerName = COLORS[gameState.currentPlayer]?.name || gameState.currentPlayer;
    document.getElementById('currentPlayerName').innerHTML = `🎮 ${playerName}`;
    
    const territoryCount = calculateTerritoryCount(gameState.currentPlayer);
    const woodIncome = calculateWoodIncome(gameState.currentPlayer);
    const goldIncome = calculateGoldMineIncome(gameState.currentPlayer);
    
    document.getElementById('goldAmount').innerHTML = 
        `<span style="color:white">💰 ${player.gold} (+${territoryCount + goldIncome}) 🪵 ${player.wood} (+${woodIncome}) 📅 День ${gameState.currentDay}</span>`;
}

// ==================== ИИ ====================

function makeAITurn() {
    if (!gameState.waitingForAITurn) return;
    if (!gameState.gameActive) return;
    
    const aiPlayer = gameState.currentPlayer;
    
    // Сбор всех юнитов ИИ
    let units = [];
    for (let i = 0; i < gameState.gridRows; i++) {
        for (let j = 0; j < gameState.gridCols; j++) {
            if (gameState.grid[i][j].unit && gameState.grid[i][j].owner === aiPlayer) {
                units.push({ row: i, col: j, unit: gameState.grid[i][j].unit });
            }
        }
    }
    
    // Случайный порядок ходов
    units.sort(() => Math.random() - 0.5);
    
    let actionPerformed = false;
    
    for (let unit of units) {
        // Проверка на атаку
        const attacks = getValidAttacks(unit.row, unit.col, unit.unit, aiPlayer);
        if (attacks.length > 0) {
            const target = attacks[0];
            attack(unit.row, unit.col, target.row, target.col, target.type);
            actionPerformed = true;
            break;
        }
        
        // Проверка на движение
        const moves = getValidMoves(unit.row, unit.col, unit.unit, aiPlayer);
        if (moves.length > 0) {
            const target = moves[0];
            moveUnit(unit.row, unit.col, target.row, target.col);
            actionPerformed = true;
            break;
        }
    }
    
    // Если действий не было - просто завершаем ход
    setTimeout(() => {
        if (gameState.waitingForAITurn) {
            gameState.waitingForAITurn = false;
            endTurn();
        }
    }, actionPerformed ? 800 : 100);
}

// ==================== ОБРАБОТЧИКИ КЛИКОВ ====================

function handleCanvasClick(e) {
    if (gameState.waitingForAITurn) return;
    if (!gameState.gameActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    const col = Math.floor(canvasX / cellSize);
    const row = Math.floor(canvasY / cellSize);
    
    if (row < 0 || row >= gameState.gridRows || col < 0 || col >= gameState.gridCols) return;
    
    const cell = gameState.grid[row][col];
    
    // Атака
    if (gameState.selectedUnit && gameState.availableAttacks.some(a => a.row === row && a.col === col)) {
        const attackInfo = gameState.availableAttacks.find(a => a.row === row && a.col === col);
        attack(gameState.selectedUnit.row, gameState.selectedUnit.col, row, col, attackInfo.type);
        gameState.selectedUnit = null;
        gameState.availableMoves = [];
        gameState.availableAttacks = [];
        draw();
        updateUI();
        return;
    }
    
    // Движение
    if (gameState.selectedUnit && gameState.availableMoves.some(m => m.row === row && m.col === col)) {
        moveUnit(gameState.selectedUnit.row, gameState.selectedUnit.col, row, col);
        gameState.selectedUnit = null;
        gameState.availableMoves = [];
        gameState.availableAttacks = [];
        draw();
        updateUI();
        return;
    }
    
    // Выбор юнита
    if (cell.unit && cell.owner === gameState.currentPlayer && !gameState.usedUnits.has(`${row},${col}`)) {
        gameState.selectedUnit = { row, col, unit: cell.unit };
        gameState.availableMoves = getValidMoves(row, col, cell.unit, gameState.currentPlayer);
        gameState.availableAttacks = getValidAttacks(row, col, cell.unit, gameState.currentPlayer);
        draw();
        return;
    }
    
    // Открытие замка
    if (cell.isCastle && cell.owner === gameState.currentPlayer) {
        gameState.currentCastleRow = row;
        gameState.currentCastleCol = col;
        openCastleModal();
        return;
    }
    
    // Сброс выделения
    gameState.selectedUnit = null;
    gameState.availableMoves = [];
    gameState.availableAttacks = [];
    draw();
}

// ==================== МОДАЛЬНОЕ ОКНО ЗАМКА ====================

function openCastleModal() {
    const row = gameState.currentCastleRow;
    const col = gameState.currentCastleCol;
    const cell = gameState.grid[row][col];
    const level = cell.castleLevel || 1;
    const levelData = BUILDING_LEVELS[level];
    const playerData = gameState.playersData[gameState.currentPlayer];
    
    document.getElementById('castleLevel').innerHTML = `Уровень: ${level} - ${levelData.name}`;
    document.getElementById('castleHp').innerHTML = `HP: ${cell.castleHp}/${levelData.hp}`;
    document.getElementById('playerResources').innerHTML = `<span style="color:white">💰 ${playerData.gold} 🪵 ${playerData.wood}</span>`;
    
    // Обновление кнопок юнитов
    const availableUnits = levelData.availableUnits;
    const buyButtons = {
        infantry: 'buyInfantryBtn', archer: 'buyArcherBtn', captain: 'buyCaptainBtn',
        cavalry: 'buyCavalryBtn', general: 'buyGeneralBtn', catapult: 'buyCatapultBtn'
    };
    
    for (let [unit, btnId] of Object.entries(buyButtons)) {
        const btn = document.getElementById(btnId);
        if (availableUnits.includes(unit)) {
            const unitData = UNITS[unit];
            btn.innerHTML = `${unitData.icon} ${unitData.name} - 💰${unitData.costGold} 🪵${unitData.costWood}`;
            btn.disabled = playerData.gold < unitData.costGold || playerData.wood < unitData.costWood;
            btn.onclick = () => buyUnit(unit);
        } else {
            btn.innerHTML = `🔒 ${UNITS[unit].name} (нужен уровень ${unitData.requiredLevel})`;
            btn.disabled = true;
            btn.onclick = null;
        }
    }
    
    document.getElementById('upgradeCastleBtn').onclick = () => upgradeCastle();
    document.getElementById('upgradeCastleBtn').disabled = level >= 5 || playerData.gold < levelData.costGold || playerData.wood < levelData.costWood;
    document.getElementById('upgradeCastleBtn').innerHTML = `⬆️ Улучшить замок (${levelData.costGold}💰 ${levelData.costWood}🪵)`;
    
    const healCost = Math.floor(levelData.hp * 0.2);
    document.getElementById('healCastleBtn').innerHTML = `❤️ Восстановить 10 HP (${healCost}💰)`;
    document.getElementById('healCastleBtn').disabled = cell.castleHp >= levelData.hp || playerData.gold < healCost;
    document.getElementById('healCastleBtn').onclick = () => healCastle();
    
    document.getElementById('castleModal').classList.remove('hidden');
}

function buyUnit(unitType) {
    const row = gameState.currentCastleRow;
    const col = gameState.currentCastleCol;
    const cell = gameState.grid[row][col];
    const unitData = UNITS[unitType];
    const playerData = gameState.playersData[gameState.currentPlayer];
    
    // Поиск свободной соседней клетки
    let placed = false;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < gameState.gridRows && nc >= 0 && nc < gameState.gridCols) {
                const targetCell = gameState.grid[nr][nc];
                if (!targetCell.isWater && !targetCell.unit && targetCell.owner === gameState.currentPlayer) {
                    targetCell.unit = unitType;
                    targetCell.unitHp = unitData.hp;
                    playerData.gold -= unitData.costGold;
                    playerData.wood -= unitData.costWood;
                    placed = true;
                    break;
                }
            }
        }
        if (placed) break;
    }
    
    if (!placed) {
        alert('Нет свободного места рядом с замком!');
        return;
    }
    
    updateUI();
    openCastleModal(); // Обновление модального окна
    draw();
}

function upgradeCastle() {
    const row = gameState.currentCastleRow;
    const col = gameState.currentCastleCol;
    const cell = gameState.grid[row][col];
    const currentLevel = cell.castleLevel || 1;
    const nextLevel = currentLevel + 1;
    
    if (nextLevel > 5) return;
    
    const levelData = BUILDING_LEVELS[nextLevel];
    const playerData = gameState.playersData[gameState.currentPlayer];
    
    if (playerData.gold >= levelData.costGold && playerData.wood >= levelData.costWood) {
        playerData.gold -= levelData.costGold;
        playerData.wood -= levelData.costWood;
        cell.castleLevel = nextLevel;
        cell.castleHp = levelData.hp;
        
        updateUI();
        openCastleModal();
        draw();
    }
}

function healCastle() {
    const row = gameState.currentCastleRow;
    const col = gameState.currentCastleCol;
    const cell = gameState.grid[row][col];
    const level = cell.castleLevel || 1;
    const levelData = BUILDING_LEVELS[level];
    const playerData = gameState.playersData[gameState.currentPlayer];
    
    const healCost = Math.floor(levelData.hp * 0.2);
    const healAmount = 10;
    
    if (playerData.gold >= healCost && cell.castleHp < levelData.hp) {
        playerData.gold -= healCost;
        cell.castleHp = Math.min(levelData.hp, cell.castleHp + healAmount);
        
        updateUI();
        openCastleModal();
        draw();
    }
}

// ==================== НОВАЯ ИГРА ====================

function startNewGame() {
    // Получение настроек
    const sizeValue = document.getElementById('gridSizeSelect').value;
    const [cols, rows] = sizeValue.split('x').map(Number);
    gameState.gridCols = cols;
    gameState.gridRows = rows;
    gameState.waterPercent = parseInt(document.getElementById('waterPercentSelect').value);
    gameState.aiCount = parseInt(document.getElementById('aiCountSelect').value);
    gameState.difficulty = document.getElementById('difficultySelect').value;
    const playerColor = document.getElementById('playerColorSelect').value;
    
    applyDifficulty(gameState.difficulty);
    gameState.fogEnabled = fogOfWarEnabled;
    
    // Формирование списка игроков
    const aiColors = ['orange', 'blue', 'cyan', 'red', 'purple'].filter(c => c !== playerColor);
    gameState.players = [playerColor, ...aiColors.slice(0, gameState.aiCount)];
    
    // Инициализация данных игроков
    gameState.playersData = {};
    for (let player of gameState.players) {
        gameState.playersData[player] = { gold: 50, wood: 20 };
    }
    
    // Генерация карты
    gameState.grid = generateMap();
    const castlePositions = placeCastles(gameState.grid, gameState.players);
    
    gameState.currentPlayer = gameState.players[0];
    gameState.currentDay = 1;
    gameState.gameActive = true;
    gameState.waitingForAITurn = false;
    gameState.selectedUnit = null;
    gameState.usedUnits.clear();
    gameState.defendedUnits.clear();
    gameState.unitOriginalHp.clear();
    gameState.exploredCells.clear();
    gameState.undoUsed = false;
    
    updateFogOfWar();
    updateUI();
    draw();
    
    // Скрыть все меню, показать игру
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('gameScreen').classList.add('active');
    
    // Если первый игрок - ИИ (не должно быть, но на всякий случай)
    if (gameState.players.indexOf(gameState.currentPlayer) >= gameState.aiCount) {
        document.getElementById('undoBtn').classList.remove('hidden');
    } else {
        gameState.waitingForAITurn = true;
        setTimeout(() => makeAITurn(), 500);
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Навигация по меню
    document.getElementById('newGameBtn').onclick = () => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('newGameSettingsScreen').classList.add('active');
    };
    
    document.getElementById('continueBtn').onclick = () => {
        if (loadGameFromLocalStorage()) {
            applyDifficulty(gameState.difficulty);
            updateFogOfWar();
            updateUI();
            draw();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('gameScreen').classList.add('active');
            
            if (gameState.players.indexOf(gameState.currentPlayer) >= gameState.aiCount) {
                document.getElementById('undoBtn').classList.remove('hidden');
            } else {
                gameState.waitingForAITurn = true;
                setTimeout(() => makeAITurn(), 500);
            }
        } else {
            alert('Нет сохранённой игры!');
        }
    };
    
    document.getElementById('startGameBtn').onclick = () => startNewGame();
    document.getElementById('backToMainFromSettingsBtn').onclick = () => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('menuScreen').classList.add('active');
    };
    
    document.getElementById('endTurnBtn').onclick = () => endTurn();
    document.getElementById('menuToMainBtn').onclick = () => {
        if (confirm('Выйти в главное меню? Прогресс будет сохранён.')) {
            saveGameToLocalStorage();
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('menuScreen').classList.add('active');
            gameState.waitingForAITurn = false;
        }
    };
    
    document.getElementById('undoBtn').onclick = () => {
        // Простая отмена - загрузка последнего сохранения
        if (loadGameFromLocalStorage()) {
            updateUI();
            updateFogOfWar();
            draw();
            alert('Ход отменён!');
        } else {
            alert('Нет сохранения для отмены!');
        }
    };
    
    document.getElementById('closeCastleModal').onclick = () => {
        document.getElementById('castleModal').classList.add('hidden');
    };
    
    document.getElementById('playAgainBtn').onclick = () => {
        document.getElementById('victoryModal').classList.add('hidden');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('newGameSettingsScreen').classList.add('active');
    };
    
    document.getElementById('menuAfterVictoryBtn').onclick = () => {
        document.getElementById('victoryModal').classList.add('hidden');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('menuScreen').classList.add('active');
    };
    
    // Обработка звука
    let soundEnabled = true;
    document.getElementById('soundToggleBtn').onclick = (e) => {
        soundEnabled = !soundEnabled;
        gameState.soundEnabled = soundEnabled;
        e.target.textContent = soundEnabled ? 'ВКЛ' : 'ВЫКЛ';
    };
    
    // Клики по canvas
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleCanvasClick(e);
    });
    
    // Начальное состояние
    applyDifficulty('medium');
});