import axios from 'axios'
import * as cheerio from 'cheerio'
import {encode} from 'gpt-3-encoder'
import {PGEssay, PGChunk, PGJSSON} from '../types/index'
const BASE_URL = "http://www.paulgraham.com";

const getLinks = async () => {
    const html = await axios.get(`${BASE_URL}/articles.html`);
    const $ = cheerio.load(html.data);
    //console.log(html);

    const tables = $("table");
    //create an array of objects with the url and title of each link
    const linkArr: {url: string, title: string}[] = [];

    tables.each((i, table) => {
        if(i == 2) {
            const links = $(table).find("a")
            
            links.each((i, link) => {
                const url = $(link).attr("href")
                const title = $(link).text()

                if(url && url.endsWith(".html") && title) {
                    const linkObj = {
                        url,
                        title
                    }
                    linkArr.push(linkObj)
                }
        })
        }
    })

    return linkArr;
};

const getEssay = async (url: string, title: string ) => {
  
    let essay: PGEssay = {
        title,
        url,
        date: "",
        content: "",
        tokens: 0,
        chunks: []
    }

    const html = await axios.get(`${BASE_URL}/${url}`);
    
    const $ = cheerio.load(html.data);
    
    const tables = $("table");
    
    
    tables.each((i, table) => {
        if(i == 1) {
                const text = $(table).text();

                let cleanedText = text.replace(/\s+/g, " ").replace(/\.([a-zA-Z])/g, ". $1");

                const split = cleanedText.match(/([A-Z][a-z]+ [0-9]{4})/);
                let dateStr = "";
                let textWithoutDate = "";
                
                if(split) {
                    dateStr = split[0];
                    textWithoutDate = cleanedText.replace(dateStr, "");
                }

                let essayText = textWithoutDate.replace(/\n/g, " ").trim();

                essay = {
                    title,
                    url: `${BASE_URL}/${url}`,
                    date: dateStr,
                    content: essayText,
                    tokens: encode(essayText).length,
                    chunks: []
                }

            }
            });
            return essay;

};

( async () => {
    const links = await getLinks();
    //console.log(links);

    let essays: PGEssay[] = [];

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        //console.log(link);

        //if(i !== 0) break;
        const essay = await getEssay(link.url, link.title);
        //console.log(essay);

        essays.push(essay);
    }
    //console.log(links);
}) ();