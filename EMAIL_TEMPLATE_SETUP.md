# 📧 How to Apply the Custom Email Template

## Step-by-Step Guide

### 1. Open the Email Template File
Located at: `email-templates/confirm-signup.html`

### 2. Copy the Template
- Open the file
- Select ALL content (Ctrl+A)
- Copy (Ctrl+C)

### 3. Go to Supabase Dashboard
1. Visit: https://supabase.com
2. Open your Golden Tower Spa project
3. Click **Authentication** in left sidebar
4. Click **Email Templates**

### 4. Select "Confirm signup" Template
- You'll see a list of email templates
- Click on **"Confirm signup"**
- Delete the existing template content

### 5. Paste Your Custom Template
- Paste the content from `confirm-signup.html`
- Click **Save** at the bottom

### 6. Test It!
- Sign up with a new account
- Check your email
- You should see the beautiful Golden Tower Spa branded email!

---

## ✅ What's Included in the Template

### Design Features:
- ✨ **Golden Tower branding** with gold accents (#997B3D)
- 📱 **Responsive design** (works on mobile & desktop)
- 🎨 **Professional layout** with:
  - Header with spa logo styling
  - Welcome message
  - Prominent confirmation button
  - Footer with contact info
  - Clean, spa-like aesthetics

### Content:
- Warm welcome message
- Clear call-to-action button
- Benefits list (what users can do after confirming)
- Fallback link if button doesn't work
- Professional footer

---

## 🎨 Customization Options

### Easy Changes You Can Make:

#### Change Contact Info:
Find this section at the bottom:
```html
<p style="color: #666; font-size: 12px; margin: 5px 0;">
  📍 123 Wellness Avenue, Manila, Philippines<br>
  📞 +63 (2) 8888-XXXX | 📧 concierge@goldentowerspa.ph
</p>
```
Replace with your actual address and phone number.

#### Change Colors:
- Gold: `#997B3D`
- Background: `#F9F7F2`
- Text: `#2C2C2C` or `#666`

#### Add Logo Image:
Replace the text logo with an image:
```html
<img src="YOUR_LOGO_URL" alt="Golden Tower Spa" style="max-width: 200px;">
```

---

## 📝 Important Notes

### Supabase Template Variables:
These MUST stay in the template:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your website URL

### Testing:
After saving:
1. Create a test account
2. Check the email
3. If it looks wrong, you can edit again

### Email Clients:
The template is designed to work in:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail
- Mobile email apps

---

## 🚀 Next: Booking Confirmation Email

I also created: `email-templates/booking-confirmation.html`

This is for when users complete a booking. To use it:
- You'll need to set up a Supabase Edge Function
- Or use a webhook after booking creation
- See `FAQ_ANSWERS.md` for more details

---

**Your email template is ready to go!** 🎉
