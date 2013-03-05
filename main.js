require(['src/Grid'], function (Grid) {
    var perfStats;
    var emptyCellValue = Grid.emptyCell;
    
    function main() {
        $('#outText').empty();
        $('#outText').html("<pre>Solving . . .</pre>");
        
        setTimeout(function() {
            var grid = makeExampleGrid14x14();
            var solutions = solveGrid(grid);
            
            $('#outText').empty();
            $('#outText').html("<pre>Solutions:</pre>");
            solutions.forEach(function(solution) {
                var solutionGrid = $('<div />');
                renderGrid(solution, solutionGrid);
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
    
    function solveGrid(grid) {
        resetPerfStats();
        console.time("solveGrid");
        var result = solveGridRecursive(grid);
        console.timeEnd("solveGrid");
        printPerfStats();
        return result;
    }
    
    function resetPerfStats() {
        perfStats = {
            contradictionSearches: 0,
            contradictionSearchesPassed: 0,
            solveGridRecursiveCalls: 0
        };
    }
    
    function printPerfStats() {
        console.info(perfStats);
    }
    
    function solveGridRecursive(grid) {
        perfStats.solveGridRecursiveCalls += 1;
        
        if(gridHasContradiction(grid)) {
            return [];
        }
        
        var firstGap = getFirstGap(grid);
        if(firstGap === null) {
            return [grid];
        }
        
        var solutions = [];
        
        for(var val = 0; val <= 1; ++val) {
            var gridWithValue = grid.shallowClone();
            gridWithValue.set(firstGap.x, firstGap.y, val);
            
            var solutionsWithValue = solveGridRecursive(gridWithValue);
            solutions.push.apply(solutions, solutionsWithValue);
        }
        
        return solutions;
    }
    
    function gridHasContradiction(grid) {
        perfStats.contradictionSearches += 1;
    
        if(threeAdjacentInARow(grid)) {
            return true;
        }
        if(threeAdjacentInAColumn(grid)) {
            return true;
        }
        if(tooManyOfValueTotalInARow(grid)) {
            return true;
        }
        if(tooManyOfValueTotalInAColumn(grid)) {
            return true;
        }
        if(twoIdenticalRows(grid)) {
            return true;
        }
        if(twoIdenticalColumns(grid)) {
            return true;
        }

        perfStats.contradictionSearchesPassed += 1;
        
        return false;
    }
    
    
    function tooManyOfValueTotalInARow(grid) {
        var maxTotal = grid.width / 2;
        
        for(var y = 0; y < grid.height; ++y) {
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
        }
        
        return false;
    }
    function tooManyOfValueTotalInAColumn(grid) {
        var maxTotal = grid.height / 2;
        
        for(var x = 0; x < grid.width; ++x) {
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
        }
        
        return false;
    }
    function threeAdjacentInARow(grid) {
        for(var y = 0; y < grid.height; ++y) {
            var streakValue = null;
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
        }
        
        return false;
    }
    function threeAdjacentInAColumn(grid) {
        for(var x = 0; x < grid.height; ++x) {
            var streakValue = null;
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
    
    function renderGrid(g, outElt) {
        var outHtml = "<pre>";
        
        for(var y = 0; y < g.height; ++y) {
            for(var x = 0; x < g.width; ++x) {
                var cellValue = g.get(x, y);
                outHtml += cellValue === emptyCellValue ? "-" : cellValue;
            }
            outHtml += "<br />";
        }
        
        outHtml += "</pre>";
        
        outElt.html(outHtml);
    }
    
    main();
});