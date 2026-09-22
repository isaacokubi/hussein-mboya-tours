import fs from "fs";
import crypto from "crypto";
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getTenantContext } from "../tenancy/context.js";
import env from "./env.js";

const projectId = env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const privateKey = env.FIREBASE_PRIVATE_KEY ? String(env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n") : "";
const credential = env.FIREBASE_CLIENT_EMAIL && privateKey
  ? cert({ projectId, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey })
  : env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON))
    : env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? cert(JSON.parse(fs.readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8")))
      : applicationDefault();

if (!getApps().length) initializeApp({ credential, projectId });

export const db = getFirestore();
export const firebase = { connection: { readyState: 1, close: async () => db.terminate() } };
export const FieldValues = FieldValue;
export const TimestampValue = Timestamp;

const clone = (value) => {
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, clone(v)]));
  return value;
};
const getPath = (obj, path) => String(path).split(".").reduce((v,k) => v == null ? undefined : v[k], obj);
const setPath = (obj, path, value) => {
  const parts=String(path).split("."); let cur=obj;
  parts.slice(0,-1).forEach(k=>{ if (!cur[k] || typeof cur[k] !== "object") cur[k]={}; cur=cur[k]; });
  cur[parts.at(-1)]=value;
};
const delPath = (obj,path) => { const p=String(path).split("."); let c=obj; for(let i=0;i<p.length-1;i++){if(!c?.[p[i]]) return;c=c[p[i]];} if(c) delete c[p.at(-1)]; };
const eq = (a,b) => {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if (a instanceof Date || b instanceof Date) return new Date(a).getTime() === new Date(b).getTime();
  if (Array.isArray(a)) return a.some(x=>eq(x,b));
  return String(a) === String(b);
};
const matchValue = (actual, expected) => {
  if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date) && !(expected instanceof Timestamp)) {
    return Object.entries(expected).every(([op,val])=>{
      if(op==="$in") return Array.isArray(val) && val.some(x=>eq(actual,x));
      if(op==="$nin") return Array.isArray(val) && !val.some(x=>eq(actual,x));
      if(op==="$ne") return !eq(actual,val);
      if(op==="$gt") return actual != null && actual > val;
      if(op==="$gte") return actual != null && actual >= val;
      if(op==="$lt") return actual != null && actual < val;
      if(op==="$lte") return actual != null && actual <= val;
      if(op==="$exists") return val ? actual !== undefined : actual === undefined;
      if(op==="$regex") return new RegExp(val, expected.$options || "").test(String(actual ?? ""));
      if(op==="$options") return true;
      if(op==="$size") return Array.isArray(actual) && actual.length === val;
      if(op==="$all") return Array.isArray(actual) && val.every(x=>actual.some(y=>eq(x,y)));
      return eq(actual,expected);
    });
  }
  if (Array.isArray(expected)) return Array.isArray(actual) && expected.length===actual.length && expected.every((x,i)=>eq(actual[i],x));
  return eq(actual,expected);
};
const matches = (doc, filter={}) => Object.entries(filter).every(([key,expected])=>{
  if(key==="$or") return expected.some(f=>matches(doc,f));
  if(key==="$and") return expected.every(f=>matches(doc,f));
  if(key==="$nor") return !expected.some(f=>matches(doc,f));
  return matchValue(getPath(doc,key),expected);
});
const project = (doc, spec) => {
  if(!spec) return doc;
  const entries=Object.entries(spec); const include=entries.some(([,v])=>v===1||v===true);
  if(!include) { const out={...doc}; for(const [k,v] of entries) if(v===0||v===false) delPath(out,k); return out; }
  const out={}; for(const [k,v] of entries) if(v===1||v===true){const x=getPath(doc,k); if(x!==undefined)setPath(out,k,x);} if(spec._id!==0) out._id=doc._id; return out;
};

class Schema {
  constructor(definition={}, options={}) { this.definition=definition; this.options=options; this._pre={}; this._post={}; this._virtuals={}; this.methods={}; this.statics={}; this.plugins=[]; }
  index(){ return this; }
  pre(event, fn){ (this._pre[event] ||= []).push(fn); return this; }
  post(event, fn){ (this._post[event] ||= []).push(fn); return this; }
  virtual(name){ const self=this; return { get(fn){self._virtuals[name]={get:fn}; return self;}, set(fn){self._virtuals[name]={...(self._virtuals[name]||{}),set:fn}; return self;} }; }
  plugin(fn, opts){ if(typeof fn==="function") fn(this,opts); this.plugins.push(fn); return this; }
}
Schema.Types={ ObjectId:String, Mixed:Object, Map:Object, Decimal128:Number, Buffer:Buffer };

