let canvas=document.getElementById('Canvas');
let histograph=document.getElementById("Histogram");
let ctx=canvas.getContext('2d', { willReadFrequently: true });
let ctxHisto=histograph.getContext('2d', { willReadFrequently: true });
let effectSelector=document.querySelector("#effectOptions");

ctx.imageSmoothingEnabled = false;
let dpi = window.devicePixelRatio;
let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
canvas.setAttribute('height', style_height * dpi);
canvas.setAttribute('width', style_width * dpi);

let culoareStatDropzone=0;
let file;
let foto;
let imagine;
let selectie;
let fotografii=[];
let selectii=[];
let texte=[];
let wx=canvas.clientWidth;
let hx=canvas.clientHeight;
let mousePos1={x:0,y:0};
let mousePos2={x:0,y:0};
let shiftPress=0;
let ctrlPress=0;
let adaugareText=0;
let pozaIncarcata=0;
let selectieActivata=0;
let cropActivat=0;
let butonStangaApasat=0;
let creareSelectie=0;


class Fotografie{
    miscare=0;
    desen={x:0,y:0};
    pozitieCursorInImagine={x:0,y:0};
    scale_factor=1;

    constructor(filename,src,scale){
        this.numeImagine=filename; 
        this.img=new Image();
        this.img.src=src;
        this.img.onload=()=>{
            if(scale!=0){
                let scale_factor = Math.min(canvas.width / this.img.width, canvas.height / this.img.height);
                this.scale=scale_factor;

                let newWidth = this.img.width * scale_factor;
                let newHeight = this.img.height * scale_factor;
                // let xf = (canvas.width / 2) - (newWidth / 2);
                // let yf = (canvas.height / 2) - (newHeight / 2);
                this.w=Math.round(newWidth);
                this.h=Math.round(newHeight);

                if(this.img.width<canvas.width && this.img.height<canvas.height){
                    this.w=this.img.width;
                    this.h=this.img.height;
                }
            }else{
                this.scale=1;
                this.w=this.img.width;
                this.h=this.img.height;
            }
            histoGrama();
        }

    }

    draw(){
        this.w = Math.round(this.img.width * this.scale);
        this.h = Math.round(this.img.height * this.scale);
        ctx.drawImage(this.img, this.desen.x, this.desen.y, this.w, this.h);
    }
    
}

class TextScris{
    fontFamily="Times New Roman";
    dimensiune=12;
    culoare="black";
    desen={x:0,y:0};
    pozitieCursorInImagine={x:0,y:0};
    miscare=0;

    constructor(fontFamily,dimensiune,culoare,coordonateXY,continutText){
        this.fontFamily=fontFamily;
        this.dimensiune=dimensiune;
        this.culoare=culoare;
        this.desen.x=coordonateXY.x;
        this.desen.y=coordonateXY.y;
        this.continutText=continutText;
    }

    draw(){
        ctx.font=this.dimensiune+"px "+this.fontFamily;
        ctx.fillStyle=this.culoare;
        ctx.fillText(this.continutText, this.desen.x,this.desen.y);
    }
}

