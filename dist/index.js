import { createRequire } from 'module';
import path from 'path';
import fs from 'fs/promises';
import { jsxs, jsx } from 'preact/jsx-runtime';

createRequire(import.meta.url);

// src/index-format.ts
var INDEX_FILE = "static/quartz-filters/index.json";

// src/emitter.ts
var defaultOptions = { excludeFields: [] };
var BUILT_IN = /* @__PURE__ */ new Set(["title", "path"]);
function normalizeScalar(value) {
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? void 0 : value.toISOString();
  return void 0;
}
function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeScalar).filter((v) => v !== void 0);
  }
  return normalizeScalar(value);
}
function indexNote(slug, frontmatter, options) {
  const excluded = new Set(options.excludeFields.map((f) => f.toLowerCase()));
  const allowed = options.fields ? new Set(options.fields.map((f) => f.toLowerCase())) : null;
  const fields = {};
  for (const [key, raw] of Object.entries(frontmatter)) {
    const lower = key.toLowerCase();
    if (BUILT_IN.has(lower) || excluded.has(lower)) continue;
    if (allowed && !allowed.has(lower)) continue;
    const value = normalizeValue(raw);
    if (value !== void 0) fields[key] = value;
  }
  const title = typeof frontmatter.title === "string" && frontmatter.title.length > 0 ? frontmatter.title : slug;
  fields.title = title;
  fields.path = slug;
  return { path: slug, title, fields };
}
var FrontmatterIndex = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  const emitIndex = async (ctx, content) => {
    const notes = content.flatMap(([, vfile]) => {
      const slug = vfile.data?.slug;
      if (typeof slug !== "string") return [];
      const frontmatter = vfile.data?.frontmatter ?? {};
      return [indexNote(slug, frontmatter, options)];
    });
    const file = { version: 1, notes };
    const outputPath = path.join(ctx.argv.output, INDEX_FILE);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(file));
    return [outputPath];
  };
  return {
    name: "FrontmatterIndex",
    async emit(ctx, content) {
      return emitIndex(ctx, content);
    },
    async *partialEmit(ctx, content) {
      yield* await emitIndex(ctx, content);
    }
  };
};

// src/i18n/locales/en-US.ts
var en_US_default = {
  components: {
    noteFilter: {
      label: "Filter notes",
      tabFilter: "Filter",
      tabSaved: "Saved",
      matchCase: "Match case",
      removeClause: "Remove clause",
      save: "Save",
      clear: "Clear",
      cancel: "Cancel",
      replace: "Replace",
      nameLabel: "Name",
      replacePrompt: 'Replace the saved filter "{name}"?',
      deleteBookmark: 'Delete "{name}"',
      errorAt: "{message} (column {column})",
      loading: "Loading notes\u2026",
      loadFailed: "Couldn't load filter data.",
      matched: "{matched} of {total} notes",
      total: "{total} notes",
      noExplorer: "Add the Explorer plugin to filter notes.",
      noMatches: "No notes match this filter.",
      clearFilter: "Clear filter",
      filtered: "Filtered",
      savedEmpty: "Save a filter to run it again later.",
      savingOff: "Saving is off in this browser."
    }
  }
};

