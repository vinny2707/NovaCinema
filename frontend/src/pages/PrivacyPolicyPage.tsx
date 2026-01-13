// src/pages/PrivacyPolicyPage.tsx
import { Shield, Lock, Eye, UserCheck, Mail, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#0A0E27] py-16">
            <div className="container mx-auto max-w-7xl px-4">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-400/10 p-4 rounded-full">
                            <Shield className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>
                    <h1
                        className="text-5xl md:text-6xl font-bold text-white uppercase tracking-wide mb-4"
                        style={{ fontFamily: 'Anton, sans-serif' }}
                    >
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                        NovaCinema is committed to protecting your privacy and personal information.
                        This policy explains how we collect, use, and protect your data.
                    </p>
                    <p className="text-gray-500 text-sm mt-4">
                        Last Updated: January 09, 2026
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8 max-w-5xl mx-auto">
                    {/* Introduction */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-blue-400/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-400/10 p-3 rounded-lg flex-shrink-0">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                                <p className="text-gray-300 leading-relaxed mb-3">
                                    Welcome to NovaCinema. We respect your privacy and are committed to
                                    protecting the personal information you share with us.
                                </p>
                                <p className="text-gray-300 leading-relaxed">
                                    This privacy policy describes how we collect, use, store, and protect
                                    your information when you use our online movie ticket booking service.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Information Collection */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-400/10 p-3 rounded-lg flex-shrink-0">
                                <Eye className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    We collect the following types of information to provide you with the best service:
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>Full name</li>
                                            <li>Email address</li>
                                            <li>Phone number</li>
                                            <li>Date of birth (optional)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-2">Booking Information</h3>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>Booking history and transactions</li>
                                            <li>Movies watched and preferences</li>
                                            <li>Payment methods (encrypted)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-2">Technical Data</h3>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>IP address and device information</li>
                                            <li>Cookies and similar tracking technologies</li>
                                            <li>Website usage data (pages viewed, access times)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Usage */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="bg-yellow-400/10 p-3 rounded-lg flex-shrink-0">
                                <UserCheck className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Your information is used for the following purposes:
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-white font-semibold mb-2">✓ Service Delivery</h3>
                                        <p className="text-gray-400 text-sm">
                                            Process bookings, send confirmations and notifications about showtimes
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-white font-semibold mb-2">✓ Experience Enhancement</h3>
                                        <p className="text-gray-400 text-sm">
                                            Personalize content and recommend movies based on your preferences
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-white font-semibold mb-2">✓ Customer Support</h3>
                                        <p className="text-gray-400 text-sm">
                                            Answer inquiries and resolve technical issues
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg">
                                        <h3 className="text-white font-semibold mb-2">✓ Marketing</h3>
                                        <p className="text-gray-400 text-sm">
                                            Send promotional information and news (with your consent)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Security */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-green-400/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-400/10 p-3 rounded-lg flex-shrink-0">
                                <Lock className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    We implement advanced security measures to protect your information:
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-300">
                                            <span className="text-white font-semibold">SSL/TLS Encryption:</span> All data
                                            transmission is encrypted to protect against unauthorized access
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-300">
                                            <span className="text-white font-semibold">Payment Security:</span> Payment
                                            information is processed through secure payment gateways, compliant with PCI DSS standards
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-300">
                                            <span className="text-white font-semibold">Access Control:</span> Only authorized
                                            personnel have access to personal data
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-gray-300">
                                            <span className="text-white font-semibold">Regular Backups:</span> Data is
                                            regularly backed up to ensure security and recovery capability
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Rights */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-pink-400/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="bg-pink-400/10 p-3 rounded-lg flex-shrink-0">
                                <UserCheck className="w-6 h-6 text-pink-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    You have the following rights regarding your personal information:
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-800/30 p-4 rounded-lg border-l-4 border-pink-400">
                                        <h3 className="text-white font-semibold mb-2">Right to Access</h3>
                                        <p className="text-gray-400 text-sm">
                                            Request to view the personal information we store about you
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg border-l-4 border-pink-400">
                                        <h3 className="text-white font-semibold mb-2">Right to Rectification</h3>
                                        <p className="text-gray-400 text-sm">
                                            Update or correct inaccurate personal information
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg border-l-4 border-pink-400">
                                        <h3 className="text-white font-semibold mb-2">Right to Erasure</h3>
                                        <p className="text-gray-400 text-sm">
                                            Request deletion of personal information in certain circumstances
                                        </p>
                                    </div>

                                    <div className="bg-gray-800/30 p-4 rounded-lg border-l-4 border-pink-400">
                                        <h3 className="text-white font-semibold mb-2">Right to Object</h3>
                                        <p className="text-gray-400 text-sm">
                                            Opt-out of marketing emails or data sharing with third parties
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-gray-300 text-sm">
                                        <span className="text-blue-400 font-semibold">Note:</span> To exercise these rights,
                                        please contact us via email or our customer support page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-blue-400/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-400/10 p-3 rounded-lg flex-shrink-0">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    If you have any questions about this privacy policy or wish to exercise your rights,
                                    please contact us:
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-yellow-400" />
                                        <a href="mailto:khacvuong2707@gmail.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                            khacvuong2707@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-yellow-400" />
                                        <a href="mailto:sangdinhban@gmail.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                            sangdinhban@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-yellow-400" />
                                        <a href="mailto:quocvy23072005@gmail.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                            quocvy23072005@gmail.com
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-yellow-400" />
                                        <a href="mailto:nguyenthanhphuong221105@gmail.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                            nguyenthanhphuong221105@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400/10 to-blue-400/10 rounded-lg border border-yellow-400/20">
                                    <p className="text-gray-300 text-sm">
                                        We are committed to responding to all requests within <span className="text-white font-semibold">48 business hours</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-16 text-center bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl p-8 border border-blue-400/20 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Our Commitment
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                        NovaCinema is committed to protecting your privacy and complying with data protection regulations.
                        We will never sell or share your personal information with third parties for commercial purposes
                        without your consent.
                    </p>
                </div>
            </div>
        </div>
    );
}
