const puppeteer = require('puppeteer');
var fs = require('fs');


//Lagrer info fra commentUrls laget av FBHref
async function run() {
	
	
	
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
   await page.goto('https://facebook.com');
  
   await page.evaluate(_ => {
document.getElementById('email').value = "Email@gmail.com"; //whoopsie, klartekst. pass via args el noe
document.getElementById('pass').value = "Pass"; //whoopsie, klartekst. pass via args el noe
document.getElementById('loginbutton').click();
  });
  
  
  
  console.log("login ferdig");
  await page.waitForNavigation();
  
  
  const HrefFromFile = JSON.parse(fs.readFileSync('\CommentsJson8.4.2020.json'));
  console.log(HrefFromFile);
  
  

  var temp;
  var comments = [];
  var currentHref;
  for(i = 0;i < HrefFromFile.length; i++){
  currentHref = HrefFromFile[i];
  
  
  await page.goto(currentHref, {waitUntil: 'networkidle2'});
  console.log("goto/scroll Delay: " + i +"/"+ HrefFromFile.length);
  await new Promise(resolve => setTimeout(resolve, 6000));             //  ---------------settings
  feedScroll(5, page);
  ClickByClass("_4ayk", page);
  console.log("Click Delay");
  await new Promise(resolve => setTimeout(resolve, 6000)); 
  temp = await getCommentData(page);
  for(u = 0; u < temp.length; u++){
	  comments.push(temp[u]);
  }
  console.log("comments gone git got complete" + i +"/"+ HrefFromFile.length);
  }
  
  
  //quickTEST
  /*await page.goto(hrefList[1], {waitUntil: 'networkidle2'});
  console.log("goto Delay");
  await new Promise(resolve => setTimeout(resolve, 10000));             //  ---------------settings
  ClickByClass("_4ayk", page);
  console.log("Click Delay");
  await new Promise(resolve => setTimeout(resolve, 10000)); 
  var comments = await getCommentData(page);
  console.log("comments gone git got complete");
  */ //quickTEST
  
  
  //writetoFile
  var json = JSON.stringify(comments);
  //browser.close();
  fs.writeFile('\CommentsJson.json', json, 'utf8',function(err) {
    if (err) throw err;
    console.log('Write to file complete');
    }
  );
}

//Returns liste med Hrefs 
async function getHrefbyClass(className, page){ 
return await page.evaluate((className) => {
	var hreflist = [];
	for(i = 0;i < document.getElementsByClassName(className).length; i++){
  hreflist.push(document.getElementsByClassName(className)[i].href);    
	}
	return Promise.resolve(hreflist);
  }, className);
}

//scroll te bunns i en facebook group feed ---- Fix meg med waitforNetworkidle el lignende
async function feedScroll(delaySeconds, page){
	 var newH;
  var prevH = await page.evaluate(() => {
  return Promise.resolve(document.body.scrollHeight);
  });
  
  while(prevH != newH){    //
	  prevH = newH;
	  
	  await page.evaluate(() => {
  window.scrollBy(0, document.body.scrollHeight);
  });
  await new Promise(resolve => setTimeout(resolve, delaySeconds*1000)); 
	newH = await page.evaluate(() => {
  return Promise.resolve(document.body.scrollHeight);
  });    
  console.log(prevH + " " + newH);
  }
}

//.Click på alle elements med className className
async function ClickByClass(className, page){
	return await page.evaluate((className) => {
		var list = document.getElementsByClassName(className);
	for(i = 0;i < list.length; i++){
		console.log(className);
		list[i].click();
	}
	return Promise.resolve(list);
	}, className);
}

//returns data fra mobileFacebookPostPermalink    Format. [[tekst, dato, navn][tekst, dato, navn][tekst, dato, navn]]
async function getCommentData(page){
	return await page.evaluate(() => {
	var comments = [];
	tekstFind = document.querySelectorAll('[data-sigil="comment-body"]');  //[i].textContent
	datoFind = document.querySelectorAll('[class="_4ghv _2b0a"]');                       //[i].textContent;
	navnFind = document.querySelectorAll('[class="_2b05"]');                            //[i].textContent
	for(i = 0;i < tekstFind.length; i++){
	comments.push([tekstFind[i].textContent, datoFind[i].textContent, navnFind[i].textContent]);
	}
	console.log(comments);
	return Promise.resolve(comments);
});
}

async function FBDateToTimeStamp(){
	
}




run();