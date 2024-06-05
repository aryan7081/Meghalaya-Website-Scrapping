// const puppeteer = require('puppeteer')

// async function run() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://meghalaya.gov.in/index.php/schemes/content/35877');
//     // await page.screenshot({path: 'netflix.png', fullPage:true})
//     const keys = await page.evaluate(()=>
//     Array.from(document.querySelectorAll('.views-row .views-field span:first-child'), (e)=> e.textContent))

//     const values = await page.evaluate(()=>
//     Array.from(document.querySelectorAll('.views-row .views-field'), (field)=> {
//         const secondElement = field.querySelector(':scope > :nth-child(2')
//         return secondElement ? secondElement.textContent : null;
//     }).filter(text => text != null))
//     keys.pop()
//     keys.pop()
//     slicedKeys = keys.slice( -values.length+1 )
//     console.log(slicedKeys)
//     await browser.close()
// }

// run()