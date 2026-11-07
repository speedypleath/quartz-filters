import { createRequire } from 'module';
import { jsxs, jsx } from 'preact/jsx-runtime';

createRequire(import.meta.url);

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

// src/index-format.ts
var INDEX_FILE = "static/quartz-filters/index.json";

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/styles/note-filter.scss
var note_filter_default = ".note-filter {\n  margin: 0.5rem 0 1.25rem;\n  font-family: var(--bodyFont);\n  color: var(--darkgray);\n}\n.note-filter .qf-tabs {\n  display: flex;\n  gap: 1.1rem;\n  border-bottom: 1px solid var(--lightgray);\n  margin-bottom: 0.75rem;\n}\n.note-filter .qf-tab {\n  background: none;\n  border: 0;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n  padding: 0 0 0.4rem;\n  cursor: pointer;\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  color: var(--gray);\n}\n.note-filter .qf-tab:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-tab[aria-selected=true] {\n  color: var(--dark);\n  font-weight: 700;\n  border-bottom-color: var(--secondary);\n}\n.note-filter .qf-count {\n  font-family: var(--bodyFont);\n  font-weight: 400;\n  color: var(--gray);\n}\n.note-filter .qf-query {\n  position: relative;\n}\n.note-filter .qf-highlight,\n.note-filter .qf-input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0;\n  padding: 0.5rem 2.6rem 0.5rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  font-family: var(--codeFont);\n  font-size: 0.85rem;\n  font-weight: 400;\n  line-height: 1.55;\n  letter-spacing: normal;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-highlight {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  color: var(--dark);\n  background: none;\n}\n.note-filter .qf-input {\n  position: relative;\n  display: block;\n  resize: none;\n  overflow: hidden;\n  color: transparent;\n  caret-color: var(--dark);\n  background: transparent;\n  border-color: var(--lightgray);\n}\n.note-filter .qf-input::placeholder {\n  color: var(--gray);\n}\n.note-filter .qf-input:focus {\n  outline: none;\n  border-color: var(--secondary);\n  box-shadow: 0 0 0 2px var(--highlight);\n}\n.note-filter .qf-field {\n  color: var(--secondary);\n}\n.note-filter .qf-keyword,\n.note-filter .qf-op,\n.note-filter .qf-paren {\n  color: var(--gray);\n}\n.note-filter .qf-value {\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-invalid {\n  text-decoration: underline wavy;\n  text-decoration-color: var(--secondary);\n}\n.note-filter .qf-case {\n  position: absolute;\n  top: 0.35rem;\n  right: 0.35rem;\n  padding: 0.1rem 0.35rem;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-filter .qf-case:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-case[aria-pressed=true] {\n  color: var(--secondary);\n  background: var(--highlight);\n  border-color: var(--secondary);\n}\n.note-filter .qf-suggestions {\n  position: absolute;\n  top: calc(100% + 0.25rem);\n  left: 0;\n  right: 0;\n  z-index: 10;\n  max-height: 15rem;\n  overflow-y: auto;\n  margin: 0;\n  padding: 0.25rem 0;\n  list-style: none;\n  background: var(--light);\n  border: 1px solid var(--lightgray);\n  border-radius: 5px;\n  box-shadow: 0 4px 12px color-mix(in srgb, var(--dark) 12%, transparent);\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n}\n.note-filter .qf-suggestions[hidden] {\n  display: none;\n}\n.note-filter .qf-suggestion {\n  display: flex;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0.25rem 0.65rem;\n  cursor: pointer;\n}\n.note-filter .qf-suggestion:hover, .note-filter .qf-suggestion[aria-selected=true] {\n  background: var(--highlight);\n}\n.note-filter .qf-suggestion-label {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-suggestion-field .qf-suggestion-label {\n  color: var(--secondary);\n}\n.note-filter .qf-suggestion-detail {\n  flex-shrink: 0;\n  color: var(--gray);\n}\n.note-filter .qf-error {\n  margin: 0.4rem 0 0;\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses {\n  list-style: none;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses li {\n  margin: 0;\n}\n.note-filter .qf-clause {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.15rem 0 0.15rem 0.55rem;\n  border-left: 2px solid var(--tertiary);\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-join {\n  padding: 0.05rem 0 0.05rem 0.55rem;\n  border-left: 2px solid var(--lightgray);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove,\n.note-filter .qf-bookmark-remove {\n  flex: none;\n  background: none;\n  border: 0;\n  padding: 0 0.2rem;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove:focus-visible,\n.note-filter .qf-bookmark-remove:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-clause-remove:hover,\n.note-filter .qf-bookmark-remove:hover {\n  color: var(--dark);\n}\n.note-filter .qf-status-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 0.5rem;\n  margin-top: 0.6rem;\n  font-size: 0.8rem;\n}\n.note-filter .qf-actions,\n.note-filter .qf-form-actions {\n  display: flex;\n  gap: 0.75rem;\n}\n.note-filter .qf-form-actions {\n  justify-content: flex-end;\n}\n.note-filter .qf-link {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.note-filter .qf-link:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-link:hover {\n  text-decoration: underline;\n}\n.note-filter .qf-link:disabled {\n  color: var(--gray);\n  cursor: default;\n  text-decoration: none;\n}\n.note-filter .qf-save-form {\n  display: grid;\n  gap: 0.4rem;\n  margin-top: 0.6rem;\n  font-size: 0.85rem;\n}\n.note-filter .qf-save-form[hidden] {\n  display: none;\n}\n.note-filter .qf-save-form label {\n  display: grid;\n  gap: 0.2rem;\n}\n.note-filter .qf-save-form input {\n  font: inherit;\n  padding: 0.3rem 0.5rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  background: var(--light);\n  color: var(--dark);\n}\n.note-filter .qf-save-form input:focus {\n  outline: none;\n  border-color: var(--secondary);\n}\n.note-filter .qf-replace {\n  margin: 0;\n  color: var(--dark);\n}\n.note-filter .qf-note {\n  margin: 0.25rem 0;\n  font-size: 0.85rem;\n}\n.note-filter .qf-bookmarks {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.note-filter .qf-bookmarks li {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.note-filter .qf-bookmarks li:last-child {\n  border-bottom: 0;\n}\n.note-filter .qf-bookmark {\n  flex: 1;\n  min-width: 0;\n  padding: 0.45rem 0 0.45rem 0.5rem;\n  border: 0;\n  border-left: 2px solid transparent;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n}\n.note-filter .qf-bookmark:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-bookmark[aria-current=true] {\n  border-left-color: var(--secondary);\n}\n.note-filter .qf-bookmark[aria-current=true] .qf-bookmark-name {\n  color: var(--secondary);\n}\n.note-filter .qf-bookmark-name {\n  display: block;\n  font-size: 0.92rem;\n  font-weight: 600;\n  color: var(--dark);\n}\n.note-filter .qf-bookmark-query {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n\n.explorer .qf-hidden {\n  display: none !important;\n}\n.explorer .title-button h2[data-qf-filtered]::after {\n  content: attr(data-qf-filtered);\n  margin-left: 0.5rem;\n  font-family: var(--bodyFont);\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--secondary);\n}\n.explorer .qf-empty {\n  margin: 0.5rem 0;\n  font-size: 0.85rem;\n  color: var(--darkgray);\n}\n.explorer .qf-empty button {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.explorer .qf-empty button:hover {\n  text-decoration: underline;\n}\n.explorer .qf-empty button:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}";