function dropHandler(event){
    event.preventDefault();
    if(event.dataTransfer.items){
        [...event.dataTransfer.items].forEach((item,i)=>{
            file = item.getAsFile();
            foto=new Fotografie(file.name,URL.createObjectURL(file),1);

            ctx.fillStyle="white";
            ctx.fillRect(0,0,canvas.width,canvas.height);
            let fotoGolire=new Fotografie("golireSelectie",canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoGolire.desen.x=0;
            fotoGolire.desen.y=0;
            fotoGolire.w=wx;
            fotoGolire.h=hx;
            selectii.push(fotoGolire);

            selectii.push(foto);
            
            activareSelectie();
            document.getElementById("dropZone").style.display="none";
            pozaIncarcata=1;
        });
    }
    document.getElementById("dropZone").style.border="0.5vh dashed var(--blueLight)"; 
}
function dragOverHandler(event){
    event.preventDefault();
    document.getElementById("dropZone").style.background="white";
    document.getElementById("dropZone").style.color="var(--grey)";
}
function dragEnterHandler(event){
    event.preventDefault();
    document.getElementById("dropZone").style.border="0.5vh dashed #084C61";
    document.getElementById("dropZone").style.color="var(--white)";
    document.getElementById("dropZone").style.background="var(--grey)";
}
function dragLeaveHandler(event){
    event.preventDefault();
    document.getElementById("dropZone").style.border="0.5vh dashed var(--blueLight)";
    document.getElementById("dropZone").style.color="var(--white)";
    document.getElementById("dropZone").style.background="var(--grey)";
}

function saveImage(){
    let link=document.createElement('a');
    if(pozaIncarcata==1){
        link.download='edit_'+selectii[0].numeImagine;
    }else{
        link.download='edit.png';
    }
    if(selectieActivata==1){
        activareSelectie(); 
    }
    deseneaza();
    link.href=canvas.toDataURL();
    link.click();
    if(foto.img){
        // foto.img.src=URL.revokeObjectURL(file);
        // // foto.draw(1);
        document.getElementById("dropZone").style.display="flex";
        document.getElementById("dropZone").style.border="0.5vh dashed var(--blueLight)";
        document.getElementById("dropZone").style.color="var(--white)";
        document.getElementById("dropZone").style.background="var(--grey)";
        fotografii.pop();
    }
    discardImage();
    histoGrama();
}

function discardImage(){
    if(selectieActivata==1){
        selectii.pop();
        if(selectii.length==0){
            document.getElementById("dropZone").style.display="flex";
            document.getElementById("dropZone").style.border="0.5vh dashed var(--blueLight)";
            document.getElementById("dropZone").style.color="var(--white)";
            document.getElementById("dropZone").style.background="var(--grey)";
            pozaIncarcata=0;
            activareSelectie();
        }   
    }else{
        document.getElementById("dropZone").style.display="flex";
        document.getElementById("dropZone").style.border="0.5vh dashed var(--blueLight)";
        document.getElementById("dropZone").style.color="var(--white)";
        document.getElementById("dropZone").style.background="var(--grey)";
        fotografii=[];
        selectii=[];
        texte=[];
        ctx.clearRect(0,0,canvas.width,canvas.height);
        pozaIncarcata=0;
    }
    ctx.clearRect(0,0,wx,hx);
    histoGrama();
}

function AdaugaText(){
    if(selectieActivata==0){
        adaugareText=!adaugareText;
        if(adaugareText==1){
            document.getElementById("iconText").src="media/edit-text-white.png";
        }else{
            document.getElementById("iconText").src="media/edit-text.png";
            WipeText();
        }
    }else{
        alert("Dezactivati selectia pentru adaugarea de text");
    }
}

function WipeText(){
    document.getElementById("TextDeIntrodus").value="";
}

function activareSelectie(){
    if(adaugareText==0){
        selectieActivata=!selectieActivata;
        if(selectieActivata==1){
            document.getElementById("iconSelection").src="media/selection-white.png";
        }
        else{
            document.getElementById("iconSelection").src="media/selection.png";
        }
    }else{
        alert("Adaugarea de text interzice selectia concomitenta. Dezactivati adaugarea de text ca sa aveti acces la selectie.");
    }
}

function activareCrop(){
    if(selectieActivata==1){
        cropActivat=!cropActivat;
        if(cropActivat==1){
            document.getElementById("iconCrop").src="media/crop-white.png";
        }
        else{
            document.getElementById("iconCrop").src="media/crop.png";
        }
    }else{
        alert("Trebuie sa activati mai intai selectia daca doriti sa folositi Crop.");
    }
}

function Scaling(){
    if(selectieActivata==0){
        let valoare=document.getElementById("valoareScalare").value;
        let scaling=document.querySelector("#scaleOption");
        let scaleType=scaling.options[scaling.selectedIndex].value;
        if(valoare!=hx && valoare!=wx){
            if(scaleType=="Width"){
                valoare=valoare/wx;
            }else{
                valoare=valoare/hx;
            }
            let resizedCanvas = document.createElement("canvas");
            let resizedContext = resizedCanvas.getContext("2d");
    
            resizedCanvas.height = hx;
            resizedCanvas.width = wx;
            resizedContext.drawImage(canvas, 0,0,resizedCanvas.width*valoare, resizedCanvas.height*valoare);
                
            let fotoSelectie=new Fotografie("selectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoSelectie.desen.x=selectii[selectii.length-1].desen.x;
            fotoSelectie.desen.y=selectii[selectii.length-1].desen.y;
            fotoSelectie.w=resizedCanvas.width;
            fotoSelectie.h=resizedCanvas.height;
    
            resizedContext.fillStyle="white";
            resizedContext.fillRect(0,0,resizedCanvas.width,resizedCanvas.height);
    
            let fotoGolire=new Fotografie("golireSelectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoGolire.desen.x=selectii[selectii.length-1].desen.x;
            fotoGolire.desen.y=selectii[selectii.length-1].desen.y;
            fotoGolire.w=resizedCanvas.width;
            fotoGolire.h=resizedCanvas.height;
    
            selectii.push(fotoGolire);
            selectii.push(fotoSelectie);
        }
        document.getElementById("valoareScalare").value=0;
    }else{
        alert("Dezactivati selectia pentru redimensionare.");
    }
}

function deseneaza(){
    ctx.clearRect(0,0,wx,hx);
    for(let i=0;i<selectii.length-1;i++){
        selectii[i].draw();
    }
    if(selectii.length>0){ 
        if(selectii[selectii.length-1].miscare==1){
            procesMiscare=1;
            selectii[selectii.length-1].desen.x=mousePos2.x-selectii[selectii.length-1].pozitieCursorInImagine.x;
            selectii[selectii.length-1].desen.y=mousePos2.y-selectii[selectii.length-1].pozitieCursorInImagine.y;
            for(let i=0;i<texte.length;i++){
                texte[i].desen.x=mousePos2.x-texte[i].pozitieCursorInImagine.x;
                texte[i].desen.y=mousePos2.y-texte[i].pozitieCursorInImagine.y;
            }
        }
        selectii[selectii.length-1].draw();
        let resizedCanvas = document.createElement("canvas");
        let resizedContext = resizedCanvas.getContext("2d");

        resizedCanvas.height = selectii[selectii.length-1].h;
        resizedCanvas.width = selectii[selectii.length-1].w;
        resizedContext.drawImage(canvas, selectii[selectii.length-1].desen.x, selectii[selectii.length-1].desen.y, resizedCanvas.width, resizedCanvas.height,0,0,resizedCanvas.width, resizedCanvas.height);
        if(effectSelector.options[effectSelector.selectedIndex].value!="None" && selectieActivata==1){

            const imgData = resizedContext.getImageData(0, 0,  resizedCanvas.width,  resizedCanvas.height);
            if(effectSelector.options[effectSelector.selectedIndex].value=="Invert"){
                for (let i = 0; i < imgData.data.length; i += 4) {
                    imgData.data[i] = 255-imgData.data[i];
                    imgData.data[i+1] = 255-imgData.data[i+1];
                    imgData.data[i+2] = 255-imgData.data[i+2];
                }
                effectSelector.selectedIndex=0;
            }else{
                if(effectSelector.options[effectSelector.selectedIndex].value=="BnW"){
                    let media;
                    for (let i = 0; i < imgData.data.length; i += 4) {
                        media=(imgData.data[i]+imgData.data[i+1]+imgData.data[i+2])/3;
                        imgData.data[i] = media;
                        imgData.data[i+1] = media;
                        imgData.data[i+2] = media;
                    }
                    effectSelector.selectedIndex=0;
                }else{
                    if(effectSelector.options[effectSelector.selectedIndex].value=="Sepia"){
                        let tr,tg,tb;
                        for (let i = 0; i < imgData.data.length; i += 4) {
                            tr=imgData.data[i]*0.393+0.769*imgData.data[i+1]+0.189*imgData.data[i+2];
                            tg=imgData.data[i]*0.349+0.686*imgData.data[i+1]+0.168*imgData.data[i+2];
                            tb=imgData.data[i]*0.272+0.534*imgData.data[i+1]+0.131*imgData.data[i+2];
                            if(tr>255){
                                tr=255;
                            }
                            if(tg>255){
                                tg=255;
                            }
                            if(tb>255){
                                tb=255;
                            }
                            imgData.data[i] = tr;
                            imgData.data[i+1] = tg;
                            imgData.data[i+2] = tb;
                        }
                        effectSelector.selectedIndex=0;
                    }
                    
                }
            }
            resizedContext.putImageData(imgData, 0, 0);
            let fotoSelectie=new Fotografie("selectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoSelectie.desen.x=selectii[selectii.length-1].desen.x;
            fotoSelectie.desen.y=selectii[selectii.length-1].desen.y;
            fotoSelectie.w=resizedCanvas.width;
            fotoSelectie.h=resizedCanvas.height;

            resizedContext.fillStyle="white";
            resizedContext.fillRect(0,0,resizedCanvas.width,resizedCanvas.height);

            let fotoGolire=new Fotografie("golireSelectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoGolire.desen.x=selectii[selectii.length-1].desen.x;
            fotoGolire.desen.y=selectii[selectii.length-1].desen.y;
            fotoGolire.w=resizedCanvas.width;
            fotoGolire.h=resizedCanvas.height;

            selectii.push(fotoGolire);
            selectii.push(fotoSelectie);
        }
        if(selectieActivata==1 && creareSelectie==0){
            ctx.lineWidth=5;
            ctx.setLineDash([6]);
            ctx.strokeRect(selectii[selectii.length-1].desen.x, selectii[selectii.length-1].desen.y,selectii[selectii.length-1].w, selectii[selectii.length-1].h);
        }
    }
    
    if(selectieActivata==1 && butonStangaApasat==1 && creareSelectie==1){
        ctx.lineWidth=5;
        ctx.setLineDash([6]);
        ctx.strokeRect(mousePos1.x, mousePos1.y,mousePos2.x-mousePos1.x, mousePos2.y-mousePos1.y);
    }
    histoGrama();
}

canvas.onmousedown=function(e){
    mousePos1.x=e.offsetX;
    mousePos1.y=e.offsetY;
    if(selectii.length>0){
        if(selectii[selectii.length-1].miscare!=1 && mousePos2.x>=selectii[selectii.length-1].desen.x && mousePos2.x<=selectii[selectii.length-1].desen.x+selectii[selectii.length-1].w
                && mousePos1.y>=selectii[selectii.length-1].desen.y && mousePos2.y<=selectii[selectii.length-1].desen.y+selectii[selectii.length-1].h){
                    if(e.button==0 && shiftPress==1 && selectieActivata==1){
                        selectii[selectii.length-1].miscare=1;
                        selectii[selectii.length-1].pozitieCursorInImagine.x=-selectii[selectii.length-1].desen.x +mousePos2.x;
                        selectii[selectii.length-1].pozitieCursorInImagine.y=-selectii[selectii.length-1].desen.y +mousePos2.y;
                        for(let j=0;j<texte.length;j++){
                            texte[j].miscare=1;
                            texte[j].pozitieCursorInImagine.x=-texte[j].desen.x +mousePos2.x;
                            texte[j].pozitieCursorInImagine.y=-texte[j].desen.y +mousePos2.y;
                        }
                    }
            }
        if(e.button==0 && shiftPress==0 && selectieActivata==1){
                creareSelectie=1; 
        }
    }
    if(e.button==0){
        butonStangaApasat=1;
    }

    if(e.button==0 && adaugareText==1){
        let selectfontFamily=document.querySelector("#fontOption");
        let fontFamily=selectfontFamily.options[selectfontFamily.selectedIndex].value;
        let dimensiune=document.getElementById("TextSize").value;
        let culoare=document.getElementById("TextColor").value;
        let continutText=document.getElementById("TextDeIntrodus").value;
        let textDeAdaugat=new TextScris(fontFamily,dimensiune,culoare,mousePos1,continutText);
        texte.push(textDeAdaugat);
        textDeAdaugat.draw();

        let resizedCanvas = document.createElement("canvas");
        let resizedContext = resizedCanvas.getContext("2d");

        resizedCanvas.height = canvas.height;
        resizedCanvas.width = canvas.width;
        
        resizedContext.drawImage(canvas, 0,0,resizedCanvas.width, resizedCanvas.height);
            
        let fotoSelectie=new Fotografie("selectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);

        resizedContext.fillStyle="white";
        resizedContext.fillRect(0,0,resizedCanvas.width,resizedCanvas.height);
        let fotoGolire=new Fotografie("golireSelectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
        selectii.push(fotoGolire);
        selectii.push(fotoSelectie);
    }
}

canvas.onmouseup=function(e){
    for(let i=0;i<texte.length;i++){
        if(texte[i].miscare==1){
            texte[i].miscare=0;
        }
    }

    let contor=0;
    for(let i=0;i<selectii.length;i++){
        if(selectii[i].miscare==1){
            selectii[i].miscare=0;
            contor++;
        }
    }

    if(creareSelectie==1 && selectieActivata==1){
        let resizedCanvas = document.createElement("canvas");
        let resizedContext = resizedCanvas.getContext("2d");

        resizedCanvas.height = Math.max(mousePos2.y,mousePos1.y)-Math.min(mousePos2.y,mousePos1.y)-5;
        resizedCanvas.width = Math.max(mousePos2.x,mousePos1.x)-Math.min(mousePos2.x,mousePos1.x)-5;

        resizedContext.drawImage(canvas, Math.min(mousePos2.x,mousePos1.x)+5, Math.min(mousePos2.y,mousePos1.y)+5, resizedCanvas.width-5, resizedCanvas.height-5,0,0,resizedCanvas.width, resizedCanvas.height);
        
        if(effectSelector.options[effectSelector.selectedIndex].value!="None"){
            const imgData = resizedContext.getImageData(0, 0,  resizedCanvas.width,  resizedCanvas.height);
            if(effectSelector.options[effectSelector.selectedIndex].value=="Invert"){
                for (let i = 0; i < imgData.data.length; i += 4) {
                    imgData.data[i] = 255-imgData.data[i];
                    imgData.data[i+1] = 255-imgData.data[i+1];
                    imgData.data[i+2] = 255-imgData.data[i+2];
                }
                effectSelector.selectedIndex=0;
            }else{
                if(effectSelector.options[effectSelector.selectedIndex].value=="BnW"){
                    let media;
                    for (let i = 0; i < imgData.data.length; i += 4) {
                        media=(imgData.data[i]+imgData.data[i+1]+imgData.data[i+2])/3;
                        imgData.data[i] = media;
                        imgData.data[i+1] = media;
                        imgData.data[i+2] = media;
                    }
                    effectSelector.selectedIndex=0;
                }else{
                    if(effectSelector.options[effectSelector.selectedIndex].value=="Sepia"){
                        let tr,tg,tb;
                        for (let i = 0; i < imgData.data.length; i += 4) {
                            tr=imgData.data[i]*0.393+0.769*imgData.data[i+1]+0.189*imgData.data[i+2];
                            tg=imgData.data[i]*0.349+0.686*imgData.data[i+1]+0.168*imgData.data[i+2];
                            tb=imgData.data[i]*0.272+0.534*imgData.data[i+1]+0.131*imgData.data[i+2];
                            if(tr>255){
                                tr=255;
                            }
                            if(tg>255){
                                tg=255;
                            }
                            if(tb>255){
                                tb=255;
                            }
                            imgData.data[i] = tr;
                            imgData.data[i+1] = tg;
                            imgData.data[i+2] = tb;                        
                        }
                        effectSelector.selectedIndex=0;
                    }
                }
            }
            resizedContext.putImageData(imgData, 0, 0);
        }
        
        let fotoSelectie=new Fotografie("selectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
        fotoSelectie.desen.x=Math.min(mousePos1.x,mousePos2.x)+5;
        fotoSelectie.desen.y=Math.min(mousePos1.y,mousePos2.y)+5;
        fotoSelectie.w=resizedCanvas.width-5;
        fotoSelectie.h=resizedCanvas.height-5;

        if(cropActivat==1){
            resizedCanvas.width=canvas.width;
            resizedCanvas.height=canvas.height;
            resizedContext.fillStyle="white";
            resizedContext.fillRect(0,0,resizedCanvas.width,resizedCanvas.height);
            let fotoGolire=new Fotografie("golireSelectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoGolire.desen.x=0;
            fotoGolire.desen.y=0;
            fotoGolire.w=resizedCanvas.width;
            fotoGolire.h=resizedCanvas.height;
            selectii.push(fotoGolire);
        }else{
            resizedContext.fillStyle="white";
            resizedContext.fillRect(0,0,resizedCanvas.width,resizedCanvas.height);
            let fotoGolire=new Fotografie("golireSelectie",resizedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),0);
            fotoGolire.desen.x=Math.min(mousePos1.x,mousePos2.x)+5;
            fotoGolire.desen.y=Math.min(mousePos1.y,mousePos2.y)+5;
            fotoGolire.w=resizedCanvas.width;
            fotoGolire.h=resizedCanvas.height;
            selectii.push(fotoGolire);
        }
        selectii.push(fotoSelectie);
    }
    creareSelectie=0;
    
    butonStangaApasat=0;
    histoGrama();
}

canvas.onmousemove=function(e){
    mousePos2.x=e.offsetX;
    mousePos2.y=e.offsetY;
}

canvas.oncontextmenu=function(e){
    e.preventDefault();
}

window.onkeydown=function(e){
    if(e.keyCode==16){
        shiftPress=1;
    }
    if(e.keyCode==17){
        ctrlPress=1;
    }
}

window.onkeyup=function(e){
    shiftPress=0;
    ctrlPress=0;
}

document.addEventListener('keydown',function(event){
    if(event.ctrlKey && event.key==='z'){
        selectii.pop();
        if(selectii.length==0){
            document.getElementById("dropZone").style.display="flex";
            document.getElementById("dropZone").style.border="0.5vh dashed var(--blueLight)";
            document.getElementById("dropZone").style.color="var(--white)";
            document.getElementById("dropZone").style.background="var(--grey)";
            pozaIncarcata=0;
            activareSelectie(); 
        }
    }
})

setInterval(deseneaza,30);

function histoGrama(){
    ctxHisto.clearRect(0,0,histograph.width,histograph.height);
    const Rarr=new Array(255).fill(0);
    const Garr=new Array(255).fill(0);
    const Barr=new Array(255).fill(0);
    let pixels=ctx.getImageData(0,0,wx,hx);
    for(let i=0;i<pixels.data.length;i+=4){
        Rarr[pixels.data[i]]++;
        Garr[pixels.data[i+1]]++;
        Barr[pixels.data[i+2]]++;
    }
    let deplasareX=5;
    let pozX=(histograph.width-50)/510;
    for(let i=0;i<=255;i++){

        ctxHisto.beginPath();
        ctxHisto.strokeStyle="green";
        ctxHisto.moveTo(deplasareX,histograph.height-10);
        ctxHisto.lineTo(deplasareX,(histograph.height-10-(Garr[i]/(histograph.height*4))));
        ctxHisto.stroke();
        deplasareX+=pozX/1.5;

        ctxHisto.beginPath();
        ctxHisto.strokeStyle="red";
        ctxHisto.moveTo(deplasareX,histograph.height-10);
        ctxHisto.lineTo(deplasareX,(histograph.height-10-((Rarr[i]/(histograph.height*4)))));
        ctxHisto.stroke();
        deplasareX+=pozX/1.5;    
        
        ctxHisto.beginPath();
        ctxHisto.strokeStyle="blue";
        ctxHisto.moveTo(deplasareX,histograph.height-10);
        ctxHisto.lineTo(deplasareX,(histograph.height-10-(Barr[i]/(histograph.height*4))));
        ctxHisto.stroke();
        deplasareX+=pozX/1.5;    
    }
    
}