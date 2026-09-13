import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

export default function Privacy() {
    return (
        <>
            <Header />
            <main className="gh-doc">
                <div className="gh-doc-header">
                    <p className="gh-eyebrow">Legal</p>
                    <h1>Privacy Policy</h1>
                    <p>Effective Date: 2025.03.12</p>
                </div>

                <section>
                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information to provide and improve our services to you. The types of personal information we may collect include:
                    </p>
                    <ul>
                        <li><strong>Personal Identification Information:</strong> When you sign up for an account, we may ask for your name, email address, username, and password.</li>
                        <li><strong>Usage Data:</strong> We collect data about your usage of our platform, including but not limited to IP address, browser type, device type, and usage statistics.</li>
                        <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to improve your experience on our site. This data helps us understand how our site is used and allows us to personalize your experience.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect in the following ways:
                    </p>
                    <ul>
                        <li>To create and manage your account and provide services to you.</li>
                        <li>To communicate with you about your account, including sending you updates and promotional offers.</li>
                        <li>To respond to your inquiries and provide customer support.</li>
                        <li>To improve the functionality, content, and user experience of our platform.</li>
                        <li>To monitor and analyze trends, usage, and activities on our platform to enhance our service offerings.</li>
                        <li>To protect our platform from fraud and misuse.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Sharing Your Information</h2>
                    <p>
                        We do not sell, trade, or rent your personal information to third parties. However, we may share your data in the following situations:
                    </p>
                    <ul>
                        <li><strong>Service Providers:</strong> We may share information with third-party service providers who help us operate the platform and perform services on our behalf, such as hosting, analytics, and email marketing.</li>
                        <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your personal information may be transferred as part of the transaction.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Retention</h2>
                    <p>
                        We will retain your personal information for as long as your account is active or as needed to provide you with services. If you wish to cancel your account or request that we no longer use your information to provide you services, you may contact us at <strong>[insert support email]</strong>. We may also retain and use your personal information to comply with our legal obligations, resolve disputes, and enforce our agreements.
                    </p>
                </section>

                <section>
                    <h2>5. Security</h2>
                    <p>
                        We take the security of your personal information seriously. We implement industry-standard measures to protect your data from unauthorized access, alteration, or disclosure. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee the absolute security of your data.
                    </p>
                </section>

                <section>
                    <h2>6. Your Rights and Choices</h2>
                    <p>
                        You have the following rights regarding your personal data:
                    </p>
                    <ul>
                        <li><strong>Access and Update:</strong> You can access, update, or correct your personal information by logging into your account.</li>
                        <li><strong>Delete Your Account:</strong> You can request to delete your account and associated data by contacting us at <strong>helpdesk.gamehub@gmail.com</strong>.</li>
                        <li><strong>Opt-Out of Marketing Communications:</strong> If you no longer wish to receive promotional emails from us, you can unsubscribe by following the instructions in the email or contacting us directly.</li>
                    </ul>
                </section>

                <section>
                    <h2>7. Children's Privacy</h2>
                    <p>
                        Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe that we have collected personal information from a child under 13, please contact us, and we will take steps to remove such information.
                    </p>
                </section>

                <section>
                    <h2>8. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal obligations. We will notify you of any significant changes by posting the new Privacy Policy on our platform with an updated effective date. We encourage you to review this policy periodically to stay informed about how we are protecting your information.
                    </p>
                </section>

                <section>
                    <h2>9. Contact Us</h2>
                    <p>
                        If you have any questions or concerns about this Privacy Policy or how we handle your personal information, please contact us at:
                    </p>
                    <p><strong>Email: </strong>helpdesk.gamehub@gmail.com</p>
                </section>
            </main>
            <Footer />
        </>
    );
};

