
// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
revealEls.forEach(el=>io.observe(el));

// ---- Mobile drawer ----
const menuToggle = document.getElementById('menuToggle');
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerClose = document.getElementById('drawerClose');
function openDrawer(){ drawer.classList.add('open'); drawerBackdrop.classList.add('open'); }
function closeDrawer(){ drawer.classList.remove('open'); drawerBackdrop.classList.remove('open'); }
menuToggle.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a:not(#drawerAccountLink)').forEach(a=>a.addEventListener('click', closeDrawer));

// ---- FIX: All "Book a Consultation" / "Enquire" buttons open the consult modal ----
// We use event delegation on document so it catches dynamically rendered buttons too.
document.addEventListener('click', function(e){
  const trigger = e.target.closest('.js-consult-trigger');
  if(!trigger) return;
  e.preventDefault();
  closeDrawer();
  openConsultModal();
});

// ---- Shop-by pills ----
const shopFilters = {
  all: { category:'all', min:20, max:100000 },
  couple: { category:'couple', min:20, max:100000 },
  guests: { category:'return-gift', min:20, max:100000 },
  squad: { category:'bridal-hamper', min:20, max:100000 },
  hampers: { category:'hampers', min:20, max:100000 },
  under999: { category:'all', min:20, max:999 }
};
document.querySelectorAll('.shopby button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.shopby button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = shopFilters[btn.dataset.shopFilter] || shopFilters.all;
    openGiftShop(filter.category, filter.min, filter.max);
  });
});

