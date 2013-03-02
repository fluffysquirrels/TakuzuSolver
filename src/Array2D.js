define([], function() {
    function Array2D(width, height)  {
        this.width = width;
        this.height = height;
        
        var cells = [];
        for(var i = 0, len = width * height; i < len; ++i) {
            cells.push(null);
        }
        this._cells = cells;
    }
    
    Array2D.prototype.get = function(x, y) {
        return this._cells[x + y * this.width];
    };
    
    Array2D.prototype.set = function(x, y, value) {
        this._cells[x + y * this.width] = value;
    };
    
    Array2D.prototype.shallowClone = function() {
        var clone = new Array2D(this.width, this.height);
        clone._cells = this._cells.slice(0);
        return clone;
    };
    
    return Array2D;
});