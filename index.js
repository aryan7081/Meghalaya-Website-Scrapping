
const puppeteer = require('puppeteer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Define the mapping from actual keys to placeholders
const keyMapping = {
    'ID: ': 'scheme_id',
    'Title: ': 'scheme_name',
    'Department: ': 'department',
    'Description: ': 'description',
    'Scheme Beneficiaries: ': 'scheme_beneficiary',
    'Scheme Link: ': 'scheme_link',
    'Scheme Benefits: ': 'scheme_benefits',
    'How to Avail: ': 'how_to_avail',
    'Sponsors: ': 'sponsors',
    'Age From: ': 'age_from',
    'To: ': 'to',
    'Introduced on: ': 'introduced_on',
    'Associated Scheme: ': 'associated_scheme',
    'Funding: ': 'funding'
    
};

async function getSchemes() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let pageNumber = 0;

    let schemesArray = [];
    while (pageNumber < 6) {
        await page.goto(`https://meghalaya.gov.in/index.php/schemes?page=${pageNumber}`);
        let schemeNames = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.view-content .item-list ul li span span a'), (e) => e.textContent));
        schemesArray = schemesArray.concat(schemeNames);
        pageNumber++;
    }

    await browser.close();
    return schemesArray;
}

async function getUrls() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let pageNumber = 0;

    let urlsArray = [];
    while (pageNumber < 6) {
        await page.goto(`https://meghalaya.gov.in/index.php/schemes?page=${pageNumber}`);
        let schemeUrls = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.view-content .item-list ul li span span a'), (e) => e.href));
        urlsArray = urlsArray.concat(schemeUrls);
        pageNumber++;
    }

    await browser.close();
    return urlsArray;
}

async function getSchemesDetail(urlsArray) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let allData = [];

    for (let url of urlsArray) {
        await page.goto(url);

        const keys = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.views-row .views-field span:first-child'), (e) => e.textContent));

        const values = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.views-row .views-field'), (field) => {
                const secondElement = field.querySelector(':scope > :nth-child(2)');
                return secondElement ? secondElement.textContent : null;
            }).filter(text => text != null));
        
        keys.pop();
        keys.pop();

        let slicedKeys = keys.slice(-values.length + 1);

        while (slicedKeys[0] != 'Department: ') {
            slicedKeys.shift();
        }

        let data = {
            'ID: ': uuidv4()
        };

        slicedKeys.forEach((key, index) => {
            data[key] = values[index];
        });

        data['Scheme Link: '] = url;

        // Replace keys with placeholders and transform the rest
        let transformedData = {};
        for (let key in data) {
            let newKey = keyMapping[key];
            // if (!newKey) {
            //     newKey = key.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
            // }
            transformedData[newKey] = data[key];
        }

        allData.push(transformedData);
    }

    await browser.close();
    return allData;
}

async function main() {
    const schemesArray = await getSchemes();
    const urlsArray = await getUrls();
    const allData = await getSchemesDetail(urlsArray);
    
    fs.writeFileSync('mappedSchemesData.json', JSON.stringify(allData, null, 2));
}

main();

