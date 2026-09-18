import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-cream">
            {/* Header */}
            <div className="bg-charcoal text-white py-16 md:py-24">
                <div className="container mx-auto px-6 md:px-12">
                    <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm uppercase tracking-widest font-bold mb-6 transition-colors">
                        <ArrowLeft size={16} aria-hidden="true" /> Back to Home
                    </Link>
                    <h1 className="font-serif text-3xl md:text-5xl">Privacy Policy</h1>
                    <p className="text-white/50 text-sm mt-3">Last updated: February 17, 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 md:px-12 py-12 md:py-16 max-w-4xl">
                <div className="legal-content">
                    <p>
                        Golden Tower Spa & Wellness ("we," "our," or "us") is committed to protecting the privacy of our customers and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at goldentowerspa.com, use our booking services, or interact with us in any way.
                    </p>

                    <h2>1. Information We Collect</h2>

                    <h3>1.1 Personal Information You Provide</h3>
                    <p>When you interact with our services, we may collect the following information:</p>
                    <ul>
                        <li><strong>Account Registration:</strong> Full name, email address, and password when you create an account. You may also sign in using Google OAuth, in which case Google shares your name, email address, and profile picture with us.</li>
                        <li><strong>Booking Information:</strong> Your name, phone number, preferred treatment, date, time, and therapist preference when you make a booking — whether as a registered user or a guest.</li>
                        <li><strong>Contact Information:</strong> Email address and any details you provide when contacting us directly.</li>
                    </ul>

                    <h3>1.2 Information Collected Automatically</h3>
                    <p>When you visit our website, certain information is collected automatically:</p>
                    <ul>
                        <li><strong>Visitor Identifier:</strong> We generate a unique, anonymous identifier (stored locally on your device as <code>gt_visitor_id</code>) to track your bookings across sessions without requiring an account. This identifier is not linked to your personal identity unless you later create an account.</li>
                        <li><strong>Usage Data:</strong> We collect analytics data including pages visited, time spent on pages, browser type, device type, screen resolution, and referral sources. This data helps us improve your experience.</li>
                        <li><strong>Local Storage:</strong> We use your browser's local storage to maintain your session preferences, authentication state, and the visitor identifier mentioned above.</li>
                    </ul>

                    <h3>1.3 Third-Party Services</h3>
                    <p>Our website integrates with the following third-party services that may collect data:</p>
                    <ul>
                        <li><strong>Supabase:</strong> Our backend infrastructure provider that stores account data, booking records, and authentication information. Supabase processes data in accordance with their <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</li>
                        <li><strong>Google Maps:</strong> Our location page embeds a Google Maps iframe. Google may collect data about your interaction with the map in accordance with <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
                        <li><strong>Google Sign-In:</strong> If you choose to sign in with Google, we receive your name, email, and profile photo from Google. We do not access any other Google account data.</li>
                        <li><strong>Vercel:</strong> Our website hosting provider that may collect anonymized performance and analytics data.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect for the following purposes:</p>
                    <ul>
                        <li><strong>Service Delivery:</strong> To process and manage your bookings, assign therapists, and confirm appointments.</li>
                        <li><strong>Account Management:</strong> To create and maintain your user account, if applicable.</li>
                        <li><strong>Communication:</strong> To send booking confirmations, reminders, and respond to your inquiries.</li>
                        <li><strong>Website Improvement:</strong> To analyze usage patterns and improve our website's functionality and user experience.</li>
                        <li><strong>Guest Booking Claiming:</strong> When you create an account after making guest bookings, we use the visitor identifier to link your previous bookings to your new account.</li>
                    </ul>

                    <h2>3. Data Sharing and Disclosure</h2>
                    <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                    <ul>
                        <li><strong>Service Providers:</strong> With Supabase (database and authentication), Vercel (hosting), and Google (Maps and OAuth) as necessary to operate our services.</li>
                        <li><strong>Therapists:</strong> Your booking details (name, treatment, date/time) are shared with our therapists to prepare for and deliver your treatment.</li>
                        <li><strong>Legal Compliance:</strong> When required by law, regulation, or legal process.</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information. Authentication is handled through Supabase's secure infrastructure with encrypted password storage. All data transmission between your browser and our servers uses HTTPS encryption. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>

                    <h2>5. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Booking records are retained for business record-keeping purposes. You may request deletion of your account and associated data at any time by contacting us.
                    </p>

                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access and request a copy of your personal data</li>
                        <li>Correct inaccurate personal information</li>
                        <li>Request deletion of your personal data</li>
                        <li>Withdraw consent for data processing</li>
                        <li>Object to processing of your personal data</li>
                    </ul>
                    <p>
                        To exercise any of these rights, please contact us at <a href="mailto:gtowerspa@gmail.com">gtowerspa@gmail.com</a>.
                    </p>

                    <h2>7. Children's Privacy</h2>
                    <p>
                        Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.
                    </p>

                    <h2>8. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this page periodically for the latest information on our privacy practices.
                    </p>

                    <h2>9. Contact Us</h2>
                    <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
                    <ul>
                        <li><strong>Email:</strong> <a href="mailto:gtowerspa@gmail.com">gtowerspa@gmail.com</a></li>
                        <li><strong>Phone:</strong> 0922 826 2336</li>
                        <li><strong>Address:</strong> #1 C2 Road 9, Project 6, Quezon City, Philippines</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
