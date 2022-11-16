// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3011/',
  streamAPI: 'http://localhost:8080/',

  feedLimit: 20,
  googleClientID: '308948486431-5gls99hn0eadrcs6siviqjugepnbsluu.apps.googleusercontent.com',
  baseUrl: 'http://localhost:4200/',
  disqusSrc: 'https://beta-animet-tv-1.disqus.com/embed.js',
  disqusShortName: 'prodanimettv',
  animettvIMGCDN: 'https://frosty-snyder-1df076.netlify.app/',
  streamSB: `https://streamsb.net/`,
  defaultServer: `client-side-vidstreaming`,
  animetPlayer: `http://127.0.0.1:5500/`,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
