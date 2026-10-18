(()=>{
'use strict';
const URL='https://hccvcdrvqydtjtotgcco.supabase.co',KEY='sb_publishable_1Tl1eM6eju2mfMPg83gNlg_bTnmY7f4';
const $=id=>document.getElementById(id), q=s=>document.querySelector(s);
const empty=()=>({schemaVersion:1,items:[],settled:{}});let data=empty(),session=null,dirty=false,editId=null;
const fmt=x=>Number(x).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const addMonth=(m,n)=>{const [y,mo]=m.split('-').map(Number);return ym(new Date(y,mo-1+n,1))};
const ix=m=>{const [y,mo]=m.split('-').map(Number);return y*12+mo};
const key=(i,m)=>i.id+'@'+m;
const now=ym(new Date());$('month').value=now;$('entryMonth').value=now;
function msg(s){$('status').textContent=s}
function validate(x){if(!x||x.schemaVersion!==1||!Array.isArray(x.items)||x.items.length>10000||!x.settled||typeof x.settled!=='object'||Array.isArray(x.settled))throw Error('Backup não reconhecido.');const ids=new Set();for(const v of x.items){if(!v||typeof v.id!=='string'||ids.has(v.id)||!['income','expense'].includes(v.kind)||typeof v.description!=='string'||!v.description.trim()||!Number.isFinite(v.amount)||v.amount<=0||!/^\d{4}-(0[1-9]|1[0-2])$/.test(v.date)||!['once','monthly','installment'].includes(v.frequency)||!Number.isInteger(v.count)||v.count<1||v.count>360)throw Error('Lançamentos inválidos.');ids.add(v.id)}return {schemaVersion:1,items:x.items,settled:x.settled}}
function authHeaders(){return {apikey:KEY,...(session?.access_token?{Authorization:'Bearer '+session.access_token}:{}),'Content-Type':'application/json'}}
function errorText(s,p){return p?.msg||p?.message||p?.error_description||('Erro HTTP '+s)}
async function request(path,options={}){const r=await fetch(URL+path,{...options,headers:{...authHeaders(),...(options.headers||{})}});const t=await r.text();let body;try{body=t?JSON.parse(t):null}catch{body={message:t}}if(!r.ok)throw Error(errorText(r.status,body));return body}
function setSession(x){session=x;if(x)sessionStorage.setItem('finance_session',JSON.stringify(x));else sessionStorage.removeItem('finance_session');$('loginPanel').hidden=!!x;$('workspace').hidden=!x;$('who').textContent=x?.user?.email||''}
async function ensureSession(){if(!session)return false;if(Date.now() < (session.expires_at||0)*1000-60000)return true;if(!session.refresh_token){setSession(null);return false}try{const r=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});setSession({...r,expires_at:Math.floor(Date.now()/1000)+r.expires_in});return true}catch{setSession(null);return false}}
async function load(){if(!await ensureSession())return;try{const rows=await request('/rest/v1/finance_documents?select=monthly_data&user_id=eq.'+encodeURIComponent(session.user.id));data=validate(rows.length?rows[0].monthly_data:empty());dirty=false;render();msg(rows.length?'Dados privados carregados do Supabase.':'Banco conectado! Nenhum lançamento registrado ainda.')}catch(e){msg('Não foi possível carregar o banco: '+e.message+'. Execute supabase-schema.sql no SQL Editor e confira o login.')}}
async function save(){if(!await ensureSession())return;try{validate(data);const rows=await request('/rest/v1/finance_documents?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({user_id:session.user.id,monthly_data:data,updated_at:new Date().toISOString()})});if(!Array.isArray(rows)||rows.length!==1)throw Error('Gravação não confirmada; confira as permissões RLS.');dirty=false;msg('Dados salvos no Supabase com sucesso.')}catch(e){msg('Não foi possível salvar: '+e.message)}}
function occurs(i,m){const d=ix(m)-ix(i.date);return d>=0&&(i.frequency==='monthly'||(i.frequency==='once'&&d===0)||(i.frequency==='installment'&&d<i.count))}
function entries(m){return data.items.filter(i=>occurs(i,m)).map(i=>({...i,paid:!!data.settled[key(i,m)],portion:i.frequency==='installment'?ix(m)-ix(i.date)+1:null}))}
const totals=m=>{const a=entries(m);return {income:a.filter(i=>i.kind==='income').reduce((s,i)=>s+i.amount,0),expenses:a.filter(i=>i.kind==='expense').reduce((s,i)=>s+i.amount,0),actual:a.filter(i=>i.paid).reduce((s,i)=>s+(i.kind==='income'?i.amount:-i.amount),0)}};
function dirtyRender(){dirty=true;msg('Alterações pendentes. Clique em Salvar alterações.');render()}
function cell(v){const td=document.createElement('td');td.textContent=v;return td}
function render(){const m=$('month').value,t=totals(m),a=entries(m);$('income').textContent=fmt(t.income);$('expenses').textContent=fmt(t.expenses);$('balance').textContent=fmt(t.income-t.expenses);$('actual').textContent=fmt(t.actual);
 const cats={};a.filter(i=>i.kind==='expense').forEach(i=>cats[i.category]=(cats[i.category]||0)+i.amount);const box=$('categories');box.replaceChildren();Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([c,v])=>{const line=document.createElement('div');line.className='line';line.append(Object.assign(document.createElement('span'),{textContent:c}),Object.assign(document.createElement('b'),{textContent:fmt(v)}));box.append(line)});
 const bars=$('forecastBars');bars.replaceChildren();for(let n=0;n<6;n++){const month=addMonth(m,n),v=totals(month);const line=document.createElement('div');line.className='bar';const text=document.createElement('span');text.textContent=month.slice(5)+'/'+month.slice(2,4);const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';fill.style.width=Math.round(100*Math.min(1,v.expenses/Math.max(1,v.income,v.expenses)))+'%';track.append(fill);const label=document.createElement('b');label.textContent=fmt(v.income-v.expenses);line.append(text,track,label);bars.append(line)}
 const body=$('entries');body.replaceChildren();$('empty').hidden=a.length>0;for(const i of a){const tr=document.createElement('tr');const desc=cell(i.description+(i.portion?' ('+i.portion+'/'+i.count+')':'')),cat=cell(i.category),amt=cell((i.kind==='income'?'+ ':'− ')+fmt(i.amount));amt.className=i.kind==='income'?'positive':'danger';const state=document.createElement('td'),check=document.createElement('input');check.type='checkbox';check.style.width='auto';check.checked=i.paid;check.setAttribute('aria-label','Confirmar '+i.description);check.onchange=()=>{if(check.checked)data.settled[key(i,m)]=true;else delete data.settled[key(i,m)];dirtyRender()};state.append(check,document.createTextNode(i.paid?' Confirmado':' Pendente'));const ops=document.createElement('td');const edit=document.createElement('button'),del=document.createElement('button');edit.className=del.className='mini';edit.textContent='Editar';del.textContent='Excluir';edit.onclick=()=>startEdit(i.id);del.onclick=()=>remove(i.id);ops.append(edit,del);tr.append(desc,cat,amt,state,ops);body.append(tr)}
 const card=$('cardRows');card.replaceChildren();let cardSum=0;for(const i of a.filter(i=>i.kind==='expense'&&i.account?.toLowerCase().includes('cartão'))){cardSum+=i.amount;const tr=document.createElement('tr');[i.description,i.account,fmt(i.amount),i.portion?i.portion+'/'+i.count:'À vista / recorrente'].forEach(x=>tr.append(cell(x)));card.append(tr)}$('cardTotal').textContent=fmt(cardSum);
 const plan=$('futureRows');plan.replaceChildren();for(let n=0;n<12;n++){const month=addMonth(m,n),t=totals(month);const tr=document.createElement('tr');[month,fmt(t.income),fmt(t.expenses),fmt(t.income-t.expenses)].forEach(v=>tr.append(cell(v)));plan.append(tr)}
 $('investTotal').textContent=fmt(data.items.filter(i=>i.category==='Investimentos'&&i.kind==='expense').reduce((s,i)=>s+i.amount*(i.frequency==='once'?1:Math.max(0,Math.min(ix(m)-ix(i.date)+1,i.frequency==='installment'?i.count:360))),0));
}
function resetForm(){editId=null;$('entryForm').reset();$('entryMonth').value=$('month').value;$('countLabel').hidden=true;$('cancelEdit').hidden=true;$('editTitle').textContent='Novo lançamento'}
function startEdit(id){const i=data.items.find(v=>v.id===id);if(!i)return;editId=id;for(const [field,value] of Object.entries({desc:i.description,type:i.kind,amount:i.amount,entryMonth:i.date,category:i.category,frequency:i.frequency,count:i.count,account:i.account||'Outros'})){if($(field))$(field).value=value}$('countLabel').hidden=i.frequency!=='installment';$('cancelEdit').hidden=false;$('editTitle').textContent='Editar lançamento';q('[data-view="monthly"]').click();window.scrollTo({top:0,behavior:'smooth'})}
function remove(id){const i=data.items.find(x=>x.id===id);if(!i||!confirm('Excluir '+i.description+' em todos os meses?'))return;data.items=data.items.filter(v=>v.id!==id);for(const k of Object.keys(data.settled))if(k.startsWith(id+'@'))delete data.settled[k];resetForm();dirtyRender()}
$('entryForm').onsubmit=e=>{e.preventDefault();const v={id:editId||'i'+Date.now()+Math.random().toString(36).slice(2,7),description:$('desc').value.trim(),kind:$('type').value,amount:Number($('amount').value),date:$('entryMonth').value,category:$('category').value,frequency:$('frequency').value,count:$('frequency').value==='installment'?Number($('count').value):1,account:$('account').value};if(!v.description||!Number.isFinite(v.amount)||v.amount<=0||!v.date)return;try{validate({...data,items:[v]})}catch(e){msg(e.message);return}if(editId){const idx=data.items.findIndex(i=>i.id===editId);if(idx>=0)data.items[idx]=v}else data.items.push(v);resetForm();dirtyRender()};
$('frequency').onchange=()=>$('countLabel').hidden=$('frequency').value!=='installment';$('cancelEdit').onclick=resetForm;
$('month').onchange=()=>{resetForm();render()};$('prevMonth').onclick=()=>{$('month').value=addMonth($('month').value,-1);resetForm();render()};$('nextMonth').onclick=()=>{$('month').value=addMonth($('month').value,1);resetForm();render()};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view)});
$('loginForm').onsubmit=async e=>{e.preventDefault();try{const x=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})});setSession({...x,expires_at:Math.floor(Date.now()/1000)+x.expires_in});$('password').value='';await load()}catch(e){msg('Login: '+e.message);alert('Não foi possível entrar: '+e.message)}};
$('signup').onclick=async()=>{try{const x=await request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})});alert(x.session?'Conta criada. Você já pode entrar.':'Conta solicitada. Confira seu e-mail para confirmar o cadastro antes de entrar.')}catch(e){alert('Cadastro: '+e.message)}};
$('signout').onclick=()=>{if(dirty&&!confirm('Sair sem salvar as alterações?'))return;setSession(null);data=empty();render();msg('Você saiu da sua conta.')};
$('save').onclick=save;$('refresh').onclick=()=>{if(dirty&&!confirm('Descartar alterações não salvas?'))return;load()};
$('download').onclick=()=>{const blob=new Blob([JSON.stringify({...data,updatedAt:new Date().toISOString()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='financas-backup-'+now+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>3000000)throw Error('Arquivo muito grande.');const x=validate(JSON.parse(await f.text()));if(confirm('Substituir lançamentos atuais pelo backup?')){data=x;dirtyRender()}}catch(err){msg('Importação: '+err.message)}finally{e.target.value=''}};

let pendingCards=[];
function csvRows(content){
 const first=content.replace(/^\uFEFF/,'');
 const lines=first.split(/\r?\n/).filter(x=>x.trim());
 const firstLine=lines[8]||lines[0]||'';
 const delim=(firstLine.match(/;/g)||[]).length>(firstLine.match(/,/g)||[]).length?';':',';
 const out=[];let row=[],value='',quoted=false;
 for(let p=0;p<first.length;p++){const c=first[p];if(c==='"'){if(quoted&&first[p+1]==='"'){value+='"';p++}else quoted=!quoted}else if(c===delim&&!quoted){row.push(value);value=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&first[p+1]==='\n')p++;row.push(value);out.push(row);row=[];value=''}else value+=c}
 if(value||row.length){row.push(value);out.push(row)}return out;
}
function brAmount(x){
 if(typeof x==='number')return x;
 const str=String(x||'').replace(/R\$|\s/g,'');
 if(!str)return NaN;
 const normalized=str.includes(',')?str.replace(/\./g,'').replace(',','.'):str;
 return Number(normalized);
}
function monthFromCsv(s){
 if(typeof s==='number'){const d=new Date(Date.UTC(1899,11,30)+s*86400000);return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')}
 const v=String(s||'').trim();const d=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(d)return d[3]+'-'+d[2].padStart(2,'0');
 if(/^\d{4}-\d{2}/.test(v))return v.slice(0,7);
 if(/^\d{5}$/.test(v))return monthFromCsv(Number(v));return null;
}
function prepareCsv(csv){
 const rows=csvRows(csv),found=[],issues=[];
 if(!rows.some(r=>String(r[2]||'').trim()==='Descrição'&&String(r[5]||'').includes('Valor total')))throw Error('CSV inválido: exporte a aba Cartões inteira, sem remover colunas.');
 for(let index=9;index<rows.length;index++){
 const r=rows[index],line=index+1;
 const desc=(r[2]||'').trim(),account=(r[1]||'').trim(),amt=brAmount(r[5]),m=monthFromCsv(r[7]);
 if(desc&&account&&Number.isFinite(amt)&&amt>0){
  const count=Number(r[6])||1,rec=String(r[4]||'').toLowerCase().includes('parcel')&&count>1;
  if(!m||!Number.isInteger(count)||count<1||count>360){issues.push('Linha '+line+' com data/parcelas inválidas');continue}
  const id='sheets-card-purchase-'+line;
  found.push({id,description:desc,kind:'expense',amount:Math.round(amt*100/count)/100,date:m,category:(r[3]||'Outros').trim()||'Outros',frequency:rec?'installment':'once',count:rec?count:1,account,source:'Google Sheets Cartões',totalAmount:Math.round(amt*100)/100});
 }else if(desc&&account&&r[5]&&!Number.isFinite(amt)){issues.push('Linha '+line+' com valor inválido')}
 const subDesc=(r[13]||'').trim(),subAccount=(r[12]||'').trim(),subAmt=brAmount(r[15]),subM=monthFromCsv(r[16]),end=monthFromCsv(r[17]);
 if(subDesc&&subAccount&&Number.isFinite(subAmt)&&subAmt>0){if(!subM){issues.push('Assinatura da linha '+line+' com data inválida');continue}
  found.push({id:'sheets-card-recurring-'+line,description:subDesc,kind:'expense',amount:Math.round(subAmt*100)/100,date:subM,category:(r[14]||'Assinaturas').trim()||'Assinaturas',frequency:end?'installment':'monthly',count:end?Math.max(1,ix(end)-ix(subM)+1):1,account:subAccount,source:'Google Sheets Cartões'});
 }
 }
 if(!found.length)throw Error('Nenhuma compra ou assinatura válida encontrada. Confira se exportou a aba Cartões em CSV.');
 return {items:found,issues};
}
$('cardCsv').onchange=async e=>{pendingCards=[];$('confirmCards').disabled=true;const f=e.target.files[0];if(!f)return;try{
 if(f.size>2e6)throw Error('O arquivo deve ter no máximo 2 MB.');
 const parsed=prepareCsv(await f.text()),existing=new Set(data.items.map(i=>i.id));
 pendingCards=parsed.items.filter(i=>!existing.has(i.id));$('confirmCards').disabled=!pendingCards.length;
 $('cardPreview').textContent=parsed.items.length+' registros identificados; '+pendingCards.length+' novos; '+(parsed.items.length-pendingCards.length)+' já importados.'+(parsed.issues.length?' Atenção: '+parsed.issues.join('; '):'')+' Revise sua planilha antes de confirmar.';
 }catch(err){$('cardPreview').textContent='Não foi possível importar: '+err.message}finally{e.target.value=''}};
$('confirmCards').onclick=async()=>{
 if(!pendingCards.length)return;
 if(dirty){msg('Salve ou descarte as alterações pendentes antes de importar.');return}
 if(!await ensureSession()){msg('Entre novamente para importar.');return}
 if(!confirm('Importar '+pendingCards.length+' lançamentos do cartão para o Supabase privado? Os lançamentos existentes serão preservados.'))return;
 const before=JSON.parse(JSON.stringify(data));const current=new Set(data.items.map(i=>i.id));data.items.push(...pendingCards.filter(i=>!current.has(i.id)));dirtyRender();await save();
 if(dirty){data=before;render();msg('Falha no salvamento: os dados anteriores continuam no banco. Confira a conexão e tente novamente.')}else{pendingCards=[];$('confirmCards').disabled=true;$('cardPreview').textContent='Importação salva no Supabase. Confira os registros na aba Cartões.'}
};

window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
(async()=>{try{const old=JSON.parse(sessionStorage.getItem('finance_session')||'null');if(old){setSession(old);await load()}else setSession(null)}catch{setSession(null)}})();render();
})();