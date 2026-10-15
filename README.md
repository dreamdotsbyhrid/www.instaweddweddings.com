<<<<<<< HEAD
# InstaWedd — static website

This folder is a standalone HTML/CSS/JavaScript export of the supplied InstaWedd website. Use a NEW folder/repository; do not replace your working dynamic project with it.

Included: Home, About Us, Services/package details, Gifting catalogue, Portfolio, Contact, Blogs, Offers, and a browser-only Wedding Planner. Original website images and 44 public dashboard-uploaded photos are bundled. Saved public products, services, feedback and photo framing are frozen into assets/public-content.js from the available project snapshot. Later changes made on your live dynamic website are not automatically synced here.

There is no Node server, database, owner login, customer account, payment gateway or server form submission. Enquiries open WhatsApp/email for the visitor to review and send. The planner saves only on the same browser and offers a text download/print. Image adjustments remain as exported; changes require editing and republishing files.

## Preview

Open this folder in VS Code and use Live Server. No npm install or build is needed. Keep the full folder structure intact.

## Upload to GitHub

Create a NEW empty repository named `instawedd-static` (no generated README). Open a terminal inside the extracted folder containing index.html:

```powershell
git init
git add .
git commit -m "Add static InstaWedd website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/instawedd-static.git
git push -u origin main
```

Replace YOUR-USERNAME. Upload the extracted files, not the ZIP itself. index.html must be at the repository root, alongside assets/, image/ and uploads/. The uploads folder here contains selected PUBLIC website photos, not your private data folder.

## GitHub Pages showcase deployment

In the repository: Settings → Pages → Source: Deploy from a branch → main → /(root) → Save. Wait for the Pages deployment to succeed; use the URL shown there, normally https://YOUR-USERNAME.github.io/instawedd-static/.

GitHub Pages is a static project-showcase host. GitHub's terms prohibit using it as free hosting to run an online business/e-commerce site or a site primarily facilitating commercial transactions. Do not treat this package's technical compatibility as permission to operate the studio's business on Pages. For the live business site, keep GitHub as the source repository and deploy this static folder to a host whose terms permit your use. This package requires no build and can be published by a standard static-file host.

Official references:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#pages

## Edit later

- Page text: the matching .html file.
- Services/products/public dashboard snapshot: assets/public-content.js.
- Photos: image/ and uploads/. Keep filenames or update their references.
- Static-only enquiries and image overrides: assets/static-ui.js.
- Studio slideshow: assets/studio-slideshow.js (4 seconds; pauses during mouse hover).


# InstaWedd
InstaWedd Weddings Static website
>>>>>>> 584d3ab45f2826dda160e99c66badb2adbaa6186
