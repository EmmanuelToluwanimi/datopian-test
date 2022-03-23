const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');
const writeStream = fs.createWriteStream('data.csv')

writeStream.write(` Country, Year, Area, Population, GDP per capita, Population density, Vehicle ownership, Total road deaths, Road deaths per Million Inhabitants\n`)

https.get('https://en.wikipedia.org/wiki/Road_safety_in_Europe', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        scrapeData(data);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});

function scrapeData(html) {
    const $ = cheerio.load(html)
    const table = []


    $('.wikitable > tbody > tr').slice(0, 29).each((i, el) => {
        const countries = $(el).find('td').first().text().trim();
        const year = "2018"
        const area = $(el).find('td:nth-child(2)').text().trim();
        const population = $(el).find('td:nth-child(3)').text().trim();
        const gdp = $(el).find('td:nth-child(4)').text().trim();
        const population_density = $(el).find('td:nth-child(5)').text().trim();
        const vehicle_ownership = $(el).find('td:nth-child(6)').text().trim();
        const total_road_deaths = $(el).find('td:nth-child(8)').text().trim();
        const road_deaths_per_mil = $(el).find('td:nth-child(9)').text().trim();

        const derivedData = { countries, year, area, population, gdp, population_density, vehicle_ownership, total_road_deaths, road_deaths_per_mil }

        table.push(derivedData)
    })

    const sortData = table.slice(1).sort((a, b) => a.road_deaths_per_mil.localeCompare(b.road_deaths_per_mil))

    sortData.forEach(x => {
        writeStream.write(`${x.countries}, ${x.year}, ${x.area.replace(/\,/g,'')}, ${x.population.replace(/\,/g,'')}, ${x.gdp.replace(/\,/g,'')}, ${x.population_density.replace(/\,/g,'')}, ${x.vehicle_ownership.replace(/\,/g,'')}, ${x.total_road_deaths.replace(/\,/g,'')}, ${x.road_deaths_per_mil.replace(/\,/g,'')}\n`)
    })

    console.log("successful operation");

}
