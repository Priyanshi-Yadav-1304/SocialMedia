const bordernone = document.querySelectorAll(".bordernone");
const editbtn = document.querySelector(".editbtn");
const savebtn = document.querySelector(".savebtn");
const cancelbtn = document.querySelector(".cancelbtn");
editbtn.addEventListener("click", function(e){
    e.preventDefault();
    bordernone.forEach(function(b){
        b.disabled=false;
        b.style.borderBottom = "2px solid rgb(202, 193, 193)";
        // b.style.color = "rgb(202, 193, 193)";
    })
    savebtn.hidden=false;
    cancelbtn.hidden=false;
    editbtn.hidden=true;
})
// cancelbtn.addEventListener("click",function(e){
//     e.preventDefault();
//     bordernone.forEach(function(b){
//         b.disabled=true;
//         b.style.border="none";
//         // b.style.color = "black";
//     })
//     savebtn.hidden=true;
//     cancelbtn.hidden=true;
//     editbtn.hidden=false;
//     cancelbtn.reload = true;
// })
