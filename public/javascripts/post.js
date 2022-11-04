const postsubmithidden = document.querySelector(".tb");
const postsubmit = document.querySelector(".sb");
const fileinput = document.querySelector(".fileinput");
const postpara = document.querySelector(".postpara");

postsubmit.addEventListener("click",function(e){
  e.preventDefault();
  if(!fileinput.value){
    fileinput.style.border = "1px solid red";
    postpara.hidden = false;
  }
  else{
    postsubmithidden.click();
  }
})