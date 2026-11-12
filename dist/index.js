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
var WIKILINK = /^\[\[([^[\]|#]*)(?:#[^[\]|]*)?(?:\|([^[\]]*))?\]\]$/;
function unwrapLink(value) {
  const link = WIKILINK.exec(value.trim());
  if (!link) return value;
  return (link[2] || link[1] || value).trim();
}
function normalizeScalar(value) {
  if (typeof value === "string") return unwrapLink(value);
  if (typeof value === "boolean") return value;
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
      savingOff: "Saving is off in this browser.",
      suggestions: "Suggestions",
      suggestionField: "field",
      suggestionIn: "in {field}"
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
var note_filter_default = ".note-filter {\n  margin: 0.5rem 0 1.25rem;\n  font-family: var(--bodyFont);\n  color: var(--darkgray);\n}\n.note-filter .qf-tabs {\n  display: flex;\n  gap: 1.1rem;\n  border-bottom: 1px solid var(--lightgray);\n  margin-bottom: 0.75rem;\n}\n.note-filter .qf-tab {\n  background: none;\n  border: 0;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n  padding: 0 0 0.4rem;\n  cursor: pointer;\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  color: var(--gray);\n}\n.note-filter .qf-tab:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-tab[aria-selected=true] {\n  color: var(--dark);\n  font-weight: 700;\n  border-bottom-color: var(--secondary);\n}\n.note-filter .qf-count {\n  font-family: var(--bodyFont);\n  font-weight: 400;\n  color: var(--gray);\n}\n.note-filter .qf-query {\n  position: relative;\n}\n.note-filter .qf-highlight,\n.note-filter .qf-input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0;\n  padding: 0.5rem 2.6rem 0.5rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  font-family: var(--codeFont);\n  font-size: 0.85rem;\n  font-weight: 400;\n  line-height: 1.55;\n  letter-spacing: normal;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-highlight {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  color: var(--dark);\n  background: none;\n}\n.note-filter .qf-input {\n  position: relative;\n  display: block;\n  resize: none;\n  overflow: hidden;\n  color: transparent;\n  caret-color: var(--dark);\n  background: transparent;\n  border-color: var(--lightgray);\n}\n.note-filter .qf-input::placeholder {\n  color: var(--gray);\n}\n.note-filter .qf-input:focus {\n  outline: none;\n  border-color: var(--secondary);\n  box-shadow: 0 0 0 2px var(--highlight);\n}\n.note-filter .qf-field {\n  color: var(--secondary);\n}\n.note-filter .qf-keyword,\n.note-filter .qf-op,\n.note-filter .qf-paren {\n  color: var(--gray);\n}\n.note-filter .qf-value {\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-invalid {\n  text-decoration: underline wavy;\n  text-decoration-color: var(--secondary);\n}\n.note-filter .qf-case {\n  position: absolute;\n  top: 0.35rem;\n  right: 0.35rem;\n  padding: 0.1rem 0.35rem;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-filter .qf-case:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-case[aria-pressed=true] {\n  color: var(--secondary);\n  background: var(--highlight);\n  border-color: var(--secondary);\n}\n.note-filter .qf-suggestions {\n  position: absolute;\n  top: calc(100% + 0.25rem);\n  left: 0;\n  right: 0;\n  z-index: 10;\n  max-height: 15rem;\n  overflow-y: auto;\n  margin: 0;\n  padding: 0.25rem 0;\n  list-style: none;\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 5px;\n  box-shadow: 0 4px 12px color-mix(in srgb, var(--dark) 12%, transparent);\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n}\n.note-filter .qf-suggestions[hidden] {\n  display: none;\n}\n.note-filter .qf-suggestion {\n  display: flex;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0.25rem 0.65rem;\n  cursor: pointer;\n}\n.note-filter .qf-suggestion:hover, .note-filter .qf-suggestion[aria-selected=true] {\n  background: var(--highlight);\n}\n.note-filter .qf-suggestion-label {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-suggestion-field .qf-suggestion-label {\n  color: var(--secondary);\n}\n.note-filter .qf-suggestion-detail {\n  flex-shrink: 0;\n  color: var(--gray);\n}\n.note-filter .qf-error {\n  margin: 0.4rem 0 0;\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses {\n  list-style: none;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses li {\n  margin: 0;\n}\n.note-filter .qf-clause {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.15rem 0 0.15rem 0.55rem;\n  border-left: 2px solid var(--tertiary);\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-join {\n  padding: 0.05rem 0 0.05rem 0.55rem;\n  border-left: 2px solid var(--lightgray);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove,\n.note-filter .qf-bookmark-remove {\n  flex: none;\n  background: none;\n  border: 0;\n  padding: 0 0.2rem;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove:focus-visible,\n.note-filter .qf-bookmark-remove:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-clause-remove:hover,\n.note-filter .qf-bookmark-remove:hover {\n  color: var(--dark);\n}\n.note-filter .qf-status-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 0.5rem;\n  margin-top: 0.6rem;\n  font-size: 0.8rem;\n}\n.note-filter .qf-actions,\n.note-filter .qf-form-actions {\n  display: flex;\n  gap: 0.75rem;\n}\n.note-filter .qf-form-actions {\n  justify-content: flex-end;\n}\n.note-filter .qf-link {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.note-filter .qf-link:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-link:hover {\n  text-decoration: underline;\n}\n.note-filter .qf-link:disabled {\n  color: var(--gray);\n  cursor: default;\n  text-decoration: none;\n}\n.note-filter .qf-save-form {\n  display: grid;\n  gap: 0.4rem;\n  margin-top: 0.6rem;\n  font-size: 0.85rem;\n}\n.note-filter .qf-save-form[hidden] {\n  display: none;\n}\n.note-filter .qf-save-form label {\n  display: grid;\n  gap: 0.2rem;\n}\n.note-filter .qf-save-form input {\n  font: inherit;\n  padding: 0.3rem 0.5rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  background: var(--light);\n  color: var(--dark);\n}\n.note-filter .qf-save-form input:focus {\n  outline: none;\n  border-color: var(--secondary);\n}\n.note-filter .qf-replace {\n  margin: 0;\n  color: var(--dark);\n}\n.note-filter .qf-note {\n  margin: 0.25rem 0;\n  font-size: 0.85rem;\n}\n.note-filter .qf-bookmarks {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.note-filter .qf-bookmarks li {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.note-filter .qf-bookmarks li:last-child {\n  border-bottom: 0;\n}\n.note-filter .qf-bookmark {\n  flex: 1;\n  min-width: 0;\n  padding: 0.45rem 0 0.45rem 0.5rem;\n  border: 0;\n  border-left: 2px solid transparent;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n}\n.note-filter .qf-bookmark:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-bookmark[aria-current=true] {\n  border-left-color: var(--secondary);\n}\n.note-filter .qf-bookmark[aria-current=true] .qf-bookmark-name {\n  color: var(--secondary);\n}\n.note-filter .qf-bookmark-name {\n  display: block;\n  font-size: 0.92rem;\n  font-weight: 600;\n  color: var(--dark);\n}\n.note-filter .qf-bookmark-query {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n\n@media (max-width: 800px) {\n  .sidebar:has(.explorer) .note-filter:not(.qf-docked) {\n    display: none;\n  }\n  .explorer .explorer-content > .note-filter {\n    margin: 0 1rem 1rem;\n  }\n}\n.explorer .qf-hidden {\n  display: none !important;\n}\n.explorer .title-button h2[data-qf-filtered]::after {\n  content: attr(data-qf-filtered);\n  margin-left: 0.5rem;\n  font-family: var(--bodyFont);\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--secondary);\n}\n.explorer .qf-empty {\n  margin: 0.5rem 0;\n  font-size: 0.85rem;\n  color: var(--darkgray);\n}\n.explorer .qf-empty button {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.explorer .qf-empty button:hover {\n  text-decoration: underline;\n}\n.explorer .qf-empty button:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}";

// src/components/scripts/note-filter.inline.ts
var note_filter_inline_default = 'var ze=Object.defineProperty;var Ye=(e,n,t)=>n in e?ze(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var Ae=(e,n,t)=>Ye(e,typeof n!="symbol"?n+"":n,t);var xt=Object.hasOwnProperty;function Je(){return typeof document>"u"?"":document.body?.dataset?.basepath??""}function re(e,n){let t=n??Je(),r=e.startsWith("/")?e:"/"+e;return t+r}var ge="static/quartz-filters/index.json";var z=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);var oe="quartz-filters:bookmarks";function Qe(e){try{let n=e();if(!n)return null;let t=`${oe}:probe`;return n.setItem(t,"1"),n.removeItem(t),n}catch{return null}}function he(e){let n=Qe(e),t=()=>{if(!n)return[];try{let o=JSON.parse(n.getItem(oe)??"[]");return Array.isArray(o)?o.flatMap(u=>z(u)&&typeof u.name=="string"&&typeof u.query=="string"?[{name:u.name,query:u.query,caseSensitive:u.caseSensitive===!0}]:[]):[]}catch{return[]}},r=o=>{if(!n)return!1;try{return n.setItem(oe,JSON.stringify(o)),!0}catch{return!1}};return{available:n!==null,list:t,find:o=>t().find(u=>u.name===o),save(o){let u=t(),a=u.findIndex(F=>F.name===o.name);return a>=0?u[a]=o:u.push(o),r(u)},remove(o){r(t().filter(u=>u.name!==o))}}}var v={root:"div.explorer",list:".explorer-ul",content:".explorer-content",title:".title-button h2",fileLink:"a.nav-file-title",folderHeader:".folder-container",folderOuter:".folder-outer",openClass:"open"},H="qf-hidden",se="qf-empty",Y="data-qf-opened",_="data-qf-filtered";var J=(e,n)=>Array.from(e.children).find(t=>t.matches(n))??null;function ye(e,n,t){let r=Array.from(e.querySelectorAll(v.root)),o=[],u=null,a=!1,F=()=>r.forEach(D=>E(D,u));function h(D,g){g.querySelectorAll(`.${H}`).forEach(C=>C.classList.remove(H)),g.querySelectorAll(`[${Y}]`).forEach(C=>{C.classList.remove(v.openClass),C.removeAttribute(Y)}),D.removeAttribute(_),D.querySelector(v.title)?.removeAttribute(_)}function E(D,g){D.querySelector(`.${se}`)?.remove();let C=D.querySelector(v.list);if(!C)return;if(g===null){h(D,C);return}let y=Array.from(C.querySelectorAll("li")),S=0;for(let k of y){let f=J(k,v.fileLink);if(!f)continue;let d=g.has(f.getAttribute("href")??"");k.classList.toggle(H,!d),d&&S++}for(let k of y.reverse()){if(!J(k,v.folderHeader))continue;let f=Array.from(k.querySelectorAll("li")).some(m=>!m.classList.contains(H)&&J(m,v.fileLink));k.classList.toggle(H,!f);let d=J(k,v.folderOuter);f&&d&&!d.classList.contains(v.openClass)&&(d.classList.add(v.openClass),d.setAttribute(Y,""))}if(D.setAttribute(_,""),D.querySelector(v.title)?.setAttribute(_,n.filtered),S===0){let k=D.ownerDocument,f=k.createElement("p");f.className=se,f.append(`${n.noMatches} `);let d=k.createElement("button");d.type="button",d.textContent=n.clearFilter,d.onclick=t,f.append(d),(D.querySelector(v.content)??D).append(f)}}for(let D of r){let g=D.querySelector(v.list);if(!g)continue;let C=new MutationObserver(()=>{a||(a=!0,queueMicrotask(()=>{a=!1,F()}))});C.observe(g,{childList:!0,subtree:!0}),o.push(C)}return{count:r.length,apply(D){u=D,F()},disconnect(){o.forEach(D=>D.disconnect())}}}function Be(e,n=t=>fetch(t)){let t=null;return{load(){return t??(t=n(e).then(async r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);let o=await r.json();if(o.version!==1||!Array.isArray(o.notes))throw new Error("Unexpected index format");return o.notes}).catch(r=>{throw t=null,r})),t}}}var ke="(max-width: 800px)",xe="qf-docked";function ve(e,n){let t=e.closest(".sidebar")?.querySelector(`${v.root} ${v.content}`);if(!t)return()=>{};let r=e.ownerDocument.createComment("note-filter");e.before(r);let o=()=>{r.after(e),e.classList.remove(xe)},u=()=>{if(!n.matches)return o();let a=Array.from(t.children).find(F=>F.matches(v.list));t.insertBefore(e,a??t.firstChild),e.classList.add(xe)};return u(),n.addEventListener("change",u),()=>{n.removeEventListener("change",u),o(),r.remove()}}var Xe=new Set(["is","not","in","and","or","has","exists","contains"]),Se=/[\\p{L}\\p{N}_.:/-]/u,Ze=/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z)?)?$/,Ge=/^-?\\d+(\\.\\d+)?$/,et=new Set([\'"\',"\\u201C"]),tt=new Set([\'"\',"\\u201D"]);function T(e){let n=[],t=0;for(;t<e.length;){let r=e[t];if(/\\s/.test(r)){t++;continue}if(r==="("||r===")"){n.push({type:r==="("?"lparen":"rparen",value:r,start:t,end:t+1}),t++;continue}if(r==="<"||r===">"){let o=e[t+1]==="="?`${r}=`:r;n.push({type:"op",value:o,start:t,end:t+o.length}),t+=o.length;continue}if(et.has(r)){let o=t,u="",a=!1;for(t++;t<e.length;){let F=e[t];if(F==="\\\\"&&e[t+1]===\'"\'){u+=\'"\',t+=2;continue}if(tt.has(F)){a=!0,t++;break}u+=F,t++}if(!a)return{tokens:n,error:{message:"This quoted value has no closing quote",column:o+1}};n.push({type:"string",value:u,start:o,end:t});continue}if(Se.test(r)){let o=t;for(;t<e.length&&Se.test(e[t]);)t++;let u=e.slice(o,t),a=u.toLowerCase();Ze.test(u)?n.push({type:"date",value:u,start:o,end:t}):Ge.test(u)?n.push({type:"number",value:u,start:o,end:t}):a==="true"||a==="false"?n.push({type:"boolean",value:a,start:o,end:t}):Xe.has(a)?n.push({type:"keyword",value:a,start:o,end:t}):n.push({type:"word",value:u,start:o,end:t});continue}return{tokens:n,error:{message:`Unexpected character "${r}"`,column:t+1}}}return{tokens:n,error:null}}var ie=(e,n)=>e?.type==="keyword"&&e.value===n,K=e=>ie(e,"and")||ie(e,"or");function Q(e){return e.type==="string"?`"${e.value.replace(/"/g,\'\\\\"\')}"`:e.value}function be(e){return e.op==="has"||!e.value?`has ${e.field}`:e.op==="in"||e.op==="not in"?`${Q(e.value)} ${e.op} ${e.field}`:`${e.field} ${e.op} ${Q(e.value)}`}function Le(e,n){let{tokens:t}=T(e),r=t.findIndex(u=>u.start>=n.end);if(r<0)return null;for(;t[r]?.type==="rparen";)r++;let o=t[r];return K(o)?o.value:null}function we(e,n){let{tokens:t}=T(e),r=t.findIndex(g=>g.start===n.start),o=t.findIndex(g=>g.end===n.end);if(r<0||o<r)return e;let u=()=>{for(;ie(t[r-1],"not");)r--};for(u();t[r-1]?.type==="lparen"&&t[o+1]?.type==="rparen";)r--,o++,u();let a=t[r]?.start??n.start,F=t[o]?.end??n.end,h=t[o+1],E=t[r-1];return!(K(E)&&(!K(h)||E.value==="and"&&h.value==="or"))&&K(h)?F=t[o+2]?.start??h.end:K(E)&&(a=t[r-2]?.end??E.start),(e.slice(0,a)+e.slice(F)).trim()}var ae=/^[\\p{L}_][\\p{L}\\p{N}_.-]*$/u,ut=new Set(["string","number","date","boolean","word"]),X=class extends Error{constructor(t){super(t.message);Ae(this,"detail",t)}},nt=(e,n)=>e&&e.column<=n.column?e:n;function le(e){let{tokens:n,error:t}=T(e),r=[],o=0,u=(s=0)=>n[o+s],a=s=>`"${e.slice(s.start,s.end)}"`,F=(s,p)=>s?.type==="keyword"&&s.value===p,h=s=>s!==void 0&&ut.has(s.type),E=s=>s?.type==="word"&&ae.test(s.value);function D(s,p){throw new X({message:s,column:(p?.start??e.length)+1})}function g(s){return{type:s.type==="word"?"string":s.type,value:s.value}}function C(){let s=y();for(;F(u(),"or");)o++,s={kind:"or",left:s,right:y()};return s}function y(){let s=S();for(;F(u(),"and");)o++,s={kind:"and",left:s,right:S()};return s}function S(){return F(u(),"not")?(o++,{kind:"not",expr:S()}):k()}function k(){let s=u();if(s?.type==="lparen"){o++;let p=C(),x=u();return x?.type!=="rparen"?D(`Expected ")" to close the "(" at column ${s.start+1}`,x):(o++,p)}return m()}function f(s){let p=u();return E(p)?(o++,p.value):D(`Expected a field name after ${a(s)}`,p)}function d(s){let p=u();return p?.type==="keyword"?D(`${a(p)} is a keyword. Put it in quotes to use it as a value`,p):h(p)?(o++,g(p)):D(`Expected a value after ${a(s)}`,p)}function m(){let s=u();if(!s)return D("Expected a clause",s);let p=(M,$,W)=>{let O={kind:"clause",op:M,field:$,value:W,start:s.start,end:n[o-1]?.end??s.end};return r.push(O),O};if(F(s,"has"))return o++,p("has",f(s),null);if(!h(s))return D(`Expected a clause, found ${a(s)}`,s);o++;let x=u();if(F(x,"in"))return o++,p("in",f(x),g(s));let q=u(1);if(F(x,"not")&&F(q,"in"))return o+=2,p("not in",f(q),g(s));if(!E(s))return D(`Expected "in" after ${a(s)}`,x);if(F(x,"is")){o++;let M=u();return F(M,"not")?(o++,p("is not",s.value,d(M))):p("is",s.value,d(x))}return F(x,"contains")?(o++,p("contains",s.value,d(x))):x?.type==="op"?(o++,p(x.value,s.value,d(x))):F(x,"exists")?(o++,p("has",s.value,null)):D(`Expected "is", "in", "contains", a comparison or "exists" after ${a(s)}`,x)}if(n.length===0)return{ast:null,error:t,clauses:r};try{let s=C(),p=u();return p&&D(p.type==="rparen"?\'There is no "(" for this ")"\':`Expected "and" or "or" before ${a(p)}`,p),t?{ast:null,error:t,clauses:r}:{ast:s,error:null,clauses:r}}catch(s){if(s instanceof X)return{ast:null,error:nt(t,s.detail),clauses:r};throw s}}var Ne=["title","path"],rt=new Set(Ne),Te=e=>Ne.indexOf(e),ot=8;function st(e){if(!ae.test(e))return!1;let{tokens:n,error:t}=T(e);return!t&&n.length===1&&n[0].type==="word"}function Me(e){let n=new Map;for(let r of e)for(let[o,u]of Object.entries(r.fields)){if(!st(o))continue;let a=n.get(o);a||(a={count:0,values:new Map},n.set(o,a)),a.count++;let F=new Set;for(let h of Array.isArray(u)?u:[u]){let E=String(h);if(F.has(E))continue;F.add(E);let D=a.values.get(E);D?D.count++:a.values.set(E,{value:h,text:E,count:1})}}let t=r=>(o,u)=>u.count-o.count||r(o).localeCompare(r(u));return Array.from(n,([r,{count:o,values:u}])=>({name:r,count:o,values:Array.from(u.values()).sort(t(a=>a.text))})).sort((r,o)=>Te(r.name)-Te(o.name)||t(u=>u.name)(r,o))}function qe(e){if(typeof e!="string")return String(e);let{tokens:n,error:t}=T(e),r=n[0];return!t&&n.length===1&&r.start===0&&r.end===e.length&&(r.type==="word"||r.type==="date")?e:Q({type:"string",value:e})}function it(e,n){if(!n)return 0;let t=e.toLowerCase().indexOf(n);return t<0?null:t===0?0:1}function Z(e,n,t){return e.map((r,o)=>({item:r,index:o,r:it(n(r),t)})).filter(r=>r.r!==null).sort((r,o)=>r.r-o.r||r.index-o.index).map(r=>r.item)}var I=(e,n)=>e?.type==="keyword"&&e.value===n,De=e=>e!==void 0&&["string","number","date","boolean","word"].includes(e.type);function at(e){let n=e.length,t=e[n-1],r=o=>e[n-1-o];if(!t||t.type==="lparen"||I(t,"and")||I(t,"or"))return{kind:"clause"};if(I(t,"not"))return I(r(1),"is")?r(2)?.type==="word"?{kind:"value",field:r(2).value}:null:De(r(1))?null:{kind:"clause"};if(I(t,"has"))return{kind:"field"};if(I(t,"in")){let o=I(r(1),"not")?r(2):r(1);return{kind:"field",holding:De(o)?o.value:void 0}}return(I(t,"is")||I(t,"contains")||t.type==="op")&&r(1)?.type==="word"?{kind:"value",field:r(1).value}:null}var Ie=e=>({kind:"field",label:e.name,insert:e.name});function Re(e,n,t,r=ot){let o=e.slice(0,n),u=T(o),a=u.tokens,F=n,h=!1;if(u.error){let f=u.error.column-1;if(!/["\u201C]/.test(o[f]??"")||a.some(d=>d.start>=f))return null;F=f,h=!0}else{let f=a[a.length-1];if(f&&f.end===n){if(f.type==="string")return null;(De(f)||f.type==="keyword")&&(F=f.start,a=a.slice(0,-1))}}let E=at(a);if(!E)return null;let D=o.slice(h?F+1:F).toLowerCase(),g=T(e).tokens.find(f=>f.start===F),C=g&&g.end>n?g.end:n,y=h?[]:t,S;if(E.kind==="field"){let f=E.holding?.toLowerCase(),d=s=>f!==void 0&&s.values.some(p=>p.text.toLowerCase()===f),m=f===void 0?y:[...y.filter(d),...y.filter(s=>!d(s))];S=Z(m,s=>s.name,D).map(Ie)}else if(E.kind==="value"){let f=E.field.toLowerCase(),d=t.filter(m=>m.name.toLowerCase()===f).flatMap(m=>m.values).sort((m,s)=>s.count-m.count);S=Z(d,m=>m.text,D).map(m=>({kind:"value",label:m.text,insert:qe(m.value)}))}else{let f=t.filter(d=>!rt.has(d.name)).flatMap(d=>d.values.map(m=>({field:d.name,v:m}))).sort((d,m)=>m.v.count-d.v.count);S=[...Z(y,d=>d.name,D).map(Ie),...Z(f,d=>d.v.text,D).map(({field:d,v:m})=>({kind:"value",label:m.text,field:d,insert:`${qe(m.value)} in ${d}`}))]}let k=e.slice(F,C);return S.some(f=>f.insert===k)?null:S.length>0?{from:F,to:C,items:S.slice(0,r)}:null}function $e(e,n,t){let r=e.slice(0,n.from)+t.insert,o=e.slice(n.to);return/^\\s/.test(o)?{query:r+o,cursor:r.length+1}:{query:`${r} ${o}`,cursor:r.length+1}}var lt=/^\\d{4}-\\d{2}-\\d{2}(T[\\d:.]+(Z|[+-]\\d{2}:\\d{2})?)?$/;function R(e,n,t){switch(e.kind){case"and":return R(e.left,n,t)&&R(e.right,n,t);case"or":return R(e.left,n,t)||R(e.right,n,t);case"not":return!R(e.expr,n,t);case"clause":return ct(e,n,t.caseSensitive)}}function Dt(e,n,t){if(t){let u=e[n];return u===void 0?void 0:[].concat(u)}let r=n.toLowerCase(),o;for(let[u,a]of Object.entries(e))u.toLowerCase()===r&&(o=(o??[]).concat(a));return o}function ct(e,n,t){let r=Dt(n,e.field,t);if(e.op==="has")return r!==void 0&&r.some(a=>a!=="");let o=e.value;if(!o)return!1;let u=()=>r?.some(a=>ft(a,o,t))??!1;switch(e.op){case"is":case"in":return u();case"is not":case"not in":return!u();case"contains":return r?.some(a=>dt(a,o,t))??!1;default:return r?.some(a=>pt(a,o,e.op))??!1}}var ce=e=>Date.parse(/T[\\d:.]+$/.test(e)?`${e}Z`:e),Oe=e=>lt.test(e)&&!Number.isNaN(ce(e));function He(e,n){if(n.length===10){let t=e.slice(0,10);return t<n?-1:t>n?1:0}return Math.sign(ce(e)-ce(n))}var Ft=(e,n,t)=>t?e===n:e.toLowerCase()===n.toLowerCase();function ft(e,n,t){return n.type==="number"&&typeof e=="number"?e===Number(n.value):n.type==="date"&&typeof e=="string"&&Oe(e)?He(e,n.value)===0:n.type==="boolean"&&typeof e=="boolean"?e===(n.value==="true"):Ft(String(e),n.value,t)}function dt(e,n,t){let r=String(e);return t?r.includes(n.value):r.toLowerCase().includes(n.value.toLowerCase())}function pt(e,n,t){let r;if(n.type==="number"&&typeof e=="number")r=Math.sign(e-Number(n.value));else if(n.type==="date"&&typeof e=="string"&&Oe(e))r=He(e,n.value);else return!1;switch(t){case"<":return r<0;case">":return r>0;case"<=":return r<=0;case">=":return r>=0;default:return!1}}var Et=new Set(["is","contains","exists"]),mt=new Set(["has","in"]);function Ct(e,n){let t=e[n];if(!t)return"value";if(t.type==="keyword")return"keyword";if(t.type==="op")return"op";if(t.type==="lparen"||t.type==="rparen")return"paren";if(t.type==="word"){let r=e[n-1],o=e[n+1];if(r?.type==="keyword"&&mt.has(r.value)||o?.type==="op"||o?.type==="keyword"&&Et.has(o.value))return"field"}return"value"}function Pe(e){let{tokens:n,error:t}=T(e),r=[],o=0;if(n.forEach((u,a)=>{u.start>o&&r.push({text:e.slice(o,u.start),kind:"space"}),r.push({text:e.slice(u.start,u.end),kind:Ct(n,a)}),o=u.end}),o<e.length){let u=e.slice(o),a=u.length-u.trimStart().length;a>0&&r.push({text:u.slice(0,a),kind:"space"}),a<u.length&&r.push({text:u.slice(a),kind:t?"invalid":"space"})}return r}var _e="quartz-filters:query";function Ke(e){try{let n=e()?.getItem(_e);if(!n)return null;let t=JSON.parse(n);return!z(t)||typeof t.query!="string"?null:{query:t.query,caseSensitive:t.caseSensitive===!0}}catch{return null}}function We(e,n){try{e()?.setItem(_e,JSON.stringify(n))}catch{}}var P=(e,n)=>e.replace(/\\{(\\w+)\\}/g,(t,r)=>String(n[r]??t));function je(e,n){let t=JSON.parse(e.dataset.strings??"{}"),r=e.ownerDocument,o=i=>{let l=e.querySelector(i);if(!l)throw new Error(`NoteFilter markup is missing ${i}`);return l},u={tabs:Array.from(e.querySelectorAll(\'[role="tab"]\')),panels:Array.from(e.querySelectorAll(\'[role="tabpanel"]\')),input:o(".qf-input"),highlight:o(".qf-highlight"),suggestions:o(".qf-suggestions"),caseToggle:o(".qf-case"),error:o(".qf-error"),clauses:o(".qf-clauses"),status:o(".qf-status"),save:o(".qf-save"),clear:o(".qf-clear"),form:o(".qf-save-form"),name:o(".qf-name"),replace:o(".qf-replace"),confirm:o(".qf-save-confirm"),cancel:o(".qf-save-cancel"),count:o(".qf-count"),savedNote:o(".qf-saved-note"),bookmarkList:o(".qf-bookmarks")},a=!0,F=null,h=null,E=null,D=0,g=!1,C="idle",y=le(""),S=null,k=null,f,d=[],m=n.createSync(()=>U(""));function s(i,l,c){i.addEventListener(l,c),d.push(()=>i.removeEventListener(l,c))}let p=()=>u.caseToggle.getAttribute("aria-pressed")==="true",x=i=>u.caseToggle.setAttribute("aria-pressed",String(i)),q=()=>u.input.value.trim();function M(){C==="loading"||C==="ready"||(C="loading",j(),n.loader.load().then(i=>{a&&(F=i,h=Me(i),C="ready",de(),N())},()=>{a&&(C="failed",j())}))}function $(){clearTimeout(f),y=le(u.input.value),y.error||(S=y.ast),W(),Ve(),u.error.hidden=y.error===null,u.error.textContent=y.error?P(t.errorAt,{message:y.error.message,column:y.error.column}):"",u.save.disabled=!n.bookmarks.available||!q(),u.clear.disabled=!u.input.value,ee(),q()&&M(),de(),We(n.session,{query:u.input.value,caseSensitive:p()})}function W(){u.highlight.replaceChildren(...Pe(u.input.value).map(i=>{let l=r.createElement("span");return l.className=`qf-${i.kind}`,l.textContent=i.text,l})),u.highlight.append(`\n`),O()}function O(){u.input.style.height="auto",u.input.scrollHeight>0&&(u.input.style.height=`${u.input.scrollHeight}px`)}function N(){let i=u.input.selectionStart??u.input.value.length;E=h!==null&&!g&&r.activeElement===u.input&&h?Re(u.input.value,i,h):null,D=0,G()}function G(){let i=E?.items??[];u.suggestions.hidden=i.length===0,u.suggestions.replaceChildren(...i.map((c,B)=>{let A=r.createElement("li");A.className=`qf-suggestion qf-suggestion-${c.kind}`,A.id=`${u.suggestions.id}-${B}`,A.dataset.index=String(B),A.setAttribute("role","option"),A.setAttribute("aria-selected",String(B===D));let b=r.createElement("span");b.className="qf-suggestion-label",b.textContent=c.label,A.append(b);let L=c.kind==="field"?t.suggestionField:c.field?P(t.suggestionIn,{field:c.field}):"";if(L){let w=r.createElement("span");w.className="qf-suggestion-detail",w.textContent=L,A.append(w)}return A}));let l=u.suggestions.children[D];l?(u.input.setAttribute("aria-activedescendant",l.id),l.scrollIntoView?.({block:"nearest"})):u.input.removeAttribute("aria-activedescendant")}function Fe(i){let l=E?.items[i];if(!E||!l)return;let c=$e(u.input.value,E,l);u.input.value=c.query,u.input.setSelectionRange(c.cursor,c.cursor),fe()}function fe(){g=!1,W(),clearTimeout(f),f=setTimeout($,n.debounceMs??150),N()}function Ve(){let i=[];y.clauses.forEach((l,c)=>{let B=be(l),A=r.createElement("li");A.className="qf-clause";let b=r.createElement("span");b.textContent=B;let L=r.createElement("button");L.type="button",L.className="qf-clause-remove",L.dataset.clause=String(c),L.textContent="\\xD7",L.setAttribute("aria-label",`${t.removeClause}: ${B}`),A.append(b,L),i.push(A);let w=c<y.clauses.length-1?Le(u.input.value,l):null;if(w){let V=r.createElement("li");V.className="qf-join",V.setAttribute("aria-hidden","true"),V.textContent=w,i.push(V)}}),u.clauses.replaceChildren(...i)}function de(){let i=S;if(!F||!i){m.apply(null),j();return}let l={caseSensitive:p()},c=F.filter(B=>R(i,B.fields,l));m.apply(new Set(c.map(B=>n.hrefFor(B.path)))),j(c.length)}function j(i){let l="";C==="loading"?l=t.loading:C==="failed"?l=t.loadFailed:F&&i!==void 0?l=P(t.matched,{matched:i,total:F.length}):F&&(l=P(t.total,{total:F.length})),m.count===0&&C!=="failed"&&(l=l?`${l} ${t.noExplorer}`:t.noExplorer),u.status.textContent=l}function pe(i){return i.find(l=>l.query===q()&&l.caseSensitive===p())}function ee(){let i=n.bookmarks.list(),l=pe(i);u.count.textContent=i.length>0?String(i.length):"",u.savedNote.textContent=n.bookmarks.available?t.savedEmpty:t.savingOff,u.savedNote.hidden=n.bookmarks.available&&i.length>0,u.bookmarkList.replaceChildren(...i.map(c=>{let B=r.createElement("li"),A=r.createElement("button");A.type="button",A.className="qf-bookmark",A.dataset.name=c.name,c===l&&A.setAttribute("aria-current","true");let b=r.createElement("span");b.className="qf-bookmark-name",b.textContent=c.name;let L=r.createElement("span");L.className="qf-bookmark-query",L.textContent=c.query,A.append(b,L);let w=r.createElement("button");return w.type="button",w.className="qf-bookmark-remove",w.dataset.name=c.name,w.textContent="\\xD7",w.setAttribute("aria-label",P(t.deleteBookmark,{name:c.name})),B.append(A,w),B}))}function U(i){u.input.value=i,$(),N()}function te(i,l=!1){for(let c of u.tabs){let B=c.dataset.tab===i;c.setAttribute("aria-selected",String(B)),c.tabIndex=B?0:-1,B&&l&&c.focus()}for(let c of u.panels)c.hidden=c.dataset.panel!==i;i==="filter"&&O()}function ue(){k=null,u.replace.hidden=!0,u.replace.textContent="",u.confirm.textContent=t.save}function Ee(){ue(),u.form.hidden=!0}u.tabs.forEach((i,l)=>{s(i,"click",()=>te(i.dataset.tab??"filter")),s(i,"keydown",c=>{let A={ArrowRight:l+1,ArrowLeft:l-1,Home:0,End:u.tabs.length-1}[c.key];if(A===void 0)return;c.preventDefault();let b=u.tabs[(A+u.tabs.length)%u.tabs.length];b&&te(b.dataset.tab??"filter",!0)})}),s(u.input,"input",fe),s(u.input,"keydown",i=>{let l=E?.items.length??0;if(i.key===" "&&i.ctrlKey||i.key==="ArrowDown"&&l===0){g=!1,N(),(E||i.key===" ")&&i.preventDefault();return}if(l>0){let c={ArrowDown:1,ArrowUp:-1}[i.key];if(c!==void 0){i.preventDefault(),D=(D+c+l)%l,G();return}if(i.key==="Enter"||i.key==="Tab"&&!i.shiftKey){i.preventDefault(),Fe(D);return}if(i.key==="Escape"){i.preventDefault(),g=!0,N();return}}i.key==="Enter"&&i.preventDefault()}),s(u.input,"click",N),s(u.input,"keyup",i=>{["ArrowLeft","ArrowRight","Home","End"].includes(i.key)&&N()}),s(u.input,"focus",()=>{M(),N()}),s(u.input,"blur",()=>{E=null,G()}),s(u.suggestions,"mousedown",i=>i.preventDefault()),s(u.suggestions,"click",i=>{let l=i.target.closest(".qf-suggestion");l&&(Fe(Number(l.dataset.index)),u.input.focus())}),s(u.caseToggle,"click",()=>{x(!p()),$()}),s(u.clear,"click",()=>{U(""),u.input.focus()}),s(u.clauses,"click",i=>{let l=i.target.closest(".qf-clause-remove"),c=l?y.clauses[Number(l.dataset.clause)]:void 0;c&&(U(we(u.input.value,c)),u.input.focus())}),s(u.save,"click",()=>{q()&&(ue(),u.form.hidden=!1,u.name.value=pe(n.bookmarks.list())?.name??q(),u.name.focus(),u.name.select())}),s(u.cancel,"click",Ee),s(u.name,"input",ue),s(u.form,"submit",i=>{i.preventDefault();let l=u.name.value.trim();if(l){if(k!==l&&n.bookmarks.find(l)){k=l,u.replace.textContent=P(t.replacePrompt,{name:l}),u.replace.hidden=!1,u.confirm.textContent=t.replace;return}n.bookmarks.save({name:l,query:q(),caseSensitive:p()})&&(Ee(),ee())}}),s(u.bookmarkList,"click",i=>{let l=i.target,c=l.closest(".qf-bookmark-remove");if(c?.dataset.name!==void 0){n.bookmarks.remove(c.dataset.name),ee();return}let B=l.closest(".qf-bookmark"),A=B?.dataset.name!==void 0?n.bookmarks.find(B.dataset.name):void 0;A&&(x(A.caseSensitive),U(A.query),te("filter"))});let ne=Ke(n.session);u.input.value=ne?.query??"",x(ne?ne.caseSensitive:e.dataset.caseSensitive==="true"),$();let me=typeof ResizeObserver=="function"?new ResizeObserver(()=>O()):null;me?.observe(u.input);let Ce=()=>{a=!1,clearTimeout(f),d.forEach(i=>i()),m.disconnect(),me?.disconnect()};return typeof window.addCleanup=="function"&&window.addCleanup(Ce),Ce}var Ue=new Map;function At(e){let n=Ue.get(e);return n||(n=Be(e),Ue.set(e,n)),n}document.addEventListener("nav",()=>{for(let e of document.querySelectorAll(".note-filter")){let n=JSON.parse(e.dataset.strings??"{}"),t=ve(e,window.matchMedia(ke));typeof window.addCleanup=="function"&&window.addCleanup(t),je(e,{loader:At(re(e.dataset.indexPath??ge)),bookmarks:he(()=>window.localStorage),createSync:r=>ye(document,n,r),hrefFor:r=>re(r),session:()=>window.sessionStorage})}});\n';
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
                      placeholder,
                      "aria-autocomplete": "list",
                      "aria-controls": `${id}-suggestions`
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
                  ),
                  /* @__PURE__ */ jsx(
                    "ul",
                    {
                      class: "qf-suggestions",
                      role: "listbox",
                      id: `${id}-suggestions`,
                      "aria-label": t.suggestions,
                      hidden: true
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