// src/components/scripts/note-filter.inline.ts
var note_filter_inline_default = 'var We=Object.defineProperty;var je=(e,n,t)=>n in e?We(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var Ce=(e,n,t)=>je(e,typeof n!="symbol"?n+"":n,t);var gt=Object.hasOwnProperty;function Ue(){return typeof document>"u"?"":document.body?.dataset?.basepath??""}function re(e,n){let t=n??Ue(),r=e.startsWith("/")?e:"/"+e;return t+r}var Ae="static/quartz-filters/index.json";var z=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);var oe="quartz-filters:bookmarks";function Ve(e){try{let n=e();if(!n)return null;let t=`${oe}:probe`;return n.setItem(t,"1"),n.removeItem(t),n}catch{return null}}function ge(e){let n=Ve(e),t=()=>{if(!n)return[];try{let o=JSON.parse(n.getItem(oe)??"[]");return Array.isArray(o)?o.flatMap(u=>z(u)&&typeof u.name=="string"&&typeof u.query=="string"?[{name:u.name,query:u.query,caseSensitive:u.caseSensitive===!0}]:[]):[]}catch{return[]}},r=o=>{if(!n)return!1;try{return n.setItem(oe,JSON.stringify(o)),!0}catch{return!1}};return{available:n!==null,list:t,find:o=>t().find(u=>u.name===o),save(o){let u=t(),a=u.findIndex(F=>F.name===o.name);return a>=0?u[a]=o:u.push(o),r(u)},remove(o){r(t().filter(u=>u.name!==o))}}}var S={root:"div.explorer",list:".explorer-ul",content:".explorer-content",title:".title-button h2",fileLink:"a.nav-file-title",folderHeader:".folder-container",folderOuter:".folder-outer",openClass:"open"},H="qf-hidden",ie="qf-empty",J="data-qf-opened",_="data-qf-filtered";var Y=(e,n)=>Array.from(e.children).find(t=>t.matches(n))??null;function he(e,n,t){let r=Array.from(e.querySelectorAll(S.root)),o=[],u=null,a=!1,F=()=>r.forEach(D=>E(D,u));function h(D,g){g.querySelectorAll(`.${H}`).forEach(C=>C.classList.remove(H)),g.querySelectorAll(`[${J}]`).forEach(C=>{C.classList.remove(S.openClass),C.removeAttribute(J)}),D.removeAttribute(_),D.querySelector(S.title)?.removeAttribute(_)}function E(D,g){D.querySelector(`.${ie}`)?.remove();let C=D.querySelector(S.list);if(!C)return;if(g===null){h(D,C);return}let B=Array.from(C.querySelectorAll("li")),v=0;for(let k of B){let f=Y(k,S.fileLink);if(!f)continue;let d=g.has(f.getAttribute("href")??"");k.classList.toggle(H,!d),d&&v++}for(let k of B.reverse()){if(!Y(k,S.folderHeader))continue;let f=Array.from(k.querySelectorAll("li")).some(m=>!m.classList.contains(H)&&Y(m,S.fileLink));k.classList.toggle(H,!f);let d=Y(k,S.folderOuter);f&&d&&!d.classList.contains(S.openClass)&&(d.classList.add(S.openClass),d.setAttribute(J,""))}if(D.setAttribute(_,""),D.querySelector(S.title)?.setAttribute(_,n.filtered),v===0){let k=D.ownerDocument,f=k.createElement("p");f.className=ie,f.append(`${n.noMatches} `);let d=k.createElement("button");d.type="button",d.textContent=n.clearFilter,d.onclick=t,f.append(d),(D.querySelector(S.content)??D).append(f)}}for(let D of r){let g=D.querySelector(S.list);if(!g)continue;let C=new MutationObserver(()=>{a||(a=!0,queueMicrotask(()=>{a=!1,F()}))});C.observe(g,{childList:!0,subtree:!0}),o.push(C)}return{count:r.length,apply(D){u=D,F()},disconnect(){o.forEach(D=>D.disconnect())}}}function Be(e,n=t=>fetch(t)){let t=null;return{load(){return t??(t=n(e).then(async r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);let o=await r.json();if(o.version!==1||!Array.isArray(o.notes))throw new Error("Unexpected index format");return o.notes}).catch(r=>{throw t=null,r})),t}}}var ze=new Set(["is","not","in","and","or","has","exists","contains"]),ye=/[\\p{L}\\p{N}_.:/-]/u,Je=/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z)?)?$/,Ye=/^-?\\d+(\\.\\d+)?$/,Xe=new Set([\'"\',"\\u201C"]),Ze=new Set([\'"\',"\\u201D"]);function L(e){let n=[],t=0;for(;t<e.length;){let r=e[t];if(/\\s/.test(r)){t++;continue}if(r==="("||r===")"){n.push({type:r==="("?"lparen":"rparen",value:r,start:t,end:t+1}),t++;continue}if(r==="<"||r===">"){let o=e[t+1]==="="?`${r}=`:r;n.push({type:"op",value:o,start:t,end:t+o.length}),t+=o.length;continue}if(Xe.has(r)){let o=t,u="",a=!1;for(t++;t<e.length;){let F=e[t];if(F==="\\\\"&&e[t+1]===\'"\'){u+=\'"\',t+=2;continue}if(Ze.has(F)){a=!0,t++;break}u+=F,t++}if(!a)return{tokens:n,error:{message:"This quoted value has no closing quote",column:o+1}};n.push({type:"string",value:u,start:o,end:t});continue}if(ye.test(r)){let o=t;for(;t<e.length&&ye.test(e[t]);)t++;let u=e.slice(o,t),a=u.toLowerCase();Je.test(u)?n.push({type:"date",value:u,start:o,end:t}):Ye.test(u)?n.push({type:"number",value:u,start:o,end:t}):a==="true"||a==="false"?n.push({type:"boolean",value:a,start:o,end:t}):ze.has(a)?n.push({type:"keyword",value:a,start:o,end:t}):n.push({type:"word",value:u,start:o,end:t});continue}return{tokens:n,error:{message:`Unexpected character "${r}"`,column:t+1}}}return{tokens:n,error:null}}var se=(e,n)=>e?.type==="keyword"&&e.value===n,K=e=>se(e,"and")||se(e,"or");function X(e){return e.type==="string"?`"${e.value.replace(/"/g,\'\\\\"\')}"`:e.value}function xe(e){return e.op==="has"||!e.value?`has ${e.field}`:e.op==="in"||e.op==="not in"?`${X(e.value)} ${e.op} ${e.field}`:`${e.field} ${e.op} ${X(e.value)}`}function ke(e,n){let{tokens:t}=L(e),r=t.findIndex(u=>u.start>=n.end);if(r<0)return null;for(;t[r]?.type==="rparen";)r++;let o=t[r];return K(o)?o.value:null}function ve(e,n){let{tokens:t}=L(e),r=t.findIndex(g=>g.start===n.start),o=t.findIndex(g=>g.end===n.end);if(r<0||o<r)return e;let u=()=>{for(;se(t[r-1],"not");)r--};for(u();t[r-1]?.type==="lparen"&&t[o+1]?.type==="rparen";)r--,o++,u();let a=t[r]?.start??n.start,F=t[o]?.end??n.end,h=t[o+1],E=t[r-1];return!(K(E)&&(!K(h)||E.value==="and"&&h.value==="or"))&&K(h)?F=t[o+2]?.start??h.end:K(E)&&(a=t[r-2]?.end??E.start),(e.slice(0,a)+e.slice(F)).trim()}var ae=/^[\\p{L}_][\\p{L}\\p{N}_.-]*$/u,Qe=new Set(["string","number","date","boolean","word"]),Z=class extends Error{constructor(t){super(t.message);Ce(this,"detail",t)}},Ge=(e,n)=>e&&e.column<=n.column?e:n;function le(e){let{tokens:n,error:t}=L(e),r=[],o=0,u=(i=0)=>n[o+i],a=i=>`"${e.slice(i.start,i.end)}"`,F=(i,p)=>i?.type==="keyword"&&i.value===p,h=i=>i!==void 0&&Qe.has(i.type),E=i=>i?.type==="word"&&ae.test(i.value);function D(i,p){throw new Z({message:i,column:(p?.start??e.length)+1})}function g(i){return{type:i.type==="word"?"string":i.type,value:i.value}}function C(){let i=B();for(;F(u(),"or");)o++,i={kind:"or",left:i,right:B()};return i}function B(){let i=v();for(;F(u(),"and");)o++,i={kind:"and",left:i,right:v()};return i}function v(){return F(u(),"not")?(o++,{kind:"not",expr:v()}):k()}function k(){let i=u();if(i?.type==="lparen"){o++;let p=C(),x=u();return x?.type!=="rparen"?D(`Expected ")" to close the "(" at column ${i.start+1}`,x):(o++,p)}return m()}function f(i){let p=u();return E(p)?(o++,p.value):D(`Expected a field name after ${a(i)}`,p)}function d(i){let p=u();return p?.type==="keyword"?D(`${a(p)} is a keyword. Put it in quotes to use it as a value`,p):h(p)?(o++,g(p)):D(`Expected a value after ${a(i)}`,p)}function m(){let i=u();if(!i)return D("Expected a clause",i);let p=(M,R,W)=>{let O={kind:"clause",op:M,field:R,value:W,start:i.start,end:n[o-1]?.end??i.end};return r.push(O),O};if(F(i,"has"))return o++,p("has",f(i),null);if(!h(i))return D(`Expected a clause, found ${a(i)}`,i);o++;let x=u();if(F(x,"in"))return o++,p("in",f(x),g(i));let q=u(1);if(F(x,"not")&&F(q,"in"))return o+=2,p("not in",f(q),g(i));if(!E(i))return D(`Expected "in" after ${a(i)}`,x);if(F(x,"is")){o++;let M=u();return F(M,"not")?(o++,p("is not",i.value,d(M))):p("is",i.value,d(x))}return F(x,"contains")?(o++,p("contains",i.value,d(x))):x?.type==="op"?(o++,p(x.value,i.value,d(x))):F(x,"exists")?(o++,p("has",i.value,null)):D(`Expected "is", "in", "contains", a comparison or "exists" after ${a(i)}`,x)}if(n.length===0)return{ast:null,error:t,clauses:r};try{let i=C(),p=u();return p&&D(p.type==="rparen"?\'There is no "(" for this ")"\':`Expected "and" or "or" before ${a(p)}`,p),t?{ast:null,error:t,clauses:r}:{ast:i,error:null,clauses:r}}catch(i){if(i instanceof Z)return{ast:null,error:Ge(t,i.detail),clauses:r};throw i}}var Te=["title","path"],et=new Set(Te),Se=e=>Te.indexOf(e),tt=8;function ut(e){if(!ae.test(e))return!1;let{tokens:n,error:t}=L(e);return!t&&n.length===1&&n[0].type==="word"}function Le(e){let n=new Map;for(let r of e)for(let[o,u]of Object.entries(r.fields)){if(!ut(o))continue;let a=n.get(o);a||(a={count:0,values:new Map},n.set(o,a)),a.count++;let F=new Set;for(let h of Array.isArray(u)?u:[u]){let E=String(h);if(F.has(E))continue;F.add(E);let D=a.values.get(E);D?D.count++:a.values.set(E,{value:h,text:E,count:1})}}let t=r=>(o,u)=>u.count-o.count||r(o).localeCompare(r(u));return Array.from(n,([r,{count:o,values:u}])=>({name:r,count:o,values:Array.from(u.values()).sort(t(a=>a.text))})).sort((r,o)=>Se(r.name)-Se(o.name)||t(u=>u.name)(r,o))}function be(e){if(typeof e!="string")return String(e);let{tokens:n,error:t}=L(e),r=n[0];return!t&&n.length===1&&r.start===0&&r.end===e.length&&(r.type==="word"||r.type==="date")?e:X({type:"string",value:e})}function nt(e,n){if(!n)return 0;let t=e.toLowerCase().indexOf(n);return t<0?null:t===0?0:1}function Q(e,n,t){return e.map((r,o)=>({item:r,index:o,r:nt(n(r),t)})).filter(r=>r.r!==null).sort((r,o)=>r.r-o.r||r.index-o.index).map(r=>r.item)}var N=(e,n)=>e?.type==="keyword"&&e.value===n,De=e=>e!==void 0&&["string","number","date","boolean","word"].includes(e.type);function rt(e){let n=e.length,t=e[n-1],r=o=>e[n-1-o];if(!t||t.type==="lparen"||N(t,"and")||N(t,"or"))return{kind:"clause"};if(N(t,"not"))return N(r(1),"is")?r(2)?.type==="word"?{kind:"value",field:r(2).value}:null:De(r(1))?null:{kind:"clause"};if(N(t,"has"))return{kind:"field"};if(N(t,"in")){let o=N(r(1),"not")?r(2):r(1);return{kind:"field",holding:De(o)?o.value:void 0}}return(N(t,"is")||N(t,"contains")||t.type==="op")&&r(1)?.type==="word"?{kind:"value",field:r(1).value}:null}var we=e=>({kind:"field",label:e.name,insert:e.name});function qe(e,n,t,r=tt){let o=e.slice(0,n),u=L(o),a=u.tokens,F=n,h=!1;if(u.error){let f=u.error.column-1;if(!/["\u201C]/.test(o[f]??"")||a.some(d=>d.start>=f))return null;F=f,h=!0}else{let f=a[a.length-1];if(f&&f.end===n){if(f.type==="string")return null;(De(f)||f.type==="keyword")&&(F=f.start,a=a.slice(0,-1))}}let E=rt(a);if(!E)return null;let D=o.slice(h?F+1:F).toLowerCase(),g=L(e).tokens.find(f=>f.start===F),C=g&&g.end>n?g.end:n,B=h?[]:t,v;if(E.kind==="field"){let f=E.holding?.toLowerCase(),d=i=>f!==void 0&&i.values.some(p=>p.text.toLowerCase()===f),m=f===void 0?B:[...B.filter(d),...B.filter(i=>!d(i))];v=Q(m,i=>i.name,D).map(we)}else if(E.kind==="value"){let f=E.field.toLowerCase(),d=t.filter(m=>m.name.toLowerCase()===f).flatMap(m=>m.values).sort((m,i)=>i.count-m.count);v=Q(d,m=>m.text,D).map(m=>({kind:"value",label:m.text,insert:be(m.value)}))}else{let f=t.filter(d=>!et.has(d.name)).flatMap(d=>d.values.map(m=>({field:d.name,v:m}))).sort((d,m)=>m.v.count-d.v.count);v=[...Q(B,d=>d.name,D).map(we),...Q(f,d=>d.v.text,D).map(({field:d,v:m})=>({kind:"value",label:m.text,field:d,insert:`${be(m.value)} in ${d}`}))]}let k=e.slice(F,C);return v.some(f=>f.insert===k)?null:v.length>0?{from:F,to:C,items:v.slice(0,r)}:null}function Ne(e,n,t){let r=e.slice(0,n.from)+t.insert,o=e.slice(n.to);return/^\\s/.test(o)?{query:r+o,cursor:r.length+1}:{query:`${r} ${o}`,cursor:r.length+1}}var ot=/^\\d{4}-\\d{2}-\\d{2}(T[\\d:.]+(Z|[+-]\\d{2}:\\d{2})?)?$/;function $(e,n,t){switch(e.kind){case"and":return $(e.left,n,t)&&$(e.right,n,t);case"or":return $(e.left,n,t)||$(e.right,n,t);case"not":return!$(e.expr,n,t);case"clause":return st(e,n,t.caseSensitive)}}function it(e,n,t){if(t){let u=e[n];return u===void 0?void 0:[].concat(u)}let r=n.toLowerCase(),o;for(let[u,a]of Object.entries(e))u.toLowerCase()===r&&(o=(o??[]).concat(a));return o}function st(e,n,t){let r=it(n,e.field,t);if(e.op==="has")return r!==void 0&&r.some(a=>a!=="");let o=e.value;if(!o)return!1;let u=()=>r?.some(a=>lt(a,o,t))??!1;switch(e.op){case"is":case"in":return u();case"is not":case"not in":return!u();case"contains":return r?.some(a=>Dt(a,o,t))??!1;default:return r?.some(a=>ct(a,o,e.op))??!1}}var ce=e=>Date.parse(/T[\\d:.]+$/.test(e)?`${e}Z`:e),Ie=e=>ot.test(e)&&!Number.isNaN(ce(e));function Me(e,n){if(n.length===10){let t=e.slice(0,10);return t<n?-1:t>n?1:0}return Math.sign(ce(e)-ce(n))}var at=(e,n,t)=>t?e===n:e.toLowerCase()===n.toLowerCase();function lt(e,n,t){return n.type==="number"&&typeof e=="number"?e===Number(n.value):n.type==="date"&&typeof e=="string"&&Ie(e)?Me(e,n.value)===0:n.type==="boolean"&&typeof e=="boolean"?e===(n.value==="true"):at(String(e),n.value,t)}function Dt(e,n,t){let r=String(e);return t?r.includes(n.value):r.toLowerCase().includes(n.value.toLowerCase())}function ct(e,n,t){let r;if(n.type==="number"&&typeof e=="number")r=Math.sign(e-Number(n.value));else if(n.type==="date"&&typeof e=="string"&&Ie(e))r=Me(e,n.value);else return!1;switch(t){case"<":return r<0;case">":return r>0;case"<=":return r<=0;case">=":return r>=0;default:return!1}}var Ft=new Set(["is","contains","exists"]),ft=new Set(["has","in"]);function dt(e,n){let t=e[n];if(!t)return"value";if(t.type==="keyword")return"keyword";if(t.type==="op")return"op";if(t.type==="lparen"||t.type==="rparen")return"paren";if(t.type==="word"){let r=e[n-1],o=e[n+1];if(r?.type==="keyword"&&ft.has(r.value)||o?.type==="op"||o?.type==="keyword"&&Ft.has(o.value))return"field"}return"value"}function $e(e){let{tokens:n,error:t}=L(e),r=[],o=0;if(n.forEach((u,a)=>{u.start>o&&r.push({text:e.slice(o,u.start),kind:"space"}),r.push({text:e.slice(u.start,u.end),kind:dt(n,a)}),o=u.end}),o<e.length){let u=e.slice(o),a=u.length-u.trimStart().length;a>0&&r.push({text:u.slice(0,a),kind:"space"}),a<u.length&&r.push({text:u.slice(a),kind:t?"invalid":"space"})}return r}var Re="quartz-filters:query";function He(e){try{let n=e()?.getItem(Re);if(!n)return null;let t=JSON.parse(n);return!z(t)||typeof t.query!="string"?null:{query:t.query,caseSensitive:t.caseSensitive===!0}}catch{return null}}function Pe(e,n){try{e()?.setItem(Re,JSON.stringify(n))}catch{}}var P=(e,n)=>e.replace(/\\{(\\w+)\\}/g,(t,r)=>String(n[r]??t));function Oe(e,n){let t=JSON.parse(e.dataset.strings??"{}"),r=e.ownerDocument,o=s=>{let l=e.querySelector(s);if(!l)throw new Error(`NoteFilter markup is missing ${s}`);return l},u={tabs:Array.from(e.querySelectorAll(\'[role="tab"]\')),panels:Array.from(e.querySelectorAll(\'[role="tabpanel"]\')),input:o(".qf-input"),highlight:o(".qf-highlight"),suggestions:o(".qf-suggestions"),caseToggle:o(".qf-case"),error:o(".qf-error"),clauses:o(".qf-clauses"),status:o(".qf-status"),save:o(".qf-save"),clear:o(".qf-clear"),form:o(".qf-save-form"),name:o(".qf-name"),replace:o(".qf-replace"),confirm:o(".qf-save-confirm"),cancel:o(".qf-save-cancel"),count:o(".qf-count"),savedNote:o(".qf-saved-note"),bookmarkList:o(".qf-bookmarks")},a=!0,F=null,h=null,E=null,D=0,g=!1,C="idle",B=le(""),v=null,k=null,f,d=[],m=n.createSync(()=>U(""));function i(s,l,c){s.addEventListener(l,c),d.push(()=>s.removeEventListener(l,c))}let p=()=>u.caseToggle.getAttribute("aria-pressed")==="true",x=s=>u.caseToggle.setAttribute("aria-pressed",String(s)),q=()=>u.input.value.trim();function M(){C==="loading"||C==="ready"||(C="loading",j(),n.loader.load().then(s=>{a&&(F=s,h=Le(s),C="ready",de(),I())},()=>{a&&(C="failed",j())}))}function R(){clearTimeout(f),B=le(u.input.value),B.error||(v=B.ast),W(),Ke(),u.error.hidden=B.error===null,u.error.textContent=B.error?P(t.errorAt,{message:B.error.message,column:B.error.column}):"",u.save.disabled=!n.bookmarks.available||!q(),u.clear.disabled=!u.input.value,ee(),q()&&M(),de(),Pe(n.session,{query:u.input.value,caseSensitive:p()})}function W(){u.highlight.replaceChildren(...$e(u.input.value).map(s=>{let l=r.createElement("span");return l.className=`qf-${s.kind}`,l.textContent=s.text,l})),u.highlight.append(`\n`),O()}function O(){u.input.style.height="auto",u.input.scrollHeight>0&&(u.input.style.height=`${u.input.scrollHeight}px`)}function I(){let s=u.input.selectionStart??u.input.value.length;E=h!==null&&!g&&r.activeElement===u.input&&h?qe(u.input.value,s,h):null,D=0,G()}function G(){let s=E?.items??[];u.suggestions.hidden=s.length===0,u.suggestions.replaceChildren(...s.map((c,y)=>{let A=r.createElement("li");A.className=`qf-suggestion qf-suggestion-${c.kind}`,A.id=`${u.suggestions.id}-${y}`,A.dataset.index=String(y),A.setAttribute("role","option"),A.setAttribute("aria-selected",String(y===D));let b=r.createElement("span");b.className="qf-suggestion-label",b.textContent=c.label,A.append(b);let w=c.kind==="field"?t.suggestionField:c.field?P(t.suggestionIn,{field:c.field}):"";if(w){let T=r.createElement("span");T.className="qf-suggestion-detail",T.textContent=w,A.append(T)}return A}));let l=u.suggestions.children[D];l?(u.input.setAttribute("aria-activedescendant",l.id),l.scrollIntoView?.({block:"nearest"})):u.input.removeAttribute("aria-activedescendant")}function Fe(s){let l=E?.items[s];if(!E||!l)return;let c=Ne(u.input.value,E,l);u.input.value=c.query,u.input.setSelectionRange(c.cursor,c.cursor),fe()}function fe(){g=!1,W(),clearTimeout(f),f=setTimeout(R,n.debounceMs??150),I()}function Ke(){let s=[];B.clauses.forEach((l,c)=>{let y=xe(l),A=r.createElement("li");A.className="qf-clause";let b=r.createElement("span");b.textContent=y;let w=r.createElement("button");w.type="button",w.className="qf-clause-remove",w.dataset.clause=String(c),w.textContent="\\xD7",w.setAttribute("aria-label",`${t.removeClause}: ${y}`),A.append(b,w),s.push(A);let T=c<B.clauses.length-1?ke(u.input.value,l):null;if(T){let V=r.createElement("li");V.className="qf-join",V.setAttribute("aria-hidden","true"),V.textContent=T,s.push(V)}}),u.clauses.replaceChildren(...s)}function de(){let s=v;if(!F||!s){m.apply(null),j();return}let l={caseSensitive:p()},c=F.filter(y=>$(s,y.fields,l));m.apply(new Set(c.map(y=>n.hrefFor(y.path)))),j(c.length)}function j(s){let l="";C==="loading"?l=t.loading:C==="failed"?l=t.loadFailed:F&&s!==void 0?l=P(t.matched,{matched:s,total:F.length}):F&&(l=P(t.total,{total:F.length})),m.count===0&&C!=="failed"&&(l=l?`${l} ${t.noExplorer}`:t.noExplorer),u.status.textContent=l}function pe(s){return s.find(l=>l.query===q()&&l.caseSensitive===p())}function ee(){let s=n.bookmarks.list(),l=pe(s);u.count.textContent=s.length>0?String(s.length):"",u.savedNote.textContent=n.bookmarks.available?t.savedEmpty:t.savingOff,u.savedNote.hidden=n.bookmarks.available&&s.length>0,u.bookmarkList.replaceChildren(...s.map(c=>{let y=r.createElement("li"),A=r.createElement("button");A.type="button",A.className="qf-bookmark",A.dataset.name=c.name,c===l&&A.setAttribute("aria-current","true");let b=r.createElement("span");b.className="qf-bookmark-name",b.textContent=c.name;let w=r.createElement("span");w.className="qf-bookmark-query",w.textContent=c.query,A.append(b,w);let T=r.createElement("button");return T.type="button",T.className="qf-bookmark-remove",T.dataset.name=c.name,T.textContent="\\xD7",T.setAttribute("aria-label",P(t.deleteBookmark,{name:c.name})),y.append(A,T),y}))}function U(s){u.input.value=s,R(),I()}function te(s,l=!1){for(let c of u.tabs){let y=c.dataset.tab===s;c.setAttribute("aria-selected",String(y)),c.tabIndex=y?0:-1,y&&l&&c.focus()}for(let c of u.panels)c.hidden=c.dataset.panel!==s;s==="filter"&&O()}function ue(){k=null,u.replace.hidden=!0,u.replace.textContent="",u.confirm.textContent=t.save}function Ee(){ue(),u.form.hidden=!0}u.tabs.forEach((s,l)=>{i(s,"click",()=>te(s.dataset.tab??"filter")),i(s,"keydown",c=>{let A={ArrowRight:l+1,ArrowLeft:l-1,Home:0,End:u.tabs.length-1}[c.key];if(A===void 0)return;c.preventDefault();let b=u.tabs[(A+u.tabs.length)%u.tabs.length];b&&te(b.dataset.tab??"filter",!0)})}),i(u.input,"input",fe),i(u.input,"keydown",s=>{let l=E?.items.length??0;if(s.key===" "&&s.ctrlKey||s.key==="ArrowDown"&&l===0){g=!1,I(),(E||s.key===" ")&&s.preventDefault();return}if(l>0){let c={ArrowDown:1,ArrowUp:-1}[s.key];if(c!==void 0){s.preventDefault(),D=(D+c+l)%l,G();return}if(s.key==="Enter"||s.key==="Tab"&&!s.shiftKey){s.preventDefault(),Fe(D);return}if(s.key==="Escape"){s.preventDefault(),g=!0,I();return}}s.key==="Enter"&&s.preventDefault()}),i(u.input,"click",I),i(u.input,"keyup",s=>{["ArrowLeft","ArrowRight","Home","End"].includes(s.key)&&I()}),i(u.input,"focus",()=>{M(),I()}),i(u.input,"blur",()=>{E=null,G()}),i(u.suggestions,"mousedown",s=>s.preventDefault()),i(u.suggestions,"click",s=>{let l=s.target.closest(".qf-suggestion");l&&(Fe(Number(l.dataset.index)),u.input.focus())}),i(u.caseToggle,"click",()=>{x(!p()),R()}),i(u.clear,"click",()=>{U(""),u.input.focus()}),i(u.clauses,"click",s=>{let l=s.target.closest(".qf-clause-remove"),c=l?B.clauses[Number(l.dataset.clause)]:void 0;c&&(U(ve(u.input.value,c)),u.input.focus())}),i(u.save,"click",()=>{q()&&(ue(),u.form.hidden=!1,u.name.value=pe(n.bookmarks.list())?.name??q(),u.name.focus(),u.name.select())}),i(u.cancel,"click",Ee),i(u.name,"input",ue),i(u.form,"submit",s=>{s.preventDefault();let l=u.name.value.trim();if(l){if(k!==l&&n.bookmarks.find(l)){k=l,u.replace.textContent=P(t.replacePrompt,{name:l}),u.replace.hidden=!1,u.confirm.textContent=t.replace;return}n.bookmarks.save({name:l,query:q(),caseSensitive:p()})&&(Ee(),ee())}}),i(u.bookmarkList,"click",s=>{let l=s.target,c=l.closest(".qf-bookmark-remove");if(c?.dataset.name!==void 0){n.bookmarks.remove(c.dataset.name),ee();return}let y=l.closest(".qf-bookmark"),A=y?.dataset.name!==void 0?n.bookmarks.find(y.dataset.name):void 0;A&&(x(A.caseSensitive),U(A.query),te("filter"))});let ne=He(n.session);u.input.value=ne?.query??"",x(ne?ne.caseSensitive:e.dataset.caseSensitive==="true"),R();let me=()=>{a=!1,clearTimeout(f),d.forEach(s=>s()),m.disconnect()};return typeof window.addCleanup=="function"&&window.addCleanup(me),me}var _e=new Map;function pt(e){let n=_e.get(e);return n||(n=Be(e),_e.set(e,n)),n}document.addEventListener("nav",()=>{for(let e of document.querySelectorAll(".note-filter")){let n=JSON.parse(e.dataset.strings??"{}");Oe(e,{loader:pt(re(e.dataset.indexPath??Ae)),bookmarks:ge(()=>window.localStorage),createSync:t=>he(document,n,t),hrefFor:t=>re(t),session:()=>window.sessionStorage})}});\n';
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

export { NoteFilter_default as NoteFilter };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map