const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// السماح لمتجرك بالتواصل مع هذا السيرفر
app.use(cors());

// إعداد مجلد لرفع الملفات مؤقتاً
const upload = multer({ dest: 'uploads/' });

app.post('/sign', upload.fields([
    { name: 'ipa', maxCount: 1 },
    { name: 'p12', maxCount: 1 },
    { name: 'prov', maxCount: 1 }
]), (req, res) => {
    
    // التأكد من وصول الملفات
    if (!req.files || !req.files.ipa || !req.files.p12 || !req.files.prov) {
        return res.status(400).json({ error: 'الرجاء رفع جميع الملفات المطلوبة' });
    }

    const password = req.body.password;
    const ipaPath = req.files.ipa[0].path;
    const p12Path = req.files.p12[0].path;
    const provPath = req.files.prov[0].path;
    const outputIpa = `uploads/signed_${Date.now()}.ipa`;

    // أمر تشغيل أداة zsign لتوقيع التطبيق
    const command = `zsign -k ${p12Path} -p "${password}" -m ${provPath} -o ${outputIpa} ${ipaPath}`;

    exec(command, (error, stdout, stderr) => {
        // حذف الملفات الأصلية بعد انتهاء العملية (لتوفير المساحة)
        fs.unlinkSync(ipaPath);
        fs.unlinkSync(p12Path);
        fs.unlinkSync(provPath);

        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'فشل التوقيع، تأكد من صحة الشهادة والباسورد.' });
        }

        // هنا السيرفر نجح في التوقيع! 
        // سيتم لاحقاً إضافة كود رفع التطبيق وإنشاء رابط التثبيت
        res.json({ success: true, message: 'تم التوقيع بنجاح!' });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
