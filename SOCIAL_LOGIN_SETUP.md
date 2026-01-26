# How to Enable Social Login (Google & Facebook) - Supabase Free Tier

## ✅ Social Login is FREE on Supabase!

Both Google and Facebook authentication are available on the free tier.

---

## 🔵 **Google Sign-In Setup**

### Step 1: Configure in Supabase

1. **Go to Supabase Dashboard**
2. Click **Authentication** → **Providers**
3. Find **Google** and click to enable
4. You'll need:
   - Google Client ID
   - Google Client Secret

### Step 2: Create Google OAuth App

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Authorized JavaScript origins**: 
     - `https://<your-project-ref>.supabase.co`
     - `http://localhost:5173` (for development)
   - **Authorized redirect URIs**:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**
8. Paste into Supabase Google provider settings
9. Click **Save**

---

## 🔷 **Facebook Sign-In Setup**

### Step 1: Configure in Supabase

1. **Go to Supabase Dashboard**
2. Click **Authentication** → **Providers**
3. Find **Facebook** and click to enable

### Step 2: Create Facebook App

1. Go to: https://developers.facebook.com/
2. Create a new app → **Consumer** type
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Copy **App ID** and **App Secret**
6. In **Facebook Login** → **Settings**:
   - **Valid OAuth Redirect URIs**:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
7. Paste App ID and Secret into Supabase
8. Click **Save**

---

## 💻 **Frontend Implementation**

Update your `AuthModal.tsx` to include social login buttons:

```tsx
import { supabase } from '../lib/supabase';

// Add to your AuthModal component

const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  if (error) console.error('Error:', error);
};

const handleFacebookSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  if (error) console.error('Error:', error);
};

// In your JSX (add before the email/password form):

{/* Social Login Buttons */}
<div className="space-y-3 mb-6">
  <button
    onClick={handleGoogleSignIn}
    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gold/40 px-4 py-3 rounded-xl transition-all"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      {/* Google Icon SVG */}
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span className="text-sm font-medium text-charcoal">Continue with Google</span>
  </button>

  <button
    onClick={handleFacebookSignIn}
    className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] px-4 py-3 rounded-xl transition-all"
  >
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    <span className="text-sm font-medium text-white">Continue with Facebook</span>
  </button>
</div>

<div className="relative mb-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gold/20"></div>
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-cream px-2 text-charcoal/40">Or continue with email</span>
  </div>
</div>
```

---

## ⚡ **Quick Implementation**

I can update your AuthModal now if you want social login!

---

## 💰 **Cost Summary**

- ✅ **Google Sign-In**: FREE (unlimited on Supabase free tier)
- ✅ **Facebook Sign-In**: FREE (unlimited on Supabase free tier)
- ⚠️ **Email Confirmations**: ~4/hour free (limited)

**Recommendation**: Use social login as primary option, email as backup!