// src/i18n/index.ts
var locales = {
  "en-US": en_US_default
};
function i18n(locale) {
  return locales[locale] || en_US_default;
}

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/styles/note-filter.scss
var note_filter_default = ".note-filter {\n  margin: 0.5rem 0 1.25rem;\n  font-family: var(--bodyFont);\n  color: var(--darkgray);\n}\n.note-filter .qf-tabs {\n  display: flex;\n  gap: 1.1rem;\n  border-bottom: 1px solid var(--lightgray);\n  margin-bottom: 0.75rem;\n}\n.note-filter .qf-tab {\n  background: none;\n  border: 0;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n  padding: 0 0 0.4rem;\n  cursor: pointer;\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  color: var(--gray);\n}\n.note-filter .qf-tab:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-tab[aria-selected=true] {\n  color: var(--dark);\n  font-weight: 700;\n  border-bottom-color: var(--secondary);\n}\n.note-filter .qf-count {\n  font-family: var(--bodyFont);\n  font-weight: 400;\n  color: var(--gray);\n}\n.note-filter .qf-query {\n  position: relative;\n}\n.note-filter .qf-highlight,\n.note-filter .qf-input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0;\n  padding: 0.5rem 2.6rem 0.5rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  font-family: var(--codeFont);\n  font-size: 0.85rem;\n  font-weight: 400;\n  line-height: 1.55;\n  letter-spacing: normal;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-highlight {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  color: var(--dark);\n  background: none;\n}\n.note-filter .qf-input {\n  position: relative;\n  display: block;\n  resize: none;\n  overflow: hidden;\n  color: transparent;\n  caret-color: var(--dark);\n  background: transparent;\n  border-color: var(--lightgray);\n}\n.note-filter .qf-input::placeholder {\n  color: var(--gray);\n}\n.note-filter .qf-input:focus {\n  outline: none;\n  border-color: var(--secondary);\n  box-shadow: 0 0 0 2px var(--highlight);\n}\n.note-filter .qf-field {\n  color: var(--secondary);\n}\n.note-filter .qf-keyword,\n.note-filter .qf-op,\n.note-filter .qf-paren {\n  color: var(--gray);\n}\n.note-filter .qf-value {\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-invalid {\n  text-decoration: underline wavy;\n  text-decoration-color: var(--secondary);\n}\n.note-filter .qf-case {\n  position: absolute;\n  top: 0.35rem;\n  right: 0.35rem;\n  padding: 0.1rem 0.35rem;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-filter .qf-case:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-case[aria-pressed=true] {\n  color: var(--secondary);\n  background: var(--highlight);\n  border-color: var(--secondary);\n}\n.note-filter .qf-error {\n  margin: 0.4rem 0 0;\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses {\n  list-style: none;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses li {\n  margin: 0;\n}\n.note-filter .qf-clause {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.15rem 0 0.15rem 0.55rem;\n  border-left: 2px solid var(--tertiary);\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-join {\n  padding: 0.05rem 0 0.05rem 0.55rem;\n  border-left: 2px solid var(--lightgray);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove,\n.note-filter .qf-bookmark-remove {\n  flex: none;\n  background: none;\n  border: 0;\n  padding: 0 0.2rem;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove:focus-visible,\n.note-filter .qf-bookmark-remove:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-clause-remove:hover,\n.note-filter .qf-bookmark-remove:hover {\n  color: var(--dark);\n}\n.note-filter .qf-status-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 0.5rem;\n  margin-top: 0.6rem;\n  font-size: 0.8rem;\n}\n.note-filter .qf-actions,\n.note-filter .qf-form-actions {\n  display: flex;\n  gap: 0.75rem;\n}\n.note-filter .qf-form-actions {\n  justify-content: flex-end;\n}\n.note-filter .qf-link {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.note-filter .qf-link:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-link:hover {\n  text-decoration: underline;\n}\n.note-filter .qf-link:disabled {\n  color: var(--gray);\n  cursor: default;\n  text-decoration: none;\n}\n.note-filter .qf-save-form {\n  display: grid;\n  gap: 0.4rem;\n  margin-top: 0.6rem;\n  font-size: 0.85rem;\n}\n.note-filter .qf-save-form[hidden] {\n  display: none;\n}\n.note-filter .qf-save-form label {\n  display: grid;\n  gap: 0.2rem;\n}\n.note-filter .qf-save-form input {\n  font: inherit;\n  padding: 0.3rem 0.5rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  background: var(--light);\n  color: var(--dark);\n}\n.note-filter .qf-save-form input:focus {\n  outline: none;\n  border-color: var(--secondary);\n}\n.note-filter .qf-replace {\n  margin: 0;\n  color: var(--dark);\n}\n.note-filter .qf-note {\n  margin: 0.25rem 0;\n  font-size: 0.85rem;\n}\n.note-filter .qf-bookmarks {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.note-filter .qf-bookmarks li {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.note-filter .qf-bookmarks li:last-child {\n  border-bottom: 0;\n}\n.note-filter .qf-bookmark {\n  flex: 1;\n  min-width: 0;\n  padding: 0.45rem 0 0.45rem 0.5rem;\n  border: 0;\n  border-left: 2px solid transparent;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n}\n.note-filter .qf-bookmark:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-bookmark[aria-current=true] {\n  border-left-color: var(--secondary);\n}\n.note-filter .qf-bookmark[aria-current=true] .qf-bookmark-name {\n  color: var(--secondary);\n}\n.note-filter .qf-bookmark-name {\n  display: block;\n  font-size: 0.92rem;\n  font-weight: 600;\n  color: var(--dark);\n}\n.note-filter .qf-bookmark-query {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n\n.explorer .qf-hidden {\n  display: none !important;\n}\n.explorer .title-button h2[data-qf-filtered]::after {\n  content: attr(data-qf-filtered);\n  margin-left: 0.5rem;\n  font-family: var(--bodyFont);\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--secondary);\n}\n.explorer .qf-empty {\n  margin: 0.5rem 0;\n  font-size: 0.85rem;\n  color: var(--darkgray);\n}\n.explorer .qf-empty button {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.explorer .qf-empty button:hover {\n  text-decoration: underline;\n}\n.explorer .qf-empty button:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}";

