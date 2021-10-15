const fs = require('fs');
const $ = require("jquery");
// const dialog = require("electron").remote.dialog;

// databases of all the sheets
let sheetsDB = [];
let collectedGraphComponent = [];
let graphComponentMatrix = [];
// it is currentDB
let db;
let lsc;

$("document").ready(function(){

    // A click element is attached on element with cell classes
    $(".cell").on("click" , function(){
        console.log(this);

        let rowId = Number($(this).attr("rid"));
        let colId = Number($(this).attr("cid"));
        let cellAddress = String.fromCharCode(65+colId) + (rowId+1);
        // console.log("rowId " , rowId);
        // console.log("colId " , colId);
        // console.log(cellAddress);
        $("#address").val(cellAddress);
        let cellObject = db[rowId][colId];
        $("#formula").val(cellObject.formula);
    })

    $(".cell").on("blur" , function(){
        lsc = this;
        console.log("blur event fired !!");
        let value = $(this).text();
        let rowId = Number($(this).attr("rid"));
        let colId = Number($(this).attr("cid"));
        let cellObject = db[rowId][colId];
        if(cellObject.value != value){
            cellObject.value = value;
            if(cellObject.formula){
                removeFormula(cellObject);
                $("#formula").val("");
            }
            updateChildrens(cellObject);
            console.log(cellObject);
            console.log(db);
        }
        
    })

    function getCellObject(element){
        let rowId = Number($(element).attr("rid"));
        let colId = Number($(element).attr("cid"));
        let cellObject = db[rowId][colId];
        return cellObject;
    }

    $("#bold").on("click", function(){
        // lsc => bold => Simple
        // !bold => bold
        let cellObject = getCellObject(lsc);
        $(lsc).css("font-weight" , cellObject.bold ? "normal" : "bold");
        cellObject.bold = !cellObject.bold;
    })

    $("#underline").on("click", function(){
        // lsc => underline => Simple
        // !underline => underline
        let cellObject = getCellObject(lsc);
        $(lsc).css("text-decoration" , cellObject.underline ? "none" : "underline");
        cellObject.underline = !cellObject.underline;
    })

    $("#italic").on("click", function(){
        // lsc => italic => Simple
        // !italic => italic
        let cellObject = getCellObject(lsc);
        $(lsc).css("font-style" , cellObject.italic ? "normal" : "italic");
        cellObject.italic = !cellObject.italic;
    })

    $("#font-size").on("change" , function(){
        let fontSize =  $(this).val();
        console.log(fontSize);
        $(lsc).css("font-size" , fontSize+"px");
        let cellObject = getCellObject(lsc);
        cellObject.fontSize = fontSize+"px";
    
    })

    $("#font-select").on("change", function(){
        let cellObject = getCellObject(lsc);
        let font = $(this).val();
        console.log(font);
        $(lsc).css("font-family" , font);
        cellObject.font = font + "";
    })
    
    
    $("#left").on("click" , function(){
        let cellObject = getCellObject(lsc);
        $(lsc).css("text-align" , "left");
        cellObject.textAlign.left = !cellObject.textAlign.left;
    })

    $("#centre").on("click" , function(){
        let cellObject = getCellObject(lsc);
        $(lsc).css("text-align" , "center");
        cellObject.textAlign.center = !cellObject.textAlign.center;
    })

    $("#right").on("click" , function(){
        let cellObject = getCellObject(lsc);
        $(lsc).css("text-align" , "right");
        cellObject.textAlign.right = !cellObject.textAlign.right;
    })

    $("#cell-font").on("change", function(){
        let cellObject = getCellObject(lsc);
        let color =  $(this).val();
        console.log(color);
        cellObject.fontColour = color + "";
        $(lsc).css('color', color);
    })

    $("#cell-background").on("change", function(){
        let cellObject = getCellObject(lsc);
        let color =  $(this).val();
        console.log(color);
        cellObject.fontBackground = color + "";
        $(lsc).css('background', color);
    })


    $(".add-sheet").on("click", function () {
        // active-sheet change
        // find div with active sheet=> remove active sheet => add active sheet
        $(".sheet-list .sheet.active-sheet").removeClass("active-sheet");
        // html append in sheet-list
        let sheet = `<div class="sheet active-sheet" sid ="${sheetsDB.length}">Sheet ${sheetsDB.length + 1}</div>`;
        $(".sheet-list").append(sheet);
    
        $(".sheet.active-sheet").on("click", function () {
          console.log(this);
          let hasClass = $(this).hasClass("active-sheet");
          console.log(hasClass);
          if (!hasClass) {
            $(".sheet.active-sheet").removeClass("active-sheet");
            $(this).addClass("active-sheet");
            let sid = Number($(this).attr("sid"));
            db = sheetsDB[sid];
            graphComponentMatrix = collectedGraphComponent[sid];
            for (let i = 0; i < 100; i++) {
              for (let j = 0; j < 26; j++) {
                let cellObject = db[i][j];
                $(`.cell[rid=${i}][cid=${j}]`).text(cellObject.value);
              }
            }
          }
        });
        // new db banjae
        // db = newdb
        // sheetsDB push new db
        init();
        // ui new hojae
        $("#address").val("");
        for (let i = 0; i < 100; i++) {
          for (let j = 0; j < 26; j++) {
            console.log("inside loop");
            $(`.cell[rid=${i}][cid=${j}]`).html("");
          }
        }
      });

    $(".sheet").on("click", function () {
        console.log(this);
        let hasClass = $(this).hasClass("active-sheet");
        console.log(hasClass);
        if (!hasClass) {
          $(".sheet.active-sheet").removeClass("active-sheet");
          $(this).addClass("active-sheet");
          let sid = Number($(this).attr("sid"));
          db = sheetsDB[sid];
          graphComponentMatrix = collectedGraphComponent[sid];
          for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 26; j++) {
              let cellObject = db[i][j];
              $(`.cell[rid=${i}][cid=${j}]`).text(cellObject.value);
            }
          }
        }
      });

    $(".content").on("scroll", function(){
        let left = $(this).scrollLeft();
        let top = $(this).scrollTop(); 

        $(".top-row").css("top", top+"px");
        $(".top-left-cell").css("top", top+"px");

        $(".top-left-cell").css("left", left+"px");
        $(".left-col").css("left", left+"px");

    })

    $(".cell").on("keyup", function(){
        let height = $(this).height();
        let rowId = $(this).attr("rid");
        $(`.left-col-cell[cellId = ${rowId}]`).height(height);
    })

    $(".file").on("click", function(){
        $(".home-menu-options").removeClass("active");
        $(".file-menu-options").addClass("active");
        $(".home").removeClass("active-menu");
        $(".file").addClass("active-menu");
    })

    $(".home").on("click", function(){
        $(".file-menu-options").removeClass("active");
        $(".home-menu-options").addClass("active");
        $(".file").removeClass("active-menu");
        $(".home").addClass("active-menu");
    })

    $(".new").on("click", function(){
        db = []; // initialize database with empty array
        for (let i = 0; i < 100; i++) {
          let row = []; // this represents a single row
          for (let j = 0; j < 26; j++) {
            // i ? , j ?
            let cellAddress = String.fromCharCode(65 + j) + (i + 1);
            let cellObject = {
                name : cellAddress,
                value : "",
                formula : "",
                parents: [],
                childrens : [],
                bold :false,
                italic: false,
                underline:false,
                textAlign : {left : true , center : false , right : false},
                fontSize : "16px",
                fontColour: "#000000",
                fontBackground: "#FFFFFF",
                font: "Times New Roman"
            };
            // cellObject is pushed 26 time
            row.push(cellObject);
            $(`.cell[rid=${i}][cid=${j}]`).html("");
          }
          // finally row is pushed in db
          db.push(row);
        }
    })

    $(".open").on("click", function(){

        let files = dialog.showOpenDialogSync();
        let filePath = files[0];
        let data = fs.readFileSync(filePath);
        db = JSON.parse(data);

        for(let i=0 ; i<100 ; i++){
            for(let j=0 ; j<26 ; j++){
              let cellObject = db[i][j];
              // {
              //   name:"A1",
              //   value:"10"
              // }
              $(`.cell[rid=${i}][cid=${j}]`).text(cellObject.value);
            }
        }

    })

    $(".save").on("click", function(){
        let filePath = dialog.showSaveDialogSync();
        let data = JSON.stringify(db);
        fs.writeFileSync(filePath , data);
        alert("File Saved !!!");
    })


    $("#formula").on("blur", function(){

        let formula = $(this).val();
        // console.log(formula);
        
        // Db Update
        let address = $("#address").val();
        let {rowId, colId} = getRowIdAndColID(address);
        let cellObject = db[rowId][colId];
        if(cellObject.formula != formula){
            removeFormula(cellObject);
            addChildToGraphComponent(formula, address);
            // Check formula is cyclic or not, then only evaluate
            // True -> cycle, False -> Not cyclic
            // console.log(graphComponentMatrix);
            let isCyclic = isGraphCylic(graphComponentMatrix);
            if (isCyclic === true) {
                alert("Your formula is cyclic");
                removeChildFromGraphComponent(formula, address);
                return;
            }
            let value = solveFormula(formula, cellObject);
            cellObject.value = value;
            cellObject.formula = formula;
            updateChildrens(cellObject);
             // UI update
            $(lsc).text(value);
        }

    })


    function addChildToGraphComponent(formula, childAddress) {
        let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
        let encodedFormula = formula.split(" ");
        for (let i = 0; i < encodedFormula.length; i++) {
            let asciiValue = encodedFormula[i].charCodeAt(0);
            if (asciiValue >= 65 && asciiValue <= 90) {
                let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
                // B1: A1 + 10
                // rid -> i, cid -> j
                graphComponentMatrix[prid][pcid].push([crid, ccid]);
            }
        }
    }

    function removeChildFromGraphComponent(formula, childAddress) {
        let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
        let encodedFormula = formula.split(" ");
    
        for (let i = 0; i < encodedFormula.length; i++) {
            let asciiValue = encodedFormula[i].charCodeAt(0);
            if (asciiValue >= 65 && asciiValue <= 90) {
                let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
                graphComponentMatrix[prid][pcid].pop();
            }
        }
    }

    function decodeRIDCIDFromAddress(address) {
        // address -> "A1"
        let rid = Number(address.slice(1) - 1); // "1" -> 0
        let cid = Number(address.charCodeAt(0)) - 65; // "A" -> 65
        return [rid, cid];
    }


    function solveFormula(formula, cellObject){
        // formula = ( A1 + A2 )
        let fComponents = formula.split(" ");
        // ["(" , "A1", "+", "A2, ")]
        for(let i=0;i<fComponents.length;i++){
            let fComp = fComponents[i];
            // fcomp = A1;
            let cellname = fComp[0];
            if(cellname >= 'A' && cellname <= 'Z'){
                // comp = A1
                // A1 -> rowId and ColId
                let {rowId, colId} = getRowIdAndColID(fComp);
                let parentscellObject = db[rowId][colId];
                if(cellObject){
                    // Add self to to childrens of parent object
                    addSelfToParentsChildrens(cellObject, parentscellObject);
                    // update parents of self cellobject
                    updateParentsOfSelfCellObject(cellObject, fComp);
                }
                
                // {
                //     name: "A1",
                //     value: "10",
                //     formula : ""
                // }
                let value = parentscellObject.value + "";
                formula = formula.replace(fComp, value);
            }
        }

        let value = eval(formula);
        return value;
    }

    function updateChildrens(cellObject){

        for(let i=0;i<cellObject.childrens.length;i++){

            let child = cellObject.childrens[i];
            let {rowId, colId} = getRowIdAndColID(child);
            let childrenCellObject = db[rowId][colId];

            let value = solveFormula(childrenCellObject.formula);
            // update Db
            childrenCellObject.value = value + "";
            // Update UI
            $(`.cell[rid=${rowId}][cid=${colId}]`).text(value);
            updateChildrens(childrenCellObject);
        }

    }

    function removeFormula(cellObject){
        cellObject.formula = "";
        for(let i=0;i<cellObject.parents.length;i++){
            let parentName = cellObject.parents[i];
            let {rowId, colId} = getRowIdAndColID(parentName);
            let parentscellObject = db[rowId][colId];
            let filteredChildrens = parentscellObject.childrens.filter(function(child){
                return child != cellObject.name;
            });
            parentscellObject.childrens = filteredChildrens;
        }
        cellObject.parents = [];
    }

    // utility function

    function addSelfToParentsChildrens(cellObject, parentscellObject){
        // B1 will add himself to children of A! and A2
        parentscellObject.childrens.push(cellObject.name);
    }

    function updateParentsOfSelfCellObject(cellObject, fComp){
        cellObject.parents.push(fComp);
    }

    function getRowIdAndColID(address){
        // address = "A1", "B2", "D5";
        let colId = address.charCodeAt(0) - 65;
        let rowId = Number(address.substring(1))-1;
        return {rowId : rowId,
                colId : colId}

    }

    function isGraphCylic(graphComponentMatrix) {
        // Dependency -> visited, dfsVisited (2D array)
        let visited = []; // Node visit trace
        let dfsVisited = []; // Stack visit trace
    
        for (let i = 0; i < 100; i++) {
            let visitedRow = [];
            let dfsVisitedRow = [];
            for (let j = 0; j < 26; j++) {
                visitedRow.push(false);
                dfsVisitedRow.push(false);
            }
            visited.push(visitedRow);
            dfsVisited.push(dfsVisitedRow);
        }
    
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 26; j++) {
                if (visited[i][j] === false) {
                    let response = dfsCycleDetection(graphComponentMatrix, i, j, visited, dfsVisited);
                    // Found cycle so return immediately, no need to explore more path
                    if (response == true) return true;
                }
            }
        }
    
        return false;
    }
    
    // Start -> vis(TRUE) dfsVis(TRUE)
    // End -> dfsVis(FALSE)
    // If vis[i][j] -> already explored path, so go back no use to explore again
    // Cycle detection condition -> if (vis[i][j] == true && dfsVis[i][j] == true) -> cycle
    // Return -> True/False
    // True -> cyclic, False -> Not cyclic
    function dfsCycleDetection(graphComponentMatrix, srcr, srcc, visited, dfsVisited) {
        visited[srcr][srcc] = true;
        dfsVisited[srcr][srcc] = true;
    
        // A1 -> [ [0, 1], [1, 0], [5, 10], .....  ]
        for (let children = 0; children < graphComponentMatrix[srcr][srcc].length; children++) {
            let [nbrr, nbrc] = graphComponentMatrix[srcr][srcc][children];
            if (visited[nbrr][nbrc] === false) {
                let response = dfsCycleDetection(graphComponentMatrix, nbrr, nbrc, visited, dfsVisited);
                if (response === true) return true; // Found cycle so return immediately, no need to explore more path
            }
            else if (visited[nbrr][nbrc] === true && dfsVisited[nbrr][nbrc] === true) {
                // Found cycle so return immediately, no need to explore more path
                return true;
            }
        }
    
        dfsVisited[srcr][srcc] = false;
        return false;
    }
    
    function init(){
        // db = 26 * 100
        let newdb = [];  // initialize database with empty array
        let graphComponent = [];
        for(let i=0 ; i<100 ; i++){
            let row = []; // this represents a single row
            let graphRow = [];
            for(let j=0 ; j<26 ; j++){
                // i ? , j ?
                let cellAddress = String.fromCharCode(65+j) + (i+1);
                let cellObject = {
                    name : cellAddress,
                    value : "",
                    formula : "",
                    parents: [],
                    childrens : [],
                    bold :false,
                    italic: false,
                    underline:false,
                    textAlign : {left : true , center : false , right : false},
                    fontSize : "16px",
                    fontColour: "#000000",
                    fontBackground: "#FFFFFF",
                    font: "Times New Roman"
                }
                // cellObject is pushed 26 time
                row.push(cellObject);
                graphRow.push([]);
            }
            // finally row is pushed in db
            newdb.push(row);
            graphComponent.push(graphRow);
        }
        db = newdb;
        graphComponentMatrix = graphComponent;
        sheetsDB.push(db);
        collectedGraphComponent.push(graphComponentMatrix);
        console.log(sheetsDB);
    }
    init();


})

