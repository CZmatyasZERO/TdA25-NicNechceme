import type { GetServerSidePropsContext } from "next";
import Game from "../models/Game";
const EXTERNAL_DATA_URL = 'https://04f1241e.app.deploy.tourde.app';


function generateSiteMap(games: { uuid: string, updatedAt: Date }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the two URLs we know already-->
     <url>
       <loc>https://example.com</loc>
     </url>
     <url>
       <loc>https://example.com/guide</loc>
     </url>
     ${games
       .map(({ uuid, updatedAt }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${uuid}`}</loc>
           <lastmod>${updatedAt.toISOString()}</lastmod>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}
function SiteMap() {
  // getServerSideProps will do the heavy lifting
}


export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  // We make an API call to gather the URLs for our site
  const games = await Game.find({});


  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(games);


  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();


  return {
    props: {},
  };
}


export default SiteMap;