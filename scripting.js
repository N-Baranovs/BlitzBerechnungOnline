"use strict";
let hideSettings=false;
let limit; // Skaitļu lieluma ierobežojums
let sign=[]; // Izmantojamās darbības
let timer=undefined; // Laika atskaite
let time; // Laika ierobežojums
let timeLeft=undefined; //Atlikušais laiks
let points=0; // atrisināto piemēru skaits
let nowSign=""; // pašreizējā piemērā izmantojamā darbība
let wrongAnswers=[];
let accept=false; // atbildes pieņemšana
let x, y, ans; // piemēra darbības locekļi un rezultāts
const clock=document.getElementById("countdown");
const mode=document.getElementById("playMode");
const setTime=document.getElementById("time");// ievadītais laiks
const task=document.getElementById("task"); // piemēra lauks
const answer=document.getElementById("answer"); // atbildes lauks
const decimalShift=function (number, places, mantain) {return Math.round(number*10**(places+mantain))/10**mantain};
function insert(event){ // ievada un pārbauda atbildi, ja nospiež Enter
  if (event.key=="Enter"&&accept) {
    check(false);
  }
}
function toggleSettings(){
  let show;
  if (hideSettings==true){
    show="block";
  }else{
    show="none"
  }
  hideSettings=!hideSettings;
  for (let x of document.getElementsByClassName("settings")){
    x.style.display=show;
  }
}
function getLimit(inputField){
  let input=numberize(inputField.value);
  inputField.value=input;
  limit=input;
}
function getTime(inputField){
  let input=numberize(inputField.value);
  inputField.value=input;
  time=1000*input;
}
function numberize(text){// Izdzēš skaitlī kļūdaini ierakstītus ne-ciparus un nulles sākumā
  if (typeof text != "string") {
    text=toString(text);
  } 
  text=text.split("");
  let number=false;
  let nonzero=false
  let result="";
  for (let x of text){
    if (nonzero) {
      if ("0123456789".indexOf(x)!=-1) {
        result+=x;
      }
    } else if (number) {
      if ("123456789".indexOf(x)!=-1) {
        result=x;
        nonzero=true;
      }
    } else {
      if (!x) {
        number=true;
      } else if ("123456789".indexOf(x)!=-1){
        nonzero=true;
        result=x;
      }
    }
  }
  if (!nonzero&&number) {
    return 0;
  } else {
    return result/1;
  }
}
function endAnswer(reason, mode) {
  let text;
  if (mode=="streak"){
    if (points==0){
      text=" Jūs neatrisinājāt pareizi nevienu piemēru."
    }else{
      let printTime=decimalShift(time/2**(points*0.02)/1000,0,2);
      text=` ${x}${nowSign}${y}=${ans}. Jums izdevās atrisināt ${points} piemērus. Beigu laika ierobežojums: ${printTime} sekundes.`;
    }
  } else if (mode=="classic"){
    if (points==0){
      text=" Jūs neatrisinājāt pareizi nevienu piemēru. ";
    }else{
      text=` Jūs atrisinājāt ${points} piemērus, katram vidēji patērējot ${decimalShift(time/points, -3, 2)} sekundes. `;
    }
    if (wrongAnswers.length==0&&points>0){
      text+="Jūs visus piemērus atbildējāt pareizi.";
    }
    if (wrongAnswers.lenght>0){
      if(wrongAnswers.length==1){
        text+="Nepareizā atbilde: ";
      } else {
       text+="Nepareizās atbildes: ";
      }
      for (let example of wrongAnswers) {
        text+=`${example[0]}${example[1]}${example[2]}=${example[3]}, nevis ${example[4]}; `;
      }
      text=text.slice(0, -2)+'.';
      }
  }else{
    alert("Kaut kas nogāja greizi.");
  }
  switch (reason){
    case "timeout":
      text="Laiks beidzies."+text;
      return text;
    case "wrongAnswer":
      text="Nepareizi."+text;
      return text;
    default:
      alert("Kaut kas nogāja greizi.")
  }
  return text
}
function theEnd(reason, mode){
  clearTimeout(timer);
  timeLeft=0;
  task.innerHTML=`${endAnswer(reason, mode)}`
  accept=false;
  timer=undefined;
  wrongAnswers=[];
  points=0;
}
function check(outOfTime){
  if (outOfTime){
    theEnd("timeout",mode.value);
    return;
  }
  answer.value=numberize(answer.value);
  let playType=mode.value;
  switch (playType) {
    case "streak":// Ja atbilde nav iesniegta laikā vai nav pareiza, spēles beigas, citādi tiek dots jauns piemērs
      if(answer.value==String(ans)) {
        points++;
        answer.value="";
        game();
        return;
      } else {
        theEnd("wrongAnswer","streak")
      }
      break;
    case "classic"://Ja atbilde nav pareiza, tiek noņemts laiks
      if(answer.value==String(ans)) {
        points++;
        game()
      }else {
        wrongAnswers.push([x, nowSign, y, ans, answer.value]);
        timeLeft-=10000;
        if (timeLeft<=0){
          theEnd("timeout", "classic")
          return;
        }
        accept=false;
        task.innerHTML="Nepareizi.";
        setTimeout(game, 1000)
      }
      answer.value="";
      break;
    default:
      alert("Kaut kas nogāja greizi.");
  }              
}
function countdown(counter) {
  if (!(counter===undefined)){
    timeLeft=counter;
    clearTimeout(timer);
  }
  if (time%100){
    timeLeft-=timeLeft%100;
    timer=setTimeout(countdown, time%100);
  }else if (timeLeft<=0){
    check(true);
    clock.innerHTML="0.00"
    return;
  }else{
    timeLeft-=100;
    timer=setTimeout(countdown, 100)
  }
  clock.innerHTML=`${Math.floor(timeLeft/1000)}.${Math.floor(timeLeft%1000/100)}0`
}
function select(x) { // Ja attiecīgā darbība nav izvēlēta, to izvēlas, citādi izvēli atceļ
  let location=sign.indexOf(x);
  let button=document.getElementById(x)
  if (location==-1) {
    sign.push(x)
    button.style.backgroundColor='#000';
  } else {
    sign.splice(location,1)
    button.style.backgroundColor='#fff';
  }
}
function reset() { // Atgriež piemēra un atbildes laukus sākuma stāvoklī
  task.innerHTML="Novietojiet kursoru blakus, lai sāktu:";
  answer.value="";
  clock.innerHTML="";
}
function game() { // dod jaunu piemēru, uzliek laika limitu
    if (limit==""||limit==undefined) { // Ja lietotājs aizmirsis ievadīt skaitļu vai laika limitu
      task.innerHTML="Izvēlieties nenulles skaitļu ierobežojumu!"
      return;
    } else if (time===""||time===undefined) {
      task.innerHTML="Izvēlieties laika ierobežojumu!";
      return;
    } else if (sign.length==0){
      task.innerHTML="Izvēlieties vismaz vienu darbību!";
      return;
    }
    let playType=mode.value;
    switch (playType) {
      case "streak":
        countdown(time/2**(points*0.02));
        break;
      case "classic":
        if (timer===undefined) {
          countdown(time);
        }
        break;
      default:
        alert("Kaut kas nogāja greizi."); // augšējiem gadījumiem vajag izķert visu
        return;
    }
    nowSign=sign[Math.floor(Math.random()*sign.length)]; // izvēlas kādu darbību, ne tās locekļi, ne rezultāts nepārsniedz limitu
    switch (nowSign) {
      case "+":
        x=Math.floor(Math.random()*limit);
        y=Math.floor(Math.random()*(limit-x));
        ans=x+y;
        break;
      case "-":
        ans=Math.floor(Math.random()*limit);
        y=Math.floor(Math.random()*(limit-ans));
        x=ans+y;
        break;
      case "*":
        x=Math.floor(Math.random()*(limit/2-2)+2); // Nulle un viens reizināšanas un dalīšanas gadījumos tiek izslēgti
        y=Math.floor(Math.random()*(limit/x-2)+2);
        ans=x*y;
        break;
      case "/":
        ans=Math.floor(Math.random()*(limit/2-2))+2;
        y=Math.floor(Math.random()*(limit/ans-2)+2);
        x=y*ans;
        break;
      //case undefined:
        //task.innerHTML="Izvēlieties vismaz vienu darbības veidu!"// Ja nav izvēlēta neviena darbība
        //return;
      default:
        alert("Kaut kas nogāja greizi."); // augšējiem gadījumiem vajag izķert visu
        return;
    }
    task.innerHTML=`${x}${nowSign}${y}=`;
    accept=true;
  }
{ // sākotnējais darbību izvēles pogu baltais formatējums
  let modes=document.getElementsByClassName("mode"); 
  for (let x of modes) {
    x.style.backgroundColor="#fff"
  }
}