// src/components/scripts/note-filter.inline.ts
var note_filter_inline_default = 'var he=Object.defineProperty;var ye=(e,t,u)=>t in e?he(e,t,{enumerable:!0,configurable:!0,writable:!0,value:u}):e[t]=u;var re=(e,t,u)=>ye(e,typeof t!="symbol"?t+"":t,u);var Xe=Object.hasOwnProperty;function xe(){return typeof document>"u"?"":document.body?.dataset?.basepath??""}function X(e,t){let u=t??xe(),o=e.startsWith("/")?e:"/"+e;return u+o}var oe="static/quartz-filters/index.json";var W=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);var Q="quartz-filters:bookmarks";function ke(e){try{let t=e();if(!t)return null;let u=`${Q}:probe`;return t.setItem(u,"1"),t.removeItem(u),t}catch{return null}}function se(e){let t=ke(e),u=()=>{if(!t)return[];try{let r=JSON.parse(t.getItem(Q)??"[]");return Array.isArray(r)?r.flatMap(n=>W(n)&&typeof n.name=="string"&&typeof n.query=="string"?[{name:n.name,query:n.query,caseSensitive:n.caseSensitive===!0}]:[]):[]}catch{return[]}},o=r=>{if(!t)return!1;try{return t.setItem(Q,JSON.stringify(r)),!0}catch{return!1}};return{available:t!==null,list:u,find:r=>u().find(n=>n.name===r),save(r){let n=u(),D=n.findIndex(f=>f.name===r.name);return D>=0?n[D]=r:n.push(r),o(n)},remove(r){o(u().filter(n=>n.name!==r))}}}var x={root:"div.explorer",list:".explorer-ul",content:".explorer-content",title:".title-button h2",fileLink:"a.nav-file-title",folderHeader:".folder-container",folderOuter:".folder-outer",openClass:"open"},R="qf-hidden",Z="qf-empty",j="data-qf-opened",$="data-qf-filtered";var U=(e,t)=>Array.from(e.children).find(u=>u.matches(t))??null;function ie(e,t,u){let o=Array.from(e.querySelectorAll(x.root)),r=[],n=null,D=!1,f=()=>o.forEach(l=>A(l,n));function h(l,y){y.querySelectorAll(`.${R}`).forEach(C=>C.classList.remove(R)),y.querySelectorAll(`[${j}]`).forEach(C=>{C.classList.remove(x.openClass),C.removeAttribute(j)}),l.removeAttribute($),l.querySelector(x.title)?.removeAttribute($)}function A(l,y){l.querySelector(`.${Z}`)?.remove();let C=l.querySelector(x.list);if(!C)return;if(y===null){h(l,C);return}let T=Array.from(C.querySelectorAll("li")),k=0;for(let d of T){let p=U(d,x.fileLink);if(!p)continue;let E=y.has(p.getAttribute("href")??"");d.classList.toggle(R,!E),E&&k++}for(let d of T.reverse()){if(!U(d,x.folderHeader))continue;let p=Array.from(d.querySelectorAll("li")).some(v=>!v.classList.contains(R)&&U(v,x.fileLink));d.classList.toggle(R,!p);let E=U(d,x.folderOuter);p&&E&&!E.classList.contains(x.openClass)&&(E.classList.add(x.openClass),E.setAttribute(j,""))}if(l.setAttribute($,""),l.querySelector(x.title)?.setAttribute($,t.filtered),k===0){let d=l.ownerDocument,p=d.createElement("p");p.className=Z,p.append(`${t.noMatches} `);let E=d.createElement("button");E.type="button",E.textContent=t.clearFilter,E.onclick=u,p.append(E),(l.querySelector(x.content)??l).append(p)}}for(let l of o){let y=l.querySelector(x.list);if(!y)continue;let C=new MutationObserver(()=>{D||(D=!0,queueMicrotask(()=>{D=!1,f()}))});C.observe(y,{childList:!0,subtree:!0}),r.push(C)}return{count:o.length,apply(l){n=l,f()},disconnect(){r.forEach(l=>l.disconnect())}}}function De(e,t=u=>fetch(u)){let u=null;return{load(){return u??(u=t(e).then(async o=>{if(!o.ok)throw new Error(`HTTP ${o.status}`);let r=await o.json();if(r.version!==1||!Array.isArray(r.notes))throw new Error("Unexpected index format");return r.notes}).catch(o=>{throw u=null,o})),u}}}var ve=/^\\d{4}-\\d{2}-\\d{2}(T[\\d:.]+(Z|[+-]\\d{2}:\\d{2})?)?$/;function q(e,t,u){switch(e.kind){case"and":return q(e.left,t,u)&&q(e.right,t,u);case"or":return q(e.left,t,u)||q(e.right,t,u);case"not":return!q(e.expr,t,u);case"clause":return be(e,t,u.caseSensitive)}}function Se(e,t,u){if(u){let n=e[t];return n===void 0?void 0:[].concat(n)}let o=t.toLowerCase(),r;for(let[n,D]of Object.entries(e))n.toLowerCase()===o&&(r=(r??[]).concat(D));return r}function be(e,t,u){let o=Se(t,e.field,u);if(e.op==="has")return o!==void 0&&o.some(D=>D!=="");let r=e.value;if(!r)return!1;let n=()=>o?.some(D=>we(D,r,u))??!1;switch(e.op){case"is":case"in":return n();case"is not":case"not in":return!n();case"contains":return o?.some(D=>qe(D,r,u))??!1;default:return o?.some(D=>Ne(D,r,e.op))??!1}}var ae=e=>ve.test(e)&&!Number.isNaN(Date.parse(e)),Le=e=>new Date(Date.parse(e)).toISOString().slice(0,10);function le(e,t){if(t.length===10){let u=Le(e);return u<t?-1:u>t?1:0}return Math.sign(Date.parse(e)-Date.parse(t))}var Te=(e,t,u)=>u?e===t:e.toLowerCase()===t.toLowerCase();function we(e,t,u){return t.type==="number"&&typeof e=="number"?e===Number(t.value):t.type==="date"&&typeof e=="string"&&ae(e)?le(e,t.value)===0:t.type==="boolean"&&typeof e=="boolean"?e===(t.value==="true"):Te(String(e),t.value,u)}function qe(e,t,u){let o=String(e);return u?o.includes(t.value):o.toLowerCase().includes(t.value.toLowerCase())}function Ne(e,t,u){let o;if(t.type==="number"&&typeof e=="number")o=Math.sign(e-Number(t.value));else if(t.type==="date"&&typeof e=="string"&&ae(e))o=le(e,t.value);else return!1;switch(u){case"<":return o<0;case">":return o>0;case"<=":return o<=0;case">=":return o>=0;default:return!1}}var Ie=new Set(["is","not","in","and","or","has","exists","contains"]),Fe=/[\\p{L}\\p{N}_.:-]/u,Me=/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z)?)?$/,Re=/^-?\\d+(\\.\\d+)?$/,$e=new Set([\'"\',"\\u201C"]),Pe=new Set([\'"\',"\\u201D"]);function N(e){let t=[],u=0;for(;u<e.length;){let o=e[u];if(/\\s/.test(o)){u++;continue}if(o==="("||o===")"){t.push({type:o==="("?"lparen":"rparen",value:o,start:u,end:u+1}),u++;continue}if(o==="<"||o===">"){let r=e[u+1]==="="?`${o}=`:o;t.push({type:"op",value:r,start:u,end:u+r.length}),u+=r.length;continue}if($e.has(o)){let r=u,n="",D=!1;for(u++;u<e.length;){let f=e[u];if(f==="\\\\"&&e[u+1]===\'"\'){n+=\'"\',u+=2;continue}if(Pe.has(f)){D=!0,u++;break}n+=f,u++}if(!D)return{tokens:t,error:{message:"This quoted value has no closing quote",column:r+1}};t.push({type:"string",value:n,start:r,end:u});continue}if(Fe.test(o)){let r=u;for(;u<e.length&&Fe.test(e[u]);)u++;let n=e.slice(r,u),D=n.toLowerCase();Me.test(n)?t.push({type:"date",value:n,start:r,end:u}):Re.test(n)?t.push({type:"number",value:n,start:r,end:u}):D==="true"||D==="false"?t.push({type:"boolean",value:D,start:r,end:u}):Ie.has(D)?t.push({type:"keyword",value:D,start:r,end:u}):t.push({type:"word",value:n,start:r,end:u});continue}return{tokens:t,error:{message:`Unexpected character "${o}"`,column:u+1}}}return{tokens:t,error:null}}var G=(e,t)=>e?.type==="keyword"&&e.value===t,ee=e=>G(e,"and")||G(e,"or");function ce(e){return e.type==="string"?`"${e.value.replace(/"/g,\'\\\\"\')}"`:e.value}function fe(e){return e.op==="has"||!e.value?`has ${e.field}`:e.op==="in"||e.op==="not in"?`${ce(e.value)} ${e.op} ${e.field}`:`${e.field} ${e.op} ${ce(e.value)}`}function de(e,t){let{tokens:u}=N(e),o=u.findIndex(n=>n.start>=t.end);if(o<0)return null;for(;u[o]?.type==="rparen";)o++;let r=u[o];return ee(r)?r.value:null}function Ee(e,t){let{tokens:u}=N(e),o=u.findIndex(l=>l.start===t.start),r=u.findIndex(l=>l.end===t.end);if(o<0||r<o)return e;let n=()=>{for(;G(u[o-1],"not");)o--};for(n();u[o-1]?.type==="lparen"&&u[r+1]?.type==="rparen";)o--,r++,n();let D=u[o]?.start??t.start,f=u[r]?.end??t.end,h=u[r+1],A=u[o-1];return ee(h)?f=u[r+2]?.start??h.end:ee(A)&&(D=u[o-2]?.end??A.start),(e.slice(0,D)+e.slice(f)).trim()}var He=new Set(["is","contains","exists"]),Oe=new Set(["has","in"]);function _e(e,t){let u=e[t];if(!u)return"value";if(u.type==="keyword")return"keyword";if(u.type==="op")return"op";if(u.type==="lparen"||u.type==="rparen")return"paren";if(u.type==="word"){let o=e[t-1],r=e[t+1];if(o?.type==="keyword"&&Oe.has(o.value)||r?.type==="op"||r?.type==="keyword"&&He.has(r.value))return"field"}return"value"}function pe(e){let{tokens:t,error:u}=N(e),o=[],r=0;if(t.forEach((n,D)=>{n.start>r&&o.push({text:e.slice(r,n.start),kind:"space"}),o.push({text:e.slice(n.start,n.end),kind:_e(t,D)}),r=n.end}),r<e.length){let n=e.slice(r),D=n.length-n.trimStart().length;D>0&&o.push({text:n.slice(0,D),kind:"space"}),D<n.length&&o.push({text:n.slice(D),kind:u?"invalid":"space"})}return o}var Ke=/^[\\p{L}_][\\p{L}\\p{N}_.-]*$/u,We=new Set(["string","number","date","boolean","word"]),V=class extends Error{constructor(u){super(u.message);re(this,"detail",u)}},je=(e,t)=>e&&e.column<=t.column?e:t;function ue(e){let{tokens:t,error:u}=N(e),o=[],r=0,n=(s=0)=>t[r+s],D=s=>`"${e.slice(s.start,s.end)}"`,f=(s,F)=>s?.type==="keyword"&&s.value===F,h=s=>s!==void 0&&We.has(s.type),A=s=>s?.type==="word"&&Ke.test(s.value);function l(s,F){throw new V({message:s,column:(F?.start??e.length)+1})}function y(s){return{type:s.type==="word"?"string":s.type,value:s.value}}function C(){let s=T();for(;f(n(),"or");)r++,s={kind:"or",left:s,right:T()};return s}function T(){let s=k();for(;f(n(),"and");)r++,s={kind:"and",left:s,right:k()};return s}function k(){return f(n(),"not")?(r++,{kind:"not",expr:k()}):d()}function d(){let s=n();if(s?.type==="lparen"){r++;let F=C(),m=n();return m?.type!=="rparen"?l(`Expected ")" to close the "(" at column ${s.start+1}`,m):(r++,F)}return v()}function p(s){let F=n();return A(F)?(r++,F.value):l(`Expected a field name after ${D(s)}`,F)}function E(s){let F=n();return F?.type==="keyword"?l(`${D(F)} is a keyword. Put it in quotes to use it as a value`,F):h(F)?(r++,y(F)):l(`Expected a value after ${D(s)}`,F)}function v(){let s=n();if(!s)return l("Expected a clause",s);let F=(w,I,O)=>{let M={kind:"clause",op:w,field:I,value:O,start:s.start,end:t[r-1]?.end??s.end};return o.push(M),M};if(f(s,"has"))return r++,F("has",p(s),null);if(!h(s))return l(`Expected a clause, found ${D(s)}`,s);r++;let m=n();if(f(m,"in"))return r++,F("in",p(m),y(s));let H=n(1);if(f(m,"not")&&f(H,"in"))return r+=2,F("not in",p(H),y(s));if(!A(s))return l(`Expected "in" after ${D(s)}`,m);if(f(m,"is")){r++;let w=n();return f(w,"not")?(r++,F("is not",s.value,E(w))):F("is",s.value,E(m))}return f(m,"contains")?(r++,F("contains",s.value,E(m))):m?.type==="op"?(r++,F(m.value,s.value,E(m))):f(m,"exists")?(r++,F("has",s.value,null)):l(`Expected "is", "in", "contains", a comparison or "exists" after ${D(s)}`,m)}if(t.length===0)return{ast:null,error:u,clauses:o};try{let s=C(),F=n();return F&&l(F.type==="rparen"?\'There is no "(" for this ")"\':`Expected "and" or "or" before ${D(F)}`,F),u?{ast:null,error:u,clauses:o}:{ast:s,error:null,clauses:o}}catch(s){if(s instanceof V)return{ast:null,error:je(u,s.detail),clauses:o};throw s}}var Ce="quartz-filters:query";function me(e){try{let t=e()?.getItem(Ce);if(!t)return null;let u=JSON.parse(t);return!W(u)||typeof u.query!="string"?null:{query:u.query,caseSensitive:u.caseSensitive===!0}}catch{return null}}function Ae(e,t){try{e()?.setItem(Ce,JSON.stringify(t))}catch{}}var P=(e,t)=>e.replace(/\\{(\\w+)\\}/g,(u,o)=>String(t[o]??u));function ge(e,t){let u=JSON.parse(e.dataset.strings??"{}"),o=e.ownerDocument,r=i=>{let a=e.querySelector(i);if(!a)throw new Error(`NoteFilter markup is missing ${i}`);return a},n={tabs:Array.from(e.querySelectorAll(\'[role="tab"]\')),panels:Array.from(e.querySelectorAll(\'[role="tabpanel"]\')),input:r(".qf-input"),highlight:r(".qf-highlight"),caseToggle:r(".qf-case"),error:r(".qf-error"),clauses:r(".qf-clauses"),status:r(".qf-status"),save:r(".qf-save"),clear:r(".qf-clear"),form:r(".qf-save-form"),name:r(".qf-name"),replace:r(".qf-replace"),confirm:r(".qf-save-confirm"),cancel:r(".qf-save-cancel"),count:r(".qf-count"),savedNote:r(".qf-saved-note"),bookmarkList:r(".qf-bookmarks")},D=!0,f=null,h="idle",A=ue(""),l=null,y=null,C,T=[],k=t.createSync(()=>_(""));function d(i,a,c){i.addEventListener(a,c),T.push(()=>i.removeEventListener(a,c))}let p=()=>n.caseToggle.getAttribute("aria-pressed")==="true",E=i=>n.caseToggle.setAttribute("aria-pressed",String(i)),v=()=>n.input.value.trim();function s(){h==="loading"||h==="ready"||(h="loading",I(),t.loader.load().then(i=>{D&&(f=i,h="ready",w())},()=>{D&&(h="failed",I())}))}function F(){clearTimeout(C),A=ue(n.input.value),A.error||(l=A.ast),m(),H(),n.error.hidden=A.error===null,n.error.textContent=A.error?P(u.errorAt,{message:A.error.message,column:A.error.column}):"",n.save.disabled=!t.bookmarks.available||!v(),n.clear.disabled=!n.input.value,M(),v()&&s(),w(),Ae(t.session,{query:n.input.value,caseSensitive:p()})}function m(){n.highlight.replaceChildren(...pe(n.input.value).map(i=>{let a=o.createElement("span");return a.className=`qf-${i.kind}`,a.textContent=i.text,a})),n.highlight.append(`\n`),n.input.style.height="auto",n.input.scrollHeight>0&&(n.input.style.height=`${n.input.scrollHeight}px`)}function H(){let i=[];A.clauses.forEach((a,c)=>{let g=fe(a),B=o.createElement("li");B.className="qf-clause";let b=o.createElement("span");b.textContent=g;let S=o.createElement("button");S.type="button",S.className="qf-clause-remove",S.dataset.clause=String(c),S.textContent="\\xD7",S.setAttribute("aria-label",`${u.removeClause}: ${g}`),B.append(b,S),i.push(B);let L=c<A.clauses.length-1?de(n.input.value,a):null;if(L){let K=o.createElement("li");K.className="qf-join",K.setAttribute("aria-hidden","true"),K.textContent=L,i.push(K)}}),n.clauses.replaceChildren(...i)}function w(){let i=l;if(!f||!i){k.apply(null),I();return}let a={caseSensitive:p()},c=f.filter(g=>q(i,g.fields,a));k.apply(new Set(c.map(g=>t.hrefFor(g.path)))),I(c.length)}function I(i){let a="";h==="loading"?a=u.loading:h==="failed"?a=u.loadFailed:f&&i!==void 0?a=P(u.matched,{matched:i,total:f.length}):f&&(a=P(u.total,{total:f.length})),k.count===0&&h!=="failed"&&(a=a?`${a} ${u.noExplorer}`:u.noExplorer),n.status.textContent=a}function O(i){return i.find(a=>a.query===v()&&a.caseSensitive===p())}function M(){let i=t.bookmarks.list(),a=O(i);n.count.textContent=i.length>0?String(i.length):"",n.savedNote.textContent=t.bookmarks.available?u.savedEmpty:u.savingOff,n.savedNote.hidden=t.bookmarks.available&&i.length>0,n.bookmarkList.replaceChildren(...i.map(c=>{let g=o.createElement("li"),B=o.createElement("button");B.type="button",B.className="qf-bookmark",B.dataset.name=c.name,c===a&&B.setAttribute("aria-current","true");let b=o.createElement("span");b.className="qf-bookmark-name",b.textContent=c.name;let S=o.createElement("span");S.className="qf-bookmark-query",S.textContent=c.query,B.append(b,S);let L=o.createElement("button");return L.type="button",L.className="qf-bookmark-remove",L.dataset.name=c.name,L.textContent="\\xD7",L.setAttribute("aria-label",P(u.deleteBookmark,{name:c.name})),g.append(B,L),g}))}function _(i){n.input.value=i,F()}function z(i,a=!1){for(let c of n.tabs){let g=c.dataset.tab===i;c.setAttribute("aria-selected",String(g)),c.tabIndex=g?0:-1,g&&a&&c.focus()}for(let c of n.panels)c.hidden=c.dataset.panel!==i}function J(){y=null,n.replace.hidden=!0,n.replace.textContent="",n.confirm.textContent=u.save}function te(){J(),n.form.hidden=!0}n.tabs.forEach((i,a)=>{d(i,"click",()=>z(i.dataset.tab??"filter")),d(i,"keydown",c=>{let B={ArrowRight:a+1,ArrowLeft:a-1,Home:0,End:n.tabs.length-1}[c.key];if(B===void 0)return;c.preventDefault();let b=n.tabs[(B+n.tabs.length)%n.tabs.length];b&&z(b.dataset.tab??"filter",!0)})}),d(n.input,"input",()=>{m(),clearTimeout(C),C=setTimeout(F,t.debounceMs??150)}),d(n.input,"keydown",i=>{i.key==="Enter"&&i.preventDefault()}),d(n.input,"focus",s),d(n.caseToggle,"click",()=>{E(!p()),F()}),d(n.clear,"click",()=>{_(""),n.input.focus()}),d(n.clauses,"click",i=>{let a=i.target.closest(".qf-clause-remove"),c=a?A.clauses[Number(a.dataset.clause)]:void 0;c&&(_(Ee(n.input.value,c)),n.input.focus())}),d(n.save,"click",()=>{v()&&(J(),n.form.hidden=!1,n.name.value=O(t.bookmarks.list())?.name??v(),n.name.focus(),n.name.select())}),d(n.cancel,"click",te),d(n.name,"input",J),d(n.form,"submit",i=>{i.preventDefault();let a=n.name.value.trim();if(a){if(y!==a&&t.bookmarks.find(a)){y=a,n.replace.textContent=P(u.replacePrompt,{name:a}),n.replace.hidden=!1,n.confirm.textContent=u.replace;return}t.bookmarks.save({name:a,query:v(),caseSensitive:p()})&&(te(),M())}}),d(n.bookmarkList,"click",i=>{let a=i.target,c=a.closest(".qf-bookmark-remove");if(c?.dataset.name!==void 0){t.bookmarks.remove(c.dataset.name),M();return}let g=a.closest(".qf-bookmark"),B=g?.dataset.name!==void 0?t.bookmarks.find(g.dataset.name):void 0;B&&(E(B.caseSensitive),_(B.query),z("filter"))});let Y=me(t.session);n.input.value=Y?.query??"",E(Y?Y.caseSensitive:e.dataset.caseSensitive==="true"),F();let ne=()=>{D=!1,clearTimeout(C),T.forEach(i=>i()),k.disconnect()};return typeof window.addCleanup=="function"&&window.addCleanup(ne),ne}var Be=new Map;function Ue(e){let t=Be.get(e);return t||(t=De(e),Be.set(e,t)),t}document.addEventListener("nav",()=>{for(let e of document.querySelectorAll(".note-filter")){let t=JSON.parse(e.dataset.strings??"{}");ge(e,{loader:Ue(X(e.dataset.indexPath??oe)),bookmarks:se(()=>window.localStorage),createSync:u=>ie(document,t,u),hrefFor:u=>X(u),session:()=>window.sessionStorage})}});\n';
var instances = 0;
var NoteFilter_default = ((opts) => {
  const { placeholder = 'topic is "Electronics"', caseSensitive = false } = opts ?? {};
  const Component = (props) => {
    const t = i18n(props.cfg?.locale ?? "en-US").components.noteFilter;
    const id = `note-filter-${instances++}`;
    return /* @__PURE__ */ jsxs(
      "div",
      {
        class: classNames(props.displayClass, "note-filter"),
        "data-index-path": INDEX_FILE,
        "data-case-sensitive": String(caseSensitive),
        "data-strings": JSON.stringify(t),
        children: [
          /* @__PURE__ */ jsxs("div", { class: "qf-tabs", role: "tablist", "aria-label": t.label, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                role: "tab",
                class: "qf-tab",
                id: `${id}-tab-filter`,
                "aria-controls": `${id}-filter`,
                "aria-selected": "true",
                "data-tab": "filter",
                children: t.tabFilter
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                role: "tab",
                class: "qf-tab",
                id: `${id}-tab-saved`,
                "aria-controls": `${id}-saved`,
                "aria-selected": "false",
                tabIndex: -1,
                "data-tab": "saved",
                children: [
                  t.tabSaved,
                  " ",
                  /* @__PURE__ */ jsx("span", { class: "qf-count" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              class: "qf-panel",
              role: "tabpanel",
              id: `${id}-filter`,
              "aria-labelledby": `${id}-tab-filter`,
              "data-panel": "filter",
              children: [
                /* @__PURE__ */ jsxs("div", { class: "qf-query", children: [
                  /* @__PURE__ */ jsx("pre", { class: "qf-highlight", "aria-hidden": "true" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      class: "qf-input",
                      rows: 1,
                      spellcheck: false,
                      autocomplete: "off",
                      "aria-label": t.label,
                      placeholder
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      class: "qf-case",
                      "aria-pressed": caseSensitive,
                      "aria-label": t.matchCase,
                      title: t.matchCase,
                      children: "Aa"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("p", { class: "qf-error", role: "alert", hidden: true }),
                /* @__PURE__ */ jsx("ol", { class: "qf-clauses" }),
                /* @__PURE__ */ jsxs("div", { class: "qf-status-row", children: [
                  /* @__PURE__ */ jsx("span", { class: "qf-status", "aria-live": "polite" }),
                  /* @__PURE__ */ jsxs("span", { class: "qf-actions", children: [
                    /* @__PURE__ */ jsx("button", { type: "button", class: "qf-link qf-save", children: t.save }),
                    /* @__PURE__ */ jsx("button", { type: "button", class: "qf-link qf-clear", children: t.clear })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("form", { class: "qf-save-form", hidden: true, children: [
                  /* @__PURE__ */ jsxs("label", { children: [
                    t.nameLabel,
                    /* @__PURE__ */ jsx("input", { class: "qf-name", type: "text", autocomplete: "off" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { class: "qf-replace", hidden: true }),
                  /* @__PURE__ */ jsxs("div", { class: "qf-form-actions", children: [
                    /* @__PURE__ */ jsx("button", { type: "button", class: "qf-link qf-save-cancel", children: t.cancel }),
                    /* @__PURE__ */ jsx("button", { type: "submit", class: "qf-link qf-save-confirm", children: t.save })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              class: "qf-panel",
              role: "tabpanel",
              id: `${id}-saved`,
              "aria-labelledby": `${id}-tab-saved`,
              "data-panel": "saved",
              hidden: true,
              children: [
                /* @__PURE__ */ jsx("p", { class: "qf-note qf-saved-note" }),
                /* @__PURE__ */ jsx("ul", { class: "qf-bookmarks" })
              ]
            }
          )
        ]
      }
    );
  };
  Component.css = note_filter_default;
  Component.afterDOMLoaded = note_filter_inline_default;
  return Component;
});

export { FrontmatterIndex, NoteFilter_default as NoteFilter };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map