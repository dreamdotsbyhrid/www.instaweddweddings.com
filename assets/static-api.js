/* Public, build-time website snapshot. No database or account credentials. */
'use strict';
window.api=async(route,options={})=>{
 if(options.method&&!['GET','HEAD'].includes(options.method))throw new Error('Please contact the studio on WhatsApp or email.');
 const value=window.IW_PUBLIC_CONTENT[String(route).split('?')[0]];
 if(!value)throw new Error('This feature needs the full website. Please contact the studio.');
 return structuredClone(value);
};
window.Auth={user:null,config:{paymentReady:false},ready:Promise.resolve(null),open:async()=>false,logout:async()=>{}};
