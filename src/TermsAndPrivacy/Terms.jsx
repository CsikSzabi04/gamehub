import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

export default function Terms() {
    return (
        <>
            <Header />
            <div className="container mx-auto p-8 text-white bg-gray-900">
                <header className="mb-8">
                    <h1 className="text-5xl font-bold text-center">Terms Of Service</h1>
                    <p className="text-center text-gray-400 mt-2">Effective Date: 2025.03.12</p>
                </header>
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, do not access or use the Service.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">2. User Accounts</h2>
                    <p>
                        To access certain features of the Service, you may need to create an account with **Game Data Hub**. You are responsible for maintaining the confidentiality of your account information, including your username and password, and for all activities that occur under your account.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">3. Use of Service</h2>
                    <p>
                        You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not:
                    </p>
                    <ul className="list-disc ml-8">
                        <li>Violate any applicable local, state, national, or international law or regulation.</li>
                        <li>Use the Service to harm, harass, or infringe upon the rights of others.</li>
                        <li>Attempt to gain unauthorized access to the Service, servers, or databases.</li>
                        <li>Distribute viruses or other harmful software.</li>
                    </ul>
                    <p>
                        **Game Data Hub** is not responsible for any content or interactions on third-party websites that may be linked within the Service, including but not limited to online stores such as Steam, GetGamez, Playfield, and others.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">4. Content and Intellectual Property</h2>
                    <p>
                        All content available through the Service, including but not limited to text, graphics, logos, images, and software, is owned by **Game Data Hub** or its content suppliers and is protected by intellectual property laws. You may not use, modify, or distribute any content from the Service without express written consent from **Game Data Hub**.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">5. Firebase and Third-Party Services</h2>
                    <p>
                        Our Service utilizes Firebase for authentication and Firestore for user data storage. By using our Service, you acknowledge and consent to Firebase’s terms of service and privacy policy, which are separate from ours.
                    </p>
                    <p>
                        We also integrate third-party APIs, such as the "Game Hub Backend" API for fetching game data. **Game Data Hub** is not responsible for the content or services provided by third-party platforms.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">6. Stores and Links</h2>
                    <p>
                        The Service may provide links to external websites and stores (e.g., Steam, GetGamez, Imperial Games) for convenience and reference. These third-party websites are not under the control of **Game Data Hub**, and we are not responsible for the content, policies, or practices of these websites.
                    </p>
                    <p>
                        When you click on a link to a third-party site, you do so at your own risk, and you are subject to the terms and conditions of those third-party websites.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">7. Privacy</h2>
                    <p>
                        Your privacy is important to us. Our Privacy Policy describes how we collect, use, and protect your personal information when you use the Service. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">8. Term and Termination</h2>
                    <p>
                        These Terms will remain in effect until terminated by either you or **Game Data Hub**. You may terminate your account at any time by notifying us. We may suspend or terminate your account if you violate these Terms or for any other reason at our sole discretion.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">9. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided "as is" and "as available" without any warranties, express or implied, including but not limited to implied warranties of merchantability or fitness for a particular purpose.
                    </p>
                    <p>
                        We do not guarantee that the Service will be uninterrupted or error-free. We are not responsible for any damages arising from your use of the Service or from your inability to use the Service.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">10. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, **Game Data Hub** shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service, including but not limited to data loss, loss of profits, or damages to your device.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">11. Indemnification</h2>
                    <p>
                        You agree to indemnify, defend, and hold harmless **Game Data Hub**, its affiliates, officers, employees, and agents from any claims, losses, liabilities, damages, and expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">12. Governing Law</h2>
                    <p>
                        These Terms are governed by and construed in accordance with the laws of the jurisdiction in which **Game Data Hub** operates, without regard to its conflict of law principles. Any dispute arising under these Terms shall be resolved exclusively in the courts located in that jurisdiction.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">13. Changes to Terms</h2>
                    <p>
                        **Game Data Hub** reserves the right to update or modify these Terms at any time. We will post the updated version on our website with a new "Effective Date." Your continued use of the Service after such changes constitutes your acceptance of the updated Terms.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold">14. Contact Information</h2>
                    <p>
                        If you have any questions or concerns about these Terms, please contact us at:
                    </p>
                    <p>
                        **Game Data Hub Support** <br />
                        Email: <a href="mailto:helpdesk.gamehub@gmail.com" className="text-blue-400">helpdesk.gamehub@gmail.com</a> <br />
                        Website: <a href="https://gamedatahub.netlify.app/" className="text-blue-400">www.gamedatahub.com</a>
                    </p>
                </section>
            </div>
            <Footer />
        </>
    );
};