const normalize = (data, id) => {
  const out=clone(data||{});
  if(out._id==null) out._id=id;
  return out;
};
const applyDefaults = (schema, data) => {
  const out={...data};
  const walk=(defs,target)=>{
    for(const [key,rule] of Object.entries(defs||{})){
      if(rule && typeof rule==="object" && !Array.isArray(rule) && !("type" in rule)) { if(target[key]==null) target[key]={}; walk(rule,target[key]); continue; }
      if(target[key]===undefined && rule && typeof rule==="object" && "default" in rule) target[key]=typeof rule.default==="function"?rule.default():rule.default;
    }
  };
  walk(schema.definition,out);
  if(schema.options?.timestamps){const now=new Date(); if(!out.createdAt)out.createdAt=now; out.updatedAt=now;}
  return out;
};
const invokeHooks = async (schema,event,ctx) => { for(const fn of schema._pre[event]||[]) await new Promise((resolve,reject)=>{let done=false; const next=e=>{done=true;e?reject(e):resolve();}; const r=fn.call(ctx,next); if(r?.then)r.then(()=>{if(!done)resolve();}).catch(reject); else if(fn.length===0&&!done)resolve();}); };

class Query {
  constructor(model, filter={}, op="find"){this.model=model;this.filter=filter;this.op=op;this._sort=null;this._limit=null;this._skip=0;this._select=null;this._pop=[];this._session=null;this._lean=false;}
  sort(spec){this._sort=spec;return this;} limit(n){this._limit=n;return this;} skip(n){this._skip=n;return this;} select(s){this._select=typeof s==="string"?Object.fromEntries(s.split(/\s+/).filter(Boolean).map(x=>[x.startsWith("-")?x.slice(1):x,x.startsWith("-")?0:1])):s;return this;}
  populate(p){if(Array.isArray(p))this._pop.push(...p);else this._pop.push(p);return this;} lean(){this._lean=true;return this;} session(s){this._session=s;return this;}
  async exec(){return this.model._execute(this);}
  then(a,b){return this.exec().then(a,b);}
  catch(b){return this.exec().catch(b);}
  finally(f){return this.exec().finally(f);}
}
const collectionName = name => name.charAt(0).toLowerCase()+name.slice(1);
const populateOne = async (doc, spec) => {
  const path=typeof spec==="string"?spec:spec?.path; if(!path)return doc;
  const def=doc.__schema?.definition?.[path]; const ref=spec?.model || def?.ref || def?.type?.ref;
  const id=getPath(doc,path); if(!ref || id==null)return doc;
  const Model=registry.get(ref); if(!Model)return doc;
  if(Array.isArray(id)){const vals=[];for(const x of id){const v=await Model.findById(x).lean();if(v)vals.push(v);}setPath(doc,path,vals);}
  else {const v=await Model.findById(id).lean();if(v)setPath(doc,path,v);}
  return doc;
};