// ---- Gifting shop and cart ----
const giftProducts = [
  { id:'journal', category:'journals', name:'Wedding Journal', price:899, image:'image/save.jpeg', detail:'Hardbound journal for vows, plans and memories.' },
  { id:'diary', category:'journals', name:'Personalised Diary', price:699, image:'image/album.jpeg', detail:'Name-printed diary with a keepsake cover.' },
  { id:'accessories', category:'accessories', name:'Wedding Accessories Set', price:799, image:'image/deco.jpeg', detail:'A coordinated set for your celebration details.' },
  { id:'hamper', category:'hampers', name:'Wedding Hamper', price:1499, image:'image/gift.jpeg', detail:'Curated celebration treats in a ready-to-gift box.' },
  { id:'bridal-hamper', category:'bridal-hamper', name:'Bridal Hamper', price:1899, image:'image/gifft.jpeg', detail:'Thoughtful essentials for the bride-to-be.' },
  { id:'engagement-hamper', category:'engagement-hamper', name:'Engagement Hamper', price:1599, image:'image/gift.jpeg', detail:'A sweet welcome-to-forever gift set.' },
  { id:'bouquet', category:'bouquets', name:'Keepsake Bouquet', price:999, image:'assets/illustrations/flowers.png', detail:'A styled bouquet for portraits, gifting or décor.' },
  { id:'bridal-kit', category:'bridal-kit', name:'Bridal Kit', price:1299, image:'image/bridemakeup.jpeg', detail:'Compact wedding-day essentials in one kit.' },
  { id:'return-gift', category:'return-gift', name:'Return Gift Box', price:399, image:'image/return.jpeg', detail:'Customisable guest gifts, available in bulk.' },
  { id:'crochet', category:'crochet', name:'Crochet Couple Keepsake', price:799, image:'image/motherhood.jpeg', detail:'Handmade keepsake made for the couple.' },
  { id:'photoframe', category:'photoframes', name:'Personalised Photo Frame', price:599, image:'image/thank you.jpeg', detail:'Add a name, date or caption to your frame.' },
  { id:'album', category:'albums', name:'Classic Photo Album', price:1499, image:'image/album.jpeg', detail:'Premium album for your favourite wedding photographs.' },
  { id:'book-album', category:'book-albums', name:'Storybook Album', price:2499, image:'image/wedd.jpeg', detail:'A printed storybook layout for your full celebration.' },
  { id:'printables', category:'printables', name:'Wedding Printables', price:299, image:'image/savethedate.jpeg', detail:'Invites, table cards and signage for your theme.' },
  { id:'magnet', category:'fridge-magnets', name:'Fridge Magnet Set', price:499, image:'image/marriage.jpeg', detail:'Small photo keepsakes for your guests and family.' }
];
const giftCategories = [
  ['all','All products'], ['journals','Journals & diaries'], ['accessories','Accessories'], ['hampers','Hampers'],
  ['bridal-hamper','Bridal hamper'], ['engagement-hamper','Engagement hamper'], ['bouquets','Bouquets'], ['bridal-kit','Bridal kit'],
  ['return-gift','Return gifts'], ['crochet','Crochet'], ['photoframes','Photoframes'], ['albums','Albums'], ['book-albums','Book albums'],
  ['printables','Printables'], ['fridge-magnets','Fridge magnets']
];
const giftDetail = document.getElementById('giftDetail');
const giftProductsEl = document.getElementById('giftProducts');
const giftCategoryTabs = document.getElementById('giftCategoryTabs');
const giftCartPanel = document.getElementById('giftCartPanel');
const giftCartLines = document.getElementById('giftCartLines');
const giftCartCount = document.getElementById('giftCartCount');
const giftCartTotal = document.getElementById('giftCartTotal');
const giftMinPrice = document.getElementById('giftMinPrice');
const giftMaxPrice = document.getElementById('giftMaxPrice');
const giftMinRange = document.getElementById('giftMinRange');
const giftMaxRange = document.getElementById('giftMaxRange');
const giftFilterToggle = document.getElementById('giftFilterToggle');
const giftPriceFilter = document.getElementById('giftPriceFilter');
const giftConfirm = document.getElementById('giftConfirm');
const giftConfirmText = document.getElementById('giftConfirmText');
const giftConfirmBtn = document.getElementById('giftConfirmBtn');
const giftCartBuyBtn = document.getElementById('giftCartBuyBtn');
const photoCheckout = document.getElementById('photoCheckout');
const checkoutPhotoGrid = document.getElementById('checkoutPhotoGrid');
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutAddPhotos = document.getElementById('checkoutAddPhotos');
const checkoutAddress = document.getElementById('checkoutAddress');
const checkoutStatus = document.getElementById('checkoutStatus');
let pendingGiftId = null;
const giftCart = IWStore.read('cart', []);
let activeGiftCategory = 'all';
let activeGiftMinPrice = 20;
let activeGiftMaxPrice = 100000;
const giftCategoryAliases = { couple:'all' };
const money = amount => `₹${amount.toLocaleString('en-IN')}`;
function renderGiftCategories(){
  giftCategoryTabs.innerHTML = giftCategories.map(([id,label])=>`<button type="button" class="${id === activeGiftCategory ? 'active' : ''}" data-gift-filter="${IWStore.escape(id)}">${id!=='all'&&giftProducts.find(p=>p.category===id)?`<img src="${IWStore.escape(giftProducts.find(p=>p.category===id).image)}" alt="">`:'<span aria-hidden="true">♡</span>'}${IWStore.escape(label)}</button>`).join('');
  giftCategoryTabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click', ()=>{
    activeGiftCategory = btn.dataset.giftFilter;
    renderGiftCategories();
    renderGiftProducts();
  }));
}
function renderGiftProducts(){
  const visible = giftProducts.filter(product=>{
    const matchesCategory = activeGiftCategory === 'all' || product.category === activeGiftCategory;
    return matchesCategory && product.price >= activeGiftMinPrice && product.price <= activeGiftMaxPrice;
  });
  const sort=document.getElementById('giftSort')?.value;visible.sort((a,b)=>sort==='az'?a.name.localeCompare(b.name):sort==='za'?b.name.localeCompare(a.name):sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0);
  const savedIds = (window.savedWishlist||[]).map(item=>item.id);
  giftProductsEl.innerHTML = visible.map(product=>`<article class="gift-product">
    <button type="button" class="heart-btn ${savedIds.includes(product.id)?'active':''}" data-wish="${IWStore.escape(product.id)}" aria-label="Save ${IWStore.escape(product.name)}">♥</button>
    <img ${product.image.startsWith('/uploads/')||product.x!==undefined?'':`data-image-slot="gift-${IWStore.escape(product.id)}"`} style="object-fit:${product.fit||'cover'};object-position:${product.x??50}% ${product.y??50}%" src="${IWStore.escape(product.image)}" alt="${IWStore.escape(product.name)}" onerror="this.onerror=null;this.classList.add('image-unavailable')">
    <div class="gift-product-body"><small>${IWStore.escape(giftCategories.find(([id])=>id === product.category)?.[1] || 'Gifting')}</small><h4>${IWStore.escape(product.name)}</h4><p>${IWStore.escape(product.detail)}</p>
      <div class="gift-product-foot"><span class="gift-product-price">${money(product.price)}</span></div>
      <button type="button" class="gift-buy" data-gift-buy="${IWStore.escape(product.id)}">Buy now</button>
    </div></article>`).join('');
  giftProductsEl.querySelectorAll('[data-gift-buy]').forEach(btn=>btn.addEventListener('click', ()=>{addGiftToCart(btn.dataset.giftBuy);openWorkspace('payment')}));
  giftProductsEl.querySelectorAll('[data-wish]').forEach(btn=>btn.addEventListener('click', ()=>toggleWishlist(btn.dataset.wish)));
}
function renderGiftCart(){
  IWStore.write('cart', giftCart);
  const count = giftCart.reduce((sum,item)=>sum + item.quantity, 0);
  const total = giftCart.reduce((sum,item)=>sum + item.price * item.quantity, 0);
  giftCartCount.textContent = count;window.dispatchEvent(new Event('cart-change'));
  giftCartLines.innerHTML = giftCart.length ? giftCart.map(item=>`<div class="gift-cart-line"><span class="gift-cart-item"><strong>${IWStore.escape(item.name)}</strong><small>${money(item.price)} each</small></span><span class="gift-qty"><button type="button" data-gift-minus="${IWStore.escape(item.id)}" aria-label="Remove one ${IWStore.escape(item.name)}">−</button><span>${item.quantity}</span><button type="button" data-gift-plus="${IWStore.escape(item.id)}" aria-label="Add one ${IWStore.escape(item.name)}">+</button></span><strong>${money(item.price * item.quantity)}</strong><button type="button" data-cart-remove="${IWStore.escape(item.id)}" aria-label="Remove item">Remove</button></div>`).join('') : '<p style="font-size:.82rem;color:#7a6d6d;margin:0;">Your cart is empty.</p>';
  giftCartTotal.textContent = money(total);giftCartLines.querySelectorAll('[data-cart-remove]').forEach(b=>b.onclick=()=>{const item=giftCart.find(i=>i.id===b.dataset.cartRemove);if(item)changeGiftQuantity(item.id,-item.quantity)});
  giftCartLines.querySelectorAll('[data-gift-minus]').forEach(button=>button.addEventListener('click', ()=>changeGiftQuantity(button.dataset.giftMinus, -1)));
  giftCartLines.querySelectorAll('[data-gift-plus]').forEach(button=>button.addEventListener('click', ()=>changeGiftQuantity(button.dataset.giftPlus, 1)));
}
function addGiftToCart(id){
  const product = giftProducts.find(item=>item.id === id);
  if(!product) return;
  const existing = giftCart.find(item=>item.id === id);
  if(existing) existing.quantity++;
  else giftCart.push({...product, quantity:1});
  renderGiftCart();
  giftCartPanel.classList.add('open');
}
function addCustomGiftToCart(product){
  giftCart.push({...product, images:product.images || []});
  renderGiftCart();
  giftCartPanel.classList.add('open');
  openPhotoCheckout();
}
function getPhotoOrderItems(){
  return giftCart.filter(item=>Array.isArray(item.images) && item.images.length);
}
function requirePhotoAccount(){return true;}
function renderPhotoCheckout(){
  const items = getPhotoOrderItems();
  const photos = items.flatMap(item=>item.images.map((image, index)=>({image, itemId:item.id, index})));
  checkoutPhotoGrid.innerHTML = photos.length ? photos.map(photo=>`<div class="checkout-photo"><img src="${photo.image.cropUrl || photo.image.url}" alt="Uploaded order photo"><span class="checkout-photo-check" aria-label="Photo selected">✓</span><button type="button" data-remove-photo="${photo.itemId}" data-photo-index="${photo.index}" aria-label="Remove photo">✕</button><button type="button" class="checkout-crop" data-crop-photo="${photo.itemId}" data-photo-index="${photo.index}">Crop</button></div>`).join('') : '<p style="font-size:.84rem;color:#7a6d6d;">No uploaded photos. Add photos to continue.</p>';
  const total = items.reduce((sum,item)=>sum + item.price * item.quantity, 0);
  checkoutSummary.innerHTML = items.map(item=>`<div class="checkout-summary-row"><span>${IWStore.escape(item.name)}<br><small>${item.images.length} uploaded photo${item.images.length === 1 ? '' : 's'}</small></span><strong>${money(item.price * item.quantity)}</strong><button type="button" data-cart-remove="${IWStore.escape(item.id)}" aria-label="Remove item">Remove</button></div>`).join('');
  checkoutTotal.textContent = money(total);
  checkoutSummary.querySelectorAll('[data-cart-remove]').forEach(button=>button.onclick=()=>{const item=giftCart.find(x=>x.id===button.dataset.cartRemove);if(!item)return;changeGiftQuantity(item.id,-item.quantity);renderPhotoCheckout()});
  const printCount=items.filter(item=>/^personalized-(print|print-set)-/.test(item.id)).reduce((sum,item)=>sum+item.images.length*item.quantity,0);
  let shippingNote=document.getElementById('photoShippingNote');if(!shippingNote){shippingNote=document.createElement('p');shippingNote.id='photoShippingNote';shippingNote.className='small-order-note';checkoutSummary.after(shippingNote)}shippingNote.hidden=printCount===0||printCount>=10;shippingNote.textContent='↗ Ordering 10 prints together gives better value on shipping per photo. You can continue with fewer; the delivery charge is shown at checkout.';
  document.getElementById('photoPrintBtn').disabled=items.length===0;

  checkoutPhotoGrid.querySelectorAll('[data-remove-photo]').forEach(button=>button.addEventListener('click', ()=>removeCheckoutPhoto(button.dataset.removePhoto, Number(button.dataset.photoIndex))));
  checkoutPhotoGrid.querySelectorAll('[data-crop-photo]').forEach(button=>button.addEventListener('click', ()=>{
    const item = giftCart.find(product=>product.id === button.dataset.cropPhoto);
    const image = item?.images?.[Number(button.dataset.photoIndex)];
    if(image) openCropForImage(image, false);
  }));
}
function openPhotoCheckout(){
  renderPhotoCheckout();
  photoCheckout.classList.add('open');
  photoCheckout.setAttribute('aria-hidden','false');
}
function closePhotoCheckout(){
  photoCheckout.classList.remove('open');
  photoCheckout.setAttribute('aria-hidden','true');
  checkoutAddress.classList.remove('open');
  checkoutStatus.textContent = '';
}
function removeCheckoutPhoto(itemId, photoIndex){
  const item = giftCart.find(product=>product.id === itemId);
  if(!item || !item.images) return;
  const [removed] = item.images.splice(photoIndex, 1);
  if(removed && removed.url) URL.revokeObjectURL(removed.url);
  if(!item.name.includes('Frame')) item.price = item.images.length * 4;
  if(!item.images.length) giftCart.splice(giftCart.indexOf(item), 1);
  renderGiftCart();
  renderPhotoCheckout();
}
function openGiftConfirmation(id){
  const product = giftProducts.find(item=>item.id === id);
  if(!product) return;
  pendingGiftId = id;
  giftConfirmText.textContent = `${IWStore.escape(product.name)} — ${money(product.price)}`;
  giftConfirmBtn.textContent = 'Add to Cart';
  giftConfirm.classList.add('open');
  giftConfirm.setAttribute('aria-hidden','false');
}
function closeGiftConfirmation(){
  pendingGiftId = null;
  giftConfirmBtn.textContent = 'Add to Cart';
  giftConfirm.classList.remove('open');
  giftConfirm.setAttribute('aria-hidden','true');
}
function changeGiftQuantity(id, amount){
  const item = giftCart.find(product=>product.id === id);
  if(!item) return;
  item.quantity += amount;
  if(item.quantity <= 0) giftCart.splice(giftCart.indexOf(item), 1);
  renderGiftCart();
}
function openGiftShop(category='all', minPrice=20, maxPrice=100000){
  activeGiftCategory = giftCategoryAliases[category] || category;
  activeGiftMinPrice = Math.max(20, Number(minPrice) || 20);
  activeGiftMaxPrice = Math.min(100000, Number(maxPrice) || 100000);
  if(activeGiftMinPrice > activeGiftMaxPrice) [activeGiftMinPrice, activeGiftMaxPrice] = [activeGiftMaxPrice, activeGiftMinPrice];
  giftMinPrice.value = activeGiftMinPrice;
  giftMaxPrice.value = activeGiftMaxPrice;
  giftMinRange.value = activeGiftMinPrice;
  giftMaxRange.value = activeGiftMaxPrice;
  document.getElementById('giftDetailTitle').textContent = category === 'couple' ? 'For the Couple' : category === 'all' ? 'Wedding keepsakes' : giftCategories.find(([id])=>id === category)?.[1] || 'Wedding keepsakes';
  renderGiftCategories();
  renderGiftProducts();
  renderGiftCart();
  giftDetail.classList.add('open');
  giftDetail.setAttribute('aria-hidden','false');
}
function closeGiftShop(){ giftDetail.classList.remove('open'); giftDetail.setAttribute('aria-hidden','true'); }
document.querySelectorAll('.gift-card').forEach(card=>card.addEventListener('click', ()=>openGiftShop(card.dataset.giftCategory)));
document.getElementById('giftDetailClose').addEventListener('click', closeGiftShop);
giftDetail.addEventListener('click', event=>{ if(event.target === giftDetail) closeGiftShop(); });
document.getElementById('giftCartBtn').addEventListener('click', ()=>{
  if(!giftDetail.classList.contains('open')) openGiftShop();
  giftCartPanel.classList.toggle('open');
  document.getElementById('giftCartBtn').setAttribute('aria-expanded', giftCartPanel.classList.contains('open'));
});
document.getElementById('giftApplyPrice').addEventListener('click', ()=>{
  activeGiftMinPrice = Math.max(20, Number(giftMinPrice.value) || 20);
  activeGiftMaxPrice = Math.min(100000, Number(giftMaxPrice.value) || 100000);
  if(activeGiftMinPrice > activeGiftMaxPrice) [activeGiftMinPrice, activeGiftMaxPrice] = [activeGiftMaxPrice, activeGiftMinPrice];
  giftMinPrice.value = activeGiftMinPrice;
  giftMaxPrice.value = activeGiftMaxPrice;
  giftMinRange.value = activeGiftMinPrice;
  giftMaxRange.value = activeGiftMaxPrice;
  renderGiftProducts();
});
giftFilterToggle.addEventListener('click', ()=>{
  const isOpen = giftPriceFilter.classList.toggle('open');
  giftFilterToggle.setAttribute('aria-expanded', isOpen);
});
function syncGiftRange(source){
  let minimum = Number(giftMinRange.value);
  let maximum = Number(giftMaxRange.value);
  if(minimum > maximum){
    if(source === giftMinRange) maximum = minimum;
    else minimum = maximum;
  }
  activeGiftMinPrice = minimum;
  activeGiftMaxPrice = maximum;
  giftMinPrice.value = minimum;
  giftMaxPrice.value = maximum;
  giftMinRange.value = minimum;
  giftMaxRange.value = maximum;
  renderGiftProducts();
}
giftMinRange.addEventListener('input', ()=>syncGiftRange(giftMinRange));
giftMaxRange.addEventListener('input', ()=>syncGiftRange(giftMaxRange));
document.getElementById('giftCancelBtn').addEventListener('click', closeGiftConfirmation);
giftConfirmBtn.addEventListener('click', ()=>{
  if(pendingGiftId) addGiftToCart(pendingGiftId);
  closeGiftConfirmation();
});
giftConfirm.addEventListener('click', event=>{ if(event.target === giftConfirm) closeGiftConfirmation(); });
giftCartBuyBtn.addEventListener('click', ()=>{if(giftCart.length)openWorkspace('payment');});
document.getElementById('photoCheckoutBack').addEventListener('click', closePhotoCheckout);
document.getElementById('checkoutAddMore').addEventListener('click', ()=>checkoutAddPhotos.click());
checkoutAddPhotos.addEventListener('change', async ()=>{
  const item = getPhotoOrderItems()[0];
  if(!item) return;
  const imageLimit = item.name.includes('Frame') ? 1 : 10;
  const remaining = Math.max(0, imageLimit - item.images.length);
  const startIndex = item.images.length;
  try { const added=await Promise.all([...checkoutAddPhotos.files].slice(0, remaining).map(async(file,index)=>({name:file.name,url:await localPhotoData(file),caption:defaultGiftCaption(startIndex+index)})));item.images.push(...added); } catch(error){showToast(error.message);return;}
  if(!item.name.includes('Frame')) item.price = item.images.length * 4;
  checkoutAddPhotos.value = '';
  renderGiftCart();
  renderPhotoCheckout();
});
document.getElementById('photoPrintBtn').addEventListener('click',()=>{if(getPhotoOrderItems().length)openWorkspace('payment');});
document.getElementById('checkoutPayBtn').addEventListener('click', ()=>{
  const fields = ['checkoutName','checkoutPhone','checkoutPincode','checkoutPostOffice','checkoutAddressText'].map(id=>document.getElementById(id));
  const valid = fields.every(field=>field.value.trim());
  if(!valid){ checkoutStatus.style.color = 'var(--maroon)'; checkoutStatus.textContent = 'Please complete your delivery details.'; return; }
  if(!/^\d{10}$/.test(document.getElementById('checkoutPhone').value.trim()) || !/^\d{6}$/.test(document.getElementById('checkoutPincode').value.trim())){
    checkoutStatus.style.color = 'var(--maroon)'; checkoutStatus.textContent = 'Enter a valid 10-digit phone number and 6-digit pincode.'; return;
  }
  checkoutStatus.style.color = '#4a7a3d';
  openWorkspace('payment');
});

