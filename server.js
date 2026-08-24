const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ইন-মেমোরি ইউজার ডাটাবেজ
let users = {};

// ১. রেজিস্ট্রেশন ও লগইন (নাম, জন্মতারিখ, কান্ট্রি ও ৩টি ফ্রি টোকেন)
app.post('/api/register', (req, res) => {
    const { name, phone, dob, country } = req.body;
    
    if (!phone || phone.length < 5) {
        return res.status(400).json({ success: false, message: 'সঠিক মোবাইল নাম্বার দিন!' });
    }

    if (!users[phone]) {
        users[phone] = {
            name: name || 'User',
            phone: phone,
            dob: dob || '',
            country: country || 'om',
            tokens: 3, // সাইনআপে ৩টি ফ্রি টোকেন হুক
            vip: false
        };
    }

    res.json({ success: true, user: users[phone] });
});

// ২. অ্যাড দেখে টোকেন বাড়ানো (+1 Token)
app.post('/api/add-token', (req, res) => {
    const { phone } = req.body;
    if (users[phone]) {
        users[phone].tokens += 1; 
        res.json({ success: true, tokens: users[phone].tokens, message: 'অভিনন্দন! আপনি সফলভাবে ১টি ফ্রি টোকেন পেয়েছেন।' });
    } else {
        res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি!' });
    }
});

// ৩. স্মার্ট লোকাল রাউটার ইঞ্জিন (ফ্রি কলিং ম্যাচিং)
app.post('/api/smart-router', (req, res) => {
    const { phone, country } = req.body;
    let availablePeers = Object.values(users).filter(u => u.phone !== phone && u.country === country);

    if (availablePeers.length > 0) {
        res.json({ 
            success: true, 
            matched: true, 
            message: 'আপনার এলাকার আশেপাশে ফ্রি ইউজার পাওয়া গেছে! কানেক্ট করা হচ্ছে।',
            peer: availablePeers[0].phone 
        });
    } else {
        res.json({ 
            success: false, 
            matched: false, 
            message: 'কাছাকাছি কোনো লোকাল ইউজার নেই। গ্লোবাল কলের জন্য টোকেন ব্যবহার করুন বা লোকাল নাম্বারে কল করুন।' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ConnectSphere Server is running on port ${PORT}`);
});
