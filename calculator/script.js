let display = document.getElementById("display");

let result = document.getElementById("result");


function appendValue(value){

    display.value += value;

    showLiveResult();
}


function clearDisplay(){

    display.value = "";

    result.innerText = "";
}


function deleteLast(){

    display.value = display.value.slice(0,-1);

    showLiveResult();
}


function squareRoot(){

    try{

        let value = eval(display.value);

        display.value = Math.sqrt(value);

        result.innerText = "";

    }

    catch{

        display.value = "Error";

        result.innerText = "";
    }

}


function showLiveResult(){

    try{

        let expression = display.value;


        if(expression === ""){

            result.innerText = "";

            return;
        }


        expression = expression.replace(

            /(\d+(\.\d+)?)%/g,

            function(match,num){

                return "(" + num + "/100)";
            }

        );


        result.innerText = eval(expression);

    }

    catch{

        result.innerText = "";
    }

}


function calculate(){

    try{

        let expression = display.value;


        expression = expression.replace(

            /(\d+(\.\d+)?)%/g,

            function(match,num){

                return "(" + num + "/100)";
            }

        );


        display.value = eval(expression);

        result.innerText = "";

    }

    catch{

        display.value = "Error";

        result.innerText = "";
    }

}