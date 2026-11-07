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

// src/index-format.ts
var INDEX_FILE = "static/quartz-filters/index.json";

// node_modules/@quartz-community/utils/dist/lang.js
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/components/styles/note-filter.scss
var note_filter_default = ".note-filter {\n  margin: 0.5rem 0 1.25rem;\n  font-family: var(--bodyFont);\n  color: var(--darkgray);\n}\n.note-filter .qf-tabs {\n  display: flex;\n  gap: 1.1rem;\n  border-bottom: 1px solid var(--lightgray);\n  margin-bottom: 0.75rem;\n}\n.note-filter .qf-tab {\n  background: none;\n  border: 0;\n  border-bottom: 2px solid transparent;\n  margin-bottom: -1px;\n  padding: 0 0 0.4rem;\n  cursor: pointer;\n  font-family: var(--headerFont);\n  font-size: 1rem;\n  color: var(--gray);\n}\n.note-filter .qf-tab:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-tab[aria-selected=true] {\n  color: var(--dark);\n  font-weight: 700;\n  border-bottom-color: var(--secondary);\n}\n.note-filter .qf-count {\n  font-family: var(--bodyFont);\n  font-weight: 400;\n  color: var(--gray);\n}\n.note-filter .qf-query {\n  position: relative;\n}\n.note-filter .qf-highlight,\n.note-filter .qf-input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0;\n  padding: 0.5rem 2.6rem 0.5rem 0.65rem;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  font-family: var(--codeFont);\n  font-size: 0.85rem;\n  font-weight: 400;\n  line-height: 1.55;\n  letter-spacing: normal;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-highlight {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n  color: var(--dark);\n  background: none;\n}\n.note-filter .qf-input {\n  position: relative;\n  display: block;\n  resize: none;\n  overflow: hidden;\n  color: transparent;\n  caret-color: var(--dark);\n  background: transparent;\n  border-color: var(--lightgray);\n}\n.note-filter .qf-input::placeholder {\n  color: var(--gray);\n}\n.note-filter .qf-input:focus {\n  outline: none;\n  border-color: var(--secondary);\n  box-shadow: 0 0 0 2px var(--highlight);\n}\n.note-filter .qf-field {\n  color: var(--secondary);\n}\n.note-filter .qf-keyword,\n.note-filter .qf-op,\n.note-filter .qf-paren {\n  color: var(--gray);\n}\n.note-filter .qf-value {\n  color: color-mix(in srgb, var(--tertiary) 70%, var(--dark));\n}\n.note-filter .qf-invalid {\n  text-decoration: underline wavy;\n  text-decoration-color: var(--secondary);\n}\n.note-filter .qf-case {\n  position: absolute;\n  top: 0.35rem;\n  right: 0.35rem;\n  padding: 0.1rem 0.35rem;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n  font-family: var(--codeFont);\n  font-size: 0.75rem;\n  color: var(--gray);\n}\n.note-filter .qf-case:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-case[aria-pressed=true] {\n  color: var(--secondary);\n  background: var(--highlight);\n  border-color: var(--secondary);\n}\n.note-filter .qf-error {\n  margin: 0.4rem 0 0;\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses {\n  list-style: none;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  font-family: var(--codeFont);\n  font-size: 0.8rem;\n  color: var(--dark);\n}\n.note-filter .qf-clauses li {\n  margin: 0;\n}\n.note-filter .qf-clause {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.15rem 0 0.15rem 0.55rem;\n  border-left: 2px solid var(--tertiary);\n  overflow-wrap: anywhere;\n}\n.note-filter .qf-join {\n  padding: 0.05rem 0 0.05rem 0.55rem;\n  border-left: 2px solid var(--lightgray);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove,\n.note-filter .qf-bookmark-remove {\n  flex: none;\n  background: none;\n  border: 0;\n  padding: 0 0.2rem;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  color: var(--gray);\n}\n.note-filter .qf-clause-remove:focus-visible,\n.note-filter .qf-bookmark-remove:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-clause-remove:hover,\n.note-filter .qf-bookmark-remove:hover {\n  color: var(--dark);\n}\n.note-filter .qf-status-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: baseline;\n  gap: 0.5rem;\n  margin-top: 0.6rem;\n  font-size: 0.8rem;\n}\n.note-filter .qf-actions,\n.note-filter .qf-form-actions {\n  display: flex;\n  gap: 0.75rem;\n}\n.note-filter .qf-form-actions {\n  justify-content: flex-end;\n}\n.note-filter .qf-link {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.note-filter .qf-link:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-link:hover {\n  text-decoration: underline;\n}\n.note-filter .qf-link:disabled {\n  color: var(--gray);\n  cursor: default;\n  text-decoration: none;\n}\n.note-filter .qf-save-form {\n  display: grid;\n  gap: 0.4rem;\n  margin-top: 0.6rem;\n  font-size: 0.85rem;\n}\n.note-filter .qf-save-form[hidden] {\n  display: none;\n}\n.note-filter .qf-save-form label {\n  display: grid;\n  gap: 0.2rem;\n}\n.note-filter .qf-save-form input {\n  font: inherit;\n  padding: 0.3rem 0.5rem;\n  border: 1px solid var(--lightgray);\n  border-radius: 4px;\n  background: var(--light);\n  color: var(--dark);\n}\n.note-filter .qf-save-form input:focus {\n  outline: none;\n  border-color: var(--secondary);\n}\n.note-filter .qf-replace {\n  margin: 0;\n  color: var(--dark);\n}\n.note-filter .qf-note {\n  margin: 0.25rem 0;\n  font-size: 0.85rem;\n}\n.note-filter .qf-bookmarks {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.note-filter .qf-bookmarks li {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin: 0;\n  border-bottom: 1px solid var(--lightgray);\n}\n.note-filter .qf-bookmarks li:last-child {\n  border-bottom: 0;\n}\n.note-filter .qf-bookmark {\n  flex: 1;\n  min-width: 0;\n  padding: 0.45rem 0 0.45rem 0.5rem;\n  border: 0;\n  border-left: 2px solid transparent;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n}\n.note-filter .qf-bookmark:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n.note-filter .qf-bookmark[aria-current=true] {\n  border-left-color: var(--secondary);\n}\n.note-filter .qf-bookmark[aria-current=true] .qf-bookmark-name {\n  color: var(--secondary);\n}\n.note-filter .qf-bookmark-name {\n  display: block;\n  font-size: 0.92rem;\n  font-weight: 600;\n  color: var(--dark);\n}\n.note-filter .qf-bookmark-query {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-family: var(--codeFont);\n  font-size: 0.72rem;\n  color: var(--gray);\n}\n\n.explorer .qf-hidden {\n  display: none !important;\n}\n.explorer .title-button h2[data-qf-filtered]::after {\n  content: attr(data-qf-filtered);\n  margin-left: 0.5rem;\n  font-family: var(--bodyFont);\n  font-size: 0.75rem;\n  font-weight: 400;\n  color: var(--secondary);\n}\n.explorer .qf-empty {\n  margin: 0.5rem 0;\n  font-size: 0.85rem;\n  color: var(--darkgray);\n}\n.explorer .qf-empty button {\n  background: none;\n  border: 0;\n  padding: 0;\n  cursor: pointer;\n  font: inherit;\n  color: var(--secondary);\n}\n.explorer .qf-empty button:hover {\n  text-decoration: underline;\n}\n.explorer .qf-empty button:focus-visible {\n  outline: 2px solid var(--secondary);\n  outline-offset: 2px;\n}";

