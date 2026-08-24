const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ইন-মেমোরি ইউজার ডাটাবেজ (টেস্টিংয়ের জন্য)
let users = {};

// ১. মোবাইল নাম্বার দিয়ে লগইন ও ৩টি ফ্রি টোকেন হুক
app.post('/api/login', (req, res) => {
    const { phone, country } = req.body;
    if (!phone || phone.length < 5) {
        return res.status(400).json({ success: false, message: 'সঠিক মোবাইল নাম্বার দিন!' });
    }

    if (!users[phone]) {
        users[phone] = {
            phone: phone,
            country: country,
            tokens: 3, // প্রথমবার ৩টি ফ্রি টোকেন হুক
            vip: false
        };
    }

    res.json({ success: true, user: users[phone] });
});

// ২. অ্যাড দেখে টোকেন বাড়ানোর রাউট (+1 Token)
app.post('/api/add-token', (req, res) => {
    const { phone } = req.body;
    if (users[phone]) {
        users[phone].tokens += 1; 
        res.json({ success: true, tokens: users[phone].tokens, message: 'অভিনন্দন! আপনি অ্যাড দেখে ১টি ফ্রি টোকেন পেয়েছেন।' });
    } else {
        res.status(404).json({ success: false, message: 'ইউজার পাওয়া যায়নি!' });
    }
});

// ৩. নিজস্ব স্মার্ট লোকাল রাউটার ইঞ্জিন (কোনো এপিআই ছাড়া কন্টাক্ট স্ক্যানিং ও ম্যাচিং)
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
            message: 'কাছাকাছি কোনো লোকাল ইউজার নেই। গ্লোবাল কলের জন্য টোকেন ব্যবহার করুন।' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Smart Router Server is running on port ${PORT}`);
});
