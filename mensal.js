(()=>{
'use strict';
const REPO='https://api.github.com/repos/pedrohlimadev/site-financa/contents/mensal.json';
const el=id=>document.getElementById(id);
const fmt=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const today=ym(new Date());
let data={schemaVersion:1,items:[],settled:{}},sha=null,token='',dirty=false,busy=false,edit=null;
el('month').value=today;el('date').value=today;
const encode=s=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(''));
const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const dateIndex=s=>{const [y,m]=s.split('-').map(Number);return y*12+m};
const monthAdd=(s,n)=>{const [y,m]=s.split('-').map(Number);return ym(new Date(y,m-1+n,1))};
function validate(x){
 if(!x||x.schemaVersion!==1||!Array.isArray(x.items)||x.items.length>10000||!x.settled||typeof x.settled!=='object'||Array.isArray(x.settled))throw Error('Arquivo de controle mensal inválido.');
 const ids=new Set();
 for(const i of x.items){
  if(!i||typeof i.id!=='string'||i.id.length>100||ids.has(i.id)||!['income','expense'].includes(i.kind)||typeof i.description!=='string'||!i.description.trim()||i.description.length>120||typeof i.category!=='string'||i.category.length>100||!Number.isFinite(i.amount)||i.amount<=0||i.amount>999999999||!/^\d{4}-(0[1-9]|1[0-2])$/.test(i.date)||!['once','monthly','installment'].includes(i.frequency)||!Number.isInteger(i.count)||i.count<1||i.count>360)throw Error('Lançamento inválido.');
  ids.add(i.id);
 }
 if(Object.keys(x.settled).length>50000||Object.values(x.settled).some(v=>v!==true))throw Error('Confirmações inválidas.');
 return {schemaVersion:1,items:x.items.map(i=>({...i})),settled:{...x.settled}};
}
const headers=()=>({...{'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},...(token?{Authorization:'Bearer '+token}:{})});
function message(v){el('msg').textContent=v}
function changed(){dirty=true;message('Alterações não salvas no GitHub.');render()}
function lock(v){busy=v;document.querySelectorAll('button').forEach(b=>b.disabled=v)}
async function fetchRemote(){
 const res=await fetch(REPO+'?ref=main',{headers:headers(),cache:'no-store'});
 if(!res.ok)throw Error('Não foi possível carregar o arquivo (HTTP '+res.status+').');
 const body=await res.json();
 const parsed=validate(JSON.parse(decode(body.content)));
 return {data:parsed,sha:body.sha};
}
async function load(force=false){
 if(dirty&&!force&&!confirm('Descartar alterações não salvas?'))return;
 lock(true);
 try{const r=await fetchRemote();data=r.data;sha=r.sha;dirty=false;message('Dados carregados do GitHub.');render()}
 catch(e){message(e.message+' Você pode continuar localmente e baixar um backup.')}
 finally{lock(false)}
}
async function save(){
 if(!token){el('auth').open=true;message('Informe e conecte seu token para salvar online.');return}
 if(!sha){message('Recarregue os dados com o token antes de gravar.');return}
 lock(true);
 try{
 const obj={...validate(data),updatedAt:new Date().toISOString()};
 const res=await fetch(REPO,{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({branch:'main',message:'Atualizar controle financeiro mensal',sha,content:encode(JSON.stringify(obj,null,2)+'\n')})});
 if(!res.ok)throw Error('Gravação não concluída (HTTP '+res.status+'). Se houve outra edição, baixe o backup antes de recarregar.');
 const body=await res.json();if(!body.content?.sha)throw Error('Resposta de gravação incompleta; recarregue para conferir.');
 sha=body.content.sha;dirty=false;message('Salvo no GitHub às '+new Date().toLocaleTimeString('pt-BR')+'.');
 }catch(e){message(e.message)}finally{lock(false)}
}
function visible(i,m){const delta=dateIndex(m)-dateIndex(i.date);return delta>=0&&(i.frequency==='monthly'||(i.frequency==='once'&&delta===0)||(i.frequency==='installment'&&delta<i.count))}
const key=(i,m)=>i.id+'@'+m;
function occurrences(){const m=el('month').value;return data.items.filter(i=>visible(i,m)).map(i=>({...i,paid:!!data.settled[key(i,m)],part:i.frequency==='installment'?dateIndex(m)-dateIndex(i.date)+1:null}))}
function render(){
 const all=occurrences();
 const total=k=>all.filter(i=>i.kind===k).reduce((a,b)=>a+b.amount,0);
 const inc=total('income'),exp=total('expense'),balance=inc-exp;
 const actual=all.filter(i=>i.paid).reduce((a,b)=>a+(b.kind==='income'?b.amount:-b.amount),0);
 el('income').textContent=fmt(inc);el('expense').textContent=fmt(exp);el('balance').textContent=fmt(balance);el('actual').textContent=fmt(actual);
 el('balance').className=balance<0?'negative':'positive';el('actual').className=actual<0?'negative':'positive';
 const f=el('filter').value;
 const filtered=all.filter(i=>f==='all'||(f==='open'?!i.paid:i.kind===f));
 const body=el('rows');body.replaceChildren();el('empty').hidden=filtered.length!==0;
 for(const i of filtered){
 const tr=document.createElement('tr');
 const c1=document.createElement('td'),b=document.createElement('strong'),small=document.createElement('small');b.textContent=i.description;small.textContent=i.frequency==='installment'?'Parcela '+i.part+'/'+i.count:i.frequency==='monthly'?'Recorrente':'Único';c1.append(b,small);
 const c2=document.createElement('td');c2.textContent=i.category;
 const c3=document.createElement('td');c3.textContent=(i.kind==='expense'?'− ':'+ ')+fmt(i.amount);c3.className=i.kind==='expense'?'negative':'positive';
 const c4=document.createElement('td'),check=document.createElement('input');check.type='checkbox';check.checked=i.paid;check.setAttribute('aria-label','Confirmar '+i.description);check.style.width='auto';check.onchange=()=>{if(check.checked)data.settled[key(i,el('month').value)]=true;else delete data.settled[key(i,el('month').value)];changed()};c4.append(check,document.createTextNode(i.paid?' Confirmado':' Pendente'));
 const c5=document.createElement('td'),actions=document.createElement('div');actions.className='rowbuttons';
 const editBtn=document.createElement('button');editBtn.className='small';editBtn.textContent='Editar';editBtn.onclick=()=>startEdit(i.id);
 const delBtn=document.createElement('button');delBtn.className='small';delBtn.textContent='Excluir';delBtn.onclick=()=>remove(i.id);
 actions.append(editBtn,delBtn);c5.append(actions);tr.append(c1,c2,c3,c4,c5);body.append(tr);
 }
}
function resetForm(){edit=null;el('form').reset();el('date').value=el('month').value;el('formTitle').textContent='Novo lançamento';el('submit').textContent='Adicionar';el('cancel').hidden=true;el('countWrap').hidden=true}
function startEdit(id){const i=data.items.find(x=>x.id===id);if(!i)return;edit=id;for(const field of ['kind','description','amount','date','category','frequency','count'])el(field).value=i[field];el('countWrap').hidden=i.frequency!=='installment';el('formTitle').textContent='Editar lançamento';el('submit').textContent='Salvar edição';el('cancel').hidden=false;window.scrollTo({top:0,behavior:'smooth'})}
function remove(id){const i=data.items.find(x=>x.id===id);if(!i||!confirm('Excluir "'+i.description+'" de todos os meses, incluindo confirmações?'))return;data.items=data.items.filter(x=>x.id!==id);Object.keys(data.settled).forEach(k=>{if(k.startsWith(id+'@'))delete data.settled[k]});if(edit===id)resetForm();changed()}
el('form').onsubmit=e=>{e.preventDefault();const i={id:edit||('l'+Date.now().toString(36)+Math.random().toString(36).slice(2,9)),kind:el('kind').value,description:el('description').value.trim(),amount:Number(el('amount').value),date:el('date').value,category:el('category').value,frequency:el('frequency').value,count:el('frequency').value==='installment'?Number(el('count').value):1};try{validate({schemaVersion:1,items:[i],settled:{}})}catch(err){message(err.message);return}if(edit){const ix=data.items.findIndex(x=>x.id===edit);data.items[ix]=i;}else data.items.push(i);resetForm();changed()};
el('frequency').onchange=()=>el('countWrap').hidden=el('frequency').value!=='installment';
el('cancel').onclick=resetForm;el('month').onchange=()=>{resetForm();render()};
el('prev').onclick=()=>{el('month').value=monthAdd(el('month').value,-1);resetForm();render()};
el('next').onclick=()=>{el('month').value=monthAdd(el('month').value,1);resetForm();render()};
el('filter').onchange=render;
el('connect').onclick=async()=>{const v=el('token').value.trim();if(!v){message('Informe um token.');return}if(dirty&&!confirm('Conectar vai recarregar os dados e descartar edições não salvas. Deseja continuar?'))return;token=v;el('token').value='';await load(true)};
el('disconnect').onclick=()=>{token='';el('token').value='';message('Desconectado. Dados ainda visíveis; reconecte para salvar.')};
el('save').onclick=save;el('reload').onclick=()=>load();
el('backup').onclick=()=>{const blob=new Blob([JSON.stringify({...data,updatedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='controle-mensal-'+today+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
el('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>3000000)throw Error('Arquivo muito grande.');const next=validate(JSON.parse(await file.text()));if(confirm('Substituir os lançamentos atuais pelo backup?')){data=next;changed()}}catch(err){message('Falha na importação: '+err.message)}finally{e.target.value=''}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
render();load(true);
})();