define([], function() {
    function Grid(width, height)  {
        this.width = width;
        this.height = height;
        
        var cells = [];
        for(var i = 0, len = width * height; i < len; ++i) {
            cells.push(Grid.emptyCell);
        }
        this._cells = cells;
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
    
    Grid.emptyCell = null;
    
    return Grid;
});