// ---- Premium package toggle ----
const pkgData = {
  album: {
    price: '₹39,999',
    tag: 'Luxurious, glittering &amp; story-driven.',
    items: [
      '1 professional photographer',
      '100-page album with glitter prints',
      'Mini album, compact for gifting',
      'Personalised tabletop calendar',
      '2 ready-to-display framed prints',
      'Complimentary pre or post-wedding shoot'
    ]
  },
  film: {
    price: '₹39,999',
    tag: 'Photography, videography &amp; reels, edited fast.',
    items: [
      'Photography + videography',
      'Highlights video + Instagram reels',
      '60-page album + mini album',
      'Wall calendar + photo frames',
      'Album bag + pendrive box'
    ]
  }
};
document.querySelectorAll('.pkg-toggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.pkg-toggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const d = pkgData[btn.dataset.pkg];
    document.getElementById('premium-price').textContent = d.price;
    document.getElementById('premium-tag').innerHTML = d.tag;
    document.getElementById('premium-list').innerHTML = d.items.map(i=>`<li>✓ ${i}</li>`).join('');
  });
});

// ---- Photography package detail cards ----
const packageDetails = {
  full: {
    title: 'Full Wedding Packages',
    intro: 'Complete wedding coverage planned around your ceremony, celebrations and memories.',
    meta: ['From ₹23,999', '1-day to destination', 'Photo + album options'],
    images: ['image/marriage.jpeg', 'image/wedd.jpeg'],
    items: ['Professional wedding photographer', 'Candid and traditional coverage options', 'Premium edited photographs', 'Album and keepsake add-ons']
  },
  candid: {
    title: 'Candid & Traditional',
    intro: 'Choose the perfect balance of spontaneous moments and timeless ceremony portraits.',
    meta: ['Add-on', 'Two coverage styles', 'Flexible scheduling'],
    images: ['image/bride.jpeg', 'image/bridemus.jpeg'],
    items: ['Candid storytelling coverage', 'Traditional family and ceremony portraits', 'Edited digital gallery', 'Available as an add-on or standalone service']
  },
  film: {
    title: 'Cinematic Videography',
    intro: 'Relive the atmosphere, emotions and little details of your wedding through cinematic storytelling.',
    meta: ['Price on request', 'Highlights + full film', 'Social-ready reels'],
    images: ['image/mus.jpg', 'image/prewedd.jpeg'],
    items: ['Cinematic wedding highlight film', 'Full-length wedding film options', 'Instagram-ready reels', 'Professionally edited delivery']
  },
  drone: {
    title: 'Drone Coverage',
    intro: 'Add an aerial perspective to your venue, décor and celebrations where permitted.',
    meta: ['Add-on', 'Aerial highlights', 'Weather dependent'],
    images: ['image/drone-service.png', 'image/Eventplace.jpeg'],
    items: ['Aerial venue establishing shots', 'Cinematic overhead ceremony footage', 'Edited aerial clips', 'Subject to weather and local permissions']
  }
};

