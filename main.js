require(['src/Grid'], function (Grid) {
    var perfStats;
    var emptyCellValue = Grid.emptyCell;
    
    function main() {
        $('#btnSolve').click(function() {
            solveExample();
        });
    }
    function solveExample() {
        var grid = makeExampleGrid14x14();
        
        $('#outText').empty();
        $('#outText').append("<div>Solving</div>");
        $('#outText').append(renderGridToElement(grid));
        $('#outText').append($("<div id='progress'>Solving . . .</div>"));
        
        setTimeout(function() {
            $('#progress').remove();
            var solutions = solveGridWithStats(grid);
            
            $('#outText').append($("<div>Solutions:</div>"));
            solutions.forEach(function(solution) {
                var solutionGrid = renderGridToElement(solution);
                $('#outText').append(solutionGrid);
            });
        }, 50);
    }
    
    function makeExampleGrid14x14() {
        return parseGrid(
            //        abcdefghijklmn
            /*  1:*/ "0-----1--1----\n" +
            /*  2:*/ "0-11----1-0-0-\n" +
            /*  3:*/ "-0--1-0---0---\n" +
            /*  4:*/ "------0--1---0\n" +
            /*  5:*/ "0---------0---\n" +
            /*  6:*/ "---00-----0---\n" +
            /*  7:*/ "--0---11-----1\n" +
            /*  8:*/ "----------0-0-\n" +
            /*  9:*/ "0-0-0--0-1-1--\n" +
            /* 10:*/ "0-1--0------0-\n" +
            /* 11:*/ "----0--0-1----\n" +
            /* 12:*/ "---0-1-0-1--1-\n" +
            /* 13:*/ "0-------1---1-\n" +
            /* 14:*/ "---00---0-----"
        );
    }
    
    function makeExampleGrid10x10() {
        return parseGrid(
            //        abcdefghij
            /*  1:*/ "--11---1--\n" +
            /*  2:*/ "-1--------\n" +
            /*  3:*/ "0--0--1-1-\n" +
            /*  4:*/ "--1--1----\n" +
            /*  5:*/ "---------1\n" +
            /*  6:*/ "1-0----0--\n" +
            /*  7:*/ "----1-1--1\n" +
            /*  8:*/ "-0-0---1-0\n" +
            /*  9:*/ "----1-----\n" +
            /* 10:*/ "-0--1-11-1"
        );
    }
    
    function makeExampleGrid4x4() {
        return parseGrid(
            " 1 0\n" + 
            "  0 \n" + 
            " 0  \n" + 
            "11 0"
        );
    }
    
    function parseGrid(s) {
        var rows = s.split("\n");
        var rowLengths = rows.map(function(row) { return row.length; });
        var maxRowLength = Math.max.apply(null, rowLengths);
        var grid = new Grid(maxRowLength, rows.length);
        
        for(var ixRow = 0, numRows = rows.length; ixRow < numRows; ++ixRow) {
            var currRow = rows[ixRow];
            for(var ixCol = 0, numCols = currRow.length; ixCol < numCols; ++ixCol) {
                var currCell = currRow[ixCol];
                var value = currCell === '0' ? 0 :
                            currCell === '1' ? 1 :
                            emptyCellValue;
                grid.set(ixCol, ixRow, value);
            }
        }
        
        return grid;
    }
    
    function solveGridWithStats(grid) {
        resetPerfStats();
        console.time("solveGrid");
        var result = solveGrid(grid);
        console.timeEnd("solveGrid");
        printPerfStats();

        return result;
    }
    
    function resetPerfStats() {
        perfStats = {
            contradictionSearches: 0,
            contradictionSearchesPassed: 0,
            solveGridRecursiveCalls: 0,
            contradictionSearchReachedIdenticalRowColComparison: 0
        };
    }
    
    function printPerfStats() {
        console.info(perfStats);
    }
    
    function solveGrid(grid) {
        if(gridHasContradiction(grid)) {
            return [];
        }
    
        return solveGridRecursive(grid, 0, 0);
    }
    
    function solveGridRecursive(grid, dirtyX, dirtyY) {
        perfStats.solveGridRecursiveCalls += 1;
        
        if(gridHasContradictionWithDirtyRowCol(grid, dirtyX, dirtyY)) {
            return [];
        }
        
        var cellToSet = getFirstGap(grid);
        if(cellToSet === null) {
            return [grid.shallowClone()];
        }
        
        var solutions = [];
        
        for(var val = 0; val <= 1; ++val) {
            grid.set(cellToSet.x, cellToSet.y, val);
            
            var solutionsWithValue = solveGridRecursive(grid, cellToSet.x, cellToSet.y);
            solutions.push.apply(solutions, solutionsWithValue);
            
            grid.set(cellToSet.x, cellToSet.y, emptyCellValue);
        }
        
        return solutions;
    }
    
    function gridHasContradictionWithDirtyRowCol(grid, x, y) {
        perfStats.contradictionSearches += 1;
    
        if(threeAdjacentInGivenRow(grid, y)) {
            return true;
        }
        if(threeAdjacentInGivenColumn(grid, x)) {
            return true;
        }
        if(tooManyOfValueTotalInGivenRow(grid, y)) {
            return true;
        }
        if(tooManyOfValueTotalInGivenColumn(grid, x)) {
            return true;
        }
        
        perfStats.contradictionSearchReachedIdenticalRowColComparison += 1;
        
        if(twoIdenticalRows(grid)) {
            return true;
        }
        if(twoIdenticalColumns(grid)) {
            return true;
        }

        perfStats.contradictionSearchesPassed += 1;
        
        return false;
    }
    
    function gridHasContradiction(grid) {
        perfStats.contradictionSearches += 1;
    
        if(threeAdjacentInAnyRow(grid)) {
            return true;
        }
        if(threeAdjacentInAnyColumn(grid)) {
            return true;
        }
        if(tooManyOfValueTotalInAnyRow(grid)) {
            return true;
        }
        if(tooManyOfValueTotalInAnyColumn(grid)) {
            return true;
        }
        
        perfStats.contradictionSearchReachedIdenticalRowColComparison += 1;
        
        if(twoIdenticalRows(grid)) {
            return true;
        }
        if(twoIdenticalColumns(grid)) {
            return true;
        }

        perfStats.contradictionSearchesPassed += 1;
        
        return false;
    }
    
    
    function tooManyOfValueTotalInAnyRow(grid) {
        var maxTotal = grid.width / 2;
        
        for(var y = 0; y < grid.height; ++y) {
            if(tooManyOfValueTotalInGivenRow(grid, y)) {
                return true;
            }
        }
        
        return false;
    }
    function tooManyOfValueTotalInGivenRow(grid, y) {
        var maxTotal = grid.width / 2;
    
        var totalZeroes = 0;
        var totalOnes = 0;
        
        for(var x = 0; x < grid.width; ++x) {
            var value = grid.get(x, y);
            if(value === 0) {
                totalZeroes += 1;
            }
            else if (value === 1) {
                totalOnes += 1;
            }
        }
        
        if(totalZeroes > maxTotal || totalOnes > maxTotal) {
            return true;
        }
        
        return false;
    }
    function tooManyOfValueTotalInAnyColumn(grid) {
        for(var x = 0; x < grid.width; ++x) {
            if(tooManyOfValueTotalInGivenColumn(grid, x)) {
                return true;
            }
        }
        
        return false;
    }
    function tooManyOfValueTotalInGivenColumn(grid, x) {
        var maxTotal = grid.height / 2;
        
        var totalZeroes = 0;
        var totalOnes = 0;
        
        for(var y = 0; y < grid.height; ++y) {
            var value = grid.get(x, y);
            if(value === 0) {
                totalZeroes += 1;
            }
            else if (value === 1) {
                totalOnes += 1;
            }
        }
        
        if(totalZeroes > maxTotal || totalOnes > maxTotal) {
            return true;
        }
        
        return false;
    }
    function threeAdjacentInAnyRow(grid) {
        for(var y = 0; y < grid.height; ++y) {
            if(threeAdjacentInGivenRow(grid, y)) {
                return true;
            }
        }
        
        return false;
    }
    function threeAdjacentInGivenRow(grid, y) {
        var streakValue = emptyCellValue; // Invalid initial value, which should never be returned.
        var streakCount = 0;
        
        for(var x = 0; x < grid.width; ++x) {
            var currValue = grid.get(x, y);
            if((currValue === 0 || currValue === 1) && streakValue === currValue) {
                streakCount += 1;
            }
            else {
                streakValue = currValue;
                streakCount = 1;
            }
            
            if(streakCount >= 3) {
                return true;
            }
        }
        
        return false;
    }
    function threeAdjacentInAnyColumn(grid) {
        for(var x = 0; x < grid.height; ++x) {
            if(threeAdjacentInGivenColumn(grid, x)) {
                return true;
            }
        }
        
        return false;
    }
    function threeAdjacentInGivenColumn(grid, x) {
        var streakValue = emptyCellValue; // Invalid initial value, which should never be returned.
        var streakCount = 0;
        
        for(var y = 0; y < grid.width; ++y) {
            var currValue = grid.get(x, y);
            if((currValue === 0 || currValue === 1) && streakValue === currValue) {
                streakCount += 1;
            }
            else {
                streakValue = currValue;
                streakCount = 1;
            }
            
            if(streakCount >= 3) {
                return true;
            }
        }
        
        return false;
    }
    function twoIdenticalRows(grid) {
        for(var y1 = 0; y1 < grid.height; ++y1) {
            for(var y2 = y1 + 1; y2 < grid.height; ++y2) {
                var rowsIdentical = true;
                
                for(var x = 0; x < grid.width; ++x) {
                    var row1CellValue = grid.get(x, y1);
                    var row2CellValue = grid.get(x, y2);
                
                    if( row1CellValue === emptyCellValue ||
                        row2CellValue === emptyCellValue ||
                        row1CellValue !== row2CellValue) {
                        rowsIdentical = false;
                        break;
                    }
                }
                
                if(rowsIdentical) {
                    return true;
                }
            }
        }
        
        return false;
    }
    function twoIdenticalColumns(grid) {
        for(var x1 = 0; x1 < grid.width; ++x1) {
            for(var x2 = x1 + 1; x2 < grid.width; ++x2) {
                var colsIdentical = true;
                
                for(var y = 0; y < grid.height; ++y) {
                    var col1CellValue = grid.get(x1, y);
                    var col2CellValue = grid.get(x2, y);
                
                    if( col1CellValue === emptyCellValue ||
                        col2CellValue === emptyCellValue ||
                        col1CellValue !== col2CellValue) {
                        colsIdentical = false;
                        break;
                    }
                }
                
                if(colsIdentical) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    
    
    function getFirstGap(grid) {
        for(var y = 0, numRows = grid.height; y < numRows; ++y) {
            for(var x = 0, numCols = grid.width; x < numCols; ++x) {
                var currCell = grid.get(x, y);
                if(currCell === emptyCellValue) {
                    return {x: x, y: y};
                }
            }
        }
        
        return null;
    }
    
    function renderGridToElement(g) {
        var outHtml = "<pre>";
        
        for(var y = 0; y < g.height; ++y) {
            for(var x = 0; x < g.width; ++x) {
                var cellValue = g.get(x, y);
                outHtml += cellValue === emptyCellValue ? "-" : cellValue;
            }
            outHtml += "<br />";
        }
        
        outHtml += "</pre>";
        
        return $(outHtml);
    }
    
    main();
});