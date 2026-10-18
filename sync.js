(function(root){
'use strict';
const endpoint='https://api.github.com/repos/pedrohlimadev/site-financa/contents/dados.json';
function validate(data){
 if(!data||data.schemaVersion!==1||!Array.isArray(data.expenses)||data.expenses.length>300)throw Error('Formato de backup incompatível.');
 if(!data.expenses.every(x=>Array.isArray(x)&&x.length===3&&typeof x[0]==='string'&&x[0].trim().length>0&&x[0].length<=200&&Number.isFinite(x[1])&&x[1]>=0&&x[1]<=1e9&&typeof x[2]==='string'&&x[2].length<=100))throw Error('Despesas inválidas.');
 if(typeof data.include!=='boolean'||!Number.isFinite(data.saving)||data.saving<0||data.saving>1e9||!Number.isInteger(data.months)||data.months<1||data.months>60)throw Error('Valores da simulação inválidos.');
 return {expenses:data.expenses.map(x=>[...x]),include:data.include,saving:data.saving,months:data.months};
}
function headers(token){const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};if(token)h.Authorization='Bearer '+token;return h}
function error(status){if(status===409||status===422)return Error('O arquivo foi alterado ou a gravação foi recusada. Baixe um backup das suas alterações e recarregue os dados antes de tentar novamente.');if(status===401||status===403||status===404)return Error('Confira a credencial, sua validade e o acesso ao repositório. Para salvar, permita Contents: Read and write.');return Error('GitHub indisponível (HTTP '+status+'). Tente novamente ou baixe um backup.');}
const encode=s=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(''));
const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
async function read(token=''){const res=await fetch(endpoint+'?ref=main',{headers:headers(token),cache:'no-store'});if(!res.ok)throw error(res.status);const file=await res.json();if(!file.sha||typeof file.content!=='string')throw Error('Resposta inválida do GitHub.');return {sha:file.sha,state:validate(JSON.parse(decode(file.content)))}}
async function write(token,sha,state){if(!token||!sha)throw Error('Conecte antes de salvar.');const data={schemaVersion:1,updatedAt:new Date().toISOString(),...state};validate(data);const res=await fetch(endpoint,{method:'PUT',headers:{...headers(token),'Content-Type':'application/json'},body:JSON.stringify({branch:'main',message:'Atualizar dados financeiros pelo painel',sha,content:encode(JSON.stringify(data,null,2)+'\n')})});if(!res.ok)throw error(res.status);const file=await res.json();if(!file.content?.sha)throw Error('Confirmação de gravação incompleta. Recarregue os dados para conferir.');return {sha:file.content.sha}}
root.FinanceSync={read,write,validate};
})(globalThis);