const packageDetail = document.getElementById('packageDetail');
const packageGallery = document.getElementById('packageGallery');
const packageLoginBtn = document.getElementById('packageLoginBtn');
function openPackageDetail(key){
  const data = packageDetails[key];
  if(!data) return;
  document.getElementById('packageDetailTitle').textContent = data.title;
  document.getElementById('packageDetailIntro').textContent = data.intro;
  document.getElementById('packageDetailMeta').innerHTML = data.meta.map(item=>`<div>${item}</div>`).join('');
  document.getElementById('packageDetailList').innerHTML = data.items.map(item=>`<li>✓ ${item}</li>`).join('');
  packageGallery.innerHTML = data.images.map((src,i)=>({src,i})).filter(({i})=>!(window.websiteSlots||[]).some(s=>s.id===`package-${key}-${i}`&&s.hidden)).map(({src,i},visibleIndex)=>`<img data-image-slot="package-${key}-${i}" src="${src}" alt="${data.title}" class="${visibleIndex === 0 ? 'active' : ''}">`).join('');
  packageLoginBtn.style.display = 'inline-flex'; packageLoginBtn.textContent='Enquire about this package';
  packageDetail.classList.add('open');
  packageDetail.setAttribute('aria-hidden', 'false');
}
function closePackageDetail(){
  packageDetail.classList.remove('open');
  packageDetail.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.package-link').forEach(card=>card.addEventListener('click', ()=>location.assign('service.html?id='+({full:'wedding-basic',candid:'candid',film:'cinematic',drone:'drone'}[card.dataset.package]||'wedding-basic'))));
document.getElementById('packageDetailClose').addEventListener('click', closePackageDetail);
packageDetail.addEventListener('click', e=>{ if(e.target === packageDetail) closePackageDetail(); });
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closePackageDetail(); });

