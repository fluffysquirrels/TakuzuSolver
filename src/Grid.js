define([], function() {
    function Grid(width, height)  {
        this.width = width;
        this.height = height;

        this._cells = [];
        for(var i = 0, numCells = this.width * this.height; i < numCells; ++i) {
            this._cells.push(Grid.emptyCell);
        }
    }
    
    Grid.prototype.get = function(x, y) {
        return this._cells[x + y * this.width];
    };
    
    Grid.prototype.set = function(x, y, value) {
        this._cells[x + y * this.width] = value;
    };
    
    Grid.prototype.shallowClone = function() {
        var clone = new Grid(this.width, this.height);
        clone._cells = this._cells.slice(0);
        return clone;
    };
    
    Grid.emptyCell = 255;
    
    return Grid;
});