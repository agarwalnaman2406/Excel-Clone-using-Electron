

$("document").ready(function(){

    // A click element is attached on element with cell classes
    $(".cell").on("click" , function(){
        console.log(this);

        let rowId = Number($(this).attr("rid"))+1;
        let colId = Number($(this).attr("cid"));
        let cellAddress = String.fromCharCode(65+colId) + rowId;
        console.log("rowId " , rowId);
        console.log("colId " , colId);
        console.log(cellAddress);
        $("#address").val(cellAddress);
    })
})