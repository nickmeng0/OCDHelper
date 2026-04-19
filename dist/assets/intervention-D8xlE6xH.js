import"./modulepreload-polyfill-CSRv37U6.js";var e=[`Your discomfort is temporary. What would happen if you sat with this feeling for 5 minutes?`,`OCD demands certainty. Can you tolerate the uncertainty instead of seeking reassurance?`,`Rate your anxiety 1–10. Research shows it peaks and then falls — can you wait for the drop?`,`Every time you resist a compulsion, you weaken the OCD pathway. This moment counts.`];function t(){return e[Math.floor(Math.random()*e.length)]}function n(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function r(){let e=new URLSearchParams(location.search);return{site:e.get(`site`)||`this site`,mechanism:e.get(`mechanism`)||null,term:e.get(`term`)||null,label:e.get(`label`)||null,matchedTheme:e.get(`matchedTheme`)||null,query:e.get(`query`)||null,score:parseFloat(e.get(`score`)||`0`)||null}}function i(e){return e.trim().replace(/^https?:\/\//,``).replace(/^www\./,``).replace(/\/.*$/,``).toLowerCase()}function a({site:e,mechanism:t,term:r,label:i,matchedTheme:a,query:o,score:s}){let c=s?` (${Math.round(s*100)}% match)`:``,l=o?`<em>"${n(o)}"</em>`:`your search`;return t===`keyword`?`
      <p style="color:#555;margin-bottom:16px;">
        ${l} on <strong>${n(e)}</strong> matched a blocked keyword:
        <strong>${n(r||``)}</strong>
      </p>
    `:t===`cluster`?`
      <p style="color:#555;margin-bottom:16px;">
        ${l} on <strong>${n(e)}</strong> matched an obsession cluster${c}:
        <strong>${n(i||``)}</strong>
      </p>
    `:t===`theme`?`
      <p style="color:#555;margin-bottom:16px;">
        ${l} on <strong>${n(e)}</strong> matched a saved theme${c}:
        <strong>${n(a||``)}</strong>
      </p>
    `:`
    <p style="color:#555;margin-bottom:16px;">
      You've blocked <strong>${n(e)}</strong> as part of your OCD therapy.
    </p>
  `}function o(){let e=r(),i=document.getElementById(`root`);i.innerHTML=`
    <div style="max-width:520px;margin:80px auto;padding:32px;font-family:sans-serif;border:2px solid #333;border-radius:8px;text-align:center;">
      <h1 style="font-size:1.4em;margin-bottom:8px;">ERP Pause</h1>

      ${a(e)}

      <div style="background:#f5f5f5;padding:16px;border-radius:6px;margin-bottom:24px;">
        <p id="erp-prompt" style="font-size:1.05em;line-height:1.6;margin:0;">
          ${n(t())}
        </p>
      </div>

      <div style="margin-bottom:20px;">
        <label for="anxiety-input">Current anxiety level (1–10):&nbsp;</label>
        <input id="anxiety-input" type="number" min="1" max="10" value="6" style="width:56px;" />
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button id="btn-practice" style="padding:10px 20px;cursor:pointer;font-size:1em;">
          Practice ERP — Go Back
        </button>
        <button id="btn-proceed"
          style="padding:10px 20px;cursor:pointer;font-size:1em;background:#c0392b;color:#fff;border:none;border-radius:4px;">
          Proceed Anyway
        </button>
      </div>

      <p style="margin-top:20px;font-size:0.8em;color:#999;">
        To unblock a site permanently, open the ERP Companion popup and remove it from your block list.
      </p>
    </div>
  `,document.getElementById(`btn-practice`).addEventListener(`click`,()=>{let t=document.getElementById(`anxiety-input`).value;s(`resisted`,t,e),c()}),document.getElementById(`btn-proceed`).addEventListener(`click`,async()=>{let t=document.getElementById(`anxiety-input`).value;s(`proceeded`,t,e),await l(e.site)})}function s(e,t,{site:n,obsession:r,score:i}){chrome.storage.local.get([`interventionLog`],a=>{let o=a.interventionLog||[];o.push({timestamp:new Date().toISOString(),site:n,obsession:r||null,similarityScore:i||null,anxietyLevel:parseInt(t,10)||null,decision:e}),chrome.storage.local.set({interventionLog:o})})}function c(){history.length>2?history.go(-2):location.href=`chrome://newtab/`}async function l(e){let{urlBlockList:t=[]}=await chrome.storage.local.get(`urlBlockList`),n=t.find(t=>i(t.url)===e);n?(await chrome.runtime.sendMessage({type:`REMOVE_BLOCK_RULE`,ruleId:n.id}),location.href=`https://${e}`,setTimeout(()=>chrome.runtime.sendMessage({type:`ADD_BLOCK_RULE`,url:n.url,ruleId:n.id}),600*1e3)):location.href=e.startsWith(`http`)?e:`https://${e}`}o();