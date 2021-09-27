
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
            updateChildrens(cellObject);
            console.log(cellObject);
            console.log(db);
        }
        
    })

    $("#formula").on("blur", function(){

        let formula = $(this).val();
        // console.log(formula);
        
        // Db Update
        let address = $("#address").val();
        let {rowId, colId} = getRowIdAndColID(address);
        let cellObject = db[rowId][colId];
        if(cellObject.formula != formula){
            let value = solveFormula(formula, cellObject);
            cellObject.value = value;
            cellObject.formula = formula;
             // UI update
            $(lsc).text(value);
        }
        
       
        

    })

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
    
    function init(){
        // db = 26 * 100
        db = [];  // initialize database with empty array
        for(let i=0 ; i<100 ; i++){
            let row = []; // this represents a single row
            for(let j=0 ; j<26 ; j++){
                // i ? , j ?
                let cellAddress = String.fromCharCode(65+j) + (i+1);
                let cellObject = {
                    name : cellAddress,
                    value : "",
                    formula : "",
                    parents: [],
                    childrens : []
                }
                // cellObject is pushed 26 time
                row.push(cellObject);
            }
            // finally row is pushed in db
            db.push(row);
        }
        console.log(db);
    }
    init();


})

