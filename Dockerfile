# استخدام بيئة Node.js مع أدوات البناء
FROM node:18-bullseye

# تثبيت الحزم المطلوبة لأداة التوقيع
RUN apt-get update && apt-get install -y build-essential libssl-dev zip unzip git

# تحميل وتجميع أداة zsign
RUN git clone https://github.com/zhlynn/zsign.git /tmp/zsign \
    && cd /tmp/zsign \
    && g++ *.cpp common/*.cpp -lcrypto -O3 -o zsign \
    && mv zsign /usr/local/bin/ \
    && rm -rf /tmp/zsign

# إعداد مجلد العمل
WORKDIR /app

# نسخ ملفات المشروع وتثبيت المكتبات
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات
COPY . .

# فتح البورت وتشغيل السيرفر
EXPOSE 3000
CMD ["node", "server.js"]
