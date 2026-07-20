# Temo Mobile Store — الموقع الإلكتروني

موقع Static (HTML/CSS/JS بدون Framework) لعرض منتجات محل Temo Mobile Store، بيدعم اللغة العربية RTL، وقابل للاستضافة المجانية على GitHub Pages أو Cloudflare Pages.

## البنية

```
TemoMobileWebsite/
├── index.html              الصفحة الرئيسية
├── products.html           صفحة المنتجات (بحث + فلاتر + ترتيب)
├── product-details.html    صفحة تفاصيل منتج واحد (?id=...)
├── about.html               من نحن
├── contact.html             تواصل معنا
├── css/style.css            كل تنسيقات الموقع
├── js/
│   ├── main.js              كود مشترك: القائمة، الفوتر، المنتجات المميزة بالرئيسية
│   ├── products.js          بحث/فلترة/ترتيب صفحة المنتجات
│   ├── product-details.js   عرض تفاصيل منتج + منتجات ذات صلة
│   └── contact.js           فورم التواصل → رسالة واتساب جاهزة
├── data/
│   ├── products.json        المصدر الوحيد اللي كل الصفحات بتقرأ منتجاته
│   ├── product-meta.json    تصنيف المنتجات الحقيقية (قسم/شركة/وصف) لما تيجي من المخزون
│   └── products.demo-backup.json   نسخة من بيانات العرض التجريبية الأصلية
├── scripts/
│   └── sync-catalog.ps1     يزامن products.json من كتالوج المحل الحي (CatalogWebsite)
└── images/                  logo, products, banners, icons
```

## من فين المنتجات بتيجي

كل صفحة (الرئيسية، المنتجات، تفاصيل المنتج) بتعمل `fetch('data/products.json')` وقت التحميل — مفيش أي منتج مكتوب داخل الـ HTML. عشان تضيف/تعدّل/تمسح منتج، تعدّل في `data/products.json` بس.

### Schema كل منتج

```json
{
  "id": "معرف فريد بحروف إنجليزية بدون مسافات",
  "name": "اسم المنتج",
  "brand": "اسم الشركة، مثال: Apple",
  "category": "iphone | samsung | xiaomi | oppo | realme | accessories | other",
  "price": 12999,
  "originalPrice": 14999,
  "quantity": 5,
  "featured": true,
  "isNew": false,
  "image": "",
  "description": "وصف مختصر للمنتج"
}
```

- `category` لازم تكون **واحدة بالظبط** من القيم السبعة دي عشان تظهر صح في الفلاتر وشبكة الأقسام بالرئيسية.
- `originalPrice`: سيبه `null` لو مفيش خصم، أو رقم أكبر من `price` عشان تظهر شارة الخصم تلقائيًا.
- `featured: true`: يظهر المنتج في قسم "عروض ومنتجات مميزة" بالرئيسية (لو مفيش أي منتج featured، الرئيسية بتعرض أول 8 منتجات بدل ما القسم يفضل فاضي).
- `image`: سيبه `""` لعرض أيقونة Emoji حسب القسم، أو حط رابط صورة (محلي أو خارجي) لعرضها فعليًا.
- لو ضفت `brand` جديدة مش موجودة أصلًا في فلتر الشركة بصفحة `products.html`، لازم تضيف Checkbox جديد ليها يدويًا في `products.html` (دور على `data-filter="brand"`) عشان تبقى قابلة للفلترة.

## ربط الموقع بمخزون برنامج Temo Mobile Store (POS) الحقيقي

البرنامج المكتبي عنده بالفعل خاصية مزامنة (`WebCatalogSyncService`) بتبعت المخزون كل 5 دقايق لموقع كتالوج منفصل اسمه **CatalogWebsite** (في `D:\Temo Mobile Store\CatalogWebsite`)، وده بيعرضه عن طريق `/api/products`.

مخزون البرنامج بيعرف بس: **الاسم، السعر، الكمية، الباركود، وجود صورة من عدمه**. مش بيعرف "القسم" ولا "الشركة" ولا "الوصف" — دي بتتحدد يدويًا في `data/product-meta.json`.

### `data/product-meta.json`

```json
{
  "الباركود": {
    "category": "واحدة من السبع قيم فوق",
    "brand": "اسم الشركة",
    "description": "وصف اختياري",
    "featured": false,
    "isNew": false
  }
}
```

### `scripts/sync-catalog.ps1`

```powershell
# يزامن من CatalogWebsite شغال محليًا، ويحدّث data/products.json مباشرة
.\sync-catalog.ps1

# تجربة من غير ما يلمس products.json الأساسي (بيكتب في products.synced-preview.json)
.\sync-catalog.ps1 -PreviewOnly

# لما CatalogWebsite يبقى منشور على رابط عام
.\sync-catalog.ps1 -CatalogUrl "https://your-catalog-domain.com"
```

بعد كل تشغيل، السكريبت بيطبع تحذير بأي باركود لسه مفيهوش تصنيف في `product-meta.json` عشان تضيفه.

### خطوات الاستخدام اليومي
1. تضيف/تعدّل منتجات في برنامج POS، وتسيب المزامنة التلقائية تشتغل (أو "مزامنة الآن" من الإعدادات).
2. أي باركود جديد، تضيفله سطر تصنيف بسيط في `product-meta.json`.
3. تشغّل `sync-catalog.ps1` وقت ما تحب تحدّث الموقع.

## ملاحظات مهمة قبل النشر الفعلي

- **رقم الواتساب** لسه Placeholder (`201000000000`) في كل الصفحات — لازم يتغير قبل النشر.
- **العنوان وخريطة جوجل** في `contact.html` لسه Placeholder واضح.
- **نظّف بيانات التجربة من مخزون البرنامج الحقيقي** قبل ما تعتمد على المزامنة فعليًا، عشان الموقع منشورش أسعار أو منتجات وهمية لأي زائر حقيقي.
- **CatalogWebsite لازم يكون منشور على رابط عام** (Render/Koyeb أو غيره) عشان تقدر تشغّل `sync-catalog.ps1` بدون ما جهازك يفضل شغال، ولو الموقع الرئيسي منشور بعيد عن جهازك.

## المعاينة المحلية

الموقع Static بالكامل، فبيحتاج سيرفر بسيط بس عشان `fetch()` يشتغل صح (فتح الملف مباشرة من File Explorer مش هيشتغل). أي سيرفر ملفات ثابتة يكفي، مثال:

```powershell
# لو عندك Python
python -m http.server 8080

# أو أي أداة Static Server تانية بتفضّلها
```
