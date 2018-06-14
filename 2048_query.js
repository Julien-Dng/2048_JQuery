 $.fn.removeClassStartingWith = function (filter) {
    $(this).removeClass(function (index, className) {
        return (className.match(new RegExp("\\S*" + filter + "\\S*", 'g')) || []).join(' ')
    });
    return this;
};


jQuery.fn.extend({
    startGame: function (options) {
        let self = this;
        let gridArray = null;
        let $gridContainer = null;
        let $tileContainer = null;
        let score = 0;


        let prepareGrid = function () {
            self.addClass("mm-main-container");

            // Les containers
            $gridContainer = $("<div></div>");
            $gridContainer.addClass("mm-grid-container")
            $tileContainer = $("<div></div>");
            $tileContainer.addClass("mm-tile-container")
            $gridContainer.appendTo(self);
            $tileContainer.appendTo(self);

            // grilles
            for(let i = 0; i < 16; i++) {
                let $grid = $("<div></div>");
                $grid.addClass("grid")
                $grid.appendTo($gridContainer);
            }
        };

        let initialize = function () {
            // TODO: reset les tiles
            gridArray = new Array();
            for (let i = 0; i < 4; i++) {
                gridArray.push(new Array());
                for (let j = 0; j < 4; j++) {
                    gridArray[i].push({
                        'value': null,
                        'tile': null, // Jquery object du tile
                        'classPosition': 'tile-position-' + i + '-' + j,
                        'tileMerge': null,
                    });
                }
            }

        };

        let startGame = function () {
            // random tile
            addNewTile();
            addBindingArrow();
        };

        let addNewTile = function (val = 2, line = null, col = null) {
            let new_tile = null;
            if(line === null || col === null) {
                new_tile = getNewTile();
            } else {
                new_tile = gridArray[line][col];
            }
                // on supprime le precedent new
            gridArray.forEach(element => {
                if(element.tile) {
                    element.tile.removeClass("tile-new");
                }
            });
            let $newDiv = $("<div></div>");
            $newDiv
                .addClass("tile")
                .addClass("tile-new")
                .addClass("tile-" + val)
                .addClass(new_tile.classPosition)
                .text(val);
            $tileContainer.append($newDiv);
            new_tile.value = val;
            new_tile.tile = $newDiv;
        }

        let getNewTile = function () {
            let nullArray = [];
            for(let i = 0; i < gridArray.length; i++ ) {
                for (let j= 0; j< gridArray[i].length; j++) {
                    if (gridArray[i][j].value === null) {
                        nullArray.push(gridArray[i][j]);
                    }
                }
            }

            if(nullArray.length > 0) {
                let newIndexElement = Math.floor(Math.random() * nullArray.length);

                return nullArray[newIndexElement];
            } else {
                return false;
            }
        }

        let addBindingArrow = function() {
            $("body").on("keydown", function(e) {
                e.preventDefault();
                if(e.keyCode === 37 ||
                    e.keyCode === 38 ||
                    e.keyCode === 39 ||
                    e.keyCode === 40
                ) {
                    removeBindingArrow();
                    let allow = null;
                    $(".tile-merged").remove();
                    switch (e.keyCode) {
                        case 37: // Left
                            allow = moveTiles("left");
                            break;
                        case 38: // Up
                            allow = moveTiles("up");
                            break;
                        case 39: // Right
                            allow = moveTiles("right");
                            break;
                        case 40:
                            allow = moveTiles("down");
                            break;
                        default:
                            allow = false;
                    }
                    if (allow) {
                        refreshGrid();
                        addNewTile();
                    }
                    if(checkLoose() == true) {
                        createLoserModal();
                    } else {
                        addBindingArrow();
                    }
                }

            });
        }

        let checkLoose = function(){
            let nullArray = [];
            for(let i = 0; i < gridArray.length; i++ ) {//              Check if there's a place for a newTile in gridArray
                for (let j= 0; j< gridArray[i].length; j++) {
                    if (gridArray[i][j].value === null) {
                        nullArray.push(gridArray[i][j]);
                    }
                }
            }

            let prevValue = null;
            if(nullArray.length < 1) {//                If no more place, Check if there's any move possible by values
                for(let i = 0; i < gridArray.length; i++ ) {
                    prevValue = null;
                    for (let j= 0; j< gridArray[i].length; j++) {
                        if (prevValue != null && gridArray[i][j].value === prevValue){//        Check horizontal values
                            return false;//                                            A move is founded, it's not lost
                        } else {
                            prevValue = gridArray[i][j].value;
                        }
                    }
                    prevValue = null;
                    for (let j= 0; j< gridArray[i].length; j++) {
                        if(prevValue != null && gridArray[j][i].value === prevValue) {//        Check vertical values
                            return false;//                                          A move is founded, it's not lost
                        } else {
                            prevValue = gridArray[j][i].value;
                        }
                    }
                }//                                                                     If no move founded, it's lost
                return true;
            } else {//                                      Else there's still place to put a new tile, it's not lost
                return false;
            }
        }

        let removeBindingArrow = function () {
            $("body").off("keydown");
        }

        let moveTiles = function(direction){
            // si allow = false a la fin, on ne place pas de nouveau
            let allow = false;

            switch(direction){
                case"left":
                    for (let i = 0; i < 4; i++) {
                        let tmpTile = null;
                        for (let j = 0; j < 4; j++) {
                            if(gridArray[i][j].value != null){
                                if(tmpTile != null && tmpTile.value == gridArray[i][j].value){
                                    merged(tmpTile, gridArray[i][j]);
                                    allow = true;
                                    tmpTile = null;
                                } else {
                                    tmpTile = gridArray[i][j];
                                }
                            }
                        }
                    }

                    for (let i = 0; i < 4; i++) {
                        let freeTile = null;
                        for (let j = 0; j < 4; j++) {
                            if (gridArray[i][j].value === null) {
                                if (freeTile === null) {
                                    // freeTile = [i, j];
                                    freeTile = gridArray[i][j];
                                }
                            } else {
                                if (freeTile !== null) {
                                    shift(freeTile, gridArray[i][j]);
                                    allow = true;
                                    freeTile = null;
                                    j = -1;
                                }
                            }
                        }
                    }
                    break;
                case"up":
                    for (let j = 0; j < 4; j++) {
                        let tmpTile = null;
                        for (let i = 0; i < 4; i++) {
                            if(gridArray[i][j].value != null){
                                if(tmpTile != null && tmpTile.value == gridArray[i][j].value){
                                    merged(tmpTile, gridArray[i][j]);
                                    allow = true;
                                    tmpTile = null;
                                } else {
                                    tmpTile = gridArray[i][j];
                                }
                            }
                        }
                    }

                    for (let j = 0; j < 4; j++) {
                        let freeTile = null;
                        for (let i = 0; i < 4; i++) {
                            if (gridArray[i][j].value === null) {
                                if (freeTile === null) {
                                    // freeTile = [i, j];
                                    freeTile = gridArray[i][j];
                                }
                            } else {
                                if (freeTile !== null) {
                                    shift(freeTile, gridArray[i][j]);
                                    allow = true;
                                    freeTile = null;
                                    i = -1;
                                }
                            }
                        }
                    }
                    break;
                case"right":
                    for (let i = 0; i < 4; i++) {
                        let tmpTile = null;
                        for (let j = 3; j >= 0; j--) {
                            if(gridArray[i][j].value != null){
                                if(tmpTile != null && tmpTile.value == gridArray[i][j].value){
                                    merged(tmpTile, gridArray[i][j]);
                                    allow = true;
                                    tmpTile = null;
                                } else {
                                    tmpTile = gridArray[i][j];
                                }
                            }
                        }
                    }

                    for (let i = 0; i < 4; i++) {
                        let freeTile = null;
                        for (let j = 3; j >= 0; j--) {
                            if (gridArray[i][j].value === null) {
                                if (freeTile === null) {
                                    // freeTile = [i, j];
                                    freeTile = gridArray[i][j];
                                }
                            } else {
                                if (freeTile !== null) {
                                    shift(freeTile, gridArray[i][j]);
                                    allow = true;
                                    freeTile = null;
                                    j = 4;
                                }
                            }
                        }
                    }
                    break;
                case"down":
                    for (let j = 0; j < 4; j++) {
                        let tmpTile = null;
                        for (let i = 3; i >= 0; i--) {
                            if(gridArray[i][j].value != null){
                                if(tmpTile != null && tmpTile.value == gridArray[i][j].value){
                                    merged(tmpTile, gridArray[i][j]);
                                    allow = true;
                                    tmpTile = null;
                                } else {
                                    tmpTile = gridArray[i][j];
                                }
                            }
                        }
                    }

                    for (let j = 0; j < 4; j++) {
                        let freeTile = null;
                        for (let i = 3; i >= 0; i--) {
                            if (gridArray[i][j].value === null) {
                                if (freeTile === null) {
                                    // freeTile = [i, j];
                                    freeTile = gridArray[i][j];
                                }
                            } else {
                                if (freeTile !== null) {
                                    shift(freeTile, gridArray[i][j]);
                                    allow = true;
                                    freeTile = null;
                                    i = 4;
                                }
                            }
                        }
                    }
                    break;
            }
            $scoreDiv.text("Score : " + score);
            return allow;
        }

        let merged = function(element1, element2) {
            element1.value *= 2;
            score += element1.value;
            element1.tileMerge = element2.tile;
            // element1.previousMergedClassPosition = element2.classPosition;
            element2.tile = null;
            element2.value = null;
            element1 = null;
        }

        // element1 est le nouvel emplacement,
        // il faut prendre en compte les cases qui ont aussi un merge
        let shift = function(element1, element2) {
            element1.value = element2.value;
            element2.value = null;
            element1.tile = element2.tile;
            element2.tile = null;
            if(element2.tileMerge !== null) {
                element1.tileMerge = element2.tileMerge;
                element2.tileMerge = null;
            }
        }

        let refreshGrid = function(){
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let element = gridArray[i][j];
                    if(element.tile != null){
                        let tile = element.tile;
                        tile.text(element.value);
                        tile.removeClassStartingWith("tile-")
                        tile.addClass("tile-" + element.value);
                        // tile.removeClassStartingWith("tile-position");
                        tile.addClass(element.classPosition);

                        let tileMerge = element.tileMerge;
                        if (tileMerge !== null) {
                            tileMerge.removeClassStartingWith("tile-")
                            tileMerge
                                .addClass(element.classPosition)
                                .addClass("tile-merged");

                        }
                    }
                }
            }
        }

        let initScore = function () {
            $scoreContainer = $("<div></div>");
            $scoreContainer.addClass("mm-score-container");
            $scoreDiv = $("<div> Score : " + score + "</div>");
            $scoreDiv.appendTo($scoreContainer);
            $scoreDiv.addClass("mm-score-div");
            self.prepend($scoreContainer);
        }

        let restartButton = function (){
            $restartButton = $("<button> Restart ?</button>");
            $restartButton.addClass("mm-restart-button");
            $restartButton.click( function(){
                score = 0;
                $scoreDiv.text("Score : " + score);
                $tileContainer.empty();
                $gridArray = null;
                initialize();
                startGame();
            });
            $restartButton.appendTo($scoreContainer);
        }

        let createLoserModal = function() {
            $loserContainer = $("<div></div>");
            $loserContainer.addClass("mm-loser-modal");
            $loserContent = $("<div><p>LOSER</p></div>");
            $loserContent.appendTo($loserContainer);
            $loserContent.addClass("mm-loser-content");
            self.append($loserContainer);
            $loserContainer.on("click", function(e) {
                e.preventDefault();
                $loserContainer.off("click");
                $loserContainer.remove();
            })
        }

        initScore();
        prepareGrid();
        restartButton();
        initialize();
        startGame();
    }
});
