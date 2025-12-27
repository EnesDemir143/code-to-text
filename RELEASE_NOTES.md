# 🚀 v1.2.0 - Interactive File Tree for Local Uploads

Bu sürümde, yerel dosya/klasör yüklemelerinde de GitHub'daki gibi interaktif dosya ağacı görüntüleme özelliği eklendi.

#### ✨ Yeni Özellikler

- **Yerel Dosya Ağacı:** Dosya veya ZIP yüklendikten sonra interaktif dosya ağacı görüntüleme
- **Seçimli İndirme:** Tüm dosyaları değil, sadece seçilen dosyaları indirme
- **Akıllı Seçim Sistemi:**
  - Parent seçildiğinde tüm alt dosyalar otomatik seçilir
  - Tek tek dosya seçimi/kaldırması
  - Select All / Deselect All butonları
  - Expand All / Collapse All butonları
- **Dosya Boyutu Gösterimi:** Her dosyanın boyutu tree'de görüntülenir
- **Dil İkonları:** Kod dosyaları özel ikonlarla gösterilir

#### 🔧 Teknik Detaylar

- `LocalFileTree` component: GitHub'daki `RepoFileTree` ile aynı yapıda
- Klasör hiyerarşisi otomatik oluşturulur
- State yönetimi optimize edildi (useRef ile performans)

#### 🔗 Live Demo
https://context.enesdemir.me

---

# 🚀 v1.1.0 - GitHub Integration

Bu sürümde, kullanıcıların doğrudan GitHub'dan public repoları indirip text dosyasına dönüştürebilmesi için yeni özellikler eklendi.

#### ✨ Yeni Özellikler

- **GitHub ile İndir:** Dosya yükleme alanının altına yeni "Download from GitHub" butonu eklendi
- **Repo URL Girişi:** HTTPS formatında GitHub repo URL'si girme desteği
- **Dosya Ağacı Görüntüleme:** Repository dosya yapısını tree view'da hiyerarşik olarak gösterme
- **Akıllı Seçim Sistemi:** 
  - Parent seçildiğinde tüm alt dosyalar otomatik seçilir
  - Tek tek dosya seçimi/kaldırması
  - Select All / Deselect All butonları
  - Expand All / Collapse All butonları
- **Dosya İndirme:** Seçilen dosyaları `.txt` formatında dosya yolları ve içerikleriyle birlikte indirme
- **Progress Tracking:** İndirme işlemi sırasında ilerleme göstergesi

#### 🔧 Teknik Detaylar

- GitHub API entegrasyonu (unauthenticated, 60 request/saat limiti)
- Recursive tree fetching ile büyük repo desteği
- Rate limiting ile paralel dosya indirme
- `main` ve `master` branch fallback desteği

#### 🔗 Live Demo
https://context.enesdemir.me

---

# 🚀 v1.0.0 - First Public Release

This is the first stable release of **CodeContext**. It allows developers to convert local project folders into a single text file for LLM context.

#### ✨ Features
- **Client-Side Processing:** Files are processed in the browser, zero server uploads.
- **Smart Filtering:** Automatically ignores `node_modules`, `.git`, `.env`, and binary files.
- **Language Detection:** Groups files by extension (e.g., Python, TypeScript).
- **Dark Mode UI:** Designed with a clean, developer-focused interface.

#### 🔗 Live Demo
Check it out here: https://context.enesdemir.me

#### 🛠 Tech Stack
- Next.js  (App Router)
- React 
- Tailwind CSS 
- Vercel Deployment
