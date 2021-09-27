
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
            console.log(cellObject);
            console.log(db);
        }
        
    })

    $("#formula").on("blur", function(){

        let formula = $(this).val();
        // console.log(formula);
        let value = solveFormula(formula);
        // Db Update
        let address = $("#address").val();
        let {rowId, colId} = getRowIdAndColID(address);
        let cellObject = db[rowId][colId];
        if(cellObject.formula != formula){
            cellObject.value = value;
            cellObject.formula = formula;
        }
        
        // UI update
        $(lsc).text(value);

    })

    function solveFormula(formula){
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
                let cellObject = db[rowId][colId];
                // {
                //     name: "A1",
                //     value: "10",
                //     formula : ""
                // }
                let value = cellObject.value + "";
                formula = formula.replace(fComp, value);
            }
        }

        let value = eval(formula);
        return value;
    }

    // utility function
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
                    formula : ""
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