const registry=new Map();
function buildModel(name,schema){
  if(registry.has(name)) return registry.get(name);
  class Model {
    constructor(data={}){Object.assign(this,applyDefaults(schema,data));this.__schema=schema;this.isNew=!this._id;this.$wasNew=this.isNew;for(const [n,v] of Object.entries(schema.methods||{}))this[n]=v.bind(this);for(const [n,v] of Object.entries(schema._virtuals||{}))Object.defineProperty(this,n,{enumerable:true,get:()=>v.get? v.get.call(this):undefined,set:x=>v.set?.call(this,x)});}
    toJSON(){const o={...this};delete o.__schema;return o;}
    toObject(){return this.toJSON();}
    isModified(){return true;}
    async save(options={}){const wasNew=this.isNew; if(!this._id)this._id=crypto.randomUUID(); this.isNew=false; const data=this.toJSON(); await invokeHooks(schema,"validate",this); await invokeHooks(schema,"save",this); data.updatedAt=schema.options?.timestamps?new Date():data.updatedAt; if(!data.createdAt&&schema.options?.timestamps)data.createdAt=new Date(); await db.collection(collectionName(name)).doc(String(this._id)).set(data,{merge:false}); for(const fn of schema._post.save||[]) await fn.call(this); return this;}
  }
  for(const [n,fn] of Object.entries(schema.statics||{})) Model[n]=fn.bind(Model);
  Model.modelName=name; Model.schema=schema; Model.collection=()=>db.collection(collectionName(name));
  Model._execute=async q=>{
    const col=db.collection(collectionName(name)); let docs;
    if(q._session?.get){ const snap=await q._session.get(col); docs=snap.docs.map(d=>normalize(d.data(),d.id)); }
    else { const snap=await col.get(); docs=snap.docs.map(d=>normalize(d.data(),d.id)); }
    docs=docs.filter(d=>matches(d,q.filter));
    if(q._sort){const specs=Object.entries(q._sort);docs.sort((a,b)=>{for(const [k,dir] of specs){const av=getPath(a,k),bv=getPath(b,k);if(eq(av,bv))continue;return (av>bv?1:-1)*(Number(dir)||1);}return 0;});}
    if(q._skip)docs=docs.slice(q._skip);if(q._limit!=null)docs=docs.slice(0,q._limit);
    docs=docs.map(d=>project(d,q._select));
    if(q._pop.length){for(const d of docs)for(const p of q._pop)await populateOne(d,p);}
    const result=docs.map(d=>new Model(d));
    if(q._lean)return result.map(x=>x.toJSON());
    if(q.op==="findOne")return result[0]||null;
    if(q.op==="findById")return result[0]||null;
    return result;
  };
  Model.find=(f={})=>new Query(Model,f,"find");
  Model.findOne=(f={})=>new Query(Model,f,"findOne");
  Model.findById=(id)=>new Query(Model,{_id:String(id)},"findById");
  Model.exists=async(f={})=>Boolean((await Model.findOne(f).lean()));
  Model.countDocuments=async(f={})=>(await Model.find(f).lean()).length;
  Model.distinct=async(field,f={})=>[...new Set((await Model.find(f).lean()).map(x=>getPath(x,field)).filter(x=>x!==undefined))];
  Model.create=async(data)=>{if(Array.isArray(data)){const out=[];for(const d of data)out.push(await new Model(d).save());return out;}return new Model(data).save();};
  Model.insertMany=async(arr)=>Promise.all(arr.map(x=>new Model(x).save()));
  Model.updateOne=async(filter,update,options={})=>{const d=await Model.findOne(filter);if(!d)return {matchedCount:0,modifiedCount:0};await applyUpdate(d,update);await d.save();return {matchedCount:1,modifiedCount:1};};
  Model.updateMany=async(filter,update)=>{const docs=await Model.find(filter);for(const d of docs){await applyUpdate(d,update);await d.save();}return {matchedCount:docs.length,modifiedCount:docs.length};};
  Model.findOneAndUpdate=async(filter,update,options={})=>{let d=await Model.findOne(filter);if(!d&&options.upsert)d=new Model({...filter,...(update.$set||update)});if(!d)return null;await applyUpdate(d,update);await d.save();return d;};
  Model.findByIdAndUpdate=(id,u,o={})=>Model.findOneAndUpdate({_id:String(id)},u,o);
  Model.deleteOne=async(f)=>{const d=await Model.findOne(f).lean();if(!d)return {deletedCount:0};await colDelete(collectionName(name),d._id);return {deletedCount:1};};
  Model.deleteMany=async(f)=>{const docs=await Model.find(f).lean();for(const d of docs)await colDelete(collectionName(name),d._id);return {deletedCount:docs.length};};
  Model.aggregate=async(pipeline=[])=>runAggregate(name,pipeline);
  Model.paginate=async(f={},opts={})=>{const all=await Model.find(f).sort(opts.sort||{}).skip(((opts.page||1)-1)*(opts.limit||10)).limit(opts.limit||10).lean();const total=await Model.countDocuments(f);return {docs:all,totalDocs:total,limit:opts.limit||10,page:opts.page||1,totalPages:Math.ceil(total/(opts.limit||10)),hasNextPage:(opts.page||1)<Math.ceil(total/(opts.limit||10)),hasPrevPage:(opts.page||1)>1};};
  registry.set(name,Model); models[name]=Model; return Model;
}
async function colDelete(name,id){await db.collection(name).doc(String(id)).delete();}
async function applyUpdate(doc,u){
  if(!u)return;
  if(u.$set)for(const[k,v]of Object.entries(u.$set))setPath(doc,k,v);
  if(u.$unset)for(const k of Object.keys(u.$unset))delPath(doc,k);
  if(u.$inc)for(const[k,v]of Object.entries(u.$inc))setPath(doc,k,Number(getPath(doc,k)||0)+Number(v));
  if(u.$push)for(const[k,v]of Object.entries(u.$push)){const a=Array.isArray(getPath(doc,k))?getPath(doc,k):[];a.push(v);setPath(doc,k,a);}
  if(u.$addToSet)for(const[k,v]of Object.entries(u.$addToSet)){const a=Array.isArray(getPath(doc,k))?getPath(doc,k):[];if(!a.some(x=>eq(x,v)))a.push(v);setPath(doc,k,a);}
  if(u.$pull)for(const[k,v]of Object.entries(u.$pull)){const a=Array.isArray(getPath(doc,k))?getPath(doc,k):[];setPath(doc,k,a.filter(x=>!matchValue(x,v)));}
  for(const[k,v]of Object.entries(u))if(!k.startsWith("$"))setPath(doc,k,v);
}
async function runAggregate(name,pipeline){
  let rows=await db.collection(collectionName(name)).get(); let data=rows.docs.map(d=>normalize(d.data(),d.id));
  for(const stage of pipeline){
    if(stage.$match)data=data.filter(d=>matches(d,stage.$match));
    else if(stage.$sort){const s=stage.$sort;data.sort((a,b)=>{for(const[k,dir]of Object.entries(s)){const av=getPath(a,k),bv=getPath(b,k);if(eq(av,bv))continue;return(av>bv?1:-1)*(dir||1);}return 0;});}
    else if(stage.$skip)data=data.slice(stage.$skip);
    else if(stage.$limit)data=data.slice(0,stage.$limit);
    else if(stage.$project)data=data.map(d=>project(d,stage.$project));
    else if(stage.$unset){const keys=Array.isArray(stage.$unset)?stage.$unset:[stage.$unset];data=data.map(d=>{const x={...d};keys.forEach(k=>delPath(x,k));return x;});}
    else if(stage.$unwind){const p=typeof stage.$unwind==="string"?stage.$unwind:stage.$unwind.path;const k=p.replace(/^\$/,"");const out=[];for(const d of data){const a=getPath(d,k);if(Array.isArray(a)){for(const v of a){const x=JSON.parse(JSON.stringify(d));setPath(x,k,v);out.push(x);}}else if(a!==undefined)out.push(d);}data=out;}
    else if(stage.$count){data=[{[stage.$count]:data.length}];}
    else if(stage.$group){const g=stage.$group;const groups=new Map();for(const d of data){const key=JSON.stringify(g._id===null?null:typeof g._id==="string"?getPath(d,g._id.replace(/^\$/,"")):g._id);if(!groups.has(key))groups.set(key,{_id:g._id===null?null:typeof g._id==="string"?getPath(d,g._id.replace(/^\$/,"")):g._id});const out=groups.get(key);for(const[k,expr]of Object.entries(g)){if(k==="_id")continue;const op=Object.keys(expr)[0],field=expr[op];if(op==="$sum")out[k]=(out[k]||0)+(field===1?1:Number(getPath(d,String(field).replace(/^\$/,""))||0));else if(op==="$max")out[k]=out[k]==null?getPath(d,String(field).replace(/^\$/,"")):Math.max(out[k],Number(getPath(d,String(field).replace(/^\$/,""))||0));else if(op==="$min")out[k]=out[k]==null?getPath(d,String(field).replace(/^\$/,"")):Math.min(out[k],Number(getPath(d,String(field).replace(/^\$/,""))||0));else if(op==="$push")(out[k] ||= []).push(field==="$$ROOT"?d:getPath(d,String(field).replace(/^\$/,"")));else if(op==="$addToSet"){out[k] ||= [];const v=field==="$$ROOT"?d:getPath(d,String(field).replace(/^\$/,""));if(!out[k].some(x=>eq(x,v)))out[k].push(v);}}}data=[...groups.values()];}
  }
  return data;
}

export { Schema, buildModel as model, buildModel as defaultModel, matches as matchesFilter };
export const Types={ObjectId:(value)=>String(value ?? crypto.randomUUID()), Mixed:Object};
export const isValidObjectId=(value)=>value!=null && String(value).length>0;
export const models={};
export const model=(name,schema)=>buildModel(name,schema);
export const connection=firebase.connection;
export const startSession=async()=>({withTransaction:async fn=>fn({}),endSession:async()=>{}});

export async function connectFirestore(){await db.listCollections();return db;}
