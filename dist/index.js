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
var note_filter_default = ".note-filter {\n  margin: 0.5rem 0 1.25rem;\n  font-family: var(--bodyFont);\n  color: var(--darkgray);\n}\n.note-filter .qf-tabs {\n  display: flex;\n  gap: 1.1rem;\n  border-bottom: 1px solid var(--lightgray);\n  margin-bottom: 0.75rem;\n}\n.note-filter .qf-tab {\n  background: none;\n  border: 0;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n  padding: 0 0 0.4rem;\n  cursor: pointer;\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  color: var(--gray);\n}\n.note-filter .qf-tab:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-tab[aria-selected=true] {\n  color: var(--dark);\n  font-weight: 700;\n  border-bottom-color: var(--secondary);\n}\n.note-filter .qf-count {\n  font-family: var(--bodyFont);\n  font-weight: 400;\n  color: var(--gray);\n}\n.note-filter .qf-query {\n  position: relative;\n}\n.note-filter .qf-highlight,\n.note-filter .qf-input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0;\n  padding: 0.5rem 2.6rem 0.5rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  font-family: var(--codeFont);\n  font-size: 0.85rem;\n  font-weight: 400;\n  line-height: 1.55;\n  letter-spacing: normal;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-highlight {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  color: var(--dark);\n  background: none;\n}\n.note-filter .qf-input {\n  position: relative;\n  display: block;\n  resize: none;\n  overflow: hidden;\n  color: transparent;\n  caret-color: var(--dark);\n  background: transparent;\n  border-color: var(--lightgray);\n}\n.note-filter .qf-input::placeholder {\n  color: var(--gray);\n}\n.note-filter .qf-input:focus {\n  outline: none;\n  border-color: var(--secondary);\n  box-shadow: 0 0 0 2px var(--highlight);\n}\n.note-filter .qf-field {\n  color: var(--secondary);\n}\n.note-filter .qf-keyword,\n.note-filter .qf-op,\n.note-filter .qf-paren {\n  color: var(--gray);\n}\n.note-filter .qf-value {\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-invalid {\n  text-decoration: underline wavy;\n  text-decoration-color: var(--secondary);\n}\n.note-filter .qf-case {\n  position: absolute;\n  top: 0.35rem;\n  right: 0.35rem;\n  padding: 0.1rem 0.35rem;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-filter .qf-case:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-case[aria-pressed=true] {\n  color: var(--secondary);\n  background: var(--highlight);\n  border-color: var(--secondary);\n}\n.note-filter .qf-suggestions {\n  position: absolute;\n  top: calc(100% + 0.25rem);\n  left: 0;\n  right: 0;\n  z-index: 10;\n  max-height: 15rem;\n  overflow-y: auto;\n  margin: 0;\n  padding: 0.25rem 0;\n  list-style: none;\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 5px;\n  box-shadow: 0 4px 12px color-mix(in srgb, var(--dark) 12%, transparent);\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n}\n.note-filter .qf-suggestions[hidden] {\n  display: none;\n}\n.note-filter .qf-suggestion {\n  display: flex;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0.25rem 0.65rem;\n  cursor: pointer;\n}\n.note-filter .qf-suggestion:hover, .note-filter .qf-suggestion[aria-selected=true] {\n  background: var(--highlight);\n}\n.note-filter .qf-suggestion-label {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-suggestion-field .qf-suggestion-label {\n  color: var(--secondary);\n}\n.note-filter .qf-suggestion-detail {\n  flex-shrink: 0;\n  color: var(--gray);\n}\n.note-filter .qf-error {\n  margin: 0.4rem 0 0;\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses {\n  list-style: none;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses li {\n  margin: 0;\n}\n.note-filter .qf-clause {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.15rem 0 0.15rem 0.55rem;\n  border-left: 2px solid var(--tertiary);\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-join {\n  padding: 0.05rem 0 0.05rem 0.55rem;\n  border-left: 2px solid var(--lightgray);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove,\n.note-filter .qf-bookmark-remove {\n  flex: none;\n  background: none;\n  border: 0;\n  padding: 0 0.2rem;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove:focus-visible,\n.note-filter .qf-bookmark-remove:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-clause-remove:hover,\n.note-filter .qf-bookmark-remove:hover {\n  color: var(--dark);\n}\n.note-filter .qf-status-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 0.5rem;\n  margin-top: 0.6rem;\n  font-size: 0.8rem;\n}\n.note-filter .qf-actions,\n.note-filter .qf-form-actions {\n  display: flex;\n  gap: 0.75rem;\n}\n.note-filter .qf-form-actions {\n  justify-content: flex-end;\n}\n.note-filter .qf-link {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.note-filter .qf-link:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-link:hover {\n  text-decoration: underline;\n}\n.note-filter .qf-link:disabled {\n  color: var(--gray);\n  cursor: default;\n  text-decoration: none;\n}\n.note-filter .qf-save-form {\n  display: grid;\n  gap: 0.4rem;\n  margin-top: 0.6rem;\n  font-size: 0.85rem;\n}\n.note-filter .qf-save-form[hidden] {\n  display: none;\n}\n.note-filter .qf-save-form label {\n  display: grid;\n  gap: 0.2rem;\n}\n.note-filter .qf-save-form input {\n  font: inherit;\n  padding: 0.3rem 0.5rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  background: var(--light);\n  color: var(--dark);\n}\n.note-filter .qf-save-form input:focus {\n  outline: none;\n  border-color: var(--secondary);\n}\n.note-filter .qf-replace {\n  margin: 0;\n  color: var(--dark);\n}\n.note-filter .qf-note {\n  margin: 0.25rem 0;\n  font-size: 0.85rem;\n}\n.note-filter .qf-bookmarks {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.note-filter .qf-bookmarks li {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.note-filter .qf-bookmarks li:last-child {\n  border-bottom: 0;\n}\n.note-filter .qf-bookmark {\n  flex: 1;\n  min-width: 0;\n  padding: 0.45rem 0 0.45rem 0.5rem;\n  border: 0;\n  border-left: 2px solid transparent;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n}\n.note-filter .qf-bookmark:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-bookmark[aria-current=true] {\n  border-left-color: var(--secondary);\n}\n.note-filter .qf-bookmark[aria-current=true] .qf-bookmark-name {\n  color: var(--secondary);\n}\n.note-filter .qf-bookmark-name {\n  display: block;\n  font-size: 0.92rem;\n  font-weight: 600;\n  color: var(--dark);\n}\n.note-filter .qf-bookmark-query {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n\n.explorer .qf-hidden {\n  display: none !important;\n}\n.explorer .title-button h2[data-qf-filtered]::after {\n  content: attr(data-qf-filtered);\n  margin-left: 0.5rem;\n  font-family: var(--bodyFont);\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--secondary);\n}\n.explorer .qf-empty {\n  margin: 0.5rem 0;\n  font-size: 0.85rem;\n  color: var(--darkgray);\n}\n.explorer .qf-empty button {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.explorer .qf-empty button:hover {\n  text-decoration: underline;\n}\n.explorer .qf-empty button:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}";

