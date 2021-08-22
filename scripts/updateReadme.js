const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');
const json2md = require('json2md');

// README default content
const title = [
  { h1: 'React-Vue-Comparison' },
  {
    p:
      'This repo is for someone who already familiar with React.js or Vue.js, and wants to find out the relative syntax in another framework.',
  },
];
const contents = [
  { h2: 'Contents' },
  { h3: '[React.js vs Vue.js](/CORE.md)' },
  {
    ul: [
      '[Render](/CORE.md#render)',
      '[Basic-Component](/CORE.md#basic-component)',
      '[Prop](/CORE.md#prop)',
      '[Event-Binding](/CORE.md#event-binding)',
      '[Custom-Event](/CORE.md#custom-event)',
      '[State](/CORE.md#state)',
      '[Change-State](/CORE.md#change-state)',
      '[Two-Way-Binding(Vue.js only)](/CORE.md#two-way-binding)',
      '[Compute](/CORE.md#compute)',
      '[Watch](/CORE.md#watch)',
      '[Children-and-Slot](/CORE.md#children-and-slot)',
      '[Render-HTML](/CORE.md#render-html)',
      '[Conditional-Rendering](/CORE.md#conditional-rendering)',
      '[List-Rendering](/CORE.md#list-rendering)',
      '[Render-Props](/CORE.md#render-props)',
      '[Lifecycle](/CORE.md#lifecycle)',
      '[Error-Handling](/CORE.md#error-handling)',
      '[Ref](/CORE.md#ref)',
      '[Performance-Optimization](/CORE.md#performance-optimization)',
    ],
  },
  { h3: '[Next.js vs Nuxt.js](/SSR.md)' },
  {
    ul: [
      '[Assets](/SSR.md#assets)',
      '[Basic-Routes](/SSR.md#basic-routes)',
      '[Dynamic-Routes](/SSR.md#dynamic-routes)',
      '[Link](/SSR.md#link)',
      '[Fetch-On-Server](/SSR.md#fetch-on-server)',
      '[Layout](/SSR.md#layout)',
      '[Error-Page](/SSR.md#error-page)',
      '[Meta-Tag](/SSR.md#meta-tag)',
      '[Context](/SSR.md#context)',
    ],
  },
  { h3: 'Tools' },
  {
    ul: ['[CLI](/CLI.md)', '[DevTools](/DevTools.md)'],
  },
  { h3: '[React-Router vs Vue-Router](/ROUTER.md)' },
  {
    ul: [
      '[Basic-Routing](/ROUTER.md#Basic-Routing)',
      '[Dynamic-Routing](/ROUTER.md#Dynamic-Routing)',
      '[Nested-Routing](/ROUTER.md#Nested-Routing)',
      '[Link](/ROUTER.md#Link)',
      '[NavLink](/ROUTER.md#NavLink)',
      '[Get-Location](/ROUTER.md#Get-Location)',
      '[Push](/ROUTER.md#Push)',
      '[Replace](/ROUTER.md#Replace)',
      '[Redirect](/ROUTER.md#Redirect)',
      '[Event](/ROUTER.md#Event)',
      '[Scroll](/ROUTER.md#Scroll)',
      '[Lazy-Loading-and-Code-Splitting](/ROUTER.md#Lazy-Loading-and-Code-Splitting)',
    ],
  },
  { h3: '[Redux vs Vuex](/STATE_MANAGEMENT.md)' },
  {
    ul: [
      '[Create-Store](/STATE_MANAGEMENT.md#Create-Store)',
      '[Action](/STATE_MANAGEMENT.md#Action)',
      '[Async-Action](/STATE_MANAGEMENT.md#Async-Action)',
      '[Reducer | Mutation](/STATE_MANAGEMENT.md#Reducer-or-Mutation)',
      '[Combine-Reducers | Modules](/STATE_MANAGEMENT.md#Combine-Reducers-or-Modules)',
      '[Connect-with-Component](/STATE_MANAGEMENT.md#Connect-with-Component)',
      '[Middleware | Plugin](/STATE_MANAGEMENT.md#Middleware-or-Plugin)',
      '[Selector | Getter](/STATE_MANAGEMENT.md#Selector-or-Getter)',
      '[DevTools](/STATE_MANAGEMENT.md#DevTools)',
    ],
  },
  { p: '---' },
];
const reference = [
  { h2: 'Reference' },
  {
    ul: [
      '[React.js](https://reactjs.org/docs/getting-started.html)',
      '[Next.js](https://nextjs.org/docs/getting-started)',
      '[React Router](https://reacttraining.com/react-router/web/guides/quick-start)',
      '[Vue.js](https://vuejs.org/v2/guide/#Getting-Started)',
      '[Nuxt.js](https://nuxtjs.org/guide/installation)',
      '[Vue Router](https://router.vuejs.org/guide/)',
      '[Redux](https://redux.js.org/introduction/getting-started)',
      '[React-Redux](https://react-redux.js.org/introduction/quick-start)',
      '[Reselect](https://github.com/reduxjs/reselect)',
      '[Vuex](https://vuex.vuejs.org/guide/)',
    ],
  },
];

