define([], function() {
    function Grid(width, height, orig)  {
        this.width = width;
        this.height = height;
        this.numCells = this.width * this.height;
        
        if(orig !== undefined) {
            this._cells = orig._cells.slice(0);
            this.rowFills = orig.rowFills.slice(0);
            this.colFills = orig.colFills.slice(0);
            this.numCellsFilled = orig.numCellsFilled;
        }
        else {
            this._cells = makeConstantArray(this.numCells, Grid.emptyCell);
            this.rowFills = makeConstantArray(this.height, 0);
            this.colFills = makeConstantArray(this.width, 0);
            this.numCellsFilled = 0;
        }
    }
    
    function makeConstantArray(len, value) {
        var arr = [];
        arr.length = len;

        for(var i = 0; i < len; ++i) {
            arr[i] = value;
        }

        return arr;
    }
    
    Grid.prototype.get = function(x, y) {
        return this._cells[x + y * this.width];
    };
    
    Grid.prototype.set = function(x, y, value) {
        var oldValue = this._cells[x + y * this.width];
        this._cells[x + y * this.width] = value;
        
        if(oldValue === Grid.emptyCell && value !== Grid.emptyCell) {
            this.numCellsFilled += 1;
            this.rowFills[y]   += 1;
            this.colFills[x]   += 1;
        }
        
        if(oldValue !== Grid.emptyCell && value === Grid.emptyCell) {
            this.numCellsFilled -= 1;
            this.rowFills[y]   -= 1;
            this.colFills[x]   -= 1;
        }
    };
    
    Grid.prototype.isFilled = function() {
        return this.numCellsFilled === this.numCells;
    }
    
    Grid.prototype.shallowClone = function() {
        var clone = new Grid(this.width, this.height, this);
        return clone;
    };
    
    Grid.emptyCell = 255;
    
    return Grid;
});