// src/components/scripts/note-filter.inline.ts
var note_filter_inline_default = 'var ye=Object.defineProperty;var xe=(e,t,u)=>t in e?ye(e,t,{enumerable:!0,configurable:!0,writable:!0,value:u}):e[t]=u;var oe=(e,t,u)=>xe(e,typeof t!="symbol"?t+"":t,u);var Xe=Object.hasOwnProperty;function ve(){return typeof document>"u"?"":document.body?.dataset?.basepath??""}function Z(e,t){let u=t??ve(),o=e.startsWith("/")?e:"/"+e;return u+o}var se="static/quartz-filters/index.json";var j=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);var Q="quartz-filters:bookmarks";function ke(e){try{let t=e();if(!t)return null;let u=`${Q}:probe`;return t.setItem(u,"1"),t.removeItem(u),t}catch{return null}}function ie(e){let t=ke(e),u=()=>{if(!t)return[];try{let r=JSON.parse(t.getItem(Q)??"[]");return Array.isArray(r)?r.flatMap(n=>j(n)&&typeof n.name=="string"&&typeof n.query=="string"?[{name:n.name,query:n.query,caseSensitive:n.caseSensitive===!0}]:[]):[]}catch{return[]}},o=r=>{if(!t)return!1;try{return t.setItem(Q,JSON.stringify(r)),!0}catch{return!1}};return{available:t!==null,list:u,find:r=>u().find(n=>n.name===r),save(r){let n=u(),D=n.findIndex(f=>f.name===r.name);return D>=0?n[D]=r:n.push(r),o(n)},remove(r){o(u().filter(n=>n.name!==r))}}}var x={root:"div.explorer",list:".explorer-ul",content:".explorer-content",title:".title-button h2",fileLink:"a.nav-file-title",folderHeader:".folder-container",folderOuter:".folder-outer",openClass:"open"},R="qf-hidden",G="qf-empty",U="data-qf-opened",$="data-qf-filtered";var V=(e,t)=>Array.from(e.children).find(u=>u.matches(t))??null;function De(e,t,u){let o=Array.from(e.querySelectorAll(x.root)),r=[],n=null,D=!1,f=()=>o.forEach(F=>p(F,n));function B(F,C){C.querySelectorAll(`.${R}`).forEach(A=>A.classList.remove(R)),C.querySelectorAll(`[${U}]`).forEach(A=>{A.classList.remove(x.openClass),A.removeAttribute(U)}),F.removeAttribute($),F.querySelector(x.title)?.removeAttribute($)}function p(F,C){F.querySelector(`.${G}`)?.remove();let A=F.querySelector(x.list);if(!A)return;if(C===null){B(F,A);return}let T=Array.from(A.querySelectorAll("li")),v=0;for(let d of T){let m=V(d,x.fileLink);if(!m)continue;let E=C.has(m.getAttribute("href")??"");d.classList.toggle(R,!E),E&&v++}for(let d of T.reverse()){if(!V(d,x.folderHeader))continue;let m=Array.from(d.querySelectorAll("li")).some(k=>!k.classList.contains(R)&&V(k,x.fileLink));d.classList.toggle(R,!m);let E=V(d,x.folderOuter);m&&E&&!E.classList.contains(x.openClass)&&(E.classList.add(x.openClass),E.setAttribute(U,""))}if(F.setAttribute($,""),F.querySelector(x.title)?.setAttribute($,t.filtered),v===0){let d=F.ownerDocument,m=d.createElement("p");m.className=G,m.append(`${t.noMatches} `);let E=d.createElement("button");E.type="button",E.textContent=t.clearFilter,E.onclick=u,m.append(E),(F.querySelector(x.content)??F).append(m)}}for(let F of o){let C=F.querySelector(x.list);if(!C)continue;let A=new MutationObserver(()=>{D||(D=!0,queueMicrotask(()=>{D=!1,f()}))});A.observe(C,{childList:!0,subtree:!0}),r.push(A)}return{count:o.length,apply(F){n=F,f()},disconnect(){r.forEach(F=>F.disconnect())}}}function ae(e,t=u=>fetch(u)){let u=null;return{load(){return u??(u=t(e).then(async o=>{if(!o.ok)throw new Error(`HTTP ${o.status}`);let r=await o.json();if(r.version!==1||!Array.isArray(r.notes))throw new Error("Unexpected index format");return r.notes}).catch(o=>{throw u=null,o})),u}}}var Se=/^\\d{4}-\\d{2}-\\d{2}(T[\\d:.]+(Z|[+-]\\d{2}:\\d{2})?)?$/;function q(e,t,u){switch(e.kind){case"and":return q(e.left,t,u)&&q(e.right,t,u);case"or":return q(e.left,t,u)||q(e.right,t,u);case"not":return!q(e.expr,t,u);case"clause":return Le(e,t,u.caseSensitive)}}function be(e,t,u){if(u){let n=e[t];return n===void 0?void 0:[].concat(n)}let o=t.toLowerCase(),r;for(let[n,D]of Object.entries(e))n.toLowerCase()===o&&(r=(r??[]).concat(D));return r}function Le(e,t,u){let o=be(t,e.field,u);if(e.op==="has")return o!==void 0&&o.some(D=>D!=="");let r=e.value;if(!r)return!1;let n=()=>o?.some(D=>we(D,r,u))??!1;switch(e.op){case"is":case"in":return n();case"is not":case"not in":return!n();case"contains":return o?.some(D=>qe(D,r,u))??!1;default:return o?.some(D=>Ne(D,r,e.op))??!1}}var ee=e=>Date.parse(/T[\\d:.]+$/.test(e)?`${e}Z`:e),le=e=>Se.test(e)&&!Number.isNaN(ee(e));function Fe(e,t){if(t.length===10){let u=e.slice(0,10);return u<t?-1:u>t?1:0}return Math.sign(ee(e)-ee(t))}var Te=(e,t,u)=>u?e===t:e.toLowerCase()===t.toLowerCase();function we(e,t,u){return t.type==="number"&&typeof e=="number"?e===Number(t.value):t.type==="date"&&typeof e=="string"&&le(e)?Fe(e,t.value)===0:t.type==="boolean"&&typeof e=="boolean"?e===(t.value==="true"):Te(String(e),t.value,u)}function qe(e,t,u){let o=String(e);return u?o.includes(t.value):o.toLowerCase().includes(t.value.toLowerCase())}function Ne(e,t,u){let o;if(t.type==="number"&&typeof e=="number")o=Math.sign(e-Number(t.value));else if(t.type==="date"&&typeof e=="string"&&le(e))o=Fe(e,t.value);else return!1;switch(u){case"<":return o<0;case">":return o>0;case"<=":return o<=0;case">=":return o>=0;default:return!1}}var Ie=new Set(["is","not","in","and","or","has","exists","contains"]),ce=/[\\p{L}\\p{N}_.:/-]/u,Me=/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z)?)?$/,Re=/^-?\\d+(\\.\\d+)?$/,$e=new Set([\'"\',"\\u201C"]),Pe=new Set([\'"\',"\\u201D"]);function N(e){let t=[],u=0;for(;u<e.length;){let o=e[u];if(/\\s/.test(o)){u++;continue}if(o==="("||o===")"){t.push({type:o==="("?"lparen":"rparen",value:o,start:u,end:u+1}),u++;continue}if(o==="<"||o===">"){let r=e[u+1]==="="?`${o}=`:o;t.push({type:"op",value:r,start:u,end:u+r.length}),u+=r.length;continue}if($e.has(o)){let r=u,n="",D=!1;for(u++;u<e.length;){let f=e[u];if(f==="\\\\"&&e[u+1]===\'"\'){n+=\'"\',u+=2;continue}if(Pe.has(f)){D=!0,u++;break}n+=f,u++}if(!D)return{tokens:t,error:{message:"This quoted value has no closing quote",column:r+1}};t.push({type:"string",value:n,start:r,end:u});continue}if(ce.test(o)){let r=u;for(;u<e.length&&ce.test(e[u]);)u++;let n=e.slice(r,u),D=n.toLowerCase();Me.test(n)?t.push({type:"date",value:n,start:r,end:u}):Re.test(n)?t.push({type:"number",value:n,start:r,end:u}):D==="true"||D==="false"?t.push({type:"boolean",value:D,start:r,end:u}):Ie.has(D)?t.push({type:"keyword",value:D,start:r,end:u}):t.push({type:"word",value:n,start:r,end:u});continue}return{tokens:t,error:{message:`Unexpected character "${o}"`,column:u+1}}}return{tokens:t,error:null}}var ue=(e,t)=>e?.type==="keyword"&&e.value===t,P=e=>ue(e,"and")||ue(e,"or");function fe(e){return e.type==="string"?`"${e.value.replace(/"/g,\'\\\\"\')}"`:e.value}function de(e){return e.op==="has"||!e.value?`has ${e.field}`:e.op==="in"||e.op==="not in"?`${fe(e.value)} ${e.op} ${e.field}`:`${e.field} ${e.op} ${fe(e.value)}`}function Ee(e,t){let{tokens:u}=N(e),o=u.findIndex(n=>n.start>=t.end);if(o<0)return null;for(;u[o]?.type==="rparen";)o++;let r=u[o];return P(r)?r.value:null}function pe(e,t){let{tokens:u}=N(e),o=u.findIndex(C=>C.start===t.start),r=u.findIndex(C=>C.end===t.end);if(o<0||r<o)return e;let n=()=>{for(;ue(u[o-1],"not");)o--};for(n();u[o-1]?.type==="lparen"&&u[r+1]?.type==="rparen";)o--,r++,n();let D=u[o]?.start??t.start,f=u[r]?.end??t.end,B=u[r+1],p=u[o-1];return!(P(p)&&(!P(B)||p.value==="and"&&B.value==="or"))&&P(B)?f=u[r+2]?.start??B.end:P(p)&&(D=u[o-2]?.end??p.start),(e.slice(0,D)+e.slice(f)).trim()}var He=new Set(["is","contains","exists"]),Oe=new Set(["has","in"]);function _e(e,t){let u=e[t];if(!u)return"value";if(u.type==="keyword")return"keyword";if(u.type==="op")return"op";if(u.type==="lparen"||u.type==="rparen")return"paren";if(u.type==="word"){let o=e[t-1],r=e[t+1];if(o?.type==="keyword"&&Oe.has(o.value)||r?.type==="op"||r?.type==="keyword"&&He.has(r.value))return"field"}return"value"}function Ce(e){let{tokens:t,error:u}=N(e),o=[],r=0;if(t.forEach((n,D)=>{n.start>r&&o.push({text:e.slice(r,n.start),kind:"space"}),o.push({text:e.slice(n.start,n.end),kind:_e(t,D)}),r=n.end}),r<e.length){let n=e.slice(r),D=n.length-n.trimStart().length;D>0&&o.push({text:n.slice(0,D),kind:"space"}),D<n.length&&o.push({text:n.slice(D),kind:u?"invalid":"space"})}return o}var Ke=/^[\\p{L}_][\\p{L}\\p{N}_.-]*$/u,We=new Set(["string","number","date","boolean","word"]),z=class extends Error{constructor(u){super(u.message);oe(this,"detail",u)}},je=(e,t)=>e&&e.column<=t.column?e:t;function te(e){let{tokens:t,error:u}=N(e),o=[],r=0,n=(s=0)=>t[r+s],D=s=>`"${e.slice(s.start,s.end)}"`,f=(s,l)=>s?.type==="keyword"&&s.value===l,B=s=>s!==void 0&&We.has(s.type),p=s=>s?.type==="word"&&Ke.test(s.value);function F(s,l){throw new z({message:s,column:(l?.start??e.length)+1})}function C(s){return{type:s.type==="word"?"string":s.type,value:s.value}}function A(){let s=T();for(;f(n(),"or");)r++,s={kind:"or",left:s,right:T()};return s}function T(){let s=v();for(;f(n(),"and");)r++,s={kind:"and",left:s,right:v()};return s}function v(){return f(n(),"not")?(r++,{kind:"not",expr:v()}):d()}function d(){let s=n();if(s?.type==="lparen"){r++;let l=A(),g=n();return g?.type!=="rparen"?F(`Expected ")" to close the "(" at column ${s.start+1}`,g):(r++,l)}return k()}function m(s){let l=n();return p(l)?(r++,l.value):F(`Expected a field name after ${D(s)}`,l)}function E(s){let l=n();return l?.type==="keyword"?F(`${D(l)} is a keyword. Put it in quotes to use it as a value`,l):B(l)?(r++,C(l)):F(`Expected a value after ${D(s)}`,l)}function k(){let s=n();if(!s)return F("Expected a clause",s);let l=(w,I,_)=>{let M={kind:"clause",op:w,field:I,value:_,start:s.start,end:t[r-1]?.end??s.end};return o.push(M),M};if(f(s,"has"))return r++,l("has",m(s),null);if(!B(s))return F(`Expected a clause, found ${D(s)}`,s);r++;let g=n();if(f(g,"in"))return r++,l("in",m(g),C(s));let O=n(1);if(f(g,"not")&&f(O,"in"))return r+=2,l("not in",m(O),C(s));if(!p(s))return F(`Expected "in" after ${D(s)}`,g);if(f(g,"is")){r++;let w=n();return f(w,"not")?(r++,l("is not",s.value,E(w))):l("is",s.value,E(g))}return f(g,"contains")?(r++,l("contains",s.value,E(g))):g?.type==="op"?(r++,l(g.value,s.value,E(g))):f(g,"exists")?(r++,l("has",s.value,null)):F(`Expected "is", "in", "contains", a comparison or "exists" after ${D(s)}`,g)}if(t.length===0)return{ast:null,error:u,clauses:o};try{let s=A(),l=n();return l&&F(l.type==="rparen"?\'There is no "(" for this ")"\':`Expected "and" or "or" before ${D(l)}`,l),u?{ast:null,error:u,clauses:o}:{ast:s,error:null,clauses:o}}catch(s){if(s instanceof z)return{ast:null,error:je(u,s.detail),clauses:o};throw s}}var me="quartz-filters:query";function Ae(e){try{let t=e()?.getItem(me);if(!t)return null;let u=JSON.parse(t);return!j(u)||typeof u.query!="string"?null:{query:u.query,caseSensitive:u.caseSensitive===!0}}catch{return null}}function ge(e,t){try{e()?.setItem(me,JSON.stringify(t))}catch{}}var H=(e,t)=>e.replace(/\\{(\\w+)\\}/g,(u,o)=>String(t[o]??u));function Be(e,t){let u=JSON.parse(e.dataset.strings??"{}"),o=e.ownerDocument,r=i=>{let a=e.querySelector(i);if(!a)throw new Error(`NoteFilter markup is missing ${i}`);return a},n={tabs:Array.from(e.querySelectorAll(\'[role="tab"]\')),panels:Array.from(e.querySelectorAll(\'[role="tabpanel"]\')),input:r(".qf-input"),highlight:r(".qf-highlight"),caseToggle:r(".qf-case"),error:r(".qf-error"),clauses:r(".qf-clauses"),status:r(".qf-status"),save:r(".qf-save"),clear:r(".qf-clear"),form:r(".qf-save-form"),name:r(".qf-name"),replace:r(".qf-replace"),confirm:r(".qf-save-confirm"),cancel:r(".qf-save-cancel"),count:r(".qf-count"),savedNote:r(".qf-saved-note"),bookmarkList:r(".qf-bookmarks")},D=!0,f=null,B="idle",p=te(""),F=null,C=null,A,T=[],v=t.createSync(()=>K(""));function d(i,a,c){i.addEventListener(a,c),T.push(()=>i.removeEventListener(a,c))}let m=()=>n.caseToggle.getAttribute("aria-pressed")==="true",E=i=>n.caseToggle.setAttribute("aria-pressed",String(i)),k=()=>n.input.value.trim();function s(){B==="loading"||B==="ready"||(B="loading",I(),t.loader.load().then(i=>{D&&(f=i,B="ready",w())},()=>{D&&(B="failed",I())}))}function l(){clearTimeout(A),p=te(n.input.value),p.error||(F=p.ast),g(),O(),n.error.hidden=p.error===null,n.error.textContent=p.error?H(u.errorAt,{message:p.error.message,column:p.error.column}):"",n.save.disabled=!t.bookmarks.available||!k(),n.clear.disabled=!n.input.value,M(),k()&&s(),w(),ge(t.session,{query:n.input.value,caseSensitive:m()})}function g(){n.highlight.replaceChildren(...Ce(n.input.value).map(i=>{let a=o.createElement("span");return a.className=`qf-${i.kind}`,a.textContent=i.text,a})),n.highlight.append(`\n`),n.input.style.height="auto",n.input.scrollHeight>0&&(n.input.style.height=`${n.input.scrollHeight}px`)}function O(){let i=[];p.clauses.forEach((a,c)=>{let h=de(a),y=o.createElement("li");y.className="qf-clause";let b=o.createElement("span");b.textContent=h;let S=o.createElement("button");S.type="button",S.className="qf-clause-remove",S.dataset.clause=String(c),S.textContent="\\xD7",S.setAttribute("aria-label",`${u.removeClause}: ${h}`),y.append(b,S),i.push(y);let L=c<p.clauses.length-1?Ee(n.input.value,a):null;if(L){let W=o.createElement("li");W.className="qf-join",W.setAttribute("aria-hidden","true"),W.textContent=L,i.push(W)}}),n.clauses.replaceChildren(...i)}function w(){let i=F;if(!f||!i){v.apply(null),I();return}let a={caseSensitive:m()},c=f.filter(h=>q(i,h.fields,a));v.apply(new Set(c.map(h=>t.hrefFor(h.path)))),I(c.length)}function I(i){let a="";B==="loading"?a=u.loading:B==="failed"?a=u.loadFailed:f&&i!==void 0?a=H(u.matched,{matched:i,total:f.length}):f&&(a=H(u.total,{total:f.length})),v.count===0&&B!=="failed"&&(a=a?`${a} ${u.noExplorer}`:u.noExplorer),n.status.textContent=a}function _(i){return i.find(a=>a.query===k()&&a.caseSensitive===m())}function M(){let i=t.bookmarks.list(),a=_(i);n.count.textContent=i.length>0?String(i.length):"",n.savedNote.textContent=t.bookmarks.available?u.savedEmpty:u.savingOff,n.savedNote.hidden=t.bookmarks.available&&i.length>0,n.bookmarkList.replaceChildren(...i.map(c=>{let h=o.createElement("li"),y=o.createElement("button");y.type="button",y.className="qf-bookmark",y.dataset.name=c.name,c===a&&y.setAttribute("aria-current","true");let b=o.createElement("span");b.className="qf-bookmark-name",b.textContent=c.name;let S=o.createElement("span");S.className="qf-bookmark-query",S.textContent=c.query,y.append(b,S);let L=o.createElement("button");return L.type="button",L.className="qf-bookmark-remove",L.dataset.name=c.name,L.textContent="\\xD7",L.setAttribute("aria-label",H(u.deleteBookmark,{name:c.name})),h.append(y,L),h}))}function K(i){n.input.value=i,l()}function J(i,a=!1){for(let c of n.tabs){let h=c.dataset.tab===i;c.setAttribute("aria-selected",String(h)),c.tabIndex=h?0:-1,h&&a&&c.focus()}for(let c of n.panels)c.hidden=c.dataset.panel!==i}function Y(){C=null,n.replace.hidden=!0,n.replace.textContent="",n.confirm.textContent=u.save}function ne(){Y(),n.form.hidden=!0}n.tabs.forEach((i,a)=>{d(i,"click",()=>J(i.dataset.tab??"filter")),d(i,"keydown",c=>{let y={ArrowRight:a+1,ArrowLeft:a-1,Home:0,End:n.tabs.length-1}[c.key];if(y===void 0)return;c.preventDefault();let b=n.tabs[(y+n.tabs.length)%n.tabs.length];b&&J(b.dataset.tab??"filter",!0)})}),d(n.input,"input",()=>{g(),clearTimeout(A),A=setTimeout(l,t.debounceMs??150)}),d(n.input,"keydown",i=>{i.key==="Enter"&&i.preventDefault()}),d(n.input,"focus",s),d(n.caseToggle,"click",()=>{E(!m()),l()}),d(n.clear,"click",()=>{K(""),n.input.focus()}),d(n.clauses,"click",i=>{let a=i.target.closest(".qf-clause-remove"),c=a?p.clauses[Number(a.dataset.clause)]:void 0;c&&(K(pe(n.input.value,c)),n.input.focus())}),d(n.save,"click",()=>{k()&&(Y(),n.form.hidden=!1,n.name.value=_(t.bookmarks.list())?.name??k(),n.name.focus(),n.name.select())}),d(n.cancel,"click",ne),d(n.name,"input",Y),d(n.form,"submit",i=>{i.preventDefault();let a=n.name.value.trim();if(a){if(C!==a&&t.bookmarks.find(a)){C=a,n.replace.textContent=H(u.replacePrompt,{name:a}),n.replace.hidden=!1,n.confirm.textContent=u.replace;return}t.bookmarks.save({name:a,query:k(),caseSensitive:m()})&&(ne(),M())}}),d(n.bookmarkList,"click",i=>{let a=i.target,c=a.closest(".qf-bookmark-remove");if(c?.dataset.name!==void 0){t.bookmarks.remove(c.dataset.name),M();return}let h=a.closest(".qf-bookmark"),y=h?.dataset.name!==void 0?t.bookmarks.find(h.dataset.name):void 0;y&&(E(y.caseSensitive),K(y.query),J("filter"))});let X=Ae(t.session);n.input.value=X?.query??"",E(X?X.caseSensitive:e.dataset.caseSensitive==="true"),l();let re=()=>{D=!1,clearTimeout(A),T.forEach(i=>i()),v.disconnect()};return typeof window.addCleanup=="function"&&window.addCleanup(re),re}var he=new Map;function Ue(e){let t=he.get(e);return t||(t=ae(e),he.set(e,t)),t}document.addEventListener("nav",()=>{for(let e of document.querySelectorAll(".note-filter")){let t=JSON.parse(e.dataset.strings??"{}");Be(e,{loader:Ue(Z(e.dataset.indexPath??se)),bookmarks:ie(()=>window.localStorage),createSync:u=>De(document,t,u),hrefFor:u=>Z(u),session:()=>window.sessionStorage})}});\n';
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

export { NoteFilter_default as NoteFilter };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map