// ---- Consult modal ----
const consultModal = document.getElementById('consultModal');
if(consultModal && consultModal.parentElement !== document.body) document.body.appendChild(consultModal);
let enquiryOpener=null;
function openConsultModal(){window.IWEnquiry?.apply(document.getElementById('enquiryForm'));enquiryOpener=document.activeElement;consultModal.classList.add('open');consultModal.setAttribute('aria-hidden','false');setTimeout(()=>document.querySelector('#enquiryForm input')?.focus(),0);}
function closeConsultModal(){ const wasOpen=consultModal.classList.contains('open');consultModal.classList.remove('open');consultModal.setAttribute('aria-hidden','true');if(wasOpen)enquiryOpener?.focus(); }
document.getElementById('consultClose').addEventListener('click', closeConsultModal);
consultModal.addEventListener('click', event=>{ if(event.target === consultModal) closeConsultModal(); });
packageLoginBtn.addEventListener('click', ()=>{
  closePackageDetail();
  openConsultModal();
});

// ---- FIX: Bridal section — per-card modal content ----
const bridalData = {
  bride: {
    eyebrow: 'Bride-to-be Studio',
    title: 'Bride-to-be Photoshoot',
    intro: 'A standalone session designed just for the bride — no full wedding package needed.',
    content: `<div class="rate-group"><h3>Session details</h3>
      <div class="rate-row"><span>Duration</span><strong>2 – 3 hours</strong></div>
      <div class="rate-row"><span>Location</span><strong>Studio or outdoor</strong></div>
      <div class="rate-row"><span>Delivery</span><strong>Edited gallery via cloud</strong></div>
    </div>
    <div class="rate-group"><h3>Add-ons</h3>
      <div class="rate-row"><span>Bride-to-be Makeup</span><strong>₹2,000</strong></div>
      <div class="rate-row"><span>Photo Shoot Makeup</span><strong>₹2,000</strong></div>
      <div class="rate-row"><span>Curls / Blow Dry / Ironing</span><strong>₹800 – ₹1,000</strong></div>
    </div>`
  },
  haldi: {
    eyebrow: 'Haldi Ceremony',
    title: 'Haldi Ceremony Shoot',
    intro: 'Bright, candid half-day coverage of the Haldi ritual and all its beautiful chaos.',
    content: `<div class="rate-group"><h3>Session details</h3>
      <div class="rate-row"><span>Duration</span><strong>Half-day (4 – 5 hours)</strong></div>
      <div class="rate-row"><span>Coverage</span><strong>Candid + traditional</strong></div>
      <div class="rate-row"><span>Delivery</span><strong>Edited gallery within 7 days</strong></div>
    </div>
    <div class="rate-group"><h3>Makeup add-on</h3>
      <div class="rate-row"><span>Haldi Makeup</span><strong>₹2,000</strong></div>
      <div class="rate-row"><span>Guest Makeup</span><strong>₹1,500</strong></div>
    </div>`
  },
  engagement: {
    eyebrow: 'Engagement Shoot',
    title: 'Engagement Shoot',
    intro: 'Studio or outdoor couple session — perfect as a standalone or included in the Premium package.',
    content: `<div class="rate-group"><h3>Session details</h3>
      <div class="rate-row"><span>Duration</span><strong>1 – 2 hours</strong></div>
      <div class="rate-row"><span>Location</span><strong>Studio or outdoor</strong></div>
      <div class="rate-row"><span>Delivery</span><strong>Edited gallery within 5 days</strong></div>
    </div>
    <div class="rate-group"><h3>Makeup add-on</h3>
      <div class="rate-row"><span>Engagement Makeup</span><strong>₹5,000</strong></div>
      <div class="rate-row"><span>Curls / Blow Dry</span><strong>₹800 – ₹1,000</strong></div>
    </div>`
  },
  sangeet: {
    eyebrow: 'Party & Sangeet',
    title: 'Party / Sangeet Shoot',
    intro: 'Evening and stage coverage for the Sangeet, reception or any celebration night.',
    content: `<div class="rate-group"><h3>Session details</h3>
      <div class="rate-row"><span>Duration</span><strong>Half-day (4 – 5 hours)</strong></div>
      <div class="rate-row"><span>Coverage</span><strong>Stage, candid &amp; group shots</strong></div>
      <div class="rate-row"><span>Delivery</span><strong>Edited gallery within 7 days</strong></div>
    </div>
    <div class="rate-group"><h3>Makeup add-on</h3>
      <div class="rate-row"><span>Party Makeup</span><strong>₹2,000</strong></div>
      <div class="rate-row"><span>Guest Makeup</span><strong>₹1,500</strong></div>
      <div class="rate-row"><span>Hair Styling</span><strong>₹800 – ₹1,000</strong></div>
    </div>`
  }
};
const bridalRateModal = document.getElementById('bridalRateModal');
function openBridalRates(key){
  const d = bridalData[key] || bridalData.bride;
  document.getElementById('bridalRateEyebrow').textContent = 'Glowy Makeup Studio';
  document.getElementById('bridalRateTitle').textContent = d.title;
  document.getElementById('bridalRateIntro').textContent = d.intro;
  const makeupPhotos={bride:'image/bridetobe.jpeg',haldi:'image/makeup.jpeg',engagement:'image/bridemus.jpeg',sangeet:'image/reception.jpeg'};document.getElementById('bridalRateContent').innerHTML = `<img class="bridal-popup-photo" data-image-slot="makeup-detail-${key}" src="${makeupPhotos[key]||makeupPhotos.bride}" alt="${d.title}">`+d.content+(key==='bride'?'<p class="muted">Photoshoot fee: enquire for a quote. Makeup and styling add-ons are listed separately.</p>':'');const enquire=document.createElement('button');enquire.className='btn';enquire.textContent='Enquire about this shoot & makeup';enquire.onclick=()=>{closeBridalRates();document.querySelector('#enquiryForm [name=service]').value='Makeup & Hair';openConsultModal();document.querySelector('#enquiryForm [name=message]').value='Hello! I would like to enquire about '+d.title+'. Please share availability and the shoot and makeup details.'};document.getElementById('bridalRateContent').append(enquire);const more=document.createElement('a');more.className='btn ghost';more.href='services.html?category=makeup';more.textContent='Explore more makeup options ↗';document.getElementById('bridalRateContent').append(more);
  window.startMakeupSlides?.(key);
  bridalRateModal.classList.add('open');
  bridalRateModal.setAttribute('aria-hidden','false');
}
function closeBridalRates(){ bridalRateModal.classList.remove('open'); bridalRateModal.setAttribute('aria-hidden','true'); }
document.querySelectorAll('.bridal-card').forEach(card=>card.addEventListener('click', ()=>openBridalRates(card.dataset.bridal)));
document.getElementById('bridalRateClose').addEventListener('click', closeBridalRates);
bridalRateModal.addEventListener('click', event=>{ if(event.target === bridalRateModal) closeBridalRates(); });