const repos = {
  react: {
    name: 'React',
    ghApi: 'https://api.github.com/search/repositories?q=react+in:name+user:facebook',
    npmUrl: 'https://www.npmjs.com/package/react',
    ghUrl: 'https://github.com/facebook/react',
    doc: 'https://reactjs.org/docs/getting-started.html',
  },
  vue: {
    name: 'Vue',
    ghApi: 'https://api.github.com/search/repositories?q=vue+in:name+user:vuejs',
    npmUrl: 'https://www.npmjs.com/package/vue',
    ghUrl: 'https://github.com/vuejs/vue',
    doc: 'https://vuejs.org/v2/guide/l',
  },
  'next.js': {
    name: 'Next.js',
    ghApi: 'https://api.github.com/search/repositories?q=next+in:name+user:vercel',
    npmUrl: 'https://www.npmjs.com/package/next',
    ghUrl: 'https://github.com/vercel/next.js',
    doc: 'https://nextjs.org/docs/getting-started',
  },
  'nuxt.js': {
    name: 'Nuxt.js',
    ghApi: 'https://api.github.com/search/repositories?q=nuxt+in:name+user:nuxt',
    npmUrl: 'https://www.npmjs.com/package/nuxt',
    ghUrl: 'https://github.com/nuxt/nuxt.js',
    doc: 'https://nuxtjs.org/guide',
  },
  'react-router': {
    name: 'React-Router',
    ghApi: 'https://api.github.com/search/repositories?q=react-router+in:name+user:remix-run',
    npmUrl: 'https://www.npmjs.com/package/react-router',
    ghUrl: 'https://github.com/remix-run/react-router',
    doc: 'https://reactrouter.com/',
  },
  'vue-router': {
    name: 'Vue-Router',
    ghApi: 'https://api.github.com/search/repositories?q=vue-router+in:name+user:vuejs',
    npmUrl: 'https://www.npmjs.com/package/vue-router',
    ghUrl: 'https://github.com/vuejs/vue-router',
    doc: 'https://router.vuejs.org/guide',
  },
  redux: {
    name: 'redux',
    ghApi: 'https://api.github.com/search/repositories?q=redux+in:name+user:reduxjs',
    npmUrl: 'https://www.npmjs.com/package/redux',
    ghUrl: 'https://github.com/reduxjs/redux',
    doc: 'https://redux.js.org/introduction/getting-started',
  },
  'react-redux': {
    name: 'react-redux',
    ghApi: 'https://api.github.com/search/repositories?q=react-redux+in:name+user:reduxjs',
    npmUrl: 'https://www.npmjs.com/package/react-redux',
    ghUrl: 'https://github.com/reduxjs/react-redux',
    doc: 'https://react-redux.js.org/introduction/quick-start',
  },
  vuex: {
    name: 'vuex',
    ghApi: 'https://api.github.com/search/repositories?q=vuex+in:name+user:vuejs',
    npmUrl: 'https://www.npmjs.com/package/vuex',
    ghUrl: 'https://github.com/vuejs/vuex',
    doc: 'https://vuex.vuejs.org/guide/',
  },
};

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
}
function logger(...args) {
  console.log(`[${new Date().toISOString()}] `, ...args);
}
function getRowTitle(key) {
  if (!repos[key]) return '';

  const info = repos[key];
  return `${info.name}: [npm](${info.npmUrl}) [gh](${info.ghUrl}) [doc](${info.doc})`;
}

function generateTable(info) {
  return [
    {
      table: {
        headers: ['', '⭐️', 'VERSION', 'OPEN ISSUES & PR', 'DOWNLOADS/wk'],
        aligns: ['left', 'right', 'center', 'right', 'right'],
        rows: Object.keys(repos).map(key => [
          getRowTitle(key),
          info[key].stars,
          info[key].version,
          info[key].issues,
          info[key].wkDownload,
        ]),
      },
    },
    { p: `_Update: ${getToday()}_` },
    { p: '---' },
  ];
}
function generateMD(table) {
  const readme = [...title, ...table, ...contents, ...reference];
  return json2md(readme);
}

(async function load() {
  const output = Object.keys(repos).reduce((res, name) => ({
    ...res,
    [name]: {
      stars: '?',
      version: '?',
      issues: '?',
      wkDownload: '?',
    }
  }), {})

  try {
    logger('load GitHub Info');
    const requests = Object.values(repos).map(({ ghApi }) => axios.get(ghApi));
    const results = await Promise.all(requests);
    results.forEach(({ data }) => {
      if (data && data.items && data.items[0]) {
        const { name, stargazers_count, open_issues_count } = data.items[0];
        if (name) {
          output[name] = {
            stars: Number(stargazers_count).toLocaleString(),
            issues: Number(open_issues_count).toLocaleString(),
          };
        }
      }
    });
  } catch (e) {
    logger('get github info fail:', e);
  }

  try {
    logger('load NPM Info');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    for (let k in repos) {
      const repo = repos[k];
      await page.goto(repo.npmUrl);

      const info = await page.evaluate(() => {
        function getElementByTitle(title, selector) {
          const elements = document.querySelectorAll(selector);
          let ele = null;
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].textContent.includes(title)) {
              ele = elements[i];
              break;
            }
          }
          return ele;
        }

        const wkDownloadTitle = getElementByTitle("Weekly Downloads", "h3");
        let wkDownload = "?";
        if (wkDownloadTitle && wkDownloadTitle.nextSibling) {
          const ele = wkDownloadTitle.nextSibling.querySelector('p');
          if (ele) {
            wkDownload = ele.innerText;
          }
        }
        const versionTitle = getElementByTitle("Version", "h3");
        let version = "?";
        if (versionTitle && versionTitle.nextSibling) {
          version = versionTitle.nextSibling.innerText;
        }
        return {
          wkDownload,
          version,
        };
      });

      if (output[k]) {
        output[k] = {
          ...output[k],
          ...info,
        };
      }
    }
    await browser.close();

    logger('generate README');
    const table = generateTable(output);
    const filePath = path.resolve(__dirname, `../README.md`);
    fs.writeFile(filePath, generateMD(table), 'utf8', err => {
      if (err) throw err;
      logger('finish');
    });
  } catch (e) {
    logger('get npm info fail:', e);
  }
})();