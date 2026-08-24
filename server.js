const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// সার্ভ করা হচ্ছে পাবলিক ফোল্ডারটি
app.use(express.static(path.join(__dirname, 'public')));

// কান্ট্রি-ওয়াইজ ভিআইপি প্রাইসিং লজিক (ওমান ১ রিয়াল এবং অন্যান্য দেশের জন্য মানানসই রেট)
const vipPricingPlans = {
  OM: { country: "Oman", currency: "OMR", price: 1.00, name: "VIP Monthly - Oman" },
  AE: { country: "UAE", currency: "AED", price: 10.00, name: "VIP Monthly - UAE" },
  SA: { country: "Saudi Arabia", currency: "SAR", price: 10.00, name: "VIP Monthly - KSA" },
  QA: { country: "Qatar", currency: "QAR", price: 10.00, name: "VIP Monthly - Qatar" },
  BD: { country: "Bangladesh", currency: "BDT", price: 150.00, name: "VIP Monthly - BD" },
  PK: { country: "Pakistan", currency: "PKR", price: 300.00, name: "VIP Monthly - PK" },
  DEFAULT: { country: "International", currency: "USD", price: 3.00, name: "VIP Monthly - Global" }
};

// ইউজার রেজিস্ট্রেশন এন্ডপয়েন্ট
app.post('/api/register', (req, res) => {
    const { name, dob, country, phone } = req.body;
    if (!name || !phone) {
        return res.json({ success: false, message: "Name and phone are required!" });
    }
    // নতুন ইউজারের জন্য ইনিশিয়াল ৩টি টোকেন বরাদ্দ
    const user = {
        name,
        dob,
        country,
        phone,
        tokens: 3
    };
    res.json({ success: true, user });
});

// টোকেন বাড়ানোর এন্ডপয়েন্ট (অ্যাড দেখে টোকেন অর্জনের জন্য)
app.post('/api/add-token', (req, res) => {
    res.json({ success: true, tokens: 4, message: "🎉 সফলভাবে ১টি ফ্রি টোকেন যোগ করা হয়েছে!" });
});

// API: কান্ট্রি অনুযায়ী ভিআইপি প্রাইস রিট্রিভ করার জন্য
app.get('/api/vip-pricing/:countryCode', (req, res) => {
    const code = req.params.countryCode ? req.params.countryCode.toUpperCase() : "OM";
    const plan = vipPricingPlans[code] || vipPricingPlans["DEFAULT"];
    res.json({ success: true, plan });
});

// স্টার্ট সার্ভার
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
