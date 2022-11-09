export const environment = {
  production: true,
  
  // LIVE PROD ENDPOINTS
  streamAPI: 'https://animet-stream-api.onrender.com/',
   apiUrl: 'https://main-server.animet.site/', 
  /* apiUrl: 'https://beta-animet-server-v2-na.herokuapp.com/',  */
  baseUrl: 'https://animet.tv/',

  // LIVE DEV ENDPOINTS 
   /*  streamAPI: 'https://beta-animet-stream-api.herokuapp.com/', */
    /* apiUrl: 'https://animet-server-beta.herokuapp.com/', */
   /*  baseUrl: 'https://beta.animet.tv/', */
 

  feedLimit: 100,
  googleClientID: '308948486431-5gls99hn0eadrcs6siviqjugepnbsluu.apps.googleusercontent.com',
  disqusSrc: 'https://beta-animet-tv-1.disqus.com/embed.js',
  disqusShortName: 'prodanimettv',
  animettvIMGCDN: 'https://frosty-snyder-1df076.netlify.app/',
  streamSB: `https://streamsb.net/`,

  defaultServer: `client-side-vidstreaming`,
  animetPlayer: `https://internal.animet.site/`,
  freeImageAPI: `6d207e02198a847aa98d0a2a901485a5`,
  limitedNodes: [
    {
        "lable": "limited",
        "continent": "EU",
        "url": "https://cors-anywhere-hermes.noreply5262.workers.dev/?"
    },
    {
        "lable": "limited",
        "continent": "NA",
        "url": "https://cors-anywhere-hermes.noreply5262.workers.dev/?"
    },
    {
        "lable": "limited",
        "continent": "NA",
        "url": "https://cors-anywhere.demonking.workers.dev/?"
    },
    {
        "lable": "limited",
        "continent": "EU",
        "url": "https://cors-anywhere.demonking.workers.dev/?"
    }
]

};