import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
                    <h1 className="font-serif text-3xl md:text-5xl">Terms of Service</h1>
                    <p className="text-white/50 text-sm mt-3">Last updated: February 17, 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 md:px-12 py-12 md:py-16 max-w-4xl">
                <div className="legal-content">
                    <p>
                        Welcome to Golden Tower Spa & Wellness. By accessing our website at goldentowerspa.com and using our services, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully before making a booking or creating an account.
                    </p>

                    <h2>1. Services Overview</h2>
                    <p>
                        Golden Tower Spa provides wellness and massage services at our physical location in Quezon City, Philippines, as well as home service massage options within our service area. Our website allows you to browse our treatments, learn about our therapists, and submit booking requests.
                    </p>

                    <h2>2. Booking Policy</h2>

                    <h3>2.1 Booking Requests</h3>
                    <p>
                        Submitting a booking through our website constitutes a <strong>booking request</strong>, not a confirmed appointment. All bookings are subject to availability and confirmation by our team. We will contact you via the phone number or email provided to confirm your appointment.
                    </p>

                    <h3>2.2 Guest Bookings</h3>
                    <p>
                        You may submit a booking request without creating an account. Guest bookings are tracked using a unique device identifier stored on your browser. If you later create an account, your previous guest bookings will be linked to your account automatically.
                    </p>

                    <h3>2.3 Cancellation & Rescheduling</h3>
                    <p>
                        We appreciate advance notice if you need to cancel or reschedule your appointment. Please contact us at least <strong>3 hours before</strong> your scheduled appointment time. Repeated no-shows without prior notice may result in a requirement to deposit a booking fee for future appointments.
                    </p>

                    <h3>2.4 Pricing</h3>
                    <p>
                        All prices displayed on our website are in Philippine Pesos (PHP) and are subject to change without prior notice. The price at the time of your confirmed booking will be honored. Package prices represent bundled value and cannot be split across multiple visits unless otherwise stated.
                    </p>

                    <h2>3. Spa Etiquette & Guidelines</h2>
                    <ul>
                        <li><strong>Arrival:</strong> Please arrive 10–15 minutes before your scheduled appointment to allow time for check-in and preparation.</li>
                        <li><strong>Health Conditions:</strong> Please inform our staff of any medical conditions, allergies, injuries, or pregnancies before your treatment. Your safety and comfort are our top priorities.</li>
                        <li><strong>Age Requirement:</strong> Clients must be at least 18 years of age to receive treatments. Minors may be accommodated with a parent or guardian's written consent and presence.</li>
                        <li><strong>Personal Belongings:</strong> Golden Tower Spa is not responsible for lost or stolen personal items. We recommend leaving valuables at home.</li>
                        <li><strong>Conduct:</strong> We reserve the right to refuse or terminate service to any client whose behavior is deemed inappropriate, disrespectful, or harmful to our staff or other clients.</li>
                    </ul>

                    <h2>4. Home Service Terms</h2>
                    <p>
                        Our home service massage is available within our service area in Quezon City and surrounding areas during our operating hours (4:00 PM – 4:00 AM daily). Additional terms for home service include:
                    </p>
                    <ul>
                        <li>A suitable, clean, and safe space must be provided for the treatment.</li>
                        <li>Home service prices may differ from in-spa prices and may include a transportation fee.</li>
                        <li>Cancellation of a home service appointment after the therapist has departed incurs a minimum transportation fee.</li>
                        <li>We reserve the right to decline home service requests to locations deemed unsafe for our therapists.</li>
                    </ul>

                    <h2>5. User Accounts</h2>

                    <h3>5.1 Account Creation</h3>
                    <p>
                        You may create an account using your email address or through Google Sign-In. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                    </p>

                    <h3>5.2 Account Accuracy</h3>
                    <p>
                        You agree to provide accurate, current, and complete information during registration and to update such information as needed. We reserve the right to suspend or terminate accounts that contain false or misleading information.
                    </p>

                    <h3>5.3 Account Termination</h3>
                    <p>
                        You may request deletion of your account at any time by contacting us at <a href="mailto:gtowerspa@gmail.com">gtowerspa@gmail.com</a>. We reserve the right to terminate or suspend accounts for violations of these Terms.
                    </p>

                    <h2>6. Intellectual Property</h2>
                    <p>
                        All content on our website — including text, graphics, logos, images, designs, and software — is the property of Golden Tower Spa & Wellness and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without our prior written consent.
                    </p>

                    <h2>7. Limitation of Liability</h2>
                    <p>
                        Golden Tower Spa provides its website and booking platform on an "as is" and "as available" basis. We do not guarantee uninterrupted or error-free operation of our website. To the maximum extent permitted by law:
                    </p>
                    <ul>
                        <li>We are not liable for any indirect, incidental, or consequential damages arising from your use of our website or services.</li>
                        <li>Our total liability for any claim related to our services shall not exceed the amount paid by you for the specific treatment in question.</li>
                        <li>We are not liable for any adverse reactions to treatments where you failed to disclose relevant health information.</li>
                    </ul>

                    <h2>8. Disclaimer</h2>
                    <p>
                        Our massage and wellness services are intended for relaxation and general well-being. They are not a substitute for professional medical treatment, diagnosis, or advice. If you have a medical condition, consult your healthcare provider before booking a treatment.
                    </p>

                    <h2>9. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising under these Terms shall be resolved in the courts of Quezon City, Philippines.
                    </p>

                    <h2>10. Changes to These Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our website and services after any such changes constitutes your acceptance of the revised Terms.
                    </p>

                    <h2>11. Contact Us</h2>
                    <p>If you have questions about these Terms, please reach out:</p>
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

export default TermsOfService;