// ---- Gift personalizer ----
const chips = document.querySelectorAll('#recipientChips .chip');
chips.forEach(c=>c.addEventListener('click', ()=>{
  chips.forEach(x=>x.classList.remove('active'));
  c.classList.add('active');
}));
const giftProductSelect = document.getElementById('giftProduct');
const giftImageUpload = document.getElementById('giftImageUpload');
const giftUploadHelp = document.getElementById('giftUploadHelp');
const giftUploadPreviews = document.getElementById('giftUploadPreviews');
const giftPhotoSlot = document.getElementById('giftPhotoSlot');
const giftPrevBtn = document.getElementById('giftPrevBtn');
const giftNextBtn = document.getElementById('giftNextBtn');
const giftCropBtn = document.getElementById('giftCropBtn');
const giftCropEditor = document.getElementById('giftCropEditor');
const giftCropImage = document.getElementById('giftCropImage');
const giftCropZoom = document.getElementById('giftCropZoom');
const giftCropX = document.getElementById('giftCropX');
const giftCropY = document.getElementById('giftCropY');
const giftCropZoomValue = document.getElementById('giftCropZoomValue');
const giftCropXValue = document.getElementById('giftCropXValue');
const giftCropYValue = document.getElementById('giftCropYValue');
const giftPersonalizerPrice = document.getElementById('giftPersonalizerPrice');
const giftQuantity=document.getElementById('giftQuantity');
function personalizerQuantity(){return Math.max(1,Math.min(99,Math.floor(Number(giftQuantity?.value)||1)))}
giftQuantity?.addEventListener('change',()=>{giftQuantity.value=personalizerQuantity();updatePersonalizerProduct()});
for(const [id,delta] of [['giftQuantityMinus',-1],['giftQuantityPlus',1]])document.getElementById(id)?.addEventListener('click',()=>{giftQuantity.value=Math.max(1,Math.min(99,personalizerQuantity()+delta));updatePersonalizerProduct()});
let uploadedGiftImages = [];
let selectedGiftImageIndex = 0;
let croppingGiftImageIndex = 0;
let croppingGiftImage = null;
let croppingPersonalizerImage = true;
const personalizerProducts = {
  print: { name:'Personalised Photo Print', help:'Add up to 10 photos, one at a time.' },
  'print-set': { name:'Personalised Photo Prints', help:'Add up to 10 photos, one at a time.' },
  frame: { name:'Personalised Photo Frame', price:299, help:'Upload one photo for the ₹299 frame. The first selected photo is used.' }
};
const captionInput = document.getElementById('giftCaption');
const framePreview = document.getElementById('framePreviewCaption');
function defaultGiftCaption(index){ return `Forever starts here · ${String(index + 1).padStart(2, '0')}`; }
captionInput.addEventListener('input', ()=>{
  const selectedImage = uploadedGiftImages[selectedGiftImageIndex];
  if(selectedImage) selectedImage.caption = captionInput.value;
  framePreview.textContent = captionInput.value || 'Your special moment';
});
function updatePersonalizerProduct(){
  const product = personalizerProducts[giftProductSelect.value];
  const price = giftProductSelect.value === 'frame' ? 299 : uploadedGiftImages.length * 4;
  giftPersonalizerPrice.textContent = `${IWStore.escape(product.name)} · ${money(price * personalizerQuantity())}`;
  giftUploadHelp.textContent = product.help;
  let note=document.getElementById('personalizerShippingNote');if(!note){note=document.createElement('p');note.id='personalizerShippingNote';note.className='small-order-note';giftUploadHelp.after(note)}note.hidden=giftProductSelect.value==='frame'||uploadedGiftImages.length>=10;note.textContent='↗ Tip: order 10 prints together for better shipping value per photo. Fewer photos are welcome; check the delivery charge before paying.';

  giftImageUpload.multiple = giftProductSelect.value !== 'frame';
  if(giftProductSelect.value === 'frame' && uploadedGiftImages.length > 1){
    uploadedGiftImages = uploadedGiftImages.slice(0, 1);
    renderGiftUploadPreviews();
  }
}
function renderGiftUploadPreviews(){
  giftUploadPreviews.innerHTML = uploadedGiftImages.map((image, index)=>`<span class="upload-preview ${index === selectedGiftImageIndex ? 'active' : ''}"><img src="${image.cropUrl || image.url}" alt="Uploaded preview ${index + 1}" data-gift-preview="${index}"><button type="button" class="upload-remove" data-remove-upload="${index}" aria-label="Remove uploaded image">×</button></span>`).join('');
  giftUploadPreviews.querySelectorAll('[data-gift-preview]').forEach(preview=>preview.addEventListener('click', ()=>showGiftPreview(Number(preview.dataset.giftPreview))));
  giftUploadPreviews.querySelectorAll('[data-remove-upload]').forEach(button=>button.addEventListener('click', event=>{
    event.stopPropagation();
    const [removed] = uploadedGiftImages.splice(Number(button.dataset.removeUpload), 1);
    if(removed?.url) URL.revokeObjectURL(removed.url);
    selectedGiftImageIndex = Math.min(selectedGiftImageIndex, Math.max(0, uploadedGiftImages.length - 1));
    renderGiftUploadPreviews();
  }));
  updatePersonalizerProduct();
  showGiftPreview(Math.min(selectedGiftImageIndex, Math.max(0, uploadedGiftImages.length - 1)));
}
function showGiftPreview(index){
  selectedGiftImageIndex = index;
  const image = uploadedGiftImages[index];
  document.querySelector('.personalizer .preview')?.classList.toggle('has-upload',!!image);
  if(!image){
    giftPhotoSlot.innerHTML = '<img src="image/wedd.jpeg" alt="Example photo keepsake — upload your own photo">';
    giftPrevBtn.disabled = true;
    giftNextBtn.disabled = true;
    giftCropBtn.disabled = true;
    return;
  }
  captionInput.value = image.caption || defaultGiftCaption(index);
  framePreview.textContent = captionInput.value;
  giftPhotoSlot.innerHTML = `<img src="${image.cropUrl || image.url}" alt="Selected keepsake preview">`;
  giftUploadPreviews.querySelectorAll('.upload-preview').forEach((preview, previewIndex)=>preview.classList.toggle('active', previewIndex === index));
  giftPrevBtn.disabled = index <= 0;
  giftNextBtn.disabled = index >= uploadedGiftImages.length - 1;
  giftCropBtn.disabled = false;
}
giftProductSelect.addEventListener('change', updatePersonalizerProduct);
giftImageUpload.addEventListener('change', async ()=>{
  const imageLimit = giftProductSelect.value === 'frame' ? 1 : 10;
  const remaining = Math.max(0, imageLimit - uploadedGiftImages.length);
  const files = [...giftImageUpload.files].slice(0, remaining);
  const startIndex = uploadedGiftImages.length;
  try {uploadedGiftImages.push(...await Promise.all(files.map(async(file,index)=>({name:file.name,url:await localPhotoData(file),caption:defaultGiftCaption(startIndex+index)}))));} catch(error){showToast(error.message);return;}
  giftImageUpload.value = '';
  renderGiftUploadPreviews();
});
giftPrevBtn.addEventListener('click', ()=>showGiftPreview(Math.max(0, selectedGiftImageIndex - 1)));
giftNextBtn.addEventListener('click', ()=>showGiftPreview(Math.min(uploadedGiftImages.length - 1, selectedGiftImageIndex + 1)));
function updateCropPreview(){
  const zoom = Number(giftCropZoom.value);
  const x = Number(giftCropX.value);
  const y = Number(giftCropY.value);
  giftCropImage.style.transform = `translate(${x * .35}%, ${y * .35}%) scale(${zoom})`;
  giftCropZoomValue.value = `${zoom.toFixed(2)}×`;
  giftCropXValue.value = x;
  giftCropYValue.value = y;
}
function openGiftCrop(){
  const image = uploadedGiftImages[selectedGiftImageIndex];
  if(!image) return;
  croppingGiftImageIndex = selectedGiftImageIndex;
  openCropForImage(image, true);
}
function openCropForImage(image, isPersonalizerImage){
  croppingGiftImage = image;
  croppingPersonalizerImage = isPersonalizerImage;
  giftCropImage.src = image.url;
  giftCropZoom.value = image.crop?.zoom || 1;
  giftCropX.value = image.crop?.x || 0;
  giftCropY.value = image.crop?.y || 0;
  updateCropPreview();
  giftCropEditor.classList.add('open');
  giftCropEditor.setAttribute('aria-hidden','false');
}
function closeGiftCrop(){
  giftCropEditor.classList.remove('open');
  giftCropEditor.setAttribute('aria-hidden','true');
}
giftCropBtn.addEventListener('click', openGiftCrop);
[giftCropZoom, giftCropX, giftCropY].forEach(control=>control.addEventListener('input', updateCropPreview));
document.getElementById('giftCropCancel').addEventListener('click', closeGiftCrop);
document.getElementById('giftCropSave').addEventListener('click', ()=>{
  const image = croppingGiftImage;
  if(!image) return;
  const source = new Image();
  source.onload = ()=>{
    const cropSize = Math.min(source.naturalWidth, source.naturalHeight) / Number(giftCropZoom.value);
    const maxX = source.naturalWidth - cropSize;
    const maxY = source.naturalHeight - cropSize;
    const sourceX = maxX * (Number(giftCropX.value) + 100) / 200;
    const sourceY = maxY * (Number(giftCropY.value) + 100) / 200;
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 700;
    if(window.iwDrawCrop)iwDrawCrop(source,{zoom:Number(giftCropZoom.value),x:Number(giftCropX.value),y:Number(giftCropY.value)},canvas);else canvas.getContext('2d').drawImage(source, sourceX, sourceY, cropSize, cropSize, 0, 0, 700, 700);
    image.cropUrl = canvas.toDataURL('image/jpeg', .9);
    image.crop = {version:2,zoom:Number(giftCropZoom.value), x:Number(giftCropX.value), y:Number(giftCropY.value)};
    if(croppingPersonalizerImage){
      selectedGiftImageIndex = croppingGiftImageIndex;
      renderGiftUploadPreviews();
    } else {
      renderGiftCart();
      renderPhotoCheckout();
    }
    closeGiftCrop();
  };
  source.src = image.url;
});
giftCropEditor.addEventListener('click', event=>{ if(event.target === giftCropEditor) closeGiftCrop(); });
document.getElementById('addToCartBtn').addEventListener('click', function(){
  const product = personalizerProducts[giftProductSelect.value];
  const productPrice = giftProductSelect.value === 'frame' ? 299 : uploadedGiftImages.length * 4;
  if(!requirePhotoAccount()) return;
  if(!uploadedGiftImages.length){
    giftImageUpload.focus();
    giftUploadHelp.textContent = 'Please upload at least one image before adding this product.';
    return;
  }
  addCustomGiftToCart({
    id:`personalized-${giftProductSelect.value}-${Date.now()}`,
    name:product.name,
    price:productPrice,
    image:uploadedGiftImages[0].cropUrl || uploadedGiftImages[0].url,
    images:uploadedGiftImages.map(image=>({name:image.name, url:image.url, cropUrl:image.cropUrl, crop:image.crop, caption:image.caption})),
    detail:uploadedGiftImages.map(image=>image.caption).join(' | '),
    quantity:personalizerQuantity()
  });
  this.textContent = 'Added ✓';
  this.style.background = '#4a7a3d';
  this.style.borderColor = '#4a7a3d';
  setTimeout(()=>{ this.textContent='Add to Cart'; this.style.background=''; this.style.borderColor=''; },1600);
});
updatePersonalizerProduct();

