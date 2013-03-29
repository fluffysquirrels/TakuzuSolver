require(['src/Grid'], function (Grid) {
    var perfStats;
    var emptyCellValue = Grid.emptyCell;
    var invalidCellValue = emptyCellValue - 1;
    
    function main() {
        $('#btnSolve').click(function() {
            solveExample(true);
        });
        $('#btnSolveQuick').click(function() {
            solveExample(false);
        });
        btnSolveQuick
    }
    function solveExample(accurateTiming) {
        var grid = makeExampleGrid14x14();
        
        $('#outText').empty();
        $('#outText').append("<div>Solving</div>");
        $('#outText').append(renderGridToElement(grid));

        resetPerfStats();
        var afterEasyCases = grid.shallowClone();
        solveEasyCasesForWholeGrid(afterEasyCases);
        $('#outText').append("<div>Grid after easy cases solved:</div>");
        $('#outText').append(renderGridToElement(afterEasyCases));
        
        $('#outText').append($("<div id='progressResults'>Solving once for results . . .</div>"));
        
        setTimeout(function() {
            var solutions = solveGridWithStats(grid);
            
            $('#progressResults').remove();
            
            $('#outText').append($("<div>Solutions:</div>"));
            solutions.forEach(function(solution) {
                var solutionGrid = renderGridToElement(solution);
                $('#outText').append(solutionGrid);
            });
            
            if(!accurateTiming) {
                return;
            }
            
            var iterations = 100;
            $('#outText').append($("<div id='progressTiming'>Solving " + iterations + " time(s) for timing . . .</div>"));
            
            setTimeout(function () {
                var solveRepeatedlyProfileMessage = "solveGrid " + iterations + " time(s)";
                
                var beginTimeMs = Date.now();
                
                console.time(solveRepeatedlyProfileMessage);
                for(var iter = 0; iter < iterations; ++iter) {
                    var solutions = solveGridWithoutStats(grid);
                }
                console.timeEnd(solveRepeatedlyProfileMessage);
                
                var endTimeMs = Date.now();
                console.info("Mean time is " + (endTimeMs - beginTimeMs) / iterations +  "ms");
                
                $('#progressTiming').remove();
                
                $('#outText').append($("<div>Solved " + iterations + " time(s) in " + (endTimeMs - beginTimeMs) +  "ms</div>"));
                $('#outText').append($("<div>Mean time is " + (endTimeMs - beginTimeMs) / iterations +  "ms</div>"));
            }, 1);
        }, 1);
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
    
    function solveGridWithoutStats(grid) {
        resetPerfStats();
        return solveGrid(grid);
    }
    
    function resetPerfStats() {
        perfStats = {
            contradictionSearches: 0,
            contradictionSearchesPassed: 0,
            solveGridRecursiveCalls: 0,
            contradictionSearchReachedIdenticalRowColComparison: 0,
            easyCasesFilled: 0,
            solveEasyCasesForRowAndCol: 0,
        };
    }
    
    function printPerfStats() {
        console.info(perfStats);
    }
    
    function solveGrid(grid) {
        if(gridHasContradiction(grid)) {
            return [];
        }
        
        solveEasyCasesForWholeGrid(grid);
    
        return solveGridRecursive(grid, 0, 0);
    }
    
    function solveGridRecursive(grid, dirtyX, dirtyY) {
        perfStats.solveGridRecursiveCalls += 1;
        
        if(gridHasContradictionWithDirtyRowCol(grid, dirtyX, dirtyY)) {
            return [];
        }
        
        if(solveEasyCasesForRowAndColumn(grid, dirtyX, dirtyY))
        {
            // Setting easy row or column values found a contradiction
            return [];
        }
        
        var cellToSet = getFirstGap(grid);
        if(cellToSet === null) {
            return [grid.shallowClone()];
        }
        
        var solutions = [];
        
        for(var val = 0; val <= 1; ++val) {
            var gridWithValue = grid.shallowClone();
            gridWithValue.set(cellToSet.x, cellToSet.y, val);
            
            var solutionsWithValue = solveGridRecursive(gridWithValue, cellToSet.x, cellToSet.y);
            solutions.push.apply(solutions, solutionsWithValue);
        }
        
        return solutions;
    }
    
    function solveEasyCasesForWholeGrid(grid) {
        for(var y = 0; y < grid.height; ++y) {
            solveEasyCasesForRow(grid, y);
        }
        
        for(var x = 0; x < grid.width; ++x) {
            solveEasyCasesForColumn(grid, x);
        }
    }
    
    // Returns true if setting one of the cases caused a contradiction in the grid.
    function solveEasyCasesForRowAndColumn(grid, x, y) {
        perfStats.solveEasyCasesForRowAndCol += 1;
        return solveEasyCasesForRow(grid, y) || solveEasyCasesForColumn(grid, x);
    }
    
    // Returns true if setting one of the cases caused a contradiction in the grid.
    function solveEasyCasesForRow(grid, y) {
        // Fill --0-0-- cases in row
        for(var x = 1; x < grid.width - 1; ++x) {
            var leftValue = grid.get(x - 1, y);
            var rightValue = grid.get(x + 1, y);
            if(leftValue !== emptyCellValue && leftValue === rightValue) {
                if(setFoundEasyValueIfNotFilled(grid, x, y, 1 - leftValue)) {
                    return true;
                }
            }
        }
        
        // Fill --00-- cases in row
        var prevValue = invalidCellValue;
        for(var x = 0; x < grid.width; ++x) {
            var currValue = grid.get(x, y);
            if(currValue === prevValue && currValue !== emptyCellValue) {
                if(x - 2 >= 0) {
                    if(setFoundEasyValueIfNotFilled(grid, x - 2, y, 1 - currValue)) {
                        return true;
                    }
                }
                
                if(x + 1 < grid.width) {
                    if(setFoundEasyValueIfNotFilled(grid, x + 1, y, 1 - currValue)) {
                        return true;
                    }
                }
            }
            
            prevValue = currValue;
        }
        
        return false;
    }
    
    // Returns true if setting one of the cases caused a contradiction in the grid.
    function solveEasyCasesForColumn(grid, x) {
        // Fill | cases in column
        //      |
        //      0
        //      |
        //      0
        //      |
        //      |
        for(var y = 1; y < grid.height - 1; ++y) {
            var aboveValue = grid.get(x, y - 1);
            var belowValue = grid.get(x, y + 1);
            if(aboveValue !== emptyCellValue && aboveValue === belowValue) {
                if(setFoundEasyValueIfNotFilled(grid, x, y, 1 - aboveValue)) {
                    return true;
                }
            }
        }
        
        // Fill | cases in column
        //      |
        //      0
        //      0
        //      |
        //      |
        var prevValue = invalidCellValue;
        for(var y = 0; y < grid.height; ++y) {
            var currValue = grid.get(x, y);
            if(currValue === prevValue && currValue !== emptyCellValue) {
                if(y - 2 >= 0) {
                    if(setFoundEasyValueIfNotFilled(grid, x, y - 2, 1 - currValue)) {
                        return true;
                    }
                }
                
                if(y + 1 < grid.height) {
                    if(setFoundEasyValueIfNotFilled(grid, x, y + 1, 1 - currValue)) {
                        return true;
                    }
                }
            }
            
            prevValue = currValue;
        }
        
        return false;
    }
    
    function setFoundEasyValueIfNotFilled(grid, x, y, value) {
        if(grid.get(x, y) !== emptyCellValue) {
            return;
        }
        grid.set(x, y, value);
        perfStats.easyCasesFilled += 1;
        
        if(gridHasContradictionWithDirtyRowCol(grid, x, y)) {
            return true;
        }
        
        return solveEasyCasesForRowAndColumn(grid, x, y);
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
        
        if(anyRowIdenticalToThis(grid, y)) {
            return true;
        }

        if(anyColumnIdenticalToThis(grid, x)) {
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
        
        if(anyTwoIdenticalRows(grid)) {
            return true;
        }
        if(anyTwoIdenticalColumns(grid)) {
            return true;
        }

        perfStats.contradictionSearchesPassed += 1;
        
        return false;
    }
    
    function tooManyOfValueTotalInAnyRow(grid) {
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
    function anyTwoIdenticalRows(grid) {
        for(var y1 = 0; y1 < grid.height; ++y1) {
            for(var y2 = y1 + 1; y2 < grid.height; ++y2) {
                if(twoRowsIdentical(grid, y1, y2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    function anyRowIdenticalToThis(grid, y) {
        if(grid.rowFills[y] !== grid.width) {
            // Rows that aren't full can't be identical to other rows.
            return false;
        }
        
        for(var yOther = 0; yOther < grid.height; ++yOther) {
            if(yOther === y) {
                continue;
            }
            if(grid.rowFills[yOther] !== grid.width) {
                // Rows that aren't full can't be identical to other rows.
                continue;
            }
            if(twoRowsIdentical(grid, y, yOther)) {
                return true;
            }
        }
        
        return false;
    }
    function twoRowsIdentical(grid, y1, y2) {
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
        
        return rowsIdentical;
    }
    function anyTwoIdenticalColumns(grid) {
        for(var x1 = 0; x1 < grid.width; ++x1) {
            for(var x2 = x1 + 1; x2 < grid.width; ++x2) {
                if(twoColumnsIdentical(grid, x1, x2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    function anyColumnIdenticalToThis(grid, x) {
        if(grid.colFills[x] !== grid.height) {
            // Columns that aren't full can't be identical to other columns.
            return false;
        }
    
        for(var xOther = 0; xOther < grid.width; ++xOther) {
            if(xOther === x) {
                continue;
            }
            if(grid.colFills[xOther] !== grid.height) {
                // Columns that aren't full can't be identical to other columns.
                continue;
            }
            if(twoColumnsIdentical(grid, x, xOther)) {
                return true;
            }
        }
        
        return false;
    }
    
    function twoColumnsIdentical(grid, x1, x2) {
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
        
        return colsIdentical;
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
    
    function renderGridToElement(grid) {
        var outHtml = "<pre>";
        
        for(var y = 0; y < grid.height; ++y) {
            for(var x = 0; x < grid.width; ++x) {
                var cellValue = grid.get(x, y);
                outHtml += cellValue === emptyCellValue ? "-" : cellValue;
            }
            outHtml += " - " + grid.rowFills[y];
            outHtml += "<br />";
        }
        outHtml += "<br />";
        outHtml += "Col fills: ";
        for(var x = 0; x < grid.width; ++x) {
            outHtml += "" + grid.colFills[x] + ",";
        }
        
        outHtml += "<br />";
        outHtml += "numCellsFilled: " + grid.numCellsFilled;
        
        outHtml += "</pre>";
        
        return $(outHtml);
    }
    
    main();
});