// src/components/scripts/note-filter.inline.ts
var note_filter_inline_default = 'var Ke=Object.defineProperty;var We=(e,n,t)=>n in e?Ke(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var me=(e,n,t)=>We(e,typeof n!="symbol"?n+"":n,t);var At=Object.hasOwnProperty;function je(){return typeof document>"u"?"":document.body?.dataset?.basepath??""}function ne(e,n){let t=n??je(),r=e.startsWith("/")?e:"/"+e;return t+r}var Ce="static/quartz-filters/index.json";var V=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);var re="quartz-filters:bookmarks";function Ue(e){try{let n=e();if(!n)return null;let t=`${re}:probe`;return n.setItem(t,"1"),n.removeItem(t),n}catch{return null}}function Ae(e){let n=Ue(e),t=()=>{if(!n)return[];try{let o=JSON.parse(n.getItem(re)??"[]");return Array.isArray(o)?o.flatMap(u=>V(u)&&typeof u.name=="string"&&typeof u.query=="string"?[{name:u.name,query:u.query,caseSensitive:u.caseSensitive===!0}]:[]):[]}catch{return[]}},r=o=>{if(!n)return!1;try{return n.setItem(re,JSON.stringify(o)),!0}catch{return!1}};return{available:n!==null,list:t,find:o=>t().find(u=>u.name===o),save(o){let u=t(),a=u.findIndex(F=>F.name===o.name);return a>=0?u[a]=o:u.push(o),r(u)},remove(o){r(t().filter(u=>u.name!==o))}}}var S={root:"div.explorer",list:".explorer-ul",content:".explorer-content",title:".title-button h2",fileLink:"a.nav-file-title",folderHeader:".folder-container",folderOuter:".folder-outer",openClass:"open"},H="qf-hidden",oe="qf-empty",z="data-qf-opened",O="data-qf-filtered";var J=(e,n)=>Array.from(e.children).find(t=>t.matches(n))??null;function ge(e,n,t){let r=Array.from(e.querySelectorAll(S.root)),o=[],u=null,a=!1,F=()=>r.forEach(D=>E(D,u));function h(D,g){g.querySelectorAll(`.${H}`).forEach(C=>C.classList.remove(H)),g.querySelectorAll(`[${z}]`).forEach(C=>{C.classList.remove(S.openClass),C.removeAttribute(z)}),D.removeAttribute(O),D.querySelector(S.title)?.removeAttribute(O)}function E(D,g){D.querySelector(`.${oe}`)?.remove();let C=D.querySelector(S.list);if(!C)return;if(g===null){h(D,C);return}let B=Array.from(C.querySelectorAll("li")),v=0;for(let k of B){let f=J(k,S.fileLink);if(!f)continue;let d=g.has(f.getAttribute("href")??"");k.classList.toggle(H,!d),d&&v++}for(let k of B.reverse()){if(!J(k,S.folderHeader))continue;let f=Array.from(k.querySelectorAll("li")).some(m=>!m.classList.contains(H)&&J(m,S.fileLink));k.classList.toggle(H,!f);let d=J(k,S.folderOuter);f&&d&&!d.classList.contains(S.openClass)&&(d.classList.add(S.openClass),d.setAttribute(z,""))}if(D.setAttribute(O,""),D.querySelector(S.title)?.setAttribute(O,n.filtered),v===0){let k=D.ownerDocument,f=k.createElement("p");f.className=oe,f.append(`${n.noMatches} `);let d=k.createElement("button");d.type="button",d.textContent=n.clearFilter,d.onclick=t,f.append(d),(D.querySelector(S.content)??D).append(f)}}for(let D of r){let g=D.querySelector(S.list);if(!g)continue;let C=new MutationObserver(()=>{a||(a=!0,queueMicrotask(()=>{a=!1,F()}))});C.observe(g,{childList:!0,subtree:!0}),o.push(C)}return{count:r.length,apply(D){u=D,F()},disconnect(){o.forEach(D=>D.disconnect())}}}function he(e,n=t=>fetch(t)){let t=null;return{load(){return t??(t=n(e).then(async r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);let o=await r.json();if(o.version!==1||!Array.isArray(o.notes))throw new Error("Unexpected index format");return o.notes}).catch(r=>{throw t=null,r})),t}}}var Ve=new Set(["is","not","in","and","or","has","exists","contains"]),Be=/[\\p{L}\\p{N}_.:/-]/u,ze=/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z)?)?$/,Je=/^-?\\d+(\\.\\d+)?$/,Ye=new Set([\'"\',"\\u201C"]),Xe=new Set([\'"\',"\\u201D"]);function L(e){let n=[],t=0;for(;t<e.length;){let r=e[t];if(/\\s/.test(r)){t++;continue}if(r==="("||r===")"){n.push({type:r==="("?"lparen":"rparen",value:r,start:t,end:t+1}),t++;continue}if(r==="<"||r===">"){let o=e[t+1]==="="?`${r}=`:r;n.push({type:"op",value:o,start:t,end:t+o.length}),t+=o.length;continue}if(Ye.has(r)){let o=t,u="",a=!1;for(t++;t<e.length;){let F=e[t];if(F==="\\\\"&&e[t+1]===\'"\'){u+=\'"\',t+=2;continue}if(Xe.has(F)){a=!0,t++;break}u+=F,t++}if(!a)return{tokens:n,error:{message:"This quoted value has no closing quote",column:o+1}};n.push({type:"string",value:u,start:o,end:t});continue}if(Be.test(r)){let o=t;for(;t<e.length&&Be.test(e[t]);)t++;let u=e.slice(o,t),a=u.toLowerCase();ze.test(u)?n.push({type:"date",value:u,start:o,end:t}):Je.test(u)?n.push({type:"number",value:u,start:o,end:t}):a==="true"||a==="false"?n.push({type:"boolean",value:a,start:o,end:t}):Ve.has(a)?n.push({type:"keyword",value:a,start:o,end:t}):n.push({type:"word",value:u,start:o,end:t});continue}return{tokens:n,error:{message:`Unexpected character "${r}"`,column:t+1}}}return{tokens:n,error:null}}var se=(e,n)=>e?.type==="keyword"&&e.value===n,_=e=>se(e,"and")||se(e,"or");function Y(e){return e.type==="string"?`"${e.value.replace(/"/g,\'\\\\"\')}"`:e.value}function ye(e){return e.op==="has"||!e.value?`has ${e.field}`:e.op==="in"||e.op==="not in"?`${Y(e.value)} ${e.op} ${e.field}`:`${e.field} ${e.op} ${Y(e.value)}`}function xe(e,n){let{tokens:t}=L(e),r=t.findIndex(u=>u.start>=n.end);if(r<0)return null;for(;t[r]?.type==="rparen";)r++;let o=t[r];return _(o)?o.value:null}function ke(e,n){let{tokens:t}=L(e),r=t.findIndex(g=>g.start===n.start),o=t.findIndex(g=>g.end===n.end);if(r<0||o<r)return e;let u=()=>{for(;se(t[r-1],"not");)r--};for(u();t[r-1]?.type==="lparen"&&t[o+1]?.type==="rparen";)r--,o++,u();let a=t[r]?.start??n.start,F=t[o]?.end??n.end,h=t[o+1],E=t[r-1];return!(_(E)&&(!_(h)||E.value==="and"&&h.value==="or"))&&_(h)?F=t[o+2]?.start??h.end:_(E)&&(a=t[r-2]?.end??E.start),(e.slice(0,a)+e.slice(F)).trim()}var ie=/^[\\p{L}_][\\p{L}\\p{N}_.-]*$/u,Ze=new Set(["string","number","date","boolean","word"]),X=class extends Error{constructor(t){super(t.message);me(this,"detail",t)}},Qe=(e,n)=>e&&e.column<=n.column?e:n;function ae(e){let{tokens:n,error:t}=L(e),r=[],o=0,u=(s=0)=>n[o+s],a=s=>`"${e.slice(s.start,s.end)}"`,F=(s,p)=>s?.type==="keyword"&&s.value===p,h=s=>s!==void 0&&Ze.has(s.type),E=s=>s?.type==="word"&&ie.test(s.value);function D(s,p){throw new X({message:s,column:(p?.start??e.length)+1})}function g(s){return{type:s.type==="word"?"string":s.type,value:s.value}}function C(){let s=B();for(;F(u(),"or");)o++,s={kind:"or",left:s,right:B()};return s}function B(){let s=v();for(;F(u(),"and");)o++,s={kind:"and",left:s,right:v()};return s}function v(){return F(u(),"not")?(o++,{kind:"not",expr:v()}):k()}function k(){let s=u();if(s?.type==="lparen"){o++;let p=C(),x=u();return x?.type!=="rparen"?D(`Expected ")" to close the "(" at column ${s.start+1}`,x):(o++,p)}return m()}function f(s){let p=u();return E(p)?(o++,p.value):D(`Expected a field name after ${a(s)}`,p)}function d(s){let p=u();return p?.type==="keyword"?D(`${a(p)} is a keyword. Put it in quotes to use it as a value`,p):h(p)?(o++,g(p)):D(`Expected a value after ${a(s)}`,p)}function m(){let s=u();if(!s)return D("Expected a clause",s);let p=(M,R,K)=>{let q={kind:"clause",op:M,field:R,value:K,start:s.start,end:n[o-1]?.end??s.end};return r.push(q),q};if(F(s,"has"))return o++,p("has",f(s),null);if(!h(s))return D(`Expected a clause, found ${a(s)}`,s);o++;let x=u();if(F(x,"in"))return o++,p("in",f(x),g(s));let N=u(1);if(F(x,"not")&&F(N,"in"))return o+=2,p("not in",f(N),g(s));if(!E(s))return D(`Expected "in" after ${a(s)}`,x);if(F(x,"is")){o++;let M=u();return F(M,"not")?(o++,p("is not",s.value,d(M))):p("is",s.value,d(x))}return F(x,"contains")?(o++,p("contains",s.value,d(x))):x?.type==="op"?(o++,p(x.value,s.value,d(x))):F(x,"exists")?(o++,p("has",s.value,null)):D(`Expected "is", "in", "contains", a comparison or "exists" after ${a(s)}`,x)}if(n.length===0)return{ast:null,error:t,clauses:r};try{let s=C(),p=u();return p&&D(p.type==="rparen"?\'There is no "(" for this ")"\':`Expected "and" or "or" before ${a(p)}`,p),t?{ast:null,error:t,clauses:r}:{ast:s,error:null,clauses:r}}catch(s){if(s instanceof X)return{ast:null,error:Qe(t,s.detail),clauses:r};throw s}}var we=["title","path"],Ge=new Set(we),ve=e=>we.indexOf(e),et=8;function tt(e){if(!ie.test(e))return!1;let{tokens:n,error:t}=L(e);return!t&&n.length===1&&n[0].type==="word"}function Te(e){let n=new Map;for(let r of e)for(let[o,u]of Object.entries(r.fields)){if(!tt(o))continue;let a=n.get(o);a||(a={count:0,values:new Map},n.set(o,a)),a.count++;let F=new Set;for(let h of Array.isArray(u)?u:[u]){let E=String(h);if(F.has(E))continue;F.add(E);let D=a.values.get(E);D?D.count++:a.values.set(E,{value:h,text:E,count:1})}}let t=r=>(o,u)=>u.count-o.count||r(o).localeCompare(r(u));return Array.from(n,([r,{count:o,values:u}])=>({name:r,count:o,values:Array.from(u.values()).sort(t(a=>a.text))})).sort((r,o)=>ve(r.name)-ve(o.name)||t(u=>u.name)(r,o))}function Se(e){if(typeof e!="string")return String(e);let{tokens:n,error:t}=L(e),r=n[0];return!t&&n.length===1&&r.start===0&&r.end===e.length&&(r.type==="word"||r.type==="date")?e:Y({type:"string",value:e})}function ut(e,n){if(!n)return 0;let t=e.toLowerCase().indexOf(n);return t<0?null:t===0?0:1}function Z(e,n,t){return e.map((r,o)=>({item:r,index:o,r:ut(n(r),t)})).filter(r=>r.r!==null).sort((r,o)=>r.r-o.r||r.index-o.index).map(r=>r.item)}var I=(e,n)=>e?.type==="keyword"&&e.value===n,le=e=>e!==void 0&&["string","number","date","boolean","word"].includes(e.type);function nt(e){let n=e.length,t=e[n-1],r=o=>e[n-1-o];if(!t||t.type==="lparen"||I(t,"and")||I(t,"or"))return{kind:"clause"};if(I(t,"not"))return I(r(1),"is")?r(2)?.type==="word"?{kind:"value",field:r(2).value}:null:le(r(1))?null:{kind:"clause"};if(I(t,"has"))return{kind:"field"};if(I(t,"in")){let o=I(r(1),"not")?r(2):r(1);return{kind:"field",holding:le(o)?o.value:void 0}}return(I(t,"is")||I(t,"contains")||t.type==="op")&&r(1)?.type==="word"?{kind:"value",field:r(1).value}:null}var be=e=>({kind:"field",label:e.name,insert:e.name});function Le(e,n,t,r=et){let o=e.slice(0,n),u=L(o),a=u.tokens,F=n,h=!1;if(u.error){let f=u.error.column-1;if(!/["\u201C]/.test(o[f]??"")||a.some(d=>d.start>=f))return null;F=f,h=!0}else{let f=a[a.length-1];if(f&&f.end===n){if(f.type==="string")return null;(le(f)||f.type==="keyword")&&(F=f.start,a=a.slice(0,-1))}}let E=nt(a);if(!E)return null;let D=o.slice(h?F+1:F).toLowerCase(),g=L(e).tokens.find(f=>f.start===F),C=g&&g.end>n?g.end:n,B=h?[]:t,v;if(E.kind==="field"){let f=E.holding?.toLowerCase(),d=s=>f!==void 0&&s.values.some(p=>p.text.toLowerCase()===f),m=f===void 0?B:[...B.filter(d),...B.filter(s=>!d(s))];v=Z(m,s=>s.name,D).map(be)}else if(E.kind==="value"){let f=E.field.toLowerCase(),d=t.filter(m=>m.name.toLowerCase()===f).flatMap(m=>m.values).sort((m,s)=>s.count-m.count);v=Z(d,m=>m.text,D).map(m=>({kind:"value",label:m.text,insert:Se(m.value)}))}else{let f=t.filter(d=>!Ge.has(d.name)).flatMap(d=>d.values.map(m=>({field:d.name,v:m}))).sort((d,m)=>m.v.count-d.v.count);v=[...Z(B,d=>d.name,D).map(be),...Z(f,d=>d.v.text,D).map(({field:d,v:m})=>({kind:"value",label:m.text,field:d,insert:`${Se(m.value)} in ${d}`}))]}let k=e.slice(F,C);return v.some(f=>f.insert===k)?null:v.length>0?{from:F,to:C,items:v.slice(0,r)}:null}function qe(e,n,t){let r=e.slice(0,n.from)+t.insert,o=e.slice(n.to);return/^\\s/.test(o)?{query:r+o,cursor:r.length+1}:{query:`${r} ${o}`,cursor:r.length+1}}var rt=/^\\d{4}-\\d{2}-\\d{2}(T[\\d:.]+(Z|[+-]\\d{2}:\\d{2})?)?$/;function $(e,n,t){switch(e.kind){case"and":return $(e.left,n,t)&&$(e.right,n,t);case"or":return $(e.left,n,t)||$(e.right,n,t);case"not":return!$(e.expr,n,t);case"clause":return st(e,n,t.caseSensitive)}}function ot(e,n,t){if(t){let u=e[n];return u===void 0?void 0:[].concat(u)}let r=n.toLowerCase(),o;for(let[u,a]of Object.entries(e))u.toLowerCase()===r&&(o=(o??[]).concat(a));return o}function st(e,n,t){let r=ot(n,e.field,t);if(e.op==="has")return r!==void 0&&r.some(a=>a!=="");let o=e.value;if(!o)return!1;let u=()=>r?.some(a=>at(a,o,t))??!1;switch(e.op){case"is":case"in":return u();case"is not":case"not in":return!u();case"contains":return r?.some(a=>lt(a,o,t))??!1;default:return r?.some(a=>Dt(a,o,e.op))??!1}}var De=e=>Date.parse(/T[\\d:.]+$/.test(e)?`${e}Z`:e),Ne=e=>rt.test(e)&&!Number.isNaN(De(e));function Ie(e,n){if(n.length===10){let t=e.slice(0,10);return t<n?-1:t>n?1:0}return Math.sign(De(e)-De(n))}var it=(e,n,t)=>t?e===n:e.toLowerCase()===n.toLowerCase();function at(e,n,t){return n.type==="number"&&typeof e=="number"?e===Number(n.value):n.type==="date"&&typeof e=="string"&&Ne(e)?Ie(e,n.value)===0:n.type==="boolean"&&typeof e=="boolean"?e===(n.value==="true"):it(String(e),n.value,t)}function lt(e,n,t){let r=String(e);return t?r.includes(n.value):r.toLowerCase().includes(n.value.toLowerCase())}function Dt(e,n,t){let r;if(n.type==="number"&&typeof e=="number")r=Math.sign(e-Number(n.value));else if(n.type==="date"&&typeof e=="string"&&Ne(e))r=Ie(e,n.value);else return!1;switch(t){case"<":return r<0;case">":return r>0;case"<=":return r<=0;case">=":return r>=0;default:return!1}}var ct=new Set(["is","contains","exists"]),Ft=new Set(["has","in"]);function ft(e,n){let t=e[n];if(!t)return"value";if(t.type==="keyword")return"keyword";if(t.type==="op")return"op";if(t.type==="lparen"||t.type==="rparen")return"paren";if(t.type==="word"){let r=e[n-1],o=e[n+1];if(r?.type==="keyword"&&Ft.has(r.value)||o?.type==="op"||o?.type==="keyword"&&ct.has(o.value))return"field"}return"value"}function Me(e){let{tokens:n,error:t}=L(e),r=[],o=0;if(n.forEach((u,a)=>{u.start>o&&r.push({text:e.slice(o,u.start),kind:"space"}),r.push({text:e.slice(u.start,u.end),kind:ft(n,a)}),o=u.end}),o<e.length){let u=e.slice(o),a=u.length-u.trimStart().length;a>0&&r.push({text:u.slice(0,a),kind:"space"}),a<u.length&&r.push({text:u.slice(a),kind:t?"invalid":"space"})}return r}var $e="quartz-filters:query";function Re(e){try{let n=e()?.getItem($e);if(!n)return null;let t=JSON.parse(n);return!V(t)||typeof t.query!="string"?null:{query:t.query,caseSensitive:t.caseSensitive===!0}}catch{return null}}function He(e,n){try{e()?.setItem($e,JSON.stringify(n))}catch{}}var P=(e,n)=>e.replace(/\\{(\\w+)\\}/g,(t,r)=>String(n[r]??t));function Pe(e,n){let t=JSON.parse(e.dataset.strings??"{}"),r=e.ownerDocument,o=i=>{let l=e.querySelector(i);if(!l)throw new Error(`NoteFilter markup is missing ${i}`);return l},u={tabs:Array.from(e.querySelectorAll(\'[role="tab"]\')),panels:Array.from(e.querySelectorAll(\'[role="tabpanel"]\')),input:o(".qf-input"),highlight:o(".qf-highlight"),suggestions:o(".qf-suggestions"),caseToggle:o(".qf-case"),error:o(".qf-error"),clauses:o(".qf-clauses"),status:o(".qf-status"),save:o(".qf-save"),clear:o(".qf-clear"),form:o(".qf-save-form"),name:o(".qf-name"),replace:o(".qf-replace"),confirm:o(".qf-save-confirm"),cancel:o(".qf-save-cancel"),count:o(".qf-count"),savedNote:o(".qf-saved-note"),bookmarkList:o(".qf-bookmarks")},a=!0,F=null,h=null,E=null,D=0,g=!1,C="idle",B=ae(""),v=null,k=null,f,d=[],m=n.createSync(()=>j(""));function s(i,l,c){i.addEventListener(l,c),d.push(()=>i.removeEventListener(l,c))}let p=()=>u.caseToggle.getAttribute("aria-pressed")==="true",x=i=>u.caseToggle.setAttribute("aria-pressed",String(i)),N=()=>u.input.value.trim();function M(){C==="loading"||C==="ready"||(C="loading",W(),n.loader.load().then(i=>{a&&(F=i,h=Te(i),C="ready",fe(),q())},()=>{a&&(C="failed",W())}))}function R(){clearTimeout(f),B=ae(u.input.value),B.error||(v=B.ast),K(),_e(),u.error.hidden=B.error===null,u.error.textContent=B.error?P(t.errorAt,{message:B.error.message,column:B.error.column}):"",u.save.disabled=!n.bookmarks.available||!N(),u.clear.disabled=!u.input.value,G(),N()&&M(),fe(),He(n.session,{query:u.input.value,caseSensitive:p()})}function K(){u.highlight.replaceChildren(...Me(u.input.value).map(i=>{let l=r.createElement("span");return l.className=`qf-${i.kind}`,l.textContent=i.text,l})),u.highlight.append(`\n`),u.input.style.height="auto",u.input.scrollHeight>0&&(u.input.style.height=`${u.input.scrollHeight}px`)}function q(){let i=u.input.selectionStart??u.input.value.length;E=h!==null&&!g&&r.activeElement===u.input&&h?Le(u.input.value,i,h):null,D=0,Q()}function Q(){let i=E?.items??[];u.suggestions.hidden=i.length===0,u.suggestions.replaceChildren(...i.map((c,y)=>{let A=r.createElement("li");A.className=`qf-suggestion qf-suggestion-${c.kind}`,A.id=`${u.suggestions.id}-${y}`,A.dataset.index=String(y),A.setAttribute("role","option"),A.setAttribute("aria-selected",String(y===D));let b=r.createElement("span");b.className="qf-suggestion-label",b.textContent=c.label,A.append(b);let w=c.kind==="field"?t.suggestionField:c.field?P(t.suggestionIn,{field:c.field}):"";if(w){let T=r.createElement("span");T.className="qf-suggestion-detail",T.textContent=w,A.append(T)}return A}));let l=u.suggestions.children[D];l?(u.input.setAttribute("aria-activedescendant",l.id),l.scrollIntoView?.({block:"nearest"})):u.input.removeAttribute("aria-activedescendant")}function ce(i){let l=E?.items[i];if(!E||!l)return;let c=qe(u.input.value,E,l);u.input.value=c.query,u.input.setSelectionRange(c.cursor,c.cursor),Fe()}function Fe(){g=!1,K(),clearTimeout(f),f=setTimeout(R,n.debounceMs??150),q()}function _e(){let i=[];B.clauses.forEach((l,c)=>{let y=ye(l),A=r.createElement("li");A.className="qf-clause";let b=r.createElement("span");b.textContent=y;let w=r.createElement("button");w.type="button",w.className="qf-clause-remove",w.dataset.clause=String(c),w.textContent="\\xD7",w.setAttribute("aria-label",`${t.removeClause}: ${y}`),A.append(b,w),i.push(A);let T=c<B.clauses.length-1?xe(u.input.value,l):null;if(T){let U=r.createElement("li");U.className="qf-join",U.setAttribute("aria-hidden","true"),U.textContent=T,i.push(U)}}),u.clauses.replaceChildren(...i)}function fe(){let i=v;if(!F||!i){m.apply(null),W();return}let l={caseSensitive:p()},c=F.filter(y=>$(i,y.fields,l));m.apply(new Set(c.map(y=>n.hrefFor(y.path)))),W(c.length)}function W(i){let l="";C==="loading"?l=t.loading:C==="failed"?l=t.loadFailed:F&&i!==void 0?l=P(t.matched,{matched:i,total:F.length}):F&&(l=P(t.total,{total:F.length})),m.count===0&&C!=="failed"&&(l=l?`${l} ${t.noExplorer}`:t.noExplorer),u.status.textContent=l}function de(i){return i.find(l=>l.query===N()&&l.caseSensitive===p())}function G(){let i=n.bookmarks.list(),l=de(i);u.count.textContent=i.length>0?String(i.length):"",u.savedNote.textContent=n.bookmarks.available?t.savedEmpty:t.savingOff,u.savedNote.hidden=n.bookmarks.available&&i.length>0,u.bookmarkList.replaceChildren(...i.map(c=>{let y=r.createElement("li"),A=r.createElement("button");A.type="button",A.className="qf-bookmark",A.dataset.name=c.name,c===l&&A.setAttribute("aria-current","true");let b=r.createElement("span");b.className="qf-bookmark-name",b.textContent=c.name;let w=r.createElement("span");w.className="qf-bookmark-query",w.textContent=c.query,A.append(b,w);let T=r.createElement("button");return T.type="button",T.className="qf-bookmark-remove",T.dataset.name=c.name,T.textContent="\\xD7",T.setAttribute("aria-label",P(t.deleteBookmark,{name:c.name})),y.append(A,T),y}))}function j(i){u.input.value=i,R(),q()}function ee(i,l=!1){for(let c of u.tabs){let y=c.dataset.tab===i;c.setAttribute("aria-selected",String(y)),c.tabIndex=y?0:-1,y&&l&&c.focus()}for(let c of u.panels)c.hidden=c.dataset.panel!==i}function te(){k=null,u.replace.hidden=!0,u.replace.textContent="",u.confirm.textContent=t.save}function pe(){te(),u.form.hidden=!0}u.tabs.forEach((i,l)=>{s(i,"click",()=>ee(i.dataset.tab??"filter")),s(i,"keydown",c=>{let A={ArrowRight:l+1,ArrowLeft:l-1,Home:0,End:u.tabs.length-1}[c.key];if(A===void 0)return;c.preventDefault();let b=u.tabs[(A+u.tabs.length)%u.tabs.length];b&&ee(b.dataset.tab??"filter",!0)})}),s(u.input,"input",Fe),s(u.input,"keydown",i=>{let l=E?.items.length??0;if(i.key===" "&&i.ctrlKey||i.key==="ArrowDown"&&l===0){g=!1,q(),(E||i.key===" ")&&i.preventDefault();return}if(l>0){let c={ArrowDown:1,ArrowUp:-1}[i.key];if(c!==void 0){i.preventDefault(),D=(D+c+l)%l,Q();return}if(i.key==="Enter"||i.key==="Tab"&&!i.shiftKey){i.preventDefault(),ce(D);return}if(i.key==="Escape"){i.preventDefault(),g=!0,q();return}}i.key==="Enter"&&i.preventDefault()}),s(u.input,"click",q),s(u.input,"keyup",i=>{["ArrowLeft","ArrowRight","Home","End"].includes(i.key)&&q()}),s(u.input,"focus",()=>{M(),q()}),s(u.input,"blur",()=>{E=null,Q()}),s(u.suggestions,"mousedown",i=>i.preventDefault()),s(u.suggestions,"click",i=>{let l=i.target.closest(".qf-suggestion");l&&(ce(Number(l.dataset.index)),u.input.focus())}),s(u.caseToggle,"click",()=>{x(!p()),R()}),s(u.clear,"click",()=>{j(""),u.input.focus()}),s(u.clauses,"click",i=>{let l=i.target.closest(".qf-clause-remove"),c=l?B.clauses[Number(l.dataset.clause)]:void 0;c&&(j(ke(u.input.value,c)),u.input.focus())}),s(u.save,"click",()=>{N()&&(te(),u.form.hidden=!1,u.name.value=de(n.bookmarks.list())?.name??N(),u.name.focus(),u.name.select())}),s(u.cancel,"click",pe),s(u.name,"input",te),s(u.form,"submit",i=>{i.preventDefault();let l=u.name.value.trim();if(l){if(k!==l&&n.bookmarks.find(l)){k=l,u.replace.textContent=P(t.replacePrompt,{name:l}),u.replace.hidden=!1,u.confirm.textContent=t.replace;return}n.bookmarks.save({name:l,query:N(),caseSensitive:p()})&&(pe(),G())}}),s(u.bookmarkList,"click",i=>{let l=i.target,c=l.closest(".qf-bookmark-remove");if(c?.dataset.name!==void 0){n.bookmarks.remove(c.dataset.name),G();return}let y=l.closest(".qf-bookmark"),A=y?.dataset.name!==void 0?n.bookmarks.find(y.dataset.name):void 0;A&&(x(A.caseSensitive),j(A.query),ee("filter"))});let ue=Re(n.session);u.input.value=ue?.query??"",x(ue?ue.caseSensitive:e.dataset.caseSensitive==="true"),R();let Ee=()=>{a=!1,clearTimeout(f),d.forEach(i=>i()),m.disconnect()};return typeof window.addCleanup=="function"&&window.addCleanup(Ee),Ee}var Oe=new Map;function dt(e){let n=Oe.get(e);return n||(n=he(e),Oe.set(e,n)),n}document.addEventListener("nav",()=>{for(let e of document.querySelectorAll(".note-filter")){let n=JSON.parse(e.dataset.strings??"{}");Pe(e,{loader:dt(ne(e.dataset.indexPath??Ce)),bookmarks:Ae(()=>window.localStorage),createSync:t=>ge(document,n,t),hrefFor:t=>ne(t),session:()=>window.sessionStorage})}});\n';
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