// ======================================================
// FIX: AI-powered chatbot using Anthropic API
// ======================================================
const SITE_CONTEXT = `You are the InstaWedd Weddings AI assistant. You help customers about InstaWedd's services.

InstaWedd Weddings is a one-stop wedding service in Kerala, India (Kozhikode / Thenhipalam area).

PHOTOGRAPHY PACKAGES:
- Basic: ₹23,999 — 1 photographer, 60-page album, tabletop calendar, mini album, edited photos via pendrive
- Standard: ₹27,999 — 1 photographer, 70-page album with special prints, calendar, mini album, pendrive
- Premium: ₹39,999 (TWO options, same price):
  * Album Edition: 100-page glitter album, mini album, personalised calendar, 2 framed prints, free pre/post-wedding shoot
  * Film & Reels Edition: photography + videography, highlights video + Instagram reels, 60-page album, mini album, wall calendar, photo frames, album bag + pendrive box

COVERAGE ADD-ONS (priced on enquiry):
- Candid & Traditional coverage
- Cinematic Videography (highlights + full film)
- Drone Aerial Coverage

BRIDAL & PRE-WEDDING:
- Bride-to-be Photoshoot (standalone, 2-3 hrs, studio or outdoor)
- Haldi Ceremony Shoot (half-day, 4-5 hrs)
- Engagement Shoot (1-2 hrs, add-on or standalone)
- Party/Sangeet Shoot (half-day, evening & stage)
MAKEUP RATES: Guest ₹1,500 | Bride-to-be ₹2,000 | Photo Shoot ₹2,000 | Haldi ₹2,000 | Engagement ₹5,000
HAIR: Curls ₹1,000 | Blow Dry ₹800 | Ironing ₹800

GIFTING (selection):
- Photo prints: ₹4 per photo
- Personalised Photo Frame: ₹299 | Photoframe: ₹599
- Return Gift Box: ₹399 | Keepsake Bouquet: ₹999
- Fridge Magnet Set: ₹499 | Wedding Printables: ₹299
- Wedding Journal: ₹899 | Personalised Diary: ₹699
- Wedding Hamper: ₹1,499 | Bridal Hamper: ₹1,899 | Engagement Hamper: ₹1,599
- Classic Photo Album: ₹1,499 | Storybook Album: ₹2,499
- Bridal Kit: ₹1,299 | Crochet Couple Keepsake: ₹799

STUDIO: Matrix Photo Studio, 4VGW+PCF, Kohinoor Parambilpeedika Rd, Thenhipalam, Kerala 673636. Open 24 hours.
CONTACT: Call 9605509516 or 9061191164 | Email: instaweddweddingphotography@gmail.com | Instagram: @instawedd_weddings

CURRENT OFFERS: Free engagement shoot with every Premium package (2026 & 2027 bookings).

Answer in a warm, helpful, concise way. If you don't know something specific (like exact dates or custom pricing), say so honestly and suggest they call or DM. Keep replies under 120 words unless the question genuinely needs more.`;

