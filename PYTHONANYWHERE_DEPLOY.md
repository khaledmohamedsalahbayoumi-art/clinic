# 🚀 دليل رفع وتشغيل منظومة Clini-Tech على PythonAnywhere

تم تحويل الباك إند بالكامل إلى **Python (Flask)** ليصبح متوافقاً 100% مع منصة **PythonAnywhere** ويعمل بسلاسة تامة.

---

## 📋 الخطوات خطوة بخطوة (في 3 دقائق فقط):

### 1️⃣ الخطوة الأولى: إنشاء حساب والدخول
1. توجه إلى [PythonAnywhere.com](https://www.pythonanywhere.com) وسجل الدخول (أو أنشئ حساباً مجانياً `Beginner Account`).

---

### 2️⃣ الخطوة الثانية: سحب المشروع من GitHub وتثبيت الحزم
1. من لوحة التحكم، اذهب إلى تبويب **Consoles**.
2. افتح نافذة **Bash** جديدة.
3. اكتب الأوامر التالية لسحب المشروع وتثبيت الحزم:

```bash
git clone https://github.com/khaledmohamedsalahbayoumi-art/clinic.git
cd clinic
pip3 install --user -r requirements.txt
```

---

### 3️⃣ الخطوة الثالثة: إعداد الـ Web App
1. اذهب إلى تبويب **Web** من القائمة العلوية.
2. اضغط على **"Add a new web app"**.
3. في نافذة الاختيار، اختر:
   - **Manual configuration** (أو **Flask**).
   - اختر إصدار بايثون: **Python 3.10** أو **Python 3.11** أو **Python 3.12**.

---

### 4️⃣ الخطوة الرابعة: ضبط مسارات المشروع (Code Section)
في صفحة الـ Web App:
1. في حقل **Source code**، اكتب:
   `/home/<اسم_مستخدمك>/clinic`
2. في حقل **Working directory**، اكتب:
   `/home/<اسم_مستخدمك>/clinic`

*(استبدل `<اسم_مستخدمك>` بالـ Username الخاص بحسابك على PythonAnywhere)*.

---

### 5️⃣ الخطوة الخامسة: تعديل ملف الـ WSGI
1. في نفس صفحة الـ Web، اضغط على رابط **WSGI configuration file** (شكله مثل: `/var/www/username_pythonanywhere_com_wsgi.py`).
2. امسح المحتوى الافتراضي، وضع بدلاً منه الكود التالي فقط:

```python
import sys
import os

# مسار المشروع على حسابك
project_home = '/home/<اسم_مستخدمك>/clinic'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# استدعاء تطبيق Flask
from app import app as application
```

*(لا تنسَ تغيير `<اسم_مستخدمك>` إلى اسم حسابك الفعلي)*.
3. اضغط زر **Save** في أعلى الصفحة.

---

### 6️⃣ الخطوة السادسة: إعادة التشغيل والمعاينة!
1. ارجع إلى تبويب **Web**.
2. اضغط على الزر الأخضر الكبير: **"Reload <username>.pythonanywhere.com"**.
3. افتح الرابط الخاص بك:
   `https://<اسم_مستخدمك>.pythonanywhere.com`

مبروك! 🎉 نظام **Clini-Tech** أصبح يعمل أونلاين على الإنترنت ويمكن فتحه من أي مكان في العالم وعبر أي جوال أو كمبيوتر!
