'use strict';
window.IWEnquiry={
 message(service){const messages={
 'Photography':'Hello InstaWedd! I would like to enquire about photography. Please share your packages, coverage, deliverables and availability for my date.',
 'Makeup & Hair':'Hello Glowy! I would like to enquire about makeup and hair styling. Please share your packages, available looks and availability for my event.',
 'Gifting':'Hello InstaWedd! I would like details about gifts and personalised keepsakes. Please share the options, customisation, prices and delivery timelines.',
 'Event Management':'Hello InstaWedd! I would like help planning an event. Please share your planning, decor and coordination options, and availability.',
 'Multiple services':'Hello InstaWedd! I am interested in multiple services for my celebration. Please help me plan the photography, makeup, gifting and event arrangements.'};return messages[service]||'Hello InstaWedd! Please share the details and availability for '+service+'.'},
 apply(form,service){if(!form)return;if(service)form.elements.service.value=service;form.elements.message.value=this.message(form.elements.service.value)+(this.detail?' I am interested in the '+this.detail+' package.':'');}
};