const chatPanel = document.getElementById('chatPanel');
const chatBody = document.getElementById('chatBody');
const chatLauncher = document.getElementById('chatLauncher');
const chatSendBtn = document.getElementById('chatSend');
const chatInputEl = document.getElementById('chatInput');
let chatHistory = [];
let chatBusy = false;

document.getElementById('chatClose').addEventListener('click', ()=>chatPanel.classList.remove('open'));
chatLauncher.addEventListener('click', ()=>chatPanel.classList.toggle('open'));

function addBubble(text, who){
  const b = document.createElement('div');
  b.className = 'bubble ' + who;
  b.textContent = text;
  chatBody.appendChild(b);
  chatBody.scrollTop = chatBody.scrollHeight;
  return b;
}

function addTypingIndicator(){
  const b = document.createElement('div');
  b.className = 'bubble typing';
  b.id = 'typingIndicator';
  b.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  chatBody.appendChild(b);
  chatBody.scrollTop = chatBody.scrollHeight;
}
function removeTypingIndicator(){
  const t = document.getElementById('typingIndicator');
  if(t) t.remove();
}

async function sendChatMessage(text){
  if(!text.trim() || chatBusy) return;
  chatBusy = true;
  chatSendBtn.disabled = true;
  chatInputEl.disabled = true;

  addBubble(text, 'user');
  chatInputEl.value = '';
  chatHistory.push({ role:'user', content: text });

  addTypingIndicator();

  const q=text.toLowerCase();
  let reply='Tell us your date, venue and preferred service using “Enquire about your date”. You can send a message by email or WhatsApp, or call 9605509516.';
  if(/premium|package|photo/.test(q)) reply='Photography starts at ₹23,999. Standard is ₹27,999 and Premium is ₹39,999. Premium has Album or Film & Reels options. Open Photography to compare inclusions; availability is confirmed by our team.';
  else if(/gift|hamper/.test(q)) reply='Explore Gifting for albums, frames, hampers and return gifts. You can build a selection and send an order enquiry. Online payments are not enabled yet.';
  else if(/makeup|hair|bridal/.test(q)) reply='We offer makeup and hair styling for bridal and pre-wedding occasions. Open Makeup Studio to explore the listed services, then enquire for your date.';
  else if(/event|decor|venue/.test(q)) reply='For event planning and décor, share your date, venue, guest count and ideas in an enquiry. Our team can discuss a tailored plan.';
  else if(/offer|discount/.test(q)) reply='Please ask our team to confirm current offers and eligibility for your date before booking.';
  removeTypingIndicator(); addBubble(reply, 'bot');

  chatBusy = false;
  chatSendBtn.disabled = false;
  chatInputEl.disabled = false;
  chatInputEl.focus();
}

// Quick replies for chatbot
const quickAnswers = {
  premium: "What's included in the Premium package?",
  gift: "Can you suggest a wedding gift under ₹999?",
  offers: "Do you have any current offers or discounts?",
  human: "I'd like to talk to a human for booking."
};
document.getElementById('quickReplies').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-q]');
  if(!btn) return;
  sendChatMessage(quickAnswers[btn.dataset.q]);
});

chatSendBtn.addEventListener('click', ()=>sendChatMessage(chatInputEl.value));
chatInputEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey) sendChatMessage(chatInputEl.value); });

// ======================================================
// FIX: Newsletter with validation and toast feedback
// ======================================================
const newsletterToast = document.getElementById('newsletterToast');
function showToast(msg, duration=3200){
  newsletterToast.textContent = msg;
  newsletterToast.classList.add('show');
  setTimeout(()=>newsletterToast.classList.remove('show'), duration);
}
document.getElementById('newsletterBtn')?.addEventListener('click', ()=>{
  const emailInput = document.getElementById('newsletterEmail');
  const val = emailInput.value.trim();
  if(!val){ showToast('Please enter your email address.'); emailInput.focus(); return; }
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isMobile = /^\d{10}$/.test(val);
  if(!isEmail && !isMobile){ showToast('Please enter a valid email or 10-digit mobile number.'); emailInput.focus(); return; }
  emailInput.value = '';
  window.location.href='mailto:instaweddweddingphotography@gmail.com?subject='+encodeURIComponent('Offers enquiry')+'&body='+encodeURIComponent('Hello! Please share your upcoming offers with me at '+val+'. Thank you.');showToast('Review and send your request in your email app.');
});
// Also allow Enter key in newsletter input
document.getElementById('newsletterEmail')?.addEventListener('keydown', (e)=>{
  if(e.key==='Enter') document.getElementById('newsletterBtn').click();
});
