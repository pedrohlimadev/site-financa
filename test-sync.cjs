const assert=require('node:assert/strict');
require('./sync.js');
const initial=require('./dados.json');
(async()=>{
assert.equal(FinanceSync.validate(initial).expenses.reduce((s,x)=>s+x[1],0),3629.9);
assert.throws(()=>FinanceSync.validate({...initial,saving:-1}));
assert.throws(()=>FinanceSync.validate({...initial,expenses:[['Inválida',-5,'Outros']]}));
let calls=[];
global.fetch=async(url,opts)=>{calls.push({url,opts});return {ok:true,json:async()=>({sha:'read-sha',content:Buffer.from(JSON.stringify(initial)).toString('base64')})}};
let loaded=await FinanceSync.read('test-only');assert.equal(loaded.sha,'read-sha');assert.equal(loaded.state.expenses[3][0],'Psicólogo');
global.fetch=async(url,opts)=>{calls.push({url,opts});return {ok:true,json:async()=>({content:{sha:'new-sha'}})}};
const saved=await FinanceSync.write('test-only','read-sha',loaded.state);assert.equal(saved.sha,'new-sha');const sent=JSON.parse(calls.at(-1).opts.body);assert.equal(sent.sha,'read-sha');assert.equal(JSON.parse(Buffer.from(sent.content,'base64').toString()).expenses[3][0],'Psicólogo');assert(!Buffer.from(sent.content,'base64').toString().includes('test-only'));
global.fetch=async()=>({ok:false,status:409});await assert.rejects(()=>FinanceSync.write('test-only','old',loaded.state),/alterado/);
global.fetch=async()=>({ok:false,status:401});await assert.rejects(()=>FinanceSync.read('bad'),/credencial/);
console.log('OK: valores iniciais, validação, Unicode, leitura, gravação, conflito e autenticação.');
})().catch(e=>{console.error(e);process.exit(1)});
